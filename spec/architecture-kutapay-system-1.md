# Bono Pay System Architecture Specification v1

## Context

This specification captures the DRC requirements for fiscalized invoices while describing how Bono Pay — an API-first, cloud-native invoicing platform — satisfies the Facture Normalisée mandate in Phase 1. Client applications (web dashboard, SDKs, API consumers, and future POS integrations) remain untrusted, while the Cloud Signing Service (HSM-backed) living inside Bono Pay Cloud is the trusted fiscal authority. The Cloud stores every sealed invoice in a hash-chained fiscal ledger and syncs sealed data to DGI (MCF/e-MCF) without exposing private keys, counters, or ledger mutations to clients.

## EARS Requirements

### Trust Boundary & Canonical Payload
- WHEN a merchant or developer builds an invoice payload via the Bono Pay API or web dashboard, THE SYSTEM SHALL treat it as untrusted, serialize it with deterministic field ordering (`merchant_nif`, `outlet_id`, `pos_terminal_id`, `cashier_id`, `client`, `items`, `tax_groups`, `totals`, `payments`, `timestamp`), and route it to the Cloud Signing Service (HSM) for validation, signing, and storage.
- WHEN the canonical payload crosses into Bono Pay Cloud, THE SYSTEM SHALL only include identifiers needed for traceability (merchant, outlet, terminal, cashier, client classification) and never allow the client to fabricate fiscal numbers, signatures, timestamps, or QR payloads.
- WHEN Bono Pay Cloud receives the payload, THE SYSTEM SHALL validate schema, enforce the 14 DGI tax groups, and apply the tax engine before admitting the request to the Monotonic Counter Manager.
- WHEN the tax engine has run, THE SYSTEM SHALL forward the payload to the Cloud Signing Service (HSM) that owns fiscal number assignment, signature generation, trusted timestamping, and QR encoding while the Fiscal Ledger keeps an append-only, hash-chained record of the sealed event.

### Invoice Lifecycle
- WHEN a merchant creates an invoice via API or dashboard, THE SYSTEM SHALL route the request through the tax engine, send it to the Cloud Signing Service (HSM) for fiscal number assignment and signing, store the sealed response in the fiscal ledger, deliver the sealed invoice to the client, and enqueue the sealed data for DGI sync (MCF/e-MCF).
- WHEN the Cloud Signing Service signs an invoice, THE SYSTEM SHALL mark the event as `Fiscalized`, publish the fiscal number/auth code/timestamp/qr_payload to clients, and keep the ledger entry immutable so auditors can verify every fiscal event.
- WHEN the Sync Agent uploads data to DGI, THE SYSTEM SHALL send only the sealed invoice plus security metadata; the Cloud Signing Service remains the source of truth for fiscalization status and ledger hashes.
- WHEN a void, refund, credit note, or advance invoice is required, THE SYSTEM SHALL treat it as a new fiscal event referencing the original, repeat the tax and signing flow, and append the result to the ledger.
- WHEN a client cancels a draft before fiscalization, THE SYSTEM SHALL delete the draft without generating a fiscal event so that nothing ever gets sealed until the Cloud Signing Service approves it.

### Security Elements
- WHEN an invoice is fiscalized, THE SYSTEM SHALL generate the five mandatory security elements inside the Cloud Signing Service (HSM): (1) sequential fiscal number from the Monotonic Counter Manager, (2) fiscal authority ID tied to the signing cluster, (3) cryptographic authentication code (ECDSA signature), (4) trusted UTC timestamp, and (5) QR code encoding fiscal_number, auth_code, timestamp, and verification URL.
- WHEN the Cloud Signing Service emits the sealed invoice, THE SYSTEM SHALL persist those elements in the Fiscal Ledger and only display or deliver them through clients; clients may not fabricate or mutate them.
- WHEN auditors or inspectors scan a QR code, THE SYSTEM SHALL surface a verification endpoint that resolves fiscal_number, auth_code, timestamp, and ledger hash so they can confirm authenticity without trusting any client application.

