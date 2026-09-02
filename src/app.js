/**
 * PULSECARE PATIENT APPLICATION ORCHESTRATOR
 * Unifies PATIENT_PRD.md features with Miro Design System patterns (DESIGN.md)
 */

import { store } from "./state/store.js";
import { NavbarComponent } from "./components/Navbar.js";
import { FooterComponent } from "./components/Footer.js";
import { ModalManagerComponent } from "./components/FhirModal.js";
import { PulseCareFloatingChatComponent } from "./components/PulseCareFloatingChat.js";
import { initRouter, router } from "./router.js";

class PulseCareApp {
  constructor() {
    this.navInstance = null;
    this.routerInstance = null;
  }

  init() {
    const navMount = document.getElementById("navbar-mount");
    const portalMount = document.getElementById("patient-portal-mount");
    const footerMount = document.getElementById("footer-mount");
    const modalMount = document.getElementById("modal-mount");
    const chatMount = document.getElementById("pulsecare-chat-mount");

    // 1. Mount Top Sticky Navigation (Miro Design)
    if (navMount) {
      this.navInstance = new NavbarComponent();
      navMount.innerHTML = this.navInstance.render();
      this.navInstance.bindEvents();
    }

    // 2. Initialize Centralized Router & Route Handlers
    this.routerInstance = initRouter(portalMount);

    // 3. Mount Massive 6-Column Dark Footer
    if (footerMount) {
      footerMount.innerHTML = new FooterComponent().render();
    }

    // 4. Mount Global Modals & Toast Manager
    if (modalMount) {
      const modal = new ModalManagerComponent(modalMount);
      modal.render();
    }

    // 5. Mount Persistent Floating AI Companion (PulseCare AI)
    if (chatMount) {
      const chat = new PulseCareFloatingChatComponent(chatMount);
      chat.render();
    }

    // Event listener for opening Auth Modal
    window.addEventListener("openAuthModal", () => {
      store.openModal("auth_gateway");
    });

    // Event listener for session change (updates navbar)
    window.addEventListener("userSessionChanged", () => {
      if (navMount && this.navInstance) {
        navMount.innerHTML = this.navInstance.render();
        this.navInstance.bindEvents();
      }
      if (this.routerInstance) {
        this.routerInstance.handleRouteChange();
      }
    });

    console.log("⚡ PulseCare Platform initialized with React Router DOM support & multi-module routing.");
  }
}

function bootstrapApp() {
  const app = new PulseCareApp();
  app.init();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrapApp);
} else {
  bootstrapApp();
}
