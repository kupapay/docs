# Data Flow Diagrams

The architecture specification enforces that every fiscal interaction follows the trusted USB device and canonical payload rules. The diagrams below trace how invoices flow through the POS, fiscal service, DEF, cloud, and DGI in normal, degraded, and multi-terminal deployments.

!!! caution "Trust boundary reminder"
    The USB Fiscal Memory device is the only component that can fabricate fiscal numbers, signatures, and timestamps. Every diagram below keeps those primitives inside the trusted zone—no POS, local fiscal service, or cloud component generates them.

## Happy path sequence

The happy path starts with the cashier confirming a sale and ends with the sealed invoice reaching the DGI. The local fiscal service mediates canonical payload creation and the PREPARE→COMMIT handshake before the POS prints and syncs the sealed response.

```mermaid
sequenceDiagram
    actor Cashier
    participant POS
    participant FiscalService as "Fiscal Service"
    participant DEF as "USB DEF"
    participant Cloud
    participant DGI

    Cashier->>POS: confirm sale with items, tax groups, client classification
    POS->>FiscalService: serialize canonical payload (merchant_nif,outlet_id,totals)
    FiscalService->>DEF: TXN PREPARE canonical JSON
    DEF-->>FiscalService: nonce + validation result
    FiscalService->>DEF: TXN COMMIT + nonce
    DEF-->>FiscalService: fiscal response (fiscal_number,device_id,auth_code,timestamp,QR)
    FiscalService->>POS: deliver sealed response
    POS->>POS: print receipt with DEF security elements
    POS->>Cloud: queue sealed invoice for sync
    Cloud->>DGI: upload sealed invoice in arrival order
```

## Offline-first sequence

When connectivity to the cloud/DGI is down, the device continues to accept PREPARE→COMMIT flows while the POS stores sealed invoices locally. Once the network returns, the queue drains in chronological order so deferred uploads preserve the audit trail.

```mermaid
sequenceDiagram
    actor Cashier
    participant POS
    participant FiscalService as "Fiscal Service"
    participant DEF as "USB DEF"
    participant Queue as "Local Queue"
    participant Cloud
    participant DGI

    Cashier->>POS: confirm sale
    POS->>FiscalService: send canonical payload
    FiscalService->>DEF: TXN PREPARE
    DEF-->>FiscalService: nonce
    FiscalService->>DEF: TXN COMMIT
    DEF-->>FiscalService: fiscal response
    FiscalService->>POS: deliver sealed reply
    POS->>Queue: store sealed invoice (cloud unreachable)
    Note right of Queue: await connectivity
    Queue->>Cloud: push queued invoice when online
    Cloud->>DGI: upload sealed invoice
```

## Void event sequence

Voids become new fiscal events that reference the original invoice. The POS builds a canonical void payload, the DEF validates the reference and counters, and the system issues a fresh fiscal number for auditing.

```mermaid
sequenceDiagram
    actor Cashier
    participant POS
    participant FiscalService as "Fiscal Service"
    participant DEF as "USB DEF"
    participant Cloud
    participant DGI

    Cashier->>POS: request void referencing invoice #123
    POS->>FiscalService: canonical void payload with original fiscal_number
    FiscalService->>DEF: TXN PREPARE (void)
    DEF-->>FiscalService: nonce + context
    FiscalService->>DEF: TXN COMMIT (void)
    DEF-->>FiscalService: fiscal response (new fiscal_number,auth_code)
    FiscalService->>POS: print void receipt, queue sealed void
    Cloud->>DGI: upload void event alongside original reference
```

## Refund (credit note) sequence

Refunds and credit notes are handled as fresh fiscal events so auditors can trace them back to the original sale while preserving immutable counters and signatures.

```mermaid
sequenceDiagram
    actor Cashier
    participant POS
    participant FiscalService as "Fiscal Service"
    participant DEF as "USB DEF"
    participant Cloud
    participant DGI

    Cashier->>POS: initiate refund for invoice #123
    POS->>FiscalService: credit note payload with tax breakdown
    FiscalService->>DEF: TXN PREPARE (credit note)
    DEF-->>FiscalService: nonce, tax validation
    FiscalService->>DEF: TXN COMMIT
    DEF-->>FiscalService: fiscal response (new fiscal_number,QR)
    FiscalService->>POS: print credit note, queue sealed response
    Cloud->>DGI: upload credit note with memo referencing original
```

## Multi-terminal coordination

Every outlet shares a single DEF. The local fiscal service serializes access from multiple POS terminals, enforces the nonce-based handshake, and attaches outlet/POS/cashier IDs to every canonical request so the USB device maintains sequential ordering per outlet.

```mermaid
flowchart LR
    classDef untrusted fill:#fee,stroke:#c00;
    classDef trusted fill:#e6ffe6,stroke:#2a8f2a;

    subgraph Outlet ["Outlet Local Network"]
        POS1["POS Terminal 1"]
        POS2["POS Terminal 2"]
        Proxy["Local Fiscal Service"]
    end
    Cloud["Bono Pay Cloud"]
    DGI["DRC DGI"]
    DEF["USB Fiscal Memory Device"]

    POS1 -->|canonical payload + IDs| Proxy
    POS2 -->|canonical payload + IDs| Proxy
    Proxy -->|PREPARE & COMMIT| DEF
    DEF -->|fiscal response| Proxy
    Proxy -->|sealed invoice queue| Cloud
    Cloud --> DGI

    class POS1,POS2,Proxy untrusted
    class DEF trusted
```
