/**
 * NEXORA PULSE - PENDING VERIFICATION STATUS VIEW
 * State-machine tracking screen for Doctors & Pharmacies pending credentials review
 */

import { authService } from "../services/authService.js";
import { store } from "../state/store.js";

export class PendingVerificationViewComponent {
  constructor(container, onApproved = null) {
    this.container = container;
    this.onApproved = onApproved;
  }

  render() {
    const user = authService.getCurrentUser();
    if (!user) return;

    const isDoctor = user.role === "DOCTOR";
    const profile = isDoctor ? user.doctor_profile : user.pharmacy_profile;

    this.container.innerHTML = `
      <div style="max-width: 800px; margin: var(--space-6) auto;" role="region" aria-label="Credentials Verification Status">
        
        <!-- Main Verification Card -->
        <div class="panel" style="border: 2px solid var(--amber-warn); box-shadow: var(--shadow-lg); text-align: center; padding: var(--space-8);">
          
          <div class="brand-logo-icon animate-pulse" style="width: 72px; height: 72px; font-size: 2.2rem; margin: 0 auto var(--space-4) auto; background: var(--amber-warn); color: #000; box-shadow: 0 0 30px rgba(245, 158, 11, 0.4);">
            ⏱️
          </div>

          <span class="badge-promo" style="background: var(--amber-bg); border: 1px solid var(--amber-warn); color: var(--amber-light); margin-bottom: var(--space-3);">
            ● STATUS: PENDING REGISTRATION VERIFICATION
          </span>

          <h1 style="font-size: var(--text-3xl); font-weight: 800; color: #fff; margin-bottom: var(--space-2);">
            Welcome, ${user.full_name}
          </h1>

          <p style="font-size: var(--text-sm); color: var(--text-secondary); max-width: 580px; margin: 0 auto var(--space-6) auto; line-height: 1.6;">
            Under HIPAA & National Medical Commission / Drugs and Cosmetics Act compliance, clinical prescribing and retail dispensing rights require mandatory credential validation before full portal access.
          </p>

          <!-- 3-Step Verification Timeline -->
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-4); margin-bottom: var(--space-6); text-align: left;">
            
            <div style="padding: var(--space-4); background: var(--bg-primary); border-radius: var(--radius-md); border-left: 4px solid var(--emerald-safe);">
              <div style="font-size: var(--text-xs); color: var(--emerald-light); font-weight: 700;">Step 1: Completed</div>
              <div style="font-weight: 700; color: #fff; font-size: var(--text-sm); margin-top: 2px;">Application Ingested</div>
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">Credentials encrypted and hashed via SHA-256</div>
            </div>

            <div style="padding: var(--space-4); background: var(--bg-primary); border-radius: var(--radius-md); border-left: 4px solid var(--amber-warn);">
              <div style="font-size: var(--text-xs); color: var(--amber-light); font-weight: 700;">Step 2: In Progress</div>
              <div style="font-weight: 700; color: #fff; font-size: var(--text-sm); margin-top: 2px;">
                ${isDoctor ? 'State Council Lookup' : 'Drug Controller Check'}
              </div>
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">
                ${isDoctor ? `Validating ${profile.mrn} on ${profile.state_council}` : `Validating DLN ${profile.dln}`}
              </div>
            </div>

            <div style="padding: var(--space-4); background: var(--bg-primary); border-radius: var(--radius-md); border-left: 4px solid var(--border-medium);">
              <div style="font-size: var(--text-xs); color: var(--text-muted); font-weight: 700;">Step 3: Queued</div>
              <div style="font-weight: 700; color: #fff; font-size: var(--text-sm); margin-top: 2px;">Admin Sign-Off</div>
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">Issuance of signed clinical JWT token</div>
            </div>

          </div>

          <!-- Submitted Credentials Details -->
          <div style="background: var(--bg-surface-elevated); padding: var(--space-4); border-radius: var(--radius-md); border: 1px solid var(--border-subtle); margin-bottom: var(--space-6); text-align: left; font-size: var(--text-xs);">
            <div style="font-weight: 700; color: #fff; margin-bottom: var(--space-2); font-size: var(--text-sm);">
              📋 Submitted Profile Summary:
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-2);">
              <div><span style="color: var(--text-muted);">Email:</span> <strong style="color: #fff;">${user.email}</strong></div>
              <div><span style="color: var(--text-muted);">Phone:</span> <strong style="color: #fff;">${user.phone}</strong></div>
              ${isDoctor ? `
                <div><span style="color: var(--text-muted);">MRN Number:</span> <strong style="color: var(--pulse-cyan-light); font-family: var(--font-mono);">${profile.mrn}</strong></div>
                <div><span style="color: var(--text-muted);">Council:</span> <strong style="color: #fff;">${profile.state_council}</strong></div>
                <div><span style="color: var(--text-muted);">Specialization:</span> <strong style="color: #fff;">${profile.specialization} (${profile.experience_years}y exp)</strong></div>
                <div><span style="color: var(--text-muted);">Affiliation:</span> <strong style="color: #fff;">${profile.clinic_affiliation}</strong></div>
              ` : `
                <div><span style="color: var(--text-muted);">Drug License (DLN):</span> <strong style="color: var(--emerald-light); font-family: var(--font-mono);">${profile.dln}</strong></div>
                <div><span style="color: var(--text-muted);">Store Address:</span> <strong style="color: #fff;">${profile.address} (Pincode: ${profile.pincode})</strong></div>
              `}
            </div>
          </div>

          <!-- Fast-Track Demo Admin Simulator -->
          <div style="display: flex; gap: var(--space-3); justify-content: center; flex-wrap: wrap;">
            <button class="btn btn-emerald" id="btn-fast-track-approve" style="padding: var(--space-3) var(--space-6); font-size: var(--text-sm);">
              <span>⚡ Simulate Instant Admin Approval (Demo Fast-Track)</span>
            </button>

            <button class="btn btn-secondary" id="btn-pending-logout" style="font-size: var(--text-sm);">
              <span>Log Out</span>
            </button>
          </div>

        </div>

      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const fastTrackBtn = this.container.querySelector("#btn-fast-track-approve");
    if (fastTrackBtn) {
      fastTrackBtn.addEventListener("click", () => {
        const user = authService.getCurrentUser();
        if (user) {
          authService.adminVerifyUser(user.id, true);
          store.showToast(`Credentials approved! Access granted to ${user.role} portal.`, "success");
          if (typeof this.onApproved === "function") {
            this.onApproved(user);
          }
        }
      });
    }

    const logoutBtn = this.container.querySelector("#btn-pending-logout");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        store.logout();
      });
    }
  }
}
