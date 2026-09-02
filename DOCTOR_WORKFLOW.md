# Workflow Specification: Doctor & Clinic Module (PulseMD)

**Document Version:** 1.0.0  
**Author:** AGENT 2 (PulseMD Lead Engineer)  
**Target Release:** MVP / Q3 2026  
**Standard Compliance:** HIPAA, DISHA, HL7 FHIR Release 4, ABDM (M1/M2/M3), National Medical Commission (NMC)  

---

## 1. Workflow 1: Appointment Lifecycle & Consultation Intake

This workflow defines the operational state transitions for patient scheduling, queue summoning, and automatic EMR longitudinal history hydration.

```mermaid
sequenceDiagram
    autonumber
    actor Doctor
    participant UI as PulseMD Dashboard UI
    participant Store as State Store (Zustand)
    participant API as /api/doctor/appointments
    participant DB as Postgres / Prisma DB
    participant EMR as ABDM / EMR Vault Bridge

    Note over Doctor,UI: Step 1: Appointment Management
    Doctor->>UI: Views Daily OPD Schedule (Calendar / Queue view)
    UI->>API: GET /api/doctor/appointments?date=2026-09-02
    API->>DB: Query scheduled appointments & token queue
    DB-->>API: Return appointments list (PENDING, CONFIRMED)
    API-->>UI: Render interactive schedule grid

    alt Doctor Accepts / Declines Appointment
        Doctor->>UI: Clicks "Accept" (or "Decline" with reason)
        UI->>API: PATCH /api/doctor/appointments { id, action: 'ACCEPT' }
        API->>DB: Update status -> CONFIRMED
        DB-->>API: OK
        API-->>UI: Dispatch SMS / WhatsApp confirmation to Patient
    end

    Note over Doctor,UI: Step 2: Consultation Launcher
    Doctor->>UI: Clicks "Start Consultation" on Token #T-104 (Anil Verma)
    UI->>API: PATCH /api/doctor/appointments { id, action: 'START' }
    API->>DB: Update status -> IN_CONSULT
    UI->>Store: Set active consultation context (patientId: usr-pat-001)
    
    UI->>EMR: GET /api/doctor/emr/usr-pat-001 (ABHA: 91-4829-1029-4412)
    EMR-->>UI: Return Longitudinal History (Allergies: [Penicillin], Chronic: [T2D], Past Encounters)
    UI->>Doctor: Render Split-Screen Layout (Left: EMR History & Red Allergy Banner | Right: Rx Builder)
```

### Appointment Lifecycle State Machine
```
   [PENDING]
     │
     ├───(Doctor Declines)───────────► [CANCELLED] (Reason Logged)
     │
     └───(Doctor Accepts)────────────► [CONFIRMED]
                                          │
    ┌─────────────────────────────────────┴─────────────────────────────────────┐
    │ (Rescheduled by Doctor/Patient)                                           │ (Doctor summons Token)
    ▼                                                                           ▼
[RESCHEDULED] ───► [CONFIRMED]                                            [IN_CONSULT]
                                                                                │
                                                                                │ (Prescription Signed)
                                                                                ▼
                                                                           [COMPLETED]
```

---

## 2. Workflow 2: Rapid Digital Prescription Authoring & Gemini DDI Sentinel

This workflow details the high-speed prescription creation loop, integrating rapid-tap dosage chips, ICD-10 diagnostic tagging, and real-time **Google Gemini 2.5 Flash** Drug-Drug Interaction (DDI) & allergy validation.

```mermaid
sequenceDiagram
    autonumber
    actor Doctor
    participant UI as Prescription Builder UI
    participant CoPilot as Gemini 2.5 Flash DDI Sentinel
    participant Store as Form State (React Hook Form)
    participant DB as Postgres / Prisma DB

    Doctor->>UI: Types "cefix" in Medicine Autocomplete
    UI-->>Doctor: Dropdown matches: "Cefixime 200mg Oral Tablet"
    Doctor->>UI: Selects item -> Taps Dosage Chips: [1-0-1] [5 Days] [After Food]
    UI->>Store: Append medication line item

    Doctor->>UI: Types "pan 40" -> Taps Chips: [1-0-0] [7 Days] [Empty Stomach]
    UI->>Store: Append second line item

    Note over UI,CoPilot: Real-Time Clinical Safety Interlock
    UI->>CoPilot: POST /api/doctor/prescribe/validate { medicines, allergies, conditions }
    
    Note over CoPilot: Gemini 2.5 Flash evaluates pharmacokinetics,<br/>CYP450 pathways & patient allergy contraindications
    
    alt Critical DDI / Allergy Conflict Detected
        CoPilot-->>UI: { hasSevereWarning: true, warnings: [{ severity: "CRITICAL", interaction, recommendation }] }
        UI->>Doctor: Render Pulsing Red Warning Modal (e.g., Penicillin Allergy Clash)
        Doctor->>UI: Either modifies drug OR logs clinical justification override
    else Safety Check Passed (SAFE / LOW Warning)
        CoPilot-->>UI: { hasSevereWarning: false, warnings: [] }
        UI->>Doctor: Display Emerald Green "Safety Validated" badge
    end

    Doctor->>UI: Clicks "Sign & Issue Prescription"
    UI->>DB: POST /api/doctor/prescriptions/save (Save draft & items)
    DB-->>UI: Prescription record created (UUID: rx-2026-8910)
```

