/**
 * PULSECARE TOP NAVIGATION (Miro Design Pattern)
 * Fully responsive across Mobile (<768px), Tablet (768px-1023px), and Desktop (1024px+).
 * Dynamically adapts navigation links, role badges, mobile hamburger menu, and drawer actions.
 */

import { store } from "../state/store.js";
import { authService } from "../services/authService.js";

export class NavbarComponent {
  constructor() {
    this.isMobileMenuOpen = false;
  }

  render() {
    const state = store.getState();
    const currentUser = authService.getCurrentUser() || state.currentUser;
    const role = currentUser ? (currentUser.role || "PATIENT") : null;

    let badgeText = "ABDM CONNECTED";
    let badgeColor = "var(--color-primary)";
    let badgeBg = "var(--color-brand-yellow)";
    let homeRoute = "#/";

    if (role === "DOCTOR") {
      badgeText = "PULSEMD CLINICAL";
      badgeColor = "#0284c7";
      badgeBg = "#e0f2fe";
      homeRoute = "#/doctor";
    } else if (role === "PHARMACY") {
      badgeText = "PULSEPHARM DISPENSARY";
      badgeColor = "#d97706";
      badgeBg = "#fef3c7";
      homeRoute = "#/pharmacy";
    } else if (role === "ADMIN") {
      badgeText = "NEXORA CONTROL PLANE";
      badgeColor = "#475569";
      badgeBg = "#f1f5f9";
      homeRoute = "#/admin";
    }

    return `
      <header class="top-nav" role="banner">
        <div class="container">
          <div class="top-nav-inner">
            
            <!-- Left: Logo & Desktop Links -->
            <div class="nav-left">
              <a href="${homeRoute}" class="logo-wordmark" id="nav-brand-logo" style="text-decoration: none; display: flex; align-items: center; gap: 8px;">
                <div class="logo-square" style="background-color: var(--color-brand-yellow); color: var(--color-primary); box-shadow: var(--shadow-sm); flex-shrink: 0;">
                  ⚡
                </div>
                <div class="logo-text" style="font-family: var(--font-family-display); font-size: clamp(20px, 2.5vw, 24px); font-weight: 800; letter-spacing: -0.8px; white-space: nowrap;">
                  PulseCare
                </div>
                <span class="badge-promo desktop-only" style="font-size: 10px; padding: 2px 8px; margin-left: 4px; background: ${badgeBg}; color: ${badgeColor}; font-weight: 700; border-radius: var(--radius-full); white-space: nowrap;">
                  ${badgeText}
                </span>
              </a>

              <!-- Desktop-Only Nav Links -->
              <nav aria-label="Main Navigation" class="nav-links-desktop">
                <ul class="nav-links" style="display: flex; align-items: center; gap: var(--space-md); list-style: none; margin: 0; padding: 0;">
                  ${this.renderNavLinks(role)}
                </ul>
              </nav>
            </div>

            <!-- Right: Role Actions & Mobile Hamburger -->
            <div class="nav-right" style="display: flex; align-items: center; gap: 8px;">
              
              ${currentUser ? `
                <!-- Desktop Identity & Role Chip -->
                <div class="nav-user-chip desktop-only" style="display: flex; align-items: center; gap: var(--space-xs); padding: 5px 12px; background: var(--color-surface); border: 1px solid var(--color-hairline); border-radius: var(--radius-full); font-size: 13px;">
                  <div style="width: 24px; height: 24px; border-radius: 50%; background: ${role === 'DOCTOR' ? '#0284c7' : role === 'PHARMACY' ? '#d97706' : role === 'ADMIN' ? '#475569' : 'var(--color-brand-yellow)'}; color: #ffffff; font-weight: 700; font-size: 11px; display: flex; align-items: center; justify-content: center;">
                    ${role === 'DOCTOR' ? '🩺' : role === 'PHARMACY' ? '💊' : role === 'ADMIN' ? '🛡️' : '👤'}
                  </div>
                  <div style="text-align: left; max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    <span style="font-weight: 700; color: var(--color-primary);">${currentUser.full_name ? currentUser.full_name.split(" ")[0] : "User"}</span>
                    <span style="font-size: 11px; font-weight: 600; color: ${badgeColor}; font-family: var(--font-family-mono);"> [${role}]</span>
                  </div>
                </div>

                <!-- Global Live Sync Button -->
                <button class="pill-tab btn-nav-sync-all desktop-only" style="padding: 6px 12px; font-size: 12px; background: #f0fdf4; color: #166534; border-color: #86efac;" title="Sync Live Data">
                  <span id="nav-sync-icon">🔄</span> <span>Sync</span>
                </button>

                <!-- Switch Role Button -->
                <button class="pill-tab btn-nav-auth-trigger desktop-only" style="padding: 6px 12px; font-size: 12px; background: #fff; border-color: var(--color-hairline);" title="Switch Role">
                  <span>Switch Role</span>
                </button>

                <!-- Logout Button -->
                <button class="pill-tab btn-nav-logout desktop-only" style="padding: 6px 10px; font-size: 12px; color: #dc2626; border-color: #fecaca; background: #fff;" title="Log Out">
                  <span>⏻</span>
                </button>
              ` : `
                <!-- Guest Sync Button -->
                <button class="pill-tab btn-nav-sync-all desktop-only" style="padding: 7px 12px; font-size: 12px; background: #f0fdf4; color: #166534; border-color: #86efac;" title="Sync Live Data">
                  <span id="nav-sync-icon">🔄</span> <span>Sync</span>
                </button>

                <a href="#login" class="button-primary btn-nav-login desktop-only" style="padding: 8px 14px; font-size: 12px; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; white-space: nowrap;">
                  <span>🔐 Sign In</span>
                </a>
              `}

              ${role === 'DOCTOR' ? `
                <a href="#/doctor" class="button-primary desktop-only" style="padding: 8px 14px; font-size: 12px; text-decoration: none; background: #0284c7; border-color: #0284c7; white-space: nowrap;">
                  <span>🩺 OPD Queue</span>
                </a>
              ` : role === 'PHARMACY' ? `
                <a href="#/pharmacy" class="button-primary desktop-only" style="padding: 8px 14px; font-size: 12px; text-decoration: none; background: #d97706; border-color: #d97706; white-space: nowrap;">
                  <span>💊 Dispensary</span>
                </a>
              ` : role === 'ADMIN' ? `
                <a href="#/admin" class="button-primary desktop-only" style="padding: 8px 14px; font-size: 12px; text-decoration: none; background: #475569; border-color: #475569; white-space: nowrap;">
                  <span>🛡️ Governance</span>
                </a>
              ` : `
                <button class="button-yellow btn-nav-scan-cta desktop-only" style="padding: 8px 14px; font-size: 12px; white-space: nowrap;">
                  <span>📸 Scan Rx</span>
                </button>
              `}

              <!-- Mobile Header Quick Pill: Compact Role Indicator -->
              <div class="mobile-only" style="display: flex; align-items: center; gap: 6px;">
                <div style="font-size: 11px; font-weight: 700; padding: 4px 8px; border-radius: var(--radius-full); background: ${badgeBg}; color: ${badgeColor};">
                  ${role === 'DOCTOR' ? '🩺 Doctor' : role === 'PHARMACY' ? '💊 Pharmacy' : role === 'ADMIN' ? '🛡️ Admin' : '👤 Patient'}
                </div>
                
                <!-- Hamburger Menu Trigger -->
                <button id="btn-mobile-hamburger" class="btn-hamburger" aria-label="Toggle Navigation Menu" style="background: transparent; border: 1px solid var(--color-hairline); border-radius: 8px; padding: 6px 9px; font-size: 18px; line-height: 1; cursor: pointer; color: var(--color-primary); display: flex; align-items: center; justify-content: center;">
                  ☰
                </button>
              </div>

            </div>

          </div>
        </div>

        <!-- Mobile Drawer Menu Overlay -->
        <div id="nav-mobile-drawer" class="mobile-nav-drawer" style="display: none;">
          <div class="mobile-nav-backdrop" id="drawer-backdrop"></div>
          <div class="mobile-nav-panel">
            <div class="mobile-nav-header">
              <div style="display: flex; align-items: center; gap: 8px;">
                <div class="logo-square" style="width: 28px; height: 28px; background-color: var(--color-brand-yellow); color: var(--color-primary); font-size: 14px;">⚡</div>
                <div style="font-weight: 800; font-size: 18px; color: var(--color-primary);">PulseCare Menu</div>
              </div>
              <button id="btn-close-drawer" style="background: transparent; border: none; font-size: 22px; cursor: pointer; color: var(--color-slate); padding: 4px;">✕</button>
            </div>

            <div class="mobile-nav-body">
              ${currentUser ? `
                <div style="padding: 12px; background: var(--color-surface); border-radius: var(--radius-lg); margin-bottom: 16px; border: 1px solid var(--color-hairline);">
                  <div style="font-size: 14px; font-weight: 800; color: var(--color-primary);">${currentUser.full_name || "User"}</div>
                  <div style="font-size: 12px; color: var(--color-slate); font-family: var(--font-family-mono);">${currentUser.email || ""}</div>
                  <div style="margin-top: 6px; display: inline-block; font-size: 10.5px; font-weight: 700; padding: 2px 8px; border-radius: 9999px; background: ${badgeBg}; color: ${badgeColor};">
                    ${badgeText}
                  </div>
                </div>
              ` : `
                <div style="padding: 12px; background: var(--color-surface-yellow); border-radius: var(--radius-lg); margin-bottom: 16px;">
                  <div style="font-size: 13px; font-weight: 700;">Welcome to PulseCare</div>
                  <div style="font-size: 11.5px; color: var(--color-slate);">Sign in to access your prescriptions and EMR.</div>
                </div>
              `}

              <!-- Navigation Links List -->
              <div class="mobile-nav-section-title">Navigation</div>
              <ul class="mobile-drawer-links">
                <li><a href="#/" class="mobile-drawer-link nav-tab-link" data-tab="prescriptions"><span>📄</span> Dual Rx Prescription Hub</a></li>
                <li><a href="#/doctors" class="mobile-drawer-link nav-tab-link" data-tab="doctors"><span>🩺</span> Find & Book Doctors</a></li>
                <li><a href="#/pharmacy-radar" class="mobile-drawer-link nav-tab-link" data-tab="pharmacy_radar"><span>📍</span> 5 km Stock Radar Map</a></li>
                <li><a href="#/vault" class="mobile-drawer-link nav-tab-link" data-tab="vault"><span>📂</span> ABDM / FHIR EMR Vault</a></li>
                <li style="border-top: 1px solid var(--color-hairline); margin-top: 8px; padding-top: 8px;">
                  <a href="#/doctor" class="mobile-drawer-link" style="color: #0284c7;"><span>🩺</span> Doctor OPD Workstation</a>
                </li>
                <li><a href="#/pharmacy" class="mobile-drawer-link" style="color: #d97706;"><span>💊</span> Pharmacist Dispensary Queue</a></li>
                <li><a href="#/admin" class="mobile-drawer-link" style="color: #475569;"><span>🛡️</span> Admin Governance Console</a></li>
              </ul>

              <!-- Drawer Quick Actions -->
              <div class="mobile-nav-section-title" style="margin-top: 20px;">System Actions</div>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                <button class="button-secondary btn-nav-sync-all" style="width: 100%; justify-content: center; font-size: 13px; padding: 10px;">
                  <span>🔄 Sync Live Platform Data</span>
                </button>

                <button class="button-secondary btn-nav-auth-trigger" style="width: 100%; justify-content: center; font-size: 13px; padding: 10px;">
                  <span>👥 Switch Role (Patient / Doctor / Pharmacy / Admin)</span>
                </button>

                ${currentUser ? `
                  <button class="button-secondary btn-nav-logout" style="width: 100%; justify-content: center; font-size: 13px; padding: 10px; color: #dc2626; border-color: #fecaca; background: #fff5f5;">
                    <span>⏻ Log Out</span>
                  </button>
                ` : `
                  <a href="#login" class="button-primary btn-nav-login" style="width: 100%; text-align: center; text-decoration: none; font-size: 13px; padding: 10px;">
                    <span>🔐 Sign In / Register</span>
                  </a>
                `}
              </div>
            </div>
          </div>
        </div>

      </header>
    `;
  }

