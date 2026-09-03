/**
 * NEXORA PULSE - ADMIN PLATFORM & GOVERNANCE CONSOLE
 * Features:
 *  - Real-Time Login History & Security Audit Trail (backed by MongoDB login_history collection)
 *  - Comprehensive Platform User Registry (Doctors, Patients, Pharmacies, Admins)
 *  - Clinical MRN and Pharmacy Drug License (DLN) Verification & Approval Engine
 */

import { authService } from "../services/authService.js";
import { store } from "../state/store.js";

export class AdminVerificationConsoleComponent {
  constructor(container) {
    this.container = container;
    this.activeTab = "logs"; // 'logs' | 'users' | 'verifications'
    this.loginLogs = [];
    this.allUsers = [];
    this.isLoading = true;
    this.init();

    window.addEventListener("syncLivePlatformData", async () => {
      await this.fetchData();
      this.render();
    });
  }

  async init() {
    await this.fetchData();
    this.render();
  }

  async fetchData() {
    try {
      this.isLoading = true;
      const [logs, users] = await Promise.all([
        authService.getLoginHistory(),
        authService.getAdminUsers()
      ]);
      this.loginLogs = logs;
      this.allUsers = users;
      this.isLoading = false;
    } catch (err) {
      console.warn("Failed to fetch admin data:", err);
      this.isLoading = false;
    }
  }

