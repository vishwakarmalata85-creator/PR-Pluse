/**
 * NEXORA PULSECARE - UNIFIED LOGIN & ROLE SELECTION AUTHENTICATION VIEW
 * Provides multi-role selection (Patient, Doctor, Pharmacy, Admin) with automatic route redirection.
 */

import { supabase, SUPABASE_PUBLIC_KEY } from "../supabaseClient.js";
import { authService } from "../services/authService.js";
import { store } from "../state/store.js";

export class AuthViewComponent {
  constructor(container, onSuccess = null) {
    this.container = container;
    this.onSuccess = onSuccess;
    const hash = window.location.hash.toLowerCase();
    this.mode = hash === "#register" ? "register" : "login"; // 'login' | 'register'
    this.selectedRole = "PATIENT"; // 'PATIENT' | 'DOCTOR' | 'PHARMACY' | 'ADMIN'
    this.errorMessage = "";
    this.isSubmitting = false;

    this.rolePresetCredentials = {
      PATIENT: {
        email: "anil.verma@gmail.com",
        pass: "pass123",
        name: "Patient (Anil Verma)",
        destination: "Patient Portal (Dual Rx Hub & ABDM Vault)",
        route: "#/"
      },
      DOCTOR: {
        email: "dr.vikram.sethi@gmail.com",
        pass: "pass123",
        name: "Doctor (Dr. Vikram Sethi, MD)",
        destination: "PulseMD Clinical Station & OPD Queue",
        route: "#/doctor"
      },
      PHARMACY: {
        email: "medplus.pharmacy@gmail.com",
        pass: "pass123",
        name: "Pharmacy (MedPlus 24/7)",
        destination: "PulsePharm Live Inventory & Order Queue",
        route: "#/pharmacy"
      },
      ADMIN: {
        email: "admin.pulse@gmail.com",
        pass: "admin123",
        name: "Platform Admin",
        destination: "Nexora Verification & License Console",
        route: "#/admin"
      }
    };
  }

