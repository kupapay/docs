# Technical Context

## Stack decisions

- **Cloud Signing Service (HSM-backed):** FIPS-level HSM enforces key material isolation, signs canonical payloads, generates fiscal numbers, and emits verification QR payloads.
- **REST API + SDK ecosystem:** Node.js/FastAPI-style API surfaces CRUD endpoints, tax-checking, and report generation. SDKs (JS/Python/PHP) handle canonical serialization, offline queues, and webhook verification.
- **PWA dashboard:** React/Vue SPA with service workers, IndexedDB queue, offline indicators (green/yellow/red), and mobile-first layout inspired by Odoo lessons.
- **Fiscal ledger:** PostgreSQL with serializable monotonic counter table, hash-chained ledger entries, audit logs, and nightly backups.
- **Sync agent:** Cloud-side service uploads sealed invoices to the DGI (MCF/e-MCF), tracks acknowledgments, and surfaces errors to dashboards/webhooks.
- **Infrastructure:** Cloud-native containers, HSM integration (AWS CloudHSM, Azure Dedicated HSM, or Vault Transit), observability (metrics/tracing), multi-tenancy isolation per merchant/outlet.

## Decided items

- Trust boundary is cloud-first: client apps are untrusted, Cloud Signing Service is authority in Phase 1, USB hardware is optional Phase 3.
- Canonical payload ordering is mandated for deterministic signatures; tax engine must handle all 14 DGI tax groups plus required client classifications.
- Offline-first clients use the **Fiscal Extension (Phase 1.5)** to sign invoices locally using a Delegated Credential. Purely unsigned drafts are not legally valid receipts.
- Reports (Z, X, A, audit export) are derived from the cloud fiscal ledger but the USB device may mirror them in Phase 3.
- Regulatory compliance requires 5 invoice types, canonical security elements, hash-chained storage, and open audit trails.

## Open questions

- **MCF/e-MCF API spec:** Endpoint URLs, authentication scheme, and schema are still unreleased.
- **Signature & QR format:** DGI-approved algorithm, payload structure, and validation checks need confirmation.
- **Registration protocol:** How merchants or services register with DGI/MCF—keys, activation codes, provider obligations—remains undefined.
- **Offline grace period:** How long can invoices stay queued before heavy penalties or forced retries.
- **Hardware migration:** When and how the archived USB Fiscal Memory device will replace the cloud signer for Phase 3 merchants.
