---
title: "POS Plugin API Specification v1"
version: 1.0
author: "KutaPay Architecture Team"
---

# POS Plugin API Specification v1

## Overview

The POS plugin is the untrusted gateway that runs inside each merchant application (web, tablet, or desktop) and mediates every fiscal operation on behalf of the cashier. It speaks HTTPS to the local KutaPay fiscal service, hands off canonical JSON invoices, and lets the trusted USB Fiscal Memory device (DEF) produce fiscal numbers, authentication codes, timestamps, and QR payloads. This specification defines the RESTful surface that third-party POS vendors implement so they can:

1. Initialize the plugin with outlet-, terminal-, and cashier-specific metadata.
2. Submit canonical invoices that honor the 14 DGI tax groups, five invoice types, and deterministic field ordering defined in `spec/architecture-kutapay-system-1.md`.
3. Monitor invoice status until the cloud syncs the sealed data.
4. Retrieve Z/X/A/audit reports for audit or reconciliation requests.

## Trust boundary & canonical payload

- The POS plugin lives in the **untrusted zone** described in `spec/architecture-kutapay-system-1.md`. The plugin **never manufactures** a fiscal number, device ID, timestamp, or QR payload—the DEF does.
- Every invoice payload sent via `POST /api/v1/plugin/invoices` must follow the canonical ordering: `merchant_nif`, `outlet_id`, `pos_terminal_id`, `cashier_id`, `invoice_type`, `timestamp`, `client` (with `classification`), `items[]`, `tax_groups[]`, `totals`, and `payments`.
- Invoice types are restricted to `sale`, `advance`, `credit_note`, `export`, `export_credit`. Tax groups span TG01…TG14, and client classifications are `Individual`, `Company`, `CommercialIndividual`, `Professional`, or `Embassy`.
- The plugin must include outlet/terminal identifiers so the local fiscal service can enforce a single DEF per outlet and monotonic ordering across terminals.

## Authentication & handshake

All endpoints require HTTPS/TLS 1.3 and an `Authorization: Bearer <plugin-token>` header provisioned during enrollment with the fiscal service. Each token is scoped to an outlet/terminal combination and must be rotated automatically (e.g., every 30 minutes). The plugin also tags every request with `X-KUTAPAY-DEVICE-ID` (the DEF identifier) and `X-KUTAPAY-NONCE` when performing invoice submissions so the service can correlate to the PREPARE/COMMIT lifecycle.

### POST /api/v1/plugin/init

**Purpose:** Align the plugin version with the fiscal service, surface `nonce_pool` status, and synchronize policy metadata before any invoice is issued.

**Request:**

```json
{
  "outlet_id": "OUTLET-005",
  "pos_terminal_id": "POS-12",
  "cashier_id": "CASHIER-07",
  "plugin_version": "1.2.0",
  "supported_invoice_types": ["sale", "credit_note"]
}
```

**Response:**

```json
{
  "status": "ok",
  "payload": {
    "device_id": "KUTA-OUTLET-005",
    "policy_version": "2026-02-17",
    "nonce_pool": 3,
    "max_payload_bytes": 65536,
    "supported_tax_groups": ["TG01", "TG02", "...", "TG14"],
    "next_nonce_refresh": "2026-02-17T04:00:00Z"
  }
}
```

**Details:**

- The fiscal service validates that the outlet/terminal pair is registered and that the plugin version is compatible.
- The plugin caches `nonce_pool` and refuses to submit invoices when the pool is exhausted; it may auto-refresh by re-calling `POST /init`.

## Invoice submission

### POST /api/v1/plugin/invoices

**Purpose:** Deliver the canonical payload that the DEF will fiscalize via the PREPARE → COMMIT handshake.

**Request:** The body hosts the canonical invoice JSON described above plus optional metadata. Example:

```json
{
  "merchant_nif": "123456789",
  "outlet_id": "OUTLET-005",
  "pos_terminal_id": "POS-12",
  "cashier_id": "CASHIER-07",
  "invoice_type": "sale",
  "timestamp": "2026-02-17T03:10:00Z",
  "client": {
    "registration": "987654321",
    "classification": "Company"
  },
  "items": [
    {
      "code": "ITEM-001",
      "description": "Consulting hours",
      "quantity": 2,
      "unit_price": "500.00",
      "tax_group": "TG03",
      "taxable_unit": "hour"
    }
  ],
  "tax_groups": [
    {
      "code": "TG03",
      "name": "Standard VAT — Services",
      "rate": "0.16",
      "base_amount": "1000.00",
      "tax_amount": "160.00"
    }
  ],
  "totals": {
    "subtotal": "1000.00",
    "total_vat": "160.00",
    "total": "1160.00",
    "currency": "CDF"
  },
  "payments": [
    { "method": "mobile_money", "amount": "1160.00", "instrument_id": "MOMO-123" }
  ]
}
```

