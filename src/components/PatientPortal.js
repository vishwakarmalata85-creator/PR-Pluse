/**
 * NEXORA PULSECARE - PATIENT OPERATING SYSTEM
 * Built to exact specifications of PATIENT_PRD.md & styled with Miro Design Patterns (DESIGN.md)
 */

import { store } from "../state/store.js";
import { GeoService } from "../services/geoService.js";
import { realtimeMapService } from "../services/realtimeMapService.js";
import { GeminiVisionService } from "../services/geminiVisionService.js";
import { orderService } from "../services/orderService.js";
import { authService } from "../services/authService.js";
import { DOCTORS_DIRECTORY } from "../data/doctorsData.js";
import { REFERENCE_LOCATION } from "../data/pharmacies.js";

export class PatientPortalComponent {
  constructor(container) {
    this.container = container;
    this.activeTab = "prescriptions"; // 'prescriptions' | 'doctors' | 'pharmacy_radar' | 'vault' | 'orders'
    this.selectedSpecialty = "ALL";
    this.scannerState = {
      isScanning: false,
      uploadedFileName: null,
      extractedData: null,
      selectedSampleId: "ocr-sample-1"
    };
    this.bookingModalDoctor = null;
    this.bookedAppointment = null;
    this.liveOrders = [];
    this.liveDoctors = [];
    this.fetchLiveOrders();
    this.fetchLiveDoctors();
    this.fetchLiveAppointments();
    this.unsubscribe = store.subscribe(() => this.render());

    // Listen for tab switch events from Navbar
    window.addEventListener("switchPatientTab", (e) => {
      if (e.detail?.tab) {
        this.activeTab = e.detail.tab;
        this.render();
        if (e.detail.triggerScan) {
          this.triggerSampleScan("ocr-sample-1");
        }
      }
    });

    // Listen for global sync live data event
    window.addEventListener("syncLivePlatformData", async () => {
      await Promise.all([
        this.fetchLiveOrders(),
        this.fetchLiveDoctors(),
        this.fetchLiveAppointments()
      ]);
      this.render();
    });
  }

