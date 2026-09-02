# Product Requirement Document (PRD): Patient Module (PulseCare)

**Document Version:** 1.0.0  
**Author:** AGENT 1 (PulseCare Lead Engineer)  
**Target Release:** MVP (Q3 2026)  
**Standard Compliance:** HIPAA, DISHA, FHIR Release 4, ABDM (Ayushman Bharat Digital Mission - M1/M2/M3)  
**Status:** Approved for Engineering Execution  

---

## 1. Executive Summary & Module Vision

The **Patient Portal (`PulseCare`)** is the patient-facing operating tier of the Nexora Pulse healthcare platform. It acts as an intelligent, single-pane healthcare companion empowering individuals and caregivers to navigate the entire clinical outpatient journey:
1. **Discovering and booking verified practitioners** with real-time slot synchronization.
2. **Managing digital and physical prescriptions** seamlessly via a **Dual Prescription Hub**, powered by **Google Gemini Vision (`gemini-3.1-flash`)** to digitize messy handwritten slips into structured medication schedules.
3. **Discovering local pharmacy inventory within a 5 km radius**, computing exact stock availability scores (100% Full Match vs. Partial Match), and comparing brand vs. generic bioequivalent savings.
4. **Executing 1-click medicine orders** for instant in-store counter pickup or home delivery with live GPS telemetry.
5. **Managing an ABDM-compliant EMR Health Vault** storing longitudinal consultation histories, diagnostic reports, and QR-verifiable health records.
6. **Interacting with a persistent, context-aware AI Floating Companion (`PulseCare AI`)** that answers dosage queries, translates clinical Latin abbreviations (`1-0-1`, `SOS`, `HS`, `AC`, `PC`), and enforces strict safety guardrails against controlled Schedule H/X substances and acute medical emergencies.

```
+-------------------------------------------------------------------------------------------------+
|                                 PULSECARE PATIENT OPERATING SYSTEM                              |
+--------------------------------+-------------------------------+--------------------------------+
|      1. Clinical Access        |      2. Prescription Hub      |      3. Fulfillment & Care     |
|  - Doctor Discovery & Filters  |  - In-App Doctor Digital Rx   |  - 5 km Live Stock Radar       |
|  - Real-Time Slot Booking      |  - Gemini 3.1 Flash OCR Scan  |  - Generic Match & Savings     |
|  - OPD Queue Token Monitor     |  - Structured Meds Review     |  - Direct Checkout & Tracking  |
+--------------------------------+-------------------------------+--------------------------------+
|      4. EMR Health Vault       |      5. Safety & Triage       |      6. Floating Assistant     |
|  - ABDM ABHA Longitudinal Log  |  - Allergy & DDI Validation   |  - Persistent Floating Widget  |
|  - QR Code Offline Dispensing  |  - Emergency 108 Auto-Triage  |  - Multilingual Vernacular TTS |
|  - Standardized FHIR R4 Bundle |  - Schedule H/X Safety Locks  |  - Context-Aware EMR Answers   |
+--------------------------------+-------------------------------+--------------------------------+
```

---

## 2. User Personas & Clinical Journey Maps

### Persona 1: Anil Verma (44, Managing Chronic Conditions)
- **Profile:** Diagnosed with Type 2 Diabetes and Hypertension; takes daily Metformin and Telmisartan.
- **Pain Points:** Runs out of routine medicines unexpectedly; spends hours visiting multiple local medical stores to find specific brand dosages; struggles to recall historical lab values across different clinic visits.
- **PulseCare Journey:**
  1. Opens PulseCare $\rightarrow$ Receives push reminder for monthly prescription renewal.
  2. Books follow-up with Dr. Vikram Sethi using real-time calendar picker.
  3. Receives digitally signed FHIR R4 prescription directly in his EMR Vault.
  4. Automatically views nearby pharmacies within 1.2 km stocking his entire 30-day regimen with a 100% Match score.
  5. Selects Generic Metformin substitution, saving ₹340, and places 1-click store pickup order.

