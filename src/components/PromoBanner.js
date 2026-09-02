/**
 * MIRO PROMO BANNER (Sticky black strip above top nav)
 * Compliant with DESIGN.md specifications
 */

export class PromoBannerComponent {
  render() {
    return `
      <div class="promo-banner" role="complementary" aria-label="Announcement">
        <span class="badge-promo">NEW</span>
        <span>Miro Canvas '26: Discover next-gen visual AI workflows and agentic diagramming.</span>
        <a href="#ai-workflows">
          <span>GET YOUR SPOT</span>
          <span>➔</span>
        </a>
      </div>
    `;
  }
}
