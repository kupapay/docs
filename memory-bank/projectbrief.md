# Project Brief

## Mission
KutaPay builds the fiscal compliance infrastructure for the Democratic Republic of Congo by pairing untrusted POS software with a trusted USB Fiscal Memory device and cloud sync so that every commercial activity becomes a legally recognized tax event under the Facture Normalisée mandate.

## Problem
DRC businesses need sealed, signed invoices with sequential numbering, cryptographic authentication, and trusted timestamps, but traditional POS applications cannot satisfy the trust boundary or government-imposed audit trails on their own.

## Solution
The system combines POS terminals with a per-outlet USB Fiscal Memory device that validates canonical JSON payloads, increments monotonic counters, signs the invoice, stores it immutably, and returns the fiscal number plus security elements while the cloud layer syncs sealed invoices to the DGI.

## Success Criteria
- Every issued invoice carries a device-controlled fiscal number, device ID, signature, trusted timestamp, and verification QR code.
- All mandated invoice types (sale, advance, credit note, export invoice, export credit note) and reports (Z, X, A, audit export) can be produced from the immutable ledger.
- Offline-first issuance and deferred cloud/DGI sync work reliably, even when multiple POS terminals share one outlet-level device.
- The hardware stack stays within the $10–15 BOM target while enforcing two-phase commit and hash-chained logging.

## Constraints
- Trust boundary: the USB device is the sole authority for fiscalization and never talks directly to the DGI.
- Device per outlet, not per cashier; multi-terminal deployments share the same hardware over LAN.
- Canonical payloads, deterministic field ordering, and two-phase commit (PREPARE → COMMIT) are required for repeatable signatures.
- Nothing is deleted—voids/refunds are new fiscal events; draft cancellations happen before fiscalization.
