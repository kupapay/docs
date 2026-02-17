# Product Context

## Why Bono Pay exists

DRC merchants need to issue trusted, auditable invoices without wrestling with fiscal hardware, regardless of whether they run in a supermarket, a school, or a service company. Bono Pay fills that gap by delivering fiscal invoicing infrastructure (API + dashboard + SDKs) that produces HSM-signed receipts while keeping the user-facing experience web-native and offline-capable.

## Problems Bono Pay solves

- Bridges the trust boundary: client apps are untrusted, and the cloud signing service is the only authority that assigns fiscal numbers, signs invoices, and stores the hash-chained ledger.
- Eliminates hardware rollouts for Phase 1, letting finance teams adopt fiscal compliance immediately through a browser or integration without waiting for USB device deployment.
- Preserves regulatory requirements (14 tax groups, classification, Z/X/A/audit reports) while exposing developer-friendly APIs and dashboards.
- Supports offline-first workflows, so clients can queue invoices locally (IndexedDB/SQLite) and still comply once connectivity returns.
- Enables multi-user, multi-outlet operations via scoped API keys, roles, and per-outlet quota enforcement.

## Target users

- Phase 1 B2B pilots: service companies, wholesalers, schools, and government suppliers in Kinshasa that must issue compliant invoices now.
- Developers building integrations (APIs, SDKs, ERP connectors) who expect Stripe-like surface area, documentation, and canonical payloads.
- Accountants, auditors, and finance teams who need instant access to signed invoices, Z/X/A reports, and audit exports without managing a USB device.
- Regulators and DGI reviewers who demand auditable, hash-chained data with verifiable security elements.
- Retailers and POS vendors (Phase 2) who will connect through SDKs or APIs before optionally introducing the USB Fiscal Memory device.

## UX goals

- Offline-first PWA dashboard inspired by Odoo lessons (service worker + IndexedDB) so tablets and low-end laptops work reliably.
- Progressive web UI with large tap targets, instant search, calculator/numpad entry, and dual-currency display (CDF/USD).
- Multi-channel receipt delivery: email, WhatsApp, PDF download, and thermal print with fiscal data embedded (fiscal number, auth code, QR).
- Mobile money natives (Airtel Money, M-Pesa, Orange Money) added as first-class payment methods with explicit receipts.
- Developer-friendly API docs, SDKs, and reference clients that handle canonical payload serialization, offline queues, and HMAC-signed webhooks.
