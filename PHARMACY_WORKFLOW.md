# Workflow Specification: Pharmacy Module (PulsePharm)

**Document Version:** 1.0.0  
**Author:** AGENT 3 (PulsePharm Lead Engineer)  
**Target Release:** MVP / Q3 2026  
**Standard Compliance:** Drugs and Cosmetics Act 1940 / Rules 1945 (Schedule H/H1/X), CDSCO, ABDM (M1/M2/M3), HL7 FHIR Release 4 (`MedicationDispense`)  

---

## 1. Workflow 1: Live Inventory Management & FEFO Stock Lifecycle

This workflow governs real-time stock inspection, batch tracking, automated First-Expiry-First-Out (FEFO) ordering, and proactive low-stock/near-expiry alert management.

```mermaid
sequenceDiagram
    autonumber
    actor Pharmacist as Inventory Manager / Pharmacist
    participant UI as PulsePharm UI (TanStack Table)
    participant Store as State Store (Zustand)
    participant API as /api/pharmacy/inventory
    participant DB as Postgres / Prisma DB

    Note over Pharmacist,UI: Step 1: Real-Time Stock Inspection
    Pharmacist->>UI: Opens Live Inventory Dashboard
    UI->>API: GET /api/pharmacy/inventory?pharmacyId=ph-001&filter=all
    API->>DB: Query active items + batches (grouped by expiryDate ASC)
    DB-->>API: Return stock items with batch breakdown
    API-->>UI: Render interactive table with FEFO badges & Stock meters

    Note over UI,DB: Step 2: Automated Sentinel Alert Check
    loop Every Stock Item
        alt Physical Stock <= Reorder Threshold (e.g. 15 units)
            UI->>UI: Render Red "LOW_STOCK" Badge & "Reorder" Quick-Action
        else Expiry Date <= 60 Days
            UI->>UI: Render Amber "NEAR_EXPIRY" Badge (FEFO Priority Dispense)
        else Expiry Date <= 0 Days (Expired)
            UI->>UI: Render Red "EXPIRED" Quarantine Badge (Disabled from Dispense)
        end
    end

    Note over Pharmacist,DB: Step 3: Manual Stock Adjustment / Batch Quarantine
    Pharmacist->>UI: Clicks "Quarantine Damaged Batch" on Batch #B2026-09
    UI->>API: PATCH /api/pharmacy/inventory/batches/batch-09 { isQuarantined: true }
    API->>DB: Update batch status & subtract from totalStockQuantity
    DB-->>API: Batch Quarantined
    API-->>UI: Real-time UI refresh (Batch locked from order fulfillment)
```

---

## 2. Workflow 2: Bulk CSV / Excel Ingestion & Batch Upsert Pipeline

This workflow defines the ingestion of distributor stock spreadsheets, client-side streaming parsing, column validation, dry-run previews, and atomic chunked database upserts.

```mermaid
sequenceDiagram
    autonumber
    actor Manager as Pharmacy Procurement Manager
    participant UI as Bulk Ingestion Modal (Drag & Drop)
    participant Parser as PapaParse Client Stream
    participant API as /api/pharmacy/inventory/bulk-upload
    participant DB as Postgres / Prisma DB

    Manager->>UI: Drops distributor invoice file (e.g. invoice_1500_skus.csv)
    UI->>Parser: Parse raw CSV text stream
    Parser-->>UI: Stream parsed rows & validate Zod schema (headers, date formats, quantities)
    
    alt Validation Errors Found (e.g. Invalid Expiry / Missing Batch)
        UI->>Manager: Display "Validation Failed" Modal with row numbers & downloadable error report
    else Schema Valid (Zero Critical Errors)
        UI->>Manager: Display "Dry-Run Preview" (Total SKUs: 1,500 | New: 450 | Updates: 1,050)
        Manager->>UI: Clicks "Execute Bulk Ingestion"
        UI->>API: POST /api/pharmacy/inventory/bulk-upload (FormData with CSV payload)
        
        Note over API,DB: Chunked Atomic Transactions (100 rows per chunk)
        loop Every 100 Rows Chunk
            API->>DB: Upsert InventoryItem Master (increment totalStock)
            API->>DB: Upsert InventoryBatch (update quantity, expiry, MRP, cost)
        end
        
        DB-->>API: All chunks successfully committed
        API-->>UI: Return Ingestion Telemetry Summary
        UI->>Manager: Display Success Toast ("1,500 SKUs live in store catalog")
    end
```

---

## 3. Workflow 3: Prescription-Linked Order Queue & Atomic Fulfillment

This workflow outlines the core dispensing process: receiving real-time digital prescriptions (or patient OCR slips), verifying stock availability, inspecting prescription details in split-screen, and executing atomic inventory decrement.

