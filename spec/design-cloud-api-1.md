# Cloud API Specification — version 1

## Overview

Bono Pay Cloud presents the primary fiscal interface in Phase 1. Instead of relaying sealed invoices from a USB device, the Cloud API now accepts canonical invoices (from dashboards, API consumers, SDKs, or future POS integrations), applies the tax engine, and routes each payload through the Cloud Signing Service (HSM-backed) so that the fiscal number, authentication code, timestamp, and QR payload originate inside the trusted boundary. Every sealed response is persisted in the hash-chained Fiscal Ledger before the Sync Agent ships it to the DGI (MCF/e-MCF).

Clients receive a developer-friendly REST surface that mirrors the canonical payload defined in `spec/architecture-kutapay-system-1.md` and the 14 DGI tax groups.

## Authentication & Transport

- **HTTPS only**: All endpoints require TLS 1.3+.
- **API keys**: Merchants, outlets, and users operate with scoped API keys. Each request must send `Authorization: Bearer <token>` and include `X-BonoPay-Merchant-ID` and `X-BonoPay-Outlet-ID` when applicable so the Cloud can enforce per-tenant quotas and scoping.
- **Rate limiting**: The platform enforces short-term rate limits per outlet (e.g., 60 requests/min) and per API key token. Clients should honor `Retry-After` headers on `429` responses.
- **Traceability headers**: Optional `X-BonoPay-User-ID` or `X-BonoPay-Source` help auditors trace which user, SDK, or POS terminal originated an invoice.

## Canonical Invoice Payload

Invoices must use deterministic ordering to keep signatures reproducible. The JSON payload flowing into `POST /api/v1/invoices` must include:

1. `merchant_id` — Bono Pay merchant identifier (uuid or slug).
2. `outlet_id` — Outlet within the merchant namespace.
3. `pos_terminal_id` — Identifier of the terminal, SDK, or service creating the invoice.
4. `cashier_id` — Optional cashier/waiter identifier or session token.
5. `invoice_type` — Enum (`sale`, `advance`, `credit_note`, `export`, `export_credit`).
6. `timestamp` — ISO 8601 UTC string when the invoice was authored.
7. `client` — Object with `name`, `nif` (tax ID), `classification` (`Individual`, `Company`, `CommercialIndividual`, `Professional`, `Embassy`).
8. `items` — Array of items in the exact same field order every time (`code`, `description`, `quantity`, `unit_price`, `tax_group`, `taxable_unit`).
9. `tax_groups` — Array describing each of the 14 DGI tax groups present, including `code`, `name`, `rate`, `base_amount`, and `tax_amount`.
10. `totals` — Object with `subtotal`, `total_vat`, `total`, `currency`.
11. `payments` — Array of payment instruments with `method`, `amount`, `instrument_id`, `currency`.

All decimal values should be strings (fixed point) and follow the rounding rules documented in `spec/schema-tax-engine-1.md`. The Cloud API recalculates the tax summary server-side to guard against tampering and rejects invoices whose totals do not match the canonical breakdown.

## Endpoints

### Create & Fiscalize — `POST /api/v1/invoices`

**Purpose:** Fiscalize a new invoice and return the sealed response (fiscal number, signature, timestamp, QR payload) produced by the Cloud Signing Service.

**Request example:**

```json
{
  "merchant_id": "bonopay-ks-1",
  "outlet_id": "outlet-kin001",
  "pos_terminal_id": "sdk-js-01",
  "cashier_id": "cashier-13",
  "invoice_type": "sale",
  "timestamp": "2026-02-17T04:00:00Z",
  "client": {
    "name": "Acme Ltd",
    "nif": "123456789",
    "classification": "Company"
  },
  "items": [
    {
      "code": "CONS-001",
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
      "instrument_id": "MOMO-123",
      "currency": "CDF"
    }
  ]
}
```

**Response example:**

```json
{
  "status": "ok",
  "code": "INVOICE_FISCALIZED",
  "payload": {
    "fiscal_number": "BONO-2026-000458",
    "auth_code": "H8F2-A9D3-9001",
    "timestamp": "2026-02-17T04:00:02Z",
    "qr_payload": "https://bonopay.cdx/verify?fiscal_number=BONO-2026-000458",
    "fiscal_authority_id": "cloud-signer-west-1",
    "dgi_status": "queued",
    "ledger_hash": "e3b0c44298fc1c149afbf4c8996fb924"
  }
}
```

