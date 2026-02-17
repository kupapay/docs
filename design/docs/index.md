# Bono Pay Technical Design Documentation

Bono Pay is fiscal compliance infrastructure for the DRC's Facture Normalisée regime. These documents describe how untrusted POS front-ends, a trusted USB Fiscal Memory device, offline-first workflows, and cloud syncing collaborate to turn every commercial sale into a legally auditable tax event.

The site collects architecture, hardware, fiscal engine, cloud, POS, regulatory, ADR, implementation, and API reference layers so the team can build aligned, compliant systems.

## Major sections
- Architecture: system overview, trust boundary, component map, and data flows.
- Hardware: USB device, 2PC protocol, secure element, and manufacturing guidance.
- Fiscal Engine: invoice lifecycle rules, tax engine, security elements, and reports.
- Cloud & Sync: cloud architecture, offline-first sync logic, and DGI integration.
- POS Application: multi-terminal topology, UX principles, and integration strategy.
- Regulatory: DRC legal framework, arrêté summaries, and SFE specifications.
- ADRs: architecture decision records with rationale.
- Implementation: roadmap and phased execution plans.
- API Reference: USB device commands, cloud endpoints, and POS plugin contracts.

## How to use this documentation
1. Navigate via the menu; each page will grow into its full design narrative.
2. Start with the architecture section to understand trust boundaries, then work outward to hardware, fiscal engine, and cloud layers.
3. Consult ADRs for formal decisions and the implementation pages for planning context.
4. Search for keywords and use the "Coming soon" markers to identify work in progress.
