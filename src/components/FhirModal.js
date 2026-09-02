/**
 * NEXORA PULSECARE - MODAL & TOAST MANAGER
 * Handles Login/Register Auth Modals, FHIR R4 JSON inspectors, and Emergency alerts
 */

import { store } from "../state/store.js";
import { AuthViewComponent } from "./AuthView.js";

export class ModalManagerComponent {
  constructor(container) {
    this.container = container;
    this.unsubscribe = store.subscribe(() => this.render());
  }

  render() {
    const state = store.getState();
    const activeModal = state.activeModal;
    const modalData = state.modalData;
    const toasts = state.toasts;

    let modalHtml = "";

    if (activeModal === "auth_gateway") {
      modalHtml = `
        <div class="modal-overlay" id="modal-auth-overlay" style="background: rgba(28, 28, 30, 0.7); backdrop-filter: blur(8px);">
          <div style="position: relative; width: 100%; max-width: 620px;">
            <button class="pill-tab btn-close-modal" style="position: absolute; top: 16px; right: 16px; z-index: 50; padding: 4px 10px; font-size: 13px; background: #fff; box-shadow: var(--shadow-sm);">✕</button>
            <div id="auth-view-mount"></div>
          </div>
        </div>
      `;
    } else if (activeModal === "emergency_sos") {
      modalHtml = `
        <div class="modal-overlay" id="modal-overlay">
          <div class="card-base" style="max-width: 500px; background: #fff; border: 2px solid #ef4444; border-radius: var(--radius-xxl); text-align: center; padding: var(--space-xl); box-shadow: var(--shadow-elevated);">
            <div style="font-size: 3rem; margin-bottom: var(--space-xs);">🚑</div>
            <h2 class="heading-2" style="font-size: 22px; color: #dc2626;">Emergency Triage Trigger Activated</h2>
            <p class="body-sm" style="color: var(--color-slate); margin: var(--space-md) 0;">
              Critical cardiac or respiratory symptoms detected. Please connect immediately with Emergency Ambulance Services.
            </p>
            <a href="tel:108" class="button-primary" style="display: block; padding: 14px 24px; font-size: 16px; font-weight: 700; background: #dc2626; color: #fff; text-decoration: none;">
              📞 Call National Ambulance Hotline (108 / 112)
            </a>
            <button class="button-secondary btn-close-modal" style="margin-top: var(--space-md); width: 100%;">Dismiss Alert</button>
          </div>
        </div>
      `;
    } else if (activeModal === "dispatch_success") {
      modalHtml = `
        <div class="modal-overlay" id="modal-overlay">
          <div class="card-base" style="max-width: 540px; background: #fff; border-radius: var(--radius-xxl); box-shadow: var(--shadow-elevated); padding: 0; overflow: hidden;">
            <div style="background: var(--color-surface-yellow); padding: var(--space-md) var(--space-lg); border-bottom: 1px solid #fde68a; display: flex; justify-content: space-between; align-items: center;">
              <div style="font-weight: 700; color: var(--color-primary); font-size: 16px;">✅ Prescription Signed & Dispatched</div>
              <button class="pill-tab btn-close-modal" style="padding: 2px 8px;">✕</button>
            </div>
            <div style="padding: var(--space-lg); font-size: 14px; display: flex; flex-direction: column; gap: var(--space-md);">
              <div>Prescription ID: <strong>${modalData?.rxId || 'RX-2026-8910'}</strong> for <strong>${modalData?.patientName || 'Anil Verma'}</strong></div>
              <div style="font-family: var(--font-family-mono); font-size: 11px; color: var(--color-slate); background: var(--color-surface); padding: 8px 12px; border-radius: var(--radius-md); border: 1px solid var(--color-hairline);">
                Signature Hash: ${modalData?.signatureHash ? modalData.signatureHash.substring(0, 32) : '0x98fbc8a12903e0045'}...
              </div>
              <div style="font-size: 13px; color: var(--color-success-accent); font-weight: 600;">
                ✓ Delivered to Patient App Vault, WhatsApp PDF bot, and ABDM SMS gateway.
              </div>
            </div>
            <div style="padding: var(--space-md) var(--space-lg); background: var(--color-surface); border-top: 1px solid var(--color-hairline); text-align: right;">
              <button class="button-primary btn-close-modal" style="padding: 8px 20px;">Done</button>
            </div>
          </div>
        </div>
      `;
    } else if (activeModal === "qr_code") {
      modalHtml = `
        <div class="modal-overlay" id="modal-overlay">
          <div class="card-base" style="max-width: 420px; background: #fff; border-radius: var(--radius-xxl); text-align: center; padding: var(--space-xl); box-shadow: var(--shadow-elevated);">
            <h3 class="heading-3" style="font-size: 18px; margin-bottom: 4px;">Digital Prescription QR Code</h3>
            <p class="body-sm" style="color: var(--color-slate); margin-bottom: var(--space-md);">Scan at any ABDM pharmacy for instant counter dispensing.</p>
            <div style="background: var(--color-surface); padding: 24px; border-radius: var(--radius-xl); border: 1px solid var(--color-hairline); display: inline-block;">
              <svg width="180" height="180" viewBox="0 0 100 100">
                <rect width="100" height="100" fill="#ffffff"/>
                <rect x="10" y="10" width="25" height="25" fill="#1c1c1e"/>
                <rect x="65" y="10" width="25" height="25" fill="#1c1c1e"/>
                <rect x="10" y="65" width="25" height="25" fill="#1c1c1e"/>
                <rect x="40" y="40" width="20" height="20" fill="#ffd02f"/>
                <rect x="45" y="45" width="10" height="10" fill="#1c1c1e"/>
              </svg>
            </div>
            <button class="button-primary btn-close-modal" style="margin-top: var(--space-lg); width: 100%;">Done</button>
          </div>
        </div>
      `;
    }

    const toastsHtml = `
      <div class="toast-container" aria-live="polite" style="position: fixed; bottom: 24px; right: 24px; z-index: 300; display: flex; flex-direction: column; gap: 8px; pointer-events: none;">
        ${toasts.map(t => `
          <div style="pointer-events: auto; min-width: 320px; max-width: 440px; padding: 12px 18px; border-radius: var(--radius-full); background: #ffffff; border: 1px solid var(--color-hairline); box-shadow: var(--shadow-dropdown); display: flex; align-items: center; gap: 10px; animation: slideDown 0.25s ease-out;">
            <span style="font-size: 16px;">${t.type === 'success' ? '✅' : t.type === 'danger' ? '🚨' : 'ℹ️'}</span>
            <div style="flex: 1; font-size: 13px; font-weight: 600; color: var(--color-primary);">${t.message}</div>
          </div>
        `).join("")}
      </div>
    `;

    this.container.innerHTML = modalHtml + toastsHtml;
    this.bindEvents();

    if (activeModal === "auth_gateway") {
      const authMount = this.container.querySelector("#auth-view-mount");
      if (authMount) {
        const auth = new AuthViewComponent(authMount, (user) => {
          store.setCurrentUser(user);
          store.closeModal();
          const navMount = document.getElementById("navbar-mount");
          if (navMount) {
            // refresh navbar with updated user profile
            const event = new CustomEvent("userSessionChanged");
            window.dispatchEvent(event);
          }
        });
        auth.render();
      }
    }
  }

  bindEvents() {
    this.container.querySelectorAll(".btn-close-modal").forEach(b => {
      b.addEventListener("click", () => store.closeModal());
    });
  }

  destroy() {
    if (this.unsubscribe) this.unsubscribe();
  }
}
