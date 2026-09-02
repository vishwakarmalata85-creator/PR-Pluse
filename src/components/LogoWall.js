/**
 * MIRO CUSTOMER LOGO WALL
 * Consistent height customer wordmarks from DESIGN.md
 */

export class LogoWallComponent {
  render() {
    const logos = [
      { name: "VOLVO", subtitle: "Automotive" },
      { name: "CISCO", subtitle: "Networking" },
      { name: "NIKE", subtitle: "Global Retail" },
      { name: "DELOITTE", subtitle: "Consulting" },
      { name: "OKTA", subtitle: "Identity" },
      { name: "SHOPIFY", subtitle: "E-Commerce" },
      { name: "DOCUSIGN", subtitle: "Enterprise" }
    ];

    return `
      <section class="section" style="padding: var(--space-section) 0; border-top: 1px solid var(--color-hairline-soft); border-bottom: 1px solid var(--color-hairline-soft); background-color: var(--color-surface-soft);">
        <div class="container" style="text-align: center;">
          <p class="body-sm-medium" style="color: var(--color-steel); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: var(--space-xl);">
            Trusted by 99% of the Fortune 100 to build the future
          </p>

          <div style="display: flex; align-items: center; justify-content: space-around; flex-wrap: wrap; gap: var(--space-xl);">
            ${logos.map(l => `
              <div class="logo-wall-item" style="display: flex; flex-direction: column; align-items: center; opacity: 0.8; transition: opacity 0.2s;">
                <span style="font-family: var(--font-family-display); font-size: 24px; font-weight: 800; letter-spacing: -1px; color: var(--color-charcoal);">${l.name}</span>
                <span style="font-size: 11px; color: var(--color-stone);">${l.subtitle}</span>
              </div>
            `).join("")}
          </div>
        </div>
      </section>
    `;
  }
}
