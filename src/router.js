/**
 * PULSECARE APPLICATION ROUTER & REACT ROUTER INTEGRATION
 * Features:
 *  - Automatic Role-Enforced Landing (Doctors -> PulseMD, Pharmacy -> PulsePharm, Admin -> Control Plane, Patient -> Portal)
 *  - Explicit URL Override Routing (#/doctor, #/pharmacy, #/admin, #/patient, #/login)
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

    // 1. Auth Gateway View
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

    // 2. Doctor Module Route
    if (cleanPath === "/doctor" || cleanPath === "/pulsemd" || (cleanPath === "/" && userRole === "DOCTOR")) {
      this.renderDoctorModule(this.mount);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // 3. Pharmacy Module Route
    if (cleanPath === "/pharmacy" || cleanPath === "/pulsepharm" || (cleanPath === "/" && userRole === "PHARMACY")) {
      this.renderPharmacyModule(this.mount);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // 4. Admin Module Route
    if (cleanPath === "/admin" || cleanPath === "/console" || (cleanPath === "/" && userRole === "ADMIN")) {
      this.renderAdminModule(this.mount);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // 5. Patient Portal Route (Default or explicit tab)
    this.currentInstance = new PatientPortalComponent(this.mount);
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
