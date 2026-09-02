/**
 * MIRO CUSTOMER STORIES & CASE STUDIES DIRECTORY
 * Filterable 2-column grid with stat displays from DESIGN.md
 */

import { CUSTOMER_STORIES, STAT_HIGHLIGHTS } from "../data/storiesData.js";

export class CustomerStoriesComponent {
  render() {
    return `
      <section class="section-lg" id="customers" role="region" aria-label="Customer Case Studies">
        <div class="container">
          
          <!-- Stat Banner Row -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: var(--space-xl); margin-bottom: var(--space-section-lg); text-align: center; border-bottom: 1px solid var(--color-hairline); padding-bottom: var(--space-section);">
            ${STAT_HIGHLIGHTS.map(s => `
              <div>
                <div class="stat-display">${s.value}</div>
                <div class="body-sm-medium" style="color: var(--color-slate); margin-top: var(--space-xs);">${s.label}</div>
              </div>
            `).join("")}
          </div>

          <!-- Section Header -->
          <div style="display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: var(--space-lg); margin-bottom: var(--space-xl);">
            <div>
              <span class="badge-tag-yellow" style="margin-bottom: var(--space-xs);">Enterprise Proof</span>
              <h2 class="display-lg">See how leading teams scale with Miro</h2>
            </div>

            <!-- Filter Pills -->
            <div style="display: flex; gap: var(--space-sm); flex-wrap: wrap;">
              <button class="pill-tab pill-tab-active" data-filter="all">All Stories</button>
              <button class="pill-tab" data-filter="automotive">Automotive</button>
              <button class="pill-tab" data-filter="tech">Technology</button>
              <button class="pill-tab" data-filter="retail">Retail</button>
            </div>
          </div>

          <!-- 2-Column Story Grid -->
          <div class="customer-stories-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-xl);">
            ${CUSTOMER_STORIES.map(story => `
              <div class="card-customer-story ${story.accentCard}" style="padding: var(--space-xxl); justify-content: space-between; min-height: 420px;">
                <div>
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-lg);">
                    <span class="badge-promo" style="background: #fff; color: var(--color-primary); font-weight: 700;">
                      ${story.company.toUpperCase()}
                    </span>
                    <span style="font-size: 13px; font-weight: 500; color: var(--color-charcoal);">${story.industry}</span>
                  </div>

                  <h3 class="heading-2" style="margin-bottom: var(--space-md); color: var(--color-primary); line-height: 1.25;">
                    "${story.headline}"
                  </h3>

                  <p class="body-md" style="color: var(--color-charcoal); line-height: 1.6; margin-bottom: var(--space-lg);">
                    ${story.quote}
                  </p>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: flex-end; padding-top: var(--space-lg); border-top: 1px solid rgba(0,0,0,0.08);">
                  <div>
                    <div style="font-size: 32px; font-weight: 800; font-family: var(--font-family-display); color: var(--color-primary);">${story.stat}</div>
                    <div style="font-size: 12px; color: var(--color-slate); font-weight: 600;">${story.statLabel}</div>
                  </div>

                  <div style="text-align: right;">
                    <div style="font-size: 13px; font-weight: 600; color: var(--color-primary);">${story.author.split(",")[0]}</div>
                    <div style="font-size: 11px; color: var(--color-slate);">${story.author.split(",")[1] || ''}</div>
                  </div>
                </div>
              </div>
            `).join("")}
          </div>

        </div>
      </section>
    `;
  }
}
