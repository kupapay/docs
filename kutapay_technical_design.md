
# KutaPay Fiscal System — Technical Design Document (DRC)

## 1. Purpose
Define the architecture, requirements, assumptions, and implementation plan for a compliant fiscal invoicing system for the Democratic Republic of Congo using:
- SaaS SFE (invoicing system)
- USB Fiscal Memory device (DEF)
- DGI MCF/e-MCF integration

## 2. System Overview
KutaPay provides fiscal compliance infrastructure.  
Invoices are legally valid only when sealed by a trusted fiscal authority.

Architecture layers:
- POS/SaaS (untrusted)
- USB Fiscal Device (trusted)
- KutaPay Cloud
- DGI MCF backend

## 3. Roles
SFE:
- Creates invoice
- Sends canonical payload to device
- Prints receipt
- Uploads to DGI

USB Fiscal Device:
- Assigns sequential invoice number
- Applies timestamp
- Signs invoice
- Stores immutable log
- Generates Z/X reports

Cloud:
- Sync to DGI
- Queue offline invoices
- Device registry

## 4. Functional Requirements

### Invoice lifecycle
1. Create draft invoice
2. Confirm payment
3. Send payload to device
4. Device:
   - validate schema
   - increment counter
   - sign
   - store
5. Return:
   - fiscal number
   - auth code
   - timestamp
6. POS prints receipt
7. Cloud syncs to DGI

### Required invoice types
- Sale invoice
- Advance invoice
- Credit note
- Export invoice
- Export credit note

### Required reports
- Z report (daily)
- X report (periodic)
- Audit export

## 5. Security Elements
Each invoice must contain:
- fiscal number
- device ID
- signature
- timestamp
- QR code

## 6. Hardware Requirements

Device must:
- store keys securely
- maintain counter
- sign payload
- keep immutable log
- work offline
- support USB-C

### Proposed BOM
- Secure MCU
- Secure element
- Flash storage
- RTC
- USB-C interface
- LED
- 4-layer PCB

Target COGS: $10–15.

## 7. API Requirements (Unknowns to confirm)

### MCF API
Need:
- endpoint spec
- auth method
- request schema
- response schema
- offline rules

### Device protocol
Define:
- JSON payload format
- signature method
- counter format

## 8. Data Structures

### Canonical invoice payload
```
{
  invoice_id,
  merchant_nif,
  client,
  items[],
  totals,
  tax_groups[],
  timestamp
}
```

### Device response
```
{
 fiscal_number,
 device_id,
 signature,
 timestamp,
 status
}
```

## 9. Assumptions
- Hardware required for homologation
- One device per outlet
- POS uploads to DGI, not device
- Offline allowed
- No deletion allowed

## 10. Risks
- MCF API not finalized
- Security element format unknown
- Device certification requirements evolving

## 11. Implementation Plan

Phase 1:
- USB prototype
- minimal SFE
- API stub

Phase 2:
- pilot B2B
- homologation prep

Phase 3:
- full DGI integration
- scale

