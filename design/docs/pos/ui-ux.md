# POS UX & UI Direction

This page captures the UX and interface rules that help the KutaPay POS feel as fluid as Odoo while obeying the DRC fiscal trust boundary. The POS remains the untrusted data-entry surface; every sale, void, refund, and report must be gated by the USB Fiscal Memory device before any receipt, journal entry, or Z-report is considered valid.

!!! warning "Trust & fiscalization gate"
    The POS **never** assigns fiscal numbers, signs invoices, or finalizes a sale until the USB Fiscal Memory device confirms PREPARE → COMMIT success. No receipt, no saved invoice, no queue promotion happens without that handshake. Nothing is ever deleted—voids and refunds are new fiscal events with their own signatures.

## UX Principles

1. **PWA + offline cohesion.** Bootstrap the POS as a Progressive Web App so the UI loads on any Android tablet, phone, or laptop. Use a Service Worker + IndexedDB (per the Odoo lesson) to cache catalogs, offline sessions, and UI assets so everything renders instantly, even when connectivity is absent.
2. **Single-screen checkout.** Follow Odoo’s single-screen flow: product grid, order summary, and numpad all visible without page reloads. Large tap targets (≥44×44 px), instant search-as-you-type, and barcode capture make the screen feel responsive even on low-end hardware.
3. **Fiscal-first status ribbon.** Always show a persistent device status band that reports “Device connected / disconnected / error” with color coding. Include the latest fiscal number, auth code snippet, and a countdown if the device is waiting for PREPARE/COMMIT.
4. **Dual-currency + payment clarity.** Display USD and CDF totals side-by-side. Payment method chips (Cash, Mobile Money, Bank Transfer) show currency, available balance, and split-payment stacking right on the checkout screen.
5. **Minimal typing, maximal touch.** Favor tap, drag, scan, and numpad input over keyboards. Input fields exist only for customer selection (with classification) and notes. Buttons and chips replace drop-downs whenever possible.
6. **Localization-ready labels.** Every label supports French and Lingala with a global language toggle. Numbers, dates, and currency formats adjust automatically.
7. **Visibility of sync state.** Show a queue indicator (“5 invoices pending cloud sync”) separate from fiscal status. The offline queue widget highlights when uploads are overdue and links to retry actions.

!!! note "Lessons from Odoo"
    Odoo’s offline resilience, IndexedDB caching, and single-screen sales workflow remain the baseline. KutaPay adopts those patterns but adds the fiscal device overlays, dual-currency handling, and queued sync indicators described above.

## User Journeys

### Fiscalized sale

1. Cashier selects products (instant search, barcode, categories) and the tax engine tags each line with one of the 14 DGI tax groups.
2. Customer and client classification (individual, company, commercial individual, professional, embassy) are chosen before the “Validate/Print” action becomes available.
3. The POS builds the canonical payload (ordered JSON), then sends `TXN|PREPARE` to the USB device. The UI highlights “Awaiting fiscal device…” while the device increments its monotonic counter and hashes the previous invoice.
4. On `TXN|COMMIT` success, the device replies with fiscal number, auth code, timestamp, and QR metadata. The POS saves the sale locally, prints the receipt, and shows a success banner with the new fiscal number and QR preview.
5. The offline queue widget continues to track whether the invoice has been uploaded to the cloud/DGI; the sale remains compliant even if upload is pending.

### Void flow

1. Immediately after a sale (before upload), the cashier taps the sale, selects “Void,” and confirms the reason.
2. The POS sends a void command with the original fiscal number to the USB device. The UI warns that the void cannot proceed until the device confirms and displays the “Nothing can exit the trusted zone without device approval” reminder.
3. The device writes a void entry referencing the original invoice, replies with a new authorization code, and the POS prints a void receipt. The sale stays marked as voided; the canonical payload is stored in IndexedDB for audit.

### Refund flow

1. Later, when a customer returns, the cashier searches past invoices (by fiscal number or QR scan) and taps “Refund.” Items and amounts are selected, and the refund total displays in USD/CDF.
2. The POS generates a refund payload (negative amounts referencing the original) and transmits it to the device as a new fiscal event.
3. After COMMIT, a refund receipt prints with the new fiscal number, auth code, and reference to the original invoice. The UI labels the refund as a credit note, never modifying the original order.

### Z-report & shift close

1. At cashier shift close, the user taps “Z-report” from the session overview screen.
2. The UI collects cash count inputs, triggers `RPT|Z` on the USB device, and displays the daily totals per tax group plus the device’s signature/ hash.
3. The POS prints the Z-report, marks the session as closed, and queues any pending uploads to DGI. A “Z-report sent” badge remains until the cloud confirms receipt.

## Wireframe descriptions

=== "Checkout screen"

    #### Layout
    - Left: product grid with categories, barcode input, instant search, and favorites.
    - Right: order summary with item list, dual-currency subtotal/VAT, tax group badges, and payment method chips.
    - Bottom: numpad overlay (quantity/price entry) that slides up from the footer.

    #### Device & fiscal status
    - Top ribbon: device connection icon, fiscal number, auth code snippet, and compliance warning if the device is missing.
    - Inline alert below the ribbon for “Fiscal device not found” or “COMMIT timeout,” blocking receipt printing until cleared.
    - Persistent footer widget showing offline queue count and “Upload pending” status.

=== "Adjustment modals (void/refund)"

    #### Void modal
    - Displays original fiscal number, amount, and reason field.
    - Buttons: “Send to USB device” (primary) and “Cancel.”
    - Warning text: “The device will log a void entry with its own fiscal number. Nothing is deleted.”

    #### Refund modal
    - Selected items listed with checkboxes and return quantities.
    - Refund total preview with USD + CDF breakdown and tax group info.
    - Submit button triggers device handshake; disable until device responds.

=== "Back-office / Z-report screen"

    #### Session overview
    - Session card with cashier name, cash drawer totals, offline queue count, and “Close session” button.
    - Z-report card showing daily totals by tax group, device signature, and “Print Z-report” action.
    - Language toggle (FR / LN) and accessibility controls (contrast, font size) grouped near the header.

## Localization & accessibility

1. **Language toggle:** Every screen includes a French / Lingala switch that updates labels, button text, and compliance messaging simultaneously.
2. **High contrast and text scaling:** Buttons enlarge to support touch; icons and text meet WCAG 2.1 AA contrast ratios (especially the fiscal status ribbon).
3. **Accessible notifications:** Fiscal errors, sync warnings, and device disconnections are repeated both visually (badges, banners) and audibly (optional tone) for noisy retail environments.
4. **Dual-currency formatting:** All totals display USD and CDF with the configured exchange rate, and number inputs honor the local decimal conventions.
5. **Payment method icons:** Mobile money partners (Airtel, Orange, Vodacom M-Pesa) get recognizable icons that stay legible even at smaller sizes.

!!! note "Offline visibility"
    The POS keeps an offline queue indicator separate from fiscal status. Fiscalization happens first; the queue only tracks uploads to the cloud and DGI. If invoices linger offline beyond the grace period, highlight the queue in amber and provide a “Retry upload” action.
