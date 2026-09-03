/**
 * NEXORA PULSECARE - PHARMACIST WORKSTATION & ORDER DISPENSARY HUB
 * Features:
 *  - Real-time Incoming Patient Medicine Orders Queue (MongoDB Atlas Backed)
 *  - Full Order Lifecycle: PLACED -> CONFIRMED -> PACKED -> READY -> DISPENSED
 *  - TrOCR Deep Learning Prescription Audit & Jan Aushadhi Bioequivalent Generic Engine
 */

import { store } from "../state/store.js";
import { authService } from "../services/authService.js";
import { orderService } from "../services/orderService.js";

export class PharmacistWorkstationComponent {
  constructor(container) {
    this.container = container;
    this.activeTab = "orders"; // 'orders' | 'ocr_audit'
    this.orders = [];
    this.isLoadingOrders = true;
    this.selectedOrder = null;
    this.init();

    window.addEventListener("syncLivePlatformData", async () => {
      await this.fetchOrders();
      this.render();
    });

    window.addEventListener("syncPharmacyQueue", async () => {
      await this.fetchOrders();
      this.render();
    });

    // Auto-poll pharmacy order stream every 3 seconds
    this.pollInterval = setInterval(async () => {
      if (document.visibilityState === "visible") {
        await this.fetchOrders(true);
      }
    }, 3000);
  }

  async init() {
    await this.fetchOrders();
    this.render();
  }

  async fetchOrders(silent = false) {
    try {
      if (!silent) this.isLoadingOrders = true;
      const currentUser = authService.getCurrentUser();
      const pharmaId = currentUser?.id || "usr-pharma-001";
      let list = await orderService.getPharmacyOrders(pharmaId);

      // If specific pharmacy has no orders or in dev environment, load all dispensary queue orders
      if (!Array.isArray(list) || list.length === 0) {
        list = await orderService.getPharmacyOrders("all");
      }

      if (Array.isArray(list)) {
        this.orders = list;
        if (!this.selectedOrder && this.orders.length > 0) {
          this.selectedOrder = this.orders[0];
        } else if (this.selectedOrder) {
          // Keep updated reference
          const found = this.orders.find(o => o.id === this.selectedOrder.id || o.orderNumber === this.selectedOrder.orderNumber);
          if (found) this.selectedOrder = found;
        }
      }
      if (!silent) {
        this.isLoadingOrders = false;
        this.render();
      }
    } catch (e) {
      console.warn("Failed to fetch pharmacy orders:", e);
      if (!silent) {
        this.isLoadingOrders = false;
        this.render();
      }
    }
  }

  render() {
    const state = store.getState();
    const currentUser = authService.getCurrentUser() || state.currentUser;
    const activeSample = state.ocrSamples.find(s => s.id === state.activeOcrSampleId) || state.ocrSamples[0];
    const items = state.pharmacistVerifiedItems;
    const genericSubs = state.selectedGenericSubstitutions;

    const placedCount = this.orders.filter(o => o.status === "PLACED").length;
    const confirmedCount = this.orders.filter(o => o.status === "CONFIRMED").length;
    const packedCount = this.orders.filter(o => o.status === "PACKED").length;
    const readyCount = this.orders.filter(o => o.status === "READY" || o.status === "READY_FOR_PICKUP").length;
    const completedCount = this.orders.filter(o => o.status === "DISPENSED" || o.status === "COMPLETED").length;

    let totalBrandCost = 0;
    let totalActualCost = 0;
    items.forEach((item, idx) => {
      const isGeneric = !!genericSubs[idx];
      totalBrandCost += item.brand_price || 100;
      totalActualCost += isGeneric ? (item.generic_price || 40) : (item.brand_price || 100);
    });
    const totalSavings = Math.max(0, totalBrandCost - totalActualCost);

    this.container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: var(--space-lg);" role="region" aria-label="Pharmacist Station">
        
        <!-- Pharmacy Header & KPI Dashboard -->
        <div class="card-base" style="background: linear-gradient(135deg, #1e293b, #0f172a); color: #ffffff; padding: var(--space-xl); border-radius: var(--radius-xxl); box-shadow: var(--shadow-mockup);">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-md);">
            <div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                <span class="badge-promo" style="background: #d97706; color: #ffffff; font-weight: 700;">PULSEPHARM DISPENSARY & OCR ENGINE</span>
                <span style="font-size: 12px; color: #94a3b8; font-family: var(--font-family-mono);">JAN AUSHADHI LINKED</span>
              </div>
              <h1 style="font-size: 26px; font-weight: 800; color: #ffffff; margin: 0;">
                ${currentUser ? currentUser.full_name : "MedPlus 24/7 Super Pharmacy"}
              </h1>
              <p style="font-size: 13px; color: #94a3b8; margin-top: 4px;">
                Drug License: <span style="color: #fbbf24;">KA-BLR-DL-2024-88912</span> • 80 Feet Road, 4th Block, Koramangala, Bengaluru
              </p>
            </div>

