# System Patterns

## Trust Boundary & Canonical Payload

Bono Pay separates the untrusted client layer (web dashboard, API consumers, SDKs, future POS terminals) from the trusted cloud layer. Clients prepare canonical JSON payloads with deterministic ordering (`merchant_nif`, `outlet_id`, `pos_terminal_id`, `cashier_id`, `client`, `tax_groups`, `totals`, `payments`), queue work when offline, and submit them to Bono Pay Cloud. The Cloud Signing Service (HSM-backed) is the sole authority that validates, signs, and numbers invoices before returning the sealed response.

## Offline-First Workflow (Delegated Offline Token)

Offline is mission-critical but must comply with Arrêté 033. Pure offline queuing of unsigned drafts is illegal for printed receipts. Bono Pay uses the **Delegated Offline Token Architecture (Phase 1.5)**:
1. **Online Provisioning**: The POS Fiscal Extension requests a short-lived Delegated Credential (VC) and a block of fiscal numbers from the Cloud.
2. **Offline Signing**: The extension signs invoices locally within its isolated sandbox, allowing legally valid receipts to be printed offline.
3. **Online Reconciliation**: When connectivity returns, locally-sealed invoices are submitted to the Cloud, verified against the VC, and appended to the Fiscal Ledger.

## Multi-User / Multi-Terminal Scaling

One outlet can host multiple API keys and users (admin, invoicer, viewer, auditor). Each invoice tags `outlet_id`, `user_id`/`api_key_id`, and `source` (dashboard, API, SDK, future POS) so the Monotonic Counter Manager can serialize fiscal numbering per outlet without race conditions. Role-based access and quotas protect high-volume tenants.

## Security Elements & Fiscal Ledger

Every fiscal event carries HSM-generated fiscal number, fiscal authority ID, authentication code, trusted timestamp, and QR payload. The fiscal ledger is hash-chained, append-only, and backed by PostgreSQL with transaction isolation, so reports always reconcile to the same immutable entries.

## Reporting & Compliance

Reports (Z, X, A, audit export) are generated from the cloud fiscal ledger. They include per-tax-group totals, fiscal number ranges, auth codes, and journal hashes. Cloud sync uploads sealed invoices to DGI (MCF/e-MCF) immediately or when backlog clears.

## Phase 3 Hardware Context

Phase 3 introduces the archived USB Fiscal Memory device as an optional trust anchor. When deployed, the device produces the same security elements locally, the cloud sync agent relays sealed invoices, and the hardware specs live under `design/docs-archive/hardware/`. The cloud still maintains duplicates for auditing and reporting.

## Open Unknowns

- MCF/e-MCF API spec (endpoint URLs, auth tokens, payload schema) remains unpublished and blocks the sync agent design.
- Exact signature algorithm and QR format that DGI accepts — need clarification before we finalize crypto code.
- Device/service registration and key provisioning protocol — pending DGI guidance.
- Offline retry window and acknowledgment semantics for deferred transmissions.
