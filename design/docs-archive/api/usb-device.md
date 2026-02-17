# USB Fiscal Device API Reference

## Overview

This page documents every USB CDC command that untrusted POS terminals and the local fiscal service use to interact with the **trusted USB Fiscal Memory device (DEF)**. Each command follows the STX/ETX framing described below, and every fiscal request must reuse the canonical invoice payload order so that the device’s JSON hashes, nonce calculations, and signatures remain reproducible.

## Framing & Transport

- **Transport**: USB CDC exposes a virtual COM port between the POS/fiscal service and the DEF.
- **Frame structure**: `STX <ASCII command> [payload] ETX`; payloads are UTF-8 encoded JSON with no trailing whitespace, and optional `\r\n` is ignored.
- **Checksum**: Commands may append an LRC or CRC32 before the closing `ETX` for quicker validation.
- **Timeouts**: Core transactional commands (`PREPARE`, `COMMIT`) must be answered in ≤5 seconds (typically <1 second). Commands that produce reports or diagnostics may take up to 10 seconds and should stream progress if processing is lengthy.
- **Retries**: On nonce expiry or recoverable errors, hosts should re-send the `PREPARE` request. Other commands should be retried conservatively while paying attention to `DEVICE_BUSY` responses.

## Canonical Invoice Payload

| Field | Description |
| --- | --- |
| `merchant_nif` | DRC tax identification number |
| `outlet_id` | Outlet-level identifier that maps to the DEF |
| `pos_terminal_id` | Terminal issuing the request |
| `cashier_id` | Cashier or waiter initiating the invoice |
| `invoice_type` | One of `sale`, `advance`, `credit_note`, `export`, `export_credit` |
| `timestamp` | ISO 8601 string sourced from the DEF RTC |
| `client.registration` | Client tax ID or passport |
| `client.classification` | `Individual`, `Company`, `CommercialIndividual`, `Professional`, or `Embassy` |
| `items` | Array of objects with `code`, `description`, `quantity`, `unit_price`, `tax_group`, `taxable_unit` |
| `tax_groups` | Array with `code`, `name`, `rate`, `base_amount`, `tax_amount` |
| `totals` | Object containing `subtotal`, `total_vat`, `total`, `currency` |
| `payments` | Array describing each payment instrument (`method`, `amount`, `instrument_id`) |

!!! caution
    The device rejects canonical payloads if any field is missing, misordered, or misformatted. Validate the JSON ordering and decimal formatting (`"116.00"` style with DGI rounding rules) before sending `TXN|PREPARE`.

## Shared Error Codes

| Code | Meaning |
| --- | --- |
| `SCHEMA_INVALID` | Required field missing, malformed JSON, or order deviation |
| `DEVICE_REVOKED` | DEF blacklisted by the tax authority |
| `STORAGE_FULL` | Flash journal cannot accept more entries |
| `CLOCK_ROLLBACK_DETECTED` | Device RTC moved backward |
| `INVALID_NONCE` | COMMIT nonce mismatch |
| `NONCE_EXPIRED` | COMMIT not received before nonce TTL |
| `REPLAY_DETECTED` | Invoice hash already processed |
| `DEVICE_BUSY` | Device is processing another operation |
| `UNAUTHORIZED` | Administrative credentials missing or invalid |

Use these codes in every command response. Always surface the `detail` text to the POS UI so cashiers and operators understand the remediation steps.

---

## TXN|PREPARE

**Synopsis:** Validate the canonical invoice payload, ensure it complies with schema and policy, and return a nonce before the device mutates any counters.

**Request**

```
STX TXN|PREPARE
{
  "merchant_nif": "123456789",
  "outlet_id": "KUTA-OUTLET-01",
  "pos_terminal_id": "POS-02",
  "cashier_id": "CASH-17",
  "invoice_type": "sale",
  "timestamp": "2026-02-04T10:15:27",
  "client": {
    "registration": "XYZ123",
    "classification": "Company"
  },
  "items": [
    {
      "code": "ITEM-001",
      "description": "Service Plan",
      "quantity": "2",
      "unit_price": "500.00",
      "tax_group": "standard_vat",
      "taxable_unit": "2"
    }
  ],
  "tax_groups": [
    { "code": "standard_vat", "name": "Standard VAT", "rate": "0.16", "base_amount": "1000.00", "tax_amount": "160.00" }
  ],
  "totals": { "subtotal": "1000.00", "total_vat": "160.00", "total": "1160.00", "currency": "CDF" },
  "payments": [
    { "method": "cash", "amount": "1160.00", "instrument_id": "CASH-1" }
  ]
}
ETX
```

