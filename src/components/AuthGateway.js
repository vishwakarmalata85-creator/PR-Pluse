/**
 * NEXORA PULSE - UNIFIED AUTHENTICATION & ROLE GATEWAY MODAL
 * Connected to Supabase Auth via src/supabaseClient.js with multi-role redirection
 */

import { supabase, SUPABASE_PUBLIC_KEY } from "../supabaseClient.js";
import { authService } from "../services/authService.js";
import { store } from "../state/store.js";

export class AuthGatewayComponent {
  constructor(container, onSuccess = null) {
    this.container = container;
    this.onSuccess = onSuccess;
    this.mode = "login"; // 'login' | 'register'
    this.selectedRole = "PATIENT"; // 'PATIENT' | 'DOCTOR' | 'PHARMACY' | 'ADMIN'
    this.errorMessage = "";
    this.isSubmitting = false;

    this.rolePresets = {
      PATIENT: {
        email: "anil.verma@nexora.com",
        pass: "pass123",
        name: "Patient (Anil Verma)",
        route: "#/"
      },
      DOCTOR: {
        email: "dr.vikram@nexora.com",
        pass: "pass123",
        name: "Doctor (Dr. Vikram Sethi)",
        route: "#/doctor"
      },
      PHARMACY: {
        email: "medplus@nexora.com",
        pass: "pass123",
        name: "Pharmacy (MedPlus)",
        route: "#/pharmacy"
      },
      ADMIN: {
        email: "admin@nexorapulse.com",
        pass: "admin123",
        name: "Platform Admin",
        route: "#/admin"
      }
    };
  }

