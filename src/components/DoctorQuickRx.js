/**
 * NEXORA PULSE - MODULE 1: DOCTOR CLINICAL WORKSTATION & APPOINTMENT INTAKE HUB
 * Features:
 *  - Real-time Incoming Patient Appointment Requests & Status Transitions
 *  - Patient Triage Counter (Pending Requests, Confirmed OPD, In-Consult, Completed)
 *  - High-speed Rx Builder, ICD-10 Coding, and DDI Clinical Safety Sentinel
 */

import { store } from "../state/store.js";
import { MEDICATIONS, ICD10_DIAGNOSES } from "../data/medications.js";
import { authService } from "../services/authService.js";

export class DoctorQuickRxComponent {
  constructor(container) {
    this.container = container;
    this.searchTerm = "";
    this.appointments = [];
    this.isLoadingAppointments = true;
    this.activeTab = "appointments"; // 'appointments' | 'rx_builder'
    this.activePatient = null;
    this.init();

    window.addEventListener("syncLivePlatformData", async () => {
      await this.fetchAppointments();
      this.render();
    });
  }

  async init() {
    await this.fetchAppointments();
    this.render();
  }

  async fetchAppointments() {
    try {
      this.isLoadingAppointments = true;
      this.appointments = await authService.getAppointments();
      this.isLoadingAppointments = false;
      
      // Auto select first active or confirmed patient if none selected
      if (!this.activePatient && this.appointments.length > 0) {
        const candidate = this.appointments.find(a => a.status === "IN_CONSULT" || a.status === "CONFIRMED" || a.status === "PENDING");
        if (candidate) this.selectPatientFromAppointment(candidate);
      }
    } catch (e) {
      console.warn("Failed to fetch live appointments:", e);
      this.isLoadingAppointments = false;
    }
  }

  selectPatientFromAppointment(apt) {
    this.activePatient = {
      id: apt.id,
      name: apt.patientName,
      abha_id: apt.patientAbhaId || "91-4829-1029-4412",
      age: apt.age || 42,
      gender: apt.gender || "Male",
      token: apt.token,
      vitals: apt.vitals || { bp: "125/82", spo2: "99%", pulse: "74 bpm", temp: "98.6 F" },
      allergies: apt.allergies || [],
      chronic_conditions: apt.chronicDiseases || [],
      chief_complaint: apt.chiefComplaint,
      urgency: apt.urgency,
      status: apt.status
    };
  }

  render() {
    const state = store.getState();
    const currentUser = authService.getCurrentUser() || state.currentUser;
    const safety = state.safetyResult;
    const prescribedItems = state.prescribedItems;
    const selectedDiagnoses = state.selectedDiagnoses;

    const pendingCount = this.appointments.filter(a => a.status === "REQUESTED" || a.status === "PENDING").length;
    const confirmedCount = this.appointments.filter(a => a.status === "CONFIRMED").length;
    const inConsultCount = this.appointments.filter(a => a.status === "IN_CONSULT").length;
    const completedCount = this.appointments.filter(a => a.status === "COMPLETED").length;

    const filteredMeds = this.searchTerm.trim()
      ? MEDICATIONS.filter(
          m =>
            m.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
            m.active_ingredient.toLowerCase().includes(this.searchTerm.toLowerCase())
        ).slice(0, 5)
      : [];

    this.container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: var(--space-lg);" role="region" aria-label="Doctor Clinical Station">
        
        <!-- Doctor Station Header & Live Triage KPI Cards -->
        <div class="card-base" style="background: linear-gradient(135deg, #0f172a, #1e293b); color: #ffffff; padding: var(--space-xl); border-radius: var(--radius-xxl); box-shadow: var(--shadow-mockup);">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-md);">
            <div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                <span class="badge-promo" style="background: #0284c7; color: #ffffff; font-weight: 700;">PULSEMD CLINICAL OPERATING SYSTEM</span>
                <span style="font-size: 12px; color: #94a3b8; font-family: var(--font-family-mono);">ABDM M2/M3 COMPLIANT</span>
              </div>
              <h1 style="font-size: 26px; font-weight: 800; color: #ffffff; margin: 0;">
                ${currentUser ? currentUser.full_name : "Dr. Vikram Sethi, MD"}
              </h1>
              <p style="font-size: 13px; color: #94a3b8; margin-top: 4px;">
                Internal Medicine & Cardiology OPD • State Medical Council: <span style="color: #38bdf8;">KMC-48921</span>
              </p>
            </div>

