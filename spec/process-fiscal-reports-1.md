---
title: "Fiscal Reports Specification v1"
version: 1.0
author: "KutaPay Architecture Team"
---

# Fiscal Reports Specification v1

## Overview

WHEN an invoice is fiscalized, THE SYSTEM SHALL be able to produce the mandated Z, X, and A reports plus the audit export so auditors and the DGI can reconcile every journal entry without reissuing or deleting invoices. The reports feed off the device’s hash-chained journal, include the device-generated security elements, and are available whether the POS is online or offline.

## Z Report — Daily Closure

- **Purpose:** Cut the day, reset the session counter, and prove totals per tax group while confirming there were no gaps in numbering.
- **Trigger:** At the end of a business day (or whenever the merchant requests a closure) AFTER the last `TXN|COMMIT` has succeeded for that day.
- **Content:**
  - `outlet_id`, `device_id`, `date`, `sequence_start`, `sequence_end`, `invoice_count`.
  - Per-tax-group totals (`tax_group`, `base_amount`, `tax_amount`, `total_amount`) covering all 14 DGI tax groups.
  - `grand_totals`: `subtotal`, `total_vat`, `total`, `currency`.
  - `operator_id`, `cashier_id`, `last_nonce`, `journal_hash`.
  - `security_elements`: `fiscal_number_range`, `auth_codes`, `timestamp`, `qr_payload` digest.
  - Z report metadata (generation timestamp, generated_by – device or POS service).

**Example Payload**
```json
{
  "type": "Z",
  "date": "2026-02-16",
  "outlet_id": "OUTLET-42",
  "device_id": "KUTA001",
  "sequence_start": 101,
  "sequence_end": 125,
  "invoice_count": 25,
  "tax_totals": [
    { "tax_group": "TG02", "base_amount": "15000.00", "tax_amount": "2400.00" },
    { "tax_group": "TG01", "base_amount": "500.00", "tax_amount": "0.00" }
  ],
  "grand_totals": { "subtotal": "15500.00", "total_vat": "2400.00", "total": "17900.00", "currency": "CDF" },
  "journal_hash": "3F9B-7A12-...",
  "generated_at": "2026-02-16T23:58:30Z"
}
```

## X Report — Periodic / Session Snapshot

- **Purpose:** Provide a mid-shift snapshot that lets operators and inspectors verify that the device is still accruing invoices in a consistent manner without waiting for a full day.
- **Trigger:** Configurable (e.g., hourly, per shift, manual request) and may be produced while the day is still active.
- **Content:**
  - `period_id` (session/shift name).
  - `sequence_start`, `sequence_end`, `invoice_count`.
  - `totals` per payment method (cash, mobile money, card) and per tax group summary.
  - `device_status`: memory usage, `free_nonce_pool`, `last_sync_timestamp`.
  - `warning_flags` if counters near limits or if `CLOCK_ROLLBACK_DETECTED`.

**Example Payload**
```json
{
  "type": "X",
  "period_id": "Shift-A-2026-02-16-08",
  "sequence_start": 101,
  "sequence_end": 110,
  "invoice_count": 10,
  "totals": {
    "cash": { "subtotal": "4800.00", "tax": "768.00", "total": "5568.00" },
    "mobile_money": { "subtotal": "2200.00", "tax": "352.00", "total": "2552.00" }
  },
  "device_status": {
    "firmware_version": "2026.02.16",
    "free_memory_bytes": 512000,
    "next_invoice_seq": 111
  },
  "generated_at": "2026-02-16T13:00:00Z"
}
```

## A Report — Article-Level Detail

- **Purpose:** Feed auditors with every invoice line item including tax group, client classification, and references to the originating invoice.
- **Trigger:** On demand for audits, or automatically when requested by the DGI (per audit export).
- **Content:**
  - `article_id`, `description`, `quantity`, `unit_price`, `line_total`, `tax_group`, `tax_rate`, `tax_amount`.
  - `invoice_ref`: invoice number, `device_id`, `fiscal_number`, `timestamp`.
  - `client_classification`, `client_registration`, `operator_id`.
  - `reporting_period`: date range, `sequence_start`, `sequence_end`.

**Example Entry**
```json
{
  "article_id": "PROD-301",
  "invoice_ref": "KUTA001-110",
  "description": "Wholesale service plan",
  "quantity": 1,
  "unit_price": "10000.00",
  "line_total": "10000.00",
  "tax_group": "TG03",
  "tax_rate": "0.16",
  "tax_amount": "1600.00",
  "client_classification": "Company",
  "generated_at": "2026-02-16T13:05:32Z"
}
```

## Audit Export — Full Journal Dump

- **Purpose:** Deliver the full append-only journal (sales, voids, refunds, resets) to DGI for deep reconciliation or historical auditing.
- **Trigger:** Scheduled (monthly/annual) or on-demand when DGI requests a bulk export.
- **Content:**
  - Streamed chunks (`chunk_index`, `chunk_count`) with each `log_entry`.
  - Each entry contains `record_type`, `sequence`, `timestamp`, `merchant_nif`, `client_registration`, `totals`, `tax_breakdown`, `prev_hash`, `signature`, `canonical_payload_hash`.
  - Include `report_generated_at`, `device_id`, `journal_hash` for verification.
  - Chunks require acknowledgment before the next is transmitted to prevent data loss.

**Chunk Sample**
```json
{
  "type": "AUDIT_EXPORT",
  "chunk_index": 2,
  "chunk_count": 5,
  "device_id": "KUTA001",
  "entries": [
    {
      "sequence": 109,
      "record_type": "sale",
      "timestamp": "2026-02-16T12:54:17Z",
      "total": "116.00",
      "tax_breakdown": [{ "tax_group": "TG02", "tax_amount": "16.00" }],
      "prev_hash": "A4B2",
      "signature": "ABCD1234EFGH",
      "canonical_payload_hash": "8F3C"
    }
  ],
  "generated_at": "2026-02-16T23:59:50Z"
}
```

## Report Generation Flow

1. `TXN|COMMIT` entries append to the hash-chained journal with required security elements.
2. Periodic scheduler (device or cloud sync agent) samples the journal and produces Z/X/A records. Z reports roll daily, X reports roll on demand, A reports can stream their lines.
3. Audit export reads every log entry in sequence order, attaches `prev_hash` and `signature`, and streams chunks to prevent timeouts.
4. Reports include the canonical security elements (device ID, fiscal number ranges, auth codes) so the DGI can verify without contacting the POS.
5. All reports are signed by the device or the cloud service that gathered the journal; offline generation may be cached until connectivity returns.
