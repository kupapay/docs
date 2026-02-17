# Bono Pay — Strategic Pivot Implementation Plan

> **Pattern:** [Ralph Loop](https://ghuntley.com/ralph/) — autonomous iteration with fresh context per cycle.
> **State lives on disk, not in the model's context.** Each iteration reads this file, picks one task, executes it, updates the status, commits, and exits.

## Strategic Context

**Bono Pay is a fiscal invoicing platform for the DRC** — like Stripe Invoices, but built for the Facture Normalisée mandate. It is NOT a POS system. The POS is a future integration target, not the core product.

### Product Vision

```
┌────────────────────────────────────────────────────────────────────┐
│  Phase 1 — Software Invoicing Platform (THIS PIVOT)               │
│  API-first invoicing + web dashboard + cloud fiscal signing (HSM) │
│  Tax engine · DGI integration · B2B pilot                         │
├────────────────────────────────────────────────────────────────────┤
│  Phase 2 — POS & Retail Integrations                              │
│  POS SDK · multi-terminal · mobile money · restaurant features    │
├────────────────────────────────────────────────────────────────────┤
│  Phase 3 — USB Hardware (DEF Homologation)                        │
│  USB Fiscal Memory device · firmware · 2PC protocol · secure elem │
├────────────────────────────────────────────────────────────────────┤
│  Phase 4 — Enterprise & Scale                                     │
│  ERP connectors · fleet management · analytics · multi-country    │
└────────────────────────────────────────────────────────────────────┘
```

### Trust Boundary (Phase 1 — Software-Only)

```
Client Apps (untrusted)  ──invoice request──►  Bono Pay Cloud (trusted)
  Web Dashboard                                   │
  REST API consumers                              ├── Cloud Signing Service (HSM)
  SDK integrators                                 ├── Fiscal Ledger (append-only)
  Future: POS terminals                           ├── Monotonic Counter
                                                  ├── Tax Engine (14 DGI groups)
                                                  ├── Report Generator (Z/X/A)
                                                  └── DGI Sync Agent
```

In Phase 1 the **Cloud Signing Service** is the trusted fiscal authority. It assigns fiscal numbers, signs invoices with HSM-managed keys, maintains the hash-chained ledger, and generates reports. In Phase 3, the USB Fiscal Memory device can replace or augment the cloud signer for merchants who need full DEF homologation.

### What This Plan Does

This plan rewrites all documentation to reflect the pivot. It:
1. Archives hardware docs (USB device, protocol, secure element, BOM) out of the main site
2. Restructures the MkDocs nav from POS-centric to invoicing-platform-centric
3. Rewrites architecture, fiscal, cloud, and implementation docs for software-first
4. Creates new invoicing platform pages (API, dashboard, SDK, multi-user)
5. Updates memory bank, copilot instructions, and specs
6. Creates new ADRs documenting the pivot decisions

## How This Works

```
┌──────────────────────────────────────────────────────────────────┐
│  RALPH LOOP                                                      │
│                                                                  │
│  while tasks remain:                                             │
│    ┌──────────────────────────────────────────────────────────┐  │
│    │  Fresh Copilot session (clean context)                   │  │
│    │                                                          │  │
│    │  1. Read IMPLEMENTATION_PLAN.md (this file)              │  │
│    │  2. Read source docs listed in the task                  │  │
│    │  3. Find first task with Status: READY                   │  │
│    │  4. Execute the instructions                             │  │
│    │  5. Write output to the specified target file             │  │
│    │  6. Run the specified validation step                     │  │
│    │  7. Update this file: READY → DONE                       │  │
│    │  8. git add -A && git commit                             │  │
│    └──────────────────────────────────────────────────────────┘  │
│    ↻ next iteration (fresh context)                              │
└──────────────────────────────────────────────────────────────────┘
```

### Rules for Each Iteration

1. **Pick the first READY task** — do not skip ahead or cherry-pick.
2. **Read only the source files listed** in that task's `Sources` field.
3. **Write complete content** — no placeholders, stubs, or "Coming soon" blocks.
4. **Include Mermaid diagrams** where specified. Always quote node labels containing parentheses, slashes, or commas.
5. **Use "Bono Pay"** as the product name everywhere. Never "KutaPay".
6. **Validate** — run the check described in `Validate`. Fix before committing.
7. **Update status** — change `Status: READY` → `Status: DONE` and add `Completed: YYYY-MM-DD`.
8. **Commit** — `git add -A && git commit -m "docs: [TASK-ID] [short description]"`.
9. **Exit** — do not start the next task.

### How to Run

```bash
python .github/cookbook/copilot-sdk/python/recipe/ralph_loop.py build 50
```

---

## Status Summary

| Phase | Tasks | Done | Status |
|-------|-------|------|--------|
| 0 — Restructure & Archive | 3 | 0 | READY |
| 1 — Foundation Updates | 4 | 0 | BLOCKED by Phase 0 |
| 2 — Architecture (Software-First) | 4 | 0 | BLOCKED by Phase 1 |
| 3 — Invoicing Platform (New) | 4 | 0 | BLOCKED by Phase 1 |
| 4 — Fiscal Engine (Rewrite) | 4 | 0 | BLOCKED by Phase 2 |
| 5 — Cloud (Rewrite) | 3 | 0 | BLOCKED by Phase 2 |
| 6 — Integrations (Rewrite POS→Platform) | 3 | 0 | BLOCKED by Phase 2 |
| 7 — Regulatory (Minor Updates) | 3 | 0 | READY (independent) |
| 8 — API Reference (Rewrite) | 2 | 0 | BLOCKED by Phase 3+4 |
| 9 — Implementation Roadmap (Rewrite) | 4 | 0 | BLOCKED by Phase 2-6 |
| 10 — ADRs (New + Rewrite) | 4 | 0 | BLOCKED by Phase 2 |
| 11 — Validation & Final Assembly | 3 | 0 | BLOCKED by Phase 7-10 |
| **Total** | **41** | **0** | |

---

## Phase 0 — Restructure & Archive

### TASK-001: Archive hardware docs out of main site
```
Status:     DONE
Completed: 2026-02-17
Agent:      manual
Sources:    design/docs/hardware/, design/docs/api/usb-device.md
Target:     design/docs-archive/hardware/, design/docs-archive/api/
Validate:   ls design/docs-archive/hardware/*.md | wc -l  (expect 4)
            ls design/docs-archive/api/usb-device.md  (exists)
            ! ls design/docs/hardware/  (directory removed)
```
**Instructions:**
1. Create `design/docs-archive/hardware/` directory.
2. Move these files from `design/docs/hardware/` to `design/docs-archive/hardware/`:
   - `usb-device.md`, `protocol.md`, `secure-element.md`, `bom.md`
3. Create `design/docs-archive/api/` directory.
4. Move `design/docs/api/usb-device.md` to `design/docs-archive/api/usb-device.md`.
5. Remove `design/docs/hardware/` directory (now empty).
6. Add a `design/docs-archive/README.md` with:
   ```
   # Archived Documentation
   These docs describe the USB Fiscal Memory hardware planned for Phase 3.
   They are preserved here as the specification for future hardware integration.
   They are NOT part of the current MkDocs site.
   ```

---

### TASK-002: Restructure mkdocs.yml nav for invoicing platform
```
Status:     DONE
Completed: 2026-02-17
Depends:    TASK-001
Agent:      manual
Sources:    design/mkdocs.yml
Target:     design/mkdocs.yml
Validate:   cd design && python -m mkdocs build 2>&1 | tail -3  (no errors about missing files)
```
**Instructions:**
Update `design/mkdocs.yml` with new nav structure:
```yaml
site_name: Bono Pay Technical Design

nav:
  - Home: index.md
  - Architecture:
    - Overview: architecture/overview.md
    - Trust Boundary: architecture/trust-boundary.md
    - Component Map: architecture/components.md
    - Data Flow: architecture/data-flow.md
  - Invoicing Platform:
    - Product Overview: platform/overview.md
    - Invoicing API: platform/api.md
    - Web Dashboard: platform/dashboard.md
    - SDK & Libraries: platform/sdk.md
  - Fiscal Engine:
    - Invoice Lifecycle: fiscal/invoice-lifecycle.md
    - Tax Engine (14 Groups): fiscal/tax-engine.md
    - Security Elements: fiscal/security-elements.md
    - Reports (Z/X/A): fiscal/reports.md
  - Cloud & Sync:
    - Cloud Architecture: cloud/architecture.md
    - Offline-First Sync: cloud/offline-sync.md
    - DGI Integration: cloud/dgi-integration.md
  - Platform & Integrations:
    - Multi-User Access: platform/multi-user.md
    - Integrations: platform/integrations.md
  - Regulatory:
    - DRC Legal Framework: regulatory/legal-framework.md
    - "Arrêté Summary": regulatory/arretes.md
    - SFE Specifications: regulatory/sfe-specs.md
  - ADRs:
    - Index: adr/index.md
    - "0001 - Two-Phase Commit": adr/adr-0001.md
    - "0002 - Signature Algorithm": adr/adr-0002.md
    - "0003 - Platform Technology Stack": adr/adr-0003.md
    - "0004 - Cloud Fiscal Signing": adr/adr-0004.md
    - "0005 - Strategic Pivot": adr/adr-0005.md
  - Implementation:
    - Roadmap: implementation/roadmap.md
    - "Phase 1 - Software Invoicing": implementation/phase-1.md
    - "Phase 2 - POS & Retail": implementation/phase-2.md
    - "Phase 3 - USB Hardware": implementation/phase-3.md
    - "Phase 4 - Enterprise": implementation/phase-4.md
  - API Reference:
    - Cloud API: api/cloud.md
    - Invoicing SDK: api/invoicing-sdk.md
```
Also create empty placeholder `.md` files for every NEW page in the nav:
- `design/docs/platform/overview.md`
- `design/docs/platform/api.md`
- `design/docs/platform/dashboard.md`
- `design/docs/platform/sdk.md`
- `design/docs/platform/multi-user.md`
- `design/docs/platform/integrations.md`
- `design/docs/adr/adr-0004.md`
- `design/docs/adr/adr-0005.md`
- `design/docs/implementation/phase-4.md`
- `design/docs/api/invoicing-sdk.md`

Each placeholder: `# [Title]\n\n!!! note "Rewrite in progress"\n    This page is being updated for the software-first invoicing platform pivot.`

Remove old files that are no longer in nav:
- `design/docs/pos/multi-terminal.md` → keep content, it will be source for `platform/multi-user.md`
- `design/docs/pos/ui-ux.md` → keep content, it will be source for `platform/dashboard.md`
- `design/docs/pos/integrations.md` → keep content, it will be source for `platform/integrations.md`
- `design/docs/api/pos-plugin.md` → keep content, source for `api/invoicing-sdk.md`
- `design/docs/adr/adr-0003.md` → will be rewritten in-place

Move the old POS files to `design/docs-archive/pos/` for reference:
```bash
mkdir -p design/docs-archive/pos
mv design/docs/pos/multi-terminal.md design/docs-archive/pos/
mv design/docs/pos/ui-ux.md design/docs-archive/pos/
mv design/docs/pos/integrations.md design/docs-archive/pos/
mv design/docs/api/pos-plugin.md design/docs-archive/api/pos-plugin.md
rmdir design/docs/pos
```

---

### TASK-003: Update home page for invoicing platform
```
Status:     DONE
Completed:  2026-02-17
Depends:    TASK-002
Agent:      manual
Sources:    design/docs/index.md (current), docs/odoo-pos-lessons-for-kutapay.md (for UX principles)
Target:     design/docs/index.md
Validate:   grep -q "invoicing" design/docs/index.md && grep -q "Bono Pay" design/docs/index.md
```
**Instructions:**
Rewrite `design/docs/index.md` to position Bono Pay as fiscal invoicing infrastructure:
- **Title:** Bono Pay Technical Design Documentation
- **Opening paragraph:** Bono Pay is fiscal invoicing infrastructure for the DRC's Facture Normalisée regime. Businesses create, send, and manage fiscally compliant invoices via API or web dashboard. The platform handles fiscal signing, sequential numbering, tax calculation, and DGI compliance — so developers and finance teams don't have to.
- **Key sections list:** Architecture, Invoicing Platform, Fiscal Engine, Cloud & Sync, Platform & Integrations, Regulatory, ADRs, Implementation, API Reference
- **Phase roadmap summary:** Phase 1 (Software Invoicing) → Phase 2 (POS & Retail) → Phase 3 (USB Hardware) → Phase 4 (Enterprise)
- **Design principles from Odoo lessons** (reframed for invoicing): offline-first, PWA, mobile-optimized, multi-currency (CDF/USD), mobile money native
- **How to use this documentation** section

---

## Phase 1 — Foundation Updates

### TASK-004: Rewrite copilot instructions for invoicing platform
```
Status:     READY (after TASK-003)
Depends:    TASK-003
Agent:      manual
Sources:    .github/copilot-instructions.md (current), docs/sfe-specifications-v1-summary.md
Target:     .github/copilot-instructions.md
Validate:   grep -q "invoicing" .github/copilot-instructions.md
            grep -cq "NOT.*POS" .github/copilot-instructions.md  (should NOT match — remove old disclaimer)
```
**Instructions:**
Rewrite `.github/copilot-instructions.md` to reflect the pivot. Key changes:
- **What This Project Is:** Bono Pay is fiscal invoicing infrastructure for the DRC. It is an API-first invoicing platform (like Stripe Invoices) that turns commercial activity into legally recognized tax events under the Facture Normalisée mandate.
- **Architecture — Trust Boundary (Phase 1):**
  ```
  Client Apps (untrusted)  ──invoice request──►  Bono Pay Cloud (trusted)
           │                                          │
           ▼                                          │
     Web Dashboard / API                              │
                                                      ├── Cloud Signing Service (HSM)
                                                      ├── Fiscal Ledger
     Bono Pay Cloud ──sealed invoice──► DGI           ├── Tax Engine
  ```
- **Trust boundary rule:** In Phase 1, the Cloud Signing Service (HSM-backed) is the trusted fiscal authority. Client apps (web dashboard, API consumers, SDK users) are untrusted. In Phase 3, the USB Fiscal Memory device can replace the cloud signer for merchants needing full DEF homologation.
- **Invoice Lifecycle:** (1) Client creates invoice via API/dashboard, (2) Platform validates + applies tax engine, (3) Cloud signing service assigns fiscal number + signs, (4) Platform returns sealed invoice with security elements, (5) Client delivers receipt (email/WhatsApp/print/PDF), (6) Platform syncs to DGI.
- **Security Elements:** Same 5 elements, generated by cloud HSM in Phase 1 (fiscal number, service ID, signature, timestamp, QR code).
- **Phasing:** Phase 1 = Software Invoicing, Phase 2 = POS & Retail, Phase 3 = USB Hardware, Phase 4 = Enterprise.
- **Conventions for AI Agents:** Always respect the trust boundary: client apps are untrusted, cloud signing service is the authority. Invoice mutations are always new fiscal events. Canonical payloads must have deterministic field ordering. Tax logic must handle all 14 DGI tax groups. Offline behavior: client queues invoices locally; cloud fiscalizes on receipt.
- Remove the old "it is NOT an invoicing SaaS" disclaimer.
- Remove USB-specific protocol details (move to Phase 3 context).

---

### TASK-005: Rewrite memory bank for invoicing platform
```
Status:     READY (after TASK-004)
Depends:    TASK-004
Agent:      manual
Sources:    .github/copilot-instructions.md (updated), docs/sfe-specifications-v1-summary.md,
            docs/odoo-pos-lessons-for-kutapay.md, memory-bank/ (current files)
Target:     memory-bank/projectbrief.md, memory-bank/productContext.md,
            memory-bank/systemPatterns.md, memory-bank/techContext.md,
            memory-bank/activeContext.md, memory-bank/progress.md,
            memory-bank/context-map.md
Validate:   grep -q "invoicing" memory-bank/projectbrief.md
            grep -q "Cloud Signing" memory-bank/systemPatterns.md
```
**Instructions:**
Rewrite all 7 memory bank files to reflect the pivot:
- **projectbrief.md** — Mission: fiscal invoicing platform for DRC. Solution: API + dashboard + cloud signing. Success criteria: every invoice sealed with cloud-generated security elements. Constraints: cloud HSM is trusted authority, 14 tax groups, nothing deleted.
- **productContext.md** — Why: SMBs need fiscally compliant invoices without hardware. Users: finance teams, accountants, developers, SMBs (Phase 1), retailers (Phase 2). UX goals: create invoices in seconds, API-first, Stripe-like developer experience.
- **systemPatterns.md** — Trust boundary: cloud signing service. Offline-first: client queues, cloud fiscalizes. Hash-chained ledger in cloud. Security elements from HSM. Multi-user access via API keys / roles. Phase 3: USB device as optional trust anchor.
- **techContext.md** — Stack: cloud HSM for signing, REST API, PWA dashboard (Odoo-inspired UI patterns), PostgreSQL. Open questions: DGI MCF API, signature algorithm format accepted by DGI, cloud HSM vendor selection.
- **activeContext.md** — Status: documentation pivot in progress. Focus: rewriting docs for software-first invoicing platform.
- **progress.md** — What works: MkDocs site scaffolded, regulatory docs done. What changed: strategic pivot from POS+hardware to invoicing platform. What's next: architecture rewrites, new platform pages.
- **context-map.md** — Updated cross-references reflecting new file structure (archived hardware, new platform/ dir, renamed pos→platform).

---

### TASK-006: Rewrite architecture specification
```
Status:     READY (after TASK-005)
Depends:    TASK-005
Agent:      manual
Sources:    spec/architecture-kutapay-system-1.md (current), .github/copilot-instructions.md (updated),
            docs/sfe-specifications-v1-summary.md
Target:     spec/architecture-kutapay-system-1.md
Validate:   grep -q "Cloud Signing Service" spec/architecture-kutapay-system-1.md
            grep -q "EARS" spec/architecture-kutapay-system-1.md
```
**Instructions:**
Rewrite the EARS-notation architecture specification for software-first:
- **Trust boundary requirements:** "WHEN a merchant creates an invoice via the API or dashboard, THE SYSTEM SHALL route it through the Cloud Signing Service for fiscal number assignment, signing, and ledger storage."
- **Invoice lifecycle requirements:** Software-first flow (API/dashboard → tax engine → cloud signer → sealed response → DGI sync).
- **Security element requirements:** "THE SYSTEM SHALL generate fiscal numbers, signatures, timestamps, and QR codes via the Cloud Signing Service (HSM-backed)."
- **Tax engine requirements:** Keep all 14 DGI tax groups, client classification — these are unchanged.
- **Report requirements:** Keep Z/X/A/audit reports — source changes from USB journal to cloud fiscal ledger.
- **Offline requirements:** "WHEN the client application is offline, THE SYSTEM SHALL queue invoice requests locally and fiscalize them upon reconnection to the Cloud Signing Service."
- **Phase 3 section:** Preserve USB device requirements tagged as "Phase 3: WHEN the USB Fiscal Memory device is deployed..."
- **DGI integration requirements:** Keep existing, update source of security elements.

---

### TASK-007: Rewrite remaining specs
```
Status:     READY (after TASK-006)
Depends:    TASK-006
Agent:      manual
Sources:    spec/ (all files), .github/copilot-instructions.md (updated)
Target:     spec/design-cloud-api-1.md, spec/design-pos-plugin-api-1.md,
            spec/infrastructure-dgi-integration-1.md, spec/process-fiscal-reports-1.md,
            spec/schema-tax-engine-1.md
Validate:   grep -q "Bono Pay" spec/design-cloud-api-1.md
```
**Instructions:**
Update the remaining spec files to reflect the pivot:
- `spec/design-cloud-api-1.md` — Cloud API is now the primary interface (not a relay). Add invoicing endpoints (create, list, void, refund invoices). Remove device_id as mandatory; replace with outlet_id / merchant_id.
- `spec/design-pos-plugin-api-1.md` — Rename content to "Invoicing SDK Specification." Client talks to cloud API directly (no local daemon). Keep canonical payload structure.
- `spec/infrastructure-dgi-integration-1.md` — Update: security elements sourced from cloud HSM, not USB device. Keep DGI endpoint unknowns.
- `spec/process-fiscal-reports-1.md` — Reports generated from cloud fiscal ledger, not USB journal. Report types and formats unchanged.
- `spec/schema-tax-engine-1.md` — Keep as-is (tax engine is platform-agnostic). Update "Bono Pay" name.
- `spec/protocol-usb-fiscal-device-1.md` — Add header: "Phase 3: USB Hardware Protocol. This spec applies when the USB Fiscal Memory device is deployed."

---

## Phase 2 — Architecture (Software-First Rewrite)

### TASK-008: Rewrite architecture overview
```
Status:     READY (after TASK-006)
Depends:    TASK-006
Agent:      manual
Sources:    design/docs/architecture/overview.md (current), spec/architecture-kutapay-system-1.md (updated),
            .github/copilot-instructions.md (updated), docs/odoo-pos-lessons-for-kutapay.md
Target:     design/docs/architecture/overview.md
Validate:   grep -q "Cloud Signing Service" design/docs/architecture/overview.md
            grep -q "invoicing" design/docs/architecture/overview.md
```
**Instructions:**
Heavy rewrite of architecture overview for software-first invoicing platform:
- **C4 Context Diagram (Mermaid):** Actors: Merchant, Developer, Auditor → Bono Pay Platform (Invoicing API + Dashboard + Cloud Signing + Sync) → DGI, Payment Providers. Remove Cashier/Teller as primary actor.
- **Trust Boundary Diagram (Mermaid):** Untrusted Zone: Web Dashboard, API Consumers, SDK, Future POS. Trusted Zone: Cloud Signing Service (HSM), Fiscal Ledger, Tax Engine, Report Generator. Quote all Mermaid labels with punctuation.
- **Component Map (Mermaid):** Four layers:
  1. Client Layer: Web Dashboard, API Consumers, SDK, Mobile App
  2. Platform Services: Invoicing API, Tax Calculation Engine, Canonical Serializer, Multi-User Access Control
  3. Fiscal Core (trusted): Cloud Signing Service (HSM), Monotonic Counter, Hash-Chained Fiscal Ledger, Report Generator
  4. External: DGI Sync Agent, Payment Gateway, Notification Service (email/WhatsApp)
- **Operational Notes:** API-first, offline-capable clients, cloud signing as trusted authority. Mention Phase 3 USB device as future optional trust anchor.

---

### TASK-009: Rewrite trust boundary
```
Status:     READY (after TASK-008)
Depends:    TASK-008
Agent:      manual
Sources:    design/docs/architecture/trust-boundary.md (current), spec/architecture-kutapay-system-1.md (updated)
Target:     design/docs/architecture/trust-boundary.md
Validate:   grep -q "Cloud Signing Service" design/docs/architecture/trust-boundary.md
```
**Instructions:**
Heavy rewrite for software-first trust boundary:
- **New trust boundary:** Client apps (web dashboard, API consumers, SDK, future POS) are untrusted. Bono Pay Cloud Signing Service (HSM-backed) is the trusted fiscal authority.
- **What crosses the boundary (untrusted → trusted):** Invoice creation requests (canonical JSON payload with deterministic field ordering).
- **What the trusted zone produces:** Fiscal number, signature (HSM-generated), timestamp, QR code, sealed invoice. These are NEVER fabricated by client apps.
- **What never crosses back:** HSM private keys, raw monotonic counter state, internal ledger mutation commands.
- **Mermaid diagram:** Untrusted Zone (Dashboard, API, SDK) → Trusted Zone (Cloud Signing Service, Fiscal Ledger, Counter Manager). Quote all labels.
- **Failure modes:** Cloud service unavailable → client queues locally. Key rotation → HSM handles internally. Counter corruption → cloud service enforces monotonic ordering with db constraints.
- **Trust assumptions table:** Cloud HSM is the authority, client apps never sign, multi-user access controlled by API keys + roles.
- **Phase 3 section:** "When the USB Fiscal Memory device is deployed, it replaces the Cloud Signing Service as the trusted authority for merchants who need full DEF homologation." Preserve the concept but label it future.

---

### TASK-010: Rewrite component map
```
Status:     READY (after TASK-008)
Depends:    TASK-008
Agent:      manual
Sources:    design/docs/architecture/components.md (current), design/docs/architecture/overview.md (updated)
Target:     design/docs/architecture/components.md
Validate:   grep -q "Invoicing API" design/docs/architecture/components.md
```
**Instructions:**
Heavy rewrite — replace POS Layer + USB Device with invoicing platform components:
- **Client Layer:** Web Dashboard (PWA), API Consumers, SDK/Libraries, Mobile App (future), POS Integration (Phase 2)
- **Platform Services Layer:** Invoicing API (REST), Tax Calculation Engine, Canonical Serializer, Receipt Delivery (email/WhatsApp/PDF/print), Multi-User Access Control (roles, API keys, outlet scoping)
- **Fiscal Core Layer (trusted):** Cloud Signing Service (HSM), Monotonic Counter Manager, Hash-Chained Fiscal Ledger, Report Generator (Z/X/A/audit)
- **Cloud Infrastructure Layer:** Sync Engine + Invoice Store, DGI Integration Agent, Merchant Registry, Dashboard & Analytics, Backup & Archival
- Two Mermaid diagrams: (1) Component dependency map, (2) Deployment diagram showing cloud services. Quote all labels.

---

### TASK-011: Rewrite data flow diagrams
```
Status:     READY (after TASK-008)
Depends:    TASK-008
Agent:      manual
Sources:    design/docs/architecture/data-flow.md (current), spec/architecture-kutapay-system-1.md (updated)
Target:     design/docs/architecture/data-flow.md
Validate:   grep -c "sequenceDiagram" design/docs/architecture/data-flow.md  (expect >= 5)
```
**Instructions:**
Heavy rewrite — all 5 sequence diagrams rewritten for software-first:
1. **Happy path (API invoice creation):** Developer/Merchant → Invoicing API → Tax Engine → Cloud Signing Service (HSM) → Fiscal Ledger → DGI Sync Queue → Response with sealed invoice
2. **Dashboard invoice creation:** Merchant (Web Dashboard) → same flow as #1 but via browser
3. **Offline client flow:** SDK/Client → queues invoice locally (IndexedDB) → reconnects → Invoicing API → Cloud Signing Service → sealed response synced back
4. **Void / Credit note:** Merchant → Invoicing API → create new fiscal event referencing original → Cloud Signing Service signs credit note → new ledger entry
5. **Report generation:** Merchant/Auditor → Cloud API → Report Generator queries Fiscal Ledger → Z/X/A/audit report returned
All diagrams use `sequenceDiagram` Mermaid syntax. Quote participant labels with punctuation.

---

## Phase 3 — Invoicing Platform (New Pages)

### TASK-012: Create platform overview page
```
Status:     READY (after TASK-008)
Depends:    TASK-008
Agent:      manual
Sources:    .github/copilot-instructions.md (updated), docs/odoo-pos-lessons-for-kutapay.md,
            docs/sfe-specifications-v1-summary.md
Target:     design/docs/platform/overview.md
Validate:   grep -q "Stripe" design/docs/platform/overview.md
```
**Instructions:**
Create the product overview page for the invoicing platform:
- **What is Bono Pay:** A fiscal invoicing platform (like Stripe Invoices) for the DRC. API-first. Web dashboard. Cloud-based fiscal compliance.
- **How it works:** (1) Create invoice via API or dashboard, (2) Platform calculates taxes using 14 DGI groups, (3) Cloud Signing Service seals the invoice, (4) Deliver receipt via email/WhatsApp/PDF/print, (5) Automatic DGI sync.
- **Design principles (from Odoo lessons):** Offline-first (queue locally, fiscalize on reconnect), PWA (browser-based, no install), mobile-optimized (works on $50 Android tablets), multi-currency (CDF/USD), mobile money native (Airtel Money, M-Pesa, Orange Money).
- **Target users:** Finance teams, accountants, SMBs, developers building integrations, POS vendors (Phase 2).
- **Mermaid diagram:** Simple flow showing API/Dashboard → Cloud → Sealed Invoice → Delivery channels.
- **Phasing summary:** What is available now (Phase 1) vs future (Phase 2: POS, Phase 3: USB hardware).

---

### TASK-013: Create invoicing API page
```
Status:     READY (after TASK-012)
Depends:    TASK-012
Agent:      manual
Sources:    design/docs/api/cloud.md (current — has endpoint examples),
            spec/design-cloud-api-1.md (updated), docs/sfe-specifications-v1-summary.md
Target:     design/docs/platform/api.md
Validate:   grep -q "POST /api/v1/invoices" design/docs/platform/api.md
```
**Instructions:**
Create the Invoicing API overview page (developer-facing):
- **Authentication:** API keys per merchant/outlet. Bearer token. Rate limiting.
- **Core endpoints:**
  - `POST /api/v1/invoices` — Create and fiscalize an invoice (canonical payload → signed response)
  - `GET /api/v1/invoices/{fiscal_number}` — Retrieve a sealed invoice
  - `POST /api/v1/invoices/{fiscal_number}/void` — Void (creates credit note fiscal event)
  - `POST /api/v1/invoices/{fiscal_number}/refund` — Refund (creates credit note referencing original)
  - `GET /api/v1/invoices` — List invoices with filters (date range, client, status)
  - `POST /api/v1/reports` — Generate Z/X/A reports
  - `GET /api/v1/tax-groups` — List available tax groups
- **Canonical payload structure:** Show JSON example with merchant_nif, client block (name, nif, classification), items[], tax_groups[], totals, timestamp. Deterministic field ordering for signature reproducibility.
- **Response structure:** fiscal_number, auth_code, timestamp, qr_payload, signed_hash, dgi_status.
- **Error handling:** Validation errors, rate limiting, authentication failures.
- **Webhook notifications:** Invoice status changes (fiscalized, synced to DGI, DGI acknowledged).
- **Code examples:** curl, Python, JavaScript.

---

### TASK-014: Create web dashboard page
```
Status:     READY (after TASK-012)
Depends:    TASK-012
Agent:      manual
Sources:    docs/odoo-pos-lessons-for-kutapay.md (UI patterns, offline, PWA, touchscreen),
            design/docs-archive/pos/ui-ux.md (preserve Odoo-inspired UX principles)
Target:     design/docs/platform/dashboard.md
Validate:   grep -q "PWA" design/docs/platform/dashboard.md
            grep -q "offline" design/docs/platform/dashboard.md
```
**Instructions:**
Create the Web Dashboard design page, applying Odoo POS UX lessons to an invoicing dashboard:
- **Architecture:** PWA (Progressive Web App), browser-based, no install. Service Worker for offline. IndexedDB for local queue.
- **Key screens:** (1) Invoice creation form (client selection, line items, tax group assignment, payment method), (2) Invoice list/search (filter by date, client, status, fiscal number), (3) Client management (DRC classification: individual, company, professional, embassy), (4) Reports dashboard (Z/X/A, audit export), (5) Settings (outlet management, API keys, user roles).
- **UX principles from Odoo:** Large tap targets, minimal text input, instant search from local data, numpad for amount entry, category/product grid for quick item selection, dual-currency display (CDF/USD), mobile money payment integration.
- **Offline behavior:** Invoice drafts saved to IndexedDB. Fiscal status indicator: green Connected (real-time signing), yellow Queued (offline, will fiscalize on reconnect), red Error. Queued invoices auto-submit when connectivity returns.
- **Delivery:** After fiscalization, offer: email, WhatsApp share, PDF download, thermal print (via browser print API).
- **Mermaid wireframe flow:** Dashboard → Create Invoice → Add Items + Tax → Submit → Cloud Signs → Receipt Delivery.

---

### TASK-015: Create SDK & libraries page
```
Status:     READY (after TASK-013)
Depends:    TASK-013
Agent:      manual
Sources:    design/docs-archive/api/pos-plugin.md (preserve payload structure),
            design/docs/platform/api.md (updated), spec/design-pos-plugin-api-1.md
Target:     design/docs/platform/sdk.md
Validate:   grep -q "npm install" design/docs/platform/sdk.md || grep -q "pip install" design/docs/platform/sdk.md
```
**Instructions:**
Create the SDK/Libraries page (replaces old POS Plugin API):
- **Purpose:** Client libraries that wrap the Invoicing API for common languages/frameworks.
- **SDKs planned:** JavaScript/TypeScript (npm), Python (pip), PHP (composer). Future: Java, .NET.
- **Core SDK features:** Authentication handling, canonical payload serialization (deterministic field ordering), offline queue with auto-retry, webhook signature verification, tax group helpers, receipt rendering (HTML/PDF).
- **Example usage (JavaScript):**
  ```javascript
  import { BonoPay } from '@bonopay/sdk';
  const client = new BonoPay({ apiKey: process.env.BONOPAY_API_KEY });
  const invoice = await client.invoices.create({
    client: { name: 'Acme Ltd', nif: '987654321', classification: 'Company' },
    items: [{ description: 'Consulting', quantity: 1, unit_price: 500, tax_group: 'VAT_STD' }],
    currency: 'CDF'
  });
  console.log(invoice.fiscal_number, invoice.qr_payload);
  ```
- **Offline mode:** SDK queues invoices in IndexedDB/SQLite, retries on reconnect. Fiscal status callback.
- **POS integration guide (Phase 2 preview):** How POS vendors will integrate the SDK to fiscalize their transactions through Bono Pay.

---

## Phase 4 — Fiscal Engine (Rewrite for Cloud Signing)

### TASK-016: Rewrite invoice lifecycle
```
Status:     READY (after TASK-008)
Depends:    TASK-008
Agent:      manual
Sources:    design/docs/fiscal/invoice-lifecycle.md (current), spec/architecture-kutapay-system-1.md (updated),
            .github/copilot-instructions.md (updated)
Target:     design/docs/fiscal/invoice-lifecycle.md
Validate:   grep -q "Cloud Signing Service" design/docs/fiscal/invoice-lifecycle.md
            grep -c "sequenceDiagram" design/docs/fiscal/invoice-lifecycle.md  (expect >= 2)
```
**Instructions:**
Heavy rewrite — invoice lifecycle for software-first platform:
- **New 6-step flow:** (1) Client creates invoice via API or dashboard, (2) Platform validates fields + applies tax engine (14 groups, client classification), (3) Cloud Signing Service assigns sequential fiscal number, signs with HSM, timestamps, generates QR, (4) Platform stores sealed invoice in fiscal ledger (hash-chained, append-only), (5) Client delivers receipt (email/WhatsApp/PDF/print), (6) Sync Agent uploads to DGI (immediate or deferred).
- **State machine (Mermaid stateDiagram):** Draft → Submitted → Validated → Fiscalized → Delivered → Synced_to_DGI → Acknowledged. Error states: Validation_Failed, Signing_Error, DGI_Rejected.
- **Invoice types:** Sale, advance, credit note, export invoice, export credit note — unchanged.
- **Void / refund:** New fiscal events referencing original. Never deletions.
- **Draft cancellation:** Before fiscalization → no fiscal trace.
- **Sequence diagram (Mermaid):** Merchant → API → Tax Engine → Cloud Signing Service → Fiscal Ledger → DGI Sync → Response.
- **Phase 3 note:** "When USB hardware is deployed, the Cloud Signing Service is replaced by the USB Fiscal Memory device in the signing step."

---

### TASK-017: Update tax engine (minor)
```
Status:     READY (after TASK-008)
Depends:    TASK-008
Agent:      manual
Sources:    design/docs/fiscal/tax-engine.md (current)
Target:     design/docs/fiscal/tax-engine.md
Validate:   ! grep -q "POS" design/docs/fiscal/tax-engine.md  (no POS references remain)
```
**Instructions:**
Minor update — the tax engine is platform-agnostic:
- Replace all instances of "POS" with "invoicing platform" or "client application" (about 5 occurrences).
- Replace any reference to "USB Fiscal Memory returns the fiscal response" with "Cloud Signing Service returns the fiscal response."
- Keep all 14 tax group definitions, client classification table, calculation/rounding rules, worked examples — these are unchanged.
- Keep all Mermaid diagrams — update node labels if they mention POS.

---

### TASK-018: Rewrite security elements
```
Status:     READY (after TASK-008)
Depends:    TASK-008
Agent:      manual
Sources:    design/docs/fiscal/security-elements.md (current), spec/architecture-kutapay-system-1.md (updated)
Target:     design/docs/fiscal/security-elements.md
Validate:   grep -q "Cloud Signing Service" design/docs/fiscal/security-elements.md
            grep -q "HSM" design/docs/fiscal/security-elements.md
```
**Instructions:**
Heavy rewrite — security elements now generated by cloud HSM:
- **5 mandatory security elements (unchanged in purpose):**
  1. Sequential fiscal number — generated by Cloud Signing Service (monotonic counter in database with transaction isolation)
  2. Fiscal authority ID — identifies the signing service instance (replaces device_id DEF NID in Phase 1)
  3. Cryptographic authentication code — ECDSA signature generated by HSM
  4. Trusted timestamp — server-side UTC timestamp from NTP-synced cloud infrastructure
  5. QR code — encodes fiscal_number + auth_code + timestamp + verification URL
- **Generation table:** Each element with Phase 1 source (Cloud HSM) and Phase 3 source (USB device).
- **What clients MAY NOT do:** Fabricate any security element. Client apps only display/deliver them.
- **Key management:** HSM handles key generation, storage, rotation. Keys never leave the HSM boundary.
- **Verification:** QR code points to Bono Pay verification endpoint. Auditors/inspectors can scan to verify.
- **Mock receipt layout (keep existing)** — update "DEF NID" label to "Fiscal Authority ID."

---

### TASK-019: Update reports
```
Status:     READY (after TASK-016)
Depends:    TASK-016
Agent:      manual
Sources:    design/docs/fiscal/reports.md (current), spec/process-fiscal-reports-1.md
Target:     design/docs/fiscal/reports.md
Validate:   grep -q "fiscal ledger" design/docs/fiscal/reports.md
```
**Instructions:**
Moderate rewrite — report source changes from USB journal to cloud fiscal ledger:
- **Report types:** Z (daily closure), X (periodic), A (article-level), audit export — unchanged.
- **Report source:** "Reports are generated from the cloud fiscal ledger, which maintains the hash-chained, append-only record of all sealed invoices." Remove references to USB device journal.
- **Report generation flow (Mermaid sequence diagram):** Merchant/Auditor → Cloud API → Report Generator queries Fiscal Ledger → Report returned (JSON + PDF).
- **Report access:** Via API endpoint `POST /api/v1/reports` or via web dashboard Reports screen.
- **Sample outputs:** Keep existing JSON samples — they are format-identical regardless of signing source.
- **Phase 3 note:** "When USB hardware is deployed, reports can also be generated directly on the device via RPT commands."

---

## Phase 5 — Cloud (Rewrite for Primary Authority)

### TASK-020: Rewrite cloud architecture
```
Status:     READY (after TASK-008)
Depends:    TASK-008
Agent:      manual
Sources:    design/docs/cloud/architecture.md (current), spec/architecture-kutapay-system-1.md (updated)
Target:     design/docs/cloud/architecture.md
Validate:   grep -q "primary fiscal authority" design/docs/cloud/architecture.md
```
**Instructions:**
Moderate rewrite — the cloud is now the PRIMARY fiscal authority, not a relay:
- **Role change:** Cloud moves from "stores sealed invoices from USB device" to "IS the fiscal authority — signs, numbers, timestamps, and stores invoices."
- **Components (Mermaid diagram):**
  - Cloud Signing Service (HSM): fiscal number assignment, ECDSA signing, timestamp generation
  - Fiscal Ledger: hash-chained, append-only PostgreSQL with strict transaction isolation
  - Monotonic Counter Manager: guarantees sequential numbering per outlet
  - Tax Engine Service: calculates taxes per 14 DGI groups
  - Sync Agent: uploads sealed invoices to DGI (MCF/e-MCF)
  - Merchant Registry: outlet management, API key provisioning, user roles
  - Dashboard: analytics, reports, audit exports
- **Multi-tenant:** Each merchant gets isolated namespace, audit partition, quota enforcement.
- **Deployment:** Cloud-native (containers), PostgreSQL, HSM integration (AWS CloudHSM / Azure Dedicated HSM / HashiCorp Vault).
- **Phase 3 note:** "Device Registry component activates when USB hardware is deployed."

---

### TASK-021: Rewrite offline sync
```
Status:     READY (after TASK-020)
Depends:    TASK-020
Agent:      manual
Sources:    design/docs/cloud/offline-sync.md (current)
Target:     design/docs/cloud/offline-sync.md
Validate:   grep -q "IndexedDB" design/docs/cloud/offline-sync.md
```
**Instructions:**
Moderate rewrite — offline means "client offline from cloud," not "device offline from cloud":
- **Offline scenario:** Client app (dashboard/SDK) loses connectivity. Invoices are drafted and queued locally (IndexedDB in browser, SQLite in SDK). When connectivity returns, queued invoices are submitted to the Cloud API for fiscalization.
- **Key difference from USB model:** Invoices are NOT fiscalized while offline. They are queued as drafts. Fiscalization happens when the cloud signing service processes them. This is compliant because the SFE spec allows deferred transmission.
- **Sync state machine (Mermaid stateDiagram):** DRAFT_LOCAL → QUEUED → SUBMITTING → FISCALIZED → SYNCED_TO_DGI → ACKNOWLEDGED. Error states: SUBMISSION_FAILED → RETRY.
- **Retry logic:** Exponential backoff, max 3 retries, then alert merchant. Grace period for DGI upload.
- **Conflict resolution:** Cloud assigns fiscal numbers in arrival order. No client-generated fiscal numbers.
- **Dashboard indicators:** Green Real-time, Yellow Queued (X invoices pending), Red Offline / Error.
- **Phase 3 note:** "With USB hardware, invoices can be fiscalized offline by the device. The cloud sync role returns to its original relay function."

---

### TASK-022: Update DGI integration
```
Status:     READY (after TASK-020)
Depends:    TASK-020
Agent:      manual
Sources:    design/docs/cloud/dgi-integration.md (current), spec/infrastructure-dgi-integration-1.md
Target:     design/docs/cloud/dgi-integration.md
Validate:   grep -q "Cloud Signing Service" design/docs/cloud/dgi-integration.md
```
**Instructions:**
Moderate rewrite — update source of security elements:
- **Architecture diagram (Mermaid):** Client → Bono Pay Cloud (Signing Service) → DGI (MCF/e-MCF). Remove "Replacement DEF" → replace with "Cloud Redundancy / Failover."
- **What we control:** Cloud Signing Service generates all security elements. Sync Agent uploads sealed invoices. Merchant Registry handles outlet identification.
- **What DGI controls:** MCF/e-MCF endpoints, acknowledgment protocol, audit requests.
- **Known constraints:** Keep existing. Update: security elements sourced from cloud HSM, not USB device.
- **Unknowns (still open):** MCF/e-MCF API spec unpublished, exact signature format DGI accepts, device registration protocol (now: "service registration protocol" for cloud-based SFE).
- **Phase 3 note:** "With USB hardware deployed, the DEF device_id replaces the fiscal_authority_id in DGI transmissions."

---

## Phase 6 — Platform & Integrations (Rewrite POS → Platform)

### TASK-023: Create multi-user access page
```
Status:     READY (after TASK-008)
Depends:    TASK-008
Agent:      manual
Sources:    design/docs-archive/pos/multi-terminal.md (preserve multi-access concepts),
            design/docs/architecture/overview.md (updated)
Target:     design/docs/platform/multi-user.md
Validate:   grep -q "API key" design/docs/platform/multi-user.md
```
**Instructions:**
Reframe multi-terminal → multi-user for an invoicing platform:
- **Core concept:** Multiple users/systems share a fiscal service via API keys and role-based access. One outlet can have multiple API consumers (dashboard users, integration systems, future POS terminals).
- **Access model:** Merchant → Outlets → Users/API Keys. Each user has a role (admin, invoicer, viewer, auditor). Each API key is scoped to an outlet.
- **Concurrency:** Cloud service handles concurrent invoice creation. Sequential fiscal numbering is enforced by database transaction isolation (serializable level on counter table). No race conditions.
- **Traceability:** Every invoice tags `outlet_id`, `user_id` or `api_key_id`, and `source` (dashboard/api/sdk/pos).
- **Mermaid diagram:** Multiple clients (Dashboard User, API Consumer, SDK App, Future POS) → Bono Pay Cloud (serialized fiscal numbering) → Fiscal Ledger.
- **Phase 2 preview:** How POS terminals will connect as additional API consumers alongside dashboard users.

---

### TASK-024: Create platform integrations page
```
Status:     READY (after TASK-023)
Depends:    TASK-023
Agent:      manual
Sources:    design/docs-archive/pos/integrations.md (preserve integration tier concept),
            design/docs/platform/api.md (updated)
Target:     design/docs/platform/integrations.md
Validate:   grep -q "webhook" design/docs/platform/integrations.md
```
**Instructions:**
Reframe integration tiers for invoicing platform (not POS):
- **Tier 1 — Core Invoicing API (Phase 1):** REST API for creating, managing, and querying fiscalized invoices. Authentication via API keys.
- **Tier 2 — CSV Import/Export (Phase 1):** Bulk invoice creation from CSV. Accounting export (OHADA-compliant).
- **Tier 3 — Accounting Software Export (Phase 1):** Export sealed invoices to common formats (Sage, QuickBooks, Odoo Accounting).
- **Tier 4 — Webhooks (Phase 1):** Real-time notifications for invoice status changes. HMAC-signed payloads (`X-BonoPay-Signature`).
- **Tier 5 — E-Commerce Plugins (Phase 2):** WooCommerce, Shopify, PrestaShop plugins that auto-fiscalize orders.
- **Tier 6 — POS Integration SDK (Phase 2):** SDK for POS vendors to embed Bono Pay fiscalization.
- **Tier 7 — ERP Connectors (Phase 4):** Odoo, SAP, Microsoft Dynamics connectors for enterprise batch invoicing.
- **Authentication:** API keys per outlet. Mutual TLS for enterprise. Webhook signature verification.

---

## Phase 7 — Regulatory (Minor Updates)

### TASK-025: Update legal framework
```
Status:     READY
Agent:      manual
Sources:    design/docs/regulatory/legal-framework.md (current)
Target:     design/docs/regulatory/legal-framework.md
Validate:   grep -q "Phase 1" design/docs/regulatory/legal-framework.md
```
**Instructions:**
Minor update — add phasing context:
- Add a section "Bono Pay Compliance Phasing" explaining: Phase 1 delivers SFE (billing system) software compliance. Phase 3 adds DEF hardware for full fiscal device homologation. The regulatory requirements themselves don't change.
- Replace "KutaPay" → "Bono Pay" if any remain (should already be done).
- Replace references to "POS / USB device / cloud stack" → "invoicing platform."
- Keep all regulatory content (arrete summaries, timeline, implications) — it's factual.

---

### TASK-026: Update arretes summary
```
Status:     READY
Agent:      manual
Sources:    design/docs/regulatory/arretes.md (current)
Target:     design/docs/regulatory/arretes.md
Validate:   grep -q "Phase" design/docs/regulatory/arretes.md
```
**Instructions:**
Minor update:
- Add phase labels: Arrete 033 (SFE software compliance) → applies Phase 1. Arrete 034 (hardware commercialization) → applies Phase 3.
- Update any remaining POS references.
- Content is factual regulatory summaries — keep as-is.

---

### TASK-027: Update SFE specifications
```
Status:     READY
Agent:      manual
Sources:    design/docs/regulatory/sfe-specs.md (current)
Target:     design/docs/regulatory/sfe-specs.md
Validate:   grep -q "Cloud Signing" design/docs/regulatory/sfe-specs.md || grep -q "Phase 1" design/docs/regulatory/sfe-specs.md
```
**Instructions:**
Moderate update — add Phase 1 column to security elements:
- **Security Elements table:** Add "Phase 1 Source" column showing Cloud HSM alongside existing hardware descriptions.
- **Trust boundary reminder:** Update to mention cloud signing service as Phase 1 authority.
- **Tax groups, invoice types, reports, offline behavior, immutability:** Keep as-is — these are regulatory requirements, not architecture.
- **Open unknowns:** Keep MCF/e-MCF API spec, signature format, registration protocol — these still apply.

---

## Phase 8 — API Reference (Rewrite)

### TASK-028: Rewrite cloud API reference
```
Status:     READY (after TASK-013)
Depends:    TASK-013
Agent:      manual
Sources:    design/docs/api/cloud.md (current), design/docs/platform/api.md (updated),
            spec/design-cloud-api-1.md (updated)
Target:     design/docs/api/cloud.md
Validate:   grep -q "POST /api/v1/invoices" design/docs/api/cloud.md
```
**Instructions:**
Moderate rewrite — Cloud API is now the primary interface:
- **Remove** `X-KUTAPAY-DEVICE-ID` header (no device in Phase 1). Replace with `X-BONOPAY-OUTLET-ID`.
- **Add invoice CRUD endpoints:** Create, retrieve, list, void, refund (aligned with platform/api.md).
- **Update device registration → merchant/outlet registration:** `POST /api/v1/merchants/register`, `POST /api/v1/outlets/register`.
- **Keep:** Reports endpoints, sync status, audit export.
- **Update example payloads:** Remove `device_id` field. Add `outlet_id`, `user_id`. Keep `fiscal_number`, `auth_code`, `timestamp`, `qr_payload`.
- **Error handling:** Keep structure, update error codes.

---

### TASK-029: Create invoicing SDK API reference
```
Status:     READY (after TASK-015)
Depends:    TASK-015
Agent:      manual
Sources:    design/docs/platform/sdk.md (updated), design/docs-archive/api/pos-plugin.md (preserve patterns)
Target:     design/docs/api/invoicing-sdk.md
Validate:   grep -q "BonoPay" design/docs/api/invoicing-sdk.md
```
**Instructions:**
Create the Invoicing SDK API reference (replaces POS Plugin API):
- **SDK methods:** `client.invoices.create()`, `client.invoices.get()`, `client.invoices.list()`, `client.invoices.void()`, `client.invoices.refund()`, `client.reports.generate()`, `client.taxGroups.list()`.
- **Offline mode API:** `client.setOfflineMode(true)`, `client.queue.pending()`, `client.queue.flush()`.
- **Webhook handling:** `client.webhooks.verify(payload, signature)`.
- **Configuration:** API key, base URL, timeout, retry policy, offline storage backend.
- **Error types:** `ValidationError`, `AuthenticationError`, `RateLimitError`, `FiscalizationError`, `OfflineQueueError`.
- **Code examples:** JavaScript, Python, PHP for each method.

---

## Phase 9 — Implementation Roadmap (Rewrite)

### TASK-030: Rewrite roadmap
```
Status:     READY (after TASK-008)
Depends:    TASK-008
Agent:      manual
Sources:    design/docs/implementation/roadmap.md (current), .github/copilot-instructions.md (updated)
Target:     design/docs/implementation/roadmap.md
Validate:   grep -q "Software Invoicing" design/docs/implementation/roadmap.md
            grep -c "Phase" design/docs/implementation/roadmap.md  (expect >= 4)
```
**Instructions:**
Heavy rewrite — 4-phase roadmap for invoicing platform:
- **Gantt chart (Mermaid):** Phase 1 (Software Invoicing, 6 months) → Phase 2 (POS & Retail, 6 months) → Phase 3 (USB Hardware, 6 months) → Phase 4 (Enterprise, ongoing).
- **Phase overview table:** Phase, Duration, Key Deliverables, Target Users, Success Metrics.
- **Risk section:** Cloud HSM availability, DGI API unknowns, regulatory acceptance of software-only SFE before DEF homologation.
- **Dependencies:** Phase 2 depends on Phase 1 API stability. Phase 3 depends on Phase 1 cloud architecture (USB device must produce compatible security elements). Phase 4 depends on Phase 2 proving retail scale.

---

### TASK-031: Rewrite Phase 1 — Software Invoicing
```
Status:     READY (after TASK-030)
Depends:    TASK-030
Agent:      manual
Sources:    design/docs/implementation/phase-1.md (current), .github/copilot-instructions.md (updated),
            docs/odoo-pos-lessons-for-kutapay.md (UX patterns for dashboard)
Target:     design/docs/implementation/phase-1.md
Validate:   grep -q "Cloud Signing" design/docs/implementation/phase-1.md
            grep -q "B2B" design/docs/implementation/phase-1.md
```
**Instructions:**
Heavy rewrite — Phase 1 is software invoicing, no hardware:
- **5 Epics:**
  1. **Cloud Fiscal Signing Service:** HSM integration, monotonic counter, hash-chained ledger, ECDSA signing, fiscal number generation.
  2. **Invoicing REST API:** CRUD endpoints, tax calculation, canonical payload validation, webhook notifications.
  3. **Web Dashboard (PWA):** Invoice creation/management, client database, reports, offline queue (IndexedDB + Service Worker), Odoo-inspired UX.
  4. **Tax Engine + DGI Integration Stub:** 14 tax groups, client classification, DGI sync agent (stubbed until API available).
  5. **B2B Pilot:** 10 service companies / wholesalers / schools in Kinshasa. Success: 1000 fiscalized invoices/month. Metrics: API latency < 500ms, signing reliability > 99.9%.
- **Timeline:** 6 months. Month 1-2: signing service + API. Month 3-4: dashboard + tax engine. Month 5-6: pilot + iterate.
- **No hardware dependency.** No USB device. No local daemon. No firmware.

---

### TASK-032: Rewrite Phase 2 — POS & Retail
```
Status:     READY (after TASK-031)
Depends:    TASK-031
Agent:      manual
Sources:    design/docs/implementation/phase-2.md (current), docs/odoo-pos-lessons-for-kutapay.md
Target:     design/docs/implementation/phase-2.md
Validate:   grep -q "POS SDK" design/docs/implementation/phase-2.md
```
**Instructions:**
Heavy rewrite — Phase 2 adds POS and retail integrations:
- **Epics:**
  1. **POS Integration SDK:** JavaScript/Python SDK for POS vendors to embed Bono Pay fiscalization. Offline queue with auto-retry.
  2. **Multi-Terminal Support:** Multiple POS terminals per outlet, all hitting the same cloud fiscal service. Concurrent invoice creation with serialized numbering.
  3. **Mobile Money Integration:** Airtel Money, M-Pesa, Orange Money as payment methods recorded in invoices.
  4. **Restaurant Features:** Table management, split bills, waiter ID tracking. From Odoo POS lessons.
  5. **E-Commerce Plugins:** WooCommerce, Shopify auto-fiscalization.
- **Target:** 100 retail/restaurant outlets. Success: 10,000 invoices/day across all clients.
- **Timeline:** 6 months after Phase 1.

---

### TASK-033: Rewrite Phase 3 — USB Hardware
```
Status:     READY (after TASK-031)
Depends:    TASK-031
Agent:      manual
Sources:    design/docs/implementation/phase-3.md (current),
            design/docs-archive/hardware/ (preserved hardware docs as source)
Target:     design/docs/implementation/phase-3.md
Validate:   grep -q "USB Fiscal Memory" design/docs/implementation/phase-3.md
            grep -q "DEF homologation" design/docs/implementation/phase-3.md
```
**Instructions:**
Heavy rewrite — Phase 3 is USB hardware (formerly Phase 1):
- **Epics:**
  1. **USB Fiscal Memory Device:** Hardware design, secure MCU + SE + flash + RTC. $10-15 BOM target. Refer to archived docs for full spec.
  2. **Firmware + 2PC Protocol:** PREPARE → COMMIT handshake, nonce-based, USB CDC. Archived protocol.md has full command set.
  3. **Local Fiscal Service:** Mediator between POS terminals and USB device over LAN. Serializes concurrent requests.
  4. **DEF Homologation:** DGI certification, device registration protocol, key provisioning.
  5. **Migration Path:** Merchants can switch from cloud signing to USB device signing. Cloud service detects device presence and delegates signing authority.
- **Target:** Full DEF homologation. Merchants who need hardware-level trust can deploy USB devices.
- **Reference:** All archived hardware docs in `design/docs-archive/hardware/` remain the canonical spec.
- **Timeline:** 6 months after Phase 2.

---

### TASK-034: Create Phase 4 — Enterprise
```
Status:     READY (after TASK-031)
Depends:    TASK-031
Agent:      manual
Sources:    design/docs/implementation/phase-3.md (current — has enterprise content to extract)
Target:     design/docs/implementation/phase-4.md
Validate:   grep -q "ERP" design/docs/implementation/phase-4.md
```
**Instructions:**
Create Phase 4 enterprise page (extracted from old Phase 3):
- **Epics:**
  1. **ERP Connectors:** Odoo, SAP Business One, Microsoft Dynamics. Batch invoicing, inventory sync, accounting reconciliation.
  2. **Fleet Management:** Multi-outlet management dashboard. Device fleet monitoring (Phase 3 USB devices). Configuration drift alerts.
  3. **Advanced Analytics:** Revenue dashboards, tax liability forecasting, compliance scoring per outlet.
  4. **Webhook API v2:** Advanced event streaming, real-time audit feeds, compliance automation.
  5. **Multi-Country (Future):** Framework for expanding beyond DRC to other African markets with similar fiscal mandates.
- **Target:** Enterprise customers with 50+ outlets.
- **Timeline:** Ongoing after Phase 3.

---

## Phase 10 — ADRs

### TASK-035: Rewrite ADR-0003 — Platform Technology Stack
```
Status:     READY (after TASK-008)
Depends:    TASK-008
Agent:      manual
Sources:    design/docs/adr/adr-0003.md (current), docs/odoo-pos-lessons-for-kutapay.md
Target:     design/docs/adr/adr-0003.md
Validate:   grep -q "Invoicing Platform" design/docs/adr/adr-0003.md || grep -q "Platform Technology" design/docs/adr/adr-0003.md
```
**Instructions:**
Heavy rewrite — from "POS Technology Stack" to "Platform Technology Stack":
- **Decision:** Build the invoicing platform as a cloud-native REST API (Node.js/Python) with a PWA web dashboard (React/Vue).
- **Context:** Bono Pay is an invoicing platform, not a POS. No local daemon needed in Phase 1 (cloud is the fiscal authority). Dashboard must work offline (PWA + Service Worker + IndexedDB).
- **Options evaluated:** (1) Monolithic Django/Rails + server-rendered pages, (2) API-first (Node.js/FastAPI) + SPA dashboard (React), (3) Full serverless (Lambda/Functions), (4) Odoo module approach.
- **Rationale:** API-first enables SDK/integration ecosystem. SPA dashboard applies Odoo UX lessons (offline, touchscreen, instant search). Cloud-native deployment scales.
- **Consequences:** Dashboard is a separate SPA consuming the same API that SDK users call. Offline dashboard uses IndexedDB queue. No USB device dependency in Phase 1.

---

### TASK-036: Create ADR-0004 — Cloud Fiscal Signing
```
Status:     READY (after TASK-008)
Depends:    TASK-008
Agent:      manual
Sources:    .github/copilot-instructions.md (updated), docs/sfe-specifications-v1-summary.md
Target:     design/docs/adr/adr-0004.md
Validate:   grep -q "HSM" design/docs/adr/adr-0004.md
```
**Instructions:**
Create new ADR documenting the cloud signing decision:
- **Decision:** Use a Cloud HSM-backed signing service as the trusted fiscal authority in Phase 1.
- **Context:** The original architecture required a USB Fiscal Memory device from day 1. The strategic pivot to an invoicing platform requires a software-only path. Cloud HSM provides equivalent cryptographic guarantees (key isolation, tamper evidence, audit logging) without hardware deployment to merchants.
- **Options:** (1) Cloud HSM (AWS CloudHSM, Azure Dedicated HSM), (2) Software-only signing (keys in database — rejected: not tamper-resistant), (3) HashiCorp Vault Transit secrets engine, (4) Require USB hardware from day 1 (rejected: blocks software-first strategy).
- **Rationale:** Cloud HSM provides FIPS 140-2 Level 3 key protection, per-operation audit logs, and key rotation. It is the closest software equivalent to the secure element in the USB device.
- **Consequences:** Monotonic counter must be enforced at the database level (serializable isolation). Hash chaining must be maintained in PostgreSQL. Phase 3 migration path: USB device can take over signing when deployed.
- **Regulatory risk:** DRC regulations mandate DEF hardware for full homologation. Cloud HSM is SFE-compliant but may not satisfy DEF requirements without the physical device. Phase 3 addresses this.

---

### TASK-037: Create ADR-0005 — Strategic Pivot
```
Status:     READY (after TASK-036)
Depends:    TASK-036
Agent:      manual
Sources:    .github/copilot-instructions.md (updated)
Target:     design/docs/adr/adr-0005.md
Validate:   grep -q "invoicing platform" design/docs/adr/adr-0005.md
```
**Instructions:**
Create ADR documenting the strategic pivot:
- **Decision:** Pivot from POS + USB hardware product to API-first invoicing platform with phased hardware introduction.
- **Context:** Original design assumed POS+USB device from Phase 1. Market analysis showed: (1) SMBs need invoicing compliance before POS features, (2) hardware deployment logistics slow adoption, (3) an API-first approach enables faster go-to-market and broader integrations.
- **Options:** (1) Keep POS+hardware first (rejected: slow to market, high capex), (2) Invoicing platform with phased hardware (selected), (3) Pure SaaS with no hardware path (rejected: can't achieve full DEF homologation).
- **Rationale:** Software-first enables B2B pilot in 6 months with zero hardware. Cloud signing is SFE-compliant. Hardware path preserved for Phase 3 when merchants need full DEF certification.
- **Impact:** All documentation restructured. Hardware docs archived. Architecture rewritten for cloud-first. Implementation plan resequenced.

---

### TASK-038: Update ADR index
```
Status:     READY (after TASK-037)
Depends:    TASK-037
Agent:      manual
Sources:    design/docs/adr/index.md (current)
Target:     design/docs/adr/index.md
Validate:   grep -q "0005" design/docs/adr/index.md
```
**Instructions:**
Update ADR index to include all decisions:
- ADR-0001: Two-Phase Commit for USB Protocol — Status: Accepted (applies Phase 3)
- ADR-0002: Signature Algorithm Selection — Status: Proposed (applies Phase 3 hardware + Phase 1 cloud HSM)
- ADR-0003: Platform Technology Stack — Status: Accepted (renamed from POS)
- ADR-0004: Cloud Fiscal Signing — Status: Accepted
- ADR-0005: Strategic Pivot to Invoicing Platform — Status: Accepted
- Remove broken links to files outside MkDocs tree. Use relative links to in-tree ADR pages only.

---

## Phase 11 — Validation & Final Assembly

### TASK-039: Strict build validation and link check
```
Status:     READY (after TASK-025, TASK-026, TASK-027, TASK-028, TASK-029, TASK-030, TASK-031, TASK-032, TASK-033, TASK-034, TASK-035, TASK-036, TASK-037, TASK-038)
Depends:    all previous tasks
Agent:      manual
Sources:    design/**
Target:     (fix any broken links or build warnings)
Validate:   cd design && python -m mkdocs build --strict 2>&1 | tail -5  (zero warnings)
```
**Instructions:**
1. Run `cd design && python -m mkdocs build --strict`.
2. Fix any broken cross-references (links to archived files, renamed pages, etc.).
3. Verify all Mermaid diagrams parse correctly (no unquoted label errors).
4. Verify no references to "KutaPay" remain (should all be "Bono Pay").
5. Verify no orphaned pages (pages in docs/ not in nav).
6. Re-run strict build until clean.

---

### TASK-040: Final commit, memory bank update, and push
```
Status:     READY (after TASK-039)
Depends:    TASK-039
Agent:      manual
Sources:    All project files
Target:     memory-bank/activeContext.md, memory-bank/progress.md
Validate:   Memory bank reflects completed pivot state
```
**Instructions:**
1. Update `memory-bank/activeContext.md` — Status: Pivot documentation complete. Focus: begin Phase 1 implementation (cloud signing service, invoicing API).
2. Update `memory-bank/progress.md` — What works: complete MkDocs documentation for invoicing platform. What's next: implement Phase 1 software. Hardware docs archived for Phase 3.
3. Final commit: `git add -A && git commit -m "docs: complete strategic pivot — invoicing platform first, hardware Phase 3"`.
4. Push: `git push origin main`.

---

### TASK-041: Generate pivot summary report
```
Status:     READY (after TASK-040)
Depends:    TASK-040
Agent:      manual
Sources:    git log, design/**
Target:     (console output only — no file creation needed)
Validate:   (informational — always passes)
```
**Instructions:**
Print a summary of the pivot:
1. `git diff --stat origin/main..HEAD` — show all files changed.
2. `find design/docs -name "*.md" | wc -l` — count pages in main site.
3. `find design/docs-archive -name "*.md" | wc -l` — count archived pages.
4. `grep -r "Bono Pay" design/docs/ | wc -l` — count brand references.
5. `grep -r "KutaPay" design/docs/ | wc -l` — should be 0.
6. Print: "Pivot complete. X pages in site, Y pages archived, Z brand references. Ready for Phase 1 implementation."

---

## Appendix A — PROMPT Files

### PROMPT_build.md
```
0a. Read IMPLEMENTATION_PLAN.md.
0b. Read memory-bank/*.md for context.
0c. Read relevant spec/*.md files.

1. Find the FIRST task with Status: READY whose dependencies are all DONE.
2. Execute it following the exact Instructions in that task.
3. If the task says to use an agent, follow the agent's instructions yourself.
4. Write output to the exact Target path specified.
5. Run the Validate check. If it fails, fix the output.
6. Update IMPLEMENTATION_PLAN.md: change Status: READY → Status: DONE, add Completed: date.
7. git add -A && git commit -m "docs: [TASK-ID] [short description]"
8. STOP. Do not start the next task.

RULES:
- Read ONLY the Source files listed for that task.
- Write complete content, no placeholders or stubs.
- Include Mermaid diagrams where specified. Always quote labels containing ( ) / , with double quotes.
- Follow MkDocs Material conventions (admonitions, tabs, etc.).
- Use "Bono Pay" as the product name everywhere. Never "KutaPay."
- The product is a fiscal invoicing platform (like Stripe Invoices), NOT a POS system.
- Phase 1 is software-only. Cloud Signing Service (HSM) is the trusted fiscal authority.
- USB hardware is Phase 3, archived out of the main docs site.
```

## Appendix B — New Nav Structure

```yaml
nav:
  - Home: index.md
  - Architecture:
    - Overview: architecture/overview.md
    - Trust Boundary: architecture/trust-boundary.md
    - Component Map: architecture/components.md
    - Data Flow: architecture/data-flow.md
  - Invoicing Platform:
    - Product Overview: platform/overview.md
    - Invoicing API: platform/api.md
    - Web Dashboard: platform/dashboard.md
    - SDK & Libraries: platform/sdk.md
  - Fiscal Engine:
    - Invoice Lifecycle: fiscal/invoice-lifecycle.md
    - Tax Engine (14 Groups): fiscal/tax-engine.md
    - Security Elements: fiscal/security-elements.md
    - Reports (Z/X/A): fiscal/reports.md
  - Cloud & Sync:
    - Cloud Architecture: cloud/architecture.md
    - Offline-First Sync: cloud/offline-sync.md
    - DGI Integration: cloud/dgi-integration.md
  - Platform & Integrations:
    - Multi-User Access: platform/multi-user.md
    - Integrations: platform/integrations.md
  - Regulatory:
    - DRC Legal Framework: regulatory/legal-framework.md
    - "Arrêté Summary": regulatory/arretes.md
    - SFE Specifications: regulatory/sfe-specs.md
  - ADRs:
    - Index: adr/index.md
    - "0001 - Two-Phase Commit": adr/adr-0001.md
    - "0002 - Signature Algorithm": adr/adr-0002.md
    - "0003 - Platform Technology Stack": adr/adr-0003.md
    - "0004 - Cloud Fiscal Signing": adr/adr-0004.md
    - "0005 - Strategic Pivot": adr/adr-0005.md
  - Implementation:
    - Roadmap: implementation/roadmap.md
    - "Phase 1 - Software Invoicing": implementation/phase-1.md
    - "Phase 2 - POS & Retail": implementation/phase-2.md
    - "Phase 3 - USB Hardware": implementation/phase-3.md
    - "Phase 4 - Enterprise": implementation/phase-4.md
  - API Reference:
    - Cloud API: api/cloud.md
    - Invoicing SDK: api/invoicing-sdk.md
```

## Appendix C — Key Source Documents

| Document | Purpose | Location |
|----------|---------|----------|
| DISCUSSION.md | Full regulatory analysis + design decisions (12K lines) | project root |
| kutapay_technical_design.md | Original technical design narrative | project root |
| SFE Specifications v1 Summary | DGI technical requirements for billing systems | docs/sfe-specifications-v1-summary.md |
| Arrete summaries (032/033/034/016) | Regulatory context | docs/arrete-*-summary.md |
| Odoo POS Lessons | UX/offline/PWA patterns to adopt for dashboard | docs/odoo-pos-lessons-for-kutapay.md |
| Original architecture spec | EARS requirements (rewrite target) | spec/architecture-kutapay-system-1.md |
| Archived hardware docs | USB device specs for Phase 3 | design/docs-archive/hardware/ |
| Archived POS docs | Multi-terminal, UI/UX, integrations (source for rewrites) | design/docs-archive/pos/ |