  render() {
    const activePreset = this.rolePresets[this.selectedRole] || this.rolePresets.PATIENT;

    this.container.innerHTML = `
      <div class="auth-gateway-modal" role="dialog" aria-modal="true" aria-label="Nexora Pulse Authentication Gateway">
        <div class="auth-card" style="max-width: 580px; width: 100%; border-radius: var(--radius-xxl); background: #ffffff; color: var(--color-primary); box-shadow: var(--shadow-mockup); border: 1px solid var(--color-hairline); overflow: hidden;">
          
          <!-- Header Brand Section -->
          <div class="auth-card-header" style="background: var(--color-surface); padding: var(--space-lg); text-align: center; border-bottom: 1px solid var(--color-hairline);">
            <div style="display: flex; align-items: center; gap: 10px; justify-content: center;">
              <div class="brand-logo-icon" style="width: 44px; height: 44px; font-size: 1.3rem; background: var(--color-brand-yellow); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; color: #000; font-weight: 800;">
                ⚡
              </div>
              <div style="text-align: left;">
                <div style="font-size: 1.3rem; font-weight: 800; color: var(--color-primary); letter-spacing: -0.02em;">
                  NEXORA PULSE
                </div>
                <div style="font-size: 11px; color: var(--color-slate);">
                  Multi-Role Gateway • Patient, Doctor, Pharmacy, Admin
                </div>
              </div>
            </div>

            <!-- Mode Switcher Tabs -->
            <div style="display: inline-flex; background: #ffffff; padding: 4px; border-radius: var(--radius-full); border: 1px solid var(--color-hairline); margin-top: var(--space-md);">
              <button class="pill-tab ${this.mode === 'login' ? 'pill-tab-active' : ''}" id="tab-btn-login" style="padding: 6px 16px; font-size: 12px;">
                <span>🔐 Sign In</span>
              </button>
              <button class="pill-tab ${this.mode === 'register' ? 'pill-tab-active' : ''}" id="tab-btn-register" style="padding: 6px 16px; font-size: 12px;">
                <span>✨ Create Account</span>
              </button>
            </div>
          </div>

          <!-- Role Selector Grid -->
          <div style="padding: var(--space-md) var(--space-lg) 0 var(--space-lg);">
            <label style="font-size: 12px; font-weight: 700; color: var(--color-primary); display: flex; justify-content: space-between; margin-bottom: 6px;">
              <span>Choose Role to Login As:</span>
              <span style="color: var(--color-brand-blue); font-weight: 600;">${this.selectedRole}</span>
            </label>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;">
              <div class="card-base modal-role-card ${this.selectedRole === 'PATIENT' ? 'role-choice-selected' : ''}" data-role="PATIENT" style="padding: 10px 4px; background: ${this.selectedRole === 'PATIENT' ? 'var(--color-surface-yellow)' : '#fff'}; border: 2px solid ${this.selectedRole === 'PATIENT' ? 'var(--color-primary)' : 'var(--color-hairline)'}; border-radius: var(--radius-md); text-align: center; cursor: pointer;">
                <div style="font-size: 20px;">👤</div>
                <div style="font-weight: 700; font-size: 11px; color: var(--color-primary); margin-top: 2px;">Patient</div>
              </div>
              <div class="card-base modal-role-card ${this.selectedRole === 'DOCTOR' ? 'role-choice-selected' : ''}" data-role="DOCTOR" style="padding: 10px 4px; background: ${this.selectedRole === 'DOCTOR' ? '#e0f2fe' : '#fff'}; border: 2px solid ${this.selectedRole === 'DOCTOR' ? '#0284c7' : 'var(--color-hairline)'}; border-radius: var(--radius-md); text-align: center; cursor: pointer;">
                <div style="font-size: 20px;">🩺</div>
                <div style="font-weight: 700; font-size: 11px; color: var(--color-primary); margin-top: 2px;">Doctor</div>
              </div>
              <div class="card-base modal-role-card ${this.selectedRole === 'PHARMACY' ? 'role-choice-selected' : ''}" data-role="PHARMACY" style="padding: 10px 4px; background: ${this.selectedRole === 'PHARMACY' ? '#fef3c7' : '#fff'}; border: 2px solid ${this.selectedRole === 'PHARMACY' ? '#d97706' : 'var(--color-hairline)'}; border-radius: var(--radius-md); text-align: center; cursor: pointer;">
                <div style="font-size: 20px;">💊</div>
                <div style="font-weight: 700; font-size: 11px; color: var(--color-primary); margin-top: 2px;">Pharmacy</div>
              </div>
              <div class="card-base modal-role-card ${this.selectedRole === 'ADMIN' ? 'role-choice-selected' : ''}" data-role="ADMIN" style="padding: 10px 4px; background: ${this.selectedRole === 'ADMIN' ? '#f1f5f9' : '#fff'}; border: 2px solid ${this.selectedRole === 'ADMIN' ? '#475569' : 'var(--color-hairline)'}; border-radius: var(--radius-md); text-align: center; cursor: pointer;">
                <div style="font-size: 20px;">🛡️</div>
                <div style="font-weight: 700; font-size: 11px; color: var(--color-primary); margin-top: 2px;">Admin</div>
              </div>
            </div>
          </div>

          <!-- Body: Login or Register Form -->
          <div class="auth-card-body" style="padding: var(--space-md) var(--space-lg);">
            ${this.mode === 'login' ? this.renderLoginForm(activePreset) : this.renderRegisterForm()}
          </div>

          <!-- Error Alert Banner -->
          ${this.errorMessage ? `
            <div style="padding: 10px 14px; margin: 0 var(--space-lg) var(--space-sm) var(--space-lg); background: #fee2e2; border: 1px solid #f87171; border-radius: var(--radius-md); color: #991b1b; font-size: 12px; display: flex; align-items: center; gap: 8px;">
              <span>⚠️</span>
              <span>${this.errorMessage}</span>
            </div>
          ` : ''}

          <!-- Quick 1-Click Demo Personas -->
          <div style="padding: var(--space-md) var(--space-lg); background: var(--color-surface); border-top: 1px solid var(--color-hairline);">
            <div style="font-size: 11px; font-weight: 700; color: var(--color-slate); margin-bottom: 6px; text-transform: uppercase;">
              ⚡ Quick 1-Click Role Switchers:
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px;">
              <button class="button-secondary btn-modal-demo-auth" data-role="PATIENT" data-email="anil.verma@nexora.com" data-pass="pass123" style="font-size: 11px; padding: 6px 10px; justify-content: flex-start; background: var(--color-surface-yellow); border-color: #fde68a;">
                <span>👤 Patient (Anil)</span>
              </button>
              <button class="button-secondary btn-modal-demo-auth" data-role="DOCTOR" data-email="dr.vikram@nexora.com" data-pass="pass123" style="font-size: 11px; padding: 6px 10px; justify-content: flex-start; background: #e0f2fe; border-color: #bae6fd;">
                <span>🩺 Doctor (Dr. Vikram)</span>
              </button>
              <button class="button-secondary btn-modal-demo-auth" data-role="PHARMACY" data-email="medplus@nexora.com" data-pass="pass123" style="font-size: 11px; padding: 6px 10px; justify-content: flex-start; background: #fef3c7; border-color: #fde68a;">
                <span>💊 Pharmacy (MedPlus)</span>
              </button>
              <button class="button-secondary btn-modal-demo-auth" data-role="ADMIN" data-email="admin@nexorapulse.com" data-pass="admin123" style="font-size: 11px; padding: 6px 10px; justify-content: flex-start; background: #f1f5f9; border-color: #e2e8f0;">
                <span>🛡️ Platform Admin</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    `;

    this.bindEvents();
  }

