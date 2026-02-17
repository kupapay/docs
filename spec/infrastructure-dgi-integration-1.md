---
title: "DGI Integration Spike"
version: 1.0
author: "Bono Pay Research Team"
---

# DGI MCF/e-MCF Integration Spike

**Objective:** Summarize what we know (from regulation and internal design records) about the DGI MCF/e-MCF control modules and catalog the remaining unknowns that block implementation of the synchronization layer.

## Sources

- `docs/sfe-specifications-v1-summary.md`
- `docs/arrete-033-summary.md`
- `kutapay_technical_design.md` (Section 7: API requirements)

## Known

1. The DGI enforces a layered architecture: the enterprise billing system (Bono Pay Cloud SFE) → the Cloud Signing Service (HSM) → the MCF/e-MCF control modules → the DGI backend. The SFE cannot issue invoices without the security elements produced by those trusted services.
2. The MCF/e-MCF modules are the government’s real-time control layer: they validate sealed invoices that carry the fiscal number/auth code/timestamp/QR emitted by the Cloud Signing Service and relay them to the central DGI systems. Bono Pay Cloud must act as the bridge between dashboards, SDKs, POS vendors, and these control modules.
3. Arrêté 033 doubles down on the requirement with two parallel enforcement paths (software SFE + MCF or DEF + MCF) and mandates fallback options, continuous transmission to the tax authority, and immediate reporting of failures. Offline issuance is allowed but must be followed by an eventual sync with the control modules.
4. Every transaction must be traceable, immutable, and tied to identifiers that the Cloud Signing Service publishes (`merchant_id`, `outlet_id`, `pos_terminal_id`, `fiscal_authority_id`). The control modules enforce this by requiring SEC-equivalent signatures and ledger hashes on each invoice before it is deemed valid.
5. The MCF/e-MCF integration is the gating factor for homologation—the platform must queue and upload invoices when connectivity returns, keep retries observable via dashboards/webhooks, and surface DGI-issued security metadata to inspectors/customers.

## Unknown

1. **Endpoint specification:** The public documents do not disclose the actual URLs, verbs, or message envelopes that the MCF/e-MCF modules expose. We do not know whether the channel is REST, gRPC, or another protocol, nor how the DEF identifier is bound to the session.
2. **Authentication & authorization:** The required credentials or signed tokens for the MCF/e-MCF API are absent. It is unknown whether we must present a DGI-issued certificate, HMAC, JWT, or another bearer token and how keys are rotated.
3. **Request/response schema:** The exact fields, formats, and validation rules that the control modules expect when receiving a sealed invoice (or returning acknowledgments) remain unspecified. The appropriate envelope for `fiscal_number`, `auth_code`, timestamps, and hash chains is unclear.
4. **Offline and retry rules:** The DGI documents mention no excuses for downtime but do not define how long the SFE may queue invoices offline, what constitutes a successful retransmission, or when to trigger a forced rollback or human intervention.
5. **Error handling and reporting:** It is unclear which error codes (e.g., REJECTED, RATE_LIMITED) the control modules emit, how to surface them to operators, and whether the MCF/e-MCF modules will support chunked or batched uploads.
6. **Device registration/activation flow:** The integration plan references device activation and DGI-issued keys, but the protocol for registering a new device, receiving fiscal prefixes, and reactivating a replacement device is not defined in the publicly available materials.

## Next Steps

1. Engage with the DGI (or approved integrator) to obtain the precise MCF/e-MCF API documentation. Emphasize endpoint URLs, authentication method, schema, and allowed offline behavior.
2. Review any future arrêtés or regulatory addenda to capture the error codes and required logging/audit behavior that the control modules expect.
3. Design the Bono Pay Cloud sync agent to treat this spike as a living document: update `design/docs/cloud/dgi-integration.md` when the API details arrive and keep the unknown section flagged with `???` admonitions.