```mermaid
sequenceDiagram
    autonumber
    actor Pharmacist as Dispensing Pharmacist
    participant UI as Order Queue Kanban (PulsePharm)
    participant SSE as Server-Sent Events / SSE Stream
    participant API as /api/pharmacy/orders/fulfill
    participant DB as Postgres / Prisma DB
    participant ABDM as ABDM Bridge (FHIR R4)

    Note over UI,SSE: Real-Time Incoming Order Arrival
    SSE-->>UI: Push New Order Event: #ORD-2026-8821 (Status: NEW_ORDER)
    UI->>Pharmacist: Sound Alert & High-Priority Amber Badge on Kanban Board

    Note over Pharmacist,UI: Step 1: Split-Screen Prescription Inspection
    Pharmacist->>UI: Clicks Order #ORD-2026-8821
    UI->>UI: Open Split-Screen Modal
    Note right of UI: Left: Doctor-Signed Digital Rx (ABHA Verified / QR Encoded)<br/>Right: Line Items (Augmentin 625 x 10, Pan-D x 10, Dolo 650 x 10)
    
    UI->>UI: Auto-Check Live Inventory: ALL ITEMS 100% IN STOCK

    Note over Pharmacist,DB: Step 2: Atomic 1-Click Order Dispense
    Pharmacist->>UI: Clicks "Confirm & Dispense Order"
    UI->>API: POST /api/pharmacy/orders/fulfill { orderId, pharmacistLicense }
    
    rect rgb(240, 248, 255)
        Note over API,DB: Atomic Database Transaction ($transaction with RepeatableRead)
        API->>DB: 1. Lock Order & verify status == NEW_ORDER
        API->>DB: 2. Query batches for item 1 (FEFO sorted: Earliest Expiry first)
        API->>DB: 3. Decrement physical units on Batch #AUG-08
        API->>DB: 4. Log immutable BatchDispenseAudit record
        API->>DB: 5. Decrement InventoryItem master total stock
        API->>DB: 6. Insert Schedule H1 Register entry (Doctor Reg No, Batch No, Qty)
        API->>DB: 7. Transition Order status -> READY_FOR_PICKUP
    end

    DB-->>API: Transaction Committed Successfully
    API-->>ABDM: Emit FHIR R4 MedicationDispense JSON record
    API-->>UI: Return Success Response
    UI->>Pharmacist: Move Order Card to "READY_FOR_PICKUP" & Print Dispense Label
```

### Order Fulfillment State Machine
```
   [NEW_ORDER]
        │
        ├───(Stock Unavailable / Prescriber Reject)────► [CANCELLED] (Reason Logged)
        │
        └───(Pharmacist Verifies Stock & Accepts)─────► [PREPARING]
                                                             │
                                                             │ (1-Click Atomic Dispense & Stock Decrement)
                                                             ▼
                                                    [READY_FOR_PICKUP]
                                                             │
                                   ┌─────────────────────────┴─────────────────────────┐
                                   │ (In-Store Patient Pickup)                         │ (Home Delivery Dispatch)
                                   ▼                                                   ▼
                              [COMPLETED]                                     [OUT_FOR_DELIVERY]
                                                                                       │
                                                                                       │ (Proof of Delivery)
                                                                                       ▼
                                                                                  [COMPLETED]
```

---

## 4. Workflow 4: Smart Generic Salt Substitution & Out-of-Stock Resolution

This workflow details how the **PulsePharm Operational Co-Pilot (Gemini AI)** resolves out-of-stock scenarios by recommending chemical bio-equivalent generic alternatives with cost-benefit transparency.

```mermaid
sequenceDiagram
    autonumber
    actor Pharmacist as Dispensing Pharmacist
    participant UI as Prescription Inspector UI
    participant Copilot as PulsePharm AI Co-Pilot (Gemini 2.5 Flash)
    participant API as /api/pharmacy/copilot/substitute
    participant DB as Postgres / Prisma DB
    actor Patient as Patient / Customer

    Note over Pharmacist,UI: Prescribed Brand Out of Stock
    Pharmacist->>UI: Inspects Order: "Augmentin 625 Duo" (Stock: 0 Units)
    UI->>UI: Highlight Red Alert: "OUT OF STOCK"
    Pharmacist->>UI: Clicks "Find Generic Substitute" (AI Co-Pilot)

    Note over UI,Copilot: AI Bio-Equivalence & Local Stock Matching
    UI->>API: POST /api/pharmacy/copilot/substitute { targetSalt: "Amoxicillin + Clavulanic Acid", strength: "500mg + 125mg" }
    API->>DB: Query in-stock medicines with identical normalized generic molecule
    DB-->>API: Returns candidate: "Moxikind-CV 625" (Stock: 80 units, MRP: ₹120 vs ₹210)
    API->>Copilot: Prompt Gemini 2.5 Flash to verify bio-equivalence & safety
    Copilot-->>API: Return Verified Substitute Card (Exact Match: 100%, Patient Savings: 43%)
    API-->>UI: Render Interactive Substitute Selection Card

    Note over Pharmacist,Patient: Patient Consent & Order Update
    Pharmacist->>Patient: Informs patient: "Augmentin out of stock. Moxikind-CV 625 is identical molecule, saves ₹90."
    Patient-->>Pharmacist: Agrees to substitution
    Pharmacist->>UI: Taps "Apply Moxikind-CV 625 Substitution"
    UI->>UI: Update Order Line Item (sets isSubstituted: true, originalBrand: "Augmentin 625")
    UI->>Pharmacist: Ready for 1-Click Atomic Dispense
```