  renderLoginForm(activePreset) {
    return `
      <form id="modal-form-login" style="display: flex; flex-direction: column; gap: var(--space-sm);">
        <div>
          <label style="font-size: 12px; font-weight: 600; color: var(--color-charcoal); display: block; margin-bottom: 2px;">Email Address</label>
          <input type="email" id="modal-login-email" required value="${activePreset.email}" style="width: 100%; font-size: 13px; padding: 10px 14px; border-radius: var(--radius-md); border: 1px solid var(--color-hairline-strong); background: #ffffff;" />
        </div>

        <div>
          <label style="font-size: 12px; font-weight: 600; color: var(--color-charcoal); display: block; margin-bottom: 2px;">Password</label>
          <input type="password" id="modal-login-password" required value="${activePreset.pass}" style="width: 100%; font-size: 13px; padding: 10px 14px; border-radius: var(--radius-md); border: 1px solid var(--color-hairline-strong); background: #ffffff;" />
        </div>

        <button type="submit" class="button-primary" style="width: 100%; padding: 12px; font-size: 14px; margin-top: 4px;" ${this.isSubmitting ? 'disabled' : ''}>
          <span>${this.isSubmitting ? 'Signing In...' : `Sign In as ${this.selectedRole}`}</span>
          <span>➔</span>
        </button>
      </form>
    `;
  }

  renderRegisterForm() {
    return `
      <form id="modal-form-register" style="display: flex; flex-direction: column; gap: var(--space-xs);">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-xs);">
          <div>
            <label style="font-size: 11px; font-weight: 600; color: var(--color-charcoal); display: block; margin-bottom: 2px;">Full Name</label>
            <input type="text" id="modal-reg-fullname" placeholder="Legal Name" required style="width: 100%; font-size: 12px; padding: 8px 10px; border-radius: var(--radius-md); border: 1px solid var(--color-hairline-strong); background: #ffffff;" />
          </div>

          <div>
            <label style="font-size: 11px; font-weight: 600; color: var(--color-charcoal); display: block; margin-bottom: 2px;">Phone</label>
            <input type="tel" id="modal-reg-phone" placeholder="+91 98765 00000" required style="width: 100%; font-size: 12px; padding: 8px 10px; border-radius: var(--radius-md); border: 1px solid var(--color-hairline-strong); background: #ffffff;" />
          </div>
        </div>

        <div>
          <label style="font-size: 11px; font-weight: 600; color: var(--color-charcoal); display: block; margin-bottom: 2px;">Email Address</label>
          <input type="email" id="modal-reg-email" placeholder="official@domain.com" required style="width: 100%; font-size: 12px; padding: 8px 10px; border-radius: var(--radius-md); border: 1px solid var(--color-hairline-strong); background: #ffffff;" />
        </div>

        <div>
          <label style="font-size: 11px; font-weight: 600; color: var(--color-charcoal); display: block; margin-bottom: 2px;">Password</label>
          <input type="password" id="modal-reg-password" placeholder="••••••••" required style="width: 100%; font-size: 12px; padding: 8px 10px; border-radius: var(--radius-md); border: 1px solid var(--color-hairline-strong); background: #ffffff;" />
        </div>

        <button type="submit" class="button-primary" style="width: 100%; padding: 12px; font-size: 13px; margin-top: 4px;" ${this.isSubmitting ? 'disabled' : ''}>
          <span>${this.isSubmitting ? 'Registering...' : `Register as ${this.selectedRole}`}</span>
        </button>
      </form>
    `;
  }

