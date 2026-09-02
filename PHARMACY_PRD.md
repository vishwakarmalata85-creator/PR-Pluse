# Product Requirement Document (PRD): Pharmacy Module (PulsePharm)

**Document Version:** 1.0.0  
**Author:** AGENT 3 (PulsePharm Lead Engineer)  
**Target Release:** MVP / Q3 2026  
**Standard Compliance:** Drugs and Cosmetics Act 1940 & Rules 1945 (Schedule H, H1, X compliance), CDSCO Guidelines, Pharmacy Practice Regulations 2015, ABDM (Ayushman Bharat Digital Mission - M1/M2/M3), HL7 FHIR Release 4 (`MedicationRequest`, `MedicationDispense`, `InventoryItem`), HIPAA / DISHA  
**Status:** Approved for Engineering Execution  

---

## 1. Executive Summary & Module Vision

The **Pharmacy Operations & Inventory Portal (`PulsePharm`)** is the high-precision dispensing, catalog management, and inventory orchestration subsystem within the Nexora Pulse healthcare platform. Tailored for hospital pharmacies, polyclinic dispensaries, and retail pharmacy networks, PulsePharm bridges the critical operational gap between doctor prescriptions and patient medicine delivery.

PulsePharm eliminates dispensing errors, automates stock management via First-Expiry-First-Out (FEFO) rules, and slashes order fulfillment turnaround times from 12+ minutes to under 90 seconds.

```
+---------------------------------------------------------------------------------------------------+
|                                PULSEPHARM PHARMACY OPERATING SYSTEM                              |
+---------------------------------+---------------------------------+-------------------------------+
|     1. Live Inventory Engine    |     2. Bulk Ingestion Pipeline  |    3. Rx-Linked Order Queue   |
| - Real-time Stock Matrix & MRP  | - CSV/Excel Stream Parser       | - Digital Rx & OCR Slip Queue |
| - Batch No & Expiry (FEFO)      | - Zod Column & Value Validator  | - Split-Screen Inspector      |
| - Low-Stock & Expiry Sentinel   | - Auto-Upsert & Conflict Merger | - 1-Click Atomic Decrement    |
+---------------------------------+---------------------------------+-------------------------------+
|     4. Operational Co-Pilot     |     5. Generic Salt Substitutor |    6. Statutory Compliance    |
| - Gemini-Powered Velocity Model | - Exact Active Molecule Matching| - Schedule H / H1 / X Register|
| - Automated Reorder Suggestion  | - Strength & Form Parity Engine | - Pharmacist Digital Signature|
| - Dead-Stock & Leakage Auditing | - Patient Cost-Savings Matrix   | - ABDM FHIR Dispense Payload  |
+---------------------------------+---------------------------------+-------------------------------+
```

---

## 2. User Personas & Clinical / Operational Scenarios

### Persona 1: Rajesh Sharma, B.Pharm (Chief Dispensing Pharmacist, Hospital Central Pharmacy)
* **Context:** Manages dispensing across an 800-bed hospital OPD and walk-in counter processing 400+ prescriptions daily.
* **Pain Points:** Deciphering illegible handwritten slips; manual inventory deductions causing stock mismatch; long customer queues during peak OPD discharge hours.
* **PulsePharm Operational Journey:**
  1. Opens **Prescription Order Queue** $\rightarrow$ High-priority incoming digital prescription `#ORD-8821` appears in real time.
  2. Inspects split-screen layout: Doctor's digitally signed prescription on the left with verified ABHA identity; line items with live stock status on the right.
  3. All 3 medicines show `IN_STOCK (Batch: B2026-X, Expiry: 08/2027)`.
  4. Pharmacist clicks **"Confirm & Dispense"** $\rightarrow$ Database executes an atomic transaction, decrements live batch inventory, generates compliant Schedule H label, and dispatches an SMS notification to the patient. Encounter duration: **25 seconds**.

### Persona 2: Priya Nair (Pharmacy Inventory & Supply Chain Manager)
* **Context:** Oversees procurement, bulk supplier invoices, and regulatory compliance for a retail chain with 12,000 SKUs.
* **Pain Points:** Manual data entry of supplier stock invoices takes hours and introduces typographical errors in batch numbers and expiry dates; high revenue loss due to expired stock write-offs.
* **PulsePharm Operational Journey:**
  1. Receives distributor invoice containing 1,500 medicine batches in Excel/CSV format.
  2. Drops file into **Bulk Inventory Ingestion Engine** $\rightarrow$ Parser validates 1,500 rows in 800ms, flags 2 invalid date formats with inline error chips, and previews upsert count.
  3. Clicks **"Execute Batch Ingestion"** $\rightarrow$ Updates stock for 1,498 items without store downtime.
  4. PulsePharm Sentinel alerts: *"5 SKUs of Amoxicillin 500mg expiring within 45 days. Auto-promoted to Top-of-Queue (FEFO)."*

