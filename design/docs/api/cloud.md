# Cloud API Reference

This API is the cloud-facing bridge between POS terminals, the trusted USB Fiscal Memory device, and the DGI control modules. It stores uploads from `spec/architecture-kutapay-system-1.md`, replays them in arrival order, and exposes reporting and audit endpoints aligned with `spec/design-cloud-api-1.md`.

!!! caution "Security by design"
    All endpoints require TLS 1.3+, `Authorization: Bearer <token>`, and the `X-KUTAPAY-DEVICE-ID` header so we can tie uploads to trusted DEF instances. Never accept invoices with missing canonical fields or unsigned nonces.

## Key Endpoints

| Endpoint | Purpose | Response highlights |
|----------|---------|---------------------|
| `POST /api/v1/invoices/upload` | Accept sealed invoices from the canonical payload and queue them for DGI transmission | `dgi_status`, `queued_at`, retry hints |
| `GET /api/v1/invoices/{fiscal_number}/status` | Check whether the DGI acknowledged a fiscal number | `dgi_status`, `processed_at` |
| `POST /api/v1/devices/register` | Register DEF hardware and provision prefixes | `assigned_prefix`, `activation_code` |
| `GET /api/v1/devices/{device_id}/health` | Monitor DEF heartbeat, counter, and queue | `current_counter`, `queued_invoices` |
| `GET /api/v1/sync/status` | Surface queue depth, state machine, and retry timing | `backlog`, `state`, `next_retry` |
| `POST /api/v1/reports` | Trigger Z/X/A reports derived from the hash-chained journal | `report_id`, `download_url` |
| `GET /api/v1/audit/export` | Download journal exports for inspections/audit | `journal_hash`, `entries`, signed downloads |

!!! info "Specification reference"
    The endpoint request/response schema definitions live in [`spec/design-cloud-api-1.md`](../../spec/design-cloud-api-1.md).

## Example: Invoice Upload

```json
POST /api/v1/invoices/upload
Content-Type: application/json
Authorization: Bearer dgi-token
X-KUTAPAY-DEVICE-ID: DEF-1A2B3C

{
  "fiscal_number": "KUTA-2026-000123",
  "device_id": "DEF-1A2B3C",
  "auth_code": "h9fj2w8s...",
  "timestamp": "2026-02-17T03:00:00Z",
  "qr_payload": "https://secure.dgi/conformity?hash=...",
  "canonical_payload": {
    "merchant_nif": "123456789",
    "client": { "name": "Acme Ltd", "nif": "987654321" },
    "client_classification": "Company",
    "outlet_id": "OUTLET-001",
    "pos_terminal_id": "POS-01",
    "cashier_id": "CASHIER-07",
    "tax_groups": [
      { "code": "VAT_STD", "amount": 120.0, "rate": 16.0 }
    ],
    "items": [
      { "sku": "SKU-001", "description": "Widget", "quantity": 2, "unit_price": 60.0, "tax_group": "VAT_STD" }
    ],
    "totals": { "subtotal": 120.0, "tax": 19.2, "total": 139.2 },
    "timestamp": "2026-02-17T03:00:00Z"
  }
}
```

Response:

```json
{
  "status": "ok",
  "code": "INVOICE_UPLOADED",
  "payload": {
    "queued_at": "2026-02-17T03:01:00Z",
    "dgi_status": "pending",
    "retry_after": "2026-02-17T03:05:00Z"
  }
}
```

## Example: Report Request

```json
POST /api/v1/reports
Content-Type: application/json
Authorization: Bearer dgi-token

{
  "type": "Z",
  "period": { "date": "2026-02-17" },
  "outlet_id": "OUTLET-001",
  "include_journal_hash": true
}
```

Response:

```json
{
  "status": "ok",
  "code": "REPORT_READY",
  "payload": {
    "report_id": "RPT-Z-2026-02-17",
    "download_url": "/reports/zip/download/RPT-Z-2026-02-17",
    "generated_at": "2026-02-17T03:30:00Z"
  }
}
```

## Monitoring endpoints

- `GET /api/v1/devices/{device_id}/health` returns the last heartbeat, queue size, and current counter so operations can alert on stalled syncs.
- `GET /api/v1/sync/status` exposes the sync state machine (PENDING → RETRYING → ACKNOWLEDGED) and should power dashboards and alerting rules.
- `GET /api/v1/audit/export` returns the hash-chained journal with signed `journal_hash` plus downloadable artifacts for auditors.

## Error handling summary

- **Invalid canonical payload**: respond with `error: INVALID_SIGNATURE`.
- **Retries**: When `dgi_status` remains `pending`, the client should respect `retry_after` and refrain from re-submitting until the time arrives.
- **Authorization**: Fail fast with `error: INSUFFICIENT_PERMISSIONS` when tokens lack the required scopes for device registration, reporting, or audit exports.

## Notes

- The cloud API keeps every invoice traceable through `fiscal_number`, `device_id`, and `outlet_id` tags.
- Keep audit exports within the 30-day window to avoid `RANGE_TOO_LARGE`.
- All endpoints should emit structured logs (`cloud.request`, `cloud.response`) that include `device_id`, `fiscal_number`, and `dgi_status`.
