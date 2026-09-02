/**
 * PULSECARE TOP NAVIGATION (Miro Design Pattern)
 * Dynamically adapts navigation links, role badges, and actions based on active logged-in role.
 */

import { store } from "../state/store.js";
import { authService } from "../services/authService.js";

export class NavbarComponent {
  render() {
    const state = store.getState();
    const currentUser = authService.getCurrentUser() || state.currentUser;
    const role = currentUser ? (currentUser.role || "PATIENT") : null;

    let badgeText = "ABDM CONNECTED";
    let badgeColor = "var(--color-primary)";
    let badgeBg = "var(--color-brand-yellow)";

    if (role === "DOCTOR") {
      badgeText = "PULSEMD CLINICAL";
      badgeColor = "#0284c7";
      badgeBg = "#e0f2fe";
    } else if (role === "PHARMACY") {
      badgeText = "PULSEPHARM DISPENSARY";
      badgeColor = "#d97706";
      badgeBg = "#fef3c7";
    } else if (role === "ADMIN") {
      badgeText = "NEXORA CONTROL PLANE";
      badgeColor = "#475569";
      badgeBg = "#f1f5f9";
    }

    return `
      <header class="top-nav" role="banner">
        <div class="container">
          <div class="top-nav-inner">
            
            <!-- Left: Logo & Section Tabs -->
            <div class="nav-left">
              <a href="#/" class="logo-wordmark" id="nav-brand-logo" style="text-decoration: none;">
                <div class="logo-square" style="background-color: var(--color-brand-yellow); color: var(--color-primary); box-shadow: var(--shadow-sm);">
                  ⚡
                </div>
                <div class="logo-text" style="font-family: var(--font-family-display); font-size: 24px; font-weight: 800; letter-spacing: -0.8px;">
                  PulseCare
                </div>
                <span class="badge-promo" style="font-size: 10px; padding: 2px 8px; margin-left: 4px; background: ${badgeBg}; color: ${badgeColor}; font-weight: 700;">
                  ${badgeText}
                </span>
              </a>

              <nav aria-label="Main Navigation">
                <ul class="nav-links">
                  ${this.renderNavLinks(role)}
                </ul>
              </nav>
            </div>

            <!-- Right: Active Role Profile & Quick Action Pill -->
            <div class="nav-right">
              
              ${currentUser ? `
                <!-- Identity & Role Chip -->
                <div style="display: flex; align-items: center; gap: var(--space-xs); padding: 5px 12px; background: var(--color-surface); border: 1px solid var(--color-hairline); border-radius: var(--radius-full); font-size: 13px;">
                  <div style="width: 24px; height: 24px; border-radius: 50%; background: ${role === 'DOCTOR' ? '#0284c7' : role === 'PHARMACY' ? '#d97706' : role === 'ADMIN' ? '#475569' : 'var(--color-brand-yellow)'}; color: #ffffff; font-weight: 700; font-size: 11px; display: flex; align-items: center; justify-content: center;">
                    ${role === 'DOCTOR' ? '🩺' : role === 'PHARMACY' ? '💊' : role === 'ADMIN' ? '🛡️' : '👤'}
                  </div>
                  <div style="text-align: left;">
                    <span style="font-weight: 700; color: var(--color-primary);">${currentUser.full_name ? currentUser.full_name.split(" ")[0] : "User"}</span>
                    <span style="font-size: 11px; font-weight: 600; color: ${badgeColor}; font-family: var(--font-family-mono);"> [${role}]</span>
                  </div>
                </div>

                <!-- Switch Role Button -->
                <button class="pill-tab btn-nav-auth-trigger" style="padding: 6px 12px; font-size: 12px; background: #fff; border-color: var(--color-hairline);" title="Switch between Patient, Doctor, Pharmacy, Admin">
                  <span>🔄 Switch Role</span>
                </button>

                <!-- Logout Action -->
                <button class="pill-tab btn-nav-logout" style="padding: 6px 10px; font-size: 12px; color: #dc2626; border-color: #fecaca; background: #fff;" title="Log Out">
                  <span>⏻ Log Out</span>
                </button>
              ` : `
                <a href="#login" class="button-primary btn-nav-login" style="padding: 9px 18px; font-size: 13px; text-decoration: none; display: inline-flex; align-items: center; gap: 6px;">
                  <span>🔐 Sign In / Select Role</span>
                </a>
              `}

              ${role === 'DOCTOR' ? `
                <a href="#/doctor" class="button-primary" style="padding: 9px 16px; font-size: 13px; text-decoration: none; background: #0284c7; border-color: #0284c7;">
                  <span>🩺 OPD Console</span>
                </a>
              ` : role === 'PHARMACY' ? `
                <a href="#/pharmacy" class="button-primary" style="padding: 9px 16px; font-size: 13px; text-decoration: none; background: #d97706; border-color: #d97706;">
                  <span>💊 Order Queue</span>
                </a>
              ` : `
                <button class="button-yellow btn-nav-scan-cta" style="padding: 9px 18px; font-size: 13px;">
                  <span>📸 Scan Rx</span>
                </button>
              `}

            </div>

          </div>
        </div>
      </header>
    `;
  }

