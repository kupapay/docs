# Phase 2 — Retail & Restaurants

Phase 1 proved that the PREPARE → COMMIT handshake, hash-chained journal, and manual compliance tooling can keep a small B2B pilot honest. Phase 2 now scales the platform to the retail and restaurant segments that demand multi-terminal coverage, full cloud sync, automatic DGI uploads, and real-time reporting while serving **100 pilot clients over 3 months** (June–August 2026).

## Objectives

- **Target:** onboard 100 retail/restaurant outlets (10-lane retail counters, mobile waiter stacks, and fast-service kiosks) without sacrificing the Phase 1 trust boundary.
- **Duration:** 3-month sprint with milestones each month for multi-terminal orchestration, cloud automation, and report automation.
- **New capabilities:** multi-terminal mediator, resilient cloud sync, automatic DGI uploads, complete Z/X/A/audit report pipeline, mobile waiter UX, and observability/alerting for the larger fleet.
- **Reference artifacts:** `spec/architecture-kutapay-system-1.md`, `spec/protocol-usb-fiscal-device-1.md`, `spec/design-cloud-api-1.md`, `spec/infrastructure-dgi-integration-1.md`, `spec/process-fiscal-reports-1.md`, `spec/schema-tax-engine-1.md`, and the Phase 1 roadmap (`design/docs/implementation/phase-1.md`).

## Epics

1. **Multi-terminal orchestration & fiscal service hardening**
   - **Description:** Extend the fiscal service mediator so many POS terminals per outlet share one DEF without racing fiscal numbers. Honor the ordered canonical payload from `spec/architecture-kutapay-system-1.md`/`spec/protocol-usb-fiscal-device-1.md`, keep outlet/POS/cashier IDs intact, and serialize PREPARE/COMMIT calls to avoid nonce conflicts.
   - **Acceptance criteria:**
     * Local fiscal mediator sequences requests from every terminal and exposes explicit wait states when the DEF is busy.
     * Each payload carries outlet_id, pos_terminal_id, cashier_id, and client classification (per `spec/schema-tax-engine-1.md`) so the USB device enforces the trust boundary.
     * Concurrency guards (mutex/queue) prevent duplicate fiscal numbers while logging who owns the next nonce.
   - **Dependencies:** `spec/architecture-kutapay-system-1.md`, `spec/protocol-usb-fiscal-device-1.md`, `design/docs/pos/multi-terminal.md`, `design/docs/architecture/trust-boundary.md`.
   - **Estimate:** 3 weeks to refactor the mediator and 1 week for multi-terminal QA.

2. **Cloud sync automation & DGI upload pipeline**
   - **Description:** Automate the offline queue, retries, and eventual upload to the DGI control modules via the cloud API described in `spec/design-cloud-api-1.md` while acknowledging the unknowns captured in `spec/infrastructure-dgi-integration-1.md`. The sync agent must surface `retry_after`, DGI status, and queue depth without leaking secrets or violating the trust boundary.
   - **Acceptance criteria:**
     * Sealed invoices are queued and retried automatically, honoring the sync state machine from `design/docs/cloud/offline-sync.md`.
     * Automatic uploads include headers (`X-KUTAPAY-DEVICE-ID`, `X-KUTAPAY-NONCE`) and canonical payload order so the DGI receives precise security elements.
     * Sync dashboard exposes backlog, oldest queued invoice, and next retry timestamp so operators know when to intervene.
   - **Dependencies:** `spec/design-cloud-api-1.md`, `spec/infrastructure-dgi-integration-1.md`, `design/docs/cloud/offline-sync.md`, `design/docs/cloud/dgi-integration.md`.
   - **Estimate:** 4 weeks for cloud agent automation plus 1 week for ops dashboards and handoffs.

3. **Report automation & audit readiness**
   - **Description:** Build the full suite of Z, X, A, and audit exports from `spec/process-fiscal-reports-1.md`, ship them through both device and cloud pipelines, and integrate them with the larger fleet so auditors never wait.
   - **Acceptance criteria:**
     * Z reports close each retail shift with per-tax-group totals, journal hashes, and device security elements.
     * X reports can be triggered manually or on a schedule (e.g., hourly) with device health metadata.
     * A reports stream article-level detail plus client classification/line references.
     * Audit exports deliver hash-chained chunks (with prev_hash/signature) to satisfy DGI spot checks.
   - **Dependencies:** `spec/process-fiscal-reports-1.md`, `spec/protocol-usb-fiscal-device-1.md`, `design/docs/fiscal/reports.md`, `design/docs/cloud/dgi-integration.md`.
   - **Estimate:** 2 weeks to implement report generators and 1 week for integration and automation.

4. **Mobile waiter & POS UX resilience**
   - **Description:** Adapt the POS UX to support roaming waitstaff, portable terminals, and rapid checkout while surfacing offline helpers and device status per `.github/copilot-instructions.md` UX guidance and the existing `design/docs/pos/ui-ux.md`.
   - **Acceptance criteria:**
     * Mobile waiters can pair/disconnect safely, view nonce/connection status, and retry COMMITs without duplicating invoices.
     * Receipt templates keep the device-issued fiscal number, auth code, timestamp, and QR visible so inspectors can verify every transaction.
     * POS UI clearly alarms when the multi-terminal mediator is busy, the DEF is offline, or canonical payload validation fails.
   - **Dependencies:** `design/docs/pos/ui-ux.md`, `design/docs/pos/multi-terminal.md`, `spec/architecture-kutapay-system-1.md`, `spec/schema-tax-engine-1.md`.
   - **Estimate:** 2 weeks for UI changes plus 1 week of usability testing with pilots.

5. **Observability, onboarding, and fleet operations**
   - **Description:** Prepare for 100 outlets by instrumenting device health, sync queues, and report generation telemetry; publish onboarding playbooks (install steps, DGI manual uploads) for retail staff.
   - **Acceptance criteria:**
     * Dashboards combine cloud API status (`/sync/status`, `/devices/{device_id}/health`) with DEF reports/queues so engineers can spot blocked uploads.
     * Onboarding docs walk merchant teams through pairing the DEF, configuring tax groups, and verifying the trust boundary before going live.
     * Alerts cover dropped connections, nonce exhaustion, failed uploads, and missing security elements so operations can react before regulators notice.
   - **Dependencies:** `spec/design-cloud-api-1.md`, `spec/process-fiscal-reports-1.md`, `design/docs/cloud/architecture.md`, `design/docs/implementation/roadmap.md`.
   - **Estimate:** 2 weeks for dashboards/playbooks plus 1 week for training pilots.