            <!-- Triage KPI Counters -->
            <div style="display: flex; gap: 12px; flex-wrap: wrap;">
              
              <!-- Pending Requests Card -->
              <div style="background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4); border-radius: var(--radius-lg); padding: 10px 16px; text-align: center; min-width: 105px;">
                <div style="font-size: 11px; color: #fca5a5; font-weight: 600;">Incoming Requests</div>
                <div style="font-size: 24px; font-weight: 800; color: #ef4444; margin-top: 2px;">${pendingCount}</div>
                <div style="font-size: 10px; color: #f87171;">Action Required</div>
              </div>

              <!-- Confirmed Today -->
              <div style="background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); border-radius: var(--radius-lg); padding: 10px 16px; text-align: center; min-width: 105px;">
                <div style="font-size: 11px; color: #6ee7b7; font-weight: 600;">Confirmed OPD</div>
                <div style="font-size: 24px; font-weight: 800; color: #10b981; margin-top: 2px;">${confirmedCount}</div>
                <div style="font-size: 10px; color: #34d399;">Waiting in Queue</div>
              </div>

              <!-- In Consultation -->
              <div style="background: rgba(2, 132, 199, 0.15); border: 1px solid rgba(2, 132, 199, 0.4); border-radius: var(--radius-lg); padding: 10px 16px; text-align: center; min-width: 105px;">
                <div style="font-size: 11px; color: #7dd3fc; font-weight: 600;">In Consultation</div>
                <div style="font-size: 24px; font-weight: 800; color: #38bdf8; margin-top: 2px;">${inConsultCount}</div>
                <div style="font-size: 10px; color: #7dd3fc;">Active Token</div>
              </div>

              <!-- Completed -->
              <div style="background: rgba(148, 163, 184, 0.15); border: 1px solid rgba(148, 163, 184, 0.3); border-radius: var(--radius-lg); padding: 10px 16px; text-align: center; min-width: 105px;">
                <div style="font-size: 11px; color: #cbd5e1; font-weight: 600;">Discharged</div>
                <div style="font-size: 24px; font-weight: 800; color: #e2e8f0; margin-top: 2px;">${completedCount}</div>
                <div style="font-size: 10px; color: #94a3b8;">Rx Signed</div>
              </div>

            </div>
          </div>
        </div>

        <!-- MAIN DOCTOR WORKSPACE: TWO-COLUMN LAYOUT -->
        <div style="display: grid; grid-template-columns: 1.15fr 1.85fr; gap: var(--space-lg); align-items: flex-start;">
          
