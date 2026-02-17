# Bill of Materials (BOM) & Manufacturing

This page captures the hardware cost structure for the USB Fiscal Memory device and the manufacturing steps required to keep the unit within the $10–15 COGS target while delivering the security required by the DRC regulators.

## Component cost breakdown

| Component | Example Part | Qty | Unit Cost (USD) | Notes |
|-----------|--------------|-----|----------------|-------|
| Secure MCU | STM32L4 / NXP Kinetis (Cortex‑M4/M33) | 1 | $3.00–5.00 | Handles USB CDC communication, JSON parsing, signing orchestration, and counter logic. |
| Secure Element | Microchip ATECC608B / NXP SE050 | 1 | $1.00–2.00 | Stores private keys, enforces monotonic counters, performs ECC signatures. |
| External Flash | 8‑16 Mbit SPI Flash | 1 | $0.50–1.00 | Optional journal extension when MCU flash is insufficient; protects log longevity. |
| RTC + Crystal | MCU RTC with 32.768 kHz crystal or dedicated RTC IC | 1 | ~$0.20 | Provides trusted timestamp; add ~$0.50 if battery-backed RTC required for full offline guarantee. |
| USB interface | USB‑C receptacle + ESD protection diodes | 1 | ~$0.70 | USB‑C female, protection components, and charging circuitry keep the device compliant with host ports. |
| Power regulation | Buck/LDO + supercap (optional) | 1 | ~$0.80 | Regulates USB power, supplies RTC backup, and protects against dirty 5 V rails. |
| Indicator LED | SMD LED + resistor | 1 | $0.05 | Communicates device health, sync status, and fiscalization success. |
| PCB | 4‑layer PCB with controlled impedance | 1 | ~$0.50 | Ensures solid grounding for USB security and EMI; includes tamper sensing traces. |
| Enclosure & tamper | Injection molded plastic / machining + seals | 1 | $0.50–1.00 | Durable casing with tamper‑evident screws or potting to defend the secure element. |
| Assembly & testing | SMT + firmware flashing + QA | 1 | $1.00–2.00 | Includes firmware programming, burn‑in, signature validation, and QA logs. |
| Contingency & logistics | Freight, customs, certificates | — | ~$0.50 | Covers shipping, certifications, and regulatory paperwork. |

**Estimated materials + manufacturing:** ~$10–15 per device (materials + assembly + testing + logistics). This leaves room for margin, support, and certification costs.

## Total COGS & pricing approach

KutaPay targets a $10–15 COGS for the fiscal device, which enables a retail/wholesale price in the $50–100 range (per the regulatory appendix) while accounting for logistics, certification, and support. The markup funds:

- Merchant onboarding and activation tooling.
- Device registration with DGI and firmware validation.
- Support services for field deployment (helpdesk, monitoring).

### Sensitivity analysis

- **Secure Element cost doubles:** If the SE price jumps to $4 (e.g., switching to an SE050 or offering extra tamper protection), the BOM climbs to ~$11.8–17.0, pressuring the price unless we offset via lower margins or operational efficiencies.
- **Microcontroller volatility:** A MCU surge to $6.50 increases the upper bound above $16; mitigating actions include supplier contracts or redesigning firmware for alternative MCU families.
- **Assembly/test labor spikes:** A $0.50 rise in assembly pushes COGS ~0.5 higher; automation and batch programming reduce this risk.

Use these scenarios when negotiating with contract manufacturers and to decide whether optional components (e.g., supercap, enclosure upgrades) are worth including in every unit or offered as premium upgrades.

## Manufacturing considerations

Adhering to the trust boundary and regulator expectations requires more than parts pricing:

1. **Quality assurance:** Each device must pass counter increment tests, signature verification, and memory dump checks before shipment. Maintain traceability records in the production log to satisfy audits.
2. **Tamper protection:** The enclosure should favor tamper‑evident screws, potting, or seals so any physical intrusion invalidates the device; log this observation in the QA report.
3. **Firmware control:** Firmware updates occur rarely; deliver signed firmware image packages and enforce signature checks, keeping older versions for rollback if DGI rules change unexpectedly.
4. **Device activation:** Devices remain inert until associated with a merchant and registered with DGI. Activation includes key provisioning (either pre‑loaded keys or DGI certificate exchange) and printing the device ID on the casing for audit.
5. **Logistics:** Batch shipments to DRC must consider customs clearance for cryptographic hardware. Keep track of serial numbers, firmware versions, and DGI registration status to expedite homologation.

!!! caution
    Keep the $10–15 COGS goal visible during negotiations. Small increases in any component multiply across thousands of units, which can push the device past affordability thresholds mandated by the DRC market and regulators.
