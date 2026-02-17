# Implementation Roadmap

## Overview

This document lays out the phased rollout for Bono Pay's fiscal invoicing platform, beginning with a software-first B2B pilot, scaling through POS and retail integrations, adding optional USB hardware for merchants that need DEF homologation, and culminating in enterprise-grade connectors and analytics. Each phase builds on the architecture, cloud signing, and fiscal engine work captured throughout these docs.

## Timeline

```mermaid
gantt
    title Bono Pay Implementation Roadmap
    dateFormat  YYYY-MM-DD
    axisFormat  %b %d

    section Phase 1 — Software Invoicing (3 months)
    Cloud Signing Service + Fiscal Ledger MVP :crit, 2026-03-01, 90d
    REST API + Tax Engine (14 DGI groups) :active, 2026-03-01, 90d
    Web Dashboard MVP : 2026-03-15, 75d
    JavaScript and Python SDK : 2026-04-01, 60d
    B2B pilot — 10 clients : 2026-05-01, 30d

    section Phase 2 — POS and Retail (3 months)
    POS SDK + multi-terminal support : 2026-06-01, 90d
    Offline queue hardening : 2026-06-15, 60d
    Mobile money integration : 2026-07-01, 60d
    Webhook event system : 2026-07-15, 45d
    Retail pilot — 100 outlets : 2026-08-01, 30d

    section Phase 3 — USB Hardware (6 months)
    USB Fiscal Memory firmware : 2026-09-01, 120d
    DEF homologation prep : 2026-10-01, 90d
    Cloud + DEF dual-mode signing : 2026-11-01, 90d
    DGI hardware certification : 2027-01-01, 60d

    section Phase 4 — Enterprise (6 months)
    ERP connectors — SAP and Odoo : 2027-03-01, 120d
    Fleet management dashboard : 2027-04-01, 90d
    Advanced analytics : 2027-05-01, 90d
    Multi-country expansion research : 2027-06-01, 60d
```

## Phase 1 — Software Invoicing

The foundation phase. Delivers the API-first invoicing platform with cloud fiscal signing, the tax engine, web dashboard, and SDKs. Target: 10 B2B pilot clients (service companies, wholesalers, schools).

**Key deliverables:**

- Cloud Signing Service (HSM) + Monotonic Counter Manager + Fiscal Ledger
- REST API with full invoice lifecycle (create, void, refund, credit note)
- Tax Engine enforcing all 14 DGI tax groups + client classification
- Web Dashboard for invoice management, reports, and outlet administration
- JavaScript and Python SDKs with offline queue support
- Z/X/A reports and audit export from the Fiscal Ledger
- Manual DGI compliance tooling (CSV/audit dump) until MCF/e-MCF API lands

See [Phase 1 detail](phase-1.md) for epics, acceptance criteria, and dependencies.

## Phase 2 — POS & Retail

Extends the platform to physical retail by adding POS SDK integration, multi-terminal support, mobile money payments, and the webhook event system. Target: 100 retail outlets.

**Key deliverables:**

- POS SDK that wraps the Cloud API with receipt rendering and offline queue
- Multi-terminal concurrency via the existing Monotonic Counter Manager
- Mobile money integration (M-Pesa, Airtel Money, Orange Money)
- Webhook API for real-time event streaming to external systems
- Enhanced dashboard with shift management and supervisor views
- Observability and alerting for fleet operations

See [Phase 2 detail](phase-2.md) for epics, acceptance criteria, and dependencies.

## Phase 3 — USB Hardware

Introduces the USB Fiscal Memory device (DEF) as an optional trust anchor for merchants who need full DEF homologation. The cloud remains first-class; the DEF is an alternative signer.

**Key deliverables:**

- USB Fiscal Memory firmware (PREPARE/COMMIT protocol, immutable journal)
- Dual-mode architecture: Cloud HSM or DEF can sign invoices per outlet
- Device provisioning, activation, and certificate management
- Cloud sync for DEF-signed invoices (same Sync Agent pipeline)
- DGI hardware homologation and certification

See [Phase 3 detail](phase-3.md) for epics, acceptance criteria, and dependencies.

## Phase 4 — Enterprise & Scale

Enterprise-grade integrations, fleet management, and analytics for large-scale deployments with 1,000+ outlets.

**Key deliverables:**

- ERP connectors (SAP S/4HANA, Odoo) with tax group mapping
- Fleet management dashboard for multi-branch monitoring
- Advanced analytics (tax-group heatmaps, anomaly detection, trend analysis)
- Automated compliance reporting and audit export scheduling
- Multi-country expansion research (regulatory analysis for neighboring markets)

See [Phase 4 detail](phase-4.md) for epics, acceptance criteria, and dependencies.

## Monitoring & Validation

Maintain a rolling review cadence after each phase completes:

- **Monthly sync audits** — Verify Fiscal Ledger integrity, DGI upload success rates, and counter continuity.
- **Quarterly security reviews** — Audit HSM key rotation, API key usage, and access control compliance.
- **Phase gate reviews** — Before advancing to the next phase, validate all acceptance criteria, run `mkdocs build --strict`, and confirm regulatory alignment.
- **DGI checkpoint** — As the MCF/e-MCF API details emerge, update the Sync Agent and DGI integration docs accordingly.
