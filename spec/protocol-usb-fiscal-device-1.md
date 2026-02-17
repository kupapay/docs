---
title: "USB Fiscal Device Protocol Specification v1"
version: 1.0
author: "Bono Pay Architecture Team"
---

# USB Fiscal Device Protocol Specification v1

## Phase 3: USB Hardware Protocol

This specification applies when the USB Fiscal Memory device is deployed. Phase 1 and Phase 2 clients rely on the cloud fiscal ledger, but the USB device resumes the trusted signing role for DEF-certified outlets while still syncing back to Bono Pay Cloud.

## Scope
This document defines the USB CDC protocol that mediates every fiscal operation between the **untrusted POS/fiscal service** cluster and the **trusted USB Fiscal Memory device (DEF)**. All commands use deterministic framing, canonical JSON payloads, nonce-based two-phase commit, and the immutable journal described in [ADR-0001](../../docs/adr/adr-0001-two-phase-commit-usb-protocol.md).

## Framing and Transport
- **Transport**: USB CDC (virtual COM port).
- **Frame wrapper**: Each command is wrapped between **STX (0x02)** and **ETX (0x03)** with an optional LRC/CRC32 checksum appended before ETX for easier validation.
- **Structure**: `STX <ASCII command> [payload] ETX`. Payloads are UTF-8 encoded JSON with no trailing whitespace.
- **Line endings**: Commands may include `\r\n` for readability, but parties must ignore them when parsing.
- **Timeouts**: The host expects a response within **5 seconds** for PREPARE/COMMIT (latency <1 second typical). QRY/RPT/ADM/CFG responses may take longer (up to 10 seconds) and should stream incremental progress if the device needs extra time.
- **Retries**: Hosts must re-issue PREPARE when the device responds with errors or the nonce expires. All other commands must be retried judiciously (see per-command rules).

## Canonical Invoice Payload
Deterministic payloads prevent nonce replays, guarantee reproducible hashes, and keep signatures auditable. The JSON fields **must appear in this exact order**:

1. `"merchant_nif"` — string (DRC tax identification number).
2. `"outlet_id"` — string (outlet-level identifier that ties to the DEF).
3. `"pos_terminal_id"` — string (terminal generating the request).
4. `"cashier_id"` — string (cashier or waiter initiating the sale).
5. `"invoice_type"` — enum (`"sale"`, `"advance"`, `"credit_note"`, `"export"`, `"export_credit"`).
6. `"timestamp"` — ISO 8601 string (device-synchronized).
7. `"client"` — object with:
   - `"registration"`: string (client tax ID or passport).
   - `"classification"`: one of `Individual`, `Company`, `CommercialIndividual`, `Professional`, `Embassy`.
8. `"items"` — array of objects with fixed-order fields:
   - `"code"`, `"description"`, `"quantity"`, `"unit_price"`, `"tax_group"`, `"taxable_unit"`.
9. `"tax_groups"` — array with each object containing `code`, `name`, `rate`, `base_amount`, `tax_amount`.
10. `"totals"` — object with fields `subtotal`, `total_vat`, `total`, `currency`.
11. `"payments"` — array describing each payment instrument (`method`, `amount`, `instrument_id`).

Additional canonical rules:
* **Decimals**: Use fixed-point strings (e.g., `"116.00"`) rounded per DGI rounding rules.
* **VAT normalization**: Tax rates appear as decimals (e.g., `"0.16"`) and use the same number of decimals for all groups.
* **Stable items**: Items must use the same keys and ordering so hashing is reproducible.

## Shared Error Codes
Errors are returned as JSON with `{"status":"ERR","code":"<CODE>","detail":"..."}`. Common codes:

| Code | Meaning |
| --- | --- |
| `SCHEMA_INVALID` | Required field missing, malformed JSON, or order deviation. |
| `DEVICE_REVOKED` | DEF is blacklisted or flagged by tax authority. |
| `STORAGE_FULL` | Flash journal is full; requires administrative intervention. |
| `CLOCK_ROLLBACK_DETECTED` | Device RTC moved backward; reject until clock sync. |
| `INVALID_NONCE` | COMMIT nonce mismatch or expired. |
| `NONCE_EXPIRED` | POS refused to send COMMIT within nonce TTL. |
| `REPLAY_DETECTED` | Same payload/hash already processed. |
| `DEVICE_BUSY` | Device is processing another request; retry after 100–200 ms. |
| `UNAUTHORIZED` | Missing or invalid administrative credentials. |

## Command Definitions

### TXN|PREPARE
* **Request**: `STX TXN|PREPARE <CR><LF> <canonical invoice JSON> ETX`
* **Purpose**: Validate schema/policy without altering counters, and return nonce.
* **Response**:
  ```json
  {
    "status": "OK",
    "nonce": "A7F2D1",
    "expires_in": 7,
    "message": "ready to commit"
  }
  ```
* **Errors**: `SCHEMA_INVALID`, `DEVICE_REVOKED`, `STORAGE_FULL`, `CLOCK_ROLLBACK_DETECTED`, `REPLAY_DETECTED`, `DEVICE_BUSY`.
* **Timeouts**: 5 seconds. Retry after nonce expires or on recoverable errors.
* **Example**: After sending canonical invoice payload with `invoice_type: "sale"`, the device replies as above with `nonce`.