---

## 3. Core Features & Functional Requirements

### 3.1. Live Inventory Management
* **Inventory Master Data Schema:**
  * **Brand Name & Trade Name:** Formatted indexed naming (e.g., *Augmentin 625 Duo*, *Pan-D*, *Telma 40*).
  * **Generic Active Salt Composition:** Full molecule specification with concentration ratios (e.g., *Amoxicillin (500mg) + Clavulanic Acid (125mg)*).
  * **Dosage Form & Strength:** `Tablet`, `Capsule`, `Syrup`, `Injection`, `Ointment`, `Inhaler`, `Drops`, `Suspension`.
  * **Batch / Lot Number:** Unique alphanumeric tracking string (e.g., `AUG-2026-088`).
  * **Expiry Tracking (FEFO):** Exact Month/Year and Day expiry timestamps enabling strict First-Expiry-First-Out dispensing logic.
  * **Stock Metrics:** Current Physical Stock, Reserved Stock (allocated in active carts/orders), Safety Stock Threshold, Maximum Reorder Level.
  * **Financials:** Maximum Retail Price (MRP), Purchase Unit Cost, GST Rate (0%, 5%, 12%, 18%), HSN Code.
  * **Statutory Drug Classification:** Badges for `Schedule H`, `Schedule H1`, `Schedule X`, `OTC`, `Narcotic/Psychotropic`.

* **Smart Inventory Alerts & Visual Indicators:**
  * **Low-Stock Sentinel:** Red badge when stock falls below configured minimum threshold (Default: $\le 15$ units or dynamic safety stock).
  * **Near-Expiry Warning (Amber):** Items expiring within 60 days highlighted with countdown badges.
  * **Critical Expiry Alert (Red):** Items expiring within 30 days or already expired automatically quarantined from dispensing workflows.

---

### 3.2. Bulk Inventory Ingestion Engine (CSV / Excel)
* **High-Throughput File Ingestion:**
  * Supports `.csv`, `.xlsx`, and `.xls` uploads up to 50MB (50,000+ line items per file).
  * Client-side chunking and streaming parser via `papaparse` and `exceljs` with immediate progress telemetry.
* **Multi-Layer Validation Rules:**
  * **Mandatory Field Integrity:** Brand Name, Generic Composition, Dosage Form, Batch Number, Expiry Date (`YYYY-MM-DD` or `MM/YY`), Quantity ($\ge 0$), MRP ($> 0$).
  * **Date Normalization:** Automatic conversion of heterogeneous date formats (`DD-MM-YYYY`, `MM/YYYY`, `YYYY/MM/DD`).
  * **Duplicate Batch Protection:** Flags duplicate batch numbers within the same file or merges quantity if identical supplier invoice.
* **Batch Upsert & Conflict Resolution:**
  * Existing SKU + Same Batch: Increments physical stock count and updates MRP/Cost if changed.
  * Existing SKU + New Batch: Appends new batch entry under the medicine master with distinct expiry.
  * New SKU: Creates master medicine entity and seeds primary batch.
  * Dry-Run Preview Modal showing total additions, total updates, and line-by-line syntax error breakdown with 1-click download of error report.

---

### 3.3. Prescription-Linked Order Fulfillment Queue
* **Real-Time Multi-State Kanban Board:**
  * Columns: `NEW_ORDER`, `PREPARING`, `READY_FOR_PICKUP`, `OUT_FOR_DELIVERY`, `COMPLETED`, `CANCELLED`.
  * Real-time sync via WebSocket / Server-Sent Events (SSE) broadcasting instant updates upon doctor prescription generation or patient mobile uploads.
* **Dual-Pane Prescription Inspector:**
  * **Left Pane (Prescription Source):** Renders high-fidelity digital doctor prescription PDF (with cryptographic SHA-256 signature and ABDM QR) OR high-resolution scanned patient prescription slip with OCR extraction overlay.
  * **Right Pane (Order Line-Item Verifier):** Lists ordered medicines, required quantities, dosage instructions, and live matching inventory status (`100% In Stock`, `Partial Stock`, `Out of Stock`).