  renderNavLinks(role) {
    if (role === "DOCTOR") {
      return `
        <li><a href="#/doctor" class="nav-link" style="color: #0284c7; font-weight: 700;">🩺 Doctor OPD</a></li>
        <li><a href="#/vault" class="nav-link nav-tab-link" data-tab="vault">📂 EMR Vault</a></li>
        <li><a href="#/" class="nav-link nav-tab-link" data-tab="prescriptions">👥 Patient View</a></li>
      `;
    } else if (role === "PHARMACY") {
      return `
        <li><a href="#/pharmacy" class="nav-link" style="color: #d97706; font-weight: 700;">💊 Pharmacy Queue</a></li>
        <li><a href="#/pharmacy-radar" class="nav-link nav-tab-link" data-tab="pharmacy_radar">📍 5km Radar</a></li>
        <li><a href="#/" class="nav-link nav-tab-link" data-tab="prescriptions">👥 Patient View</a></li>
      `;
    } else if (role === "ADMIN") {
      return `
        <li><a href="#/admin" class="nav-link" style="color: #475569; font-weight: 700;">🛡️ Governance</a></li>
        <li><a href="#/" class="nav-link nav-tab-link" data-tab="prescriptions">👥 Patient View</a></li>
      `;
    }

    // Default Patient links
    return `
      <li><a href="#/" class="nav-link nav-tab-link" data-tab="prescriptions">Dual Rx Hub</a></li>
      <li><a href="#/doctors" class="nav-link nav-tab-link" data-tab="doctors">Find Doctors</a></li>
      <li><a href="#/pharmacy-radar" class="nav-link nav-tab-link" data-tab="pharmacy_radar">5km Stock Radar</a></li>
      <li><a href="#/vault" class="nav-link nav-tab-link" data-tab="vault">EMR Vault</a></li>
    `;
  }

