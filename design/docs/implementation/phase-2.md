# Phase 2 — POS & Retail

Phase 1 proved that the Cloud Signing Service, REST API, and web dashboard can deliver fiscally compliant invoices for B2B clients. Phase 2 extends the platform to **physical retail and restaurant environments** with POS SDK integration, multi-terminal support, mobile money payments, and the webhook event system. Target: **100 retail outlets over 3 months** (June–August 2026).

## Objectives

- **Target:** Onboard 100 retail/restaurant outlets (multi-lane counters, mobile waitstaff, fast-service kiosks) using the same cloud fiscal authority from Phase 1.
- **Duration:** 3-month sprint with monthly milestones.
- **New capabilities:** POS SDK, multi-terminal concurrency, mobile money integration, webhook API, enhanced dashboard views, and fleet observability.

## Epics

### 1. POS SDK & multi-terminal support

**Description:** Build a POS SDK that wraps the Cloud API with receipt rendering, offline queue, and multi-terminal awareness. The Monotonic Counter Manager already serializes fiscal numbers per outlet, so POS terminals are simply additional API consumers.

**Acceptance criteria:**

- POS SDK (JavaScript) handles invoice creation, offline queue, receipt template rendering, and device-specific status indicators.
- Multiple POS terminals per outlet submit invoices concurrently; the cloud serializes fiscal numbering without gaps.
- Each invoice carries `pos_terminal_id` and `cashier_id` for traceability.
- Receipt templates include all five security elements (fiscal number, fiscal authority ID, auth code, timestamp, QR code).

**Estimated effort:** 3 weeks for SDK + 1 week for multi-terminal QA.
**Dependencies:** `design/docs/platform/multi-user.md`, `design/docs/api/invoicing-sdk.md`.

### 2. Mobile money integration

**Description:** Support mobile money (M-Pesa, Airtel Money, Orange Money) as payment methods within invoices. Payment confirmation callbacks trigger invoice submission or update payment status on existing invoices.

**Acceptance criteria:**

- Payment callbacks from mobile money providers are processed and recorded in the invoice's `payments` array.
- Invoices can be sealed before or after payment confirmation (payment status does not block fiscalization).
- Dashboard shows payment status alongside invoice status.

**Estimated effort:** 2 weeks per provider + 1 week for integration testing.
**Dependencies:** `design/docs/platform/integrations.md`.

### 3. Webhook event system

**Description:** Build the webhook delivery system that pushes signed event notifications to external endpoints when invoices are sealed, reports are generated, or sync errors occur.

**Acceptance criteria:**

- Webhook events: `invoice.sealed`, `invoice.sync.success`, `invoice.sync.failed`, `report.generated`, `outlet.offline_alert`.
- Payloads are signed with HMAC-SHA256 using the webhook secret.
- Retry with exponential backoff on delivery failure (max 5 retries).
- Dashboard UI for webhook management (create, test, view delivery logs).

**Estimated effort:** 2 weeks for delivery engine + 1 week for dashboard UI.
**Dependencies:** `design/docs/platform/integrations.md`.

### 4. Enhanced dashboard & supervisor views

**Description:** Add shift management, supervisor drill-downs, and fleet health views to the web dashboard for retail operations.

**Acceptance criteria:**

- Shift open/close workflow with X report generation per shift.
- Supervisor view showing all terminals in an outlet with real-time invoice counts and sync status.
- Fleet overview page (for multi-outlet merchants) with aggregate health metrics.
- Offline client alerts with draft counts and ages.

**Estimated effort:** 2 weeks.
**Dependencies:** `design/docs/platform/dashboard.md`.

### 5. Observability, onboarding & fleet operations

**Description:** Instrument the platform for 100-outlet scale with monitoring, alerting, and onboarding playbooks for retail staff.

**Acceptance criteria:**

- Dashboards showing API latency, signing throughput, sync queue depth, and error rates.
- Alerts for: failed DGI uploads, offline grace period exceeded, rate limit breaches, HSM health.
- Onboarding documentation for retail merchants: outlet setup, API key creation, POS SDK installation, tax group configuration.
- Automated regression tests for offline queue, multi-terminal concurrency, and mobile money flows.

**Estimated effort:** 2 weeks for dashboards/playbooks + 1 week for training.
**Dependencies:** `design/docs/cloud/architecture.md`, `design/docs/cloud/offline-sync.md`.

## Risks

!!! warning "Phase 2 Risks"
    - POS environments have unreliable connectivity; the offline queue must handle 48–72h outages without data loss or duplicate fiscal events.
    - Mobile money provider APIs have variable reliability and documentation quality; build provider-agnostic abstractions.
    - DGI readiness for automated uploads may still be pending — maintain manual compliance tooling as a fallback.
    - Scaling from 10 to 100 outlets may expose performance bottlenecks in the signing pipeline or Fiscal Ledger writes.
