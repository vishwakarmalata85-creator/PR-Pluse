/**
 * NEXORA PULSECARE - PRODUCTION HEALTHCARE ECOSYSTEM FOOTER
 * Designed per DESIGN.md specifications & ABDM Healthcare Standards.
 */

export class FooterComponent {
  render() {
    return `
      <footer class="footer-region" role="contentinfo" style="background: #0f172a; color: #f8fafc; padding: 60px 0 30px 0; border-top: 1px solid #334155;">
        <div class="container">
          
          <div class="footer-grid" style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 32px; margin-bottom: 48px;">
            
            <!-- Column 1: PulseMD Clinical OS -->
            <div class="footer-col">
              <h4 style="color: #38bdf8; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 16px;">
                PulseMD Clinical
              </h4>
              <ul class="footer-link-list" style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; font-size: 13px;">
                <li><a href="#/doctor" style="color: #94a3b8; text-decoration: none;">OPD Queue & Intake Hub</a></li>
                <li><a href="#/doctor" style="color: #94a3b8; text-decoration: none;">Dual Rx Builder & ICD-10</a></li>
                <li><a href="#/doctor" style="color: #94a3b8; text-decoration: none;">DDI Clinical Safety Sentinel</a></li>
                <li><a href="#/vault" style="color: #94a3b8; text-decoration: none;">EMR Vault & FHIR R4</a></li>
                <li><a href="#/doctor" style="color: #94a3b8; text-decoration: none;">Doctor Credentials Verification</a></li>
              </ul>
            </div>

            <!-- Column 2: PulsePharm Dispensary -->
            <div class="footer-col">
              <h4 style="color: #fbbf24; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 16px;">
                PulsePharm Radar
              </h4>
              <ul class="footer-link-list" style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; font-size: 13px;">
                <li><a href="#/pharmacy" style="color: #94a3b8; text-decoration: none;">Live Pharmacy Order Queue</a></li>
                <li><a href="#/pharmacy" style="color: #94a3b8; text-decoration: none;">TrOCR Prescription Audit POS</a></li>
                <li><a href="#/pharmacy-radar" style="color: #94a3b8; text-decoration: none;">5km Geo-Spatial Stock Radar</a></li>
                <li><a href="#/pharmacy" style="color: #94a3b8; text-decoration: none;">Jan Aushadhi Generic Engine</a></li>
                <li><a href="#/pharmacy" style="color: #94a3b8; text-decoration: none;">1-Click Counter Pickup</a></li>
              </ul>
            </div>

            <!-- Column 3: Patient Services -->
            <div class="footer-col">
              <h4 style="color: #34d399; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 16px;">
                Patient Care
              </h4>
              <ul class="footer-link-list" style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; font-size: 13px;">
                <li><a href="#/doctors" style="color: #94a3b8; text-decoration: none;">Find Verified Practitioners</a></li>
                <li><a href="#/doctors" style="color: #94a3b8; text-decoration: none;">Instant Slot & Token Booking</a></li>
                <li><a href="#/orders" style="color: #94a3b8; text-decoration: none;">Active Medicine Orders</a></li>
                <li><a href="#/vault" style="color: #94a3b8; text-decoration: none;">Ayushman Bharat ABHA Card</a></li>
                <li><a href="#/" style="color: #94a3b8; text-decoration: none;">Gemini Vision OCR Scanner</a></li>
              </ul>
            </div>

            <!-- Column 4: Standards & Compliance -->
            <div class="footer-col">
              <h4 style="color: #cbd5e1; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 16px;">
                Compliance & Standards
              </h4>
              <ul class="footer-link-list" style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; font-size: 13px;">
                <li><span style="color: #94a3b8;">ABDM Milestone M2 / M3</span></li>
                <li><span style="color: #94a3b8;">HL7® FHIR® R4 Bundles</span></li>
                <li><span style="color: #94a3b8;">DISHA & HIPAA Certified</span></li>
                <li><span style="color: #94a3b8;">Schedule H / X Safety Gates</span></li>
                <li><span style="color: #94a3b8;">MongoDB Atlas Multi-Region</span></li>
              </ul>
            </div>

            <!-- Column 5: 24x7 Emergency Helplines -->
            <div class="footer-col">
              <h4 style="color: #f87171; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 16px;">
                Emergency Helplines
              </h4>
              <ul class="footer-link-list" style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; font-size: 13px;">
                <li><span style="color: #ef4444; font-weight: 700;">🚨 National Emergency: 112</span></li>
                <li><span style="color: #f87171;">🚑 Ambulance Hotline: 108</span></li>
                <li><span style="color: #f87171;">🩸 National Blood Bank: 104</span></li>
                <li><span style="color: #94a3b8;">🏥 AB-PMJAY Helpline: 14555</span></li>
                <li><span style="color: #94a3b8;">📞 PulseCare 24/7 Desk: 1800-PULSE</span></li>
              </ul>
            </div>

          </div>

          <!-- Bottom Footer Bar: Badges & Legal -->
          <div class="footer-bottom" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; padding-top: 24px; border-top: 1px solid #1e293b;">
            <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
              <span class="badge-promo" style="background: #1e293b; color: #38bdf8; font-weight: 700; border: 1px solid #334155;">
                ⚡ NEXORA PULSECARE OS
              </span>
              <span style="font-size: 12px; color: #64748b;">
                Integrated Ayushman Bharat Digital Mission (ABDM) Healthcare Infrastructure
              </span>
            </div>

            <div style="font-size: 12px; color: #64748b;">
              © 2026 PulseCare Healthcare Technologies. All rights reserved. • Privacy Policy • Clinical Governance
            </div>
          </div>

        </div>
      </footer>
    `;
  }
}
