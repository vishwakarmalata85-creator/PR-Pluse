/**
 * NEXORA PULSE - OCR PRESCRIPTION SAMPLES
 */

export const OCR_SAMPLES = [
  {
    id: "ocr-sample-1",
    title: "Prescription #8910 - Outpatient RTI Consult",
    doctor_name: "Dr. Vikram Sethi, MD (Internal Medicine)",
    doctor_reg: "KMC-48921-2012",
    clinic_name: "Pulse Care Clinic & Diagnostic Center",
    date: "2026-09-02",
    patient_name: "Anil Kumar Verma",
    patient_age: 44,
    patient_gender: "Male",
    diagnosis: "Acute Pharyngitis & Upper RTI (J02.9)",
    bounding_boxes: [
      { id: "b1", label: "Doctor Header", top: 5, left: 10, width: 80, height: 12, confidence: 98, status: "green" },
      { id: "b2", label: "Patient Demographics", top: 20, left: 10, width: 80, height: 10, confidence: 95, status: "green" },
      { id: "b3", label: "Rx Item 1: Cefixime 200mg", top: 38, left: 12, width: 75, height: 12, confidence: 94, status: "green" },
      { id: "b4", label: "Rx Item 2: Pantoprazole 40mg", top: 54, left: 12, width: 75, height: 12, confidence: 92, status: "green" },
      { id: "b5", label: "Rx Item 3: Paracetamol 650mg", top: 70, left: 12, width: 75, height: 12, confidence: 96, status: "green" }
    ],
    extracted_items: [
      {
        id: "item-1",
        drug_name: "Cefixime 200 MG Oral Tablet",
        brand_name: "Zifi 200",
        active_ingredient: "Cefixime",
        strength: "200 mg",
        dosage_form: "Tablet",
        dosage_pattern: "1-0-1",
        duration_days: 5,
        instructions: "Take 1 tablet twice daily post meals for 5 days",
        confidence: 94,
        confidence_level: "high",
        generic_alternative: "Cefixime 200mg Generic (Jan Aushadhi)",
        brand_price: 145.00,
        generic_price: 60.00,
        savings_pct: 58
      },
      {
        id: "item-2",
        drug_name: "Pantoprazole Gastro-Resistant 40 MG Tablet",
        brand_name: "Pan 40",
        active_ingredient: "Pantoprazole",
        strength: "40 mg",
        dosage_form: "Tablet",
        dosage_pattern: "1-0-0",
        duration_days: 7,
        instructions: "1 tab daily empty stomach in morning",
        confidence: 92,
        confidence_level: "high",
        generic_alternative: "Pantoprazole 40mg Generic",
        brand_price: 95.00,
        generic_price: 32.00,
        savings_pct: 66
      },
      {
        id: "item-3",
        drug_name: "Paracetamol 650 MG Oral Tablet",
        brand_name: "Dolo 650",
        active_ingredient: "Paracetamol",
        strength: "650 mg",
        dosage_form: "Tablet",
        dosage_pattern: "1-0-1 (SOS)",
        duration_days: 3,
        instructions: "Take for fever > 100°F or severe body aches",
        confidence: 96,
        confidence_level: "high",
        generic_alternative: "Paracetamol 650mg Generic",
        brand_price: 35.00,
        generic_price: 14.00,
        savings_pct: 60
      }
    ]
  },
  {
    id: "ocr-sample-2",
    title: "Prescription #8911 - Ambiguous Cursive Case",
    doctor_name: "Dr. Ananya Roy, MS",
    doctor_reg: "MMC-99120-2024",
    clinic_name: "City Specialty Hospital",
    date: "2026-09-02",
    patient_name: "Priya Sharma",
    patient_age: 32,
    patient_gender: "Female",
    diagnosis: "Allergic Bronchitis (J45.909)",
    bounding_boxes: [
      { id: "b1", label: "Doctor Header", top: 5, left: 10, width: 80, height: 12, confidence: 97, status: "green" },
      { id: "b2", label: "Rx Item 1: Montair-LC", top: 38, left: 12, width: 75, height: 12, confidence: 84, status: "amber" },
      { id: "b3", label: "Rx Item 2: Cursive Antibiotic", top: 54, left: 12, width: 75, height: 14, confidence: 64, status: "red" }
    ],
    extracted_items: [
      {
        id: "item-1",
        drug_name: "Montelukast 10 MG & Levocetirizine 5 MG Tablet",
        brand_name: "Montair-LC",
        active_ingredient: "Montelukast + Levocetirizine",
        strength: "10 mg + 5 mg",
        dosage_form: "Tablet",
        dosage_pattern: "0-0-1",
        duration_days: 10,
        instructions: "Take 1 tablet at bedtime",
        confidence: 84,
        confidence_level: "med",
        generic_alternative: "Montelukast-Levocetirizine Generic",
        brand_price: 180.00,
        generic_price: 65.00,
        savings_pct: 64
      },
      {
        id: "item-2",
        drug_name: "Amoxicillin-Clavulanate [Red - Verify Penicillin Allergy]",
        brand_name: "Augmentin 625",
        active_ingredient: "Amoxicillin + Clavulanic Acid",
        strength: "625 mg",
        dosage_form: "Tablet",
        dosage_pattern: "1-0-1",
        duration_days: 5,
        instructions: "Twice daily after food",
        confidence: 64,
        confidence_level: "low",
        generic_alternative: "Amoxyclav 625 Generic",
        brand_price: 210.00,
        generic_price: 85.00,
        savings_pct: 60
      }
    ]
  }
];
