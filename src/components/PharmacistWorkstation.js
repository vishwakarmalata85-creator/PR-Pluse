/**
 * NEXORA PULSE - MODULE 2: PHARMACIST OCR AUDIT WORKSTATION & POS
 */

import { store } from "../state/store.js";

export class PharmacistWorkstationComponent {
  constructor(container) {
    this.container = container;
    this.unsubscribe = store.subscribe(() => this.render());
  }

  render() {
    const state = store.getState();
    const activeSample = state.ocrSamples.find(s => s.id === state.activeOcrSampleId) || state.ocrSamples[0];
    const items = state.pharmacistVerifiedItems;
    const genericSubs = state.selectedGenericSubstitutions;

    let totalBrandCost = 0;
    let totalActualCost = 0;

    items.forEach((item, idx) => {
      const isGeneric = !!genericSubs[idx];
      totalBrandCost += item.brand_price || 100;
      totalActualCost += isGeneric ? (item.generic_price || 40) : (item.brand_price || 100);
    });

    const totalSavings = Math.max(0, totalBrandCost - totalActualCost);

    this.container.innerHTML = `
      <div class="panel" style="margin-bottom: var(--space-4); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-4);">
        <div>
          <h1 style="font-size: var(--text-xl); font-weight: 800; display: flex; align-items: center; gap: var(--space-2);">
            <span>💊</span>
            <span>Pharmacist TrOCR Vision & POS Workstation</span>
            <span class="brand-badge" style="background: var(--emerald-bg); color: var(--emerald-light);">Deep Learning Ingestion</span>
          </h1>
        </div>

        <div style="display: flex; gap: var(--space-2);">
          ${state.ocrSamples.map(s => `
            <button class="btn btn-secondary btn-sample-select ${s.id === activeSample.id ? 'active' : ''}" data-sample-id="${s.id}" style="font-size: var(--text-xs); ${s.id === activeSample.id ? 'border-color: var(--emerald-safe); color: var(--emerald-light);' : ''}">
              <span>📄 ${s.title.split(" - ")[0]}</span>
            </button>
          `).join("")}
        </div>
      </div>

      <div class="ocr-split-workstation">
        
        <!-- LEFT: OCR CANVAS -->
        <div class="ocr-viewer-pane">
          <div class="panel" style="height: 100%;">
            <div class="panel-header">
              <h2 class="panel-title" style="font-size: var(--text-base);"><span>🖼️</span><span>Physical Prescription Scan</span></h2>
            </div>

            <div class="ocr-canvas-container">
              <div class="ocr-scanline"></div>

              <svg viewBox="0 0 500 550" width="100%" height="100%" style="background: #0f172a; padding: 20px; font-family: sans-serif;">
                <rect x="20" y="20" width="460" height="70" rx="8" fill="#1e293b" stroke="#334155"/>
                <text x="40" y="50" fill="#38bdf8" font-size="15" font-weight="bold">${activeSample.clinic_name}</text>
                <text x="40" y="70" fill="#94a3b8" font-size="11">${activeSample.doctor_name} • Reg: ${activeSample.doctor_reg}</text>

                <rect x="20" y="100" width="460" height="50" rx="6" fill="#162032" stroke="#334155"/>
                <text x="40" y="130" fill="#f8fafc" font-size="13" font-weight="bold">Pt: ${activeSample.patient_name} (${activeSample.patient_age}y / ${activeSample.patient_gender})</text>

                ${activeSample.extracted_items.map((item, i) => {
                  const y = 190 + i * 90;
                  const isRed = item.confidence < 70;
                  const textColor = isRed ? "#f87171" : "#34d399";
                  return `
                    <g>
                      <rect x="35" y="${y - 20}" width="430" height="70" rx="6" fill="rgba(16, 185, 129, 0.05)" stroke="${textColor}" stroke-width="1"/>
                      <text x="50" y="${y + 5}" fill="#f8fafc" font-size="14" font-weight="bold">${i + 1}. Tab. ${item.brand_name || item.drug_name}</text>
                      <text x="50" y="${y + 25}" fill="#94a3b8" font-size="11">Sig: ${item.dosage_pattern} • ${item.duration_days} days</text>
                      <text x="360" y="${y + 5}" fill="${textColor}" font-size="11" font-weight="bold">OCR: ${item.confidence}%</text>
                    </g>
                  `;
                }).join("")}
              </svg>
            </div>
          </div>
        </div>

        <!-- RIGHT: STRUCTURED VERIFICATION & GENERIC SUBSTITUTION -->
        <div class="ocr-structured-pane">
          <div class="panel">
            <div class="panel-header">
              <h2 class="panel-title" style="font-size: var(--text-base);"><span>🧪</span><span>Prescription Audit & Bioequivalent Generic Matching</span></h2>
            </div>

            <div style="display: flex; flex-direction: column; gap: var(--space-3);">
              ${items.map((item, index) => {
                const isGeneric = !!genericSubs[index];
                return `
                  <div style="padding: var(--space-3); background: var(--bg-secondary); border-radius: var(--radius-md); border: 1px solid ${item.confidence < 70 ? 'var(--danger-critical)' : 'var(--border-subtle)'};">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2);">
                      <div style="font-weight: 700; font-size: var(--text-sm); color: #fff;">${item.brand_name || item.drug_name}</div>
                      <span class="confidence-indicator ${item.confidence >= 90 ? 'high' : item.confidence >= 70 ? 'med' : 'low'}">
                        Confidence: ${item.confidence}%
                      </span>
                    </div>