  render() {
    const pendingUsers = this.allUsers.filter(u => u.verificationStatus === "PENDING_VERIFICATION");
    const activeDoctors = this.allUsers.filter(u => u.role === "DOCTOR");
    const activePharmacies = this.allUsers.filter(u => u.role === "PHARMACY");
    const activePatients = this.allUsers.filter(u => u.role === "PATIENT");

    this.container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: var(--space-lg);" role="region" aria-label="Admin Platform & Audit Desk">
        
        <!-- Header & Platform Metrics -->
        <div class="card-base" style="background: linear-gradient(135deg, #1e1e24, #2b2d42); color: #ffffff; padding: var(--space-xl); border-radius: var(--radius-xxl); box-shadow: var(--shadow-mockup); border: 1px solid #4a4e69;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-md);">
            <div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                <span class="badge-promo" style="background: #a855f7; color: #ffffff; font-weight: 700;">NEXORA CONTROL PLANE & AUDIT VAULT</span>
                <span style="font-size: 11px; color: #c4b5fd; font-family: var(--font-family-mono);">MONGODB CLUSTER INTEGRATED</span>
              </div>
              <h1 style="font-size: 26px; font-weight: 800; color: #ffffff; margin: 0;">
                Platform Governance & Security Audit Hub
              </h1>
              <p style="font-size: 13px; color: #cbd5e1; margin-top: 4px;">
                Inspect user login history, manage registered medical providers, and audit regulatory compliance.
              </p>
            </div>

            <!-- Platform KPI Counters -->
            <div style="display: flex; gap: 10px; flex-wrap: wrap; width: 100%; max-width: 600px;">
              
              <div style="background: rgba(168, 85, 247, 0.15); border: 1px solid rgba(168, 85, 247, 0.4); border-radius: var(--radius-lg); padding: 10px 14px; text-align: center; flex: 1 1 110px; min-width: 90px;">
                <div style="font-size: 10px; color: #d8b4fe; font-weight: 600;">Total Users</div>
                <div style="font-size: 22px; font-weight: 800; color: #c084fc; margin-top: 2px;">${this.allUsers.length}</div>
                <div style="font-size: 9px; color: #e9d5ff;">In MongoDB</div>
              </div>

              <div style="background: rgba(59, 130, 246, 0.15); border: 1px solid rgba(59, 130, 246, 0.4); border-radius: var(--radius-lg); padding: 10px 14px; text-align: center; flex: 1 1 110px; min-width: 90px;">
                <div style="font-size: 10px; color: #93c5fd; font-weight: 600;">Doctors</div>
                <div style="font-size: 22px; font-weight: 800; color: #60a5fa; margin-top: 2px;">${activeDoctors.length}</div>
                <div style="font-size: 9px; color: #bfdbfe;">Registered</div>
              </div>

              <div style="background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.4); border-radius: var(--radius-lg); padding: 10px 14px; text-align: center; flex: 1 1 110px; min-width: 90px;">
                <div style="font-size: 10px; color: #fde68a; font-weight: 600;">Pharmacies</div>
                <div style="font-size: 22px; font-weight: 800; color: #fbbf24; margin-top: 2px;">${activePharmacies.length}</div>
                <div style="font-size: 9px; color: #fef3c7;">Registered</div>
              </div>

              <div style="background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4); border-radius: var(--radius-lg); padding: 10px 14px; text-align: center; flex: 1 1 110px; min-width: 90px;">
                <div style="font-size: 10px; color: #fca5a5; font-weight: 600;">Pending Audit</div>
                <div style="font-size: 22px; font-weight: 800; color: #ef4444; margin-top: 2px;">${pendingUsers.length}</div>
                <div style="font-size: 9px; color: #f87171;">Action Required</div>
              </div>

            </div>
          </div>
        </div>

        <!-- Section Navigation Tabs -->
        <div class="horizontal-scroll-bar" style="display: flex; gap: 8px; border-bottom: 2px solid var(--color-hairline); padding-bottom: 4px; overflow-x: auto;">
          <button class="pill-tab ${this.activeTab === 'logs' ? 'pill-tab-active' : ''}" id="tab-admin-logs" style="padding: 8px 18px; font-size: 13px;">
            <span>🔐 Live Login History & Audit Trail (${this.loginLogs.length})</span>
          </button>
          <button class="pill-tab ${this.activeTab === 'users' ? 'pill-tab-active' : ''}" id="tab-admin-users" style="padding: 8px 18px; font-size: 13px;">
            <span>👥 Platform Users Directory (${this.allUsers.length})</span>
          </button>
          <button class="pill-tab ${this.activeTab === 'verifications' ? 'pill-tab-active' : ''}" id="tab-admin-verifications" style="padding: 8px 18px; font-size: 13px;">
            <span>📋 License & MRN Approval Queue (${pendingUsers.length})</span>
          </button>
          <button class="pill-tab" id="btn-admin-refresh" style="margin-left: auto; padding: 6px 14px; font-size: 12px; background: #fff;">
            <span>🔄 Refresh Data</span>
          </button>
        </div>

        <!-- TAB 1: LOGIN HISTORY & AUDIT LOGS -->
        ${this.activeTab === 'logs' ? `
          <div class="card-base" style="background: #ffffff; border: 1px solid var(--color-hairline); border-radius: var(--radius-xl); padding: var(--space-lg); box-shadow: var(--shadow-sm);">
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-md);">
              <div>
                <h2 style="font-size: 18px; font-weight: 800; color: var(--color-primary); margin: 0;">
                  Authentication & Login Event Stream
                </h2>
                <div style="font-size: 12px; color: var(--color-slate); margin-top: 2px;">
                  Tracks all sign-in activities, Gmail addresses, IP locations, and security statuses.
                </div>
              </div>
              <span class="badge-promo" style="background: #f1f5f9; color: #475569; font-weight: 600;">
                Showing latest ${this.loginLogs.length} events
              </span>
            </div>

            <!-- Login Logs Table -->
            <div style="overflow-x: auto;">
              <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left;">
                <thead>
                  <tr style="background: var(--color-surface); border-bottom: 2px solid var(--color-hairline); color: var(--color-slate); font-size: 11px; text-transform: uppercase;">
                    <th style="padding: 10px 14px;">User & Full Name</th>
                    <th style="padding: 10px 14px;">Gmail / Email Address</th>
                    <th style="padding: 10px 14px;">Assigned Role</th>
                    <th style="padding: 10px 14px;">Timestamp (IST)</th>
                    <th style="padding: 10px 14px;">IP Address / Device</th>
                    <th style="padding: 10px 14px;">Auth Result</th>
                  </tr>
                </thead>
                <tbody>
                  ${this.loginLogs.map(log => {
                    let roleBadgeBg = "#e0f2fe";
                    let roleBadgeColor = "#0369a1";
                    if (log.role === "DOCTOR") { roleBadgeBg = "#e0f2fe"; roleBadgeColor = "#0284c7"; }
                    else if (log.role === "PHARMACY") { roleBadgeBg = "#fef3c7"; roleBadgeColor = "#d97706"; }
                    else if (log.role === "ADMIN") { roleBadgeBg = "#f1f5f9"; roleBadgeColor = "#475569"; }
                    else if (log.role === "PATIENT") { roleBadgeBg = "var(--color-surface-yellow)"; roleBadgeColor = "var(--color-primary)"; }

                    const isSuccess = log.status === "SUCCESS" || log.status === "SUCCESS_REGISTER";
                    const formattedDate = new Date(log.timestamp).toLocaleString("en-IN", {
                      timeZone: "Asia/Kolkata",
                      dateStyle: "medium",
                      timeStyle: "short"
                    });

                    return `
                      <tr style="border-bottom: 1px solid var(--color-hairline); transition: background 0.1s ease;">
                        <td style="padding: 12px 14px; font-weight: 700; color: var(--color-primary);">
                          ${log.fullName || 'User'}
                        </td>
                        <td style="padding: 12px 14px; font-family: var(--font-family-mono); font-size: 12px; color: var(--color-brand-blue);">
                          ${log.email}
                        </td>
                        <td style="padding: 12px 14px;">
                          <span style="font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: var(--radius-full); background: ${roleBadgeBg}; color: ${roleBadgeColor};">
                            ${log.role}
                          </span>
                        </td>
                        <td style="padding: 12px 14px; color: var(--color-slate); font-size: 12px;">
                          ${formattedDate}
                        </td>
                        <td style="padding: 12px 14px; font-size: 11px; color: var(--color-charcoal);">
                          <div><strong>${log.ipAddress || '127.0.0.1'}</strong></div>
                          <div style="font-size: 10px; color: var(--color-slate); max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                            ${log.userAgent || 'Web Browser'}
                          </div>
                        </td>
                        <td style="padding: 12px 14px;">
                          <span style="font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: var(--radius-full); background: ${isSuccess ? '#dcfce7' : '#fee2e2'}; color: ${isSuccess ? '#15803d' : '#b91c1c'};">
                            ● ${isSuccess ? 'AUTHORIZED' : log.status}
                          </span>
                        </td>
                      </tr>
                    `;
                  }).join("")}
                </tbody>
              </table>
            </div>

          </div>
        ` : ''}

        <!-- TAB 2: PLATFORM USERS REGISTRY -->
        ${this.activeTab === 'users' ? `
          <div class="card-base" style="background: #ffffff; border: 1px solid var(--color-hairline); border-radius: var(--radius-xl); padding: var(--space-lg); box-shadow: var(--shadow-sm);">
            
            <div style="margin-bottom: var(--space-md);">
              <h2 style="font-size: 18px; font-weight: 800; color: var(--color-primary); margin: 0;">
                Registered Healthcare Stakeholders Directory
              </h2>
              <div style="font-size: 12px; color: var(--color-slate); margin-top: 2px;">
                List of all doctor clinics, retail pharmacies, and patient ABHA profiles in MongoDB.
              </div>
            </div>

            <div style="overflow-x: auto;">
              <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left;">
                <thead>
                  <tr style="background: var(--color-surface); border-bottom: 2px solid var(--color-hairline); color: var(--color-slate); font-size: 11px; text-transform: uppercase;">
                    <th style="padding: 10px 14px;">Name / Store</th>
                    <th style="padding: 10px 14px;">Gmail / Contact</th>
                    <th style="padding: 10px 14px;">Role</th>
                    <th style="padding: 10px 14px;">Identifier (MRN / DLN / ABHA)</th>
                    <th style="padding: 10px 14px;">Verification</th>
                  </tr>
                </thead>
                <tbody>
                  ${this.allUsers.map(user => {
                    let idBadge = "N/A";
                    if (user.role === "DOCTOR") idBadge = `MRN: ${user.doctor_profile?.mrn || 'KMC-Pending'}`;
                    else if (user.role === "PHARMACY") idBadge = `DLN: ${user.pharmacy_profile?.dln || 'DLN-Pending'}`;
                    else if (user.role === "PATIENT") idBadge = `ABHA: ${user.patient_profile?.abha_id || 'ABHA-Auto'}`;

                    return `
                      <tr style="border-bottom: 1px solid var(--color-hairline);">
                        <td style="padding: 12px 14px; font-weight: 700; color: var(--color-primary);">
                          ${user.full_name}
                        </td>
                        <td style="padding: 12px 14px;">
                          <div style="font-weight: 600; color: var(--color-brand-blue);">${user.email}</div>
                          <div style="font-size: 11px; color: var(--color-slate);">${user.phone || 'N/A'}</div>
                        </td>
                        <td style="padding: 12px 14px; font-weight: 700;">
                          ${user.role}
                        </td>
                        <td style="padding: 12px 14px; font-family: var(--font-family-mono); font-size: 12px;">
                          ${idBadge}
                        </td>
                        <td style="padding: 12px 14px;">
                          <span style="font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: var(--radius-full); background: ${user.verificationStatus === 'ACTIVE' ? '#dcfce7' : '#fef3c7'}; color: ${user.verificationStatus === 'ACTIVE' ? '#15803d' : '#d97706'};">
                            ● ${user.verificationStatus}
                          </span>
                        </td>
                      </tr>
                    `;
                  }).join("")}
                </tbody>
              </table>
            </div>

          </div>
        ` : ''}

        <!-- TAB 3: LICENSE & MRN VERIFICATION QUEUE -->
        ${this.activeTab === 'verifications' ? `
          <div class="card-base" style="background: #ffffff; border: 1px solid var(--color-hairline); border-radius: var(--radius-xl); padding: var(--space-lg); box-shadow: var(--shadow-sm);">
            
            <div style="margin-bottom: var(--space-md);">
              <h2 style="font-size: 18px; font-weight: 800; color: var(--color-primary); margin: 0;">
                Pending Regulatory Credential Approvals (${pendingUsers.length})
              </h2>
              <div style="font-size: 12px; color: var(--color-slate); margin-top: 2px;">
                Review and approve or reject Doctor Medical Registration Numbers and Pharmacy Drug Licenses.
              </div>
            </div>

            ${pendingUsers.length > 0 ? `
              <div style="display: flex; flex-direction: column; gap: 12px;">
                ${pendingUsers.map(user => `
                  <div class="card-base" style="padding: 16px; border: 1px solid var(--color-hairline); border-radius: var(--radius-lg); background: #f8fafc; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                    <div>
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 16px; font-weight: 800; color: var(--color-primary);">${user.full_name}</span>
                        <span class="badge-promo" style="font-size: 10px; background: #fef3c7; color: #d97706;">${user.role}</span>
                      </div>
                      <div style="font-size: 12px; color: var(--color-slate); margin-top: 4px;">
                        Email: <strong>${user.email}</strong> • Phone: <strong>${user.phone}</strong>
                      </div>
                      <div style="font-size: 12px; color: var(--color-charcoal); margin-top: 4px;">
                        ${user.role === 'DOCTOR' 
                          ? `MRN: <strong>${user.doctor_profile?.mrn || 'KMC-58291'}</strong> • Council: <em>${user.doctor_profile?.state_council || 'KMC'}</em> • Specialty: <em>${user.doctor_profile?.specialization || 'General'}</em>` 
                          : `DLN: <strong>${user.pharmacy_profile?.dln || 'DLN-8891'}</strong> • Address: <em>${user.pharmacy_profile?.address || 'Bengaluru'}</em>`}
                      </div>
                    </div>

                    <div style="display: flex; gap: 8px;">
                      <button class="button-primary btn-approve-user" data-user-id="${user.id}" style="padding: 8px 16px; font-size: 12px; background: #16a34a; border-color: #16a34a;">
                        <span>✅ Approve License</span>
                      </button>
                      <button class="button-secondary btn-reject-user" data-user-id="${user.id}" style="padding: 8px 12px; font-size: 12px; color: #dc2626; border-color: #fecaca; background: #fff;">
                        <span>✕ Reject</span>
                      </button>
                    </div>
                  </div>
                `).join("")}
              </div>
            ` : `
              <div style="text-align: center; padding: 40px 20px; color: var(--color-slate);">
                <div style="font-size: 32px; margin-bottom: 6px;">🎉</div>
                <div style="font-size: 15px; font-weight: 700; color: var(--color-primary);">All Credentials Verified</div>
                <p style="font-size: 12px; margin-top: 2px;">No pending doctor MRN or pharmacy license applications require review.</p>
              </div>
            `}

          </div>
        ` : ''}

      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    // Tab switching
    const tabLogs = this.container.querySelector("#tab-admin-logs");
    const tabUsers = this.container.querySelector("#tab-admin-users");
    const tabVerifs = this.container.querySelector("#tab-admin-verifications");
    const btnRefresh = this.container.querySelector("#btn-admin-refresh");

    if (tabLogs) {
      tabLogs.addEventListener("click", () => {
        this.activeTab = "logs";
        this.render();
      });
    }

    if (tabUsers) {
      tabUsers.addEventListener("click", () => {
        this.activeTab = "users";
        this.render();
      });
    }

    if (tabVerifs) {
      tabVerifs.addEventListener("click", () => {
        this.activeTab = "verifications";
        this.render();
      });
    }

    if (btnRefresh) {
      btnRefresh.addEventListener("click", async () => {
        await this.fetchData();
        store.showToast("Admin data refreshed from MongoDB!", "success");
        this.render();
      });
    }

    // Approve user action
    this.container.querySelectorAll(".btn-approve-user").forEach(btn => {
      btn.addEventListener("click", async () => {
        const userId = btn.getAttribute("data-user-id");
        try {
          await authService.adminVerifyUser(userId, true);
          store.showToast("User credentials approved!", "success");
          await this.fetchData();
          this.render();
        } catch (err) {
          store.showToast(err.message, "error");
        }
      });
    });

    // Reject user action
    this.container.querySelectorAll(".btn-reject-user").forEach(btn => {
      btn.addEventListener("click", async () => {
        const userId = btn.getAttribute("data-user-id");
        try {
          await authService.adminVerifyUser(userId, false, "Credentials failed State Medical Council verification.");
          store.showToast("User registration rejected.", "info");
          await this.fetchData();
          this.render();
        } catch (err) {
          store.showToast(err.message, "error");
        }
      });
    });
  }
}
