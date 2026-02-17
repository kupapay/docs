---
title: "ADR-0001: Two-Phase Commit for USB Fiscal Device Protocol"
status: "Accepted"
date: "2025-07-14"
authors: "KutaPay Architecture Team"
tags: ["architecture", "protocol", "hardware", "fiscal-compliance", "reliability"]
supersedes: ""
superseded_by: ""
---

# ADR-0001: Two-Phase Commit for USB Fiscal Device Protocol

## Status

**Accepted**

## Context

KutaPay's USB Fiscal Memory device is the sole trusted authority that signs, numbers, timestamps, and immutably stores invoices for DRC tax compliance. The POS application (running on a phone, tablet, or PC) is explicitly **untrusted** — only the device can produce a legally valid fiscal invoice.

The communication between the POS (host) and the USB device occurs over USB CDC (virtual serial port). A critical design challenge arises: **how to prevent "half-issued" invoices** — situations where either:

- The POS prints a receipt but the device never recorded/signed it (producing a non-fiscal receipt that looks official), or
- The device records and signs an invoice but the POS never received the response and never printed a receipt (creating a phantom fiscal record with no customer-facing receipt).

These are not theoretical concerns. The operating environment in the DRC includes:

- **Frequent power outages** — power can drop at any moment during a transaction
- **Unstable USB connections** — cable disconnects, device removal during operation
- **Untrusted host software** — the POS could be compromised, buggy, or deliberately misbehaving (replaying old payloads, faking commits)
- **Regulatory mandate** — every fiscal invoice number must correspond to a complete, signed, stored record; gaps or orphaned records trigger audit flags

The protocol must guarantee atomicity: a fiscal invoice either **fully exists** (signed, stored in device journal, and acknowledged to POS) or **does not exist at all**.

Additionally, the device serves multiple POS terminals in retail/restaurant deployments (one USB device per outlet, not per cashier), which introduces concurrency concerns and requires defense against replay attacks from any connected host.

## Decision

We adopt a **two-phase commit (2PC) protocol** for all fiscal operations (sales, voids, refunds) between the POS host and the USB Fiscal Memory device.

### Phase 1: PREPARE

1. The POS constructs a **canonical invoice payload** (deterministic JSON with fixed field order, normalized decimals, currency, and VAT rates).
2. The POS sends the payload to the USB device via a `PREPARE` command.
3. The device validates:
   - Schema correctness (all required fields present, valid types)
   - Policy compliance (device not revoked, storage not full, clock not rolled back)
   - No duplicate payload (replay detection via payload hash + counter)
4. If validation passes, the device returns `"ok to commit"` plus a **short-lived challenge nonce**.
5. The device does **not** yet increment counters, append to journal, or sign anything. No fiscal state changes occur.

### Phase 2: COMMIT

1. The POS sends a `COMMIT` command including the nonce from Phase 1.
2. The device verifies the nonce matches and hasn't expired.
3. The device atomically:
   - Increments the monotonic invoice counter
   - Appends the journal record (with hash chain to previous entry)
   - Signs the invoice data using the Secure Element's private key
   - Stores the complete record in tamper-proof flash
4. The device returns the fiscal response: `invoice_seq`, `auth_code`, `device_id`, `timestamp`.
5. Only after receiving this confirmation does the POS:
   - Mark the transaction as completed in its local database
   - Print the receipt with all fiscal security elements (fiscal number, auth code, QR code)

### Failure Semantics

| Failure Point | Result | Recovery |
|---|---|---|
| Power dies before COMMIT sent | No fiscal invoice exists. Nonce expires. POS retries from scratch. | POS re-prepares the same sale. |
| Power dies during COMMIT processing | Device's transactional flash write either completes or rolls back. | If rolled back: no invoice. If completed: POS queries device on reconnect. |
| COMMIT succeeds but POS crashes before printing | Fiscal invoice exists in device. POS detects on restart. | POS retrieves response via `QRY\|LOG` and prints receipt. |
| Device returns error on PREPARE | No state change. POS displays error to cashier. | Cashier resolves issue (reconnect device, clear error). |
| COMMIT with invalid/expired nonce | Device rejects. No state change. | POS must re-PREPARE. |

**The invariant is: a receipt can only be issued if it has been fiscalized. No un-fiscalized receipt ever reaches a customer.**

## Consequences

### Positive

- **POS-001**: **Power-loss atomicity** — If power dies at any point before a successful COMMIT, no fiscal invoice exists. No orphaned fiscal numbers, no phantom records. This is the primary motivation.
- **POS-002**: **Anti-replay protection** — The short-lived nonce in PREPARE prevents the host from replaying old payloads or forging COMMIT commands. Each COMMIT is bound to a specific PREPARE session, defeating replay and injection attacks from compromised host software.
- **POS-003**: **Payload validation before commitment** — PREPARE gives the device an opportunity to validate the payload (schema, policy, duplicates) before any irreversible state change. Bad data is rejected cheaply, without consuming a fiscal number.
- **POS-004**: **Auditability** — Every fiscal number in the device journal corresponds to a fully validated, signed, and committed invoice. There are no gaps or partially-written records that complicate tax audits.
- **POS-005**: **Multi-terminal safety** — When multiple POS terminals share one device over a local network, the PREPARE-nonce-COMMIT sequence serializes access and prevents race conditions where two terminals might claim the same fiscal number.

### Negative