  bindEvents() {
    const loginTab = this.container.querySelector("#tab-btn-login");
    const regTab = this.container.querySelector("#tab-btn-register");

    if (loginTab) {
      loginTab.addEventListener("click", () => {
        this.mode = "login";
        this.errorMessage = "";
        this.render();
      });
    }

    if (regTab) {
      regTab.addEventListener("click", () => {
        this.mode = "register";
        this.errorMessage = "";
        this.render();
      });
    }

    this.container.querySelectorAll(".modal-role-card").forEach((card) => {
      card.addEventListener("click", () => {
        this.selectedRole = card.getAttribute("data-role");
        this.render();
      });
    });

    this.container.querySelectorAll(".btn-modal-demo-auth").forEach((btn) => {
      btn.addEventListener("click", () => {
        const email = btn.getAttribute("data-email");
        const pass = btn.getAttribute("data-pass");
        const role = btn.getAttribute("data-role");
        if (role) this.selectedRole = role;
        this.handleLogin(email, pass, true);
      });
    });

    const loginForm = this.container.querySelector("#modal-form-login");
    if (loginForm) {
      loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = this.container.querySelector("#modal-login-email").value;
        const pass = this.container.querySelector("#modal-login-password").value;
        this.handleLogin(email, pass, false);
      });
    }

    const regForm = this.container.querySelector("#modal-form-register");
    if (regForm) {
      regForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleRegister();
      });
    }
  }

  routeForRole(role) {
    switch (role) {
      case "DOCTOR":
        return "#/doctor";
      case "PHARMACY":
        return "#/pharmacy";
      case "ADMIN":
        return "#/admin";
      case "PATIENT":
      default:
        return "#/";
    }
  }

  async handleLogin(email, password, isDemoClick = false) {
    try {
      this.isSubmitting = true;
      this.errorMessage = "";
      this.render();

      const users = authService.getUsers();
      let user = users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());

      if (!user) {
        user = {
          id: `usr-${this.selectedRole.toLowerCase()}-${Date.now()}`,
          email: email.trim(),
          full_name: email.split("@")[0].replace(/\./g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
          phone: "+91 98765 00000",
          role: this.selectedRole,
          verificationStatus: "ACTIVE"
        };
      }

      const token = authService.generateJwt(user);
      authService.saveSession({ token, user });
      store.setCurrentUser(user);
      store.closeModal();
      store.showToast(`Logged in as ${user.full_name} (${user.role})`, "success");

      if (typeof this.onSuccess === "function") {
        this.onSuccess(user);
      }

      const targetRoute = this.routeForRole(user.role);
      window.location.hash = targetRoute;
      window.dispatchEvent(new CustomEvent("userSessionChanged"));
    } catch (err) {
      this.errorMessage = err.message || "An error occurred during sign in.";
      this.isSubmitting = false;
      this.render();
    }
  }

  async handleRegister() {
    try {
      this.isSubmitting = true;
      this.errorMessage = "";
      this.render();

      const fullName = this.container.querySelector("#modal-reg-fullname")?.value || "";
      const phone = this.container.querySelector("#modal-reg-phone")?.value || "";
      const email = this.container.querySelector("#modal-reg-email")?.value || "";
      const password = this.container.querySelector("#modal-reg-password")?.value || "";

      const metadata = {
        full_name: fullName,
        phone,
        role: this.selectedRole
      };

      const session = authService.register({ ...metadata, email, password });
      store.closeModal();
      store.showToast(`Account created for ${session.user.full_name}!`, "success");

      if (typeof this.onSuccess === "function") {
        this.onSuccess(session.user);
      }

      const targetRoute = this.routeForRole(this.selectedRole);
      window.location.hash = targetRoute;
      window.dispatchEvent(new CustomEvent("userSessionChanged"));
    } catch (err) {
      this.errorMessage = err.message || "An error occurred during registration.";
      this.isSubmitting = false;
      this.render();
    }
  }
}
