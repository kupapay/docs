### Decision - 2026-02-17
**Decision**: Adopt a Progressive Web App (PWA) front-end paired with a dedicated local fiscal daemon to run the KutaPay POS across Android, desktop, and low-end hardware while respecting the trust boundary and USB fiscalization requirements.

**Context**:
- The POS UI must run on Android tablets/phones, laptops, and eventually desktops while keeping the experience as fluid as the Odoo baseline described in `design/docs/pos/ui-ux.md`.
- The interface must stay offline-first (Service Worker + IndexedDB caching), show fiscal status in real time, and never print or persist a sale until the USB Fiscal Memory device completes PREPARE → COMMIT.
- Browsers cannot access raw USB endpoints or run long-lived USB CDC connections, so any Web layer must delegate device interactions to a trusted local daemon that enforces the canonical payload, handles nonce lifecycles, and maintains the trust boundary.
- The team must balance offline storage, USB communication, developer skill sets, and the desire to share UI assets across Android, desktop, and web-like surfaces.

**Options**:
1. **PWA + local daemon**  
   - Pros: Leverages the PWA/offline lessons from the POS UX direction, runs on tablets, phones, and desktops without platform-specific builds, and updates instantly through the browser while IndexedDB and Service Workers keep catalogs and queue state offline. The local daemon (fiscal service) encapsulates USB CDC communication, nonce handling, and canonical payload serialization, keeping the trust boundary intact.  
   - Cons: Requires installing or running a small native helper on each terminal, but the helper can be minimal (Java/Go/Rust) and scoped strictly to device interactions.
2. **Flutter (single codebase)**  
   - Pros: Compiles to Android, desktop, and potentially web, offers smooth UI performance, and can reuse a single Dart codebase. Offline storage is supported via built-in plugins.  
   - Cons: Flutter apps still need a native module for USB CDC, complicating the trust boundary, and the team would need Dart expertise. Odoo-style web workflows would need to be rearchitected, and deploying updates requires reinstalling the app rather than just refreshing a browser page.
3. **React Native + native bridge**  
   - Pros: Shares JavaScript knowledge with the current web-focused team, supports Android and desktop via multi-platform frameworks, and integrates with native USB code through bridges.  
   - Cons: Native bridges add maintenance overhead for multiple platforms, offline caching and service worker–style updates do not come naturally, and code sharing with the cloud/web experience remains limited compared to a true web UI.
4. **Electron desktop app + separate Android native app**  
   - Pros: Electron can host the Odoo-inspired UI with full control over the file system and USB APIs, while a bespoke Android native app handles tablets.  
   - Cons: Increases maintenance (two codebases), bloats resource usage, and loses the lightweight, instant-on feel of the PWA. Electron’s appetite for CPU/memory conflicts with low-end retail hardware, and shipping separate apps for Android/tablet undermines the goal of a single POS experience.

**Rationale**: The PWA + local daemon option best balances the UX directives in `design/docs/pos/ui-ux.md`, offline-first constraints, and the USB trust boundary. The PWA delivers immediate updates, dual-currency dashboards, IndexedDB caching, and the fiscal-first ribbon described in the UX guide. Relying on a local fiscal daemon preserves the canonical payload handshake, nonce lifecycle, and USB CDC framing without exposing those responsibilities to the browser. Flutter, React Native, and Electron introduce heavier runtimes, multi-codebase complexity, or weaker alignment with the Odoo-inspired patterns we already document.

**Impact**:
- Build and maintain a minimal local fiscal daemon that can start at terminal boot, expose a secure REST/IPC surface, and talk over USB CDC to the fiscal device while enforcing canonical payload ordering.
- Harden deployment/installation so the daemon auto-starts and the browser UI can detect device status, nonces, and offline queue lengths via the daemon’s API.
- Document the daemon contract so frontend developers can continue to focus on PWA experiences (Service Workers, IndexedDB, localization) while the daemon owns USB trust boundary enforcement.
- Keep observability, logging, and firmware compatibility checks centralized inside the daemon to avoid leaking sensitive state into the untrusted browser.

**Review**: Reevaluate this choice if browsers gain reliable, secure USB CDC support without compromising the trust boundary, or if the daemon approach proves too brittle on specific merchant infrastructure. Also revisit if future compliance requirements demand a fully native stack for certified DGI integrations.