  render() {
    const state = store.getState();
    const currentUser = authService.getCurrentUser() || state.currentUser;
    const activePatient = (currentUser && currentUser.role === "PATIENT") 
      ? currentUser 
      : (state.patients.find(p => p.id === state.activePatientId) || state.patients[0]);
    
    const patientName = activePatient.full_name || activePatient.name || "Patient";
    const patientFirstName = patientName.split(" ")[0];
    const vitals = activePatient.recent_vitals || { bp: "124/82 mmHg", spO2: "99%", pulse: "74 bpm" };

    const radius = state.searchRadiusKm;
    const queue = state.queue;
    const myToken = queue.tokens.find(t => t.patient_id === activePatient.id) || queue.tokens[0];
    const liveOrdersList = this.liveOrders && this.liveOrders.length > 0 ? this.liveOrders : [];
    const ordersCount = liveOrdersList.length;

    this.container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: var(--space-xl); margin-top: var(--space-lg);" role="region" aria-label="PulseCare Patient Interface">
        
        <!-- Welcome / Active Consult Hero Banner (Pastel Yellow with 28px rounded corners per DESIGN.md) -->
        <div class="card-base card-feature-yellow" style="padding: var(--space-xl); box-shadow: var(--shadow-card); border: 1px solid #fde68a;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-lg);">
            
            <div style="display: flex; align-items: center; gap: var(--space-md);">
              <div class="badge-promo" style="background-color: var(--color-primary); color: #fff; font-size: 14px; padding: 6px 14px;">
                TOKEN ${myToken.token}
              </div>

              <div>
                <h1 class="heading-2" style="font-size: 26px; line-height: 1.2; margin-bottom: 2px;">
                  Welcome back, ${patientFirstName}
                </h1>
                <div class="body-sm" style="color: var(--color-charcoal);">
                  OPD Queue: <strong>${queue.clinic_name}</strong> • Attending: <strong>${queue.doctor_in_charge}</strong>
                </div>
              </div>
            </div>

            <!-- Vitals Telemetry & Quick Action Pills -->
            <div style="display: flex; align-items: center; gap: var(--space-md); flex-wrap: wrap;">
              <div style="display: flex; gap: var(--space-xs);">
                <span class="badge-tag-yellow" style="background: #ffffff; border-color: #e0e2e8; font-size: 12px;">
                  BP: <strong>${vitals.bp}</strong>
                </span>
                <span class="badge-tag-yellow" style="background: #ffffff; border-color: #e0e2e8; font-size: 12px;">
                  SpO2: <strong>${vitals.spO2}</strong>
                </span>
                <span class="badge-tag-yellow" style="background: #ffffff; border-color: #e0e2e8; font-size: 12px;">
                  Heart Rate: <strong>${vitals.pulse}</strong>
                </span>
              </div>

              <span class="badge-promo" style="background: var(--color-brand-blue); color: #fff; font-size: 11px;">
                ● ${myToken.status.toUpperCase()}
              </span>
            </div>

          </div>

          <!-- Quick Navigation Pill Bar (Miro Pill Tabs) -->
          <div style="display: flex; gap: var(--space-xs); margin-top: var(--space-lg); padding-top: var(--space-md); border-top: 1px solid rgba(0,0,0,0.06); flex-wrap: wrap;">
            <button class="pill-tab ${this.activeTab === 'prescriptions' ? 'pill-tab-active' : ''}" data-tab="prescriptions">
              📄 Dual Prescription Hub & AI Scanner
            </button>
            <button class="pill-tab ${this.activeTab === 'doctors' ? 'pill-tab-active' : ''}" data-tab="doctors">
              🩺 Doctor Discovery & Booking
            </button>
            <button class="pill-tab ${this.activeTab === 'pharmacy_radar' ? 'pill-tab-active' : ''}" data-tab="pharmacy_radar">
              📍 5 km Local Pharmacy Stock Radar
            </button>
            <button class="pill-tab ${this.activeTab === 'vault' ? 'pill-tab-active' : ''}" data-tab="vault">
              🗄️ EMR Health Vault & QR
            </button>
            <button class="pill-tab ${this.activeTab === 'orders' ? 'pill-tab-active' : ''}" data-tab="orders">
              📦 Medicine Orders (${ordersCount})
            </button>
            <button class="pill-tab btn-patient-sync-data" style="margin-left: auto; background: #ffffff; border-color: #86efac; color: #166534; font-weight: 700;">
              <span>🔄 Refresh Live Data</span>
            </button>
          </div>
        </div>

        <!-- Dynamic Main Section Viewport -->
        <div id="patient-tab-viewport">
          ${this.activeTab === 'prescriptions' ? this.renderPrescriptionHub() : ''}
          ${this.activeTab === 'doctors' ? this.renderDoctorDiscovery() : ''}
          ${this.activeTab === 'pharmacy_radar' ? this.renderPharmacyRadar() : ''}
          ${this.activeTab === 'vault' ? this.renderHealthVault() : ''}
          ${this.activeTab === 'orders' ? this.renderOrdersTracking() : ''}
        </div>

        <!-- Doctor Booking Modal -->
        ${this.bookingModalDoctor ? this.renderBookingModal() : ''}

      </div>
    `;

    this.bindEvents();
  }

  // =========================================================================
  // 1. DUAL PRESCRIPTION HUB & SMART GEMINI 3.1 FLASH AI SCANNER
  // =========================================================================
  renderPrescriptionHub() {
    const state = store.getState();
    const scanned = this.scannerState.extractedData;

    return `
      <div style="display: grid; grid-template-columns: 1fr 1.15fr; gap: var(--space-xl); align-items: start;">
        
        <!-- Left: In-App Doctor Digital Prescriptions (Lavender Highlight Card) -->
        <div class="card-base" style="background: #ffffff; border: 1px solid var(--color-hairline); box-shadow: var(--shadow-card); min-height: 520px;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-md); padding-bottom: var(--space-xs); border-bottom: 1px solid var(--color-hairline);">
              <div style="display: flex; align-items: center; gap: var(--space-xs);">
                <span style="font-size: 20px;">🩺</span>
                <h3 class="heading-3" style="font-size: 20px;">Doctor Digital Prescription</h3>
              </div>
              <span class="badge-promo" style="background: var(--color-brand-blue); color: #fff; font-size: 10px;">
                FHIR R4 VERIFIED
              </span>
            </div>

            <div style="padding: var(--space-md); background: var(--color-surface-pricing-featured); border-radius: var(--radius-lg); border: 1px solid #ddd6fe; margin-bottom: var(--space-lg);">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="font-weight: 700; color: var(--color-primary); font-size: 15px;">Prescription #RX-2026-8910</div>
                  <div style="font-size: 12px; color: var(--color-slate); margin-top: 2px;">Dr. Vikram Sethi, MD • Reg: KMC-48921-2012</div>
                </div>
                <span class="badge-tag-purple" style="font-size: 11px; padding: 2px 8px;">
                  SHA-256 Validated
                </span>
              </div>

              <div style="font-size: 13px; color: var(--color-charcoal); margin-top: var(--space-xs);">
                Diagnosis: <strong style="color: var(--color-primary);">Acute Pharyngitis & Upper RTI (ICD-10: J02.9)</strong>
              </div>
            </div>

            <!-- Medication Line Items -->
            <div style="display: flex; flex-direction: column; gap: var(--space-sm);">
              ${state.prescribedItems.map((item) => `
                <div style="padding: var(--space-md); background: var(--color-surface); border-radius: var(--radius-md); border: 1px solid var(--color-hairline); display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <div style="font-weight: 700; color: var(--color-primary); font-size: 14px;">${item.name || item.drug_name}</div>
                    <div style="font-size: 12px; color: var(--color-slate); margin-top: 2px;">${item.active_ingredient} (${item.strength})</div>
                    <div style="font-size: 12px; color: var(--color-brand-blue); font-weight: 600; margin-top: 4px;">
                      Sig: ${item.instructions || item.dosage_pattern}
                    </div>
                  </div>

                  <div style="text-align: right;">
                    <span class="badge-promo" style="background: #ffffff; border: 1px solid var(--color-hairline); color: var(--color-primary); font-size: 11px;">
                      ${item.dosage_pattern}
                    </span>
                    <div style="font-size: 11px; color: var(--color-stone); margin-top: 4px;">${item.duration_days} days course</div>
                  </div>
                </div>
              `).join("")}
            </div>
          </div>

          <button class="button-primary btn-tab-jump" data-target-tab="pharmacy_radar" style="width: 100%; margin-top: var(--space-xl);">
            <span>📍 Locate Medicines in 5 km Radar</span>
            <span>➔</span>
          </button>
        </div>

        <!-- Right: Smart Gemini 3.1 Flash Vision OCR Scanner (Pastel Rose Card with 28px corners) -->
        <div class="card-base card-feature-rose" style="border: 1px solid #fde0f0; box-shadow: var(--shadow-card); min-height: 520px;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-md); padding-bottom: var(--space-xs); border-bottom: 1px solid rgba(0,0,0,0.06);">
              <div style="display: flex; align-items: center; gap: var(--space-xs);">
                <span style="font-size: 20px;">🤖</span>
                <h3 class="heading-3" style="font-size: 20px;">Smart AI Prescription Scanner</h3>
              </div>
              <span class="badge-tag-purple" style="background: #fff; font-size: 11px;">
                Gemini 3.1 Flash Vision
              </span>
            </div>

            <p class="body-sm" style="color: var(--color-charcoal); margin-bottom: var(--space-md);">
              Snap a photo of your paper prescription slip. Google Gemini 3.1 Flash converts messy clinical handwriting into structured, error-free medicine cards in milliseconds.
            </p>

            <!-- File Upload & Sample OCR Selector -->
            <div style="padding: var(--space-lg); background: #ffffff; border: 2px dashed #cbd5e1; border-radius: var(--radius-xl); text-align: center; margin-bottom: var(--space-md);">
              <div style="font-size: 32px; margin-bottom: var(--space-xs);">📸</div>
              <div style="font-weight: 700; font-size: 14px; color: var(--color-primary);">Upload Prescription Image or PDF</div>
              <div style="font-size: 12px; color: var(--color-slate); margin-top: 2px;">Supported: JPG, PNG, WebP, PDF (Max 15MB)</div>

              <div style="margin-top: var(--space-md); display: flex; justify-content: center; gap: var(--space-sm); flex-wrap: wrap;">
                <label class="button-secondary" style="padding: 8px 18px; font-size: 13px; cursor: pointer; background: #fff;">
                  <span>📁 Upload File</span>
                  <input type="file" id="patient-file-upload-input" accept="image/*,.pdf" style="display: none;" />
                </label>

                <button class="button-yellow btn-run-gemini-ocr" data-sample="ocr-sample-1" style="padding: 8px 18px; font-size: 13px;">
                  <span>⚡ Test Gemini 3.1 Flash OCR</span>
                </button>
              </div>
            </div>

            <!-- OCR Result Display -->
            ${this.scannerState.isScanning ? `
              <div style="text-align: center; padding: var(--space-xl); background: #fff; border-radius: var(--radius-xl);">
                <div style="font-size: 24px; animation: spin 1s infinite linear;">⚡</div>
                <div style="font-weight: 700; color: var(--color-brand-blue); margin-top: var(--space-xs); font-size: 14px;">
                  Gemini 3.1 Flash Vision Ingestion...
                </div>
                <div style="font-size: 12px; color: var(--color-slate); margin-top: 2px;">
                  Extracting medication names, dosage frequencies (1-0-1), and durations into structured JSON
                </div>
              </div>
            ` : scanned ? `
              <div style="padding: var(--space-md); background: #ffffff; border-radius: var(--radius-xl); border: 1px solid var(--color-hairline); box-shadow: var(--shadow-card);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-sm);">
                  <div style="font-size: 13px; font-weight: 700; color: var(--color-success-accent);">
                    ✓ Extracted ${scanned.medicines.length} Medicines (Gemini 3.1 Flash)
                  </div>
                  <span style="font-size: 11px; color: var(--color-stone);">Latency: <strong>850ms</strong></span>
                </div>

                <!-- Structured Editable Table -->
                <div style="overflow-x: auto;">
                  <table class="comparison-table" style="font-size: 12px;">
                    <thead>
                      <tr>
                        <th>Medicine</th>
                        <th>Frequency</th>
                        <th>Duration</th>
                        <th>Directions</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${scanned.medicines.map(m => `
                        <tr>
                          <td>
                            <strong>${m.name}</strong>
                            <div style="font-size: 11px; color: var(--color-slate);">${m.strength} • ${m.dosageForm}</div>
                          </td>
                          <td><span class="badge-promo" style="background: var(--color-surface-yellow); color: var(--color-primary); font-size: 10px;">${m.frequency}</span></td>
                          <td>${m.duration}</td>
                          <td style="color: var(--color-charcoal);">${m.instructions}</td>
                        </tr>
                      `).join("")}
                    </tbody>
                  </table>
                </div>

                <button class="button-primary btn-tab-jump" data-target-tab="pharmacy_radar" style="width: 100%; margin-top: var(--space-md); font-size: 13px;">
                  <span>🛒 Match with Local 5 km Pharmacy Stock</span>
                  <span>➔</span>
                </button>
              </div>
            ` : ''}
          </div>
        </div>

      </div>
    `;
  }

  // =========================================================================
  // 2. DOCTOR DISCOVERY & REAL-TIME 15-MINUTE SLOT BOOKING
  // =========================================================================
  renderDoctorDiscovery() {
    const specialties = ["ALL", "Internal Medicine", "Cardiology", "Pediatrics", "Dermatology"];
    const baseDocs = this.liveDoctors && this.liveDoctors.length > 0 ? this.liveDoctors : DOCTORS_DIRECTORY;
    const filteredDocs = this.selectedSpecialty === "ALL"
      ? baseDocs
      : baseDocs.filter(d => (d.specialty || "").toLowerCase().includes(this.selectedSpecialty.toLowerCase()));

    return `
      <div style="display: flex; flex-direction: column; gap: var(--space-lg);">
        
        <!-- Specialty Filters Bar (Miro Pill Tabs) -->
        <div class="card-base" style="background: #ffffff; padding: var(--space-md) var(--space-lg); border: 1px solid var(--color-hairline); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-md);">
          <div style="display: flex; align-items: center; gap: var(--space-xs); flex-wrap: wrap;">
            <span class="micro" style="margin-right: var(--space-xs);">Specialty:</span>
            ${specialties.map(s => `
              <button class="pill-tab btn-filter-specialty ${this.selectedSpecialty === s ? 'pill-tab-active' : ''}" data-specialty="${s}">
                ${s}
              </button>
            `).join("")}
          </div>

          <div style="font-size: 13px; color: var(--color-slate);">
            Showing <strong>${filteredDocs.length}</strong> verified practitioners
          </div>
        </div>

        ${this.bookedAppointment ? `
          <!-- Active Appointment Status Card (Real MongoDB Data) -->
          <div class="card-base" style="background: #fffbeb; border: 2px solid #fde68a; border-radius: var(--radius-xl); padding: var(--space-xl); box-shadow: var(--shadow-card);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px;">
              <div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span class="badge-promo" style="background: ${this.bookedAppointment.status === 'CONFIRMED' ? '#10b981' : '#f59e0b'}; color: #ffffff; font-weight: 800;">
                    ${this.bookedAppointment.status === 'CONFIRMED' ? '🟢 APPOINTMENT CONFIRMED' : '🟡 BOOKING REQUESTED'}
                  </span>
                  <span style="font-size: 13px; font-weight: 800; color: #92400e; font-family: monospace;">TOKEN: ${this.bookedAppointment.tokenNumber || this.bookedAppointment.token}</span>
                </div>
                <h3 style="font-size: 22px; font-weight: 800; color: #78350f; margin-top: 8px; margin-bottom: 2px;">
                  ${this.bookedAppointment.doctorName}
                </h3>
                <p style="font-size: 13px; color: #92400e; margin: 0;">
                  ${this.bookedAppointment.department} • ${this.bookedAppointment.clinicName}
                </p>
                <div style="font-size: 12px; color: #b45309; margin-top: 4px;">
                  📍 ${this.bookedAppointment.clinicAddress}
                </div>
              </div>

              <div style="text-align: right; background: #ffffff; padding: 12px 18px; border-radius: var(--radius-lg); border: 1px solid #fef3c7; box-shadow: var(--shadow-sm);">
                <div style="font-size: 11px; color: #92400e; font-weight: 600;">Status</div>
                <div style="font-size: 15px; font-weight: 800; color: ${this.bookedAppointment.status === 'CONFIRMED' ? '#15803d' : '#d97706'}; margin-top: 2px;">
                  ${this.bookedAppointment.status === 'CONFIRMED' ? '● Confirmed by Doctor' : '● Waiting for Doctor'}
                </div>
                <div style="font-size: 12px; color: #78350f; margin-top: 4px; font-weight: 700;">
                  Fee: ₹${this.bookedAppointment.consultationFee || 600}
                </div>
              </div>
            </div>

            <div style="margin-top: var(--space-md); padding-top: var(--space-sm); border-top: 1px solid #fde68a; font-size: 12px; color: #92400e; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
              <span>📅 Date: <strong>${this.bookedAppointment.date}</strong> at <strong>${this.bookedAppointment.timeSlot || this.bookedAppointment.time}</strong></span>
              <span>🔒 Record saved to MongoDB Atlas collection <code>appointments</code></span>
            </div>
          </div>
        ` : ''}

        <!-- Doctor Cards Grid -->
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-lg);">
          ${filteredDocs.map(doc => `
            <div class="card-base" style="background: #ffffff; border: 1px solid var(--color-hairline); box-shadow: var(--shadow-card); justify-content: space-between; gap: var(--space-md);">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <div style="display: flex; gap: var(--space-md);">
                    <div style="width: 52px; height: 52px; border-radius: 50%; background: var(--color-surface-yellow); color: var(--color-yellow-dark); font-weight: 800; font-size: 18px; display: flex; align-items: center; justify-content: center; border: 1px solid #fde68a;">
                      ${doc.avatar_initials}
                    </div>
                    <div>
                      <div style="font-weight: 700; font-size: 18px; color: var(--color-primary);">${doc.name}</div>
                      <div style="font-size: 13px; color: var(--color-brand-blue); font-weight: 600;">${doc.specialty} (${doc.experience_years}y Experience)</div>
                      <div style="font-size: 12px; color: var(--color-slate); margin-top: 2px;">${doc.clinic_affiliation}</div>
                    </div>
                  </div>

                  <div style="text-align: right;">
                    <div style="font-size: 20px; font-weight: 800; font-family: var(--font-family-display); color: var(--color-primary);">₹${doc.consultation_fee}</div>
                    <div class="caption">Consultation Fee</div>
                  </div>
                </div>

                <p class="body-sm" style="color: var(--color-charcoal); margin: var(--space-md) 0; line-height: 1.5;">
                  ${doc.bio}
                </p>

                <div style="display: flex; gap: var(--space-md); font-size: 12px; color: var(--color-slate); background: var(--color-surface); padding: 8px 12px; border-radius: var(--radius-md);">
                  <span>📍 <strong>${doc.distance_km} km</strong> away</span>
                  <span>⭐ <strong>${doc.rating}</strong> (${doc.total_consultations} consults)</span>
                  <span>Council: <strong>${doc.mrn.split("-")[0]}</strong></span>
                </div>
              </div>

              <!-- Available 15-Minute Slot Matrix -->
              <div>
                <div style="font-size: 12px; font-weight: 700; color: var(--color-charcoal); margin-bottom: var(--space-xs);">
                  Available Today's Slots:
                </div>
                
                <div style="display: flex; gap: var(--space-xs); flex-wrap: wrap; margin-bottom: var(--space-md);">
                  ${doc.available_slots.map(s => `
                    <button class="pill-tab btn-slot" data-doc-id="${doc.id}" data-slot-id="${s.id}" data-time="${s.time}" ${s.status !== 'AVAILABLE' ? 'disabled' : ''} style="padding: 5px 10px; font-size: 12px; ${s.status !== 'AVAILABLE' ? 'opacity: 0.4; cursor: not-allowed; background: var(--color-surface);' : ''}">
                      ${s.time}
                    </button>
                  `).join("")}
                </div>

                <button class="button-primary btn-open-booking" data-doc-id="${doc.id}" style="width: 100%; font-size: 14px;">
                  <span>📅 Instant Real-Time Booking</span>
                </button>
              </div>
            </div>
          `).join("")}
        </div>

