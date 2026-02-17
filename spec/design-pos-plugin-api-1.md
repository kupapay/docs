---
title: "Invoicing SDK Specification v1"
version: 1.0
author: "Bono Pay Architecture Team"
---

# Invoicing SDK Specification v1

## Overview

In Phase 1 the Bono Pay Invoicing SDK (available for JavaScript, Python, PHP, and future languages) connects directly to the Cloud API. It removes the need for a local POS plugin or fiscal service, serializes canonical invoices, handles offline queues, and surfaces the sealed responses (fiscal number, auth code, timestamp, QR payload, fiscal_authority_id) returned by the Cloud Signing Service (HSM-backed).

The SDK abstracts:

1. Authentication with `Authorization: Bearer <token>` scoped per merchant/outlet.
2. Canonical payload ordering (merchant_id, outlet_id, pos_terminal_id, cashier_id, client, items, tax_groups, totals, payments).
3. Offline queue handling (IndexedDB in browsers, SQLite on native runtimes).
4. Webhook verification (`X-BonoPay-Signature`).
5. Resilient retries and error surfaces for invalid payloads or rate limits.

## Trust boundary & canonical payload

The SDK lives in the untrusted zone. It drafts invoices offline but never fabricates fiscal numbers, timestamps, or QR codes. It must:

- Respect deterministic field ordering per `spec/architecture-kutapay-system-1.md`.
- Include `merchant_id`, `outlet_id`, and `pos_terminal_id` so the Cloud API can scope the request.
- Tag each invoice with `client.classification` (Individual, Company, CommercialIndividual, Professional, Embassy) and supply DGI tax groups (TG01–TG14) with `tax_amount` and `tax_rate`.
- Keep payment data (method, amount, currency, instrument_id) in the same sequence to preserve hashing.

When the Cloud API responds, the SDK surfaces the seal (`fiscal_number`, `auth_code`, `timestamp`, `qr_payload`, `fiscal_authority_id`) and lets callers deliver or print receipts. The SDK also stores ledger metadata (`ledger_hash`, `dgi_status`) for audit logs.

## SDK Methods

- `client.invoices.create(payload)` — sends the canonical invoice to the Cloud API, validates the server response, and returns the sealed invoice plus security elements.
- `client.invoices.get(fiscal_number)` — retrieves a sealed invoice with ledger hash, client info, and tax group breakdown. Useful for reprints or auditor requests.
- `client.invoices.list(filters)` — paginated, filterable list by date range, `client.nif`, `status`, or `outlet_id`.
- `client.invoices.void(fiscal_number, reason, adjustments)` — issues a credit note that references the original invoice and describes the returned items.
- `client.invoices.refund(fiscal_number, amount, payment_reference)` — creates a fiscal event representing a refund; the Cloud Signing Service returns a new fiscal number for the credit note.
- `client.reports.generate(options)` — calls `POST /api/v1/reports` to fetch Z/X/A/audit exports and exposes download URLs plus ledger hashes.
- `client.taxGroups.list()` — caches the 14 tax groups (code, rate, effective_from) and refreshes them periodically.
- `client.webhooks.verify(payload, signature)` — validates webhook payloads signed with `X-BonoPay-Signature` using the shared secret provided per outlet.

## Offline Queue & Retry

- **Storage:** Browser builds use IndexedDB, newlines store each draft invoice with `status` (`draft`, `queued`, `fiscalized`, `error`). Native builds may use SQLite or file-backed JSON.
- **Queue loop:** When connectivity returns, the SDK flushes invoices FIFO. Each retry fetches a fresh canonical payload (recomputing totals if the catalog changed) and resubmits to `POST /api/v1/invoices`.
- **Retry policy:** Exponential backoff (100ms → 5s → 20s, max 3 retries) with a final alert when the queue is blocked. The SDK exposes hooks (`onQueued`, `onFiscalized`, `onError`) so UI layers can show green/yellow/red indicators like the dashboard does.
- **Data integrity:** The SDK keeps the original `timestamp` and `nonce` (if provided by the Cloud) so the Cloud Signing Service can detect duplicates and assign the correct fiscal number.

## Configuration

- `apiKey`: Mandatory per merchant/outlet.
- `baseUrl`: Defaults to `https://api.bonopay.cd`.
- `timeout`: Request timeout (default 10s), with a longer timeout for offline queue flushes.
- `retry`: Strategy for transient errors.
- `offlineStorage`: Driver (`indexeddb`, `sqlite`, or custom) that implements `save`, `list`, `delete`, `mark`.
- `webhookSecret`: Per-outlet secret used by `client.webhooks.verify`.

## Error handling

Errors adopt the Cloud API envelope (`status`, `code`, `detail`, optional `retry_after`):

- `INVALID_CANONICAL_PAYLOAD`: Field missing, order wrong, or tax summary mismatch. The SDK must surface the error with guidance to re-author.
- `UNAUTHORIZED`: Tokens expired or missing.
- `FORBIDDEN`: API key lacks access to the requested outlet.
- `RATE_LIMIT_EXCEEDED`: Backoff and retry with `Retry-After`.
- `FISCALIZATION_FAILED`: Cloud Signing Service rejected the invoice (tighten totals, check tax groups).
- `OFFLINE_QUEUE_CORRUPT`: Local storage returned invalid data (SDK should reset the queue after exporting logs).

The SDK logs each error with `merchant_id`, `outlet_id`, and `source` so support teams can reproduce issues without touching the untrusted client layers.

## Webhook handling

The Cloud emits `X-BonoPay-Signature` (HMAC-SHA256 over the payload). The SDK must verify the signature before honoring status updates (`fiscalized`, `synced`, `dgi_rejected`). Webhook payloads include `fiscal_number`, `dgi_status`, and `ledger_hash`.

## References

- `spec/architecture-kutapay-system-1.md` — canonical payload ordering, trust boundary, sequence diagrams.
- `spec/design-cloud-api-1.md` — REST endpoints that the SDK targets.
- `.github/copilot-instructions.md` — offline behavior, security elements, and trust boundary assurance.
