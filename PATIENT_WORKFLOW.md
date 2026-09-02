# Workflow Specification: Patient Module (PulseCare)

**Document Version:** 1.0.0  
**Author:** AGENT 1 (PulseCare Lead Engineer)  
**Target Release:** MVP (Q3 2026)  
**Standard Compliance:** HIPAA, DISHA, FHIR Release 4, ABDM (M1/M2/M3)  

---

## 1. Workflow 1: Doctor Discovery & Real-Time Slot Booking

```mermaid
sequenceDiagram
    autonumber
    actor Patient
    participant UI as Patient Portal UI
    participant Store as Zustand State Store
    participant API as /api/patient/appointments
    participant DB as Postgres / Slot Matrix
    participant Notif as ABDM / SMS Notification

    Patient->>UI: Select Specialty ('Cardiology') & Radius ('< 5 km')
    UI->>API: GET /api/patient/doctors?specialty=Cardiology&lat=12.935&lng=77.624
    API->>DB: Query verified doctors with available slots
    DB-->>API: Returns Doctor Profiles & Slot Grid
    API-->>UI: Render Doctor Cards & 15-min Slot Matrix
    
    Patient->>UI: Selects Doctor (Dr. Vikram Sethi) & Slot (11:15 AM)
    UI->>Store: Set pending appointment state
    Patient->>UI: Clicks 'Confirm Booking'
    UI->>API: POST /api/patient/appointments/book { doctorId, slotId, abhaId }
    API->>DB: Atomic Slot Reservation (Lock slot -> status: 'BOOKED')
    DB-->>API: Reservation Confirmed (Token: 'T-104')
    API->>Notif: Dispatch SMS Token & Calendar .ics invite
    API-->>UI: 200 OK { appointmentId, token: 'T-104', clinicAddress }
    UI->>Patient: Display Confirmation Screen & Live OPD Queue Link
```

### State Machine: Appointment Lifecycle
```
[AVAILABLE] 
   │ (Patient initiates booking)
   ▼
[LOCKED] ───(5 min timeout)───► [AVAILABLE]
   │ (Payment / Confirmation)
   ▼
[BOOKED] 
   │ (Doctor summons token in OPD)
   ▼
[IN_PROGRESS] 
   │ (Consultation concluded)
   ▼
[COMPLETED] ───► (Auto-generates EMR Vault Record)
```

---

## 2. Workflow 2: Smart Prescription Scanner & Local Pharmacy Order Flow

This workflow illustrates the core AI-powered loop: capturing a physical paper prescription, converting cursive handwriting to structured JSON via **Google Gemini 3.1 Flash**, matching stock within 5 km, and placing a direct order.

```mermaid
sequenceDiagram
    autonumber
    actor Patient
    participant Scanner as Scanner UI Component
    participant Gemini as /api/patient/prescription/scan (Gemini 3.1 Flash)
    participant Review as Interactive Meds Table
    participant GeoRadar as /api/patient/pharmacies/stock
    participant Checkout as /api/patient/orders/checkout
    participant Pharmacy as Pharmacy POS Terminal

    Patient->>Scanner: Captures / Uploads Paper Prescription Photo
    Scanner->>Scanner: Converts to Base64 (max 15MB, JPEG/PNG)
    Scanner->>Gemini: POST /api/patient/prescription/scan { imageBase64, mimeType }
    
    Note over Gemini: Gemini 3.1 Flash runs Multimodal Vision OCR<br/>Applies structured JSON Schema (name, dose, frequency, duration)
    
    Gemini-->>Scanner: Returns Structured Prescription JSON
    Scanner->>Review: Populate Interactive Editable Prescription Table
    
    Patient->>Review: Reviews extracted items (e.g. Cefixime 200mg 1-0-1, Pan 40 1-0-0)
    Patient->>Review: (Optional) Edits item or confirms line items
    Patient->>Review: Clicks 'Find Local Pharmacy Stock'
    
    Review->>GeoRadar: POST /api/patient/pharmacies/stock { items, radiusKm: 5.0 }
    Note over GeoRadar: Computes Haversine Distance & Batch Inventory Matches<br/>Evaluates Full Match (100%) vs Partial Match
    GeoRadar-->>Review: Returns Ranked Pharmacy Matches & Generic Savings
    
    Patient->>Review: Toggles 'Generic Amoxyclav' (Saves ₹125)
    Patient->>Review: Selects 'MedPlus 24/7 (0.6 km away - 100% Match)'
    Patient->>Checkout: Chooses 'Store Pickup' & Clicks 'Place Order'
    
    Checkout->>Pharmacy: Dispatch Order Payload with Encrypted Rx Attachment
    Pharmacy-->>Checkout: Order Confirmed (Pickup Token: 'PK-8812')
    Checkout-->>Patient: Display Pickup QR Code & Ready Status (< 15 mins)
```

---

## 3. Workflow 3: Dual Hub - Doctor Digital FHIR Prescription Lifecycle

When a consultation happens directly on the Nexora platform, the doctor issues a digitally signed FHIR R4 prescription that instantly appears in the patient's portal.

