# Architecture Context Map

This map connects every architecture-oriented document in KutaPay’s repository to the design section it informs, highlights dependencies that are already satisfied, and flags the gaps we still need to close. Think of it as the “project-wide table of contents” for designers, reviewers, and regulators.

## 1. Architecture & Trust Boundary

- **`spec/architecture-kutapay-system-1.md`** — EARS requirements covering the trust boundary, invoice lifecycle, offline-first rules, reports, and the USB two-phase commit protocol. It is the single source feeding `design/docs/architecture/*`.
- **`design/docs/architecture/overview.md`**, **`trust-boundary.md`**, **`components.md`**, and **`data-flow.md`** — MkDocs pages that translate the spec into C4/context diagrams, trust-boundary warnings (admonitions), component maps, and multiple mermaid flows. They rely directly on the spec plus the higher-level narrative in `kutapay_technical_design.md`.
- **`kutapay_technical_design.md`** — primary narrative foundation (purpose, roles, functional requirements, hardware, API unknowns, data models, assumptions, risks). Its sections (Invoice lifecycle, hardware requirements, API open questions) explain *why* the architecture pages exist.
- **`DISCUSSION.md`** — deep dives (e.g., sections around lines 5690-5740 for the 2PC rationale, 6960-7050 for hardware/system overview, 7285-7400 for secure element decisions, 6975-7030 for POS/general features) supply detailed failure modes, regulator intent, and comparative industry context.
- **`memory-bank/systemPatterns.md`** and **`.github/copilot-instructions.md`** reiterate the trust-boundary rules, offline-first mandate, security elements, multi-terminal per-outlet requirement, and open unknowns (MCF API, key provisioning).

## 2. Hardware & Device Design

- **`design/docs/hardware/usb-device.md`**, **`secure-element.md`**, **`protocol.md`**, **`bom.md`** — describe device purpose, block diagrams, signing flow, 2PC command set, and BOM tables. They pull from `kutapay_technical_design.md` (hardware/BOM sections) and `DISCUSSION.md` hardware sections (lines ~6960-7050, 7285-7400) plus the regulatory constraints.
- **`docs/arrete-032/033/034/016`** — the governance, standardized invoice rules, commercialization constraints, and amendments that shape how a USB device is certified, distributed, maintained, and priced. Each summary informs the compliance narrative in the hardware docs.
- **`docs/sfe-specifications-v1-summary.md`** — articulates mandatory security elements, report requirements, offline behavior, and tax engine rules that the hardware must support.
- **`memory-bank/techContext.md`** — lists stack decisions, 2PC commitment, and open questions (MCF spec, signature/QR format, device registration), reinforcing the technical constraints the hardware pages must capture.

## 3. Fiscal Engine & Invoice Flow

- **`design/docs/fiscal/invoice-lifecycle.md`**, **`tax-engine.md`**, **`security-elements.md`**, **`reports.md`** — MkDocs pages describing the six-step flow, state machine, tax group table, mandatory security elements, and Z/X/A/audit reports. They are informed by:
  - **`spec/architecture-kutapay-system-1.md`** (invoice lifecycle, security elements, reports, tax engine mention),
  - **`docs/sfe-specifications-v1-summary.md`** (14 tax groups, client classification, security elements, reports, offline rules),
  - **`kutapay_technical_design.md`** (functional requirements, invoice data structures),
  - **`DISCUSSION.md`** (various sections that explain reporting expectations and audit trails).
- **`memory-bank/progress.md`** — tracks that the fiscal docs exist and reminds us the tax engine spec (`spec/schema-tax-engine-1.md`) and reports spec (`spec/process-fiscal-reports-1.md`) are still TODO.

## 4. Cloud & Sync Infrastructure

- **`design/docs/cloud/architecture.md`**, **`offline-sync.md`**, **`dgi-integration.md`** — describe sync responsibilities, retry/state machine logic, and DGI integration status. They rely on:
  - **`DISCUSSION.md`** sections (lines 7030-7060 for sync agent duties),
  - **`docs/sfe-specifications-v1-summary.md`** (offline expectations),
  - **`docs/arrete-033/016`** (regulatory insistence on continuous compliance),
  - **`kutapay_technical_design.md`** (API requirements and unknowns).