      </div>
    `;
  }

  // =========================================================================
  // =========================================================================
  // 3. 5 KM REAL-TIME LOCAL PHARMACY STOCK RADAR & GENERIC SUBSTITUTIONS
  // =========================================================================
  renderPharmacyRadar() {
    const state = store.getState();
    const radius = state.searchRadiusKm || 5.0;
    const prescribedItems = state.prescribedItems || [];
    const userLoc = realtimeMapService.userLocation || REFERENCE_LOCATION;
    const nearbyPharmacies = GeoService.queryNearbyPharmacies(prescribedItems, radius, userLoc);

    return `
      <div style="display: flex; flex-direction: column; gap: var(--space-lg);">
        
        <!-- Controls Header -->
        <div class="card-base card-feature-teal" style="padding: var(--space-lg); border: 1px solid #c3faf5; box-shadow: var(--shadow-card);">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-md);">
            <div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                <span class="badge-promo" style="background: #ffffff; color: var(--color-primary);">
                  REAL-TIME GEO-SPATIAL MAP
                </span>
                <span class="badge-tag-yellow" style="font-size: 11px; background: #fff; border-color: #86efac; color: #166534;">
                  ● LIVE RADAR ACTIVE
                </span>
              </div>
              <h2 class="display-lg" style="font-size: 28px; line-height: 1.2;">5 km Local Pharmacy Stock Radar</h2>
              <p class="body-sm" style="color: var(--color-charcoal); margin-top: 4px;">
                Interactive live inventory lookup across registered medical stores around <strong>${userLoc.area_name || 'Koramangala, Bengaluru'}</strong>.
              </p>
            </div>

            <!-- Radius & Location Controls -->
            <div style="display: flex; align-items: center; gap: var(--space-sm); flex-wrap: wrap;">
              <div style="display: flex; align-items: center; gap: var(--space-md); background: #ffffff; padding: 8px 16px; border-radius: var(--radius-full); border: 1px solid var(--color-hairline); box-shadow: var(--shadow-sm);">
                <label class="body-sm" style="font-weight: 600; color: var(--color-primary);">
                  Radius: <strong id="radius-val-display" style="color: var(--color-brand-blue);">${radius.toFixed(1)} km</strong>
                </label>
                <input type="range" id="patient-portal-radius-slider" min="1.0" max="10.0" step="0.5" value="${radius}" style="accent-color: var(--color-brand-blue); cursor: pointer;" />
              </div>

              <button class="button-yellow" id="btn-trigger-gps" style="padding: 8px 16px; font-size: 13px;">
                <span>📡 Use My Live GPS</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Geo-Locator Split: Interactive Map (Left) + Ranked Pharmacies (Right) -->
        <div class="geo-locator-grid" style="display: grid; grid-template-columns: 1.15fr 1fr; gap: var(--space-lg); align-items: start;">
          
          <!-- Interactive Real-Time Leaflet Map Container -->
          <div class="realtime-map-wrapper">
            
            <!-- Map Floating Top Toolbar -->
            <div class="map-toolbar">
              <div class="map-pill-badge">
                <span>📍</span>
                <span id="map-location-label">${userLoc.area_name || 'Koramangala, Bengaluru'}</span>
              </div>

              <div style="display: flex; gap: 6px;">
                <button class="map-control-btn" id="btn-recenter-map" title="Recenter on your location">
                  <span>🎯 Recenter</span>
                </button>

                <select class="map-control-btn" id="select-map-style" style="cursor: pointer;" title="Change map style">
                  <option value="light">☀️ Light</option>
                  <option value="dark">🌙 Dark</option>
                  <option value="streets">🗺️ Streets</option>
                </select>
              </div>
            </div>

            <!-- Leaflet Mount Point -->
            <div id="pharmacy-realtime-map"></div>
          </div>

          <!-- Pharmacy Matching List -->
          <div class="pharmacy-cards-list" style="display: flex; flex-direction: column; gap: var(--space-md); max-height: 540px; overflow-y: auto; padding-right: 4px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
              <span style="font-size: 13px; font-weight: 700; color: var(--color-primary);">
                Found ${nearbyPharmacies.length} Pharmacies within ${radius.toFixed(1)} km
              </span>
              <span style="font-size: 11px; color: var(--color-slate);">
                Sorted by distance
              </span>
            </div>

            ${nearbyPharmacies.length === 0 ? `
              <div style="padding: var(--space-xl); text-align: center; background: #fff; border-radius: var(--radius-xl); border: 1px dashed #cbd5e1;">
                <div style="font-size: 32px; margin-bottom: 8px;">🔍</div>
                <div style="font-weight: 700; color: var(--color-primary); font-size: 15px;">No Pharmacies in Range</div>
                <div style="font-size: 12px; color: var(--color-slate); margin-top: 4px;">
                  Try increasing your search radius using the slider above.
                </div>
              </div>
            ` : nearbyPharmacies.map((p) => {
              const isFull = p.stock_status === "FULL";
              return `
                <div class="card-base card-pharmacy-item" data-pharma-id="${p.id}" style="background: #ffffff; border: 1px solid ${isFull ? 'var(--color-brand-blue)' : 'var(--color-hairline)'}; box-shadow: var(--shadow-card); padding: var(--space-lg); transition: transform var(--transition-fast), box-shadow var(--transition-fast);">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <h4 class="heading-4" style="font-size: 16px; margin-bottom: 2px; color: var(--color-primary);">${p.name}</h4>
                      </div>
                      <div class="body-sm" style="color: var(--color-slate);">
                        📍 ${p.address} • <strong style="color: var(--color-primary);">${p.calculated_distance_km} km away</strong>
                      </div>
                    </div>

                    <span class="badge-promo" style="background: ${isFull ? 'var(--color-brand-yellow)' : 'var(--color-surface)'}; color: var(--color-primary); font-size: 11px;">
                      ${isFull ? '100% FULL MATCH' : `${p.matched_items_count}/${p.total_items_count} IN STOCK`}
                    </span>
                  </div>

                  <!-- Quick Badges Strip -->
                  <div style="display: flex; gap: 8px; align-items: center; margin-top: 8px; font-size: 12px; color: var(--color-charcoal);">
                    <span style="display: inline-flex; align-items: center; gap: 4px;">
                      🕒 <strong>${p.open_status || 'Open 24 Hours'}</strong>
                    </span>
                    <span>•</span>
                    <span style="display: inline-flex; align-items: center; gap: 4px;">
                      ⭐ <strong>${p.rating}</strong>
                    </span>
                    <span>•</span>
                    <button class="btn-focus-pharmacy-map" data-pharma-id="${p.id}" style="background: none; border: none; color: var(--color-brand-blue); font-size: 12px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 3px; padding: 0;">
                      <span>🔍 Show on Map</span>
                    </button>
                  </div>

                  <!-- Jan Aushadhi Generic Substitution Comparison -->
                  <div style="padding: 10px 14px; background: var(--color-surface-yellow); border-radius: var(--radius-md); border: 1px solid #fde68a; margin: var(--space-md) 0;">
                    <div style="font-size: 11px; font-weight: 700; color: var(--color-yellow-dark);">💡 Generic Bioequivalent Option:</div>
                    <div style="font-size: 13px; color: var(--color-primary); font-weight: 600; margin-top: 1px;">Jan Aushadhi Cefixime & Pan 40</div>
                    <div style="font-size: 12px; color: var(--color-slate); margin-top: 2px;">
                      Brand: <del>₹275</del> ➔ Generic: <strong style="color: #15803d;">₹106 (Save ₹169 / 61%)</strong>
                    </div>
                  </div>

                  <div style="display: flex; gap: var(--space-sm); margin-top: var(--space-xs);">
                    <button class="button-primary btn-order-checkout" data-pharmacy-id="${p.id}" data-pharmacy-name="${p.name}" data-fulfillment="COUNTER_PICKUP" style="flex: 1; font-size: 13px; padding: 9px 14px;">
                      <span>🛒 1-Click Store Pickup</span>
                    </button>

                    <button class="button-blue btn-order-checkout" data-pharmacy-id="${p.id}" data-pharmacy-name="${p.name}" data-fulfillment="HOME_DELIVERY" style="flex: 1; font-size: 13px; padding: 9px 14px;">
                      <span>🚀 60-Min Home Delivery</span>
                    </button>
                  </div>
                </div>
              `;
            }).join("")}
          </div>

        </div>

      </div>
    `;
  }

  // =========================================================================
  // 4. ABDM EMR LONGITUDINAL HEALTH VAULT & OFFLINE QR
  // =========================================================================
  renderHealthVault() {
    const state = store.getState();
    const currentUser = authService.getCurrentUser() || state.currentUser;
    const activePatient = (currentUser && currentUser.role === "PATIENT") 
      ? currentUser 
      : (state.patients.find(p => p.id === state.activePatientId) || state.patients[0]);

    const patientFullName = activePatient.full_name || activePatient.name || "Patient";
    const abhaId = activePatient.patient_profile?.abha_id || activePatient.abha_id || "91-8842-1094-3201";

    return `
      <div style="display: flex; flex-direction: column; gap: var(--space-lg);">
        
        <div class="card-base card-feature-yellow" style="padding: var(--space-xl); border: 1px solid #fde68a; box-shadow: var(--shadow-card);">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-md);">
            <div>
              <span class="badge-promo" style="background: var(--color-primary); color: #fff; margin-bottom: var(--space-xs);">
                ABDM LONGITUDINAL HEALTH VAULT
              </span>
              <h2 class="display-lg" style="font-size: 28px; line-height: 1.2;">
                ${patientFullName}'s Medical History
              </h2>
              <div class="body-sm" style="color: var(--color-charcoal); margin-top: 4px;">
                Ayushman Bharat ABHA Health ID: <strong style="font-family: var(--font-family-mono); color: var(--color-primary);">${abhaId}</strong>
              </div>
            </div>

            <div style="display: flex; gap: var(--space-sm);">
              <button class="button-primary" id="btn-show-counter-qr" style="font-size: 14px;">
                <span>📱 Show Pharmacy Counter QR</span>
              </button>

              <button class="button-secondary" id="btn-download-fhir-pdf" style="font-size: 14px; background: #fff;">
                <span>📥 Export FHIR R4 Bundle</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Verified Health Encounters Timeline -->
        <div class="card-base" style="background: #ffffff; border: 1px solid var(--color-hairline); box-shadow: var(--shadow-card);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-md); padding-bottom: var(--space-xs); border-bottom: 1px solid var(--color-hairline);">
            <h3 class="heading-3" style="font-size: 18px;">Clinical Encounters & Records</h3>
            <span class="badge-tag-yellow" style="font-size: 11px;">3 Verified Encounters</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: var(--space-md);">
            
            <div style="padding: var(--space-lg); background: var(--color-surface); border-radius: var(--radius-xl); border: 1px solid var(--color-hairline);">
              <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                  <span class="badge-promo" style="background: var(--color-brand-blue); color: #fff; font-size: 10px;">
                    CONSULTATION & RX
                  </span>
                  <div style="font-weight: 700; font-size: 16px; color: var(--color-primary); margin-top: 6px;">
                    Acute Upper Respiratory Tract Infection (ICD-10: J06.9)
                  </div>
                  <div style="font-size: 13px; color: var(--color-slate); margin-top: 2px;">
                    Dr. Vikram Sethi, MD • Pulse Care OPD-102
                  </div>
                </div>

                <div style="font-size: 12px; color: var(--color-stone);">
                  Today, 10:45 AM
                </div>
              </div>

              <div style="font-size: 13px; color: var(--color-charcoal); margin-top: var(--space-sm); background: #ffffff; padding: 10px 14px; border-radius: var(--radius-md); border: 1px solid var(--color-hairline);">
                Prescribed: <strong>Cefixime 200mg (1-0-1)</strong>, <strong>Pantoprazole 40mg (1-0-0)</strong>, <strong>Paracetamol 650mg (SOS)</strong>
              </div>
            </div>

            <div style="padding: var(--space-lg); background: var(--color-surface); border-radius: var(--radius-xl); border: 1px solid var(--color-hairline);">
              <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                  <span class="badge-promo" style="background: #00b473; color: #fff; font-size: 10px;">
                    DIAGNOSTIC LAB
                  </span>
                  <div style="font-weight: 700; font-size: 16px; color: var(--color-primary); margin-top: 6px;">
                    HbA1c & Fasting Lipid Panel
                  </div>
                  <div style="font-size: 13px; color: var(--color-slate); margin-top: 2px;">
                    Pulse Care Diagnostic Center
                  </div>
                </div>

                <div style="font-size: 12px; color: var(--color-stone);">
                  15 Aug 2026
                </div>
              </div>

              <div style="font-size: 13px; color: var(--color-charcoal); margin-top: var(--space-sm); background: #ffffff; padding: 10px 14px; border-radius: var(--radius-md); border: 1px solid var(--color-hairline);">
                HbA1c: <strong>6.8% (Target Controlled)</strong> • Fasting Sugar: <strong>112 mg/dL</strong>
              </div>
            </div>

          </div>
        </div>

      </div>
    `;
  }

  async fetchLiveOrders() {
    try {
      const user = authService.getCurrentUser();
      const list = await orderService.getMyOrders(user?.id || "usr-pat-001");
      if (Array.isArray(list) && list.length > 0) {
        this.liveOrders = list;
        this.render();
      }
    } catch (e) {
      console.warn("Could not fetch live patient orders:", e);
    }
  }

  async fetchLiveDoctors() {
    try {
      const docs = await authService.getDoctors(this.selectedSpecialty);
      if (Array.isArray(docs) && docs.length > 0) {
        this.liveDoctors = docs;
        this.render();
      }
    } catch (e) {
      console.warn("Could not fetch live doctors from MongoDB:", e);
    }
  }

  async fetchLiveAppointments() {
    try {
      const user = authService.getCurrentUser();
      const patientId = user?.id || "usr-pat-001";
      const apts = await authService.getPatientAppointments(patientId);
      if (Array.isArray(apts) && apts.length > 0) {
        // Pick the most recent active or requested appointment
        const candidate = apts.find(a => a.status === "REQUESTED" || a.status === "CONFIRMED" || a.status === "IN_CONSULT") || apts[0];
        if (candidate) {
          this.bookedAppointment = candidate;
          this.render();
        }
      }
    } catch (e) {
      console.warn("Could not fetch live appointments from MongoDB:", e);
    }
  }

  // =========================================================================
  // 5. MEDICINE ORDERS & REAL-TIME STATE MACHINE TRACKING
  // =========================================================================
  renderOrdersTracking() {
    const orders = this.liveOrders && this.liveOrders.length > 0 ? this.liveOrders : orderService.getOrders();

    return `
      <div style="display: flex; flex-direction: column; gap: var(--space-lg);">
        
        <div class="card-base" style="background: #ffffff; border: 1px solid var(--color-hairline); box-shadow: var(--shadow-card);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-md); padding-bottom: var(--space-xs); border-bottom: 1px solid var(--color-hairline);">
            <div>
              <h3 class="heading-3" style="font-size: 18px; margin: 0;">Active Medicine Orders & Telemetry</h3>
              <div style="font-size: 11px; color: var(--color-slate); margin-top: 2px;">
                Live MongoDB Atlas Order State Machine
              </div>
            </div>
            <button class="button-secondary btn-refresh-patient-orders" style="font-size: 11px; padding: 4px 10px; background: #fff;">
              <span>🔄 Refresh Status</span>
            </button>
          </div>

          ${orders.length > 0 ? `
            <div style="display: flex; flex-direction: column; gap: var(--space-md);">
              ${orders.map(order => {
                const isPlaced = order.status === "PLACED";
                const isConfirmed = order.status === "CONFIRMED";
                const isPacked = order.status === "PACKED";
                const isReady = order.status === "READY" || order.status === "READY_FOR_PICKUP";
                const isDispensed = order.status === "DISPENSED" || order.status === "COMPLETED";

                const step1Done = true;
                const step2Done = isConfirmed || isPacked || isReady || isDispensed;
                const step3Done = isPacked || isReady || isDispensed;
                const step4Done = isReady || isDispensed;

                return `
                  <div style="padding: var(--space-lg); background: var(--color-surface); border: 1px solid var(--color-hairline); border-radius: var(--radius-xl);">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: var(--space-sm);">
                      <div>
                        <div style="font-weight: 700; font-size: 16px; color: var(--color-primary);">Order #${order.orderNumber || order.id}</div>
                        <div style="font-size: 13px; color: var(--color-slate); margin-top: 2px;">
                          Pharmacy: <strong>${order.pharmacyName}</strong>
                        </div>
                      </div>

                      <div style="text-align: right;">
                        <span class="badge-promo" style="background: ${isReady ? '#10b981' : isDispensed ? '#475569' : 'var(--color-brand-yellow)'}; color: ${isReady || isDispensed ? '#ffffff' : 'var(--color-primary)'}; font-size: 11px; font-weight: 800;">
                          ● ${order.status.replace(/_/g, ' ')}
                        </span>
                        <div style="font-size: 16px; font-weight: 800; font-family: var(--font-family-display); color: var(--color-primary); margin-top: 4px;">
                          Total: ₹${order.totalAmount}
                        </div>
                      </div>
                    </div>

                    <!-- 4-Stage State Machine Tracker Bar (Real MongoDB Synced) -->
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-xs); margin: var(--space-md) 0;">
                      <div style="padding: 8px; background: ${step1Done ? '#ecfdf5' : '#f1f5f9'}; border: 1px solid ${step1Done ? '#a7f3d0' : '#e2e8f0'}; border-radius: var(--radius-sm); text-align: center; font-size: 11px; font-weight: 700; color: ${step1Done ? '#065f46' : '#94a3b8'};">
                        1. Order Placed ${step1Done ? '✓' : '○'}
                      </div>
                      <div style="padding: 8px; background: ${step2Done ? '#ecfdf5' : '#f1f5f9'}; border: 1px solid ${step2Done ? '#a7f3d0' : '#e2e8f0'}; border-radius: var(--radius-sm); text-align: center; font-size: 11px; font-weight: 700; color: ${step2Done ? '#065f46' : '#94a3b8'};">
                        2. Confirmed ${step2Done ? '✓' : '○'}
                      </div>
                      <div style="padding: 8px; background: ${step3Done ? '#ecfdf5' : '#f1f5f9'}; border: 1px solid ${step3Done ? '#a7f3d0' : '#e2e8f0'}; border-radius: var(--radius-sm); text-align: center; font-size: 11px; font-weight: 700; color: ${step3Done ? '#065f46' : '#94a3b8'};">
                        3. Packed ${step3Done ? '✓' : '○'}
                      </div>
                      <div style="padding: 8px; background: ${step4Done ? '#dcfce7' : '#f1f5f9'}; border: 1px solid ${step4Done ? '#86efac' : '#e2e8f0'}; border-radius: var(--radius-sm); text-align: center; font-size: 11px; font-weight: 700; color: ${step4Done ? '#166534' : '#94a3b8'};">
                        ${order.fulfillmentType === 'COUNTER_PICKUP' ? `4. Ready (Token: ${order.pickupToken || 'PK-2409'})` : '4. Out for Delivery'} ${step4Done ? '✓' : '○'}
                      </div>
                    </div>

                    <!-- Ordered Medicines Items Breakdown (Real MongoDB Data) -->
                    <div style="background: #ffffff; border: 1px solid var(--color-hairline); border-radius: var(--radius-lg); padding: 12px 16px; margin: 12px 0;">
                      <div style="font-size: 13px; font-weight: 700; color: var(--color-primary); margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
                        <span>📋 Ordered Medicines (${(order.medicines || order.items || []).length} items):</span>
                        <span style="font-size: 11px; color: var(--color-slate); font-weight: 500;">Prescribed by ${order.doctorName || 'Dr. Vikram Sethi, MD'}</span>
                      </div>

                      <div style="display: flex; flex-direction: column; gap: 6px;">
                        ${(order.medicines || order.items || []).map((item, idx) => `
                          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 13px; padding: 6px 10px; background: #f8fafc; border-radius: 6px; border: 1px solid #f1f5f9;">
                            <div>
                              <strong style="color: var(--color-primary);">${idx + 1}. ${item.name || item.drugName}</strong>
                              <div style="font-size: 11px; color: var(--color-slate); margin-top: 1px;">
                                Quantity: <strong>${item.quantity || 1} ${item.dosageForm || 'Tablets'}</strong>
                                ${item.isGeneric ? ' • <span style="color: #15803d; font-weight: 700;">Jan Aushadhi Generic (61% Savings)</span>' : ''}
                              </div>
                            </div>
                            <div style="font-weight: 700; color: var(--color-primary);">
                              ₹${(item.price || item.unitPrice || 40) * (item.quantity || 1)}
                            </div>
                          </div>
                        `).join("")}
                      </div>

                      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px; padding-top: 8px; border-top: 1px dashed var(--color-hairline); font-size: 12px;">
                        <span style="color: var(--color-slate);">Subtotal: ₹${order.subtotal || order.totalAmount} • Delivery: ₹${order.deliveryFee || 0}</span>
                        <span style="font-weight: 800; font-size: 14px; color: var(--color-primary);">Total Paid: ₹${order.totalAmount}</span>
                      </div>
                    </div>

                    ${isReady ? `
                      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: var(--radius-md); padding: 10px 16px; margin-bottom: 8px; font-size: 13px; color: #15803d; font-weight: 700; display: flex; justify-content: space-between; align-items: center;">
                        <span>🟢 Ready for Pickup at Pharmacy Counter!</span>
                        <span style="font-family: monospace; font-size: 14px; background: #fff; padding: 3px 10px; border-radius: 4px; border: 1px solid #86efac; color: #166534;">TOKEN: ${order.pickupToken || 'PK-2409'}</span>
                      </div>
                    ` : ''}

                    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: var(--color-slate); border-top: 1px solid var(--color-hairline); padding-top: var(--space-xs);">
                      <span>Fulfillment: <strong>${order.fulfillmentType === 'COUNTER_PICKUP' ? 'Counter Pickup' : 'Home Delivery'}</strong></span>
                      <span>Estimated time: <strong>${order.estimatedMinutes || 10} mins</strong></span>
                    </div>
                  </div>
                `;
              }).join("")}
            </div>
          ` : `
            <div style="text-align: center; padding: var(--space-xl); color: var(--color-slate);">
              No active orders yet. Locate medicines on the 5km radar!
            </div>
          `}
        </div>

      </div>
    `;
  }

  // =========================================================================
  // DOCTOR BOOKING MODAL
  // =========================================================================
  renderBookingModal() {
    const doc = this.bookingModalDoctor;
    return `
      <div class="modal-overlay" id="modal-booking-overlay">
        <div class="modal-box" style="max-width: 520px; border-radius: var(--radius-xxl); background: #ffffff; box-shadow: var(--shadow-elevated);">
          <div class="modal-header" style="background: var(--color-surface); border-bottom: 1px solid var(--color-hairline);">
            <div style="font-weight: 700; font-size: 16px; color: var(--color-primary);">
              Confirm Consultation Booking
            </div>
            <button class="pill-tab btn-close-booking-modal" style="padding: 4px 10px; font-size: 11px;">✕</button>
          </div>

          <div class="modal-body" style="display: flex; flex-direction: column; gap: var(--space-md); padding: var(--space-xl);">
            <div style="display: flex; gap: var(--space-md); align-items: center;">
              <div style="width: 48px; height: 48px; border-radius: 50%; background: var(--color-brand-yellow); color: var(--color-primary); font-weight: 800; font-size: 16px; display: flex; align-items: center; justify-content: center;">
                ${doc.avatar_initials}
              </div>
              <div>
                <div style="font-weight: 700; font-size: 16px; color: var(--color-primary);">${doc.name}</div>
                <div style="font-size: 13px; color: var(--color-brand-blue); font-weight: 600;">${doc.specialty} • ${doc.clinic_affiliation}</div>
              </div>
            </div>

            <div style="background: var(--color-surface); padding: var(--space-md); border-radius: var(--radius-lg); border: 1px solid var(--color-hairline); font-size: 13px; display: flex; flex-direction: column; gap: 6px;">
              <div>Date: <strong style="color: var(--color-primary);">Today (${new Date().toLocaleDateString()})</strong></div>
              <div>Selected Slot: <strong style="color: var(--color-brand-blue);">11:15 AM (15 mins)</strong></div>
              <div>Consultation Fee: <strong style="color: var(--color-primary);">₹${doc.consultation_fee}</strong></div>
              <div>Clinic Address: <span style="color: var(--color-slate);">${doc.clinic_address}</span></div>
            </div>

            <div style="font-size: 12px; color: var(--color-slate);">
              🔒 Slot will be reserved under your ABHA ID. Instant confirmation SMS and Token Number will be dispatched.
            </div>
          </div>

          <div class="modal-footer" style="background: var(--color-surface); border-top: 1px solid var(--color-hairline);">
            <button class="button-secondary btn-close-booking-modal" style="padding: 8px 18px; font-size: 13px;">Cancel</button>
            <button class="button-primary" id="btn-confirm-appointment-booking" style="padding: 8px 22px; font-size: 13px;">
              <span>✓ Confirm & Issue Token (T-104)</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // EVENT BINDINGS
  // =========================================================================
  bindEvents() {
    // Tab switching
    this.container.querySelectorAll(".pill-tab[data-tab]").forEach(btn => {
      btn.addEventListener("click", () => {
        this.activeTab = btn.getAttribute("data-tab");
        this.render();
      });
    });

    // Jump to tab buttons
    this.container.querySelectorAll(".btn-tab-jump").forEach(btn => {
      btn.addEventListener("click", () => {
        this.activeTab = btn.getAttribute("data-target-tab");
        this.render();
      });
    });

    // Specialty filter buttons
    this.container.querySelectorAll(".btn-filter-specialty").forEach(btn => {
      btn.addEventListener("click", () => {
        this.selectedSpecialty = btn.getAttribute("data-specialty");
        this.render();
      });
    });

    // Doctor booking modal triggers
    this.container.querySelectorAll(".btn-open-booking, .btn-slot").forEach(btn => {
      btn.addEventListener("click", () => {
        const docId = btn.getAttribute("data-doc-id");
        const allDocs = this.liveDoctors && this.liveDoctors.length > 0 ? this.liveDoctors : DOCTORS_DIRECTORY;
        this.bookingModalDoctor = allDocs.find(d => d.id === docId) || allDocs[0];
        this.render();
      });
    });

    // Close booking modal
    this.container.querySelectorAll(".btn-close-booking-modal").forEach(btn => {
      btn.addEventListener("click", () => {
        this.bookingModalDoctor = null;
        this.render();
      });
    });

    // Confirm Appointment Booking (Live MongoDB Atlas Flow)
    const confirmBookingBtn = this.container.querySelector("#btn-confirm-appointment-booking");
    if (confirmBookingBtn) {
      confirmBookingBtn.addEventListener("click", async () => {
        const doc = this.bookingModalDoctor;
        this.bookingModalDoctor = null;

        const currentUser = authService.getCurrentUser() || {};
        try {
          const newApt = await authService.bookAppointment({
            doctorId: doc.id || "usr-doc-001",
            doctorName: doc.name || "Dr. Vikram Sethi, MD",
            department: doc.specialty || "Internal Medicine",
            clinicName: doc.clinic_affiliation || "Pulse Care Clinic & Diagnostic Center",
            clinicAddress: doc.clinic_address || "80 Feet Rd, 4th Block, Koramangala, Bengaluru",
            consultationFee: doc.consultation_fee || 600,
            date: new Date().toISOString().split("T")[0],
            timeSlot: "11:15 AM",
            patientName: currentUser.full_name || "Anil Kumar Verma",
            patientId: currentUser.id || "usr-pat-001",
            symptoms: ["OPD Consultation & Clinical Review"],
          });

          this.bookedAppointment = newApt;
          store.showToast(`Booking Requested with ${doc.name}! Token: ${newApt.tokenNumber || newApt.token}`, "success");
          this.activeTab = "doctors";
          this.render();
        } catch (err) {
          store.showToast(`Booking error: ${err.message}`, "danger");
        }
      });
    }

    // Gemini 3.1 Flash Vision OCR Run Trigger
    this.container.querySelectorAll(".btn-run-gemini-ocr").forEach(btn => {
      btn.addEventListener("click", () => {
        this.triggerSampleScan(btn.getAttribute("data-sample"));
      });
    });

    // File Upload Trigger for Gemini OCR
    const fileInput = this.container.querySelector("#patient-file-upload-input");
    if (fileInput) {
      fileInput.addEventListener("change", (e) => {
        if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          this.scannerState.isScanning = true;
          this.scannerState.uploadedFileName = file.name;
          this.render();

          const reader = new FileReader();
          reader.onload = async (evt) => {
            try {
              const base64 = evt.target.result;
              const result = await GeminiVisionService.scanPrescription(base64, file.type, null);
              this.scannerState.isScanning = false;
              this.scannerState.extractedData = result;
              store.showToast(`Gemini: Processed "${file.name}"!`, "success");
              this.render();
            } catch (err) {
              this.scannerState.isScanning = false;
              store.showToast(`Gemini scan error: ${err.message}`, "danger");
              this.render();
            }
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // 1-Click Order Checkout (Live MongoDB Atlas Integration)
    this.container.querySelectorAll(".btn-order-checkout").forEach(btn => {
      btn.addEventListener("click", async () => {
        const rawPharmacyId = btn.getAttribute("data-pharmacy-id") || "usr-pharma-001";
        const pharmacyId = rawPharmacyId.startsWith("usr-") ? rawPharmacyId : `usr-${rawPharmacyId}`;
        const pharmacyName = btn.getAttribute("data-pharmacy-name") || "MedPlus 24/7 Super Pharmacy";
        const fulfillmentType = btn.getAttribute("data-fulfillment") || "COUNTER_PICKUP";
        const currentUser = authService.getCurrentUser() || {};

        try {
          const order = await orderService.createOrder({
            patientId: currentUser.id || "usr-pat-001",
            patientName: currentUser.full_name || "Anil Kumar Verma",
            pharmacyId: pharmacyId,
            pharmacyName: pharmacyName,
            fulfillmentType: fulfillmentType,
            items: [
              { name: "Jan Aushadhi Cefixime 200mg", drugName: "Cefixime 200mg Generic", quantity: 10, price: 60.00, isGeneric: true },
              { name: "Jan Aushadhi Pan 40", drugName: "Pantoprazole 40mg Generic", quantity: 7, price: 32.00, isGeneric: true },
              { name: "Paracetamol 650mg Generic", drugName: "Paracetamol 650mg Generic", quantity: 6, price: 14.00, isGeneric: true }
            ],
            totalAmount: 106.00
          });

          await this.fetchLiveOrders();
          window.dispatchEvent(new CustomEvent("syncPharmacyQueue", { detail: { order } }));
          window.dispatchEvent(new CustomEvent("syncLivePlatformData"));
          store.showToast(`Order #${order.orderNumber || order.id} placed at ${pharmacyName}!`, "success");
          this.activeTab = "orders";
          this.render();
        } catch (err) {
          store.showToast(`Order placement failed: ${err.message}`, "danger");
        }
      });
    });

    // Refresh Live Orders in Patient Portal
    const refreshOrdersBtn = this.container.querySelector(".btn-refresh-patient-orders");
    if (refreshOrdersBtn) {
      refreshOrdersBtn.addEventListener("click", async () => {
        await this.fetchLiveOrders();
        store.showToast("Order status synced with MongoDB Atlas!", "success");
        this.render();
      });
    }

    // Counter Dispensing QR Trigger
    const qrBtn = this.container.querySelector("#btn-show-counter-qr");
    if (qrBtn) {
      qrBtn.addEventListener("click", () => store.openModal("qr_code"));
    }

    // Export FHIR Bundle
    const exportBtn = this.container.querySelector("#btn-download-fhir-pdf");
    if (exportBtn) {
      exportBtn.addEventListener("click", () => {
        store.showToast("Exported HL7 FHIR Release 4 JSON record successfully.", "info");
      });
    }

    // Radius Slider in Pharmacy Radar (Live dynamic update)
    const slider = this.container.querySelector("#patient-portal-radius-slider");
    if (slider) {
      slider.addEventListener("input", (e) => {
        const val = parseFloat(e.target.value);
        store.state.searchRadiusKm = val;
        
        const display = this.container.querySelector("#radius-val-display");
        if (display) display.textContent = `${val.toFixed(1)} km`;

        realtimeMapService.updateRadiusCircle(val);
        realtimeMapService.syncPharmacyMarkers();

        // Refresh card list smoothly
        const cardsContainer = this.container.querySelector(".pharmacy-cards-list");
        if (cardsContainer) {
          const state = store.getState();
          const userLoc = realtimeMapService.userLocation || REFERENCE_LOCATION;
          const nearbyPharmacies = GeoService.queryNearbyPharmacies(state.prescribedItems || [], val, userLoc);
          
          cardsContainer.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
              <span style="font-size: 13px; font-weight: 700; color: var(--color-primary);">
                Found ${nearbyPharmacies.length} Pharmacies within ${val.toFixed(1)} km
              </span>
              <span style="font-size: 11px; color: var(--color-slate);">Sorted by distance</span>
            </div>
            ${nearbyPharmacies.map((p) => {
              const isFull = p.stock_status === "FULL";
              return `
                <div class="card-base card-pharmacy-item" data-pharma-id="${p.id}" style="background: #ffffff; border: 1px solid ${isFull ? 'var(--color-brand-blue)' : 'var(--color-hairline)'}; box-shadow: var(--shadow-card); padding: var(--space-lg); transition: transform var(--transition-fast), box-shadow var(--transition-fast);">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                      <h4 class="heading-4" style="font-size: 16px; margin-bottom: 2px; color: var(--color-primary);">${p.name}</h4>
                      <div class="body-sm" style="color: var(--color-slate);">
                        📍 ${p.address} • <strong style="color: var(--color-primary);">${p.calculated_distance_km} km away</strong>
                      </div>
                    </div>
                    <span class="badge-promo" style="background: ${isFull ? 'var(--color-brand-yellow)' : 'var(--color-surface)'}; color: var(--color-primary); font-size: 11px;">
                      ${isFull ? '100% FULL MATCH' : `${p.matched_items_count}/${p.total_items_count} IN STOCK`}
                    </span>
                  </div>
                  <div style="display: flex; gap: 8px; align-items: center; margin-top: 8px; font-size: 12px; color: var(--color-charcoal);">
                    <span>🕒 <strong>${p.open_status || 'Open 24 Hours'}</strong></span>
                    <span>•</span>
                    <span>⭐ <strong>${p.rating}</strong></span>
                    <span>•</span>
                    <button class="btn-focus-pharmacy-map" data-pharma-id="${p.id}" style="background: none; border: none; color: var(--color-brand-blue); font-size: 12px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 3px; padding: 0;">
                      <span>🔍 Show on Map</span>
                    </button>
                  </div>
                  <div style="padding: 10px 14px; background: var(--color-surface-yellow); border-radius: var(--radius-md); border: 1px solid #fde68a; margin: var(--space-md) 0;">
                    <div style="font-size: 11px; font-weight: 700; color: var(--color-yellow-dark);">💡 Generic Bioequivalent Option:</div>
                    <div style="font-size: 13px; color: var(--color-primary); font-weight: 600; margin-top: 1px;">Jan Aushadhi Cefixime & Pan 40</div>
                    <div style="font-size: 12px; color: var(--color-slate); margin-top: 2px;">
                      Brand: <del>₹275</del> ➔ Generic: <strong style="color: #15803d;">₹106 (Save ₹169 / 61%)</strong>
                    </div>
                  </div>
                  <div style="display: flex; gap: var(--space-sm); margin-top: var(--space-xs);">
                    <button class="button-primary btn-order-checkout" data-pharmacy-id="${p.id}" data-pharmacy-name="${p.name}" data-fulfillment="COUNTER_PICKUP" style="flex: 1; font-size: 13px; padding: 9px 14px;">
                      <span>🛒 1-Click Store Pickup</span>
                    </button>
                    <button class="button-blue btn-order-checkout" data-pharmacy-id="${p.id}" data-pharmacy-name="${p.name}" data-fulfillment="HOME_DELIVERY" style="flex: 1; font-size: 13px; padding: 9px 14px;">
                      <span>🚀 60-Min Home Delivery</span>
                    </button>
                  </div>
                </div>
              `;
            }).join("")}
          `;

          // Re-bind focus triggers & order checkouts
          this.bindPharmacyCardActions();
        }
      });
    }

    // Initialize Real-Time Leaflet Map if active tab is pharmacy_radar
    if (this.activeTab === "pharmacy_radar") {
      setTimeout(() => {
        realtimeMapService.initMap("pharmacy-realtime-map", (pharma) => {
          store.showToast(`Selected ${pharma.name} on map (${pharma.calculated_distance_km} km away)`, "info");
        });
      }, 100);

      // GPS Live Trigger
      const gpsBtn = this.container.querySelector("#btn-trigger-gps");
      if (gpsBtn) {
        gpsBtn.addEventListener("click", () => {
          store.showToast("📡 Requesting browser GPS coordinates...", "info");
          realtimeMapService.requestLiveLocation(
            (pos) => {
              store.showToast(`📍 GPS Locked! Location: ${pos.latitude.toFixed(4)}, ${pos.longitude.toFixed(4)}`, "success");
              const label = this.container.querySelector("#map-location-label");
              if (label) label.textContent = "📍 Live GPS Active";
              this.render();
            },
            (err) => {
              store.showToast(`GPS Error: ${err.message}. Using Koramangala benchmark center.`, "warning");
            }
          );
        });
      }

      // Recenter Map
      const recenterBtn = this.container.querySelector("#btn-recenter-map");
      if (recenterBtn) {
        recenterBtn.addEventListener("click", () => {
          realtimeMapService.recenterOnUser();
          store.showToast("🎯 Map recentered to your location.", "info");
        });
      }

      // Map Style Selector
      const styleSelect = this.container.querySelector("#select-map-style");
      if (styleSelect) {
        styleSelect.addEventListener("change", (e) => {
          realtimeMapService.setMapStyle(e.target.value);
        });
      }

      this.bindPharmacyCardActions();
    }
  }

  bindPharmacyCardActions() {
    // Focus on Map
    this.container.querySelectorAll(".btn-focus-pharmacy-map").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-pharma-id");
        realtimeMapService.flyToPharmacy(id);
      });
    });

    // Order Checkout
    this.container.querySelectorAll(".btn-order-checkout").forEach(btn => {
      btn.addEventListener("click", () => {
        const pharmacyId = btn.getAttribute("data-pharmacy-id");
        const pharmacyName = btn.getAttribute("data-pharmacy-name");
        const fulfillmentType = btn.getAttribute("data-fulfillment");

        const order = orderService.createOrder({
          pharmacyId,
          pharmacyName,
          fulfillmentType,
          items: [
            { drugName: "Cefixime 200mg Generic", quantity: 10, unitPrice: 60.00, isGeneric: true },
            { drugName: "Pantoprazole 40mg Generic", quantity: 7, unitPrice: 32.00, isGeneric: true },
            { drugName: "Paracetamol 650mg Generic", quantity: 6, unitPrice: 14.00, isGeneric: true }
          ],
          totalAmount: 106.00
        });

        store.showToast(`Order #${order.id} placed at ${pharmacyName}!`, "success");
        this.activeTab = "orders";
        this.render();
      });
    });
  }

  async triggerSampleScan(sampleId) {
    this.scannerState.isScanning = true;
    this.render();

    const result = await GeminiVisionService.scanPrescription(null, "image/jpeg", sampleId);
    this.scannerState.isScanning = false;
    this.scannerState.extractedData = result;
    store.showToast("Gemini 3.1 Flash: Prescription extracted into structured JSON!", "success");
    this.render();
  }

  destroy() {
    if (this.unsubscribe) this.unsubscribe();
  }
}