**Response**

```json
{
  "status": "OK",
  "nonce": "A7F2D1",
  "expires_in": 7,
  "message": "ready to commit"
}
```

**Errors:** `SCHEMA_INVALID`, `DEVICE_REVOKED`, `STORAGE_FULL`, `CLOCK_ROLLBACK_DETECTED`, `REPLAY_DETECTED`, `DEVICE_BUSY`

**Notes**

- Timeout: ≤5 seconds. Retry `TXN|PREPARE` if the nonce expires or recoverable error occurs.
- Do **not** send any data other than the canonical invoice.
- Use `expires_in` to start a timer—POS must send `TXN|COMMIT` before the nonce expires.

---

## TXN|COMMIT

**Synopsis:** Atomically persist the invoice by incrementing the counter, hashing the payload, signing the journal entry, and returning the fiscal elements to print on the receipt.

**Request**

```
STX TXN|COMMIT
{ "nonce": "A7F2D1" }
ETX
```

**Response**

```json
{
  "status": "OK",
  "invoice_seq": 105,
  "auth_code": "ABCD1234EFGH5678",
  "device_id": "KUTA001",
  "timestamp": "2026-02-04T10:15:30",
  "qr_payload": "KUTA001|105|ABCD1234..."
}
```

**Errors:** `INVALID_NONCE`, `NONCE_EXPIRED`, `DEVICE_BUSY`, `DEVICE_REVOKED`, `STORAGE_FULL`, `CLOCK_ROLLBACK_DETECTED`

**Notes**

- Timeout: ≤5 seconds. The device either completes the invoice or leaves state unchanged; query `QRY|STATUS`/`QRY|LOG` if power loss occurs mid-commit.
- The response provides every mandatory security element for the receipt (fiscal number, auth code, device ID, timestamp, QR data).
- Do not send a new `PREPARE` until `TXN|COMMIT` succeeds or returns an error that has been resolved.

---

## QRY|STATUS

**Synopsis:** Check device health and readiness before issuing invoices or after recovery from errors.

**Request**

```
STX QRY|STATUS ETX
```

**Response**

```json
{
  "status": "OK",
  "firmware_version": "2026.02.17",
  "device_id": "KUTA001",
  "next_invoice_seq": 106,
  "free_memory_bytes": 655360,
  "last_sync_timestamp": "2026-02-04T10:15:30",
  "nonce_pool": 2
}
```

**Errors:** `DEVICE_REVOKED`, `DEVICE_BUSY`, `STORAGE_FULL`

**Notes**

- Poll every 30 seconds in low-volume setups to keep UI responsive.
- `nonce_pool` shows how many PREPARE operations can be outstanding before the device refuses new requests.
- Use before issuing `TXN|PREPARE` to ensure counters align with the POS state.

---

## QRY|LOG <sequence>

**Synopsis:** Fetch a specific journal entry for audits, reprints, or recovery after a POS crash.

**Request**

```
STX QRY|LOG 105 ETX
```

**Response**

```json
{
  "status": "OK",
  "log_entry": {
    "record_type": "sale",
    "sequence": 105,
    "timestamp": "2026-02-04T10:15:30",
    "merchant_nif": "123456789",
    "client_registration": "XYZ123",
    "total": "116.00",
    "vat_total": "16.00",
    "prev_hash": "7F3B",
    "signature": "ABCD1234..."
  }
}
```

**Errors:** `DEVICE_BUSY`, `LOG_NOT_FOUND`, `DEVICE_REVOKED`

**Notes**

- Entries include `prev_hash` to form the immutable hash chain; verifying the chain is the audit path.
- Use this command after ambiguous commits to confirm whether the invoice was written.
- The device may throttle repeated `QRY|LOG` requests—space out retries if `DEVICE_BUSY` is returned.

---

## RPT|Z

**Synopsis:** Produce the daily closure report with totals per tax group for auditing.

**Request**

```
STX RPT|Z {"date":"2026-02-04"} ETX
```

**Response**

```json
{
  "status": "OK",
  "period": "2026-02-04",
  "sequence_start": 1,
  "sequence_end": 120,
  "totals": [
    { "tax_group": "standard_vat", "base": "100.00", "vat": "16.00" }
  ]
}
```

