# Product Requirement Document (PRD): Doctor & Clinic Module (PulseMD)

**Document Version:** 1.0.0  
**Author:** AGENT 2 (PulseMD Lead Engineer)  
**Target Release:** MVP / Q3 2026  
**Standard Compliance:** HIPAA, DISHA, HL7 FHIR Release 4, ABDM (Ayushman Bharat Digital Mission - M1/M2/M3), National Medical Commission (NMC) Digital Prescription Guidelines  
**Status:** Approved for Engineering Execution  

---

## 1. Executive Summary & Module Vision

The **Doctor & Clinic Portal (`PulseMD`)** is the high-velocity clinical workstation within the Nexora Pulse healthcare operating system. Designed for outpatient departments (OPDs), polyclinics, and private practitioners, PulseMD collapses consultation overhead from the industry average of 4.5 minutes down to under 60 seconds per encounter.

PulseMD achieves this by unifying:
1. **Intelligent Appointment & OPD Queue Management:** Real-time synchronization of walk-ins, scheduled teleconsultations, and physical visits with 1-click status transitions.
2. **Longitudinal EMR Patient History Access:** Instant, zero-latency retrieval of ABHA-linked patient medical histories, chronic condition markers, past diagnostic panels, and high-visibility allergy flags.
3. **High-Speed Digital Prescription Builder:** An ultra-ergonomic prescription authoring engine equipped with a 10,000+ brand/generic medicine index, interactive rapid-tap dosage chips (`1-0-1`, `0-0-1`, `AC`, `PC`), and ICD-10 diagnostic tagging.
4. **PulseMD Clinical Co-Pilot (Powered by Google Gemini 2.5 Flash):** An embedded clinical safety sentinel that performs real-time Drug-Drug Interaction (DDI) checks, allergy cross-matching, and shorthand natural-language clinical note structuring.
5. **Cryptographic PDF & Offline Verification QR Engine:** Instant generation of digitally signed, tamper-evident prescription PDFs embedding FHIR R4 payloads and SHA-256 verification hashes scannable by any pharmacy without network connectivity.

```
+-------------------------------------------------------------------------------------------------+
|                                 PULSEMD CLINICAL OPERATING SYSTEM                               |
+--------------------------------+-------------------------------+--------------------------------+
|      1. Schedule & OPD Queue   |      2. Longitudinal EMR      |      3. Rapid Rx Builder       |
|  - Unified Calendar & Grid     |  - ABHA Linked Health Vault   |  - 10k+ Brand / Molecule Index |
|  - Accept / Decline / Resched. |  - High-Alert Allergy Banners |  - Tap-to-Add Regimen Chips    |
|  - 1-Click Consult Launcher    |  - Past Consultations & Labs  |  - ICD-10 Clinical Coding      |
+--------------------------------+-------------------------------+--------------------------------+
|      4. Gemini Clinical Copilot|      5. Safety & DDI Sentinel |      6. Cryptographic Export   |
|  - Shorthand Notes to JSON     |  - Multi-Drug Interaction Grid|  - @react-pdf Micro-Renderer   |
|  - Auto ICD-10 Inference       |  - Critical Allergy Interlock |  - ABDM Verification QR Code   |
|  - Smart Treatment Suggestions |  - Schedule H/X Compliance    |  - SHA-256 Digital Signature   |
+--------------------------------+-------------------------------+--------------------------------+
```

---

## 2. User Personas & Clinical Scenarios

### Persona 1: Dr. Vikram Sethi, MD (Internal Medicine, 14 Years Exp.)
* **Context:** Manages a busy urban OPD clinic seeing 45-60 patients daily.
* **Pain Points:** Typing extensive medical notes on traditional EHR software takes 6-8 minutes per patient; paper prescriptions lead to dispensing errors at retail pharmacies; lack of instant access to prior records causes repeated lab tests.
* **PulseMD Clinical Journey:**
  1. Opens PulseMD Schedule $\rightarrow$ Views OPD queue with 12 checked-in patients.
  2. Clicks *Start Consultation* on Token `#T-104` (Anil Verma) $\rightarrow$ Instantly sees red banner: `⚠️ Severe Penicillin Allergy` and active diabetes diagnosis (`E11.9`).
  3. Dictates/Types clinical shorthand: *"c/o dry cough x 4d, throat congestion, afebrile. adv azithro 500 tid x 3d, pan 40 od, paracetamol 650 sos"*.
  4. Gemini Co-Pilot parses shorthand in 400ms into structured prescription cards.
  5. System validates zero DDIs and confirms allergy safety.
  6. Dr. Sethi taps *Sign & Issue Prescription* $\rightarrow$ SHA-256 signed PDF with QR code is pushed directly to Anil’s ABHA vault and pharmacy network. Encounter duration: **48 seconds**.