- **Future spec targets:** `spec/infrastructure-dgi-integration-1.md` (ongoing spike) and `spec/design-cloud-api-1.md` plus `design/docs/api/cloud.md` — they will formalize cloud endpoints, device registration, audit export, and known/unresolved questions (validate status once created).
- **`memory-bank/activeContext.md`** lists the focus on building this documentation, reminding us that offline-first sync design is a core deliverable.

## 5. POS & Marketplace Interfaces

- **`design/docs/pos/multi-terminal.md`**, **`ui-ux.md`**, **`integrations.md`** — describe multi-terminal orchestration, UX principles (speed, localization, offline indicators), integration priorities (API, CSV, accounting, webhooks, ecommerce, ERP). Sources:
  - **`docs/odoo-pos-lessons-for-kutapay.md`** (lessons on offline resilience, UI patterns, modules worth adopting or skipping).
  - **`DISCUSSION.md`** sections flagged by the implementation plan as rich in POS details (e.g., lines 6975-7030, 7120-7200) and multi-terminal reasoning.
  - **`.github/copilot-instructions.md`** (UX expectations, multi-terminal per-outlet rules).
  - **`docs/sfe-specifications-v1-summary.md`** (client classification, mandatory fields).

## 6. Regulatory & Policy Landscape

- **`docs/arrete-032-summary.md`** — governance committee overview, decision authority, and how changes happen.
- **`docs/arrete-033-summary.md`** — the operational rule forcing every VAT transaction through approved fiscal systems (no excuses for offline), explaining device lifecycle and vendor certification.
- **`docs/arrete-034-summary.md`** and **`docs/arrete-016-2025-summary.md`** — commercialization restrictions, homologation pipeline, pricing disclosures, amendment for scalability.
- **`docs/sfe-specifications-v1-summary.md`** — technical requirements for SFEs, mandatory invoice/report structure, offline behavior, open unknowns (MCF/e-MCF API, signature algorithm, QR format).
- **`design/docs/regulatory/legal-framework.md`**, **`arretes.md`**, **`sfe-specs.md`** — MkDocs pages that summarize those regulations for readers who do not want to read the raw arrêté texts.
- **`docs/adr/adr-0001-two-phase-commit-usb-protocol.md`** and **`design/docs/adr/adr-0001.md`** explain the architectural decision around the USB protocol. The later ADRs (`adr-0002`, `adr-0003`) exist in `design/docs/adr/` even though the source docs are still being produced (on the TODO list).

## 7. API & Specification Repository

- **Existing specs**:
  - `spec/architecture-kutapay-system-1.md` — overall EARS requirements.
  - Pending files from the plan: `spec/protocol-usb-fiscal-device-1.md`, `spec/schema-tax-engine-1.md`, `spec/process-fiscal-reports-1.md`, `spec/infrastructure-dgi-integration-1.md`, `spec/design-cloud-api-1.md`, `spec/design-pos-plugin-api-1.md`. These are noted as targets in the implementation plan (TASK-011, 015, 017, 020, 028, 029).
- **Design/api references**:
  - `design/docs/api/usb-device.md` (currently documents USB commands per early spec drafts).
  - `design/docs/api/cloud.md` and `design/docs/api/pos-plugin.md` (should stay in sync with their spec counterparts once completed).
- **Decision records**: `docs/adr/adr-0001...` and `design/docs/adr/adr-0001..3` capture architectural decisions; they influence all API, hardware, and fiscal docs.
- **`docs/sfe-specifications-v1-summary.md`** also serves as a de facto API contract between SFE and MCF layers via its mention of data fields, security elements, and offline behavior. Its open unknowns (MCF spec, signature) are part of the gap list below.

## 8. Implementation & Roadmap Documentation