### Persona 2: Priya Sharma (32, Acute Illness & Paper Slip Digitization)
- **Profile:** Working professional suffering from acute throat infection; visited a local neighborhood doctor who provided a handwritten paper prescription.
- **Pain Points:** Cannot decipher doctor's cursive handwriting; unsure when to take antibiotics vs. antacids; worries about adverse drug reactions with existing asthma inhalers.
- **PulseCare Journey:**
  1. Opens Smart Prescription Scanner $\rightarrow$ Takes a photo of the handwritten prescription.
  2. Gemini 3.1 Flash parses the cursive slip within 850ms into structured medication cards: *Cefixime 200mg (1-0-1)*, *Pantoprazole 40mg (1-0-0)*, *Paracetamol 650mg (SOS)*.
  3. Taps the floating PulseCare AI widget: *"What does 1-0-1 mean for Cefixime?"* $\rightarrow$ PulseCare explains in Hindi/English: *"Take 1 tablet in the morning after breakfast and 1 tablet at night after dinner for 5 days."*
  4. Checks 5 km pharmacy radar $\rightarrow$ Reserves order at *MedPlus Koramangala (0.6 km away)*.

---

## 3. Core Functional Requirements

### 3.1. Doctor Discovery & Real-Time Appointment Booking
- **Multi-Parametric Filter Engine:** Filter practitioners by:
  - **Specialty:** General Medicine, Cardiology, Pediatrics, Dermatology, Orthopedics, ENT, Pulmonology, Gynecology.
  - **Location / Distance:** Pincode search or GPS auto-radius (< 2 km, < 5 km, < 10 km).
  - **Consultation Mode:** In-Clinic OPD vs. Teleconsultation Video.
  - **Consultation Fee & Experience:** Budget slider (₹200 - ₹2000), Years of Experience ($5+$, $10+$, $15+$ years).
  - **Verification Badge:** Green checkmark denoting validated State Medical Council / National Medical Commission (NMC) registration.
- **Dynamic Slot Matrix:**
  - Real-time availability grid reflecting 15-minute appointment slots synchronized with Doctor OPD schedule.
  - Instant conflict detection: Locks slot for 5 minutes during checkout to avoid double bookings.
- **Booking Lifecycle & Notifications:**
  - Instant confirmation screen with Token Number (e.g. `T-104`), clinic address, Google Maps routing link, and calendar invite (`.ics`).
  - Integrated Rescheduling (up to 2 hours before consult) and 1-Click Cancellation.

### 3.2. Dual Prescription Hub
- **Tab 1: Doctor-Issued Digital Prescriptions:**
  - Automatically receives FHIR Release 4 compliant digital prescriptions authored during clinic consultations.
  - Displays doctor details, Medical Registration Number (MRN), clinic logo, cryptographic SHA-256 signature verification badge, and diagnosis codes (ICD-10).
  - Medication cards display generic molecule, dosage pattern (`1-0-1`), duration, special dietary instructions (*"Post meals with warm water"*), and schedule class.
- **Tab 2: Smart AI Prescription Scanner (Gemini Vision 3.1 Flash):**
  - **Camera / File Upload Interface:** Supports JPG, PNG, WebP, and PDF uploads up to 15MB.
  - **Deep OCR Ingestion:** Calls Google Gemini 3.1 Flash Vision API (`gemini-3.1-flash`) with structured JSON schema enforcement.
  - **Interactive Extraction Review:** Renders parsed medicines into an interactive, editable table:
    - Medicine Name (Brand & Generic Active Ingredient)
    - Strength (e.g., `500 mg`, `625 mg`)
    - Dosage Form (`Tablet`, `Syrup`, `Capsule`, `Inhaler`, `Ointment`)
    - Frequency (`1-0-1`, `0-0-1`, `1-0-0`, `1-1-1`, `SOS`)
    - Duration (`3 days`, `5 days`, `10 days`)
    - Clinical Instructions (`Before food`, `After food`, `At bedtime`)
  - **User Modification & Validation:** Patient can edit extracted quantities or dosage before sending to pharmacy stock finder.

### 3.3. Local Pharmacy Stock Discovery & Match Engine
- **Geo-Spatial Radius Query:** Queries registered ABDM retail pharmacies within user's configured search radius (default: 5.0 km).
- **Match Status Scoring:**
  - **Full Match (100%):** Pharmacy has 100% of prescribed medication line items in current active batch inventory. Highlighted in emerald green with a *"Ready for Instant Pickup"* badge.
  - **Partial Match ($< 100\%$):** Pharmacy has a subset of items (e.g., 2 of 3 available). Lists specific missing items clearly.