**Response:**

```json
{
  "status": "accepted",
  "payload": {
    "fiscal_number": "KUTA-2026-000145",
    "device_id": "KUTA-OUTLET-005",
    "auth_code": "OTS7-AB12-XY99",
    "timestamp": "2026-02-17T03:10:05Z",
    "qr_payload": "KUTA|145|OTS7AB12|2026-02-17T03:10:05Z",
    "dgi_status": "queued",
    "report_links": ["/reports/2026-02-17/z"],
    "nonce": "A7F2D1",
    "nonce_ttl_seconds": 7
  }
}
```

**Details:**

- The `fiscal_number`, `device_id`, `auth_code`, `timestamp`, and `qr_payload` must come from the DEF. The plugin must never try to invent or mutate them.
- `dgi_status` tracks whether the cloud has uploaded the sealed invoice (`synced`) or is still queuing (`queued`).
- If the DEF rejects a payload, the service returns `status: "rejected"` plus an error code (see below). The plugin should surface the error and retry after the recommended backoff.
- The plugin must await the fiscal response before printing, logging, or uploading—`status: "accepted"` implies the DEF successfully signed the journal entry.

## Invoice status query

### GET /api/v1/plugin/invoices/{fiscal_number}/status

**Purpose:** Confirm whether the invoice is committed, queued, or synced with the DGI.

**Response:**

```json
{
  "status": "ok",
  "payload": {
    "fiscal_number": "KUTA-2026-000145",
    "device_id": "KUTA-OUTLET-005",
    "status": "synced",
    "synced_at": "2026-02-17T03:15:01Z",
    "last_error": null,
    "report_links": [
      { "type": "Z", "href": "/reports/2026-02-17/z" }
    ]
  }
}
```

## Report retrieval

### GET /api/v1/plugin/reports

**Purpose:** Fetch Z/X/A or audit exports for audit, inspection, or customer requests without touching the DGI directly.

**Query parameters:** `type` (`Z`, `X`, `A`, `AUDIT`), `since`, `until`, `format` (`json`, `csv`), `outlet_id`.

**Response:**

```json
{
  "status": "ok",
  "payload": [
    {
      "report_id": "RPT-Z-2026-02-17",
      "report_type": "Z",
      "download_url": "/reports/zip/RPT-Z-2026-02-17",
      "generated_at": "2026-02-17T03:30:00Z",
      "summary": {
        "sequence_start": 120,
        "sequence_end": 156,
        "invoice_count": 37
      }
    }
  ]
}
```

## Error codes

| Code | Meaning | Action |
| --- | --- | --- |
| `INVALID_CANONICAL_PAYLOAD` | Required field missing or order violated | Prompt cashier to re-enter and resend |
| `DEVICE_BUSY` | DEF processing another request | Wait 100–200 ms and retry |
| `DEVICE_UNREGISTERED` | Outlet/terminal not bound to a DEF | Re-run `/init` and re-attach the device |
| `DUPLICATE_FISCAL_NUMBER` | Fiscal number already exists on the device | Verify POS did not re-submit an already fiscalized invoice |
| `RETRY_LATER` | Temporary resource constraint (storage, nonce) | Respect `retry_after` header |
| `AUTH_FAILED` | Plugin token expired or invalid | Trigger token rotation and re-authenticate |

Errors include a `retry_after` timestamp when applicable and a `detail` string with human-readable guidance. All responses share the envelope:

```json
{
  "status": "error",
  "code": "...",
  "detail": "...",
  "retry_after": "2026-02-17T03:12:30Z"
}
```

## Offline behavior & retries

- The plugin is responsible for queueing invoices locally when the fiscal service or device is unreachable. It must attach the original `timestamp` so the DEF can order entries correctly once connectivity returns.
- The plugin should replay queued submissions in FIFO order, refreshing the `nonce` before each attempt. If the `nonce_pool` is zero, call `POST /init` to negotiate new nonces.
- Report requests should only be retried when the fiscal service signals `RETRY_LATER`; they should not flood the device.

## Security & trust

- The plugin runs in the untrusted zone and must treat every response from the fiscal service as authoritative. It should log but never overwrite the approved `fiscal_number`, `auth_code`, `device_id`, `timestamp`, or `qr_payload`.
- Authentication tokens must be stored in encrypted storage and rotated prior to expiry (e.g., using refresh tokens issued by the fiscal service). Loss or compromise of a plugin token should lead to immediate invalidation of that token.
- All payloads must be validated before submission; no command-line templates or string concatenation should be used when constructing JSON. Use parameterized JSON builders in your language of choice.

## References

- `spec/architecture-kutapay-system-1.md` — trust boundary, canonical payload ordering, invoice lifecycle, two-phase commit, tax groups, invoice types, reports, security elements.