- **NEG-001**: **Increased protocol complexity** — Two round trips instead of one. The POS must handle nonce management, expiry, and retry logic. More states to track, more error paths to code and test.
- **NEG-002**: **Slightly higher latency** — Each transaction requires two USB round trips (~0.5–1ms each for USB) plus device processing time. In practice this adds <50ms total, which is negligible at checkout, but it is non-zero.
- **NEG-003**: **Nonce expiry edge cases** — If the POS is slow to send COMMIT (e.g., due to UI freeze or heavy computation), the nonce may expire and the POS must re-PREPARE. This adds an uncommon but possible failure mode that must be handled gracefully.
- **NEG-004**: **Firmware complexity** — The device firmware must manage transactional flash writes (write-ahead logging or similar) to ensure COMMIT is atomic even under power loss. This increases firmware development and testing effort.

## Alternatives Considered

### Alternative 1: Single-Phase Atomic Command

- **ALT-001**: **Description**: The POS sends the invoice payload in a single `TXN` command. The device validates, signs, stores, and responds in one step. The POS only prints after receiving the response.
- **ALT-002**: **Rejection Reason**: While simpler, this approach is vulnerable to the "partial write" problem. If power dies while the device is in the middle of incrementing counters, writing to flash, and signing, the device could be left in an inconsistent state. The device would need complex crash recovery logic to detect and fix partial writes on reboot — effectively reimplementing transactional semantics internally anyway. It also offers no nonce-based replay protection, making it weaker against host misbehavior.

### Alternative 2: Optimistic Issue with Reconciliation

- **ALT-003**: **Description**: The POS issues invoices optimistically (printing receipts immediately), and the device records them post-hoc. A reconciliation process later detects mismatches between POS-issued receipts and device records.
- **ALT-004**: **Rejection Reason**: This violates the fundamental trust model. The POS is untrusted — it must never produce a fiscal receipt without device approval. Reconciliation-based approaches allow un-fiscalized receipts to reach customers, creating a regulatory compliance gap. The DRC's "Facture Normalisée" mandate requires that every receipt carry a device-generated fiscal number and authentication code at the moment of issuance, not retroactively.

### Alternative 3: Three-Phase Commit (PREPARE → PRE-COMMIT → COMMIT)

- **ALT-005**: **Description**: Add a `PRE-COMMIT` phase where the device tentatively reserves a fiscal number and writes a provisional record, followed by a final `COMMIT` that makes it permanent.
- **ALT-006**: **Rejection Reason**: Over-engineered for this use case. The USB connection is local and low-latency (~1ms round trips), not a distributed network. The failure modes that three-phase commit addresses (network partitions between distributed nodes) do not apply to a direct USB cable connection. The added complexity of managing provisional records and potential rollbacks is not justified by any measurable reliability gain.

### Alternative 4: Host-Side Journaling with Device Signing

- **ALT-007**: **Description**: The POS maintains the authoritative invoice journal and sends completed records to the device only for signing. The device acts purely as a signing oracle without its own journal.
- **ALT-008**: **Rejection Reason**: This shifts the journal to the untrusted side of the trust boundary. A compromised POS could omit invoices from its journal, reorder them, or tamper with historical records. The entire design philosophy of KutaPay places the immutable, tamper-proof journal inside the trusted hardware. The device must be the fiscal authority, not merely a cryptographic co-processor.

## Implementation Notes

- **IMP-001**: **Nonce lifecycle** — The PREPARE nonce should have a short TTL (e.g., 5–10 seconds). This is long enough for the POS to process the response and send COMMIT, short enough to prevent replay attacks. The device must track the active nonce and reject expired or unknown nonces.
- **IMP-002**: **Power-safe flash writes** — The device firmware must use a write-ahead log or double-buffering strategy for the COMMIT phase. The journal append, counter increment, and signature storage must be atomic with respect to power loss. This is the most critical piece of firmware engineering.
- **IMP-003**: **Replay detection** — The device should maintain a hash of the last N payloads (or at minimum the last payload hash) to detect duplicate PREPARE requests. Combined with the monotonic counter, this prevents replay of old invoices.
- **IMP-004**: **Void/refund handling** — Voids and refunds follow the same PREPARE → COMMIT protocol. A void PREPARE includes the original invoice number to void; the device validates it exists and wasn't already voided. A refund is a normal PREPARE with negative amounts and a reference to the original invoice.
- **IMP-005**: **Recovery on POS restart** — After a crash, the POS should query the device's last invoice number (`QRY|STATUS`) and compare against its local database. If the device has an invoice the POS doesn't, the POS retrieves it via `QRY|LOG` and reconciles.
- **IMP-006**: **Monitoring** — Track metrics: PREPARE-to-COMMIT latency, nonce expiry rate, retry frequency, error code distribution. These help detect device health issues and POS software bugs in production.

## References

- **REF-001**: [DISCUSSION.md — Section 5: Issuance Protocol](../../DISCUSSION.md) — Original design rationale for two-phase commit, canonical payloads, and error codes
- **REF-002**: [DISCUSSION.md — Section 11: Host Misbehavior](../../DISCUSSION.md) — Nonce challenges, replay detection, and strict two-phase commit as countermeasures
- **REF-003**: [kutapay_technical_design.md](../../kutapay_technical_design.md) — Architecture overview, USB CDC protocol, and trust boundary definition
- **REF-004**: [Arrêté 032 Summary](../arrete-032-summary.md) — DRC standardized invoice requirements
- **REF-005**: [SFE Specifications v1.0 Summary](../sfe-specifications-v1-summary.md) — DGI fiscal device technical specifications
- **REF-006**: Italian Fiscal Memory design pattern — Inspiration for append-only, hash-chained, tamper-proof journal in a compact device
- **REF-007**: Trezor/Ledger hardware wallet protocols — Inspiration for USB-connected secure signing device with two-phase user confirmation
