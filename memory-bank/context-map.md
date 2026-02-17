# Architecture Context Map

This map connects the memory bank to the rewritten architecture, platform, fiscal, cloud, and regulatory documentation so each file understands what it feeds and why it exists.

## 1. Architecture & Trust Boundary
- `spec/architecture-kutapay-system-1.md` now describes the cloud signing service trust boundary, canonical payloads, tax engine, and reports that the architecture pages follow.
- `design/docs/architecture/overview.md`, `trust-boundary.md`, `components.md`, and `data-flow.md` translate that spec into C4/context diagrams, trust boundary mermaids, component maps, and sequence diagrams anchored in the cloud-first story.
- `.github/copilot-instructions.md` reiterates the trust assumptions, security elements, and canonical payload requirements for AI agents.

## 2. Invoicing Platform
- `design/docs/platform/overview.md`, `platform/api.md`, `platform/dashboard.md`, `platform/sdk.md`, `platform/multi-user.md`, and `platform/integrations.md` explain the API-first product, dashboard UX (Odoo lessons applied), SDK ecosystem, and integration roadmaps built atop the architecture.
- `docs/odoo-pos-lessons-for-kutapay.md` supplies the UI/offline/mobile-money patterns that shaped the dashboard, multi-user, and integration pages.

## 3. Fiscal Engine
- `design/docs/fiscal/invoice-lifecycle.md`, `tax-engine.md`, `security-elements.md`, and `reports.md` describe the 6-step flow, 14 tax groups, HSM security elements, and report generation that originate from the architecture spec and the SFE regulatory requirements.
- `docs/sfe-specifications-v1-summary.md` ensures the regulatory expectations (invoice types, tax groups, client classification, security elements, reports, immutability) remain front-and-center.

## 4. Cloud & Sync
- `design/docs/cloud/architecture.md`, `offline-sync.md`, and `dgi-integration.md` detail the cloud signing service, offline queue lifecycle, and DGI sync agent that rely on the updated architecture spec and the pending `spec/infrastructure-dgi-integration-1.md`.
- `spec/design-cloud-api-1.md` and `design/docs/api/cloud.md` document the invoicing CRUD endpoints, while the sync agent design references the unresolved MCF/e-MCF API info flagged in this map.

## 5. Regulatory & API References
- `design/docs/regulatory/legal-framework.md`, `regulatory/arretes.md`, and `regulatory/sfe-specs.md` keep the legal context, phase labeling, and security element tables aligned with the cloud-first pivot.
- `design/docs/api/invoicing-sdk.md` and `design/docs/api/cloud.md` keep the API reference in sync with the platform pages and the new spec definitions.

## 6. ADRs & Decisions
- ADRs `adr-0003` through `adr-0005` recount the platform technology stack, cloud fiscal signing decision, and the strategic pivot. `adr/index.md` links to them without referencing archived hardware directories.

## 7. Archived Hardware & POS Reference
- `design/docs-archive/hardware/` preserves the USB Fiscal Memory, protocol, secure element, and BOM docs for Phase 3 compliance.
- `design/docs-archive/pos/` retains the original POS multi-terminal, UI/UX, and integration narratives as source material for the new platform/charts.

## 8. Memory Bank Entries
- `projectbrief.md` explains the mission/problem/solution for the cloud-first pivot.
- `productContext.md` captures why Bono Pay exists, the problems solved, target users, and UX goals drawn from Odoo lessons.
- `systemPatterns.md`, `techContext.md`, `activeContext.md`, `progress.md`, and this context map keep the ongoing status, stack choices, open unknowns, and documentation goals visible for every iteration.
