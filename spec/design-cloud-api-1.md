# Cloud API Specification — version 1

## Overview

The KutaPay Cloud API is the authenticated bridge between the POS/fiscal service stack and the DGI control modules (MCF/e-MCF). It receives sealed invoices from the USB Fiscal Memory device, keeps them queued during offline periods, mirrors the DEF security elements, and forwards audit-grade data to the tax authority. Every endpoint enforces HTTPS transport, strongly typed payloads, and alignment with the canonical invoice structure described in `spec/architecture-kutapay-system-1.md`.

## Security & Transport

- **HTTPS only**: All requests must use TLS 1.3 or higher.
- **Authentication**: `Authorization: Bearer <token>` represents a DGI-issued or KutaPay-managed API key bound to the outlet. The same credential is used to register devices, upload invoices, and request reports.
- **Device identity**: Requests that originate from the local fiscal service carry `X-KUTAPAY-DEVICE-ID` and `X-KUTAPAY-NONCE` headers so the cloud can tie uploads to the DEF instance that generated the canonical payload.
- **Replay protection**: The cloud validates the nonce from the PREPARE step before forwarding the payload to the DGI. Retries still require valid nonces, and duplicate fiscal numbers are rejected.
- **Field ordering**: The invoice upload payload must include the canonical JSON fields (`merchant_nif`, `client`, `client_classification`, `items[]`, `tax_groups[]`, `totals`, `timestamp`, `outlet_id`, `pos_terminal_id`, `cashier_id`) in deterministic order to preserve signature integrity.

## Common Response Envelope

```json
{
  "status": "ok",
  "code": "MCF_ACK",
  "message": "Invoice accepted for upload",
  "payload": { ... }
}
```

All endpoints wrap their primary response inside this envelope. Errors replace `status` with `error`, set `code` to a short identifier, and include `details` for debugging.

## Endpoints

### Invoice upload — `POST /api/v1/invoices/upload`

**Purpose:** Receive sealed invoices after the DEF returns fiscal numbers so the cloud can queue them for DGI transmission and auditing.

**Request:** `application/json`

```json
{
  "fiscal_number": "KUTA-2026-000123",
  "device_id": "DEF-1A2B3C",
  "auth_code": "h9fj2w8s...",
  "timestamp": "2026-02-17T03:00:00Z",
  "qr_payload": "https://...",
  "canonical_payload": {
    "merchant_nif": "123456789",
    "client": { "name": "Acme Ltd", "nif": "987654321" },
    "client_classification": "Company",
    "outlet_id": "OUTLET-001",
    "pos_terminal_id": "POS-01",
    "cashier_id": "CASHIER-07",
    "tax_groups": [
      { "code": "VAT_STD", "amount": 120.00, "rate": 16.0 }
    ],
    "items": [
      { "sku": "SKU-001", "description": "Widget", "quantity": 2, "unit_price": 60.00, "tax_group": "VAT_STD" }
    ],
    "totals": { "subtotal": 120.00, "tax": 19.20, "total": 139.20 },
    "timestamp": "2026-02-17T03:00:00Z"
  }
}
```

**Response:**

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

**Errors:**

- `error: INVALID_SIGNATURE` if the canonical payload order does not match the DEF signature.
- `error: DUPLICATE_FISCAL_NUMBER` if the fiscal number already exists in the queue.
- `error: DEVICE_NOT_REGISTERED` if the `device_id` is unknown or offline.

### Invoice status — `GET /api/v1/invoices/{fiscal_number}/status`

**Purpose:** Let POS or auditors query whether the DGI has acknowledged an uploaded invoice.

**Response:**

```json
{
  "status": "ok",
  "code": "INVOICE_STATUS",
  "payload": {
    "fiscal_number": "KUTA-2026-000123",
    "dgi_status": "accepted",
    "processed_at": "2026-02-17T03:08:12Z",
    "report_links": ["/reports/2026-02-17/z"]
  }
}
```

**Errors:**

- `error: NOT_FOUND` when the fiscal number is unknown.
- `error: NOT_YET_PROCESSED` when still in the upload queue.

### Device registration — `POST /api/v1/devices/register`

**Purpose:** Register a new DEF instance so the cloud can assign fiscal prefixes and track activation.

**Request:**

```json
{
  "device_id": "DEF-1A2B3C",
  "serial_number": "SN-987654",
  "public_key": "mF6hLgq2...",
  "outlet_id": "OUTLET-001",
  "requested_prefix": "KUTA-2026-"
}
```

**Response:**

```json
{
  "status": "ok",
  "code": "DEVICE_REGISTERED",
  "payload": {
    "assigned_prefix": "KUTA-2026-",
    "activation_code": "ACT-1234",
    "dgi_registration_token": "token-abc"
  }
}
```

**Errors:**

- `error: SERIAL_USED` if the serial number is already registered.
- `error: INVALID_PUBLIC_KEY` when the SE key fails verification.

### Device health — `GET /api/v1/devices/{device_id}/health`

**Purpose:** Surface heartbeat, counters, and connectivity to sync agents for monitoring.

**Response:**

```json
{
  "status": "ok",
  "code": "DEVICE_HEALTH",
  "payload": {
    "last_seen": "2026-02-17T03:15:00Z",
    "current_counter": 3124,
    "queued_invoices": 5,
    "battery": "n/a",
    "errors": []
  }
}
```

**Errors:** `error: NOT_FOUND` if the device has never registered.

### Sync status — `GET /api/v1/sync/status`

**Purpose:** Reveal the state machine for deferred uploads and let dashboards show queue depth, backlog, and earliest pending invoice.

**Response:**

```json
{
  "status": "ok",
  "code": "SYNC_STATUS",
  "payload": {
    "backlog": 12,
    "oldest_queued": "2026-02-16T22:11:03Z",
    "next_retry": "2026-02-17T03:25:00Z",
    "state": "retrying",
    "last_successful_upload": "2026-02-17T02:58:00Z"
  }
}
```

### Report generation — `POST /api/v1/reports`

**Purpose:** Request Z, X, or A reports generated from the DEF journal and optionally send them to the DGI if required.

**Request:**

```json
{
  "type": "Z",
  "period": {
    "date": "2026-02-17"
  },
  "outlet_id": "OUTLET-001",
  "include_journal_hash": true
}
```

**Response:**

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

**Errors:**

- `error: INVALID_PERIOD` when the requested date range is unsupported.
- `error: INSUFFICIENT_PERMISSIONS` when the caller lacks reporting privileges.

### Audit export — `GET /api/v1/audit/export`

**Purpose:** Deliver an immutable export of the DEF journal (hash-chained entries) for inspections or DGI uploads.

**Query parameters:** `outlet_id`, `since`, `until`, `format` (`json` or `csv`)

**Response:**

```json
{
  "status": "ok",
  "code": "AUDIT_EXPORT",
  "payload": {
    "journal_hash": "e3b0c44298fc1c149afbf4c8996fb924",
    "entries": [
      { "fiscal_number": "KUTA-2026-000100", "hash": "abc", "timestamp": "2026-02-16T23:00:00Z" }
    ],
    "download_url": "/reports/audit/export/2026-02"
  }
}
```

**Errors:**

- `error: RANGE_TOO_LARGE` when the time window exceeds 30 days.
- `error: FORMAT_UNSUPPORTED` when requesting a non-json/csv export.

## Observability

- Each request logs the `device_id`, `outlet_id`, and `Authorization` subject.
- Retry loops push metrics to `cloud.sync.queue` and `cloud.reports.requests`.
- Audit exports store checksums and `journal_hash` signed by the DEF for tamper evidence.