**Errors:** `DEVICE_BUSY`, `UNAUTHORIZED`, `STORAGE_FULL`

**Notes**

- Typically executed at end of business day; device ensures sequence continuity.
- Include this report in the daily closure package for DGI compliance.
- The payload echoes totals per tax group; ensure the host stores a local copy.

---

## RPT|X

**Synopsis:** Emit an intra-day snapshot (session) of fiscal activity for monitoring or troubleshooting.

**Request**

```
STX RPT|X {"period":"session"} ETX
```

**Response**

```json
{
  "status": "OK",
  "period": "session",
  "transaction_count": 40,
  "totals": { "total": "4640.00", "vat": "640.00" }
}
```

**Errors:** `DEVICE_BUSY`, `UNAUTHORIZED`, `STORAGE_FULL`

**Notes**

- Use this report to reconcile mid-shift activity or troubleshoot high-volume lanes.
- The device may limit how frequently X reports are generated to avoid overloading flash.
- `transaction_count` helps detect missed invoices.

---

## RPT|A

**Synopsis:** Deliver article-level detail covering every sold item between two timestamps.

**Request**

```
STX RPT|A {"since":"2026-02-01","until":"2026-02-04"} ETX
```

**Response**

```json
{
  "status": "OK",
  "articles": [
    {
      "code": "ITEM-001",
      "description": "Service Plan",
      "quantity": 2,
      "tax_group": "standard_vat",
      "amount": "2320.00"
    }
  ]
}
```

**Errors:** `DEVICE_BUSY`, `UNAUTHORIZED`, `STORAGE_FULL`

**Notes**

- Supports auditors who need per-article breakdowns.
- The `since/until` window must be within the journal retention window.
- The device streams data if the article list is long; acknowledge each chunk before requesting another.

---

## ADM|DUMPLOG

**Synopsis:** Export a full journal dump or digest for auditors or off-device reprocessing.

**Request**

```
STX ADM|DUMPLOG {"format":"json"} ETX
```

**Response**

> The device streams chunks of log entries or digests. Each chunk includes `status`, `chunk_index`, and a `records` array. The host must acknowledge each chunk before the next one is released.

**Errors:** `UNAUTHORIZED`, `STORAGE_FULL`, `DEVICE_BUSY`

**Notes**

- Use only under audit or support scenarios due to the volume of data.
- Respect the chunk handshake; failing to ack halts the stream.
- Consider encrypting the exported dump when transmitting outside the local network.

---

## ADM|RESET

**Synopsis:** Reset counters under DGI supervision after storage rollover while preserving the device identity.

**Request**

```
STX ADM|RESET {"dgi_authorization":"<signed token>"} ETX
```

**Response**

```json
{
  "status": "OK",
  "message": "Counters reset to zero",
  "device_id": "KUTA001"
}
```

**Errors:** `UNAUTHORIZED`, `DEVICE_REVOKED`, `STORAGE_FULL`

**Notes**

- Requires a DGI-signed activation token. Do not expose this command to general POS operators.
- The device keeps the same `device_id` so downstream systems can re-sync after the reset.
- After reset, re-run `CFG|INIT` if a new registration process is needed.

---

## CFG|TIME

**Synopsis:** Synchronize or verify the DEF RTC while preventing rollback attacks.

**Request**

```
STX CFG|TIME {"timestamp":"2026-02-04T10:00:00","signature":"<SE signature>"} ETX
```

**Response**

```json
{ "status": "OK", "timestamp": "2026-02-04T10:00:00" }
```

**Errors:** `CLOCK_ROLLBACK_DETECTED`, `UNAUTHORIZED`

**Notes**

- The signature binds the timestamp to the secure element to guard against rollback.
- Only authorized administrators or the official time sync service should invoke this command.
- The device rejects timestamps earlier than the current RTC value.

---

## CFG|INIT

**Synopsis:** Provision a new DEF with cryptographic identity and register it with the DGI.

**Request**

```
STX CFG|INIT {"activation_code":"<DGI issued code>","public_key":"<PEM>"} ETX
```

**Response**

```json
{ "status": "OK", "device_id": "KUTA001", "fiscal_number_prefix": "KUTA" }
```

**Errors:** `UNAUTHORIZED`, `DEVICE_REVOKED`

**Notes**

- Typically executed once per outlet during deployment.
- Record the `fiscal_number_prefix` so POS systems can format invoice numbers consistently.
- The `public_key` lets DGI verify future signed payloads; store it securely in the cloud registry.
