# DGI Integration

This page captures how the Bono Pay Cloud interfaces with the DGI control modules (MCF / e-MCF) and documents the known obligations versus the remaining unknowns uncovered during the integration spike (`spec/infrastructure-dgi-integration-1.md`).

## Overview

The DGI enforces a layered chain: the POS/SFE prepares invoices, the trusted DEF secures them, and the control modules (MCF / e-MCF) verify and relay fiscalized data to the DGI backend. Bono Pay Cloud is the synchronization agent: it queues sealed invoices when offline, uploads them to the MCF/e-MCF endpoint when connectivity returns, and stores the fiscal numbers, auth codes, and timestamps produced by those control modules. The infrastructure must be always-on, support fallback hardware, and present audit-ready logs at all times.

## Known constraints and responsibilities

- The MCF/e-MCF modules are the only entities authorized to produce the sequential fiscal number, authentication code, trusted timestamp, and QR payload that make an invoice legally valid.
- Every submission to the control modules must include the canonical payload plus device identifiers (DEF NID, outlet ID, cashier ID) so that the DGI can link the invoice to its originating outlet.
- Offline issuance is permitted, but the Cloud must replay queued invoices to the control modules as soon as connectivity is restored; regulators view uptime as mandatory and require replacement hardware ready if the primary link fails.
- The control modules enforce immutability, continuous compliance, and real-time VAT surveillance (per Arrêté 033), meaning the Cloud must log every retry, failure, and acknowledgement.
- Bono Pay Cloud is also responsible for device registry tasks such as storing activation codes, monitoring device health, and surfacing failure alerts to operators.

## Integration architecture

The following flow captures the responsibilities we control and the trust boundary between Bono Pay Cloud and DGI:

```mermaid
flowchart LR
  POS["POS / SFE"] -->|canonical payload| Cloud["Bono Pay Cloud\n(sync queue + registry)"]
  Cloud -->|sealed invoice + metadata| MCF["DGI MCF / e-MCF control modules"]
  MCF -->|security elements (fiscal number, auth code, timestamp)| Cloud
  MCF -->|delivery stream| DGI["DGI Backend\n(central tax authority)"]
  Cloud -->|fallback communication| Fallback["Replacement DEF\n(hardware backup)"]
  Fallback -->|same sync path| MCF
```

This diagram emphasizes that the Cloud never generates security elements—it relays them between the POS (or the local fiscal service) and the DGI control modules, while also coordinating fallback hardware when the primary DEF or network link fails.

## Unknowns (tracked as ??? admonitions)

??? warning "MCF/e-MCF API surface still unpublished"
    The research spike confirmed that the DGI has not released the endpoint URLs, transport protocol, or schema definitions for the control modules. Until those are published we cannot code the HTTP client or test payload validation.

??? warning "Authentication method for the control modules is undefined"
    We do not know whether the control modules require a DGI-issued certificate, bearer token, signed JWT, or another credential, nor how key rotation or revocation is handled.

??? warning "Offline behavior and retry rules are unspecified"
    The legislation insists every invoice must be reported, but the precise grace period, retry intervals, or thresholds that trigger manual intervention are unknown, so the sync engine must remain configurable until the DGI clarifies.

## Spike reference & next steps

Refer to `spec/infrastructure-dgi-integration-1.md` for the full list of known facts and open questions gathered during this research pass. Update that file (and this page) as soon as the DGI publishes more integration guidance so the Cloud sync agent and device registry can evolve from placeholders to production-ready connectors.
