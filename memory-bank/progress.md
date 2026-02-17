# Progress

## What works

- The implementation plan (this document) now drives the Ralph loop: read, execute one task, update status, commit, repeat.
- Instructions, memory bank, and specs are being rewritten to describe Bono Pay as a software-first fiscal invoices platform, so readers understand the cloud-first trust boundary.
- The MkDocs nav and structure have been reimagined for architecture, platform, fiscal engine, cloud, and API storylines, with old hardware/POS docs archived for Phase 3 reference.

## What's left

- Complete the revised architecture, fiscal, cloud, platform, and regulatory pages plus the API reference content.
- Update the remaining specs (cloud API, SDK, DGI integration, reports, tax engine) to align with the cloud signing service and the canonical payload story.
- Produce the implementation roadmap, Phase 1–4 narratives, ADRs (cloud signing, strategic pivot, etc.), and memory bank updates for the final handoff.
- Close the loop with strict MkDocs builds, validation, and documentation of any remaining technical debts or unknowns.

## Known issues

- Critical open questions persist around the MCF/e-MCF API spec, signature/QR formats, and registration protocol with DGI.
- Device registration and hardware homologation remain a Phase 3 concern, so the documentation now archives the USB Fiscal Memory specs for future reference.
- No code has been prototyped yet; the project is still documentation-first until the architecture rewrites are validated.
