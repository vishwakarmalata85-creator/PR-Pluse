/**
 * MIRO DARK CTA BANNER COMPONENT
 * Background #1c1c1e, rounded-feature 32px, white pill CTA from DESIGN.md
 */

export class CtaBannerComponent {
  render() {
    return `
      <section class="container" style="margin: var(--space-section) auto;">
        <div class="cta-banner-dark" role="region" aria-label="Call to Action">
          <span class="badge-promo" style="background: var(--color-brand-yellow); color: var(--color-primary);">
            JOIN 100M+ INNOVATORS
          </span>

          <h2 class="display-lg">
            Build your team's next breakthrough on Miro
          </h2>

          <p class="body-md">
            Start free with unlimited team members. No credit card required. Upgrade anytime as your visual workflows scale.
          </p>

          <div style="display: flex; gap: var(--space-md); flex-wrap: wrap; justify-content: center; margin-top: var(--space-sm);">
            <a href="#signup" class="button-on-dark" style="padding: 16px 32px; font-size: 16px;">
              <span>Get started free</span>
              <span>➔</span>
            </a>
            <a href="#sales" class="button-secondary" style="color: #fff; border-color: rgba(255,255,255,0.3); padding: 16px 32px; font-size: 16px;">
              <span>Contact Enterprise Sales</span>
            </a>
          </div>
        </div>
      </section>
    `;
  }
}