* **Atomic Order Confirmation & Stock Decrement:**
  * **1-Click Dispense Execution:** Executes database transaction with row-level locks ensuring zero race conditions.
  * **FEFO Auto-Allocation:** Automatically allocates units from batches nearest to expiry.
  * **Audit Trail:** Logs pharmacist User ID, timestamp, dispensed batch IDs, and statutory register entries.

---

### 3.4. PulsePharm Operational Co-Pilot (Powered by Gemini AI)
* **Smart Generic Salt Substitution Engine:**
  * Triggered automatically when an ordered brand is out of stock or when the patient requests generic equivalents.
  * Analyzes the active generic salt composition and exact milligram strength (e.g., *Augmentin 625 Duo* $\rightarrow$ *Amoxicillin 500mg + Clavulanic Acid 125mg*).
  * Queries local store inventory for matching in-stock brands or unbranded generic formulations (e.g., *Moxikind-CV 625* or *Jan Aushadhi Amoxicillin-Clav*).
  * Computes **Patient Cost Savings** ($\Delta \text{MRP}$) and generates instant substitute recommendation cards with 1-tap swap.
* **Predictive Inventory Forecasting:**
  * Evaluates 30-day dispensing velocity, local disease patterns, and doctor prescribing habits to generate automated reorder lists before stock-outs occur.

---

### 3.5. Statutory Regulatory Compliance & Schedule Registers
* **Schedule H1 Register Automation:**
  * Automatically populates statutory register for 3rd/4th generation antibiotics, anti-TB drugs, and habit-forming substances:
    * Date of Dispensing, Patient Name & Address, Prescriber Name & Registration Number, Drug Name & Batch Number, Quantity Dispensed.
* **Digital Dispense Record (ABDM FHIR R4):**
  * Emits standardized `MedicationDispense` FHIR JSON payload back to ABDM Health Data Exchange linked to patient's ABHA address.

---

## 4. Data Dictionary & FHIR R4 Entity Schema

```
+---------------------------------------------------------------------------------------------------+
|                                  PULSEPHARM DATA DICTIONARY                                       |
+---------------------+-------------------------+--------------------+------------------------------+
| Field Name          | Type                    | FHIR R4 Mapping    | Validation / Constraints     |
+---------------------+-------------------------+--------------------+------------------------------+
| id                  | UUID v4                 | Resource.id        | Primary Key                  |
| pharmacyId          | UUID v4                 | Organization.id    | Foreign Key -> Pharmacy      |
| brandName           | String(120)             | Medication.code    | Required, Indexed            |
| genericComposition  | String(255)             | Medication.ingr.   | Required, Case-Insensitive   |
| dosageForm          | Enum (Tablet, Syrup...) | Medication.form    | Standard SNOMED-CT Enum      |
| strength            | String(50)              | Medication.ingr.   | e.g., "500mg + 125mg"        |
| batchNumber         | String(50)              | Batch.lotNumber    | Required, Alphanumeric       |
| expiryDate          | DateTime                | Batch.expiration   | ISO-8601, Future Date        |
| physicalStock       | Integer                 | InventoryItem.qty  | Min: 0                       |
| reservedStock       | Integer                 | InventoryItem.hold | Min: 0                       |
| mrp                 | Decimal(10,2)           | UnitCost           | Currency (INR/USD), > 0      |
| purchasePrice       | Decimal(10,2)           | AcquisitionCost    | Currency, > 0                |
| scheduleCategory    | Enum (OTC, H, H1, X)    | LegalClassification| Statutory Classification     |
+---------------------+-------------------------+--------------------+------------------------------+
```

---

## 5. Non-Functional Requirements (NFRs)

1. **Transaction Integrity & Concurrency:** Zero inventory overselling under high concurrent load (isolation level `REPEATABLE READ` or transactional mutex).
2. **Sub-Second Search Latency:** Inventory search and generic substitution matching returns in $< 80\text{ms}$ across 50,000+ SKUs using in-memory / PostgreSQL GIN tri-gram indexing.
3. **Bulk Ingestion Speed:** Parsing and database upsert of 5,000 inventory items completes in $< 3.5\text{ seconds}$.
4. **Offline Resilience:** Critical point-of-sale dispensing functions remain operational during intermittent network disconnection via local IndexedDB cache.
