# Tax Engine Schema Specification

## Overview

WHEN a fiscal invoice is prepared, THE SYSTEM SHALL enforce the DGI requirement that the tax engine reports against 14 official tax groups, client classifications, and rounding rules before the USB Fiscal Memory device signs the payload. This specification captures the current understanding from `docs/sfe-specifications-v1-summary.md` and the `DISCUSSION.md` notes about tax handling, so that the canonical schema can be validated by the trusted device and later synchronized with the SFE/xPOS logic.

## DGI Tax Group Matrix

| Code | Name | Rate | Applicability | Notes |
|------|------|------|---------------|-------|
| TG01 | Exempt | 0% | Diplomats, embassies, NGOs, and government-to-government transfers | Matches DGI exemption list; overrides other rates. |
| TG02 | Standard VAT — Goods | 16% | Most domestically manufactured tangible goods sold at retail or wholesale | Default for goods that are not otherwise categorized. |
| TG03 | Standard VAT — Services | 16% | Professional services, consulting, financial services, and other intangible offerings | Keeps services on the same top-line rate while preserving a separate code for reporting. |
| TG04 | Reduced VAT | 9% | Essential foodstuffs and medicines identified by the Ministry of Finance | Reduced rate applies only when the item is flagged by the catalog metadata. |
| TG05 | Public Financing VAT | 16% | Goods and services financed by public funds or concessional programs | Requires tracking of the funding source to be audited by DGI. |
| TG06 | Customs VAT | 16% | Imported goods measured at the customs gate (CIF basis) | Applies in addition to customs duties; Treasury may reuse the same code for customs warehouses. |
| TG07 | Export Zero Rate | 0% | Export invoices and services rendered to buyers outside the DRC | The export certificate number must accompany the invoice. |
| TG08 | Special Regime — Agriculture | 5% | Agricultural inputs and outputs that receive preferential treatment | Applies only when the supplier is registered in the agricultural regime. |
| TG09 | Special Regime — Mining | 10% | Mining sector goods and services subject to a bespoke program | The mining license number must be stored with the line item. |
| TG10 | Specific Tax — Fuel | 25% | Gasoline, diesel, and aviation fuel | Rate derived from the excise schedule; may vary per update. |
| TG11 | Specific Tax — Tobacco | 30% | Cigarettes, cigars, and other tobacco preparations | Packaged and unpackaged tobacco use the same code. |
| TG12 | Specific Tax — Alcohol | 20% | Spirits, beer, and wine for domestic consumption | Includes products sold for consumption in DRC venues. |
| TG13 | Specific Tax — Telecommunications | 15% | Mobile voice, data bundles, and SMS packages sold in DRC | Telecom operator ID must be recorded on the invoice. |
| TG14 | Specific Tax — Digital Services | 12% | Streaming, SaaS, and online advertising provided to Congolese clients | Applies to both local and foreign providers once the service is consumed locally. |

*Notes:* Every tax group in the table must appear in the `tax_group_manifest` configuration that is shipped with the fiscal engine and refreshed via the USB device provisioning process whenever the DGI publishes updates.

## Client Classification

Classification affects which tax groups can be used and which deductions are allowed.

| Classification | Description | Tax Engine Impact |
|----------------|-------------|-------------------|
| `individual` | Private person or consumer | Can only use TG01–TG07 unless a specific tax group is mandated by the item metadata. |
| `company` | Registered corporate entity | Full access to all 14 tax groups; default to TG02/TG03 for most transactions. |
| `commercial_individual` | Sole trader or merchant | Similar behavior to `company` but logged with proprietor ID and allowed to apply TG08/TG09 when certified. |
| `professional` | Licensed professionals (lawyers, accountants, health practitioners) | Services default to TG03; some licensed professions can request TG04 if the MInistry of Economy approves. |
| `embassy` | Diplomatic missions and consular offices | Automatically defaults to TG01 (Exempt) unless explicit `tax_override` code is provided by DGI. |

## Canonical Tax Schema

The canonical JSON payload sent to the USB device must include the following tax-dedicated structures:

```json
{
  "invoice_number": "INV-2026-0001",
  "invoice_type": "sale",
  "client_classification": "company",
  "tax_details": [
    {
      "line_item_id": "LI-001",
      "tax_group_code": "TG02",
      "tax_rate": 0.16,
      "tax_base": 100000.00,
      "tax_amount": 16000.00,
      "_line_description": "Solar panels",
      "client_classification": "company"
    }
  ],
  "tax_summary": [
    {
      "tax_group_code": "TG02",
      "tax_rate": 0.16,
      "tax_base": 100000.00,
      "tax_amount": 16000.00
    }
  ],
  "tax_group_manifest_version": "2026-02-01",
  "tax_rounding_adjustment": 0.00
}
```

*Schema requirements:*

1. `tax_group_code` must match one of the TG01–TG14 values from the matrix above.
2. Each `tax_details` entry must list `tax_base`, `tax_rate`, `tax_amount`, and may carry `line_item_id` or `catalog_id` for traceability.
3. `tax_summary` aggregates per-group totals and is used by the device to produce Z/X/A reports.
4. `tax_group_manifest_version` is a UTC timestamp that indicates the version of the tax group master data that produced the invoice.
5. `tax_rounding_adjustment` captures any rounding delta introduced when summing line taxes.

## Tax Calculation Requirements (EARS)

1. WHEN the invoice is destined for an embassy, THE SYSTEM SHALL default the entire invoice to TG01 (Exempt) and fail fiscalization if any other tax group is selected without DGI override metadata.
2. WHEN a line item is exported or consumed outside the DRC, THE SYSTEM SHALL tag it with TG07 (Export Zero Rate) and include the export certificate in `line_references`.
3. WHEN the classification is `professional` and the service is eligible for the reduced rate, THE SYSTEM SHALL apply TG04 (Reduced VAT) instead of TG03 and add `professional_approval_id` to the line data.
4. WHEN a mined product is sold, THE SYSTEM SHALL choose TG09 (Special Regime — Mining) and record the operator’s mining license on the line item so the USB device can verify against DGI bindings.
5. WHEN the invoice contains goods subject to excise (fuel, tobacco, alcohol, telecom, digital services), THE SYSTEM SHALL emit the specific TG10–TG14 code in `tax_group_code`, including the relevant surcharge metadata (e.g., `excise_certificate_id`).
6. WHEN multiple tax groups appear on the same invoice, THE SYSTEM SHALL fill `tax_summary` with one entry per group and include the `tax_rate` carried from the `tax_group_master`.
7. WHEN the final tax totals are computed, THE SYSTEM SHALL round each line-level `tax_amount` to the nearest 0.01 using half-up rounding and place any residual difference into `tax_rounding_adjustment`.
8. WHEN a fiscal report is requested, THE SYSTEM SHALL use `tax_summary` to drive Z/X/A output so that each TG## code can be filtered by report type.

## Tax Rate Maintenance & Rounding

The DGI may update rates; maintain a `tax_group_master` table that records `code`, `name`, `rate`, `effective_from`, and `notes`. The device should reload the table before issuing invoices and reject invoices when a tax group or rate is stale. Rounding always happens at the line level, and the rounding adjustment is added to the canonical payload so that the USB device can produce auditable totals that sum back to the invoice grand total.

## Reporting Validation

THE SYSTEM SHALL validate that `tax_summary` contains entries for every tax group present in the invoice and that zero amount entries include `tax_base` and `tax_rate` even when the amount is 0. This ensures the Z/X/A reports remain consistent with DGI expectations for the 14 tax groups and helps auditors map totals to the manifest version.
