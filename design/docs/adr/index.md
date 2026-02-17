# Architecture Decision Records

!!! info "The ADR process"
    Architectural Decision Records (ADRs) capture important design trade-offs so the team can revisit the reasoning long after a decision is made.
    1. Draft the full record in `docs/adr/` with the canonical template (Context → Decision → Consequences → References).
    2. Link the ADR to the relevant design area (architecture, cloud, fiscal, etc.) and include status badges (`Accepted`, `Proposed`, `Superseded`).
    3. Raise a new ADR as soon as a decision affects the trust boundary, protocol, signing infrastructure, or regulatory compliance; reference the implementation plan task that triggered it.

## Current decisions

| ADR | Status | Summary |
| --- | --- | --- |
| [ADR-0001: Two-Phase Commit](adr-0001.md) | Accepted | Enforces the 2PC PREPARE → COMMIT handshake for the USB Fiscal Memory device protocol. Relevant to Phase 3 (USB Hardware). |
| [ADR-0002: Signature Algorithm Selection](adr-0002.md) | Accepted | Adopts ECDSA P-256 for all invoice signatures — used by both the Cloud Signing Service (HSM) and the USB Fiscal Memory device (Phase 3). |
| [ADR-0003: Platform Technology Stack](adr-0003.md) | Accepted | Selects REST API + Web Dashboard + Client SDKs (JavaScript / Python) as the platform stack, replacing the original PWA + local fiscal daemon architecture. |
| [ADR-0004: Cloud Fiscal Signing (HSM)](adr-0004.md) | Accepted | Adopts an HSM-backed Cloud Signing Service as the primary fiscal authority for Phase 1+, with the USB Fiscal Memory device as an optional alternative signer in Phase 3. |
| [ADR-0005: Strategic Pivot — API-First](adr-0005.md) | Accepted | Documents the decision to pivot from POS-hardware-first to an API-first invoicing platform with phased hardware introduction. |

Add new ADRs by copying this page, updating the table, and linking to the supporting docs. Keep the "Status" column in sync with the implementation plan so readers can trace acceptance and deployment milestones.
