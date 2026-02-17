# Technical Context

## Stack decisions
- **Hardware:** USB Fiscal Memory device with a secure MCU, secure element (ATECC608/SE050 class), flash storage, RTC, USB-C interface, and status LED. Costs must stay within the $10–15 BOM target.
- **Software:** Untrusted POS clients (Odoo-inspired web/desktop) submit canonical JSON payloads to a local fiscal service that relays them to the trusted device; the cloud layer handles device registry, offline queueing, and upload to DGI.
- **Networking:** The device exposes a USB CDC interface for POS terminals and shares audit data with the cloud without ever speaking directly to DGI.

## Decided items
- Two-phase commit (PREPARE → COMMIT) ensures the device does not accept a payload until both POS and device agree, then responds with fiscal number, auth code, timestamp, and QR data.
- Canonical payloads require deterministic field ordering, include tax groups, client classification, and references to outlet/POS/cashier identifiers.
- The USB device owns sequential counters, hash-chained immutable logs, security elements (device ID, signature, timestamp, QR), and report generation.
- Offline-first behavior is mandatory: the device must fiscalize locally, queue receipts in the cloud, and support deferred uploads.

## Open questions
- DGI MCF/e-MCF API details: endpoints, authentication, request/response schema, and offline rules.
- Exact cryptographic signature algorithm, QR payload format, and counter formats the DGI accepts.
- Device registration/activation protocol with the DGI and provisioning/rotation of cryptographic keys.
- Multi-terminal orchestration for retail/restaurant scenarios—how local fiscal services coordinate multiple POS clients with one outlet device.
