/**
 * NEXORA PULSE - CLINIC QUEUE DIRECTOR
 */

import { store } from "../state/store.js";

export class QueueDirectorComponent {
  constructor(container) {
    this.container = container;
    this.unsubscribe = store.subscribe(() => this.render());
  }

  render() {
    const state = store.getState();
    const queue = state.queue;
    const currentPatient = state.patients.find(p => p.token === queue.current_token_serving) || state.patients[0];

    this.container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: var(--space-6);" role="region" aria-label="OPD Queue Director">
        <div class="panel" style="background: linear-gradient(135deg, var(--bg-surface-elevated), var(--bg-primary)); border-color: var(--pulse-cyan-dark);">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-4);">
            <div>
              <span class="brand-badge" style="background: var(--pulse-cyan-bg); color: var(--pulse-cyan-light); margin-bottom: var(--space-2);">REAL-TIME OPD TOKEN ENGINE</span>
              <h1 style="font-size: var(--text-2xl); font-weight: 800; color: #fff;">${queue.clinic_name} — Token Director</h1>
            </div>
            <div class="panel" style="padding: var(--space-3) var(--space-5); text-align: center; background: var(--bg-secondary);">
              <div style="font-size: var(--text-xs); color: var(--text-muted);">Avg Wait Time</div>
              <div style="font-size: var(--text-2xl); font-weight: 800; color: var(--emerald-light);">${queue.avg_wait_time_mins} min</div>
            </div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: var(--space-6);">
          <!-- Now Serving Podium -->
          <div class="panel" style="border: 2px solid var(--pulse-cyan); text-align: center; padding: var(--space-8);">
            <div style="font-size: var(--text-xs); color: var(--pulse-cyan-light); font-weight: 800; letter-spacing: 0.1em;">● NOW CALLING IN CONSULTATION</div>
            <div style="font-size: 4.5rem; font-weight: 900; font-family: var(--font-mono); color: #fff; text-shadow: 0 0 30px rgba(6, 182, 212, 0.6); margin: var(--space-4) 0;">
              ${queue.current_token_serving}
            </div>
            <div style="font-size: var(--text-xl); font-weight: 700; color: #fff;">${currentPatient ? currentPatient.full_name : 'Active Patient'}</div>
            <div style="font-size: var(--text-xs); color: var(--text-muted); margin-top: 4px;">OPD-102 • ${currentPatient ? currentPatient.abha_id : ''}</div>

            <button class="btn btn-primary" id="btn-call-next-queue" style="margin-top: var(--space-6); padding: var(--space-3) var(--space-6); font-size: var(--text-base);">
              <span>🔔 Call Next Token</span>
            </button>
          </div>

          <!-- Queue List -->
          <div class="panel">
            <div class="panel-header"><h2 class="panel-title" style="font-size: var(--text-base);"><span>📋</span><span>Queue Sequence</span></h2></div>
            <div style="display: flex; flex-direction: column; gap: var(--space-3);">
              ${queue.tokens.map(t => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: var(--space-3); background: ${t.token === queue.current_token_serving ? 'var(--pulse-cyan-bg)' : 'var(--bg-secondary)'}; border: 1px solid ${t.token === queue.current_token_serving ? 'var(--pulse-cyan)' : 'var(--border-subtle)'}; border-radius: var(--radius-md);">
                  <div style="display: flex; align-items: center; gap: var(--space-3);">
                    <span class="token-badge">${t.token}</span>
                    <span style="font-weight: 700; color: #fff; font-size: var(--text-sm);">${t.patient_name}</span>
                  </div>
                  <span style="font-size: var(--text-xs); color: ${t.status === 'In-Consult' ? 'var(--pulse-cyan-light)' : 'var(--amber-light)'}; font-weight: 700;">
                    ${t.status}
                  </span>
                </div>
              `).join("")}
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const btn = this.container.querySelector("#btn-call-next-queue");
    if (btn) btn.addEventListener("click", () => store.summonNextPatient());
  }

  destroy() {
    if (this.unsubscribe) this.unsubscribe();
  }
}