  renderNavLinks(role) {
    if (role === "DOCTOR") {
      return `
        <li><a href="#/doctor" class="nav-link" style="color: #0284c7; font-weight: 700;">🩺 OPD Queue & Rx Hub</a></li>
        <li><a href="#/vault" class="nav-link nav-tab-link" data-tab="vault">📂 Patient EMR Vault</a></li>
        <li><a href="#/" class="nav-link" style="color: var(--color-slate);">👥 Patient View</a></li>
      `;
    } else if (role === "PHARMACY") {
      return `
        <li><a href="#/pharmacy" class="nav-link" style="color: #d97706; font-weight: 700;">💊 Live Inventory & Dispense</a></li>
        <li><a href="#/pharmacy-radar" class="nav-link nav-tab-link" data-tab="pharmacy_radar">📍 5km Radar Map</a></li>
        <li><a href="#/" class="nav-link" style="color: var(--color-slate);">👥 Patient View</a></li>
      `;
    } else if (role === "ADMIN") {
      return `
        <li><a href="#/admin" class="nav-link" style="color: #475569; font-weight: 700;">🛡️ Verification Console</a></li>
        <li><a href="#/" class="nav-link" style="color: var(--color-slate);">👥 Patient View</a></li>
      `;
    }

    // Default / Patient links
    return `
      <li><a href="#/" class="nav-link nav-tab-link" data-tab="prescriptions">Dual Rx Hub</a></li>
      <li><a href="#/doctors" class="nav-link nav-tab-link" data-tab="doctors">Find Doctors</a></li>
      <li><a href="#/pharmacy-radar" class="nav-link nav-tab-link" data-tab="pharmacy_radar">5km Stock Radar</a></li>
      <li><a href="#/vault" class="nav-link nav-tab-link" data-tab="vault">EMR Vault</a></li>
      <li><a href="#/doctor" class="nav-link" style="color: #0284c7; font-weight: 600;">🩺 PulseMD</a></li>
      <li><a href="#/pharmacy" class="nav-link" style="color: #d97706; font-weight: 600;">💊 PulsePharm</a></li>
    `;
  }

  bindEvents() {
    // Brand Logo trigger
    const brandLogo = document.getElementById("nav-brand-logo");
    if (brandLogo) {
      brandLogo.addEventListener("click", (e) => {
        window.location.hash = "#/";
        window.dispatchEvent(new CustomEvent("userSessionChanged"));
      });
    }

    // Navigation tab links
    document.querySelectorAll(".nav-tab-link").forEach((link) => {
      link.addEventListener("click", (e) => {
        const tab = link.getAttribute("data-tab");
        const href = link.getAttribute("href");
        if (href && href.startsWith("#")) {
          window.location.hash = href;
        }
        if (tab) {
          const event = new CustomEvent("switchPatientTab", { detail: { tab } });
          window.dispatchEvent(event);
        }
      });
    });

    const scanCta = document.querySelector(".btn-nav-scan-cta");
    if (scanCta) {
      scanCta.addEventListener("click", () => {
        window.location.hash = "#/";
        const event = new CustomEvent("switchPatientTab", { detail: { tab: "prescriptions", triggerScan: true } });
        window.dispatchEvent(event);
      });
    }

    // Auth trigger
    document.querySelectorAll(".btn-nav-auth-trigger").forEach((btn) => {
      btn.addEventListener("click", () => {
        const event = new CustomEvent("openAuthModal");
        window.dispatchEvent(event);
      });
    });

    // Login link / button trigger
    document.querySelectorAll(".btn-nav-login").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.hash = "#login";
        window.dispatchEvent(new CustomEvent("userSessionChanged"));
      });
    });

    // Logout trigger
    document.querySelectorAll(".btn-nav-logout").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        store.logout();
      });
    });
  }
}
