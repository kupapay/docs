# POS Plugin API Reference

The POS plugin is the untrusted client that runs inside each merchant's POS application. It exists to keep the POS software compliant with the KutaPay trust boundary and to forward canonical JSON invoices through the local fiscal service so the USB Fiscal Memory device (DEF) can do the trusted work. Use this reference when you are integrating a third-party POS or writing a KutaPay plugin adapter.

!!! warning "Trust boundary reminder"
    The POS plugin runs entirely in the untrusted zone. Never attempt to fabricate `fiscal_number`, `device_id`, `auth_code`, `timestamp`, or `qr_payload`. Those values must originate from the DEF after a successful PREPARE → COMMIT handshake.

## Authentication & initialization

Every request uses `Authorization: Bearer <token>` where the token is scoped to the outlet/terminal pair and expires regularly (rotate it before expiry). Include headers `X-KUTAPAY-DEVICE-ID` and `X-KUTAPAY-NONCE` when submitting invoices so the fiscal service can correlate nonces with the PREPARE step.

### `POST /api/v1/plugin/init`

- **Purpose:** synchronize policy/version metadata, learn the current `nonce_pool`, and confirm the DEF assigned to the outlet.
- **Payload:** `outlet_id`, `pos_terminal_id`, `cashier_id`, `plugin_version`.
- **Response:** Returns `device_id`, `policy_version`, list of supported tax groups, `nonce_pool`, and optional `max_payload_bytes`. Cache these values and refuse to submit invoices if `nonce_pool` is zero.

## Invoice submission

Endpoint: `POST /api/v1/plugin/invoices`

### Canonical payload requirements

- Follow the field ordering in `spec/architecture-kutapay-system-1.md`: `merchant_nif`, `outlet_id`, `pos_terminal_id`, `cashier_id`, `invoice_type`, `timestamp`, `client` (with `classification`), `items`, `tax_groups`, `totals`, `payments`.
- Invoice types: `sale`, `advance`, `credit_note`, `export`, `export_credit`.
- Always include `outlet_id`, `pos_terminal_id`, and `cashier_id` so the fiscal service can enforce one DEF per outlet and maintain sequential counters.
- Tax groups must cover TG01…TG14 and match the schema (rate, base_amount, tax_amount).
- Items should carry `code`, `description`, `quantity`, `unit_price`, `tax_group`, `taxable_unit`.

### Sample submission

```http
POST /api/v1/plugin/invoices HTTP/1.1
Authorization: Bearer eyJhbGciOi...
Content-Type: application/json

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
    {
      "method": "mobile_money",
      "amount": "1160.00",
      "instrument_id": "MOMO-123"
    }
  ]
}
```

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
    "report_links": ["/reports/2026-02-17/z"]
  }
}
```

Print or store the `fiscal_number`, `auth_code`, and `qr_payload` exactly as returned—the device is the sole authority for those values. Do not proceed to print or re-transmit until VAT totals are confirmed by this response.

## Status endpoint

`GET /api/v1/plugin/invoices/{fiscal_number}/status`

Checks whether the invoice has been committed locally and whether KutaPay Cloud has synced it to the DGI. Useful for POS screens or auditors.

### Sample response

```json
{
  "status": "ok",
  "payload": {
    "fiscal_number": "KUTA-2026-000145",
    "device_id": "KUTA-OUTLET-005",
    "status": "synced",
    "synced_at": "2026-02-17T03:15:01Z",
    "last_error": null
  }
}
```

## Report retrieval

`GET /api/v1/plugin/reports?type=Z&since=2026-02-17&format=json`

Retrieves device-generated Z/X/A/audit reports without making the POS talk to the DGI directly. Use this for audit exports or when inspectors request proof of the ledger.

### Example

```http
GET /api/v1/plugin/reports?type=Z&since=2026-02-17&format=json HTTP/1.1
Authorization: Bearer eyJhbGci...
```

```json
{
  "status": "ok",
  "payload": [
    {
      "report_id": "RPT-Z-2026-02-17",
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

## Error handling

| Code | Meaning | Action |
| --- | --- | --- |
| `INVALID_CANONICAL_PAYLOAD` | Required field missing/order wrong | Show cashier the exact fields while prepping again |
| `DEVICE_BUSY` | DEF is processing another invoice | Retry after 100–200 ms |
| `DEVICE_UNREGISTERED` | Fiscal service no longer sees the outlet | Re-run `/init` and verify device connectivity |
| `RETRY_LATER` | Nonce pool empty or storage pressure | Respect `retry_after` and call `/init` when needed |
| `AUTH_FAILED` | Token expired/invalid | Rotate token before retry |
| `DUPLICATE_FISCAL_NUMBER` | Invoice already submitted | Inspect local journal—do not re-submit |

All error responses include `detail` (free text) and optional `retry_after`.

## Implementation notes

- Keep a local queue for offline submissions and replay them in FIFO order so arrivals respect the device's sequential counter.
- Always validate canonical payloads using strict parsers or schema validators—no string-building of JSON from user input (prevents injection-like mistakes).
- Log and surface `nonce` TTL to avoid expired nonces; re-call `/init` when TTL is in the last 10% of its lifetime.
- Surface `report_links` to dashboards so auditors can download the corresponding Z/X/A dumps alongside the invoice receipt.
- When the plugin receives a `synced` status, mark the invoice as fully complete and allow the cashier to close the transaction.

## See also

- `spec/design-pos-plugin-api-1.md` — formal specification that defines every request/response field.