  bindEvents() {
    // Hamburger drawer toggles
    const hamburger = document.getElementById("btn-mobile-hamburger");
    const drawer = document.getElementById("nav-mobile-drawer");
    const closeBtn = document.getElementById("btn-close-drawer");
    const backdrop = document.getElementById("drawer-backdrop");

    const openDrawer = () => {
      if (drawer) {
        drawer.style.display = "block";
        document.body.style.overflow = "hidden";
      }
    };

    const closeDrawer = () => {
      if (drawer) {
        drawer.style.display = "none";
        document.body.style.overflow = "";
      }
    };

    if (hamburger) hamburger.addEventListener("click", openDrawer);
    if (closeBtn) closeBtn.addEventListener("click", closeDrawer);
    if (backdrop) backdrop.addEventListener("click", closeDrawer);

    // Navigation tab links
    document.querySelectorAll(".nav-tab-link").forEach((link) => {
      link.addEventListener("click", (e) => {
        closeDrawer();
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
        closeDrawer();
        window.location.hash = "#/";
        const event = new CustomEvent("switchPatientTab", { detail: { tab: "prescriptions", triggerScan: true } });
        window.dispatchEvent(event);
      });
    }

    // Auth trigger
    document.querySelectorAll(".btn-nav-auth-trigger").forEach((btn) => {
      btn.addEventListener("click", () => {
        closeDrawer();
        const event = new CustomEvent("openAuthModal");
        window.dispatchEvent(event);
      });
    });

    // Login link / button trigger
    document.querySelectorAll(".btn-nav-login").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        closeDrawer();
        window.location.hash = "#login";
        window.dispatchEvent(new CustomEvent("userSessionChanged"));
      });
    });

    // Global Sync All Data trigger
    document.querySelectorAll(".btn-nav-sync-all").forEach((btn) => {
      btn.addEventListener("click", () => {
        closeDrawer();
        const icon = btn.querySelector("#nav-sync-icon") || btn.querySelector("span");
        if (icon) {
          icon.style.display = "inline-block";
          icon.style.transition = "transform 0.6s ease";
          icon.style.transform = "rotate(360deg)";
          setTimeout(() => {
            if (icon) icon.style.transform = "rotate(0deg)";
          }, 600);
        }

        store.showToast("🔄 Syncing live data from MongoDB Atlas...", "info");
        window.dispatchEvent(new CustomEvent("syncLivePlatformData"));
        setTimeout(() => {
          store.showToast("✅ Live data synced (Appointments, Orders, Records)!", "success");
        }, 300);
      });
    });

    // Logout trigger
    document.querySelectorAll(".btn-nav-logout").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        closeDrawer();
        store.logout();
      });
    });
  }
}
