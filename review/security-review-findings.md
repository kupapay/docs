# Security Review Findings

**Scope:** design/docs/hardware/*.md, design/docs/fiscal/*.md, spec/*.md, docs/adr/*.md (per Task‑037 instructions).

## Findings

### CRITICAL
- `spec/infrastructure-dgi-integration-1.md` flags that the MCF/e-MCF endpoints, authentication mechanism, request/response schema, offline/retry rules, and device registration flow are all *unknown*. Without these critical details we cannot guarantee that sealed invoices are submitted only to an authenticated DGI endpoint, that replay or spoofed uploads are rejected, or that error/inspection codes are handled consistently. Until the spike supplies concrete endpoint URLs, token formats, and rejection semantics, the DGI integration cannot be implemented securely and full compliance is at risk.

### IMPORTANT
- `spec/protocol-usb-fiscal-device-1.md` defines `CFG|INIT` as the activation command (`activation_code`, `public_key`) but never explains how the DEF verifies the activation payload’s authenticity. `design/docs/hardware/secure-element.md` states that DGI-signed activation data seeds the RNG, yet the protocol lacks any cryptographic validation step (signature checks, nonce replay protection, certificate verification). An attacker with USB access could re-run `CFG|INIT`, zeroize counters, or clone the device because the spec lets any host present an `activation_code`. The activation workflow must concretely describe how the device proves the activation token was issued by the DGI before accepting new keys.

### SUGGESTION
- `design/docs/fiscal/invoice-lifecycle.md` notes that the POS stores sealed invoices locally and the cloud queues them until the DGI upload completes, which is the correct offline behavior. Those queued artifacts include sensitive PII plus the DEF security elements (fiscal number, auth code, timestamp, QR payload), yet the docs do not mandate encryption-at-rest, key management, or retention policies for the offline queue. Consider adding guidance about encrypting queued invoices with the device’s public key, restricting access to the queue, and expiring stale entries so a compromised POS or queue server cannot leak the sealed payloads before they reach the tax authority.
