/**
 * NEXORA PULSE - UNIFIED CLINICAL APP HEADER & SESSION HUD
 */

import { store } from "../state/store.js";
import { authService } from "../services/authService.js";

export class HeaderComponent {
  constructor(container) {
    this.container = container;
    this.unsubscribe = store.subscribe(() => this.render());
  }

  render() {
    const state = store.getState();
    const activeRole = state.activeRole;
    const currentUser = authService.getCurrentUser() || state.currentUser;

    const isDoctor = currentUser?.role === "DOCTOR";
    const isPharma = currentUser?.role === "PHARMACY";
    const isPatient = currentUser?.role === "PATIENT";
    const isAdmin = currentUser?.role === "ADMIN";
    const isPending = currentUser?.verificationStatus === "PENDING_VERIFICATION";

    this.container.innerHTML = `
      <header class="app-header" role="banner">
        
        <!-- Brand Section -->
        <div class="brand-section">
          <div class="brand-logo-icon" aria-hidden="true" style="background: linear-gradient(135deg, var(--pulse-cyan), var(--indigo-accent));">
            ⚡
          </div>
          <div class="brand-title-wrap">
            <div class="brand-name">
              NEXORA PULSE
              <span class="brand-badge">${isPending ? 'VERIFICATION PENDING' : 'GATEWAY ACTIVE'}</span>
            </div>
            <span class="brand-subtitle">Authentication & Role Operating System</span>
          </div>
        </div>

        <!-- Role Navigation Switcher (Filtered by permissions) -->
        <nav class="role-nav" aria-label="Workstation View Navigation">
          ${(isDoctor || isAdmin) && !isPending ? `
            <button class="role-tab-btn doctor-tab ${activeRole === 'doctor' ? 'active' : ''}" data-role="doctor">
              <span>👨‍⚕️</span>
              <span>Doctor Quick-Rx</span>
            </button>
          ` : ''}

          ${(isPharma || isAdmin) && !isPending ? `
            <button class="role-tab-btn pharma-tab ${activeRole === 'pharmacist' ? 'active' : ''}" data-role="pharmacist">
              <span>💊</span>
              <span>Pharmacy POS & OCR</span>
            </button>
          ` : ''}

          ${(isPatient || isAdmin) ? `
            <button class="role-tab-btn patient-tab ${activeRole === 'patient' ? 'active' : ''}" data-role="patient">
              <span>📱</span>
              <span>Patient Vault & 5km Stock</span>
            </button>
          ` : ''}

          <button class="role-tab-btn ai-tab ${activeRole === 'ai' ? 'active' : ''}" data-role="ai">
            <span>🤖</span>
            <span>Vernacular AI</span>
          </button>

          <button class="role-tab-btn ${activeRole === 'queue' ? 'active' : ''}" data-role="queue">
            <span>⏱️</span>
            <span>OPD Queue</span>
          </button>

          ${isAdmin ? `
            <button class="role-tab-btn ${activeRole === 'admin' ? 'active' : ''}" data-role="admin" style="border-color: var(--purple-accent); color: #D8B4FE;">
              <span>🛡️</span>
              <span>Admin Verification</span>
            </button>
          ` : ''}

          ${isPending ? `
            <button class="role-tab-btn ${activeRole === 'pending' ? 'active' : ''}" data-role="pending" style="border-color: var(--amber-warn); color: var(--amber-light);">
              <span>⏱️</span>
              <span>Verification Status</span>
            </button>
          ` : ''}
        </nav>

        <!-- Active User Session Badge & Switcher -->
        <div class="header-telemetry">
          
          <div class="user-session-chip">
            <div class="telemetry-dot" style="background: ${isPending ? 'var(--amber-warn)' : 'var(--emerald-safe)'}; box-shadow: 0 0 8px ${isPending ? 'var(--amber-warn)' : 'var(--emerald-safe)'};"></div>
            <div style="text-align: left;">
              <div style="font-weight: 700; font-size: 11px; color: #fff;">
                ${currentUser ? currentUser.full_name : 'Guest Session'}
              </div>
              <div style="font-size: 10px; color: ${isPending ? 'var(--amber-light)' : 'var(--pulse-cyan-light)'};">
                ${currentUser ? `${currentUser.role} (${currentUser.verificationStatus})` : 'Unauthenticated'}
              </div>
            </div>
          </div>

          <!-- Auth Gateway Trigger Modal Button -->
          <button class="btn btn-secondary" id="btn-open-auth-gateway" style="padding: 4px 10px; font-size: var(--text-xs);">
            <span>🔄 Switch User / Auth</span>
          </button>

          <button class="btn btn-danger" id="btn-header-logout" style="padding: 4px 8px; font-size: var(--text-xs);" title="Sign out of session">
            <span>⏻</span>
          </button>

        </div>

      </header>
    `;

    this.bindEvents();
  }

  bindEvents() {
    this.container.querySelectorAll(".role-tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const role = btn.getAttribute("data-role");
        store.setRole(role);
      });
    });

    const authBtn = this.container.querySelector("#btn-open-auth-gateway");
    if (authBtn) {
      authBtn.addEventListener("click", () => {
        store.openModal("auth_gateway");
      });
    }

    const logoutBtn = this.container.querySelector("#btn-header-logout");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        store.logout();
      });
    }
  }

  destroy() {
    if (this.unsubscribe) this.unsubscribe();
  }
}