`dgi_status` tracks whether the Sync Agent has uploaded the invoice to the DGI (`queued`, `synced`, `failed`). The Cloud Signing Service is responsible for the five security elements (fiscal number, fiscal authority ID, authentication code, trusted timestamp, QR payload).

### Reconcile Locally-Sealed Invoices — `POST /api/v1/invoices/reconcile`

**Purpose:** Submit locally-sealed invoices (signed by the Fiscal Extension in Phase 1.5) for verification and appending to the Fiscal Ledger.

### Provision Delegated Credential — `POST /api/v1/credentials/provision`

**Purpose:** Request a short-lived Delegated Credential (Verifiable Credential) and a block of fiscal numbers for offline signing by the Fiscal Extension.

### Retrieve — `GET /api/v1/invoices/{fiscal_number}`

**Purpose:** Return the sealed invoice plus delivery metadata.

**Response example:**

```json
{
  "status": "ok",
  "code": "INVOICE_RETRIEVED",
  "payload": {
    "fiscal_number": "BONO-2026-000458",
    "merchant_id": "bonopay-ks-1",
    "outlet_id": "outlet-kin001",
    "client": { "name": "Acme Ltd", "nif": "123456789" },
    "items": [ ... ],
    "tax_groups": [ ... ],
    "security_elements": {
      "auth_code": "H8F2-A9D3-9001",
      "timestamp": "2026-02-17T04:00:02Z",
      "qr_payload": "https://bonopay.cdx/verify?fiscal_number=BONO-2026-000458",
      "fiscal_authority_id": "cloud-signer-west-1"
    },
    "dgi_status": "synced",
    "ledger_hash": "e3b0c44298fc1c149afbf4c8996fb924"
  }
}
```

### List — `GET /api/v1/invoices`

**Purpose:** Enumerate invoices with filters (`merchant_id`, `outlet_id`, date range, `client.nif`, `status`, `fiscal_number`). Supports pagination (`page`, `per_page`) and sorting by `timestamp` or `fiscal_number`.

### Void — `POST /api/v1/invoices/{fiscal_number}/void`

**Purpose:** Create a credit note fiscal event that references the original invoice.

**Request example:**

```json
{
  "reason": "Customer returned goods",
  "items": [
    {
      "code": "CONS-001",
      "quantity": 1,
      "tax_group": "TG03",
      "unit_price": "500.00"
    }
  ]
}
```

**Response:** same envelope as the creation endpoint but `code: INVOICE_VOIDED`. The Cloud Signing Service generates a new fiscal number and security elements for the credit note.

### Refund — `POST /api/v1/invoices/{fiscal_number}/refund`

**Purpose:** Issue a refund fiscal event that credits the payor while preserving audit trails.

**Request fields:** `amount`, `currency`, `payment_reference`, optional `reason`, and references to the original receipt.

### Reports — `POST /api/v1/reports`

**Purpose:** Generate Z/X/A/audit reports from the cloud fiscal ledger.

**Request example:**

```json
{
  "type": "Z",
  "outlet_id": "outlet-kin001",
  "date": "2026-02-17"
}
```

**Response:** Envelope contains `download_url`, `generated_at`, `report_id`, and `digest` of the included `ledger_hash`.

### Tax Groups — `GET /api/v1/tax-groups`

**Purpose:** Return the current manifest of the 14 DGI tax groups, their rates, and `effective_from` timestamps. Clients cache this manifest to calculate totals client-side before submission.

## Error handling

- `400 Bad Request` with `code: INVALID_CANONICAL_PAYLOAD` when required fields are missing or ordering deviates.
- `401 Unauthorized` when tokens are invalid or missing.
- `403 Forbidden` when the API key lacks scope for the requested outlet.
- `422 Unprocessable Entity` when tax sums do not match, when the Cloud Signing Service rejects the invoice, or when `invoice_type` is unsupported.
- `429 Too Many Requests` when rate limits are hit (observe `Retry-After`).
- `500 Internal Server Error` when the Cloud Signing Service or Sync Agent hits a transient failure; clients should retry with exponential backoff.

## Observability

Every request logs `merchant_id`, `outlet_id`, `fiscal_number` (when available), and `X-BonoPay-Source`. The platform emits metrics for `cloud.invoice.create`, `cloud.invoice.retry`, `cloud.report.request`, and `cloud.sync.queue` so SRE can trace the Cloud Signing Service throughput versus the Fiscal Ledger ingestion rate.