```mermaid
sequenceDiagram
    autonumber
    actor Doctor
    participant DocEMR as Doctor Quick-Rx Engine
    participant FHIR as FHIR R4 Bundle Service
    participant PatientApp as Patient Prescription Hub
    actor Patient

    Doctor->>DocEMR: Prescribes Cefixime 200mg + Pan 40 with ICD-10 Codes
    Doctor->>DocEMR: Clicks 'Sign & Dispatch'
    DocEMR->>FHIR: Generate SHA-256 Signature Hash & FHIR R4 Bundle
    FHIR->>PatientApp: Push Real-Time WebSocket Notification
    PatientApp-->>Patient: Push Notification: "New Digital Prescription from Dr. Vikram"
    
    Patient->>PatientApp: Opens 'Dual Prescription Hub' -> 'Doctor Digital Prescriptions'
    PatientApp->>Patient: Displays Verified Digital Rx with SHA-256 Badge & Dosage Cards
    Patient->>PatientApp: 1-Click: 'Locate Medicines in 5 km Radar'
```

---

## 4. Workflow 4: EMR Longitudinal Health Vault & Offline QR Dispensing

```mermaid
sequenceDiagram
    autonumber
    actor Patient
    participant Vault as EMR Health Vault UI
    participant QR as QR Generator Engine
    actor Chemist as Local Retail Chemist
    participant ChemistPOS as Chemist POS Scanner

    Patient->>Vault: Navigates to 'EMR Health Vault'
    Vault->>Vault: Fetches ABDM Timeline (Appointments, Lab Reports, Prescriptions)
    Patient->>Vault: Selects 'Active Prescription #RX-2026-8910'
    Patient->>Vault: Clicks 'Generate Pharmacy Counter QR'
    
    Vault->>QR: Generate Encrypted HMAC-SHA256 QR containing ABHA ID & Active Rx Tokens
    QR-->>Vault: Render Crisp High-Contrast QR Code on Screen
    
    Patient->>Chemist: Presents QR Code on Smartphone screen at Pharmacy counter
    Chemist->>ChemistPOS: Scans Patient QR Code
    ChemistPOS->>ChemistPOS: Decrypts Rx Token & Auto-populates POS Dispensing Table
    ChemistPOS->>Chemist: Instant 0-second counter fulfillment without manual typing!
```

---

## 5. Workflow 5: Persistent PulseCare Floating AI Chatbot

The **PulseCare AI Chatbot** remains anchored in the bottom-right corner of every screen in the patient portal. It dynamically injects the patient's active prescription context while strictly enforcing regulatory guardrails.

```mermaid
sequenceDiagram
    autonumber
    actor Patient
    participant Widget as Floating AI Chatbot Widget
    participant Safety as Guardrails & Triage Engine
    participant LLM as Context-Aware AI Engine
    participant Speech as Web Speech API (TTS)

    Patient->>Widget: Clicks Floating PulseCare Icon
    Widget->>Widget: Expands Smooth Glassmorphic Chat Drawer
    Widget->>Patient: "Hello Anil! How can I help with your current medicines?"
    
    alt Scenario A: Clinical Clarification Query
        Patient->>Widget: "What does 1-0-1 mean for Cefixime?"
        Widget->>Safety: Evaluate Safety Guardrails
        Safety-->>Widget: Safe (Clinical Educational Query)
        Widget->>LLM: Prompt with Active Rx Context (Patient prescribed Cefixime 200mg)
        LLM-->>Widget: "1-0-1 means take 1 tablet in the morning after food and 1 tablet at night after dinner for 5 days."
        Widget->>Patient: Renders formatted card + 'Listen Audio' button
        Patient->>Widget: Clicks 'Listen Audio'
        Widget->>Speech: window.speechSynthesis.speak(text)
    else Scenario B: Schedule H / X Controlled Substance Guardrail
        Patient->>Widget: "Can you prescribe me Sleeping Pills (Alprazolam)?"
        Widget->>Safety: Detects Controlled Substance Keyword ('Alprazolam')
        Safety-->>Widget: TRIGGER GUARDRAIL: SCHEDULE_HX_BLOCKED
        Widget->>Patient: "🛡️ Under Drugs & Cosmetics Rules, Schedule H/X controlled sedatives require an in-person consultation with a licensed doctor. Would you like to book an appointment?"
    else Scenario C: Acute Emergency Triage Lock
        Patient->>Widget: "I have sudden severe chest pain and breathlessness!"
        Widget->>Safety: Detects Red-Flag Emergency Keywords ('chest pain', 'breathlessness')
        Safety-->>Widget: TRIGGER GUARDRAIL: EMERGENCY_108_SOS
        Widget->>Patient: Launches Emergency Modal + Direct Dial '📞 Call National Ambulance Hotline (108 / 112)'
    end
```

---

## 6. End-to-End Error Handling & Offline Fallback Strategy

| Failure Scenario | Recovery & Fallback Mechanism |
| :--- | :--- |
| **Gemini Vision OCR Network Timeout ($> 5\text{s}$)** | Client-side exponential retry (up to 2 retries). If still unreachable, smoothly falls back to a manual entry form with pre-populated common formulary autocomplete. |
| **Ambiguous or Illegible Cursive Handwriting** | Extracted items with $< 70\%$ confidence are tagged with an Amber/Red badge prompting the user: *"Please verify dosage with your pharmacist before ordering."* |
| **Offline Connectivity in Pharmacy** | Progressive Web App (PWA) cache serves the patient's QR code and cached PDF prescription from IndexedDB even with 0 internet connection. |
| **Zero Inventory in 5 km Radius** | System automatically expands the search radius in 2 km increments up to 15 km, or provides a 1-click option to split the order across two nearby stores. |
