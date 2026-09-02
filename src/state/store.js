/**
 * NEXORA PULSE - CENTRAL REACTIVE STATE STORE
 */

import { authService } from "../services/authService.js";
import { PATIENTS } from "../data/patients.js";
import { MEDICATIONS, ICD10_DIAGNOSES } from "../data/medications.js";
import { INITIAL_QUEUE_STATE } from "../data/queueData.js";
import { OCR_SAMPLES } from "../data/ocrSamples.js";
import { PHARMACIES } from "../data/pharmacies.js";
import { SafetyService } from "../services/safetyService.js";

class PulseStore {
  constructor() {
    this.currentUser = authService.getCurrentUser() || null;
    this.activeRole = this.resolveInitialRole();
    
    this.state = {
      currentUser: this.currentUser,
      activeRole: this.activeRole, // 'doctor' | 'pharmacist' | 'patient' | 'ai' | 'queue' | 'admin' | 'pending' | null
      
      // Clinical State
      patients: [...PATIENTS],
      activePatientId: PATIENTS[0].id,
      prescribedItems: [
        {
          id: "med-001",
          name: "Azithromycin 500 MG Oral Tablet",
          active_ingredient: "Azithromycin",
          strength: "500 mg",
          dosage_form: "Tablet",
          dosage_pattern: "1-0-0",
          duration_days: 3,
          instructions: "Take 1 tablet once daily post meals for 3 days",
          schedule_class: "Schedule H"
        }
      ],
      selectedDiagnoses: [ICD10_DIAGNOSES[0]],
      clinicalNotes: "Patient presents with throat soreness and cough for 3 days.",
      safetyResult: { status: "SAFE", alerts: [] },
      queue: { ...INITIAL_QUEUE_STATE },
      
      // Pharmacist state
      ocrSamples: [...OCR_SAMPLES],
      activeOcrSampleId: OCR_SAMPLES[0].id,
      pharmacistVerifiedItems: JSON.parse(JSON.stringify(OCR_SAMPLES[0].extracted_items)),
      selectedGenericSubstitutions: {},
      
      // Patient & Geo
      pharmacies: JSON.parse(JSON.stringify(PHARMACIES)),
      searchRadiusKm: 5.0,
      
      // Modals & Notifications
      activeModal: null,
      modalData: null,
      toasts: [],
      latencyMs: 38
    };

    this.listeners = [];
    this.recalculateSafety();
  }

  resolveInitialRole() {
    const user = authService.getCurrentUser();
    if (!user) return null;
    if (user.verificationStatus === "PENDING_VERIFICATION") return "pending";
    if (user.role === "DOCTOR") return "doctor";
    if (user.role === "PHARMACY") return "pharmacist";
    if (user.role === "PATIENT") return "patient";
    if (user.role === "ADMIN") return "admin";
    return null;
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(fn => fn(this.state));
  }

  getState() {
    return this.state;
  }

  setCurrentUser(user) {
    this.state.currentUser = user;
    if (user) {
      if (user.verificationStatus === "PENDING_VERIFICATION") {
        this.state.activeRole = "pending";
      } else if (user.role === "DOCTOR") {
        this.state.activeRole = "doctor";
      } else if (user.role === "PHARMACY") {
        this.state.activeRole = "pharmacist";
      } else if (user.role === "PATIENT") {
        this.state.activeRole = "patient";
      } else if (user.role === "ADMIN") {
        this.state.activeRole = "admin";
      }
    } else {
      this.state.activeRole = null;
    }
    this.notify();
  }

  logout() {
    authService.logout();
    this.setCurrentUser(null);
    this.closeModal();
    this.showToast("Logged out successfully.", "info");
    window.location.hash = "#login";
    window.dispatchEvent(new CustomEvent("userSessionChanged"));
  }

  setRole(role) {
    this.state.activeRole = role;
    this.notify();
  }

  setActivePatient(patientId) {
    this.state.activePatientId = patientId;
    const p = this.state.patients.find(pt => pt.id === patientId);
    if (p) {
      this.state.queue.current_token_serving = p.token;
      this.state.queue.active_patient_id = p.id;
    }
    this.recalculateSafety();
    this.notify();
  }

  addItemToPrescription(med) {
    const exists = this.state.prescribedItems.some(i => i.id === med.id);
    if (!exists) {
      this.state.prescribedItems.push({ ...med, dosage_pattern: med.default_pattern || "1-0-1", duration_days: med.default_duration || 5 });
      this.recalculateSafety();
      this.showToast(`Added ${med.name} to Rx`, "info");
      this.notify();
    }
  }

  removeItemFromPrescription(id) {
    this.state.prescribedItems = this.state.prescribedItems.filter(i => i.id !== id);
    this.recalculateSafety();
    this.notify();
  }

  substituteDrug(targetId, newMedId) {
    const newMed = MEDICATIONS.find(m => m.id === newMedId);
    if (newMed) {
      this.state.prescribedItems = this.state.prescribedItems.filter(i => i.id !== targetId);
      this.addItemToPrescription(newMed);
      this.showToast(`Substituted with ${newMed.name}`, "success");
    }
  }

  recalculateSafety() {
    const p = this.state.patients.find(pt => pt.id === this.state.activePatientId);
    this.state.safetyResult = SafetyService.evaluateSafety(this.state.prescribedItems, p);
  }

  summonNextPatient() {
    const q = this.state.queue;
    const currIdx = q.tokens.findIndex(t => t.token === q.current_token_serving);
    if (currIdx >= 0 && currIdx < q.tokens.length - 1) {
      q.tokens[currIdx].status = "Completed";
      const nextToken = q.tokens[currIdx + 1];
      nextToken.status = "In-Consult";
      q.current_token_serving = nextToken.token;
      this.setActivePatient(nextToken.patient_id);
      this.showToast(`Summoned Token ${nextToken.token} (${nextToken.patient_name})`, "info");
    }
    this.notify();
  }

  selectOcrSample(sampleId) {
    this.state.activeOcrSampleId = sampleId;
    const sample = this.state.ocrSamples.find(s => s.id === sampleId);
    if (sample) {
      this.state.pharmacistVerifiedItems = JSON.parse(JSON.stringify(sample.extracted_items));
      this.state.selectedGenericSubstitutions = {};
    }
    this.notify();
  }

  toggleGenericSubstitution(idx, isGeneric) {
    this.state.selectedGenericSubstitutions[idx] = isGeneric;
    this.notify();
  }

  fulfillPharmacistOrder() {
    this.showToast("Prescription fulfilled! Inventory deducted.", "success");
    this.notify();
  }

  openModal(modalName, data = null) {
    this.state.activeModal = modalName;
    this.state.modalData = data;
    this.notify();
  }

  closeModal() {
    this.state.activeModal = null;
    this.state.modalData = null;
    this.notify();
  }

  showToast(message, type = "info") {
    const id = `toast-${Date.now()}`;
    this.state.toasts.push({ id, message, type });
    this.notify();
    setTimeout(() => {
      this.state.toasts = this.state.toasts.filter(t => t.id !== id);
      this.notify();
    }, 4000);
  }
}

export const store = new PulseStore();