### Persona 2: Dr. Ananya Roy, MS (Consultant Cardiologist)
* **Context:** Treats complex patients with polypharmacy regimens (ACE inhibitors, Statins, Beta-blockers).
* **Pain Points:** Risk of fatal Drug-Drug Interactions when introducing new medications; time-consuming manual cross-referencing of contraindications.
* **PulseMD Clinical Journey:**
  1. Reviews patient EMR timeline showing active Clopidogrel and Atorvastatin therapy.
  2. Drafts new prescription adding Omeprazole.
  3. PulseMD Co-Pilot triggers immediate **CRITICAL DDI Alert**: *"Omeprazole significantly reduces antiplatelet activation of Clopidogrel (CYP2C19 competitive inhibition). Recommendation: Substitute with Pantoprazole."*
  4. Dr. Roy taps *1-Click Substitute to Pantoprazole* $\rightarrow$ Alert clears instantly. Patient safety guaranteed.

---

## 3. Core Functional Requirements

### 3.1. Appointment Management & OPD Queue Director
* **Multi-View Schedule Grid:**
  * **Daily / Weekly Calendar View:** Visual time-slot grid displaying consultation slots (15-min intervals), provider availability, and buffer periods.
  * **List / Queue View:** Real-time status cards categorized into `PENDING`, `CONFIRMED`, `IN_CONSULT`, `COMPLETED`, `RESCHEDULED`, and `CANCELLED`.
* **Appointment Action Lifecycle:**
  * **1-Click Accept / Decline:** Fast acceptance with automated patient SMS/WhatsApp trigger; decline action prompts optional clinical reason (e.g., emergency ward summons).
  * **Dynamic Rescheduling:** Drag-and-drop or slot-picker interface allowing doctors to move appointments with automatic clash detection and patient notification.
  * **Consultation Start Trigger:** Clicking *"Start Consult"* transitions appointment to `IN_CONSULT`, broadcasts token summon to waiting area displays, and opens the Patient EMR and Rx Builder in split-screen layout.

### 3.2. EMR Longitudinal Patient History Access
* **Read-Only Unified Clinical Record:**
  * Automatically fetches longitudinal records linked to patient’s ABDM ABHA ID (`91-XXXX-XXXX-XXXX`).
  * **Allergy & Intolerance Alert Strip:** Persistent top-level high-visibility red banner listing documented drug allergies (e.g., Penicillin, Sulfa, NSAIDs) and food/environmental allergens.
  * **Chronic Disease Indicators:** Color-coded badges for active co-morbidities (Type 2 Diabetes, Stage II Hypertension, Chronic Kidney Disease, CAD).
  * **Vitals Trend Matrix:** Graphical sparklines and tabular views of historical BP, SpO2, Pulse, BMI, Blood Glucose (Fasting/PP), and Temperature.
  * **Past Encounters & Lab Reports:** Chronological feed of past clinical notes, previous medication courses, and uploaded diagnostic PDF reports with inline viewer.

### 3.3. High-Speed Digital Prescription Builder
* **Medicine Search & Autocomplete Engine:**
  * In-memory indexed search across 10,000+ standard medications (Indian Pharmacopoeia, CDSCO, FDA approved).
  * Fuzzy matching on both **Brand Names** (e.g., *Augmentin 625*, *Zifi 200*, *Pan 40*, *Dolo 650*) and **Generic Active Molecules** (e.g., *Amoxicillin + Clavulanic Acid*, *Cefixime*, *Pantoprazole*, *Paracetamol*).
  * Displays Schedule classification flags (`Schedule H`, `Schedule H1`, `Schedule X`) to enforce statutory compliance.
* **Rapid-Tap Dosage Chips:**
  * **Frequency Chips:** `1-0-0` (Morning), `1-0-1` (Morning & Night), `0-0-1` (Night), `1-1-1` (TID), `1-1-1-1` (QID), `SOS` (As needed), `STAT` (Immediately).
  * **Timing Chips:** `Before Food (AC)`, `After Food (PC)`, `With Food`, `Empty Stomach`, `At Bedtime (HS)`.
  * **Duration Chips:** `3 Days`, `5 Days`, `7 Days`, `10 Days`, `14 Days`, `1 Month`, `3 Months`.
  * **Dosage Form Selector:** Automatic default with 1-tap toggle: `Tablet`, `Capsule`, `Syrup`, `Injection`, `Inhaler`, `Ointment`, `Drops`.