  render() {
    const activePreset = this.rolePresetCredentials[this.selectedRole] || this.rolePresetCredentials.PATIENT;

    this.container.innerHTML = `
      <div style="max-width: 680px; margin: var(--space-xl) auto; width: 100%;" role="region" aria-label="PulseCare Authentication Gateway">
        
        <!-- Main Auth Card (Miro 28px rounded corners & shadow) -->
        <div class="card-base" style="background: #ffffff; border: 1px solid var(--color-hairline); border-radius: var(--radius-xxxl); box-shadow: var(--shadow-mockup); padding: var(--space-xxl); position: relative; overflow: hidden;">
          
          <!-- Card Header & Brand Mark -->
          <div style="text-align: center; margin-bottom: var(--space-lg);">
            <div style="display: inline-flex; align-items: center; justify-content: center; width: 52px; height: 52px; background: var(--color-brand-yellow); border-radius: var(--radius-lg); font-size: 26px; color: var(--color-primary); box-shadow: var(--shadow-sm); margin-bottom: var(--space-xs);">
              ⚡
            </div>

            <h2 class="heading-2" style="font-size: 28px; line-height: 1.2; margin-top: 4px;">
              ${this.mode === 'login' ? 'Sign In to PulseCare' : 'Create Your Health Account'}
            </h2>

            <p class="body-sm" style="color: var(--color-slate); margin-top: 4px;">
              Choose your role below to access your specialized healthcare portal.
            </p>

            <!-- Mode Switcher Pill Tabs (Miro Design) -->
            <div style="display: inline-flex; background: var(--color-surface); padding: 4px; border-radius: var(--radius-full); border: 1px solid var(--color-hairline); margin-top: var(--space-md);">
              <button class="pill-tab ${this.mode === 'login' ? 'pill-tab-active' : ''}" id="btn-tab-mode-login" style="padding: 7px 20px; font-size: 13px;">
                <span>🔐 Sign In</span>
              </button>
              <button class="pill-tab ${this.mode === 'register' ? 'pill-tab-active' : ''}" id="btn-tab-mode-register" style="padding: 7px 20px; font-size: 13px;">
                <span>✨ Create Account</span>
              </button>
            </div>
          </div>

          <!-- Step 1: Interactive Role Selection Cards (Patient, Doctor, Pharmacy, Admin) -->
          <div style="margin-bottom: var(--space-lg);">
            <label style="font-size: 13px; font-weight: 700; color: var(--color-primary); display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-xs);">
              <span>1. Choose Portal Role to Access:</span>
              <span style="font-size: 11px; font-weight: 500; color: var(--color-slate);">Selected: <strong style="color: var(--color-primary);">${this.selectedRole}</strong></span>
            </label>
            
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
              
              <!-- Patient Role -->
              <div class="card-base role-choice-card ${this.selectedRole === 'PATIENT' ? 'role-choice-selected' : ''}" data-role="PATIENT" style="padding: 12px 8px; background: ${this.selectedRole === 'PATIENT' ? 'var(--color-surface-yellow)' : '#ffffff'}; border: 2px solid ${this.selectedRole === 'PATIENT' ? 'var(--color-primary)' : 'var(--color-hairline)'}; border-radius: var(--radius-lg); text-align: center; cursor: pointer; transition: all 0.2s ease;">
                <div style="font-size: 26px;">👤</div>
                <div style="font-weight: 700; font-size: 13px; color: var(--color-primary); margin-top: 4px;">Patient</div>
                <div style="font-size: 10px; color: var(--color-slate); margin-top: 2px;">Dual Rx & Vault</div>
              </div>

              <!-- Doctor Role -->
              <div class="card-base role-choice-card ${this.selectedRole === 'DOCTOR' ? 'role-choice-selected' : ''}" data-role="DOCTOR" style="padding: 12px 8px; background: ${this.selectedRole === 'DOCTOR' ? '#e0f2fe' : '#ffffff'}; border: 2px solid ${this.selectedRole === 'DOCTOR' ? '#0284c7' : 'var(--color-hairline)'}; border-radius: var(--radius-lg); text-align: center; cursor: pointer; transition: all 0.2s ease;">
                <div style="font-size: 26px;">🩺</div>
                <div style="font-weight: 700; font-size: 13px; color: var(--color-primary); margin-top: 4px;">Doctor</div>
                <div style="font-size: 10px; color: var(--color-slate); margin-top: 2px;">OPD & Rapid Rx</div>
              </div>

              <!-- Pharmacy Role -->
              <div class="card-base role-choice-card ${this.selectedRole === 'PHARMACY' ? 'role-choice-selected' : ''}" data-role="PHARMACY" style="padding: 12px 8px; background: ${this.selectedRole === 'PHARMACY' ? '#fef3c7' : '#ffffff'}; border: 2px solid ${this.selectedRole === 'PHARMACY' ? '#d97706' : 'var(--color-hairline)'}; border-radius: var(--radius-lg); text-align: center; cursor: pointer; transition: all 0.2s ease;">
                <div style="font-size: 26px;">💊</div>
                <div style="font-weight: 700; font-size: 13px; color: var(--color-primary); margin-top: 4px;">Pharmacy</div>
                <div style="font-size: 10px; color: var(--color-slate); margin-top: 2px;">Stock & Orders</div>
              </div>

              <!-- Admin Role -->
              <div class="card-base role-choice-card ${this.selectedRole === 'ADMIN' ? 'role-choice-selected' : ''}" data-role="ADMIN" style="padding: 12px 8px; background: ${this.selectedRole === 'ADMIN' ? '#f1f5f9' : '#ffffff'}; border: 2px solid ${this.selectedRole === 'ADMIN' ? '#475569' : 'var(--color-hairline)'}; border-radius: var(--radius-lg); text-align: center; cursor: pointer; transition: all 0.2s ease;">
                <div style="font-size: 26px;">🛡️</div>
                <div style="font-weight: 700; font-size: 13px; color: var(--color-primary); margin-top: 4px;">Admin</div>
                <div style="font-size: 10px; color: var(--color-slate); margin-top: 2px;">Verification</div>
              </div>

            </div>

            <!-- Role destination callout banner -->
            <div style="margin-top: 8px; padding: 6px 12px; background: var(--color-surface); border-radius: var(--radius-md); font-size: 11px; color: var(--color-slate); display: flex; align-items: center; justify-content: space-between;">
              <span>🚀 Target Portal: <strong style="color: var(--color-primary);">${activePreset.destination}</strong></span>
              <span style="font-family: var(--font-family-mono); color: var(--color-brand-blue);">${activePreset.route}</span>
            </div>
          </div>

          <!-- Body: Login or Register Form -->
          ${this.mode === 'login' ? this.renderLoginForm(activePreset) : this.renderRegisterForm()}

          <!-- Error Alert Banner Under Form -->
          ${this.errorMessage ? `
            <div style="padding: 12px 16px; margin-top: var(--space-md); background: #fee2e2; border: 1px solid #f87171; border-radius: var(--radius-md); color: #991b1b; font-size: 13px; display: flex; align-items: flex-start; gap: 8px;">
              <span style="font-size: 16px;">⚠️</span>
              <div>
                <div style="font-weight: 700;">${this.errorMessage}</div>
              </div>
            </div>
          ` : ''}

          <!-- Quick 1-Click Demo Personas Strip -->
          <div style="margin-top: var(--space-xl); padding-top: var(--space-lg); border-top: 1px solid var(--color-hairline);">
            <div class="micro" style="text-align: center; color: var(--color-stone); margin-bottom: var(--space-xs); font-weight: 700;">
              ⚡ 1-Click Instant Demo Launchers:
            </div>

            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-xs);">
              
              <button class="button-secondary btn-demo-auth" data-role="PATIENT" data-email="anil.verma@gmail.com" data-pass="pass123" style="padding: 8px 12px; font-size: 12px; justify-content: flex-start; background: var(--color-surface-yellow); border-color: #fde68a;">
                <span>👤</span>
                <span style="font-weight: 600;">Patient (Anil Verma)</span>
              </button>

              <button class="button-secondary btn-demo-auth" data-role="DOCTOR" data-email="dr.vikram.sethi@gmail.com" data-pass="pass123" style="padding: 8px 12px; font-size: 12px; justify-content: flex-start; background: #e0f2fe; border-color: #bae6fd;">
                <span>🩺</span>
                <span style="font-weight: 600;">Doctor (Dr. Vikram)</span>
              </button>

              <button class="button-secondary btn-demo-auth" data-role="PHARMACY" data-email="medplus.pharmacy@gmail.com" data-pass="pass123" style="padding: 8px 12px; font-size: 12px; justify-content: flex-start; background: #fef3c7; border-color: #fde68a;">
                <span>💊</span>
                <span style="font-weight: 600;">Pharmacy (MedPlus)</span>
              </button>

              <button class="button-secondary btn-demo-auth" data-role="ADMIN" data-email="admin.pulse@gmail.com" data-pass="admin123" style="padding: 8px 12px; font-size: 12px; justify-content: flex-start; background: #f1f5f9; border-color: #e2e8f0;">
                <span>🛡️</span>
                <span style="font-weight: 600;">Platform Admin</span>
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
      <form id="form-auth-login" style="display: flex; flex-direction: column; gap: var(--space-md);">
        <div>
          <label style="font-size: 13px; font-weight: 600; color: var(--color-charcoal); display: block; margin-bottom: 4px;">Gmail / Official Email</label>
          <input 
            type="email" 
            id="auth-input-email" 
            placeholder="e.g. ${activePreset.email}" 
            required 
            value="${activePreset.email}"
            style="width: 100%; font-size: 14px; padding: 12px 16px; border-radius: var(--radius-md); border: 1px solid var(--color-hairline-strong); background: #ffffff;"
          />
        </div>

        <div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <label style="font-size: 13px; font-weight: 600; color: var(--color-charcoal);">Password</label>
            <a href="#" style="font-size: 12px; color: var(--color-brand-blue); text-decoration: none;">Forgot password?</a>
          </div>
          <input 
            type="password" 
            id="auth-input-password" 
            placeholder="••••••••" 
            required 
            value="${activePreset.pass}"
            style="width: 100%; font-size: 14px; padding: 12px 16px; border-radius: var(--radius-md); border: 1px solid var(--color-hairline-strong); background: #ffffff;"
          />
        </div>

        <div style="display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--color-slate);">
          <input type="checkbox" id="auth-remember-me" checked style="accent-color: var(--color-brand-blue); cursor: pointer;" />
          <label for="auth-remember-me" style="cursor: pointer;">Keep me signed in as ${this.selectedRole}</label>
        </div>

        <button type="submit" class="button-primary" style="width: 100%; padding: 14px 24px; font-size: 15px; margin-top: 4px;" ${this.isSubmitting ? 'disabled' : ''}>
          <span>${this.isSubmitting ? 'Authenticating with Backend...' : `Sign In as ${this.selectedRole} & Enter Portal`}</span>
          <span>➔</span>
        </button>
      </form>
    `;
  }

