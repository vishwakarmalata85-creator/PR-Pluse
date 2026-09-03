/**
 * NEXORA PULSECARE - ULTRA-PREMIUM AUTHENTICATION & ROLE SELECTION VIEW
 * High-aesthetic glassmorphism, responsive role palettes, animated state transitions, and 1-click persona launchers.
 */

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
    this.showPassword = false;

    this.rolePresetCredentials = {
      PATIENT: {
        email: "anil.verma@gmail.com",
        pass: "pass123",
        name: "Anil Kumar Verma",
        subtitle: "Verified Patient • ABHA Active",
        destination: "Patient Operating System",
        desc: "Dual Rx Hub, 5km Pharmacy Radar & ABDM Vault",
        icon: "👤",
        color: "#10b981",
        colorDark: "#065f46",
        bgLight: "#ecfdf5",
        bgHover: "#d1fae5",
        borderActive: "#10b981",
        glow: "rgba(16, 185, 129, 0.25)",
        route: "#/"
      },
      DOCTOR: {
        email: "dr.vikram.sethi@gmail.com",
        pass: "pass123",
        name: "Dr. Vikram Sethi, MD",
        subtitle: "Internal Medicine • KMC-48921",
        destination: "PulseMD Clinical Station",
        desc: "OPD Queue, Dual Rx Builder & ICD-10 Coding",
        icon: "🩺",
        color: "#0284c7",
        colorDark: "#075985",
        bgLight: "#e0f2fe",
        bgHover: "#bae6fd",
        borderActive: "#0284c7",
        glow: "rgba(2, 132, 199, 0.25)",
        route: "#/doctor"
      },
      PHARMACY: {
        email: "medplus.pharmacy@gmail.com",
        pass: "pass123",
        name: "MedPlus 24/7 Super Pharmacy",
        subtitle: "Licensed Chemist • KA-BLR-88912",
        destination: "PulsePharm Dispensary Hub",
        desc: "Live Medicine Orders, Stock Radar & TrOCR Audit",
        icon: "💊",
        color: "#d97706",
        colorDark: "#92400e",
        bgLight: "#fef3c7",
        bgHover: "#fde68a",
        borderActive: "#d97706",
        glow: "rgba(217, 119, 6, 0.25)",
        route: "#/pharmacy"
      },
      ADMIN: {
        email: "admin.pulse@gmail.com",
        pass: "admin123",
        name: "Rohit Guchhait",
        subtitle: "Master Administrator • Full Access",
        destination: "Nexora Control Plane",
        desc: "Login Audit Stream & Provider Verification",
        icon: "🛡️",
        color: "#6366f1",
        colorDark: "#3730a3",
        bgLight: "#e0e7ff",
        bgHover: "#c7d2fe",
        borderActive: "#6366f1",
        glow: "rgba(99, 102, 241, 0.25)",
        route: "#/admin"
      }
    };
  }

  render() {
    const roleCfg = this.rolePresetCredentials[this.selectedRole] || this.rolePresetCredentials.PATIENT;

    this.container.innerHTML = `
      <div class="auth-viewport-wrapper" style="position: relative; max-width: 640px; margin: 32px auto; width: 100%; padding: 0 16px;">
        
        <!-- Ambient Atmospheric Glow Orbs -->
        <div style="position: absolute; top: -40px; left: -30px; width: 220px; height: 220px; background: ${roleCfg.glow}; border-radius: 50%; filter: blur(60px); opacity: 0.6; pointer-events: none; transition: all 0.5s ease;"></div>
        <div style="position: absolute; bottom: -30px; right: -20px; width: 200px; height: 200px; background: rgba(251, 191, 36, 0.18); border-radius: 50%; filter: blur(50px); opacity: 0.5; pointer-events: none;"></div>

        <!-- Main Glassmorphic Card Container -->
        <div class="auth-card-main" style="position: relative; z-index: 1; background: rgba(255, 255, 255, 0.94); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); border: 1px solid rgba(226, 232, 240, 0.9); border-radius: clamp(18px, 4vw, 28px); box-shadow: 0 25px 60px -15px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.8) inset; padding: clamp(24px, 5vw, 40px) clamp(16px, 4vw, 36px); overflow: hidden; transition: border-color 0.3s ease;">
          
          <!-- Top Accent Gradient Line -->
          <div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, ${roleCfg.color}, #f59e0b, ${roleCfg.color});"></div>

          <!-- Card Header & Brand Emblem -->
          <div style="text-align: center; margin-bottom: 28px;">
            
            <div style="display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 9999px; margin-bottom: 14px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <span style="font-size: 14px; color: #f59e0b; animation: pulse 2s infinite;">⚡</span>
              <span style="font-size: 11px; font-weight: 800; color: #334155; letter-spacing: 0.8px; text-transform: uppercase;">Nexora PulseCare OS</span>
              <span style="font-size: 9px; padding: 1px 6px; background: #ecfdf5; color: #059669; border-radius: 6px; font-weight: 700;">ABDM CERTIFIED</span>
            </div>

            <h1 style="font-size: 28px; font-weight: 900; color: #0f172a; margin: 0; letter-spacing: -0.8px; line-height: 1.2; font-family: var(--font-family-display, -apple-system, sans-serif);">
              ${this.mode === 'login' ? 'Welcome to PulseCare' : 'Create Health Account'}
            </h1>

            <p style="font-size: 13.5px; color: #64748b; margin: 6px 0 0 0; line-height: 1.5;">
              ${this.mode === 'login' 
                ? 'Select your healthcare role to launch your customized workspace.' 
                : 'Join the Ayushman Bharat Digital Mission healthcare network.'}
            </p>

            <!-- Mode Switcher Pill Toggle (Sliding Design) -->
            <div style="display: inline-flex; background: #f1f5f9; padding: 4px; border-radius: 9999px; border: 1px solid #e2e8f0; margin-top: 18px;">
              <button class="pill-tab-toggle" id="btn-tab-mode-login" style="padding: 7px 22px; font-size: 13px; font-weight: 700; border-radius: 9999px; border: none; cursor: pointer; transition: all 0.2s ease; background: ${this.mode === 'login' ? '#ffffff' : 'transparent'}; color: ${this.mode === 'login' ? '#0f172a' : '#64748b'}; box-shadow: ${this.mode === 'login' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none'};">
                <span>🔐 Sign In</span>
              </button>
              <button class="pill-tab-toggle" id="btn-tab-mode-register" style="padding: 7px 22px; font-size: 13px; font-weight: 700; border-radius: 9999px; border: none; cursor: pointer; transition: all 0.2s ease; background: ${this.mode === 'register' ? '#ffffff' : 'transparent'}; color: ${this.mode === 'register' ? '#0f172a' : '#64748b'}; box-shadow: ${this.mode === 'register' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none'};">
                <span>✨ Create Account</span>
              </button>
            </div>
          </div>

          <!-- Step 1: Interactive Role Selector Cards -->
          <div style="margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <span style="font-size: 13px; font-weight: 800; color: #1e293b; text-transform: uppercase; letter-spacing: 0.4px;">
                1. Select Portal Role:
              </span>
              <span style="font-size: 12px; font-weight: 700; color: ${roleCfg.color}; background: ${roleCfg.bgLight}; padding: 2px 10px; border-radius: 9999px;">
                ● Active: ${this.selectedRole}
              </span>
            </div>

            <!-- Role Cards Grid -->
            <div style="display: grid; grid-template-columns: repeat(${this.mode === 'login' ? '4' : '3'}, 1fr); gap: 10px;">
              
              <!-- Card: PATIENT -->
              <div class="auth-role-card ${this.selectedRole === 'PATIENT' ? 'active-role' : ''}" data-role="PATIENT" style="position: relative; padding: 14px 8px; border-radius: 16px; cursor: pointer; text-align: center; transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1); border: 2px solid ${this.selectedRole === 'PATIENT' ? '#10b981' : '#e2e8f0'}; background: ${this.selectedRole === 'PATIENT' ? '#ecfdf5' : '#ffffff'}; box-shadow: ${this.selectedRole === 'PATIENT' ? '0 8px 16px -4px rgba(16, 185, 129, 0.2)' : '0 1px 3px rgba(0,0,0,0.02)'};">
                ${this.selectedRole === 'PATIENT' ? '<div style="position: absolute; top: 6px; right: 6px; width: 14px; height: 14px; background: #10b981; border-radius: 50%; color: #fff; font-size: 9px; display: flex; align-items: center; justify-content: center; font-weight: 900;">✓</div>' : ''}
                <div style="font-size: 26px; line-height: 1;">👤</div>
                <div style="font-weight: 800; font-size: 13px; color: #0f172a; margin-top: 6px;">Patient</div>
                <div style="font-size: 10px; color: #64748b; margin-top: 2px; font-weight: 500;">Dual Rx & Vault</div>
              </div>

              <!-- Card: DOCTOR -->
              <div class="auth-role-card ${this.selectedRole === 'DOCTOR' ? 'active-role' : ''}" data-role="DOCTOR" style="position: relative; padding: 14px 8px; border-radius: 16px; cursor: pointer; text-align: center; transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1); border: 2px solid ${this.selectedRole === 'DOCTOR' ? '#0284c7' : '#e2e8f0'}; background: ${this.selectedRole === 'DOCTOR' ? '#e0f2fe' : '#ffffff'}; box-shadow: ${this.selectedRole === 'DOCTOR' ? '0 8px 16px -4px rgba(2, 132, 199, 0.2)' : '0 1px 3px rgba(0,0,0,0.02)'};">
                ${this.selectedRole === 'DOCTOR' ? '<div style="position: absolute; top: 6px; right: 6px; width: 14px; height: 14px; background: #0284c7; border-radius: 50%; color: #fff; font-size: 9px; display: flex; align-items: center; justify-content: center; font-weight: 900;">✓</div>' : ''}
                <div style="font-size: 26px; line-height: 1;">🩺</div>
                <div style="font-weight: 800; font-size: 13px; color: #0f172a; margin-top: 6px;">Doctor</div>
                <div style="font-size: 10px; color: #64748b; margin-top: 2px; font-weight: 500;">PulseMD & OPD</div>
              </div>

              <!-- Card: PHARMACY -->
              <div class="auth-role-card ${this.selectedRole === 'PHARMACY' ? 'active-role' : ''}" data-role="PHARMACY" style="position: relative; padding: 14px 8px; border-radius: 16px; cursor: pointer; text-align: center; transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1); border: 2px solid ${this.selectedRole === 'PHARMACY' ? '#d97706' : '#e2e8f0'}; background: ${this.selectedRole === 'PHARMACY' ? '#fef3c7' : '#ffffff'}; box-shadow: ${this.selectedRole === 'PHARMACY' ? '0 8px 16px -4px rgba(217, 119, 6, 0.2)' : '0 1px 3px rgba(0,0,0,0.02)'};">
                ${this.selectedRole === 'PHARMACY' ? '<div style="position: absolute; top: 6px; right: 6px; width: 14px; height: 14px; background: #d97706; border-radius: 50%; color: #fff; font-size: 9px; display: flex; align-items: center; justify-content: center; font-weight: 900;">✓</div>' : ''}
                <div style="font-size: 26px; line-height: 1;">💊</div>
                <div style="font-weight: 800; font-size: 13px; color: #0f172a; margin-top: 6px;">Pharmacy</div>
                <div style="font-size: 10px; color: #64748b; margin-top: 2px; font-weight: 500;">Stock & Orders</div>
              </div>

              ${this.mode === 'login' ? `
              <!-- Card: ADMIN -->
              <div class="auth-role-card ${this.selectedRole === 'ADMIN' ? 'active-role' : ''}" data-role="ADMIN" style="position: relative; padding: 14px 8px; border-radius: 16px; cursor: pointer; text-align: center; transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1); border: 2px solid ${this.selectedRole === 'ADMIN' ? '#6366f1' : '#e2e8f0'}; background: ${this.selectedRole === 'ADMIN' ? '#e0e7ff' : '#ffffff'}; box-shadow: ${this.selectedRole === 'ADMIN' ? '0 8px 16px -4px rgba(99, 102, 241, 0.2)' : '0 1px 3px rgba(0,0,0,0.02)'};">
                ${this.selectedRole === 'ADMIN' ? '<div style="position: absolute; top: 6px; right: 6px; width: 14px; height: 14px; background: #6366f1; border-radius: 50%; color: #fff; font-size: 9px; display: flex; align-items: center; justify-content: center; font-weight: 900;">✓</div>' : ''}
                <div style="font-size: 26px; line-height: 1;">🛡️</div>
                <div style="font-weight: 800; font-size: 13px; color: #0f172a; margin-top: 6px;">Admin</div>
                <div style="font-size: 10px; color: #64748b; margin-top: 2px; font-weight: 500;">Control Plane</div>
              </div>
              ` : ''}

            </div>

            <!-- Role Destination Telemetry Banner -->
            <div style="margin-top: 12px; padding: 10px 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; font-size: 12px; color: #475569; display: flex; align-items: center; justify-content: space-between; gap: 10px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 14px;">🚀</span>
                <span>Destination: <strong style="color: #0f172a;">${roleCfg.destination}</strong></span>
              </div>
              <span style="font-family: monospace; font-size: 11px; color: ${roleCfg.color}; background: #ffffff; padding: 2px 8px; border-radius: 6px; border: 1px solid #e2e8f0; font-weight: 700;">${roleCfg.route}</span>
            </div>
          </div>

          <!-- Form Area: Login or Register -->
          ${this.mode === 'login' ? this.renderLoginForm(roleCfg) : this.renderRegisterForm(roleCfg)}

          <!-- Error Alert Banner -->
          ${this.errorMessage ? `
            <div style="padding: 12px 16px; margin-top: 16px; background: #fef2f2; border: 1px solid #fca5a5; border-radius: 12px; color: #991b1b; font-size: 13px; display: flex; align-items: center; gap: 10px; animation: shake 0.3s ease;">
              <span style="font-size: 16px;">⚠️</span>
              <div style="font-weight: 600;">${this.errorMessage}</div>
            </div>
          ` : ''}

          <!-- Quick 1-Click Instant Demo Launchers -->
          <div style="margin-top: 28px; padding-top: 20px; border-top: 1px dashed #e2e8f0;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
              <span style="font-size: 11.5px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.6px;">
                ⚡ 1-Click Instant Demo Access:
              </span>
              <span style="font-size: 11px; color: #94a3b8;">Click any card to auto-login</span>
            </div>

            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
              
              <!-- Persona 1: Patient -->
              <button class="btn-demo-persona" data-role="PATIENT" data-email="anil.verma@gmail.com" data-pass="pass123" style="display: flex; align-items: center; gap: 10px; padding: 9px 12px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; cursor: pointer; text-align: left; transition: all 0.2s ease;">
                <div style="width: 32px; height: 32px; border-radius: 50%; background: #ecfdf5; border: 1px solid #a7f3d0; display: flex; align-items: center; justify-content: center; font-size: 16px;">
                  👤
                </div>
                <div style="flex: 1; min-width: 0;">
                  <div style="font-size: 12.5px; font-weight: 800; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Anil Verma</div>
                  <div style="font-size: 10.5px; color: #059669; font-weight: 600;">Patient • Dual Rx</div>
                </div>
              </button>

              <!-- Persona 2: Doctor -->
              <button class="btn-demo-persona" data-role="DOCTOR" data-email="dr.vikram.sethi@gmail.com" data-pass="pass123" style="display: flex; align-items: center; gap: 10px; padding: 9px 12px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; cursor: pointer; text-align: left; transition: all 0.2s ease;">
                <div style="width: 32px; height: 32px; border-radius: 50%; background: #e0f2fe; border: 1px solid #bae6fd; display: flex; align-items: center; justify-content: center; font-size: 16px;">
                  🩺
                </div>
                <div style="flex: 1; min-width: 0;">
                  <div style="font-size: 12.5px; font-weight: 800; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Dr. Vikram Sethi</div>
                  <div style="font-size: 10.5px; color: #0284c7; font-weight: 600;">Doctor • Internal Med</div>
                </div>
              </button>

              <!-- Persona 3: Pharmacy -->
              <button class="btn-demo-persona" data-role="PHARMACY" data-email="medplus.pharmacy@gmail.com" data-pass="pass123" style="display: flex; align-items: center; gap: 10px; padding: 9px 12px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; cursor: pointer; text-align: left; transition: all 0.2s ease;">
                <div style="width: 32px; height: 32px; border-radius: 50%; background: #fef3c7; border: 1px solid #fde68a; display: flex; align-items: center; justify-content: center; font-size: 16px;">
                  💊
                </div>
                <div style="flex: 1; min-width: 0;">
                  <div style="font-size: 12.5px; font-weight: 800; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">MedPlus Pharmacy</div>
                  <div style="font-size: 10.5px; color: #d97706; font-weight: 600;">Dispensary • 24/7</div>
                </div>
              </button>

              <!-- Persona 4: Admin -->
              <button class="btn-demo-persona" data-role="ADMIN" data-email="admin.pulse@gmail.com" data-pass="admin123" style="display: flex; align-items: center; gap: 10px; padding: 9px 12px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; cursor: pointer; text-align: left; transition: all 0.2s ease;">
                <div style="width: 32px; height: 32px; border-radius: 50%; background: #e0e7ff; border: 1px solid #c7d2fe; display: flex; align-items: center; justify-content: center; font-size: 16px;">
                  🛡️
                </div>
                <div style="flex: 1; min-width: 0;">
                  <div style="font-size: 12.5px; font-weight: 800; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Platform Admin</div>
                  <div style="font-size: 10.5px; color: #6366f1; font-weight: 600;">Governance • Audit</div>
                </div>
              </button>

            </div>
          </div>

        </div>

      </div>
    `;

    this.bindEvents();
  }

  renderLoginForm(roleCfg) {
    return `
      <form id="form-auth-login" style="display: flex; flex-direction: column; gap: 16px;">
        
        <!-- Email Field with Icon -->
        <div>
          <label style="font-size: 13px; font-weight: 700; color: #334155; display: block; margin-bottom: 6px;">
            Gmail / Official Email
          </label>
          <div style="position: relative; display: flex; align-items: center;">
            <span style="position: absolute; left: 14px; font-size: 16px; color: #94a3b8;">✉️</span>
            <input 
              type="email" 
              id="auth-input-email" 
              placeholder="e.g. ${roleCfg.email}" 
              required 
              value="${roleCfg.email}"
              style="width: 100%; font-size: 14px; padding: 12px 14px 12px 42px; border-radius: 12px; border: 1.5px solid #cbd5e1; background: #ffffff; color: #0f172a; font-weight: 500; outline: none; transition: all 0.2s ease;"
              onfocus="this.style.borderColor='${roleCfg.color}'; this.style.boxShadow='0 0 0 3px ${roleCfg.glow}';"
              onblur="this.style.borderColor='#cbd5e1'; this.style.boxShadow='none';"
            />
          </div>
        </div>

        <!-- Password Field with Icon & Show/Hide Toggle -->
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <label style="font-size: 13px; font-weight: 700; color: #334155;">Password</label>
            <a href="javascript:void(0)" id="btn-forgot-password" style="font-size: 12px; color: ${roleCfg.color}; font-weight: 600; text-decoration: none;">Forgot password?</a>
          </div>
          <div style="position: relative; display: flex; align-items: center;">
            <span style="position: absolute; left: 14px; font-size: 16px; color: #94a3b8;">🔒</span>
            <input 
              type="${this.showPassword ? 'text' : 'password'}" 
              id="auth-input-password" 
              placeholder="••••••••" 
              required 
              value="${roleCfg.pass}"
              style="width: 100%; font-size: 14px; padding: 12px 42px 12px 42px; border-radius: 12px; border: 1.5px solid #cbd5e1; background: #ffffff; color: #0f172a; font-weight: 500; outline: none; transition: all 0.2s ease;"
              onfocus="this.style.borderColor='${roleCfg.color}'; this.style.boxShadow='0 0 0 3px ${roleCfg.glow}';"
              onblur="this.style.borderColor='#cbd5e1'; this.style.boxShadow='none';"
            />
            <button type="button" id="btn-toggle-password" style="position: absolute; right: 12px; background: none; border: none; cursor: pointer; font-size: 16px; color: #64748b; padding: 4px;" title="Toggle Password Visibility">
              ${this.showPassword ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        <!-- Remember Me Checkbox -->
        <div style="display: flex; align-items: center; gap: 8px; font-size: 13px; color: #475569;">
          <input type="checkbox" id="auth-remember-me" checked style="accent-color: ${roleCfg.color}; width: 16px; height: 16px; cursor: pointer;" />
          <label for="auth-remember-me" style="cursor: pointer; font-weight: 500;">
            Remember credentials & keep active session
          </label>
        </div>

        <!-- Submit Button with Dynamic Role Colors & Hover Glow -->
        <button 
          type="submit" 
          id="btn-auth-submit"
          style="width: 100%; padding: 14px 24px; font-size: 15px; font-weight: 800; border-radius: 14px; border: none; cursor: pointer; background: linear-gradient(135deg, ${roleCfg.color}, ${roleCfg.colorDark}); color: #ffffff; box-shadow: 0 10px 20px -5px ${roleCfg.glow}; display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 4px; transition: all 0.2s ease;"
          ${this.isSubmitting ? 'disabled' : ''}
          onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 14px 26px -4px ${roleCfg.glow}';"
          onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 10px 20px -5px ${roleCfg.glow}';"
        >
          <span>${this.isSubmitting ? 'Verifying Credentials...' : `Sign In as ${this.selectedRole} & Enter Portal`}</span>
          <span style="font-size: 16px;">➔</span>
        </button>
      </form>
    `;
  }

  renderRegisterForm(roleCfg) {
    return `
      <form id="form-auth-register" style="display: flex; flex-direction: column; gap: 14px;">
        
        <!-- Row 1: Name & Phone -->
        <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 10px;">
          <div>
            <label style="font-size: 12px; font-weight: 700; color: #334155; display: block; margin-bottom: 4px;">
              ${this.selectedRole === 'PHARMACY' ? 'Pharmacy / Store Name *' : 'Full Legal Name *'}
            </label>
            <input 
              type="text" 
              id="reg-fullname" 
              placeholder="${this.selectedRole === 'DOCTOR' ? 'Dr. Sarah Jenkins' : this.selectedRole === 'PHARMACY' ? 'Apollo 24/7 Medico' : 'Anil Kumar Verma'}" 
              required 
              style="width: 100%; font-size: 13px; padding: 11px 14px; border-radius: 10px; border: 1.5px solid #cbd5e1; background: #fff;" 
            />
          </div>

          <div>
            <label style="font-size: 12px; font-weight: 700; color: #334155; display: block; margin-bottom: 4px;">Phone Number *</label>
            <input 
              type="tel" 
              id="reg-phone" 
              placeholder="+91 98765 00000" 
              required 
              style="width: 100%; font-size: 13px; padding: 11px 14px; border-radius: 10px; border: 1.5px solid #cbd5e1; background: #fff;" 
            />
          </div>
        </div>

        <!-- Row 2: Email & Password -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div>
            <label style="font-size: 12px; font-weight: 700; color: #334155; display: block; margin-bottom: 4px;">Gmail / Official Email *</label>
            <input 
              type="email" 
              id="reg-email" 
              placeholder="user@gmail.com" 
              required 
              style="width: 100%; font-size: 13px; padding: 11px 14px; border-radius: 10px; border: 1.5px solid #cbd5e1; background: #fff;" 
            />
          </div>

          <div>
            <label style="font-size: 12px; font-weight: 700; color: #334155; display: block; margin-bottom: 4px;">Password *</label>
            <input 
              type="password" 
              id="reg-password" 
              placeholder="••••••••" 
              required 
              style="width: 100%; font-size: 13px; padding: 11px 14px; border-radius: 10px; border: 1.5px solid #cbd5e1; background: #fff;" 
            />
          </div>
        </div>

        <!-- Role-Specific Regulatory Fields -->
        ${this.selectedRole === 'DOCTOR' ? `
          <div style="padding: 14px; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; display: flex; flex-direction: column; gap: 8px;">
            <div style="font-size: 12px; font-weight: 800; color: #0284c7;">🩺 Medical Practitioner Credentials</div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <div>
                <label style="font-size: 11px; color: #475569; display: block; margin-bottom: 2px;">Medical Registration No (MRN) *</label>
                <input type="text" id="reg-mrn" placeholder="e.g. KMC-58291-2018" required style="width: 100%; font-size: 12px; padding: 8px 12px; border-radius: 8px; border: 1px solid #94a3b8; background: #fff;" />
              </div>

              <div>
                <label style="font-size: 11px; color: #475569; display: block; margin-bottom: 2px;">State Council *</label>
                <select id="reg-state-council" style="width: 100%; font-size: 12px; padding: 8px 12px; border-radius: 8px; border: 1px solid #94a3b8; background: #fff;">
                  <option value="Karnataka Medical Council (KMC)">Karnataka Medical Council (KMC)</option>
                  <option value="Maharashtra Medical Council (MMC)">Maharashtra Medical Council (MMC)</option>
                  <option value="Delhi Medical Council (DMC)">Delhi Medical Council (DMC)</option>
                </select>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 8px;">
              <div>
                <label style="font-size: 11px; color: #475569; display: block; margin-bottom: 2px;">Specialization *</label>
                <input type="text" id="reg-specialization" placeholder="e.g. Cardiology, Internal Medicine" required style="width: 100%; font-size: 12px; padding: 8px 12px; border-radius: 8px; border: 1px solid #94a3b8; background: #fff;" />
              </div>

              <div>
                <label style="font-size: 11px; color: #475569; display: block; margin-bottom: 2px;">Experience (Years) *</label>
                <input type="number" id="reg-experience" min="1" max="50" value="8" style="width: 100%; font-size: 12px; padding: 8px 12px; border-radius: 8px; border: 1px solid #94a3b8; background: #fff;" />
              </div>
            </div>
          </div>
        ` : ''}

        ${this.selectedRole === 'PHARMACY' ? `
          <div style="padding: 14px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; display: flex; flex-direction: column; gap: 8px;">
            <div style="font-size: 12px; font-weight: 800; color: #d97706;">💊 Drug License & Pharmacy Registry</div>
            
            <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 8px;">
              <div>
                <label style="font-size: 11px; color: #475569; display: block; margin-bottom: 2px;">Drug License Number (DLN) *</label>
                <input type="text" id="reg-dln" placeholder="e.g. KA-BLR-2026-9901" required style="width: 100%; font-size: 12px; padding: 8px 12px; border-radius: 8px; border: 1px solid #94a3b8; background: #fff;" />
              </div>

              <div>
                <label style="font-size: 11px; color: #475569; display: block; margin-bottom: 2px;">Pincode *</label>
                <input type="text" id="reg-pincode" placeholder="e.g. 560034" required style="width: 100%; font-size: 12px; padding: 8px 12px; border-radius: 8px; border: 1px solid #94a3b8; background: #fff;" />
              </div>
            </div>

            <div>
              <label style="font-size: 11px; color: #475569; display: block; margin-bottom: 2px;">Full Dispensary Address *</label>
              <input type="text" id="reg-address" placeholder="e.g. 14th Main, 4th Sector, HSR Layout, Bengaluru" required style="width: 100%; font-size: 12px; padding: 8px 12px; border-radius: 8px; border: 1px solid #94a3b8; background: #fff;" />
            </div>
          </div>
        ` : ''}

        <button 
          type="submit" 
          id="btn-auth-submit"
          style="width: 100%; padding: 14px 24px; font-size: 15px; font-weight: 800; border-radius: 14px; border: none; cursor: pointer; background: linear-gradient(135deg, ${roleCfg.color}, ${roleCfg.colorDark}); color: #ffffff; box-shadow: 0 10px 20px -5px ${roleCfg.glow}; display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 6px; transition: all 0.2s ease;"
          ${this.isSubmitting ? 'disabled' : ''}
        >
          <span>${this.isSubmitting ? 'Registering Health Account...' : `Register as ${this.selectedRole} & Enter Portal`}</span>
          <span style="font-size: 16px;">➔</span>
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
        if (this.selectedRole === "ADMIN") {
          this.selectedRole = "PATIENT";
        }
        this.errorMessage = "";
        window.location.hash = "#register";
        this.render();
      });
    }

    // Role Choice Cards
    this.container.querySelectorAll(".auth-role-card").forEach((card) => {
      card.addEventListener("click", () => {
        this.selectedRole = card.getAttribute("data-role");
        this.render();
      });
    });

    // Toggle Password Visibility Button
    const togglePassBtn = this.container.querySelector("#btn-toggle-password");
    if (togglePassBtn) {
      togglePassBtn.addEventListener("click", () => {
        this.showPassword = !this.showPassword;
        const passInput = this.container.querySelector("#auth-input-password");
        if (passInput) {
          passInput.type = this.showPassword ? "text" : "password";
          togglePassBtn.innerHTML = this.showPassword ? "🙈" : "👁️";
        }
      });
    }

    // Forgot Password Trigger
    const forgotBtn = this.container.querySelector("#btn-forgot-password");
    if (forgotBtn) {
      forgotBtn.addEventListener("click", () => {
        store.showToast("Password reset link sent to registered email.", "info");
      });
    }

    // 1-Click Demo Personas
    this.container.querySelectorAll(".btn-demo-persona").forEach((btn) => {
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
        const email = this.container.querySelector("#auth-input-email")?.value;
        const pass = this.container.querySelector("#auth-input-password")?.value;
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

      const session = await authService.login(email, password);
      const user = session.user;

      store.setCurrentUser(user);
      store.showToast(`Welcome back, ${user.full_name}!`, "success");

      if (typeof this.onSuccess === "function") {
        this.onSuccess(user);
      }

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
      const fullName = this.container.querySelector("#reg-fullname")?.value?.trim() || "";
      const phone = this.container.querySelector("#reg-phone")?.value?.trim() || "";
      const email = this.container.querySelector("#reg-email")?.value?.trim() || "";
      const password = this.container.querySelector("#reg-password")?.value || "";

      if (!fullName || !email || !password) {
        this.errorMessage = "Please fill in all mandatory fields: Full Name, Email, and Password.";
        this.isSubmitting = false;
        this.render();
        return;
      }

      const formData = {
        full_name: fullName,
        phone,
        email,
        password,
        role: this.selectedRole
      };

      if (this.selectedRole === "DOCTOR") {
        formData.doctor_profile = {
          mrn: this.container.querySelector("#reg-mrn")?.value || "",
          state_council: this.container.querySelector("#reg-state-council")?.value || "",
          specialization: this.container.querySelector("#reg-specialization")?.value || "",
          experience_years: Number(this.container.querySelector("#reg-experience")?.value) || 0
        };
      } else if (this.selectedRole === "PHARMACY") {
        formData.pharmacy_profile = {
          store_name: fullName,
          dln: this.container.querySelector("#reg-dln")?.value || "",
          address: this.container.querySelector("#reg-address")?.value || "",
          pincode: this.container.querySelector("#reg-pincode")?.value || ""
        };
      }

      this.isSubmitting = true;
      this.errorMessage = "";
      this.render();

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