* **Clinical Notes & Diagnostic Coding:**
  * **Chief Complaints:** Quick-tag library (Fever, Cough, Headache, Chest Discomfort, Dyspnea, Dyspepsia) with duration tags.
  * **Diagnosis (ICD-10):** Integrated ICD-10 search bar with code and display auto-fill (e.g., `J06.9` - *Acute Upper Respiratory Infection*, `E11.9` - *Type 2 Diabetes Mellitus*).
  * **Recommended Diagnostic Tests:** Tag input for labs (CBC, HbA1c, Lipid Profile, LFT, KFT, ECG, Chest X-Ray).
  * **Dietary & General Advice:** Pre-configured template snippets (*"Drink 3L warm water daily"*, *"Avoid high sodium diet"*, *"Salt water gargle twice daily"*).
  * **Follow-up Date:** Date picker with quick presets (+3 Days, +5 Days, +1 Week, +1 Month).

### 3.4. PulseMD Clinical Co-Pilot (Google Gemini 2.5 Flash)
* **Drug-Drug Interaction (DDI) & Allergy Sentinel:**
  * Performs atomic validation across all drafted medications and historical patient allergies/chronic conditions prior to finalizing.
  * Categorizes warnings into three strict clinical tiers:
    * `CRITICAL`: Life-threatening interaction or severe allergy conflict (e.g., Penicillin prescribed to Penicillin-allergic patient, Sildenafil + Nitrates). **Blocks submission until doctor acknowledges and overrides with logged clinical justification.**
    * `MODERATE`: Clinically significant interaction requiring dose adjustment or monitoring (e.g., ACE Inhibitor + Potassium-sparing diuretic).
    * `LOW`: Minor pharmacokinetic interaction (e.g., Antacids decreasing absorption of Fluoroquinolones).
* **Natural Language Shorthand Note Converter:**
  * Doctor enters unstructured clinical shorthand (e.g., *"fever x 3d, cough, adv paracetamol 650 1-0-1 3d, zifi 200 1-0-1 5d ac, cbc test"*).
  * Co-Pilot transforms text into structured JSON payload mapping diagnosis codes, line items, and instructions in under 450ms.

### 3.5. Standardized PDF & Offline Verification QR Engine
* **Tamper-Proof Document Compilation:**
  * Employs `@react-pdf/renderer` to generate clean, professional, standardized A4 PDF prescriptions compliant with NMC digital signature norms.
  * Header embeds Doctor details (Name, Degree, Specialization, Medical Registration Number/Council), Clinic branding, and Contact info.
  * Body renders clear tabular medication schedules, diagnoses, instructions, and follow-up directives.
* **Cryptographic Verification QR Code:**
  * Generates a 2D QR Code containing a compressed, digitally signed payload:
    * Prescription UUID, Doctor MRN, Patient ABHA ID, Timestamp, and SHA-256 cryptographic content hash.
  * Scannable by any retail pharmacy offline to verify authenticity and prevent forged prescription dispensing.

---

## 4. Non-Functional & Regulatory Standards

| Dimension | Specification & SLA |
| :--- | :--- |
| **Response Latency** | Autocomplete search $< 50\text{ms}$; DDI Validation $< 800\text{ms}$; PDF generation $< 1.2\text{s}$. |
| **Availability & Uptime** | $99.95\%$ SLA with offline-first client caching via Zustand & Service Workers. |
| **Regulatory & Security** | HIPAA Title II compliant, DISHA compliant, ABDM M1 (ABHA creation), M2 (Health record linking), M3 (HIP/HIU data exchange). |
| **Audit Logging** | Immutable append-only audit trail logging all prescription issuances, DDI overrides, and status transitions. |
| **Data Encryption** | AES-256 encryption at rest; TLS 1.3 encryption in transit. SHA-256 for document integrity verification. |

---

## 5. Success Metrics & KPIs
1. **Consultation Documentation Time:** $< 60$ seconds total time per prescription.
2. **Prescription Error Reduction:** $100\%$ detection of known severe DDIs and documented drug allergies.
3. **Adoption & Usability:** System Usability Scale (SUS) score $> 85$; $< 3$ clicks to complete standard prescription.
4. **Pharmacy Verification Rate:** $> 90\%$ scan rate of digital QR codes at participating retail pharmacies.