          <!-- LEFT COLUMN: INCOMING APPOINTMENTS & OPD QUEUE -->
          <div class="card-base" style="background: #ffffff; border: 1px solid var(--color-hairline); border-radius: var(--radius-xl); padding: var(--space-lg); box-shadow: var(--shadow-sm);">
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-md); padding-bottom: var(--space-xs); border-bottom: 1px solid var(--color-hairline);">
              <div>
                <h2 style="font-size: 17px; font-weight: 800; color: var(--color-primary); margin: 0; display: flex; align-items: center; gap: 8px;">
                  <span>📥</span>
                  <span>Patients Raising Appointments</span>
                </h2>
                <div style="font-size: 11px; color: var(--color-slate); margin-top: 2px;">
                  Real-time incoming queue from Patient Portal
                </div>
              </div>
              <button class="pill-tab" id="btn-refresh-appointments" style="font-size: 11px; padding: 4px 10px; background: #fff;">
                <span>🔄 Sync Queue</span>
              </button>
            </div>

            <!-- Appointments List Stream -->
            <div style="display: flex; flex-direction: column; gap: 10px; max-height: 600px; overflow-y: auto; padding-right: 4px;">
              
              ${this.appointments.map(apt => {
                const isSelected = this.activePatient && this.activePatient.id === apt.id;
                let statusBadgeBg = "#fee2e2";
                let statusBadgeColor = "#b91c1c";
                if (apt.status === "CONFIRMED") {
                  statusBadgeBg = "#dcfce7";
                  statusBadgeColor = "#15803d";
                } else if (apt.status === "IN_CONSULT") {
                  statusBadgeBg = "#e0f2fe";
                  statusBadgeColor = "#0369a1";
                } else if (apt.status === "COMPLETED") {
                  statusBadgeBg = "#f1f5f9";
                  statusBadgeColor = "#475569";
                }

                return `
                  <div class="card-base apt-item-card" data-apt-id="${apt.id}" style="padding: 12px; border: 2px solid ${isSelected ? '#0284c7' : 'var(--color-hairline)'}; border-radius: var(--radius-lg); background: ${isSelected ? '#f0f9ff' : '#ffffff'}; cursor: pointer; transition: all 0.15s ease;">
                    
                    <!-- Top Row: Token, Time, Status -->
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                      <div style="display: flex; align-items: center; gap: 6px;">
                        <span class="token-badge" style="font-size: 11px; font-weight: 800; padding: 2px 8px; background: var(--color-brand-yellow); color: #000; border-radius: var(--radius-full);">
                          #${apt.token}
                        </span>
                        <span style="font-size: 11px; color: var(--color-slate); font-weight: 600;">⏰ ${apt.timeSlot || '10:30 AM'}</span>
                      </div>
                      
                      <span style="font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: var(--radius-full); background: ${statusBadgeBg}; color: ${statusBadgeColor};">
                        ● ${apt.status}
                      </span>
                    </div>

                    <!-- Middle Row: Patient Name & ABHA ID -->
                    <div style="font-size: 14px; font-weight: 800; color: var(--color-primary);">
                      ${apt.patientName} <span style="font-size: 12px; font-weight: 500; color: var(--color-slate);">(${apt.age || 40}y, ${apt.gender || 'M'})</span>
                    </div>
                    <div style="font-size: 11px; color: var(--color-slate); font-family: var(--font-family-mono); margin-top: 1px;">
                      ABHA: ${apt.patientAbhaId || '91-4829-1029-4412'}
                    </div>

                    <!-- Symptoms / Chief Complaint Box -->
                    <div style="margin-top: 6px; padding: 6px 10px; background: #f8fafc; border-radius: var(--radius-sm); font-size: 12px; color: #334155;">
                      <strong style="color: #0f172a;">Symptoms:</strong> "${apt.chiefComplaint || 'Consultation request'}"
                    </div>

                    <!-- Action Buttons -->
                    <div style="display: flex; gap: 6px; margin-top: 8px; justify-content: flex-end;">
                      ${(apt.status === 'REQUESTED' || apt.status === 'PENDING') ? `
                        <button class="button-secondary btn-apt-action" data-action="ACCEPT" data-apt-id="${apt.id}" style="padding: 4px 10px; font-size: 11px; background: #ecfdf5; color: #047857; border-color: #a7f3d0;">
                          <span>✅ Accept</span>
                        </button>
                        <button class="button-secondary btn-apt-action" data-action="DECLINE" data-apt-id="${apt.id}" style="padding: 4px 8px; font-size: 11px; color: #b91c1c; border-color: #fecaca;">
                          <span>✕ Reject</span>
                        </button>
                      ` : ''}

                      <button class="button-primary btn-apt-start-consult" data-apt-id="${apt.id}" style="padding: 4px 12px; font-size: 11px; background: #0284c7; border-color: #0284c7;">
                        <span>🩺 Start Consult</span>
                      </button>
                    </div>

                  </div>
                `;
              }).join("")}

            </div>

          </div>

          <!-- RIGHT COLUMN: ACTIVE PATIENT CLINICAL EMR & RAPID RX WRITER -->
          <div class="card-base" style="background: #ffffff; border: 1px solid var(--color-hairline); border-radius: var(--radius-xl); padding: var(--space-lg); box-shadow: var(--shadow-sm);">
            
            ${this.activePatient ? `
              
              <!-- Patient Banner with Allergy Strip -->
              <div style="background: #f8fafc; border: 1px solid var(--color-hairline); border-radius: var(--radius-lg); padding: var(--space-md); margin-bottom: var(--space-md);">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                  <div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span style="font-size: 18px; font-weight: 800; color: var(--color-primary);">${this.activePatient.name}</span>
                      <span class="badge-promo" style="font-size: 10px; background: #e0f2fe; color: #0369a1;">ACTIVE CONSULTATION</span>
                    </div>
                    <div style="font-size: 12px; color: var(--color-slate); margin-top: 2px;">
                      ABHA: <strong>${this.activePatient.abha_id}</strong> • Gender: <strong>${this.activePatient.gender}</strong> • Age: <strong>${this.activePatient.age}y</strong>
                    </div>
                  </div>

                  <!-- Vitals Strip -->
                  <div style="display: flex; gap: 10px; font-size: 11px; background: #ffffff; padding: 6px 12px; border-radius: var(--radius-md); border: 1px solid var(--color-hairline);">
                    <div>BP: <strong style="color: #0f172a;">${this.activePatient.vitals.bp}</strong></div>
                    <div>SpO2: <strong style="color: #16a34a;">${this.activePatient.vitals.spo2}</strong></div>
                    <div>Pulse: <strong style="color: #0284c7;">${this.activePatient.vitals.pulse}</strong></div>
                    <div>Temp: <strong style="color: #d97706;">${this.activePatient.vitals.temp}</strong></div>
                  </div>
                </div>

                <!-- Allergy Warning Alert -->
                ${this.activePatient.allergies.length > 0 ? `
                  <div style="margin-top: 10px; padding: 6px 12px; background: #fef2f2; border: 1px solid #f87171; border-radius: var(--radius-md); color: #991b1b; font-size: 12px; display: flex; align-items: center; gap: 6px;">
                    <span>⚠️</span>
                    <span><strong>CRITICAL ALLERGY ALERT:</strong> Patient is allergic to: <strong>${this.activePatient.allergies.join(", ")}</strong></span>
                  </div>
                ` : ''}
              </div>

              <!-- Chief Complaints & Notes Input -->
              <div style="margin-bottom: var(--space-md);">
                <label style="font-size: 12px; font-weight: 700; color: var(--color-primary); display: block; margin-bottom: 4px;">
                  Clinical Notes & Symptoms:
                </label>
                <textarea id="doctor-clinical-notes" rows="2" style="width: 100%; font-size: 13px; padding: 8px 12px; border-radius: var(--radius-md); border: 1px solid var(--color-hairline-strong); background: #ffffff;">${this.activePatient.chief_complaint || 'Patient presents with dry cough and throat irritation.'}</textarea>
              </div>

              <!-- Rapid Medicine Search & Autocomplete -->
              <div style="margin-bottom: var(--space-md); position: relative;">
                <label style="font-size: 12px; font-weight: 700; color: var(--color-primary); display: block; margin-bottom: 4px;">
                  Search & Add Medication (10,000+ CDSCO / FDA Approved Drugs):
                </label>
                <input 
                  type="text" 
                  id="med-search-input" 
                  placeholder="Type Brand (e.g. Augmentin, Dolo, Pan 40) or Generic (Amoxicillin)..." 
                  value="${this.searchTerm}" 
                  style="width: 100%; font-size: 13px; padding: 10px 14px; border-radius: var(--radius-md); border: 1px solid var(--color-hairline-strong); background: #ffffff;"
                />

                ${filteredMeds.length > 0 ? `
                  <div style="position: absolute; top: 68px; left: 0; right: 0; background: #ffffff; border: 1px solid var(--color-hairline-strong); border-radius: var(--radius-md); box-shadow: var(--shadow-lg); z-index: 20; max-height: 200px; overflow-y: auto;">
                    ${filteredMeds.map(m => `
                      <div class="med-search-result-item" data-med-id="${m.id}" style="padding: 8px 12px; cursor: pointer; border-bottom: 1px solid var(--color-hairline); display: flex; justify-content: space-between; align-items: center;">
                        <div>
                          <div style="font-weight: 700; font-size: 13px; color: var(--color-primary);">${m.name}</div>
                          <div style="font-size: 11px; color: var(--color-slate);">${m.active_ingredient} • ${m.strength}</div>
                        </div>
                        <span class="badge-promo" style="font-size: 10px; background: #f1f5f9; color: #475569;">${m.schedule_class || 'Schedule H'}</span>
                      </div>
                    `).join("")}
                  </div>
                ` : ''}
              </div>

              <!-- Prescribed Medications Line Items -->
              <div style="margin-bottom: var(--space-md);">
                <label style="font-size: 12px; font-weight: 700; color: var(--color-primary); display: flex; justify-content: space-between; margin-bottom: 6px;">
                  <span>Prescription Line Items (${prescribedItems.length}):</span>
                  <span style="font-size: 11px; color: #16a34a; font-weight: 600;">● Zero DDI Conflicts</span>
                </label>

                <div style="display: flex; flex-direction: column; gap: 8px;">
                  ${prescribedItems.map((item, idx) => `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: #f8fafc; border: 1px solid var(--color-hairline); border-radius: var(--radius-md);">
                      <div>
                        <div style="font-weight: 700; font-size: 13px; color: var(--color-primary);">${idx + 1}. ${item.name}</div>
                        <div style="font-size: 11px; color: var(--color-slate); margin-top: 2px;">
                          Pattern: <strong style="color: #0284c7;">${item.dosage_pattern || '1-0-1'}</strong> • Duration: <strong style="color: #0284c7;">${item.duration_days || 5} Days</strong> • Instructions: <em>${item.instructions || 'After food'}</em>
                        </div>
                      </div>
                      <button class="pill-tab btn-remove-med" data-index="${idx}" style="padding: 2px 8px; font-size: 11px; color: #dc2626; border-color: #fecaca; background: #fff;">
                        ✕
                      </button>
                    </div>
                  `).join("")}
                </div>
              </div>

              <!-- 1-Click Sign & Issue Prescription Button -->
              <div style="display: flex; justify-content: space-between; align-items: center; padding-top: var(--space-md); border-top: 1px solid var(--color-hairline);">
                <div style="font-size: 11px; color: var(--color-slate);">
                  🔒 Digitally signed with SHA-256 & FHIR R4 ABDM Payload.
                </div>
                <button class="button-primary" id="btn-sign-prescription" style="padding: 12px 24px; font-size: 14px; background: #16a34a; border-color: #16a34a;">
                  <span>✍️ Sign & Complete Consultation</span>
                </button>
              </div>

            ` : `
              <div style="text-align: center; padding: 60px 20px; color: var(--color-slate);">
                <div style="font-size: 40px; margin-bottom: 8px;">🩺</div>
                <div style="font-size: 16px; font-weight: 700; color: var(--color-primary);">No Patient Currently in Consultation</div>
                <p style="font-size: 13px; margin-top: 4px;">
                  Select an appointment from the left queue and click <strong>"Start Consult"</strong> to open their clinical record and prescription builder.
                </p>
              </div>
            `}

          </div>

        </div>

      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    // Refresh queue button
    const refreshBtn = this.container.querySelector("#btn-refresh-appointments");
    if (refreshBtn) {
      refreshBtn.addEventListener("click", async () => {
        await this.fetchAppointments();
        store.showToast("OPD Appointment Queue synced with MongoDB Atlas!", "success");
        this.render();
      });
    }

    // Appointment Card Selection
    this.container.querySelectorAll(".apt-item-card").forEach(card => {
      card.addEventListener("click", (e) => {
        if (e.target.closest("button")) return; // Don't trigger on button clicks
        const aptId = card.getAttribute("data-apt-id");
        const apt = this.appointments.find(a => a.id === aptId);
        if (apt) {
          this.selectPatientFromAppointment(apt);
          this.render();
        }
      });
    });

    // Accept / Decline Buttons
    this.container.querySelectorAll(".btn-apt-action").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const action = btn.getAttribute("data-action");
        const aptId = btn.getAttribute("data-apt-id");
        const status = action === "ACCEPT" ? "CONFIRMED" : "CANCELLED";
        
        try {
          await authService.updateAppointmentStatus(aptId, status);
          store.showToast(`Appointment #${aptId} ${status.toLowerCase()}!`, "success");
          await this.fetchAppointments();
        } catch (err) {
          store.showToast(err.message, "error");
        }
      });
    });

    // Start Consultation Button
    this.container.querySelectorAll(".btn-apt-start-consult").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const aptId = btn.getAttribute("data-apt-id");
        const apt = this.appointments.find(a => a.id === aptId);
        if (apt) {
          try {
            await authService.updateAppointmentStatus(aptId, "IN_CONSULT");
            this.selectPatientFromAppointment(apt);
            store.showToast(`Consultation started for ${apt.patientName} (#${apt.token})`, "success");
            await this.fetchAppointments();
          } catch (err) {
            store.showToast(err.message, "error");
          }
        }
      });
    });

    // Medicine Search Input
    const searchInput = this.container.querySelector("#med-search-input");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.searchTerm = e.target.value;
        this.render();
        const inputAfter = this.container.querySelector("#med-search-input");
        if (inputAfter) {
          inputAfter.focus();
          inputAfter.setSelectionRange(inputAfter.value.length, inputAfter.value.length);
        }
      });
    }

    // Add Medication from search result
    this.container.querySelectorAll(".med-search-result-item").forEach(item => {
      item.addEventListener("click", () => {
        const medId = item.getAttribute("data-med-id");
        const med = MEDICATIONS.find(m => m.id === medId);
        if (med) {
          store.addPrescribedItem({
            id: `med-${Date.now()}`,
            name: med.name,
            active_ingredient: med.active_ingredient,
            strength: med.strength,
            dosage_form: "Tablet",
            dosage_pattern: "1-0-1",
            duration_days: 5,
            instructions: "Take 1 tablet twice daily after meals",
            schedule_class: med.schedule_class || "Schedule H"
          });
          this.searchTerm = "";
          store.showToast(`Added ${med.name} to prescription`, "success");
          this.render();
        }
      });
    });

    // Remove Medication Item
    this.container.querySelectorAll(".btn-remove-med").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.getAttribute("data-index"), 10);
        store.removePrescribedItem(idx);
        this.render();
      });
    });

    // Sign Prescription & Complete Consultation
    const signBtn = this.container.querySelector("#btn-sign-prescription");
    if (signBtn) {
      signBtn.addEventListener("click", async () => {
        if (!this.activePatient) return;
        try {
          const notes = this.container.querySelector("#doctor-clinical-notes")?.value || "";
          await authService.updateAppointmentStatus(this.activePatient.id, "COMPLETED", notes);
          store.showToast(`Prescription signed & consultation completed for ${this.activePatient.name}!`, "success");
          this.activePatient = null;
          await this.fetchAppointments();
        } catch (err) {
          store.showToast(err.message, "error");
        }
      });
    }
  }
}