            <!-- Pharmacy KPI Counters -->
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
              <div style="background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.4); border-radius: var(--radius-lg); padding: 10px 14px; text-align: center; min-width: 95px;">
                <div style="font-size: 11px; color: #fde68a; font-weight: 600;">Incoming</div>
                <div style="font-size: 22px; font-weight: 800; color: #f59e0b; margin-top: 2px;">${placedCount}</div>
                <div style="font-size: 10px; color: #fcd34d;">Action Required</div>
              </div>

              <div style="background: rgba(59, 130, 246, 0.15); border: 1px solid rgba(59, 130, 246, 0.4); border-radius: var(--radius-lg); padding: 10px 14px; text-align: center; min-width: 95px;">
                <div style="font-size: 11px; color: #bfdbfe; font-weight: 600;">Confirmed</div>
                <div style="font-size: 22px; font-weight: 800; color: #60a5fa; margin-top: 2px;">${confirmedCount}</div>
                <div style="font-size: 10px; color: #93c5fd;">Ready to Pack</div>
              </div>

              <div style="background: rgba(168, 85, 247, 0.15); border: 1px solid rgba(168, 85, 247, 0.4); border-radius: var(--radius-lg); padding: 10px 14px; text-align: center; min-width: 95px;">
                <div style="font-size: 11px; color: #e9d5ff; font-weight: 600;">Packed</div>
                <div style="font-size: 22px; font-weight: 800; color: #c084fc; margin-top: 2px;">${packedCount}</div>
                <div style="font-size: 10px; color: #d8b4fe;">Awaiting Pickup</div>
              </div>