### TXN|COMMIT
* **Request**: `STX TXN|COMMIT <CR><LF>{ "nonce": "A7F2D1" } ETX`
* **Purpose**: Atomically increment the counter, append journal entry, sign, and return fiscal response.
* **Response**:
  ```json
  {
  "status": "OK",
  "invoice_seq": 105,
  "auth_code": "ABCD1234EFGH5678",
  "device_id": "BONO-USB-001",
  "timestamp": "2026-02-04T10:15:30",
  "qr_payload": "BONO-USB-001|105|ABCD1234..."
  }
  ```
* **Errors**: `INVALID_NONCE`, `NONCE_EXPIRED`, `DEVICE_BUSY`, `DEVICE_REVOKED`, `STORAGE_FULL`, `CLOCK_ROLLBACK_DETECTED`.
* **Timeouts**: 5 seconds. If power-loss occurs during COMMIT, either no invoice exists or COMMIT completed; POS should query via `QRY|STATUS`/`QRY|LOG`.

### QRY|STATUS
* **Request**: `STX QRY|STATUS ETX`
* **Purpose**: Inspect device health before issuing invoices or after error recovery.
* **Response**:
  ```json
  {
    "status": "OK",
    "firmware_version": "2026.02.17",
    "device_id": "BONO-USB-001",
    "next_invoice_seq": 106,
    "free_memory_bytes": 655360,
    "last_sync_timestamp": "2026-02-04T10:15:30",
    "nonce_pool": 2
  }
  ```
* **Timeouts**: 2 seconds. Repeat every 30 seconds in polling mode.

### QRY|LOG <sequence>
* **Request**: `STX QRY|LOG 105 ETX`
* **Purpose**: Retrieve a journal entry for audits, reprints, or recovery after POS crash.
* **Response**:
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
* **Journal schema**: Each entry stores `record_type`, `sequence`, `timestamp`, `totals`, `buyer_id`, `tax_breakdown`, `prev_hash`, and `signature`. The `prev_hash` links to the prior entry to create a hash chain (see DISCUSSION.md Section 11).

### RPT|Z
* **Request**: `STX RPT|Z {"date":"2026-02-04"} ETX`
* **Purpose**: Produce daily closure containing totals per tax group.
* **Response**:
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

### RPT|X
* **Request**: `STX RPT|X {"period":"session"} ETX`
* **Purpose**: Periodic snapshot (e.g., every hour) of fiscal activity.
* **Response**:
  ```json
  {
    "status": "OK",
    "period": "session",
    "transaction_count": 40,
    "totals": { "total": "4640.00", "vat": "640.00" }
  }
  ```

### RPT|A
* **Request**: `STX RPT|A {"since":"2026-02-01","until":"2026-02-04"} ETX`
* **Purpose**: Article-level detail for auditors.
* **Response**:
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

### ADM|DUMPLOG
* **Request**: `STX ADM|DUMPLOG {"format":"json"} ETX`
* **Purpose**: Export entire journal or digest for audit teams.
* **Response**: Streamed array of log entries or digest objects with `status`, `chunk_index`, and `records`. Large dumps are chunked; host acknowledges each chunk before requesting the next.

### ADM|RESET
* **Request**: `STX ADM|RESET {"dgi_authorization":"<signed token>"} ETX`
* **Purpose**: Reset counters under DGI supervision after storage rollover.
* **Response**:
  ```json
  {
    "status": "OK",
    "message": "Counters reset to zero",
    "device_id": "BONO-USB-001"
  }
  ```
* **Security**: Only a DGI-signed token opens this command; otherwise return `UNAUTHORIZED`.

### CFG|TIME
* **Request**: `STX CFG|TIME {"timestamp":"2026-02-04T10:00:00","signature":"<SE signature>"} ETX`
* **Purpose**: Sync or verify the DEF RTC.
* **Response**:
  ```json
  { "status": "OK", "timestamp": "2026-02-04T10:00:00" }
  ```
* **Details**: The signature binds the new time to the secure element to prevent rollback attacks.

### CFG|INIT
* **Request**: `STX CFG|INIT {"activation_code":"<DGI issued code>","public_key":"<PEM>"} ETX`
* **Purpose**: Provision a new device with cryptographic identity and register it with DGI.
* **Response**:
  ```json
  { "status": "OK", "device_id": "BONO-USB-001", "fiscal_number_prefix": "BONO" }
  ```

## Examples and Sequence
1. **Happy path**: Host sends `TXN|PREPARE` with canonical payload, receives nonce, sends `TXN|COMMIT`, and prints receipt with `invoice_seq`, `auth_code`, `device_id`, `timestamp`, and QR.
2. **Error path**: On `SCHEMA_INVALID`, device returns `ERR`, POS alerts cashier, and re-prepares.
3. **Power loss**: If COMMIT fails mid-write, POS reads `QRY|STATUS` + `QRY|LOG` to reconcile before re-issuing.