  renderRegisterForm() {
    return `
      <form id="form-auth-register" style="display: flex; flex-direction: column; gap: var(--space-md);">
        
        <!-- Common Details -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-sm);">
          <div>
            <label style="font-size: 12px; font-weight: 600; color: var(--color-charcoal); display: block; margin-bottom: 2px;">
              ${this.selectedRole === 'PHARMACY' ? 'Store / Chemist Name' : 'Full Legal Name'}
            </label>
            <input type="text" id="reg-fullname" placeholder="${this.selectedRole === 'DOCTOR' ? 'Dr. Sarah Jenkins' : 'Full Name'}" required style="width: 100%; font-size: 13px; padding: 10px 14px; border-radius: var(--radius-md); border: 1px solid var(--color-hairline-strong); background: #ffffff;" />
          </div>

          <div>
            <label style="font-size: 12px; font-weight: 600; color: var(--color-charcoal); display: block; margin-bottom: 2px;">Phone Number</label>
            <input type="tel" id="reg-phone" placeholder="+91 98765 00000" required style="width: 100%; font-size: 13px; padding: 10px 14px; border-radius: var(--radius-md); border: 1px solid var(--color-hairline-strong); background: #ffffff;" />
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-sm);">
          <div>
            <label style="font-size: 12px; font-weight: 600; color: var(--color-charcoal); display: block; margin-bottom: 2px;">Gmail / Official Email</label>
            <input type="email" id="reg-email" placeholder="yourname@gmail.com" required style="width: 100%; font-size: 13px; padding: 10px 14px; border-radius: var(--radius-md); border: 1px solid var(--color-hairline-strong); background: #ffffff;" />
          </div>

          <div>
            <label style="font-size: 12px; font-weight: 600; color: var(--color-charcoal); display: block; margin-bottom: 2px;">Password</label>
            <input type="password" id="reg-password" placeholder="••••••••" required style="width: 100%; font-size: 13px; padding: 10px 14px; border-radius: var(--radius-md); border: 1px solid var(--color-hairline-strong); background: #ffffff;" />
          </div>
        </div>

        <!-- Conditional Fields based on Role -->
        ${this.selectedRole === 'DOCTOR' ? `
          <div style="padding: var(--space-md); background: var(--color-surface); border: 1px solid var(--color-hairline); border-radius: var(--radius-lg); display: flex; flex-direction: column; gap: var(--space-xs);">
            <div style="font-size: 12px; font-weight: 700; color: var(--color-brand-blue);">🩺 Medical Registration & Council Details</div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-xs);">
              <div>
                <label style="font-size: 11px; color: var(--color-slate); display: block; margin-bottom: 2px;">Medical Registration No (MRN) *</label>
                <input type="text" id="reg-mrn" placeholder="e.g. KMC-58291-2018" required style="width: 100%; font-size: 12px; padding: 8px 12px; border-radius: var(--radius-md); border: 1px solid var(--color-hairline-strong); background: #fff;" />
              </div>