              <div style="background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); border-radius: var(--radius-lg); padding: 10px 14px; text-align: center; min-width: 95px;">
                <div style="font-size: 11px; color: #a7f3d0; font-weight: 600;">Ready</div>
                <div style="font-size: 22px; font-weight: 800; color: #34d399; margin-top: 2px;">${readyCount}</div>
                <div style="font-size: 10px; color: #6ee7b7;">Token Issued</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Section Navigation Tabs -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--color-hairline); padding-bottom: var(--space-xs);">
          <div style="display: flex; gap: var(--space-sm);">
            <button class="pill-tab btn-pharmacy-nav ${this.activeTab === 'orders' ? 'pill-tab-active' : ''}" data-tab="orders" style="padding: 8px 18px; font-size: 13px; font-weight: 700;">
              <span>📦 Medicine Order Queue (${this.orders.length})</span>
            </button>
            <button class="pill-tab btn-pharmacy-nav ${this.activeTab === 'ocr_audit' ? 'pill-tab-active' : ''}" data-tab="ocr_audit" style="padding: 8px 18px; font-size: 13px; font-weight: 700;">
              <span>🧪 TrOCR Prescription Audit & Generic POS</span>
            </button>
          </div>

          <button class="button-secondary btn-sync-pharmacy-orders" style="font-size: 12px; padding: 6px 14px; background: #fff;">
            <span>🔄 Sync Live MongoDB Queue</span>
          </button>
        </div>

        <!-- TAB CONTENT 1: MEDICINE ORDER QUEUE -->
        ${this.activeTab === 'orders' ? this.renderOrderQueueSection() : ''}

        <!-- TAB CONTENT 2: TrOCR PRESCRIPTION AUDIT & GENERIC POS -->
        ${this.activeTab === 'ocr_audit' ? this.renderOcrAuditSection(activeSample, items, genericSubs, totalSavings, totalActualCost, totalBrandCost) : ''}

      </div>
    `;

    this.bindEvents();
  }

  renderOrderQueueSection() {
    if (this.orders.length === 0) {
      return `
        <div class="card-base" style="background: #ffffff; padding: var(--space-xxl); text-align: center; border: 1px dashed var(--color-hairline); border-radius: var(--radius-xl);">
          <div style="font-size: 36px; margin-bottom: 8px;">📭</div>
          <h3 style="font-size: 18px; font-weight: 800; color: var(--color-primary); margin: 0;">No Pending Orders</h3>
          <p style="font-size: 13px; color: var(--color-slate); margin-top: 4px;">
            Incoming patient medicine orders from Koramangala & nearby areas will appear here in real time.
          </p>
        </div>
      `;
    }

    return `
      <div style="display: grid; grid-template-columns: 1.3fr 1.7fr; gap: var(--space-lg); align-items: flex-start;">
        
        <!-- Left: Incoming Orders Stream -->
        <div class="card-base" style="background: #ffffff; border: 1px solid var(--color-hairline); border-radius: var(--radius-xl); padding: var(--space-lg); box-shadow: var(--shadow-sm);">
          <div style="font-size: 16px; font-weight: 800; color: var(--color-primary); margin-bottom: var(--space-md); padding-bottom: var(--space-xs); border-bottom: 1px solid var(--color-hairline);">
            Live Patient Orders (MongoDB Stream)
          </div>

          <div style="display: flex; flex-direction: column; gap: 10px; max-height: 650px; overflow-y: auto; padding-right: 4px;">
            ${this.orders.map(order => {
              const isSelected = this.selectedOrder && this.selectedOrder.id === order.id;
              let badgeBg = "#fef3c7";
              let badgeColor = "#b45309";
              if (order.status === "CONFIRMED") { badgeBg = "#e0f2fe"; badgeColor = "#0369a1"; }
              else if (order.status === "PACKED") { badgeBg = "#f3e8ff"; badgeColor = "#7e22ce"; }
              else if (order.status === "READY" || order.status === "READY_FOR_PICKUP") { badgeBg = "#dcfce7"; badgeColor = "#15803d"; }
              else if (order.status === "DISPENSED" || order.status === "COMPLETED") { badgeBg = "#f1f5f9"; badgeColor = "#475569"; }

              return `
                <div class="card-base order-item-card" data-order-id="${order.id}" style="padding: 12px; border: 2px solid ${isSelected ? '#d97706' : 'var(--color-hairline)'}; border-radius: var(--radius-lg); background: ${isSelected ? '#fffbeb' : '#ffffff'}; cursor: pointer; transition: all 0.15s ease;">
                  
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <span style="font-weight: 800; font-size: 13px; font-family: var(--font-family-mono); color: var(--color-primary);">
                        ${order.orderNumber || order.id}
                      </span>
                      ${order.pickupToken ? `
                        <span class="token-badge" style="font-size: 11px; font-weight: 800; padding: 2px 7px; background: var(--color-brand-yellow); color: #000; border-radius: var(--radius-full);">
                          ${order.pickupToken}
                        </span>
                      ` : ''}
                    </div>
                    <span style="font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: var(--radius-full); background: ${badgeBg}; color: ${badgeColor};">
                      ● ${order.status}
                    </span>
                  </div>

                  <div style="font-size: 14px; font-weight: 800; color: var(--color-primary);">
                    ${order.patientName}
                  </div>
                  <div style="font-size: 12px; color: var(--color-slate); margin-top: 2px;">
                    Prescribed by: <strong style="color: #334155;">${order.doctorName || 'Dr. Vikram Sethi, MD'}</strong>
                  </div>

                  <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; padding-top: 6px; border-top: 1px dashed var(--color-hairline); font-size: 12px;">
                    <span style="color: var(--color-slate);">
                      ${(order.medicines || order.items || []).length} items • ${order.fulfillmentType === 'HOME_DELIVERY' ? '🚀 60-Min Delivery' : '🛒 Store Pickup'}
                    </span>
                    <span style="font-weight: 800; font-size: 14px; color: var(--color-primary);">
                      ₹${order.totalAmount}
                    </span>
                  </div>

                </div>
              `;
            }).join("")}
          </div>
        </div>

        <!-- Right: Active Order Processing Workspace -->
        <div class="card-base" style="background: #ffffff; border: 1px solid var(--color-hairline); border-radius: var(--radius-xl); padding: var(--space-xl); box-shadow: var(--shadow-sm);">
          ${this.selectedOrder ? this.renderSelectedOrderDetails(this.selectedOrder) : `
            <div style="text-align: center; padding: 40px 0; color: var(--color-slate);">
              Select an order from the list to view items & process fulfillment.
            </div>
          `}
        </div>

      </div>
    `;
  }

  renderSelectedOrderDetails(order) {
    const medicines = order.medicines || order.items || [];
    const isPlaced = order.status === "PLACED";
    const isConfirmed = order.status === "CONFIRMED";
    const isPacked = order.status === "PACKED";
    const isReady = order.status === "READY" || order.status === "READY_FOR_PICKUP";
    const isDispensed = order.status === "DISPENSED" || order.status === "COMPLETED";

    return `
      <div>
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--space-md); padding-bottom: var(--space-md); border-bottom: 1px solid var(--color-hairline);">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="badge-promo" style="background: #d97706; color: #ffffff; font-weight: 800;">ORDER DETAILS</span>
              <span style="font-size: 15px; font-weight: 800; font-family: var(--font-family-mono); color: var(--color-primary);">${order.orderNumber || order.id}</span>
              ${order.pickupToken ? `<span style="font-size: 12px; font-weight: 700; color: #15803d; background: #dcfce7; padding: 2px 8px; border-radius: var(--radius-full);">Token: ${order.pickupToken}</span>` : ''}
            </div>
            <h2 style="font-size: 22px; font-weight: 800; color: var(--color-primary); margin-top: 6px; margin-bottom: 2px;">
              ${order.patientName}
            </h2>
            <div style="font-size: 13px; color: var(--color-slate);">
              Prescribed by <strong>${order.doctorName || 'Dr. Vikram Sethi, MD'}</strong> • Fullfilment: <strong>${order.fulfillmentType === 'HOME_DELIVERY' ? '🚀 60-Min Home Delivery' : '🛒 Counter Pickup'}</strong>
            </div>
          </div>

          <div style="text-align: right; background: var(--color-surface); padding: 10px 16px; border-radius: var(--radius-lg); border: 1px solid var(--color-hairline);">
            <div style="font-size: 11px; color: var(--color-slate); font-weight: 600;">Status</div>
            <div style="font-size: 16px; font-weight: 800; color: #d97706; margin-top: 2px;">
              ● ${order.status}
            </div>
            <div style="font-size: 11px; color: var(--color-slate); margin-top: 2px;">
              Est. Time: ${order.estimatedMinutes || 10} mins
            </div>
          </div>
        </div>

        <!-- Medicine Items List -->
        <div style="font-size: 14px; font-weight: 700; color: var(--color-primary); margin-bottom: var(--space-xs);">
          Prescribed Medicines & Bioequivalent Packs:
        </div>

        <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: var(--space-lg);">
          ${medicines.map((med, idx) => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: #f8fafc; border-radius: var(--radius-md); border: 1px solid #e2e8f0;">
              <div>
                <div style="font-weight: 700; font-size: 14px; color: var(--color-primary);">
                  ${idx + 1}. ${med.name || med.drugName}
                </div>
                <div style="font-size: 12px; color: var(--color-slate); margin-top: 1px;">
                  Quantity: <strong>${med.quantity} ${med.dosageForm || 'Tablets'}</strong> ${med.isGeneric ? '• <span style="color: #15803d; font-weight: 700;">Jan Aushadhi Generic (61% Save)</span>' : ''}
                </div>
              </div>
              <div style="font-weight: 800; font-size: 14px; color: var(--color-primary);">
                ₹${(med.price || med.unitPrice || 40) * (med.quantity > 1 ? 1 : 1)}
              </div>
            </div>
          `).join("")}
        </div>

        <!-- Total Breakdown Card -->
        <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: var(--radius-lg); padding: 14px; margin-bottom: var(--space-xl); font-size: 13px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div>Subtotal: <strong>₹${order.subtotal || order.totalAmount}</strong></div>
            <div>Delivery & Handling: <strong>₹${order.deliveryFee || 0}</strong></div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 11px; color: #92400e; font-weight: 600;">Grand Total</div>
            <div style="font-size: 22px; font-weight: 800; color: #78350f;">₹${order.totalAmount}</div>
          </div>
        </div>

        <!-- Interactive Order State Machine Action Buttons -->
        <div style="display: flex; gap: 10px; justify-content: flex-end; flex-wrap: wrap;">
          ${isPlaced ? `
            <button class="button-secondary btn-order-transition" data-order-id="${order.id}" data-target-status="CANCELLED" style="padding: 10px 18px; font-size: 13px; color: #dc2626; border-color: #fecaca; background: #fff;">
              <span>✕ Decline</span>
            </button>
            <button class="button-primary btn-order-transition" data-order-id="${order.id}" data-target-status="CONFIRMED" style="padding: 10px 24px; font-size: 13px; background: #0284c7; border-color: #0284c7;">
              <span>✅ Accept Order</span>
            </button>
          ` : ''}

          ${isConfirmed ? `
            <button class="button-primary btn-order-transition" data-order-id="${order.id}" data-target-status="PACKED" style="padding: 10px 24px; font-size: 13px; background: #7e22ce; border-color: #7e22ce;">
              <span>📦 Pack Medicines</span>
            </button>
          ` : ''}

          ${isPacked ? `
            <button class="button-primary btn-order-transition" data-order-id="${order.id}" data-target-status="READY" style="padding: 10px 24px; font-size: 13px; background: #059669; border-color: #059669;">
              <span>🟢 Mark Ready for Pickup / Dispatch</span>
            </button>
          ` : ''}

          ${isReady ? `
            <button class="button-primary btn-order-transition" data-order-id="${order.id}" data-target-status="DISPENSED" style="padding: 10px 24px; font-size: 13px; background: #0f172a; border-color: #0f172a;">
              <span>💊 Dispense & Handover to Patient</span>
            </button>
          ` : ''}

          ${isDispensed ? `
            <div style="display: flex; align-items: center; gap: 8px; color: #15803d; font-weight: 700; font-size: 14px; background: #dcfce7; padding: 10px 20px; border-radius: var(--radius-lg);">
              <span>✓ Order Fulfilled & Dispensed to Patient</span>
            </div>
          ` : ''}
        </div>

      </div>
    `;
  }

  renderOcrAuditSection(activeSample, items, genericSubs, totalSavings, totalActualCost, totalBrandCost) {
    return `
      <div class="ocr-split-workstation" style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-lg);">
        
        <!-- LEFT: OCR CANVAS -->
        <div class="ocr-viewer-pane">
          <div class="card-base" style="background: #ffffff; padding: var(--space-lg); border: 1px solid var(--color-hairline); border-radius: var(--radius-xl);">
            <div style="font-size: 16px; font-weight: 800; color: var(--color-primary); margin-bottom: var(--space-md); display: flex; align-items: center; gap: 6px;">
              <span>🖼️</span><span>Physical Prescription TrOCR Scan</span>
            </div>

            <div class="ocr-canvas-container" style="position: relative; border-radius: var(--radius-lg); overflow: hidden; border: 1px solid var(--color-hairline);">
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
          <div class="card-base" style="background: #ffffff; padding: var(--space-lg); border: 1px solid var(--color-hairline); border-radius: var(--radius-xl);">
            <div style="font-size: 16px; font-weight: 800; color: var(--color-primary); margin-bottom: var(--space-md); display: flex; align-items: center; gap: 6px;">
              <span>🧪</span><span>Prescription Audit & Bioequivalent Generic Matching</span>
            </div>

            <div style="display: flex; flex-direction: column; gap: var(--space-md);">
              ${items.map((item, index) => {
                const isGeneric = !!genericSubs[index];
                return `
                  <div style="padding: var(--space-md); background: #f8fafc; border-radius: var(--radius-lg); border: 1px solid ${item.confidence < 70 ? '#fecaca' : 'var(--color-hairline)'};">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-xs);">
                      <div style="font-weight: 700; font-size: 14px; color: var(--color-primary);">${item.brand_name || item.drug_name}</div>
                      <span class="badge-promo" style="font-size: 10px; background: ${item.confidence > 80 ? '#dcfce7' : '#fee2e2'}; color: ${item.confidence > 80 ? '#15803d' : '#b91c1c'};">
                        ${item.confidence}% Match
                      </span>
                    </div>

                    <div style="font-size: 12px; color: var(--color-slate); margin-bottom: var(--space-xs);">
                      Active Ingredient: <strong>${item.generic_name}</strong>
                    </div>

                    <!-- Jan Aushadhi substitution toggle -->
                    <div style="display: flex; justify-content: space-between; align-items: center; padding-top: var(--space-xs); border-top: 1px dashed var(--color-hairline);">
                      <label style="font-size: 12px; color: var(--color-primary); font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                        <input type="checkbox" class="chk-generic-sub" data-item-index="${index}" ${isGeneric ? 'checked' : ''} style="accent-color: #10b981;" />
                        <span>Jan Aushadhi Generic (₹${item.generic_price || 40})</span>
                      </label>
                      <span style="font-size: 12px; color: var(--color-slate);">
                        Brand: ₹${item.brand_price || 100}
                      </span>
                    </div>
                  </div>
                `;
              }).join("")}

              <!-- Pricing summary banner -->
              <div style="padding: var(--space-md); background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: var(--radius-lg); display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="font-size: 11px; color: #166534; font-weight: 700;">PATIENT SAVINGS WITH JAN AUSHADHI:</div>
                  <div style="font-size: 20px; font-weight: 800; color: #15803d;">₹${totalSavings} (Saved 61%)</div>
                </div>
                <div style="text-align: right;">
                  <div style="font-size: 11px; color: var(--color-slate);">Final Patient Total:</div>
                  <div style="font-size: 20px; font-weight: 800; color: var(--color-primary);">₹${totalActualCost}</div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    `;
  }

  bindEvents() {
    // Navigation Tabs Switch
    this.container.querySelectorAll(".btn-pharmacy-nav").forEach(btn => {
      btn.addEventListener("click", () => {
        this.activeTab = btn.getAttribute("data-tab");
        this.render();
      });
    });

    // Refresh Live Queue
    const syncBtn = this.container.querySelector(".btn-sync-pharmacy-orders");
    if (syncBtn) {
      syncBtn.addEventListener("click", async () => {
        await this.fetchOrders();
        store.showToast("Pharmacy order queue synced with MongoDB!", "success");
        this.render();
      });
    }

    // Select Order Item from Queue
    this.container.querySelectorAll(".order-item-card").forEach(card => {
      card.addEventListener("click", () => {
        const orderId = card.getAttribute("data-order-id");
        this.selectedOrder = this.orders.find(o => o.id === orderId) || null;
        this.render();
      });
    });

    // Order Lifecycle State Transitions
    this.container.querySelectorAll(".btn-order-transition").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const orderId = btn.getAttribute("data-order-id");
        const targetStatus = btn.getAttribute("data-target-status");

        try {
          const updated = await orderService.updateOrderStatus(orderId, targetStatus);
          store.showToast(`Order #${updated.orderNumber || orderId} marked as ${targetStatus}!`, "success");
          await this.fetchOrders();
          this.selectedOrder = this.orders.find(o => o.id === orderId) || updated;
          this.render();
        } catch (err) {
          store.showToast(`Order status update failed: ${err.message}`, "danger");
        }
      });
    });

    // Generic Substitution Checkbox
    this.container.querySelectorAll(".chk-generic-sub").forEach(chk => {
      chk.addEventListener("change", (e) => {
        const idx = parseInt(chk.getAttribute("data-item-index"), 10);
        store.toggleGenericSubstitution(idx);
      });
    });
  }
}