- **Generic Bioequivalent Substitution Engine:**
  - Identifies branded drugs with identical active API molecules approved by the Department of Pharmaceuticals / Jan Aushadhi.
  - Calculates real-time price comparison: e.g., *Brand Augmentin 625 (₹210)* vs. *Generic Amoxyclav 625 (₹85)* $\rightarrow$ Displays *"Save ₹125 (60%)"*.
  - Patient can toggle generic substitutions per item with 1-click.

### 3.4. Medicine Order Checkout & Real-Time Tracking
- **Fulfillment Modes:**
  - **Counter Pickup:** Generates order pickup token and estimated preparation time (< 15 mins).
  - **Home Delivery:** Fast hyper-local delivery within 60 minutes with live delivery agent tracking.
- **Payment Gateway Integration:** UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, Net Banking, and Cash on Delivery (COD).
- **Prescription Attachment & Regulatory Compliance:**
  - Automatically attaches signed digital FHIR prescription or digitized paper slip to the pharmacy order.
  - Schedule H / H1 / X verification: Restricts dispensing unless verified prescription is attached.
- **Order State Machine:**
  `ORDER_PLACED` $\rightarrow$ `PHARMACY_CONFIRMED` $\rightarrow$ `ITEMS_PACKED` $\rightarrow$ `OUT_FOR_DELIVERY` / `READY_FOR_PICKUP` $\rightarrow$ `FULFILLED`.

### 3.5. Personal EMR Health Vault
- **Longitudinal Medical Timeline:** Chronological stream of:
  - Doctor Consultations & OPD Summaries
  - Prescription Records & Ingested Medication Bundles
  - Diagnostic Lab Reports & Scans
  - Pharmacy Invoices & Dispensing Receipts
- **ABDM ABHA Health ID Linking:** Connects to 14-digit Ayushman Bharat Health Account (`91-XXXX-XXXX-XXXX`) for cross-hospital interoperability.
- **Offline Chemist Dispensing QR Code:** Generates standardized encrypted QR containing patient ABHA ID and active medication tokens for instant scanning by any local retail pharmacy POS.
- **Standardized Export:** Download complete medical history as a tamper-proof PDF or FHIR R4 JSON document.

### 3.6. Persistent AI Floating Chatbot (`PulseCare AI`)
- **UI Architecture:** Floating circular avatar in bottom-right corner with pulse status dot; expands to a conversational drawer with full speech and audio playback support.
- **Core Knowledge & Capabilities:**
  - **Prescription Clarification:** Interprets clinical instructions (e.g., *"What does 1-0-1 mean?"*, *"Should I take Pan 40 with food?"*).
  - **EMR Memory Context:** Answers personalized questions using the patient's active records (e.g., *"What medicines did Dr. Vikram prescribe last Tuesday?"*).
  - **Multilingual Vernacular Support:** Converses naturally in 6+ languages (English, Hindi, Marathi, Tamil, Bengali, Spanish) with native text and audio speech synthesis.
- **Safety Guardrails & Triage Locks:**
  - **Schedule H / X Lock:** Blocks prescribing or sourcing instructions for controlled narcotics, sedatives (Alprazolam, Clonazepam), and abortifacients, routing patient to a licensed physician.
  - **Emergency 108 Hotline Trigger:** Instantly detects red-flag keywords (*chest pain*, *shortness of breath*, *stroke symptoms*, *severe trauma*) and triggers the **National Emergency Ambulance (108 / 112)** instant dialer.

---

## 4. Non-Functional & Regulatory Requirements

| Category | Requirement Specification |
| :--- | :--- |
| **Performance** | Largest Contentful Paint (LCP) $\le 1.2\text{s}$, First Input Delay (FID) $\le 50\text{ms}$, Cumulative Layout Shift (CLS) $\le 0.05$. Gemini OCR response time $\le 1.2\text{s}$. |
| **Accessibility** | Strict WCAG 2.1 AAA compliance: minimum color contrast ratio 7:1 for text, full keyboard navigation, screen-reader aria live regions. |
| **Security & Privacy** | AES-256 encryption at rest for all health records; TLS 1.3 in transit. Zero-PII retention policies for AI vision processing. |
| **Standards Compliance** | HL7 FHIR Release 4 for clinical data interchange; ABDM M1, M2, M3 milestones for Ayushman Bharat compliance. |
| **Device Support** | Fully responsive from 320px mobile viewports to 4K desktop displays with offline PWA caching capabilities. |
