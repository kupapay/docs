# Architecture Decision Records

!!! info "The ADR process"
    Architectural Decision Records (ADRs) capture important design trade‑offs so the team can revisit the reasoning long after a decision is made.
    1. Draft the full record in `docs/adr/` with the canonical template (Context → Decision → Consequences → References).
    2. Mirror the narrative for readers in `design/docs/adr/` so the marketing/ops audience can navigate the approved choices.
    3. Link the ADR to the relevant design area (architecture, hardware, POS, etc.) and include status badges (`Accepted`, `Proposed`, `Superseded`).
    4. Raise a new ADR as soon as a decision affects the trust boundary, protocol, hardware, or regulatory compliance; reference the implementation plan task that triggered it.

## Current decisions

| ADR | Status | Summary | Source | Design doc |
| --- | --- | --- | --- | --- |
| [ADR-0001: Two-Phase Commit for USB Fiscal Device Protocol](adr-0001.md) | Accepted | Enforces the 2PC PREPARE → COMMIT handshake so fiscal numbers only exist once the trusted USB device signs and stores every invoice. | See `docs/adr/` in project root | `adr-0001.md` |
| ADR-0002: Signature Algorithm Selection | Proposed | Compare ECDSA P-256, Ed25519, and RSA-2048, balancing SE support, signature size, and verification performance. | Planned — see `docs/adr/` in project root | `adr-0002.md` (placeholder) |
| ADR-0003: POS Technology Stack | Proposed | Evaluate Flutter, React Native + native bridge, Electron + native Android, and other offline-ready stacks for the POS application. | Planned — see `docs/adr/` in project root | `adr-0003.md` (placeholder) |

Add new ADRs by copying this page, updating the table, and linking to the supporting docs. Keep the "Status" column in sync with the implementation plan so readers can trace acceptance and deployment milestones.
