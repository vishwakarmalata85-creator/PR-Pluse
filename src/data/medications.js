/**
 * NEXORA PULSE - CLINICAL FORMULARY & DDI RULES
 */

export const MEDICATIONS = [
  {
    id: "med-001",
    name: "Azithromycin 500 MG Oral Tablet",
    brand_name: "Azithral 500",
    active_ingredient: "Azithromycin",
    strength: "500 mg",
    dosage_form: "Tablet",
    default_pattern: "1-0-0",
    default_duration: 3,
    instructions: "Take 1 tablet once daily post meals for 3 days",
    schedule_class: "Schedule H",
    rxnorm_code: "197361",
    snomed_route: "260548002",
    avg_price_inr: 120.00,
    generic_equivalent: "Azithromycin 500mg Generic",
    generic_price_inr: 45.00
  },
  {
    id: "med-002",
    name: "Amoxicillin and Clavulanate Potassium 625 MG Tablet",
    brand_name: "Augmentin 625 Duo",
    active_ingredient: "Amoxicillin + Clavulanic Acid",
    strength: "500 mg + 125 mg",
    dosage_form: "Tablet",
    default_pattern: "1-0-1",
    default_duration: 5,
    instructions: "Take 1 tablet twice daily with food",
    schedule_class: "Schedule H",
    rxnorm_code: "313988",
    snomed_route: "260548002",
    allergy_group: "Penicillin",
    avg_price_inr: 210.00,
    generic_equivalent: "Amoxyclav 625 Generic",
    generic_price_inr: 85.00
  },
  {
    id: "med-003",
    name: "Cefixime 200 MG Oral Tablet",
    brand_name: "Zifi 200",
    active_ingredient: "Cefixime",
    strength: "200 mg",
    dosage_form: "Tablet",
    default_pattern: "1-0-1",
    default_duration: 5,
    instructions: "Take 1 tablet twice daily after meals",
    schedule_class: "Schedule H",
    rxnorm_code: "309095",
    snomed_route: "260548002",
    avg_price_inr: 145.00,
    generic_equivalent: "Cefixime 200mg Generic",
    generic_price_inr: 60.00
  },
  {
    id: "med-004",
    name: "Paracetamol 650 MG Oral Tablet",
    brand_name: "Dolo 650",
    active_ingredient: "Paracetamol (Acetaminophen)",
    strength: "650 mg",
    dosage_form: "Tablet",
    default_pattern: "1-0-1 (SOS)",
    default_duration: 3,
    instructions: "Take 1 tablet when fever > 100°F or severe body ache",
    schedule_class: "OTC",
    rxnorm_code: "209387",
    snomed_route: "260548002",
    avg_price_inr: 35.00,
    generic_equivalent: "Paracetamol 650mg Generic",
    generic_price_inr: 14.00
  },
  {
    id: "med-005",
    name: "Pantoprazole Gastro-Resistant 40 MG Tablet",
    brand_name: "Pan 40",
    active_ingredient: "Pantoprazole",
    strength: "40 mg",
    dosage_form: "Tablet",
    default_pattern: "1-0-0",
    default_duration: 7,
    instructions: "Take 1 tablet once daily early morning empty stomach",
    schedule_class: "Schedule H",
    rxnorm_code: "284635",
    snomed_route: "260548002",
    avg_price_inr: 95.00,
    generic_equivalent: "Pantoprazole 40mg Generic",
    generic_price_inr: 32.00
  }
];

export const ICD10_DIAGNOSES = [
  { code: "J02.9", description: "Acute pharyngitis, unspecified (Throat infection)" },
  { code: "J06.9", description: "Acute upper respiratory infection, unspecified" },
  { code: "J45.909", description: "Unspecified asthma, uncomplicated" },
  { code: "E11.9", description: "Type 2 diabetes mellitus without complications" },
  { code: "I10", description: "Essential (primary) hypertension" }
];

export const DDI_RULES = [
  {
    id: "ddi-01",
    drug1: "Azithromycin",
    drug2: "Hydroxychloroquine",
    severity: "CRITICAL",
    risk_level: "High Risk of QT Prolongation & Fatal Cardiac Arrhythmia",
    clinical_mechanism: "Co-administration synergistically delays myocardial repolarization, escalating risk of fatal Torsades de Pointes.",
    recommended_action: "Discontinue Azithromycin or replace with non-macrolide alternative (Cefixime 200mg).",
    alternative_drug_id: "med-003"
  },
  {
    id: "ddi-03",
    drug1: "Amoxicillin + Clavulanic Acid",
    drug2: "Penicillin",
    severity: "CRITICAL_ALLERGY",
    risk_level: "Known Penicillin Class Anaphylactic Allergy",
    clinical_mechanism: "Patient has documented Penicillin allergy. Beta-lactam core triggers severe IgE-mediated anaphylaxis.",
    recommended_action: "Substitute with Cefixime 200mg.",
    alternative_drug_id: "med-003"
  }
];