- **`design/docs/implementation/roadmap.md`**, **`phase-1.md`**, **`phase-2.md`**, **`phase-3.md`** — timeline/Gantt views for B2B, retail, and enterprise phases, each referencing the specs above and enforcement paths (USB device, cloud sync, POS).
- These pages rely on: `kutapay_technical_design.md` (implementation plan section), `design/docs/architecture/*` (to justify dependencies), regulatory docs (to justify compliance steps), and memory bank entries for goals/phase focus.

## 9. Memory Bank & Persistent Context

- **`memory-bank/projectbrief.md`** — mission, solution, success criteria, constraints (trust boundary, sequential invoices, offline work).
- **`memory-bank/techContext.md`** — stack decisions, two-phase commit, canonical payload requirements, open questions (MCF API, signature, registration).
- **`memory-bank/activeContext.md`** — current pre-implementation focus, next steps for specs and MkDocs content.
- **`memory-bank/productContext.md`** — user problems, target markets, UX goals.
- **`memory-bank/systemPatterns.md`** — trust boundary, offline-first, multi-terminal, two-phase commit, hash chaining, security elements.
- **`memory-bank/progress.md`** — what’s done (plan, docs) and where we still need to go (architecture spec, MkDocs product, future phases).
- **`memory-bank/context-map.md`** (this file) — ties the memory bank to every design file, forming the connective tissue between previous work and the upcoming tasks.

## 10. Key Reference Documents

- **`kutapay_technical_design.md`** (primary narrative).
- **`DISCUSSION.md`** (regulatory deep dives, hardware detail, multi-terminal reasoning, compliance timeline).
- **`.github/copilot-instructions.md`** (rules, trust boundary, security elements, offline-first, integration priorities, open unknowns).
- **`docs/odoo-pos-lessons-for-kutapay.md`** (POS UX/capability benchmark).
- **`docs/sfe-specifications-v1-summary.md`** (regulatory technical spec).

## 11. Gaps & Missing Context

1. **USB Protocol Specification (TASK-011)** — `spec/protocol-usb-fiscal-device-1.md` still missing; without it the hardware and API pages lack definitive message formats (TXN|*, QRY|*, RPT|*, etc.). Also needed: canonical JSON payload definition and failure-mode sequences.
2. **Tax Engine Schema & Reports specs (TASK-015 & TASK-017)** — the spec files that enumerate the 14 tax groups, client classifications, rounding rules, and report contents need to be drafted to keep the fiscal docs aligned with the official requirements.
3. **DGI Integration & Cloud API (TASK-020 & TASK-028)** — `spec/infrastructure-dgi-integration-1.md` and `spec/design-cloud-api-1.md`/`design/docs/cloud/*.md` are still placeholders; the known vs unknown sections in `docs/sfe-specifications-v1-summary.md` and `.github/copilot-instructions.md` prove this is a high-priority gap.
4. **POS Plugin API (TASK-029)** — `spec/design-pos-plugin-api-1.md` absent, so `design/docs/api/pos-plugin.md` cannot yet reference concrete request/response schemas or error handling requirements.
5. **Decision Records & ADRs (TASK-035, TASK-036)** — `docs/adr/adr-0002` and `adr-0003` depend on later design docs (secure element, POS UI) that are not complete; the ADR summaries need to recount options, rationale, and implications for future documents.
6. **Regulatory Unknowns** — the open questions listed in `docs/sfe-specifications-v1-summary.md` and `.github/copilot-instructions.md` (MCF/e-MCF API spec, signature algorithm/QR format, key provisioning, device registration) remain unresolved. They should be tracked in future research spikes (`@research-technical-spike`) and reflected in `review/` documents once answered.
7. **Multi-terminal orchestration** — while `design/docs/pos/multi-terminal.md` exists, deeper failure-mode analysis (content referenced in `DISCUSSION.md` lines ~7000) still lacks explicit diagrams in `design/docs/architecture/components.md` and `data-flow.md`.

--- 

This context map should be updated whenever new specs/docs appear so that reviewers instantly know which files feed each section and what still needs to be answered before implementation proceeds.
