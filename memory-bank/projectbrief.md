# Project Brief

## Mission

Bono Pay is fiscal invoicing infrastructure for the Democratic Republic of Congo. It is an API-first platform (think Stripe Invoices) that lets merchants create, validate, sign, and sync compliant invoices through a Cloud Signing Service backed by an HSM so finance and compliance teams never worry about the trust boundary or fiscalization hardware.

## Problem

DRC businesses must issue legally recognized invoices with sequential fiscal numbers, cryptographic authentication codes, trusted timestamps, QR codes, and Z/X/A/audit reports, yet most POS systems cannot enforce the immutable ledger, monotonic counters, or signature provenance that the DGI demands.

## Solution

Bono Pay delivers a web dashboard, REST API, and SDKs that submit deterministic canonical payloads to the Cloud Signing Service. The service assigns fiscal numbers, signs invoices, stores them in a hash-chained fiscal ledger, and returns sealed receipts plus security elements while a sync agent uploads the data to the DGI immediately or when connectivity returns.

## Success Criteria

- Every invoice contains HSM-generated fiscal number, fiscal authority ID, authentication code, timestamp, and QR payload that auditors can verify.
- All five mandated invoice types (sale, advance, credit note, export invoice, export credit note) are fully supported.
- The tax engine computes all 14 DGI tax groups and client classifications before signing.
- Offline-capable clients queue invoices locally, submit them when connections return, and still receive sealed responses.
- Multi-tenancy is enforced through outlets, API keys, and scoped roles so pilots and enterprise customers can coexist.
- Reports (Z, X, A, audit export) come from the cloud fiscal ledger and trace every fiscal event immutably.

## Constraints

- Trust boundary: Bono Pay Cloud Signing Service (HSM-backed) is the authoritative fiscal layer in Phase 1; client apps never fabricate security elements.
- Canonical payloads must keep deterministic ordering for `merchant_nif`, `outlet_id`, `pos_terminal_id`, `cashier_id`, `client`, `tax_groups`, `totals`, and payments so signatures remain reproducible.
- The platform never deletes invoices; voids/refunds are new fiscal events and drafts are cancelled before fiscalization.
- Security elements include fiscal number, fiscal authority ID, authentication code, timestamp, and QR code, all minted inside the HSM.
- Offline-first behavior is non-negotiable: clients queue submissions locally (IndexedDB/SQLite) and rely on the cloud signer once back online.
- Open unknowns remain (MCF/e-MCF API spec, signature and QR formats, service registration protocol), so documentation must surface those gaps for future research.
- Phase 3 introduces the archived USB Fiscal Memory device as an optional trust anchor when DEF homologation is required; hardware specs live under `design/docs-archive/`.