---

## 3. Workflow 3: Shorthand Clinical Notes Natural Language Parser

This workflow illustrates how doctors can dictate or type unstructured clinical shorthand, allowing **Google Gemini 2.5 Flash** to automatically construct structured prescription cards.

```mermaid
sequenceDiagram
    autonumber
    actor Doctor
    participant ShorthandBox as Shorthand Textarea / Voice Input
    participant Gemini as /api/doctor/prescribe/shorthand (Gemini 2.5 Flash)
    participant RxGrid as Prescription Table

    Doctor->>ShorthandBox: Types: "c/o fever x 3d, sore throat. adv azithro 500 tid 3d, pan 40 od, paracetamol 650 sos"
    Doctor->>ShorthandBox: Clicks "⚡ Parse Shorthand (Gemini)"
    
    ShorthandBox->>Gemini: POST /api/doctor/prescribe/shorthand { shorthandNotes }
    Note over Gemini: Executes structured clinical NLP prompt<br/>Maps diagnosis to ICD-10 'J02.9 - Acute Pharyngitis'<br/>Normalizes 'tid' -> '1-1-1', 'od' -> '1-0-0', 'sos' -> 'SOS'
    
    Gemini-->>ShorthandBox: Returns Structured JSON Payload
    ShorthandBox->>RxGrid: Auto-populates Chief Complaints, ICD-10 Diagnosis, & 3 Medication Cards
    RxGrid-->>Doctor: Displays ready-to-review prescription with interactive chips
```

---

## 4. Workflow 4: Cryptographic PDF & Offline Verification QR Flow

This workflow illustrates the compilation of the digital prescription into an immutable, verifiable PDF document and an offline QR token for retail pharmacy dispensing.

```mermaid
sequenceDiagram
    autonumber
    actor Doctor
    participant UI as Prescription Actions UI
    participant ExportService as /api/doctor/prescriptions/export-pdf
    participant PDFEngine as @react-pdf Micro-Renderer
    participant QRService as QRCode Generator & Hash Engine
    participant Vault as ABDM EMR Health Vault
    participant Pharmacy as Pharmacy POS Radar

    Doctor->>UI: Clicks "Generate Signed PDF & QR"
    UI->>ExportService: POST /api/doctor/prescriptions/export-pdf { prescriptionData }
    
    ExportService->>QRService: Compute SHA-256 Hash of (Doctor MRN + Patient ABHA + Rx Items + Timestamp)
    QRService-->>ExportService: Returns Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    
    ExportService->>QRService: Generate 2D QR Code embedding (Rx UUID, MRN, ABHA, Hash Prefix)
    QRService-->>ExportService: Returns Data URL (Base64 QR Image)
    
    ExportService->>PDFEngine: Render PrescriptionPdfDocument (Doctor Header + Med Table + Verification QR)
    PDFEngine-->>ExportService: Returns Compiled A4 PDF Stream
    
    ExportService->>Vault: Push FHIR R4 Bundle to Patient EMR Vault
    ExportService->>Pharmacy: Broadcast active digital prescription to 5km radius pharmacies
    ExportService-->>UI: 200 OK { pdfUrl, verificationHash, qrDataUrl }
    UI->>Doctor: Display Instant Download Link & Success Confirmation Banner
```

---

## 5. State Machine: Clinical DDI Safety Sentinel

```
                 [DRAFTING MEDICINES]
                          │
                          │ (User adds/modifies drug)
                          ▼
            [GEMINI SENTINEL EVALUATING]
                          │
          ┌───────────────┴───────────────┐
          │ (No severe clashes)           │ (Severe conflict found)
          ▼                               ▼
 [STATUS: SAFE / LOW]            [STATUS: CRITICAL WARNING]
          │                               │
          │                               ├───(Doctor adjusts drug)───► [DRAFTING]
          │                               │
          │                               └───(Doctor logs Clinical Override)
          │                                           │
          └───────────────────────┬───────────────────┘
                                  │
                                  ▼
                    [READY FOR DIGITAL SIGNATURE]
```
