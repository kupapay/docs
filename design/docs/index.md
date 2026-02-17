# Bono Pay Technical Design Documentation

Bono Pay is fiscal invoicing infrastructure for the DRC's Facture Normalisée mandate. Developers, finance teams, and auditors use this documentation to understand how invoices are created, validated, signed, and synchronized in a software-first platform that delivers fiscal numbers, cryptographic signatures, and trusted timestamps without forcing merchants to adopt bespoke hardware.

The platform combines an API-first invoicing surface (REST + SDKs), a web dashboard, a cloud signing service backed by an HSM, and a resilient sync agent that delivers sealed invoices to the DGI. Each section below shows how Bono Pay enforces fiscal compliance while keeping the developer experience modern and familiar.

## Key sections
- **Architecture:** System overview, trust boundary, component map, and data flows that explain how client applications interact with the Cloud Signing Service, fiscal ledger, and DGI.
- **Invoicing Platform:** Product overview, API walkthrough, web dashboard experience, SDKs, and multi-user controls for merchants and developers.
- **Fiscal Engine:** Invoice lifecycle rules, the 14 DGI tax groups, canonical payload schema, mandatory security elements, and reports (Z/X/A/audit).
- **Cloud & Sync:** Cloud architecture, offline-first sync logic, resilience to connectivity loss, and DGI integration requirements.
- **Platform & Integrations:** Multi-user/multi-tenant access controls, integration playbooks, and partner-ready libraries.
- **Regulatory:** DRC legal framework, arrêté summaries, and SFE specifications that ground every compliance decision.
- **ADRs:** Authoritative decisions about architecture, signing, security, and platform strategy.
- **Implementation:** Roadmap, phase summaries, and execution guidance for shipping the software invoicing platform.
- **API Reference:** Open endpoints for invoice creation, listing, voiding, and refunding, plus SDK guidance for integrating with Bono Pay.

## Phase roadmap summary
1. **Phase 1 – Software Invoicing:** API-first invoicing platform with cloud fiscal signing, tax engine coverage, and dashboard controls.
2. **Phase 2 – POS & Retail:** Multi-terminal retail/restaurant extensions with optional local fiscal services that coordinate with the cloud.
3. **Phase 3 – USB Hardware:** Optional USB Fiscal Memory device for DEF homologation, serving as a trust anchor for high-compliance merchants.
4. **Phase 4 – Enterprise:** ERP integrations, analytics, and scaling across outlets, fleets, and geographies.

## Design principles (inspired by the Odoo lessons)
- **Offline-first confidence:** Clients can cache catalogs and queue requests, but fiscal finality is achieved via the cloud signing service once connectivity returns.
- **PWA-friendly:** Build the dashboard and POS clients as progressive web apps that load fast, work across devices, and feel native on tablets.
- **Mobile-optimized:** Prioritize the lowest-cost Android tablets, large touch targets, and minimal text entry so merchant staff can move quickly.
- **Multi-currency (CDF/USD):** Support dual-currency pricing and payments out of the box, reflecting how DRC businesses operate day to day.
- **Mobile money native:** Embed Airtel Money, M-Pesa, Orange Money, and similar providers into the payment flow as first-class citizens.

## How to use this documentation
1. Start with the **Architecture** section to internalize the trust boundary between untrusted clients and the Cloud Signing Service.
2. Explore the **Invoicing Platform**, **Fiscal Engine**, and **Cloud & Sync** pages to understand the lifecycle of a sealed invoice.
3. Consult the **Regulatory** and **ADR** folders when you need compliance rationale or formal decisions.
4. Drop into **Implementation** and **API Reference** when planning integrations, rollouts, or partner onboarding.