                    ${item.generic_alternative ? `
                      <div class="generic-sub-card">
                        <div>
                          <div style="font-size: 11px; color: var(--emerald-light); font-weight: 700;">💡 Generic Alternative:</div>
                          <div style="font-weight: 600; font-size: var(--text-xs); color: #fff;">${item.generic_alternative}</div>
                          <div style="font-size: 11px; color: var(--text-muted);">Brand: <del>₹${item.brand_price}</del> ➔ Generic: <strong>₹${item.generic_price}</strong></div>
                        </div>

                        <label style="font-size: var(--text-xs); display: flex; align-items: center; gap: 4px; color: var(--text-secondary); cursor: pointer;">
                          <input type="checkbox" class="chk-generic-sub" data-index="${index}" ${isGeneric ? 'checked' : ''} />
                          <span>Substitute Generic</span>
                        </label>
                      </div>
                    ` : ''}
                  </div>
                `;
              }).join("")}
            </div>

            <!-- Total & Fulfill -->
            <div style="margin-top: var(--space-4); padding: var(--space-3); background: var(--bg-surface-elevated); border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-size: 11px; color: var(--text-muted);">Total Order Value:</div>
                <div style="font-size: var(--text-xl); font-weight: 800; color: #fff;">
                  ₹${totalActualCost.toFixed(2)}
                  ${totalSavings > 0 ? `<span style="font-size: var(--text-xs); color: var(--emerald-light); margin-left: 6px;">(Saved ₹${totalSavings})</span>` : ''}
                </div>
              </div>

              <button class="btn btn-emerald" id="btn-fulfill-order" style="padding: var(--space-2) var(--space-5);">
                <span>📦 Fulfill & Deduct Stock</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    this.container.querySelectorAll(".btn-sample-select").forEach(b => {
      b.addEventListener("click", () => store.selectOcrSample(b.getAttribute("data-sample-id")));
    });

    this.container.querySelectorAll(".chk-generic-sub").forEach(chk => {
      chk.addEventListener("change", (e) => {
        store.toggleGenericSubstitution(parseInt(chk.getAttribute("data-index"), 10), e.target.checked);
      });
    });

    const fulfillBtn = this.container.querySelector("#btn-fulfill-order");
    if (fulfillBtn) {
      fulfillBtn.addEventListener("click", () => store.fulfillPharmacistOrder());
    }
  }

  destroy() {
    if (this.unsubscribe) this.unsubscribe();
  }
}
