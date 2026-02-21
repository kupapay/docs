# Bono Pay — Copilot Instructions

## 1. Project Context & Architecture
**Bono Pay** (never KutaPay) is a fiscal invoicing infrastructure for the DRC. 
- **Trust Boundary:** Client apps (web, API, SDK) are **untrusted**. The **Cloud Signing Service (HSM)** is the trusted fiscal authority (Phase 1).
- **Hardware:** Phase 3 USB Fiscal Memory device docs are archived in `design/docs-archive/hardware/`. Do not reference them for Phase 1 tasks.

```text
Client Apps (untrusted)  ──invoice request──►  Bono Pay Cloud (trusted)
         │                                          ├── Cloud Signing Service (HSM)
         ▼                                          ├── Fiscal Ledger (append-only)
   Web Dashboard / API                              ├── Tax Engine (14 DGI groups)
                                                    └── Report Generator
   Bono Pay Cloud ──sealed invoice──► DGI (Sync Agent)
```

## 2. Core Engineering Rules
- **Canonical Payloads:** Invoices require deterministic field ordering with mandatory identifiers (`merchant_nif`, `outlet_id`, `pos_terminal_id`, `cashier_id`, `client`, `tax_groups`, `totals`, `payments`).
- **Tax Engine:** Must support all **14 DGI tax groups** and client classifications. Never hardcode a single VAT rate.
- **Offline-First:** Clients must queue invoices locally (IndexedDB/SQLite) and submit when online. Fiscalization only occurs in the cloud.
- **Append-Only Ledger:** Invoice mutations (voids, refunds) are new fiscal events. Never delete or alter sealed invoices.
- **Concurrency:** Use the Monotonic Counter Manager to serialize fiscal numbering per `outlet_id` to support multi-user/multi-terminal scaling.

## 3. Developer Workflows
- **Ralph Loop:** For autonomous tasks, read `IMPLEMENTATION_PLAN.md`, execute one `READY` task, update its status to `DONE`, commit, and exit.
- **Documentation:** Edit Markdown in `design/docs/`. Build with `cd design && python -m mkdocs build` (requires `design/requirements.txt`).
- **Git Commits:** Use `run_git_commands.py` for consistent commits, or follow conventional commits (`docs:`, `feat:`, `fix:`).
- **Context Management:** Always update `memory-bank/progress.md` and `memory-bank/activeContext.md` after significant changes.

## 4. Integration Points & Unknowns
- **DGI Sync:** The MCF/e-MCF endpoint URLs, auth tokens, and schema are currently **unpublished**. Treat as blockers and document assumptions.
- **Security Elements:** The exact signature algorithm and QR payload format are pending DGI guidance.
- **Terminology:** Use canonical terms: `Cloud Signing Service`, `Fiscal Ledger`, `Monotonic Counter Manager`, `Report Generator`, `Sync Agent`.
- **Mermaid Diagrams:** Always quote node labels containing punctuation (e.g., `"Cloud Signing Service (HSM)"`).
