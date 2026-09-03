/**
 * PULSECARE APPLICATION ROUTER & ROLE-BASED ROUTING ENGINE
 * Features:
 *  - Automatic Role-Enforced Landing:
 *      * DOCTOR -> Doctor OPD Dashboard (/doctor)
 *      * PHARMACY -> Pharmacy Dispensary Dashboard (/pharmacy)
 *      * ADMIN -> Admin Verification Console (/admin)
 *      * PATIENT / Public -> Patient Operating System (/)
 *  - Explicit Optional "Switch to Patient View" preview mode for providers
 */

import { PatientPortalComponent } from "./components/PatientPortal.js";
import { AuthViewComponent } from "./components/AuthView.js";
import { DoctorQuickRxComponent } from "./components/DoctorQuickRx.js";
import { PharmacistWorkstationComponent } from "./components/PharmacistWorkstation.js";
import { AdminVerificationConsoleComponent } from "./components/AdminVerificationConsole.js";
import { authService } from "./services/authService.js";
import { store } from "./state/store.js";

export const ROUTES = {
  HOME: "/",
  PATIENT_PORTAL: "/patient-portal",
  PRESCRIPTIONS: "/prescriptions",
  DOCTORS: "/doctors",
  PHARMACY_RADAR: "/pharmacy-radar",
  VAULT: "/vault",
  ORDERS: "/orders",
  DOCTOR_STATION: "/doctor",
  PHARMACY_STATION: "/pharmacy",
  ADMIN_CONSOLE: "/admin",
  PATIENT_VIEW: "/patient-view",
  AUTH: "/auth",
  LOGIN: "/login",
  REGISTER: "/register"
};

export class PulseCareRouter {
  constructor(mountElement) {
    this.mount = mountElement;
    this.currentRoute = "/";
    this.currentInstance = null;
    this.listeners = [];
  }

  init() {
    window.addEventListener("hashchange", () => this.handleRouteChange());
    window.addEventListener("popstate", () => this.handleRouteChange());
    this.handleRouteChange();
  }

