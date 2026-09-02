/**
 * NEXORA PULSE - PATIENTS CLINICAL DATASET
 * Conforms to ABDM (Ayushman Bharat Digital Mission) ABHA standards
 */

export const PATIENTS = [
  {
    id: "pat-2026-001",
    abha_id: "91-4829-1029-4412",
    full_name: "Anil Kumar Verma",
    date_of_birth: "1982-04-14",
    age: 44,
    gender: "Male",
    blood_group: "B+",
    contact_phone: "+91 98765 43210",
    emergency_contact: "+91 98765 43211 (Wife)",
    allergies: ["Penicillin", "Sulfa drugs"],
    chronic_conditions: ["Type 2 Diabetes Mellitus", "Primary Hypertension"],
    current_medications: ["Metformin 500mg (1-0-1)", "Telmisartan 40mg (1-0-0)", "Hydroxychloroquine 200mg (0-0-1)"],
    recent_vitals: {
      bp: "138/86 mmHg",
      pulse: "76 bpm",
      spO2: "98%",
      temp: "98.6°F",
      weight: "74 kg",
      bmi: "25.2"
    },
    token: "T-101",
    queue_status: "In-Consult",
    visit_reason: "Acute respiratory tract infection, dry cough & throat pain"
  },
  {
    id: "pat-2026-002",
    abha_id: "91-7291-3049-8812",
    full_name: "Priya Sharma",
    date_of_birth: "1994-08-22",
    age: 32,
    gender: "Female",
    blood_group: "O+",
    contact_phone: "+91 98234 56789",
    emergency_contact: "+91 98234 56780 (Father)",
    allergies: ["NSAIDs (Aspirin, Ibuprofen)"],
    chronic_conditions: ["Bronchial Asthma"],
    current_medications: ["Montelukast 10mg (0-0-1)", "Salbutamol Inhaler (SOS)"],
    recent_vitals: {
      bp: "118/74 mmHg",
      pulse: "82 bpm",
      spO2: "97%",
      temp: "99.1°F",
      weight: "58 kg",
      bmi: "22.1"
    },
    token: "T-102",
    queue_status: "Waiting",
    visit_reason: "Allergic rhinitis and chest wheezing exacerbation"
  },
  {
    id: "pat-2026-003",
    abha_id: "91-1182-9934-2105",
    full_name: "Rajesh Patel",
    date_of_birth: "1968-11-03",
    age: 58,
    gender: "Male",
    blood_group: "A+",
    contact_phone: "+91 97123 45678",
    emergency_contact: "+91 97123 45679 (Son)",
    allergies: [],
    chronic_conditions: ["Atrial Fibrillation", "Dyslipidemia"],
    current_medications: ["Warfarin 5mg (0-0-1)", "Atorvastatin 20mg (0-0-1)"],
    recent_vitals: {
      bp: "130/82 mmHg",
      pulse: "88 bpm (irregular)",
      spO2: "96%",
      temp: "98.4°F",
      weight: "82 kg",
      bmi: "27.8"
    },
    token: "T-103",
    queue_status: "Waiting",
    visit_reason: "Routine INR checkup and joint discomfort"
  }
];