### Tax Engine & Client Classification
- WHEN Bono Pay processes an invoice, THE SYSTEM SHALL compute amounts for all 14 DGI tax groups (exempt, VAT standard, special regimes, public financing VAT, customs VAT, specific taxes, etc.) and include the breakdown in the canonical payload and ledger entry.
- WHEN a purchaser is recorded, THE SYSTEM SHALL classify the client as Individual, Company, Commercial Individual, Professional, or Embassy so the tax treatment and reporting fields remain consistent with the DGI taxonomy.
- WHEN the canonical payload arrives at the tax engine, THE SYSTEM SHALL verify that each line item specifies `tax_group` and that the totals match the grouped calculations before passing the payload to the Cloud Signing Service.

### Reports
- WHEN merchants or auditors request compliance reports, THE SYSTEM SHALL generate the mandated Z report (daily closure), X report (session/period summary), A report (article-level detail), and audit export directly from the Cloud Fiscal Ledger, including fiscal number ranges, auth codes, timestamps, and tax group totals.
- WHEN reports are produced, THE SYSTEM SHALL ensure every entry references the same sealed invoices that live in the fiscal ledger so the ledger, reports, and DGI transmissions are always reconcilable.
- WHEN reports are exposed via API or dashboard, THE SYSTEM SHALL include the fiscal_authority_id (cloud signer ID) and the ledger hash so recipients can trace the origin of each entry.

### Multi-User Access & Monotonic Counters
- WHEN multiple API keys, dashboard users, or SDK instances operate inside one outlet, THE SYSTEM SHALL scope each request by `outlet_id`, `user_id` or `api_key_id`, and `source` (dashboard, API, SDK, future POS) before assigning fiscal numbers through the Monotonic Counter Manager.
- WHEN concurrent invoice creations occur within an outlet, THE SYSTEM SHALL enforce serializable isolation on the fiscal counter table so Bono Pay Cloud serializes numbering per outlet without race conditions or double-issuance.
- WHEN a new user or API key is provisioned, THE SYSTEM SHALL record their role (admin, invoicer, viewer, auditor) and quota so the Invoice Policy layer enforces permission checks before allowing fiscalization.

### Offline Behavior
- WHEN the client application is offline, THE SYSTEM SHALL queue invoice requests locally (IndexedDB in the dashboard, SQLite in SDKs), display the invoice as `Queued`, and automatically retry submission when reconnecting to Bono Pay Cloud.
- WHEN connectivity returns, THE SYSTEM SHALL submit queued payloads to the Cloud Signing Service (HSM) for fiscalization; no sealed invoice is issued while the client remains offline.
- WHEN retries fail three times, THE SYSTEM SHALL alert the merchant via the dashboard and keep the payload in the queue until manual intervention or successful fiscalization occurs.

### DGI Integration (MCF / e-MCF)
- WHEN the Sync Agent pushes sealed invoices to the DGI control module (MCF/e-MCF), THE SYSTEM SHALL transmit the sealed payload, security elements, outlet/user identifiers, and ledger hash without sharing private keys or counters.
- WHEN the DGI acknowledges a batch, THE SYSTEM SHALL mark the Fiscal Ledger entries as `Synced_to_DGI` and expose the acknowledgment status through API/webhook channels.
- WHEN the DGI spec changes, THE SYSTEM SHALL adapt the Sync Agent but remain confident that the Cloud Signing Service is the source of correct security elements.

### Phase 3 — USB Hardware (Optional)
- WHEN the USB Fiscal Memory device is deployed in Phase 3, THE SYSTEM SHALL route signing through the device for that outlet, replacing the Cloud Signing Service as the local trusted authority while the device still publishes sealed invoices to Bono Pay Cloud for ledger replication and DGI sync.
- WHEN the USB device handles signing, THE SYSTEM SHALL keep the canonical payload, tax engine, and reporting rules unchanged so the cloud ledger mirrors the device journal via hash chaining and audit exports.
- WHEN auditors inspect Phase 3 outlets, THE SYSTEM SHALL point to the archived hardware docs in `design/docs-archive/hardware/` for DEF protocol details while still referencing the cloud ledger for reporting continuity.

## References

- docs/sfe-specifications-v1-summary.md — DGI requirements for invoice types, tax groups, classification, security elements, and reports.
- .github/copilot-instructions.md — Trust boundary rules, invoice lifecycle, security element definitions, and offline behavior for Bono Pay Cloud.
- docs/odoo-pos-lessons-for-kutapay.md — UX and offline patterns informing the dashboard and multi-user expectations.
*** End Patch***(adjusted) (Note: please copy patch to final answer) Implement the patch with new content.
