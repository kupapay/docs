# Assumption Challenges & Roadmap Probes

## Step 1 — Devil's Advocate: Challenging Core Assumptions

1. **$10–15 BOM target is razor thin.** The BOM table already shows that a single component spike (secure element, MCU, or assembly labor) pushes the device past $16 (section *Component cost breakdown*), so without firm supplier commitments or commodity hedging we cannot guarantee the target when the market shifts for MCUs or SEs.
2. **One device per outlet assumes perfect local orchestration.** In retail/restaurant environments the mediator, LAN, and device all become single points of failure; if cables are disconnected or the fiscal service misses a heartbeat, dozens of terminals are blocked even though the roadmap still schedules the multi-terminal mediator for Phase 2.
3. **Offline-first with a 48–72h upload window actually holds under poor DRC connectivity.** The roadmap warns (Phase 2 Risks) that the sync queue must survive long outages, yet there is no fall-back beyond a retry loop, so the assumption hinges on uninterrupted retries that may be impossible in rural networks.
4. **DGI API will be available and stable when we need it.** The same roadmap (Risks sections) and the lack of a published MCF/e-MCF spec mean the cloud sync stack could be delayed indefinitely; we may ship pilots without knowing the real endpoint schema or auth requirements.
5. **Merchants will adopt a hardware-dependent solution.** Moving a cashier over to a new USB device plus cloud sync adds friction, especially when competitors can issue compliant invoices in software only; without a strong incentive (e.g., cheaper certification, financing) adoption could lag even if the tech works.

## Step 2 — Critical Thinking: Probing the Roadmap

- **Can Phase 1 truly finish in three months?** The roadmap schedules USB firmware, POS, and manual compliance tooling simultaneously, yet each layer (firmware signing, canonical payload, DGI CSV tooling) has critical interdependencies and compliance reviews that often take multiples of the planned cadence.
- **What if homologation drags for six-plus months?** Regulatory approval was already flagged as a risk; a long homologation would push everything else back, leaving the pilot without a cloud sync target and invalidating the assumptions in subsequent phases about hardware/firmware stability.
- **What if a competitor gets certified first?** The plan assumes a first-mover advantage, but a competitor with a software-only or more affordable solution could capture retailers, making the hardware-heavy KutaPay offering a hard sell unless we accelerate certification or offer aggressive financing.
- **How do deployed devices adapt if the DGI changes crypto requirements?** The BOM/firmware plan emphasizes signed firmware and tamper protection, but the physical devices in the field may not support a new signature algorithm without hardware rotation; we need a mutation plan (firmware+SE) rather than assuming the initial crypto stays fixed.
- **What happens if the DGI API changes mid-transition?** Even if we get an API, the assumption that it stays stable through Phase 2/3 ignores the possibility of post-approval amendments; each change would force cloud sync, POS plugin, and roadmap updates, yet the current timeline has no slack for rework beyond the scheduled milestones.
