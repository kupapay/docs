# KutaPay Technical Design Documentation — Implementation Plan

> **Pattern:** [Ralph Loop](https://ghuntley.com/ralph/) — autonomous iteration with fresh context per cycle.
> **State lives on disk, not in the model's context.** Each iteration reads this file, picks one task, executes it, updates the status, commits, and exits.

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
│    │  2. Read source docs (DISCUSSION.md, specs, ADRs)        │  │
│    │  3. Find first task with status: READY                   │  │
│    │  4. Invoke the specified agent/prompt/skill               │  │
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
2. **Read only the source files listed** in that task's `Sources` field — do not read the entire DISCUSSION.md (12K lines) unless the task says to.
3. **Invoke the agent/prompt specified** — use exactly the `@agent` or `/prompt` listed. If the task says "manual," write it yourself.
4. **Write to the exact target path** — create directories as needed.
5. **Validate** — run the check described in `Validate`. If it fails, fix before committing.
6. **Update status in this file** — change `Status: READY` → `Status: DONE` and add `Completed: YYYY-MM-DD`.
7. **Commit** — `git add -A && git commit -m "docs: [task-id] [short description]"`.
8. **Exit** — do not start the next task. The loop will spawn a fresh session.

### How to Run

**Manual (in VS Code Copilot Chat):**
Paste this prompt each iteration:
```
Read IMPLEMENTATION_PLAN.md. Find the first task with Status: READY.
Execute it following the rules in that file. Update the status when done.
Commit with message "docs: [TASK-ID] [description]".
```

**Automated (Copilot SDK):**
```bash
python .github/cookbook/copilot-sdk/python/recipe/ralph_loop.py build 30
```
Requires `PROMPT_build.md` (see Appendix A).

---

## Status Summary

| Phase | Tasks | Done | Status |
|-------|-------|------|--------|
| 0 — Scaffolding | 3 | 1 | IN PROGRESS |
| 1 — Architecture | 6 | 0 | BLOCKED by Phase 0 |
| 2 — Hardware | 4 | 0 | BLOCKED by Phase 1 |
| 3 — Fiscal Engine | 4 | 0 | BLOCKED by Phase 1 |
| 4 — Cloud & Sync | 3 | 0 | BLOCKED by Phase 1 |
| 5 — POS Application | 3 | 3 | DONE |
| 6 — Regulatory | 3 | 0 | READY (independent) |
| 7 — API Reference | 3 | 0 | BLOCKED by Phase 2+3 |
| 8 — Implementation Roadmap | 4 | 0 | BLOCKED by Phase 1-5 |
| 9 — ADRs | 3 | 0 | BLOCKED by Phase 1 |
| 10 — Validation & Review | 4 | 0 | BLOCKED by Phase 1-9 |
| 11 — Final Assembly | 2 | 0 | BLOCKED by Phase 10 |
| **Total** | **42** | **1** | |

---

## Phase 0 — Scaffolding

### TASK-001: Initialize MkDocs project
```
Status:     DONE
Completed:  2026-02-16
Agent:      manual (create files directly)
Sources:    (none — project setup)
Target:     design/mkdocs.yml, design/docs/index.md
Validate:   cd design && mkdocs build --strict 2>&1 | head -20
```
**Instructions:**
1. Run `pip install mkdocs mkdocs-material mkdocs-mermaid2-plugin` if not installed.
2. Create `design/` directory at project root.
3. Create `design/mkdocs.yml` with:
   - `site_name: KutaPay Technical Design`
   - `theme: material` with slate scheme, deep purple primary
   - Plugins: search, mermaid2
   - Extensions: pymdownx.superfences (with mermaid fence), admonition, pymdownx.details, pymdownx.tabbed, attr_list, def_list, tables, toc with permalink
   - Full `nav:` tree (see Appendix B for the complete nav structure)
4. Create `design/docs/index.md` with a landing page:
   - Project title, one-paragraph summary
   - Links to major sections
   - "How to use this documentation" section
5. Create empty placeholder `.md` files for every page in the nav tree (just `# Title` + `!!! note "Coming soon"`)

---

### TASK-002: Initialize memory bank
```
Status:     DONE
Completed:  2026-02-16
Agent:      manual (create files directly)
Sources:    kutapay_technical_design.md, .github/copilot-instructions.md
Target:     memory-bank/projectbrief.md, memory-bank/techContext.md,
            memory-bank/activeContext.md, memory-bank/productContext.md,
            memory-bank/systemPatterns.md, memory-bank/progress.md
Validate:   ls memory-bank/*.md | wc -l  (expect 6)
```
**Instructions:**
Create the 6 core memory-bank files per the memory-bank instruction pattern.
- `projectbrief.md` — KutaPay mission, core problem, solution, success criteria, key constraints
- `techContext.md` — Stack decisions (hardware + software), BOM target, open questions, decided items (2PC protocol)
- `activeContext.md` — Current phase: pre-implementation / technical design documentation
- `productContext.md` — Why KutaPay exists, problems it solves, target users, UX goals
- `systemPatterns.md` — Trust boundary pattern, per-outlet model, offline-first, 2PC protocol, hash-chained journal
- `progress.md` — What exists (design docs, regulatory summaries, ADR-0001), what's left (everything else)

---

### TASK-003: Create spec directory with architecture spec
```
Status:     DONE
Completed:  2026-02-16
Agent:      @specification
Sources:    kutapay_technical_design.md, docs/sfe-specifications-v1-summary.md,
            docs/adr/adr-0001-two-phase-commit-usb-protocol.md,
            .github/copilot-instructions.md
Target:     spec/architecture-kutapay-system-1.md
Validate:   File exists and contains EARS-notation requirements (grep "SHALL" spec/architecture-kutapay-system-1.md)
```
**Instructions:**
```
@specification Generate a system architecture specification for KutaPay.

Read these files:
- kutapay_technical_design.md
- docs/sfe-specifications-v1-summary.md
- docs/adr/adr-0001-two-phase-commit-usb-protocol.md
- .github/copilot-instructions.md

Generate EARS-notation requirements covering:
1. Trust boundary (POS untrusted, USB device trusted)
2. Invoice lifecycle (6 mandatory steps)
3. Offline-first design (local fiscalization, deferred upload)
4. Multi-terminal per-outlet model
5. Security elements (fiscal number, device ID, signature, timestamp, QR)
6. Tax engine (14 DGI tax groups)
7. Invoice types (sale, advance, credit note, export, export credit note)
8. Reports (Z, X, A, audit export)
9. Void/refund as new fiscal events
10. USB protocol (2PC: PREPARE → COMMIT)

Save to /spec/architecture-kutapay-system-1.md
```

---

## Phase 1 — Architecture Section

### TASK-004: Architecture overview page with diagrams
```
Status:     DONE (after TASK-001)
Completed:  2026-02-16
Depends:    TASK-001, TASK-003
Agent:      @gem-documentation-writer
Sources:    spec/architecture-kutapay-system-1.md, kutapay_technical_design.md,
            .github/copilot-instructions.md
Target:     design/docs/architecture/overview.md
Validate:   grep -c "mermaid" design/docs/architecture/overview.md  (expect ≥ 3)
```
**Instructions:**
```
@gem-documentation-writer Write the architecture overview page for KutaPay's MkDocs site.

Read: spec/architecture-kutapay-system-1.md, kutapay_technical_design.md

Include these Mermaid diagrams:
1. C4 Context diagram (cashier, owner, auditor → KutaPay → DGI, payment providers)
2. Trust boundary diagram (untrusted POS zone vs trusted USB device zone)
3. Component map (POS layer → fiscal service → USB device → cloud layer)

Use MkDocs Material admonitions for warnings about the trust boundary rule.
Write for developers joining the project. Output valid Markdown with mermaid fences.
Save to design/docs/architecture/overview.md
```

---

### TASK-005: Trust boundary deep-dive
```
Status:     DONE (after TASK-001)
Completed:  2026-02-16
Depends:    TASK-001, TASK-003
Agent:      @se-system-architecture-reviewer + @gem-documentation-writer
Sources:    spec/architecture-kutapay-system-1.md,
            docs/adr/adr-0001-two-phase-commit-usb-protocol.md
Target:     design/docs/architecture/trust-boundary.md
Validate:   File contains "untrusted" and "trusted" and at least one mermaid diagram
```
**Instructions:**
Step 1 — Review:
```
@se-system-architecture-reviewer Review the trust boundary design in
spec/architecture-kutapay-system-1.md and docs/adr/adr-0001-two-phase-commit-usb-protocol.md.
Identify: violations, missing failure modes, unclear boundaries.
Output findings to a temporary review note.
```
Step 2 — Write:
```
@gem-documentation-writer Write design/docs/architecture/trust-boundary.md.
Deep-dive into the trust boundary. Include:
- What crosses the boundary (canonical payload → fiscal response)
- What NEVER crosses (private keys, fiscal numbers, counters — these stay in device)
- Failure modes at the boundary (power loss, cable disconnect, corrupt payload)
- Mermaid diagram showing data flow across boundary
- Table of trust assumptions
- Incorporate any findings from the architecture review.
```

---

### TASK-006: Component map
```
Status:     DONE (after TASK-001)
Completed:  2026-02-17
Depends:    TASK-001, TASK-003
Agent:      @gem-documentation-writer
Sources:    spec/architecture-kutapay-system-1.md, DISCUSSION.md lines 6975-7050
Target:     design/docs/architecture/components.md
Validate:   grep -c "mermaid" design/docs/architecture/components.md  (expect ≥ 2)
```
**Instructions:**
```
@gem-documentation-writer Write design/docs/architecture/components.md.
Detail every component in the system:

POS Layer: Sale Entry, Receipt Printer, Sync Queue, Product Catalog, Tax Engine UI
Fiscal Service: Device Proxy, Tax Calculation Engine, Canonical Serializer, Multi-Terminal Mediator
USB Device: Schema Validator, Monotonic Counter, ECDSA Signer, Hash-Chained Journal, RTC, Report Generator
Cloud: Cloud API, Sync Engine, Invoice Store, Device Registry, Dashboard

For each: purpose, inputs, outputs, dependencies.
Include a detailed Mermaid component diagram showing all connections.
Include a deployment diagram (single-terminal vs multi-terminal).
```

---

### TASK-007: Data flow diagrams
```
Status:     DONE (after TASK-001)
Completed:  2026-02-17
Depends:    TASK-001, TASK-003
Agent:      @gem-documentation-writer + excalidraw skill (optional)
Sources:    spec/architecture-kutapay-system-1.md
Target:     design/docs/architecture/data-flow.md
Validate:   File contains at least 2 mermaid sequence or flowchart diagrams
```
**Instructions:**
```
@gem-documentation-writer Write design/docs/architecture/data-flow.md.
Document the major data flows:

1. Happy path: Sale → Tax calc → Canonical payload → PREPARE → COMMIT → Print → Sync → DGI
   (Mermaid sequence diagram)
2. Offline flow: Same as above but sync deferred — show queue behavior
   (Mermaid sequence diagram)
3. Void flow: Original sale → Void request → New fiscal event → Print void receipt
   (Mermaid sequence diagram)
4. Refund flow: Original sale → Refund request → Credit note → New fiscal event
   (Mermaid sequence diagram)
5. Multi-terminal flow: Multiple POS → Fiscal Service mediator → Single USB device
   (Mermaid flowchart)
```

---

### TASK-008: Excalidraw system diagram (optional, visual)
```
Status:     DONE (after TASK-001)
Completed:  2026-02-17
Depends:    TASK-001
Agent:      excalidraw-diagram-generator skill
Sources:    spec/architecture-kutapay-system-1.md
Target:     design/docs/architecture/kutapay-system-overview.excalidraw
Validate:   File is valid JSON and contains "elements"
```
**Instructions:**
Read the excalidraw-diagram-generator skill instructions from:
`.github/skills/excalidraw-diagram-generator/SKILL.md`

Then generate:
```
Create an Excalidraw system architecture diagram for KutaPay showing:
- POS Application (phone/tablet/PC) in an "untrusted" zone (red border)
- USB Fiscal Memory device in a "trusted" zone (green border)
- KutaPay Cloud
- DGI Tax Authority
- Arrows: canonical payload, fiscal response, sealed invoice upload
- Labels on each arrow showing data type
```

---

### TASK-009: Context map for ongoing sessions
```
Status:     DONE (after TASK-003)
Completed:  2026-02-17
Depends:    TASK-003
Agent:      @context-architect
Sources:    all project files
Target:     memory-bank/context-map.md (informational, not a design doc)
Validate:   File exists and lists file dependencies
```
**Instructions:**
```
@context-architect Map all files relevant to KutaPay's architecture.
Include: docs/*.md, docs/adr/*.md, spec/*.md, design/docs/**/*.md,
kutapay_technical_design.md, DISCUSSION.md, memory-bank/*.md.
Identify: which files inform which design sections, gaps, and missing context.
Save the map to memory-bank/context-map.md.
```

---

## Phase 2 — Hardware Section

### TASK-010: USB Fiscal Memory device page
```
Status:     DONE (after TASK-004)
Completed:  2026-02-17
Depends:    TASK-004
Agent:      @gem-documentation-writer
Sources:    DISCUSSION.md lines 6960-7020 (hardware overview),
            kutapay_technical_design.md section 6,
            spec/architecture-kutapay-system-1.md
Target:     design/docs/hardware/usb-device.md
Validate:   File contains BOM table and at least one diagram
```
**Instructions:**
```
@gem-documentation-writer Write design/docs/hardware/usb-device.md.
Cover:
- Device purpose and form factor (USB-C female, cable-connected)
- Block diagram (Mermaid: MCU ↔ SE ↔ Flash ↔ RTC ↔ USB-C)
- Capabilities: sign, number, timestamp, store, report
- Physical characteristics: LED indicator, tamper detection
- Operating environment (DRC: heat, dust, power instability)
- Comparison to similar devices (Italian fiscal memory, EFDs, hardware wallets)
```

---

### TASK-011: USB 2PC protocol specification
```
Status:     DONE (after TASK-004)
Completed:  2026-02-17
Depends:    TASK-004
Agent:      @specification
Sources:    docs/adr/adr-0001-two-phase-commit-usb-protocol.md,
            DISCUSSION.md lines 5690-5740 (2PC rationale),
            DISCUSSION.md lines 7120-7200 (protocol framing),
            spec/architecture-kutapay-system-1.md
Target:     spec/protocol-usb-fiscal-device-1.md
            design/docs/hardware/protocol.md (MkDocs page derived from spec)
Validate:   spec file contains command definitions; design page contains sequence diagram
```
**Instructions:**
Step 1 — Spec:
```
@specification Generate a USB CDC protocol specification for KutaPay.
Define ALL commands:
- TXN|PREPARE — request/response format, error codes, timeout
- TXN|COMMIT — request/response format, nonce validation, error codes
- QRY|STATUS — device health, free memory, next invoice number
- QRY|LOG <n> — retrieve specific journal entry
- RPT|Z — generate Z report (daily closure)
- RPT|X — generate X report (periodic)
- RPT|A — generate A report (article-level)
- ADM|DUMPLOG — full journal export for audit
- ADM|RESET — authorized counter reset (requires DGI code)
- CFG|TIME — set/verify RTC
- CFG|INIT — device activation/registration

For each: message format (STX/ETX framing), payload schema, response schema,
error codes, timeout, retry behavior, and example.

Include canonical JSON payload specification with exact field order.
Save to spec/protocol-usb-fiscal-device-1.md
```
Step 2 — MkDocs page:
```
@gem-documentation-writer Convert spec/protocol-usb-fiscal-device-1.md into
design/docs/hardware/protocol.md.
Add Mermaid sequence diagrams for: happy path (PREPARE→COMMIT),
error path (PREPARE→reject), and power-loss recovery.
Add admonitions for critical rules. Cross-reference ADR-0001.
```

---

### TASK-012: Secure Element deep-dive
```
Status:     DONE (after TASK-010)
Completed:  2026-02-17
Depends:    TASK-010
Agent:      @gem-documentation-writer + @se-security-reviewer
Sources:    DISCUSSION.md lines 7285-7400 (SE section),
            spec/architecture-kutapay-system-1.md
Target:     design/docs/hardware/secure-element.md
Validate:   File discusses key management and signature algorithm
```
**Instructions:**
Step 1 — Security review:
```
@se-security-reviewer Review the Secure Element design described in
DISCUSSION.md lines 7285-7400. Assess:
- Key generation (device-generated vs DGI-issued)
- ECDSA P-256 vs Ed25519 for constrained MCU
- Anti-cloning protections
- Monotonic counter usage
- Backup key policy (no private key backup by design)
Output findings.
```
Step 2 — Write page:
```
@gem-documentation-writer Write design/docs/hardware/secure-element.md.
Cover: key management, signing algorithm, monotonic counter, anti-cloning,
verification flow, performance characteristics. Include diagram of
signing flow (MCU hashes → SE signs → response includes signature).
Incorporate security review findings as admonitions.
```

---

### TASK-013: BOM & manufacturing
```
Status:     DONE
Completed:  2026-02-17
Depends:    TASK-010
Agent:      manual
Sources:    DISCUSSION.md lines 7200-7285 (BOM section),
            kutapay_technical_design.md section 6
Target:     design/docs/hardware/bom.md
Validate:   File contains cost breakdown table
```
**Instructions:**
Write the BOM page with a detailed cost table:

| Component | Example Part | Qty | Unit Cost (USD) | Notes |
|-----------|-------------|-----|----------------|-------|
| Secure MCU | STM32L4 / NXP Kinetis | 1 | $3.00-5.00 | ARM Cortex-M4/M33, crypto accelerators |
| Secure Element | ATECC608B / SE050 | 1 | $1.00-2.00 | ECC signatures, secure key storage |
| ... (complete from DISCUSSION.md) |

Include: total COGS estimate, sensitivity analysis (what if SE costs double?),
retail pricing strategy, manufacturing considerations.

---

## Phase 3 — Fiscal Engine Section

### TASK-014: Invoice lifecycle page
```
Status:     DONE
Completed:  2026-02-17
Depends:    TASK-004
Agent:      @gem-documentation-writer
Sources:    spec/architecture-kutapay-system-1.md,
            docs/sfe-specifications-v1-summary.md,
            .github/copilot-instructions.md (invoice lifecycle section)
Target:     design/docs/fiscal/invoice-lifecycle.md
Validate:   Contains state diagram AND sequence diagram (grep "stateDiagram\|sequenceDiagram")
```
**Instructions:**
```
@gem-documentation-writer Write design/docs/fiscal/invoice-lifecycle.md.
Include:
1. The 6-step non-negotiable flow (sequence diagram with all actors)
2. Invoice state machine (stateDiagram-v2: Draft → Preparing → Prepared → Fiscalized → Delivered → Synced)
3. Invoice types table (all 5 types with codes and descriptions)
4. Void flow (new fiscal event, not deletion)
5. Refund flow (credit note, references original)
6. Draft cancellation (no fiscal trace)
7. Admonition: "Nothing is ever deleted"
```

---

### TASK-015: Tax engine (14 DGI groups)
```
Status:     DONE (after TASK-004)
Completed:  2026-02-17
Depends:    TASK-004
Agent:      @specification + @gem-documentation-writer
Sources:    docs/sfe-specifications-v1-summary.md,
            DISCUSSION.md (search for "tax group" sections)
Target:     spec/schema-tax-engine-1.md, design/docs/fiscal/tax-engine.md
Validate:   Spec file lists all 14 tax groups; design page has a table
```
**Instructions:**
Step 1:
```
@specification Generate a tax engine schema specification.
Read docs/sfe-specifications-v1-summary.md.
Define all 14 DGI tax groups with: code, name, rate, applicability rules.
Define client classifications: individual, company, commercial individual, professional, embassy.
Define tax calculation rules and rounding.
Save to spec/schema-tax-engine-1.md
```
Step 2:
```
@gem-documentation-writer Convert spec/schema-tax-engine-1.md into
design/docs/fiscal/tax-engine.md. Add a decision tree diagram (Mermaid flowchart)
for "which tax group applies?" Include worked examples.
```

---

### TASK-016: Security elements on invoices
```
Status:     DONE (after TASK-004)
Completed:  2026-02-17
Depends:    TASK-004
Agent:      @gem-documentation-writer
Sources:    docs/sfe-specifications-v1-summary.md,
            kutapay_technical_design.md section 5,
            spec/architecture-kutapay-system-1.md
Target:     design/docs/fiscal/security-elements.md
Validate:   File mentions all 5 elements: fiscal number, device ID, signature, timestamp, QR
```
**Instructions:**
```
@gem-documentation-writer Write design/docs/fiscal/security-elements.md.
Document the 5 mandatory security elements on every invoice:
1. Sequential fiscal invoice number (device-controlled)
2. Device ID (DEF NID)
3. Cryptographic authentication code (signature)
4. Trusted timestamp (from device RTC)
5. QR code encoding verification data

For each: what it is, who generates it, where it appears on receipt,
how it's verified, what happens if it's missing.
Include a mock receipt diagram showing element placement.
```

---

### TASK-017: Reports (Z/X/A) specification
```
Status:     DONE
Completed:  2026-02-17
Depends:    TASK-004
Agent:      @specification + @gem-documentation-writer
Sources:    docs/sfe-specifications-v1-summary.md,
            DISCUSSION.md (search for "Z report" "X report" "A report")
Target:     spec/process-fiscal-reports-1.md, design/docs/fiscal/reports.md
Validate:   Spec defines all 3 report types + audit export
```
**Instructions:**
Step 1:
```
@specification Generate a fiscal reports specification.
Define: Z report (daily closure — contents, triggers, mandatory fields),
X report (periodic — configurable period, contents), A report (article-level — per-item breakdown),
Audit export (complete journal dump for tax authority).
Save to spec/process-fiscal-reports-1.md
```
Step 2:
```
@gem-documentation-writer Convert to design/docs/fiscal/reports.md.
Include sample report outputs (mock data).
```

---

## Phase 4 — Cloud & Sync Section

### TASK-018: Cloud architecture
```
Status:     DONE (after TASK-004)
Completed:  2026-02-17
Depends:    TASK-004
Agent:      @gem-documentation-writer
Sources:    spec/architecture-kutapay-system-1.md,
            DISCUSSION.md lines 7030-7060 (sync agent section)
Target:     design/docs/cloud/architecture.md
Validate:   Contains deployment diagram
```
**Instructions:**
```
@gem-documentation-writer Write design/docs/cloud/architecture.md.
Cover: cloud service responsibilities (sync, backup, DGI upload, device registry, dashboard),
deployment options (serverless vs containers), multi-tenant model,
data residency considerations for DRC.
Include Mermaid deployment diagram.
```

---

### TASK-019: Offline-first sync design
```
Status:     DONE (after TASK-018)
Completed:  2026-02-17
Depends:    TASK-018
Agent:      @gem-documentation-writer
Sources:    spec/architecture-kutapay-system-1.md,
            DISCUSSION.md (search for "offline" sections)
Target:     design/docs/cloud/offline-sync.md
Validate:   Contains sync state machine diagram
```
**Instructions:**
```
@gem-documentation-writer Write design/docs/cloud/offline-sync.md.
Cover: sync queue design, retry logic, conflict resolution, grace period
for DGI upload, sync status indicators in POS UI, bandwidth optimization.
Include Mermaid state diagram for invoice sync states:
PENDING_SYNC → UPLOADING → ACKNOWLEDGED / RETRY / FAILED.
```

---

### TASK-020: DGI integration (with technical spike)
```
Status:     DONE (after TASK-018)
Completed:  2026-02-17
Depends:    TASK-018
Agent:      @research-technical-spike + @gem-documentation-writer
Sources:    docs/sfe-specifications-v1-summary.md,
            docs/arrete-033-summary.md,
            kutapay_technical_design.md section 7
Target:     spec/infrastructure-dgi-integration-1.md,
            design/docs/cloud/dgi-integration.md
Validate:   Spike document lists open questions and known facts
```
**Instructions:**
Step 1 — Research spike:
```
@research-technical-spike
Spike: DGI MCF/e-MCF API Integration
Time-box: focused analysis of available docs only
Goal: Catalog what we KNOW vs what we DON'T KNOW about the DGI API.
Read: docs/sfe-specifications-v1-summary.md, docs/arrete-033-summary.md.
Structure output as: KNOWN (endpoint patterns, auth hints, data requirements)
vs UNKNOWN (exact API spec, auth method, error handling, offline rules).
Save to spec/infrastructure-dgi-integration-1.md
```
Step 2 — Write page:
```
@gem-documentation-writer Write design/docs/cloud/dgi-integration.md.
Based on the spike findings. Mark unknowns clearly with ??? admonitions.
Include integration architecture diagram showing KutaPay Cloud → DGI MCF.
```

---

## Phase 5 — POS Application Section

### TASK-021: Multi-terminal design
```
Status:     DONE (after TASK-004)
Completed:  2026-02-17
Depends:    TASK-004
Agent:      @gem-documentation-writer
Sources:    spec/architecture-kutapay-system-1.md,
            .github/copilot-instructions.md (multi-terminal section),
            DISCUSSION.md (search for "multi-terminal" "multiple POS")
Target:     design/docs/pos/multi-terminal.md
Validate:   Contains deployment diagram for single-terminal AND multi-terminal
```
**Instructions:**
```
@gem-documentation-writer Write design/docs/pos/multi-terminal.md.
Cover: per-outlet device model, local fiscal service mediator,
Wi-Fi/LAN connection between POS terminals and device,
concurrency handling (who gets the next fiscal number?),
payload includes outlet_id + pos_terminal_id + cashier_id.
Diagrams: single-terminal setup, retail (10 lanes), restaurant (mobile waiters).
```

---

### TASK-022: UI/UX design direction
```
Status:     DONE (after TASK-004)
Completed:  2026-02-17
Depends:    TASK-004
Agent:      @se-ux-ui-designer + @gem-documentation-writer
Sources:    docs/odoo-pos-lessons-for-kutapay.md,
            DISCUSSION.md lines 6975-7030 (POS features)
Target:     design/docs/pos/ui-ux.md
Validate:   File contains user journey description and wireframe descriptions
```
**Instructions:**
Step 1:
```
@se-ux-ui-designer Review docs/odoo-pos-lessons-for-kutapay.md.
Define UX principles for KutaPay POS:
- Checkout speed (target: < 5 seconds to fiscalize)
- Offline indicators
- Error recovery flows (device disconnected, nonce expired)
- Localization (French, Lingala)
- Mobile-first (Android tablets)
```
Step 2:
```
@gem-documentation-writer Write design/docs/pos/ui-ux.md.
Include: key user journeys (sale, void, refund, Z-report),
UX principles, screen descriptions, accessibility considerations.
```

---

### TASK-023: Integration strategy
```
Status:     DONE (after TASK-004)
Completed:  2026-02-17
Depends:    TASK-004
Agent:      @gem-documentation-writer
Sources:    .github/copilot-instructions.md (integration priority section),
            kutapay_technical_design.md
Target:     design/docs/pos/integrations.md
Validate:   File lists integration priority order
```
**Instructions:**
```
@gem-documentation-writer Write design/docs/pos/integrations.md.
Document the integration priority:
1. Core fiscal API (USB device communication)
2. CSV import/export
3. Accounting export
4. Webhooks
5. E-commerce plugins
6. ERP connectors (Odoo, SAP)
For each: target users, data format, authentication, example payload.
```

---

## Phase 6 — Regulatory Section (independent, can start anytime)

### TASK-024: DRC legal framework overview
```
Status:     DONE
Completed:  2026-02-17
Agent:      @gem-documentation-writer
Sources:    docs/arrete-032-summary.md, docs/arrete-033-summary.md,
            docs/arrete-034-summary.md, docs/arrete-016-2025-summary.md,
            docs/sfe-specifications-v1-summary.md
Target:     design/docs/regulatory/legal-framework.md
Validate:   File references all 5 regulatory documents
```
**Instructions:**
```
@gem-documentation-writer Write design/docs/regulatory/legal-framework.md.
Create a one-page overview of DRC's fiscal compliance framework.
Include: regulatory hierarchy diagram (Mermaid flowchart),
summary table of all 5 documents with scope and KutaPay impact,
timeline of regulation adoption, key compliance deadlines.
```

---

### TASK-025: Arrêté summaries page
```
Status:     DONE
Completed:  2026-02-17
Agent:      manual (compile from existing summaries)
Sources:    docs/arrete-032-summary.md, docs/arrete-033-summary.md,
            docs/arrete-034-summary.md, docs/arrete-016-2025-summary.md
Target:     design/docs/regulatory/arretes.md
Validate:   File consolidates all 4 arrêté summaries
```
**Instructions:**
Consolidate the 4 existing arrêté summaries into a single MkDocs page.
Use tabbed content (pymdownx.tabbed) — one tab per arrêté.
Add cross-references between them where they interact.

---

### TASK-026: SFE specifications page
```
Status:     DONE
Completed:  2026-02-17
Agent:      manual (compile from existing summary)
Sources:    docs/sfe-specifications-v1-summary.md
Target:     design/docs/regulatory/sfe-specs.md
Validate:   File contains the 14 tax groups and 5 invoice types
```
**Instructions:**
Convert the existing SFE summary into a MkDocs page.
Add structured tables for: tax groups, invoice types, report types, security elements.
Cross-reference to the relevant design pages (fiscal engine, hardware, reports).

---

## Phase 7 — API Reference

### TASK-027: USB device API reference
```
Status:     DONE (after TASK-011)
Completed:  2026-02-17
Depends:    TASK-011
Agent:      @se-technical-writer
Sources:    spec/protocol-usb-fiscal-device-1.md
Target:     design/docs/api/usb-device.md
Validate:   File contains all command definitions with request/response examples
```
**Instructions:**
```
@se-technical-writer Write design/docs/api/usb-device.md as an API reference.
For each USB command: synopsis, request format, response format,
error codes, example request, example response, notes.
Format as a reference document (not narrative). Use code blocks for examples.
```

---

### TASK-028: Cloud API reference
```
Status:     DONE (after TASK-018)
Completed:  2026-02-17
Depends:    TASK-018
Agent:      @specification + @se-technical-writer
Sources:    spec/architecture-kutapay-system-1.md,
            spec/infrastructure-dgi-integration-1.md
Target:     spec/design-cloud-api-1.md, design/docs/api/cloud.md
Validate:   Spec lists all endpoints; design page has example payloads
```
**Instructions:**
Step 1:
```
@specification Design the Cloud API for KutaPay.
Endpoints needed: invoice upload, invoice status, device registration,
device health, sync status, report generation, audit export.
Use RESTful conventions. Define request/response schemas.
Save to spec/design-cloud-api-1.md
```
Step 2:
```
@se-technical-writer Convert to design/docs/api/cloud.md as API reference.
```

---

### TASK-029: POS plugin API reference
```
Status:     DONE (after TASK-023)
Completed:  2026-02-17
Depends:    TASK-023
Agent:      @specification + @se-technical-writer
Sources:    spec/architecture-kutapay-system-1.md
Target:     spec/design-pos-plugin-api-1.md, design/docs/api/pos-plugin.md
Validate:   Spec defines plugin interface; design page has examples
```
**Instructions:**
Step 1:
```
@specification Design the POS Plugin API for KutaPay.
Define the interface that third-party POS systems use to communicate
with the KutaPay fiscal service. Cover: initialization, invoice submission,
status query, report retrieval, error handling.
Save to spec/design-pos-plugin-api-1.md
```
Step 2:
```
@se-technical-writer Convert to design/docs/api/pos-plugin.md.
```

---

## Phase 8 — Implementation Roadmap

### TASK-030: Roadmap overview
```
Status:     DONE (after Phase 1-5 complete)
Completed:  2026-02-17
Depends:    TASK-004 through TASK-023
Agent:      @planner (from project-planning plugin)
Sources:    spec/*.md (all specs), kutapay_technical_design.md section 11
Target:     design/docs/implementation/roadmap.md
Validate:   Contains Gantt or timeline diagram
```
**Instructions:**
```
@planner Create a high-level implementation roadmap for KutaPay.
Three phases: B2B Pilot (3 months), Retail (3 months), Enterprise (6 months).
Include Mermaid Gantt chart. List milestones, dependencies, and risks per phase.
Save to design/docs/implementation/roadmap.md
```

---

### TASK-031: Phase 1 (B2B) epic breakdown
```
Status:     DONE
Completed:  2026-02-17
Depends:    TASK-030
Agent:      /breakdown-epic-arch prompt
Sources:    spec/*.md, design/docs/implementation/roadmap.md
Target:     design/docs/implementation/phase-1.md
Validate:   Contains numbered epics with acceptance criteria
```
**Instructions:**
```
/breakdown-epic-arch
Project: KutaPay Phase 1 — B2B Pilot
Architecture: USB device firmware + single-terminal POS + manual DGI upload
Target: 10 pilot clients (service companies, wholesalers, schools)
Duration: 3 months

Break into epics covering:
1. USB firmware MVP (PREPARE/COMMIT, journal, Z-report)
2. Fiscal service library (canonical serializer, device proxy, tax engine)
3. POS MVP (sale entry, receipt generation, basic product catalog)
4. Manual compliance tooling (CSV export for DGI, audit export)
5. Testing & Homologation prep
Each epic: description, acceptance criteria, estimated effort, dependencies.
```

---

### TASK-032: Phase 2 (Retail) epic breakdown
```
Status:     DONE
Completed:  2026-02-17
Depends:    TASK-031
Agent:      /breakdown-epic-arch prompt
Sources:    spec/*.md, design/docs/implementation/phase-1.md
Target:     design/docs/implementation/phase-2.md
Validate:   Contains numbered epics
```
**Instructions:**
```
/breakdown-epic-arch
Project: KutaPay Phase 2 — Retail & Restaurants
Extends: Phase 1 deliverables
New capabilities: multi-terminal, cloud sync, automatic DGI upload,
full report suite (X, A reports), mobile waiter support
Target: 100 clients
Duration: 3 months
```

---

### TASK-033: Phase 3 (Enterprise) epic breakdown
```
Status:     DONE (after TASK-032)
Depends:    TASK-032
Completed:  2026-02-17
Agent:      /breakdown-epic-arch prompt
Sources:    spec/*.md, design/docs/implementation/phase-2.md
Target:     design/docs/implementation/phase-3.md
Validate:   Contains numbered epics
```
**Instructions:**
```
/breakdown-epic-arch
Project: KutaPay Phase 3 — Enterprise
Extends: Phase 1+2 deliverables
New capabilities: ERP connectors, webhook API, fleet management,
multi-branch dashboard, advanced analytics
Target: 1000+ clients
Duration: 6 months
```

---

## Phase 9 — Architecture Decision Records

### TASK-034: ADR index page
```
Status:     DONE (after TASK-004)
Completed:  2026-02-17
Depends:    TASK-004
Agent:      manual
Sources:    docs/adr/*.md
Target:     design/docs/adr/index.md
Validate:   File lists ADR-0001 and placeholders for upcoming ADRs
```
**Instructions:**
Create an ADR index page listing all decisions:
- ADR-0001: Two-Phase Commit for USB Protocol (Accepted) — link to page
- ADR-0002: Signature Algorithm Selection (Proposed) — to be written
- ADR-0003: POS Technology Stack (Proposed) — to be written
Include a brief explanation of the ADR process.

---

### TASK-035: ADR-0002 Signature Algorithm
```
Status:     READY (after TASK-012)
Depends:    TASK-012
Agent:      @adr-generator
Sources:    DISCUSSION.md lines 7285-7400 (SE section),
            design/docs/hardware/secure-element.md
Target:     docs/adr/adr-0002-signature-algorithm.md,
            design/docs/adr/adr-0002.md (copy or symlink)
Validate:   File contains Options and Rationale sections
```
**Instructions:**
```
@adr-generator Create ADR-0002: Signature Algorithm Selection.
Context: USB fiscal device signs invoices via Secure Element.
Options: ECDSA P-256 (ATECC608 native), Ed25519 (faster but SE050 needed),
RSA-2048 (large signatures, slow on MCU).
Constraints: Secure Element hardware support, signature size on receipts,
DGI hasn't specified algorithm, verification performance.
Save to docs/adr/adr-0002-signature-algorithm.md
```

---

### TASK-036: ADR-0003 POS Technology Stack
```
Status:     READY (after TASK-022)
Depends:    TASK-022
Agent:      @adr-generator
Sources:    design/docs/pos/ui-ux.md
Target:     docs/adr/adr-0003-pos-technology-stack.md,
            design/docs/adr/adr-0003.md
Validate:   File contains Options section with at least 3 alternatives
```
**Instructions:**
```
@adr-generator Create ADR-0003: POS Technology Stack Selection.
Context: POS must run on Android, desktop, potentially web.
Must communicate with local USB device via fiscal service.
Offline-first, low-resource environments.
Options: PWA + local daemon, Flutter, React Native + native bridge,
Electron (desktop) + separate Android native app.
Consider: offline storage, USB communication, dev team skills,
code sharing between platforms, Odoo integration potential.
Save to docs/adr/adr-0003-pos-technology-stack.md
```

---

## Phase 10 — Validation & Review

### TASK-037: Full security review
```
Status:     READY (after Phases 2-3 complete)
Depends:    TASK-012, TASK-016
Agent:      @se-security-reviewer
Sources:    design/docs/hardware/*.md, design/docs/fiscal/*.md,
            spec/*.md, docs/adr/*.md
Target:     review/security-review-findings.md
Validate:   File contains categorized findings (CRITICAL/IMPORTANT/SUGGESTION)
```
**Instructions:**
```
@se-security-reviewer Perform a comprehensive security review of
KutaPay's technical design. Read all files in design/docs/hardware/,
design/docs/fiscal/, spec/, and docs/adr/.

Audit:
1. Cryptographic design (key management, signing, verification)
2. Trust boundary enforcement (nothing leaks from trusted to untrusted)
3. Protocol security (replay protection, nonce lifecycle, anti-tampering)
4. Data protection (PII handling, invoice data at rest and in transit)
5. Device lifecycle (provisioning, revocation, replacement)

Output findings categorized as CRITICAL / IMPORTANT / SUGGESTION.
Save to review/security-review-findings.md
```

---

### TASK-038: Architecture review
```
Status:     READY (after Phases 1-5 complete)
Depends:    TASK-004 through TASK-023
Agent:      @se-system-architecture-reviewer
Sources:    design/docs/architecture/*.md, spec/*.md
Target:     review/architecture-review-findings.md
Validate:   File contains findings
```
**Instructions:**
```
@se-system-architecture-reviewer Review the complete KutaPay architecture.
Read: design/docs/architecture/*.md, spec/*.md.
Check: component coupling, failure modes, scalability,
trust boundary violations, missing components, consistency.
Save findings to review/architecture-review-findings.md
```

---

### TASK-039: Stress-test assumptions
```
Status:     READY (after TASK-030)
Depends:    TASK-030
Agent:      @devils-advocate + @critical-thinking
Sources:    design/docs/implementation/roadmap.md,
            design/docs/hardware/bom.md
Target:     review/assumption-challenges.md
Validate:   File contains at least 5 challenged assumptions
```
**Instructions:**
Step 1:
```
@devils-advocate Challenge KutaPay's core assumptions:
- $10-15 BOM target achievable?
- One device per outlet sufficient for all scenarios?
- Offline-first with 48-72h upload deadline realistic?
- DGI API will be available when needed?
- Merchants will adopt hardware-requiring solution?
```
Step 2:
```
@critical-thinking Probe the implementation roadmap:
- 3 months for B2B pilot firmware + POS — realistic?
- What if homologation takes 6+ months?
- What if a competitor gets certified first?
- What happens to deployed devices if DGI changes crypto requirements?
```

---

### TASK-040: Address review findings
```
Status:     READY (after TASK-037, TASK-038, TASK-039)
Depends:    TASK-037, TASK-038, TASK-039
Agent:      manual (human decision-making)
Sources:    review/*.md
Target:     Updates to design/docs/**/*.md, new ADRs as needed
Validate:   All CRITICAL findings addressed (documented resolution in review files)
```
**Instructions:**
Read all review findings. For each CRITICAL finding:
- Either fix the design document, OR
- Create a new ADR documenting why the current approach is acceptable, OR
- Add a risk to the roadmap with mitigation plan.
Update review files with resolution status.

---

## Phase 11 — Final Assembly

### TASK-041: Build and deploy MkDocs site
```
Status:     READY (after TASK-040)
Depends:    TASK-040
Agent:      manual
Sources:    design/**
Target:     design/site/ (built output)
Validate:   cd design && mkdocs build --strict  (zero warnings)
```
**Instructions:**
1. Run `cd design && mkdocs build --strict` — fix any warnings.
2. Verify all pages render correctly.
3. Verify all Mermaid diagrams render.
4. Verify all cross-references resolve.
5. Optionally deploy: `mkdocs gh-deploy` (to GitHub Pages).

---

### TASK-042: Update memory bank and commit
```
Status:     READY (after TASK-041)
Depends:    TASK-041
Agent:      manual
Sources:    All project files
Target:     memory-bank/activeContext.md, memory-bank/progress.md
Validate:   Memory bank reflects completed state
```
**Instructions:**
Update memory bank:
- `activeContext.md` — Phase: implementation (technical design complete)
- `progress.md` — Mark all design documentation as done, list next steps (coding Phase 1)
- `systemPatterns.md` — Add any new patterns discovered during documentation
Final commit: `git add -A && git commit -m "docs: complete technical design documentation"`
Push: `git push origin main`

---

## Appendix A — PROMPT Files for Automated Ralph Loop

### PROMPT_plan.md
Save this as `PROMPT_plan.md` at project root if using automated Ralph Loop:
```
0a. Read IMPLEMENTATION_PLAN.md to understand the full plan and current status.
0b. Read spec/*.md and design/docs/**/*.md to understand existing documentation.
0c. Read memory-bank/*.md for project context.

1. Compare the plan against existing files (gap analysis).
2. Update IMPLEMENTATION_PLAN.md:
   - Mark completed tasks as DONE with date
   - Identify any new tasks needed
   - Update the Status Summary table
3. Do NOT implement anything. Planning mode only.

IMPORTANT: Do NOT assume a file is missing — check first.
```

### PROMPT_build.md
Save this as `PROMPT_build.md` at project root if using automated Ralph Loop:
```
0a. Read IMPLEMENTATION_PLAN.md.
0b. Read memory-bank/*.md for context.
0c. Read relevant spec/*.md files.

1. Find the FIRST task with Status: READY whose dependencies are all DONE.
2. Execute it following the exact Instructions in that task.
3. If the task says to use an agent (e.g., @specification, @gem-documentation-writer),
   invoke that agent with the exact prompt provided.
4. Write output to the exact Target path specified.
5. Run the Validate check. If it fails, fix the output.
6. Update IMPLEMENTATION_PLAN.md: change Status: READY → Status: DONE, add Completed: date.
7. git add -A && git commit -m "docs: [TASK-ID] [short description]"
8. STOP. Do not start the next task.

RULES:
- Read ONLY the Source files listed for that task. Do not read all of DISCUSSION.md.
- Write complete content, no placeholders or stubs.
- Include Mermaid diagrams where specified.
- Follow MkDocs Material conventions (admonitions, tabs, etc.).
```

---

## Appendix B — Complete MkDocs Nav Structure

```yaml
nav:
  - Home: index.md
  - Architecture:
    - Overview: architecture/overview.md
    - Trust Boundary: architecture/trust-boundary.md
    - Component Map: architecture/components.md
    - Data Flow: architecture/data-flow.md
  - Hardware:
    - USB Fiscal Memory: hardware/usb-device.md
    - USB Protocol (2PC): hardware/protocol.md
    - Secure Element: hardware/secure-element.md
    - BOM & Manufacturing: hardware/bom.md
  - Fiscal Engine:
    - Invoice Lifecycle: fiscal/invoice-lifecycle.md
    - Tax Engine (14 Groups): fiscal/tax-engine.md
    - Security Elements: fiscal/security-elements.md
    - Reports (Z/X/A): fiscal/reports.md
  - Cloud & Sync:
    - Cloud Architecture: cloud/architecture.md
    - Offline-First Sync: cloud/offline-sync.md
    - DGI Integration: cloud/dgi-integration.md
  - POS Application:
    - Multi-Terminal: pos/multi-terminal.md
    - UI/UX: pos/ui-ux.md
    - Integrations: pos/integrations.md
  - Regulatory:
    - DRC Legal Framework: regulatory/legal-framework.md
    - Arrêté Summary: regulatory/arretes.md
    - SFE Specifications: regulatory/sfe-specs.md
  - ADRs:
    - Index: adr/index.md
    - "0001 - Two-Phase Commit": adr/adr-0001.md
    - "0002 - Signature Algorithm": adr/adr-0002.md
    - "0003 - POS Technology Stack": adr/adr-0003.md
  - Implementation:
    - Roadmap: implementation/roadmap.md
    - Phase 1 - B2B Pilot: implementation/phase-1.md
    - Phase 2 - Retail: implementation/phase-2.md
    - Phase 3 - Enterprise: implementation/phase-3.md
  - API Reference:
    - USB Device API: api/usb-device.md
    - Cloud API: api/cloud.md
    - POS Plugin API: api/pos-plugin.md
```

---

## Appendix C — Agent/Tool Quick Reference

| Agent/Prompt | Plugin | Use For |
|---|---|---|
| `@specification` | standalone | EARS-notation specs → `spec/` |
| `@adr-generator` | standalone | Architecture Decision Records → `docs/adr/` |
| `@gem-documentation-writer` | gem-team | Polished MkDocs pages with diagrams |
| `@gem-planner` | gem-team | High-level planning |
| `@gem-researcher` | gem-team | Deep research into specific topics |
| `@se-security-reviewer` | software-engineering-team | Crypto and security audits |
| `@se-system-architecture-reviewer` | software-engineering-team | Architecture validation |
| `@se-technical-writer` | software-engineering-team | API reference docs |
| `@se-ux-ui-designer` | software-engineering-team | UX principles and flows |
| `@context-architect` | context-engineering | Context mapping |
| `@planner` | project-planning | Implementation roadmaps |
| `@research-technical-spike` | technical-spike | Time-boxed research |
| `@critical-thinking` | standalone | Probing questions |
| `@devils-advocate` | standalone | Challenge assumptions |
| `/breakdown-epic-arch` | project-planning | Epic decomposition |
| `/create-implementation-plan` | project-planning | Phased plans |
| excalidraw skill | standalone skill | Visual diagrams |
| plantuml-ascii skill | standalone skill | ASCII diagrams |
