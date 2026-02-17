# KutaPay System Architecture Specification v1

## Context

This specification codifies the DRC-approved SFE architecture for KutaPay, combining the untrusted POS layer, the trusted USB Fiscal Memory device (DEF), and the DGI MCF/e-MCF control modules. It draws on the canonical architecture described in the technical design doc, the DGI SFE spec summary, and ADR-0001 to keep invoices compliant with the Facture Normalisée mandate.

## EARS Requirements

### Trust Boundary and Canonical Payload
- WHEN the POS or cloud sync service prepares an invoice payload, THE SYSTEM SHALL treat that host as untrusted, send only the canonical JSON (with deterministic field order and normalized VAT/totals) through the local fiscal service, and let the USB Fiscal Memory device be the sole authority that validates, signs, and stores fiscal data.
- WHEN transport across USB CDC happens, THE SYSTEM SHALL keep the DEF isolated from the DGI and expose only sealed responses back to POS/Cloud, ensuring the device never uploads directly to the tax authority and never exposes private keys or counters outside the trusted zone.

### Invoice Lifecycle
- WHEN a cashier confirms payment, THE SYSTEM SHALL require the POS to send the canonical payload containing `merchant_nif`, `client`/classification, `items[]`, `tax_groups[]`, `totals`, and `timestamp` to the DEF via PREPARE before printing.
- WHEN the DEF validates schema, counters, and policy, THE SYSTEM SHALL issue a nonce and await a COMMIT command before incrementing the monotonic fiscal counter or appending to the hash-chained journal.
- WHEN the COMMIT succeeds, THE SYSTEM SHALL return the fiscal response (`fiscal_number`, `device_id`, `auth_code`, `timestamp`, QR data) so the POS can print the receipt and queue the sealed invoice for cloud sync.
- WHEN the POS or cloud receives the sealed invoice, THE SYSTEM SHALL ensure it is the only content transmitted to the DGI, and that the DEF-generated security elements travel with it.

### Offline-First Design
- WHEN connectivity to the cloud, MCF, or DGI is lost, THE SYSTEM SHALL continue accepting PREPARE → COMMIT flows locally on the USB device, allowing the DEF to validate, sign, and store invoices without interruption.
- WHEN the network returns, THE SYSTEM SHALL automatically upload the queued sealed invoices (including security metadata) to the DGI in arrival order so deferred transmissions retain their audit trail.

### Multi-Terminal Per-Outlet Model
- WHEN multiple POS terminals operate in the same outlet, THE SYSTEM SHALL route every canonical payload through a local fiscal service that mediates access to the single DEF, serializes PREPARE/COMMIT requests, and includes the outlet ID, POS terminal ID, and cashier/waiter ID in every payload for traceability.
- WHEN two simultaneous host sessions target the same DEF, THE SYSTEM SHALL enforce the nonce-based 2PC handshake to prevent replay, race conditions, and duplicated fiscal numbers across terminals.

### Security Elements
- WHEN the DEF commits an invoice, THE SYSTEM SHALL append the sequential fiscal number, DEF ID (DEF NID), cryptographic authentication signature, trusted timestamp, and QR code generated in-device to the fiscal response so every receipt contains verifiable security elements.
- WHEN invoices are printed or synched, THE SYSTEM SHALL never allow the POS to fabricate these security elements; they must originate from the trusted hardware layer alone.

### Tax Engine and Client Classification
- WHEN the POS builds totals, THE SYSTEM SHALL compute amounts for all 14 mandated DGI tax groups (exempt, standard VAT, special regimes, public financing VAT, customs VAT, specific taxes, etc.) and include the detailed breakdown within the canonical payload and the DEF journal entry.
- WHEN the POS records the purchaser, THE SYSTEM SHALL classify the client as Individual, Company, Commercial Individual, Professional, or Embassy per the DGI taxonomy so tax treatment and reporting remain compliant.

### Required Invoice Types
- WHEN generating any fiscal event, THE SYSTEM SHALL support sale invoices, advance invoices, credit notes, export invoices, and export credit notes, sealing each with the same PREPARE → COMMIT → REPORT flow to guarantee every type carries a fiscal number and signature.
- WHEN a merchant attempts to issue a reported type, THE SYSTEM SHALL enforce device validation (schema, counters, tax groups) so no invoice type bypasses the trust boundary or the immutable journal.

### Reports
- WHEN a cashier or auditor requests summaries, THE SYSTEM SHALL produce the mandated Z report (daily closure), X report (periodic/session summary), A report (article-level detail), and audit export directly from the DEF's hash-chained journal to preserve immutability.
- WHEN reports are generated, THE SYSTEM SHALL include the sequential counters, totals per tax group, and timestamps so the cloud and DGI can reconcile the data with posted invoices.

### Void and Refund Events
- WHEN a void or refund is required, THE SYSTEM SHALL treat it as a new fiscal event referencing the original invoice, process it through PREPARE → COMMIT, and append it to the journal rather than deleting or mutating the original record.
- WHEN the POS issues a credit note or refund, THE SYSTEM SHALL require the DEF to validate the reference invoice and generate a new fiscal number, auth code, and report entry that auditors can trace back to the initial sale.

### USB Two-Phase Commit Protocol
- WHEN the POS sends a PREPARE command, THE SYSTEM SHALL validate the canonical JSON, policy state, and replay status, then respond with a short-lived nonce while refraining from altering counters or journal entries until COMMIT arrives.
- WHEN the COMMIT command arrives (with a matching nonce), THE SYSTEM SHALL atomically increment the counter, append the entry to flash, sign the record, and return the fiscal response; any failure causes the POS to retry the PREPARE step.

### Canonical Payload Integrity
- WHEN building the canonical payload, THE SYSTEM SHALL include deterministic field ordering and the required fields (`merchant_nif`, client/classification, items, tax groups, totals, timestamp, outlet/POS/cashier IDs) so signatures remain reproducible and the device can detect duplicates.
- WHEN the DEF stores an invoice, THE SYSTEM SHALL hash-chain each entry to the previous record, preventing tampering while allowing audit exports to demonstrate immutability.

## References

- kutapay_technical_design.md — architecture overview, hardware requirements, canonical payload outline.
- docs/sfe-specifications-v1-summary.md — DGI SFE rules for invoice types, tax groups, reports, client classification, and offline behavior.
- docs/adr/adr-0001-two-phase-commit-usb-protocol.md — PREPARE/COMMIT protocol, nonce handling, failure semantics.
- .github/copilot-instructions.md — trust boundary, multi-terminal rules, security elements, and offline-first guidance.
