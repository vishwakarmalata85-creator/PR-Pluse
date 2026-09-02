/**
 * NEXORA PULSE - CLINIC TOKEN QUEUE DATA
 */

export const INITIAL_QUEUE_STATE = {
  clinic_name: "Pulse Care Clinic (OPD-102)",
  doctor_in_charge: "Dr. Vikram Sethi, MD",
  current_token_serving: "T-101",
  active_patient_id: "pat-2026-001",
  avg_wait_time_mins: 12,
  tokens: [
    { token: "T-101", patient_id: "pat-2026-001", patient_name: "Anil Kumar Verma", abha_id: "91-4829-1029-4412", status: "In-Consult", checkin_time: "10:45 AM", wait_mins: 8 },
    { token: "T-102", patient_id: "pat-2026-002", patient_name: "Priya Sharma", abha_id: "91-7291-3049-8812", status: "Waiting", checkin_time: "10:52 AM", wait_mins: 14 },
    { token: "T-103", patient_id: "pat-2026-003", patient_name: "Rajesh Patel", abha_id: "91-1182-9934-2105", status: "Waiting", checkin_time: "10:58 AM", wait_mins: 20 }
  ]
};
