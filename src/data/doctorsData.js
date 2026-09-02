/**
 * NEXORA PULSE - VERIFIED PRACTITIONERS DIRECTORY & REAL-TIME SLOT MATRIX
 * Compliant with National Medical Commission (NMC) & State Council Validation
 */

export const DOCTORS_DIRECTORY = [
  {
    id: "doc-101",
    name: "Dr. Vikram Sethi, MD",
    mrn: "KMC-48921-2012",
    state_council: "Karnataka Medical Council (KMC)",
    specialty: "Internal Medicine",
    experience_years: 14,
    clinic_affiliation: "Pulse Care Clinic & Diagnostic Center",
    clinic_address: "80 Feet Rd, 4th Block, Koramangala, Bengaluru",
    consultation_fee: 600,
    rating: 4.9,
    total_consultations: 3420,
    distance_km: 0.6,
    avatar_initials: "VS",
    bio: "Senior Consultant Physician specializing in chronic metabolic disorders, acute respiratory infections, and preventative cardiology.",
    available_slots: [
      { id: "slot-101-1", time: "10:30 AM", status: "BOOKED", patient_token: "T-101" },
      { id: "slot-101-2", time: "10:45 AM", status: "BOOKED", patient_token: "T-102" },
      { id: "slot-101-3", time: "11:00 AM", status: "AVAILABLE" },
      { id: "slot-101-4", time: "11:15 AM", status: "AVAILABLE" },
      { id: "slot-101-5", time: "11:30 AM", status: "AVAILABLE" },
      { id: "slot-101-6", time: "04:30 PM", status: "AVAILABLE" },
      { id: "slot-101-7", time: "05:00 PM", status: "AVAILABLE" }
    ]
  },
  {
    id: "doc-102",
    name: "Dr. Ananya Roy, MS",
    mrn: "MMC-99120-2024",
    state_council: "Maharashtra Medical Council (MMC)",
    specialty: "Cardiology",
    experience_years: 9,
    clinic_affiliation: "City Heart Care & Vascular Institute",
    clinic_address: "100 Feet Rd, Indiranagar, Bengaluru",
    consultation_fee: 900,
    rating: 4.8,
    total_consultations: 1850,
    distance_km: 1.4,
    avatar_initials: "AR",
    bio: "Interventional Cardiologist with expertise in hypertension management, arrhythmia diagnosis, and echocardiography.",
    available_slots: [
      { id: "slot-102-1", time: "11:30 AM", status: "AVAILABLE" },
      { id: "slot-102-2", time: "12:00 PM", status: "AVAILABLE" },
      { id: "slot-102-3", time: "02:30 PM", status: "AVAILABLE" },
      { id: "slot-102-4", time: "03:00 PM", status: "AVAILABLE" }
    ]
  },
  {
    id: "doc-103",
    name: "Dr. Rajeshwar Rao, MD (Pediatrics)",
    mrn: "DMC-33109-2015",
    state_council: "Delhi Medical Council (DMC)",
    specialty: "Pediatrics",
    experience_years: 12,
    clinic_affiliation: "Little Stars Children's Clinic",
    clinic_address: "5th Block, Koramangala, Bengaluru",
    consultation_fee: 500,
    rating: 4.9,
    total_consultations: 4100,
    distance_km: 0.9,
    avatar_initials: "RR",
    bio: "Specialist in pediatric infectious diseases, child immunization protocols, and developmental assessments.",
    available_slots: [
      { id: "slot-103-1", time: "09:30 AM", status: "AVAILABLE" },
      { id: "slot-103-2", time: "10:00 AM", status: "AVAILABLE" },
      { id: "slot-103-3", time: "10:30 AM", status: "AVAILABLE" },
      { id: "slot-103-4", time: "04:00 PM", status: "AVAILABLE" }
    ]
  },
  {
    id: "doc-104",
    name: "Dr. Meera Nambiar, DNB (Dermatology)",
    mrn: "TNMC-77182-2018",
    state_council: "Tamil Nadu Medical Council (TNMC)",
    specialty: "Dermatology",
    experience_years: 8,
    clinic_affiliation: "Aura Skin & Allergy Clinic",
    clinic_address: "12th Main, HAL 2nd Stage, Indiranagar",
    consultation_fee: 750,
    rating: 4.7,
    total_consultations: 2200,
    distance_km: 2.1,
    avatar_initials: "MN",
    bio: "Clinical dermatologist specializing in allergic dermatitis, chronic eczema, and autoimmune skin conditions.",
    available_slots: [
      { id: "slot-104-1", time: "02:00 PM", status: "AVAILABLE" },
      { id: "slot-104-2", time: "02:30 PM", status: "AVAILABLE" },
      { id: "slot-104-3", time: "03:15 PM", status: "AVAILABLE" }
    ]
  }
];
