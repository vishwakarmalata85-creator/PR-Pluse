/**
 * MIRO PRICING TABLE & DENSE COMPARISON MATRIX
 * 4-tier cards with monthly/annual toggle and comparison table from DESIGN.md
 */

import { PRICING_TIERS, COMPARISON_SECTIONS } from "../data/pricingData.js";

export class PricingTableComponent {
  constructor() {
    this.isAnnual = true;
  }

  render() {
    return `
      <section class="section-lg" id="pricing" role="region" aria-label="Pricing Plans">
        <div class="container">
          
          <!-- Header & Billing Toggle -->
          <div style="text-align: center; max-width: 800px; margin: 0 auto var(--space-xl) auto;">
            <span class="badge-tag-yellow" style="margin-bottom: var(--space-md);">Flexible Plans</span>
            <h2 class="display-lg" style="margin-bottom: var(--space-md);">
              Find the right plan for your team
            </h2>
            <p class="subtitle" style="margin-bottom: var(--space-xl);">
              Scale from individual ideation to global enterprise governance with transparent pricing and zero hidden fees.
            </p>

            <!-- Monthly / Annual Toggle -->
            <div class="toggle-monthly-yearly" id="pricing-billing-toggle">
              <button class="toggle-opt ${!this.isAnnual ? 'active' : ''}" data-billing="monthly">
                <span>Monthly billing</span>
              </button>
              <button class="toggle-opt ${this.isAnnual ? 'active' : ''}" data-billing="annual">
                <span>Annual billing</span>
                <span class="badge-discount">SAVE 15%</span>
              </button>
            </div>
          </div>

          <!-- 4-Tier Pricing Grid -->
          <div class="pricing-grid">
            ${PRICING_TIERS.map(tier => {
              const price = tier.priceMonthly === "Custom"
                ? "Custom"
                : this.isAnnual
                ? `$${tier.priceAnnually}`
                : `$${tier.priceMonthly}`;

              const cardClass = tier.enterpriseDark
                ? "pricing-card-enterprise"
                : tier.highlight
                ? "pricing-card-featured"
                : "pricing-card";

              return `
                <div class="${cardClass}">
                  <div>
                    ${tier.badgeTag ? `
                      <div style="position: absolute; top: -12px; left: 50%; transform: translateX(-50%);">
                        <span class="badge-promo" style="background: var(--color-brand-blue); color: #fff; font-size: 11px;">
                          ${tier.badgeTag}
                        </span>
                      </div>
                    ` : ''}

                    <h3 class="heading-3" style="margin-bottom: var(--space-xs);">${tier.name}</h3>
                    <p class="body-sm" style="min-height: 48px; margin-bottom: var(--space-lg);">${tier.tagline}</p>

                    <div style="margin-bottom: var(--space-xl);">
                      <div style="display: flex; align-items: baseline; gap: 4px;">
                        <span style="font-size: 40px; font-weight: 800; font-family: var(--font-family-display);">${price}</span>
                        ${tier.priceMonthly !== "Custom" ? `<span class="caption" style="color: ${tier.enterpriseDark ? 'var(--color-on-dark-muted)' : 'var(--color-stone)'};">/ member / mo</span>` : ''}
                      </div>
                      <div class="micro" style="margin-top: 4px; color: ${tier.enterpriseDark ? 'var(--color-on-dark-muted)' : 'var(--color-stone)'};">
                        ${tier.priceMonthly === "Custom" ? 'Tailored deployment & support' : this.isAnnual ? 'Billed annually' : 'Billed monthly'}
                      </div>
                    </div>

                    <a href="#plan-${tier.id}" class="${tier.buttonClass}" style="width: 100%; margin-bottom: var(--space-xl);">
                      ${tier.buttonText}
                    </a>

                    <div style="border-top: 1px solid ${tier.enterpriseDark ? 'var(--color-charcoal)' : 'var(--color-hairline)'}; padding-top: var(--space-lg);">
                      <div class="caption-bold" style="margin-bottom: var(--space-sm); color: ${tier.enterpriseDark ? 'var(--color-on-dark)' : 'var(--color-ink)'};">
                        Key Features:
                      </div>
                      <ul style="list-style: none; display: flex; flex-direction: column; gap: var(--space-xs);">
                        ${tier.keyFeatures.map(feat => `
                          <li class="body-sm" style="display: flex; align-items: flex-start; gap: 8px; color: ${tier.enterpriseDark ? 'var(--color-on-dark-muted)' : 'var(--color-slate)'};">
                            <span style="color: ${tier.enterpriseDark ? 'var(--color-brand-yellow)' : 'var(--color-brand-blue)'}; font-weight: 700;">✓</span>
                            <span>${feat}</span>
                          </li>
                        `).join("")}
                      </ul>
                    </div>
                  </div>
                </div>
              `;
            }).join("")}
          </div>

          <!-- Feature Comparison Matrix -->
          <div style="margin-top: var(--space-section); text-align: center;">
            <h3 class="heading-2" style="margin-bottom: var(--space-md);">Compare All Plan Capabilities</h3>
            <p class="body-md" style="color: var(--color-slate); max-width: 600px; margin: 0 auto var(--space-xl) auto;">
              Detailed breakdown of board limits, AI quotas, diagramming tools, and enterprise governance.
            </p>

            <div class="comparison-table-wrapper">
              <table class="comparison-table">
                <thead>
                  <tr>
                    <th style="width: 36%;">Plan Features</th>
                    <th style="width: 16%;">Free</th>
                    <th style="width: 16%;">Starter</th>
                    <th style="width: 16%; color: var(--color-brand-blue);">Business</th>
                    <th style="width: 16%;">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  ${COMPARISON_SECTIONS.map(sec => `
                    <tr class="comparison-section-header">
                      <td colspan="5">${sec.category}</td>
                    </tr>
                    ${sec.features.map(f => `
                      <tr class="comparison-row">
                        <td style="font-weight: 500;">${f.name}</td>
                        <td style="color: var(--color-slate);">${f.free}</td>
                        <td style="color: var(--color-slate);">${f.starter}</td>
                        <td style="font-weight: 600; color: var(--color-brand-blue);">${f.business}</td>
                        <td style="font-weight: 600; color: var(--color-ink);">${f.enterprise}</td>
                      </tr>
                    `).join("")}
                  `).join("")}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </section>
    `;
  }

  bindEvents() {
    const toggle = document.getElementById("pricing-billing-toggle");
    if (toggle) {
      toggle.querySelectorAll(".toggle-opt").forEach(btn => {
        btn.addEventListener("click", () => {
          const billing = btn.getAttribute("data-billing");
          this.isAnnual = billing === "annual";
          const container = document.getElementById("pricing-mount");
          if (container) {
            container.innerHTML = this.render();
            this.bindEvents();
          }
        });
      });
    }
  }
}
