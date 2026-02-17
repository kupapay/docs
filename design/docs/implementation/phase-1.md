# Phase 1 — B2B Pilot

The B2B pilot proves that the architecture described in `spec/architecture-kutapay-system-1.md` can deliver sealed invoices, security elements, and regulatory reports without changing existing POS workflows. This 3‑month sprint targets 10 pilot clients (service companies, wholesalers, schools) using a single-terminal POS/fiscal-service combo with manual DGI submissions while the USB Fiscal Memory device executes the canonical PREPARE → COMMIT handshake.

## Pilot targets

- **Duration:** 3 months (March through May 2026) to align with the roadmap’s Phase 1 Gantt lane.
- **Clients:** 10 pilot partners representing service businesses, wholesalers, and schools who need invoice sealing, trust-boundary enforcement, and offline resilience.
- **Scope:** Single-terminal POS + fiscal service + USB device per outlet, manual DGI upload (CSV/audit export) while the cloud queue matures, and foundational reporting (Z, X, A).

## Epics

1. **USB Firmware MVP (PREPARE / COMMIT + immutable journal + Z report)**
   - **Description:** Ship USB Fiscal Memory firmware that validates the canonical JSON payload (deterministic field order, tax groups, client classification) on PREPARE/COMMIT, atomically increments the monotonic counter, signs the record, and stores it in the hash-chained journal described in `spec/protocol-usb-fiscal-device-1.md`.
   - **Acceptance criteria:**
     - PREPARE validates schema, taxonomy, and replay status, returning a nonce while leaving counters untouched.
     - COMMIT increments the fiscal number, produces the device ID/auth code/timestamp/QR, appends to the hash chain, and surfaces those security elements back to the POS.
     - Firmware can generate a Z report that contains sequence ranges, per-tax-group totals, and journal hashes per `spec/process-fiscal-reports-1.md`.
   - **Estimated effort:** 4 weeks of firmware development plus 1 week of hardware-in-the-loop testing.
   - **Dependencies:** `spec/architecture-kutapay-system-1.md`, `spec/protocol-usb-fiscal-device-1.md`, `design/docs/hardware/usb-device.md`, `design/docs/fiscal/reports.md`.

2. **Fiscal Service Library (canonical serializer + device proxy + tax engine)**
   - **Description:** Build the untrusted fiscal service that mediates between the POS and the USB device, serializes canonical invoices, enforces the 14 DGI tax groups in `spec/schema-tax-engine-1.md`, and brokers multi-terminal access to the device.
   - **Acceptance criteria:**
     - Canonical invoices include outlet/terminal/cashier IDs, client classification, tax_groups[], totals, and payment instruments in deterministic order before issuing TXN|PREPARE.
     - Tax engine calculates TG01–TG14 amounts, applies client classification rules (individual, company, commercial individual, professional, embassy), and records rounding deltas per `spec/schema-tax-engine-1.md`.
     - Fiscal service serializes responses from QRY/TXN commands, logs nonce lifetimes, retries failed PREPAREs/COMMITs, and surfaces device health (QRY|STATUS) to the POS UI.
   - **Estimated effort:** 3 weeks for canonical service + 1 week for tax engine integration.
   - **Dependencies:** `spec/architecture-kutapay-system-1.md`, `spec/schema-tax-engine-1.md`, `spec/protocol-usb-fiscal-device-1.md`, `design/docs/architecture/trust-boundary.md`, `design/docs/pos/multi-terminal.md`.

3. **POS MVP (sale entry, receipt generation, tax-aware catalog)**
   - **Description:** Deliver a single-terminal POS workflow that lets cashiers prepare invoices, prints receipts with the device-provided security elements, and shows offline/nonce status per `.github/copilot-instructions.md` UX guidance.
   - **Acceptance criteria:**
     - Sale flow (add items, select tax groups, choose payment method) completes fiscalization in under 5 seconds and prints receipt only after COMMIT returns fiscal number, auth code, timestamp, and QR.
     - Receipt includes fiscal number, device ID, signature/auth code, trusted timestamp, QR, and references to the canonical payload (items, tax breakdown) so auditors can reconcile.
     - UI exposes offline indicators, device-disconnect recovery, and nonce exhaustion warnings, keeping cashiers informed while the device enforces the trust boundary.
   - **Estimated effort:** 3 weeks to build sale entry + 1 week to polish receipt/UX messaging.
   - **Dependencies:** `spec/architecture-kutapay-system-1.md`, `design/docs/fiscal/security-elements.md`, `docs/odoo-pos-lessons-for-kutapay.md`, `design/docs/pos/ui-ux.md`.

4. **Manual compliance tooling (CSV export + audit dump)**
   - **Description:** Provide the compliance belt that lets pilot clients deliver mandated outputs to the DGI before automated cloud uploads arrive: CSV exports for sealed invoices, Z/X/A reports, and audit dumps derived from the hash-chained journal.
   - **Acceptance criteria:**
     - Generate a DGI-ready CSV containing the canonical invoice metadata, fiscal number, auth code, totals, and per-tax-group amounts.
     - Produce Z/X/A reports plus an audit export (streamed chunk) as described in `spec/process-fiscal-reports-1.md`, with counters, journal hashes, and security elements intact.
     - Surface explicit instructions for manual upload to the DGI control module (via email or portal) and track evidence of submission in the pilot logs.
   - **Estimated effort:** 2 weeks to implement exports + 1 week for documentation/guidance.
   - **Dependencies:** `spec/process-fiscal-reports-1.md`, `spec/protocol-usb-fiscal-device-1.md`, `docs/sfe-specifications-v1-summary.md`, `design/docs/cloud/dgi-integration.md` (for future automation notes).

5. **Testing & homologation prep (pilot onboarding + risk mitigation)**
   - **Description:** Validate the pilot with 10 clients, automate regression scripts for offline resilience, and prepare evidence for homologation reviews (DGI, auditors).
   - **Acceptance criteria:**
     - Onboard at least 10 service/wholesale/school partners, run fiscalization in offline (48–72 h queue) and synchronous scenarios, and collect logs demonstrating canonical payload integrity, nonce handling, and retries.
     - Document failure modes (power loss during COMMIT, cable disconnects, nonce expiration) and verify the firmware/service recovers without incrementing counters or producing duplicates.
     - Demonstrate DGI compliance by submitting the CSV/Z/X/A/audit exports, logging reviewer feedback, and flagging open questions (e.g., unknown MCF endpoint or signature algorithm) with `???` admonitions in the compliance notebook.
   - **Estimated effort:** 4 weeks of field testing combined with 1 week for homologation paperwork.
   - **Dependencies:** `spec/infrastructure-dgi-integration-1.md`, `design/docs/cloud/offline-sync.md`, `design/docs/implementation/roadmap.md`, `memory-bank/context-map.md`.