  getPath() {
    const hash = window.location.hash.replace(/^#/, "");
    if (hash) {
      return hash.startsWith("/") ? hash : `/${hash}`;
    }
    return window.location.pathname || "/";
  }

  navigate(to, options = {}) {
    if (to.startsWith("#")) {
      window.location.hash = to;
    } else {
      window.location.hash = `#${to.replace(/^\//, "")}`;
    }
    if (options.replace) {
      window.location.replace(window.location.href);
    }
    this.handleRouteChange();
  }

  onRouteChange(callback) {
    this.listeners.push(callback);
  }

  handleRouteChange() {
    const path = this.getPath();
    this.currentRoute = path;
    const cleanPath = path.toLowerCase().split("?")[0];
    const currentUser = authService.getCurrentUser();
    const userRole = currentUser ? (currentUser.role || "PATIENT") : null;

    if (!this.mount) {
      this.mount = document.getElementById("patient-portal-mount");
    }

    if (!this.mount) return;

    this.mount.innerHTML = "";

    // 1. Auth Gateway View (Login / Register)
    if (cleanPath === "/login" || cleanPath === "/register" || cleanPath === "/auth") {
      this.currentInstance = new AuthViewComponent(this.mount, (user) => {
        if (user?.role === "DOCTOR") this.navigate("/doctor");
        else if (user?.role === "PHARMACY") this.navigate("/pharmacy");
        else if (user?.role === "ADMIN") this.navigate("/admin");
        else this.navigate("/");
      });
      this.currentInstance.render();
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // 2. Doctor Dashboard: Default view for DOCTOR role (unless explicit /patient-view requested)
    if (
      userRole === "DOCTOR" &&
      cleanPath !== "/patient-view" &&
      cleanPath !== "/patient-preview" &&
      cleanPath !== "/vault"
    ) {
      this.renderDoctorModule(this.mount);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (cleanPath === "/doctor" || cleanPath === "/pulsemd") {
      this.renderDoctorModule(this.mount);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // 3. Pharmacy Dashboard: Default view for PHARMACY role (unless explicit /patient-view requested)
    if (
      userRole === "PHARMACY" &&
      cleanPath !== "/patient-view" &&
      cleanPath !== "/patient-preview"
    ) {
      this.renderPharmacyModule(this.mount);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (cleanPath === "/pharmacy" || cleanPath === "/pulsepharm") {
      this.renderPharmacyModule(this.mount);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // 4. Admin Dashboard: Default view for ADMIN role (unless explicit /patient-view requested)
    if (
      userRole === "ADMIN" &&
      cleanPath !== "/patient-view" &&
      cleanPath !== "/patient-preview"
    ) {
      this.renderAdminModule(this.mount);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (cleanPath === "/admin" || cleanPath === "/console") {
      this.renderAdminModule(this.mount);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // 5. Patient Portal Route (Default for PATIENT and explicit preview)
    const isDoctorPreview = userRole === "DOCTOR" && (cleanPath === "/patient-view" || cleanPath === "/patient-preview");
    
    if (isDoctorPreview) {
      const banner = document.createElement("div");
      banner.innerHTML = `
        <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: var(--radius-lg); padding: 10px 18px; margin: var(--space-md) auto 0 auto; max-width: 1200px; display: flex; justify-content: space-between; align-items: center;">
          <div style="font-size: 13px; color: #1e40af; font-weight: 600;">
            👁️ <strong>Patient View Preview Mode</strong>: Viewing Patient Interface as ${currentUser?.full_name || 'Dr. Vikram Sethi'}.
          </div>
          <a href="#/doctor" class="button-primary" style="padding: 5px 14px; font-size: 12px; text-decoration: none; background: #0284c7; border-color: #0284c7;">
            <span>⬅ Return to Doctor Dashboard</span>
          </a>
        </div>
      `;
      this.mount.appendChild(banner);
    }

    const patientMount = document.createElement("div");
    this.mount.appendChild(patientMount);

    this.currentInstance = new PatientPortalComponent(patientMount);
    this.currentInstance.render();

    let targetTab = "prescriptions";
    if (cleanPath === "/doctors") targetTab = "doctors";
    else if (cleanPath === "/pharmacy-radar") targetTab = "pharmacy_radar";
    else if (cleanPath === "/vault") targetTab = "vault";
    else if (cleanPath === "/orders") targetTab = "orders";
    else if (cleanPath === "/prescriptions" || cleanPath === "/patient-portal") targetTab = "prescriptions";

    window.dispatchEvent(new CustomEvent("switchPatientTab", { detail: { tab: targetTab } }));
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Notify listeners
    this.listeners.forEach((cb) => cb(this.currentRoute));
  }

  renderDoctorModule(container) {
    container.innerHTML = `
      <div class="doctor-module-container" style="padding-top: var(--space-md); padding-bottom: var(--space-xl);">
        <div id="doctor-station-mount"></div>
      </div>
    `;

    const stationMount = document.getElementById("doctor-station-mount");
    if (stationMount) {
      const rx = new DoctorQuickRxComponent(stationMount);
      rx.render();
    }
  }

  renderPharmacyModule(container) {
    container.innerHTML = `
      <div class="pharmacy-module-container" style="padding-top: var(--space-md); padding-bottom: var(--space-xl);">
        <div id="pharmacy-workstation-mount"></div>
      </div>
    `;

    const pharmMount = document.getElementById("pharmacy-workstation-mount");
    if (pharmMount) {
      const workstation = new PharmacistWorkstationComponent(pharmMount);
      workstation.render();
    }
  }

  renderAdminModule(container) {
    container.innerHTML = `
      <div class="admin-module-container" style="padding-top: var(--space-md); padding-bottom: var(--space-xl);">
        <div id="admin-console-mount"></div>
      </div>
    `;

    const adminMount = document.getElementById("admin-console-mount");
    if (adminMount) {
      const consoleComp = new AdminVerificationConsoleComponent(adminMount);
      consoleComp.render();
    }
  }
}

export let router = null;

export function initRouter(mount) {
  router = new PulseCareRouter(mount);
  router.init();
  return router;
}