              <div>
                <label style="font-size: 11px; color: var(--color-slate); display: block; margin-bottom: 2px;">State Medical Council *</label>
                <select id="reg-state-council" style="width: 100%; font-size: 12px; padding: 8px 12px; border-radius: var(--radius-md); border: 1px solid var(--color-hairline-strong); background: #fff;">
                  <option value="Karnataka Medical Council (KMC)">Karnataka Medical Council (KMC)</option>
                  <option value="Maharashtra Medical Council (MMC)">Maharashtra Medical Council (MMC)</option>
                  <option value="Delhi Medical Council (DMC)">Delhi Medical Council (DMC)</option>
                </select>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: var(--space-xs); margin-top: 2px;">
              <div>
                <label style="font-size: 11px; color: var(--color-slate); display: block; margin-bottom: 2px;">Specialization *</label>
                <input type="text" id="reg-specialization" placeholder="e.g. Cardiology, Internal Medicine" required style="width: 100%; font-size: 12px; padding: 8px 12px; border-radius: var(--radius-md); border: 1px solid var(--color-hairline-strong); background: #fff;" />
              </div>

              <div>
                <label style="font-size: 11px; color: var(--color-slate); display: block; margin-bottom: 2px;">Experience (Years) *</label>
                <input type="number" id="reg-experience" min="1" max="50" value="8" style="width: 100%; font-size: 12px; padding: 8px 12px; border-radius: var(--radius-md); border: 1px solid var(--color-hairline-strong); background: #fff;" />
              </div>
            </div>
          </div>
        ` : ''}

        ${this.selectedRole === 'PHARMACY' ? `
          <div style="padding: var(--space-md); background: var(--color-surface); border: 1px solid var(--color-hairline); border-radius: var(--radius-lg); display: flex; flex-direction: column; gap: var(--space-xs);">
            <div style="font-size: 12px; font-weight: 700; color: var(--color-yellow-dark);">💊 Pharmacy License & Location Details</div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-xs);">
              <div>
                <label style="font-size: 11px; color: var(--color-slate); display: block; margin-bottom: 2px;">Drug License Number (DLN) *</label>
                <input type="text" id="reg-dln" placeholder="e.g. KA-BLR-2026-9901" required style="width: 100%; font-size: 12px; padding: 8px 12px; border-radius: var(--radius-md); border: 1px solid var(--color-hairline-strong); background: #fff;" />
              </div>

              <div>
                <label style="font-size: 11px; color: var(--color-slate); display: block; margin-bottom: 2px;">Pincode *</label>
                <input type="text" id="reg-pincode" placeholder="e.g. 560034" required style="width: 100%; font-size: 12px; padding: 8px 12px; border-radius: var(--radius-md); border: 1px solid var(--color-hairline-strong); background: #fff;" />
              </div>
            </div>

            <div>
              <label style="font-size: 11px; color: var(--color-slate); display: block; margin-bottom: 2px;">Store Address *</label>
              <input type="text" id="reg-address" placeholder="e.g. 14th Main, 4th Sector, HSR Layout, Bengaluru" required style="width: 100%; font-size: 12px; padding: 8px 12px; border-radius: var(--radius-md); border: 1px solid var(--color-hairline-strong); background: #fff;" />
            </div>
          </div>
        ` : ''}

        <button type="submit" class="button-primary" style="width: 100%; padding: 14px 24px; font-size: 15px; margin-top: 4px;" ${this.isSubmitting ? 'disabled' : ''}>
          <span>${this.isSubmitting ? 'Verifying & Creating Account...' : `Register as ${this.selectedRole} & Launch Portal`}</span>
          <span>➔</span>
        </button>

      </form>
    `;
  }

  bindEvents() {
    const loginTabBtn = this.container.querySelector("#btn-tab-mode-login");
    const regTabBtn = this.container.querySelector("#btn-tab-mode-register");

    if (loginTabBtn) {
      loginTabBtn.addEventListener("click", () => {
        this.mode = "login";
        this.errorMessage = "";
        window.location.hash = "#login";
        this.render();
      });
    }

    if (regTabBtn) {
      regTabBtn.addEventListener("click", () => {
        this.mode = "register";
        this.errorMessage = "";
        window.location.hash = "#register";
        this.render();
      });
    }

    // Role Choice Cards
    this.container.querySelectorAll(".role-choice-card").forEach((card) => {
      card.addEventListener("click", () => {
        this.selectedRole = card.getAttribute("data-role");
        this.render();
      });
    });

    // 1-Click Demo Personas
    this.container.querySelectorAll(".btn-demo-auth").forEach((btn) => {
      btn.addEventListener("click", () => {
        const email = btn.getAttribute("data-email");
        const pass = btn.getAttribute("data-pass");
        const role = btn.getAttribute("data-role");
        if (role) this.selectedRole = role;
        this.handleLogin(email, pass);
      });
    });

    // Login Form Submit
    const loginForm = this.container.querySelector("#form-auth-login");
    if (loginForm) {
      loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = this.container.querySelector("#auth-input-email").value;
        const pass = this.container.querySelector("#auth-input-password").value;
        this.handleLogin(email, pass);
      });
    }

    // Register Form Submit
    const regForm = this.container.querySelector("#form-auth-register");
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

  async handleLogin(email, password) {
    try {
      this.isSubmitting = true;
      this.errorMessage = "";
      this.render();

      // Real Backend API Login with MongoDB check & login history recording
      const session = await authService.login(email, password);
      const user = session.user;

      store.setCurrentUser(user);
      store.showToast(`Welcome back, ${user.full_name} (${user.role})!`, "success");

      if (typeof this.onSuccess === "function") {
        this.onSuccess(user);
      }

      // Auto-navigate to the corresponding role dashboard
      const targetRoute = this.routeForRole(user.role);
      window.location.hash = targetRoute;
      window.dispatchEvent(new CustomEvent("userSessionChanged"));
    } catch (err) {
      this.errorMessage = err.message || "An unexpected error occurred during sign in.";
      this.isSubmitting = false;
      this.render();
    }
  }

  async handleRegister() {
    try {
      this.isSubmitting = true;
      this.errorMessage = "";
      this.render();

      const fullName = this.container.querySelector("#reg-fullname")?.value || "";
      const phone = this.container.querySelector("#reg-phone")?.value || "";
      const email = this.container.querySelector("#reg-email")?.value || "";
      const password = this.container.querySelector("#reg-password")?.value || "";

      const formData = {
        full_name: fullName,
        phone,
        email,
        password,
        role: this.selectedRole
      };

      if (this.selectedRole === "DOCTOR") {
        formData.doctor_profile = {
          mrn: this.container.querySelector("#reg-mrn")?.value,
          state_council: this.container.querySelector("#reg-state-council")?.value,
          specialization: this.container.querySelector("#reg-specialization")?.value,
          experience_years: this.container.querySelector("#reg-experience")?.value
        };
      } else if (this.selectedRole === "PHARMACY") {
        formData.pharmacy_profile = {
          store_name: fullName,
          dln: this.container.querySelector("#reg-dln")?.value,
          address: this.container.querySelector("#reg-address")?.value,
          pincode: this.container.querySelector("#reg-pincode")?.value
        };
      }

      // Call Real Backend API Registration
      const session = await authService.register(formData);
      const user = session.user;

      store.setCurrentUser(user);
      store.showToast(`Account registered for ${user.full_name}!`, "success");

      if (typeof this.onSuccess === "function") {
        this.onSuccess(user);
      }

      const targetRoute = this.routeForRole(user.role);
      window.location.hash = targetRoute;
      window.dispatchEvent(new CustomEvent("userSessionChanged"));
    } catch (err) {
      this.errorMessage = err.message || "An error occurred during registration.";
      this.isSubmitting = false;
      this.render();
    }
  }
}

