# Architecture Review Findings

## Scope
- Reviewed `design/docs/architecture/{overview,trust-boundary,components,data-flow}.md` plus the governing `spec/*.md` (architecture specification and related API/infra specs) to understand the stated actor model, data flows, and constraints.

## Findings

### Component coupling
- The Multi-Terminal Mediator, Device Proxy, and Sync Engine all sit on the critical path between POS clients and the USB Fiscal Memory device (`design/docs/architecture/components.md`). Without an explicit scaling or sharding plan, a single mediator instance could become a bottleneck for high-concurrency outlets (e.g., 10+ terminals submitting in parallel) and hold the shared USB device hostage while it serializes canonical payloads. A dedicated async queue or back-pressure signal would make component separation and resilience clearer.

### Failure modes
- The trust boundary document correctly enumerates PREPARE/COMMIT power loss, nonce expiry, and corrupt payload scenarios (`design/docs/architecture/trust-boundary.md`), but the happy/offline path diagrams lack an explicit way to pause/resume uploads when the cloud reports DGI errors such as `DEVICE_NOT_REGISTERED` or `INVALID_SIGNATURE` (see `spec/design-cloud-api-1.md`). The architecture should describe how Sync Engine alerts the POS/fiscal service and whether retry policies or manual intervention windows exist.

### Scalability
- `design/docs/architecture/components.md` lists Sync Queue, Sync Engine, and Cloud API as separate layers, but there is no mention of horizontal scaling, leader election, or stateless workers for `Sync Engine`. As the road map anticipates 1,000+ enterprise outlets (`design/docs/implementation/phase-3.md`), document how the queue and Sync Engine scale without violating the single-outlet, ordered delivery constraint.

### Trust boundary
- The architecture overview and trust boundary pages repeatedly warn that fiscal numbers, signatures, and counters originate only from the DEF, which is excellent. However, the data-flow diagrams still show the Sync Queue holding “canonical payload + fiscal response” before Cloud upload (`design/docs/architecture/data-flow.md`). It should be explicit that this queue stores sealed responses only and never attempts to regenerate security elements, to avoid misinterpretation that the untrusted zone processes those values.

### Missing components
- There is no separate component that receives, classifies, and surfaces DGI/MFS error responses (e.g., `INVALID_SIGNATURE`, `DUPLICATE_FISCAL_NUMBER`) before the `Sync Engine` retries. Adding a “Resilience Coordinator” or expanding the Sync Engine description to cover this would clarify who handles backoff, alerting, and operator intervention.

### Consistency
- Names waver between “Fiscal Service” and “Local Fiscal Service” (overview vs. components), and the canonical payload description sometimes shifts field ordering when mentioning `tax_groups[]` (`overview.md`) vs. `spec/architecture-kutapay-system-1.md`). Standardizing terminology (e.g., always call it “Fiscal Service mediator”) and quoting the canonical field order in architecture docs will help cross-reference traceability.

## Next steps
- Document the horizontal scaling/back-pressure strategy for the Multi-Terminal Mediator and Sync Engine to keep them from monopolizing the USB device under load.
- Expand the Sync Engine narrative to name the retry/backoff component that handles DGI errors and to show how it surfaces operator alerts.
- Harmonize terminology around “Fiscal Service” and canonical payload fields across architecture docs and the spec, ensuring the architecture diagrams explicitly label sealed responses vs. raw payloads.
