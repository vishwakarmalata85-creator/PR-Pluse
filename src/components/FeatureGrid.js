/**
 * MIRO PASTEL FEATURE CARDS GRID
 * Features yellow, coral, teal, and rose cards with 28px rounded corners from DESIGN.md
 */

export class FeatureGridComponent {
  render() {
    return `
      <section class="section-lg" id="product" role="region" aria-label="Product Features">
        <div class="container">
          
          <div style="text-align: center; max-width: 800px; margin: 0 auto var(--space-section) auto;">
            <span class="badge-tag-yellow" style="margin-bottom: var(--space-md);">Visual Ecosystem</span>
            <h2 class="display-lg" style="margin-bottom: var(--space-md);">
              Designed for every stage of your innovation lifecycle
            </h2>
            <p class="subtitle">
              From initial fuzzy brainstorms to structured agile backlogs and system architectures, Miro unifies your entire team on a single infinite canvas.
            </p>
          </div>

          <!-- 4-Up Pastel Feature Grid -->
          <div class="feature-grid-4up" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-xl);">
            
            <!-- 1. Pastel Yellow Feature Card -->
            <div class="card-feature-yellow" style="min-height: 380px;">
              <div>
                <span class="badge-promo" style="background: #fff; color: #000; margin-bottom: var(--space-md);">BRAINSTORM & IDEATE</span>
                <h3 class="heading-2" style="margin-bottom: var(--space-md); color: var(--color-primary);">
                  Turn scattered thoughts into structured clarity
                </h3>
                <p class="body-md" style="color: var(--color-charcoal); line-height: 1.6;">
                  Capture sticky notes, freehand sketches, and live mood boards with smart auto-clustering, voting timers, and anonymous feedback loops.
                </p>
              </div>

              <div style="margin-top: var(--space-xl); display: flex; align-items: center; justify-content: space-between;">
                <a href="#brainstorm" class="button-primary">Explore Brainstorming</a>
                <span style="font-size: 36px;">📝</span>
              </div>
            </div>

            <!-- 2. Pastel Teal Feature Card -->
            <div class="card-feature-teal" style="min-height: 380px;">
              <div>
                <span class="badge-promo" style="background: #fff; color: var(--color-moss-dark); margin-bottom: var(--space-md);">DIAGRAM & MAP</span>
                <h3 class="heading-2" style="margin-bottom: var(--space-md); color: var(--color-primary);">
                  Technical architecture and process flows made simple
                </h3>
                <p class="body-md" style="color: var(--color-charcoal); line-height: 1.6;">
                  Create AWS, Azure, GCP, UML, and BPMN 2.0 system maps with intelligent auto-aligning connectors and bi-directional code sync.
                </p>
              </div>

              <div style="margin-top: var(--space-xl); display: flex; align-items: center; justify-content: space-between;">
                <a href="#diagramming" class="button-primary">Explore Diagramming</a>
                <span style="font-size: 36px;">📐</span>
              </div>
            </div>

            <!-- 3. Pastel Coral Feature Card -->
            <div class="card-feature-coral" style="min-height: 380px;">
              <div>
                <span class="badge-promo" style="background: #fff; color: var(--color-coral-dark); margin-bottom: var(--space-md);">AGILE & SCRUM</span>
                <h3 class="heading-2" style="margin-bottom: var(--space-md); color: var(--color-primary);">
                  Supercharge sprint planning & retrospectives
                </h3>
                <p class="body-md" style="color: var(--color-charcoal); line-height: 1.6;">
                  Run high-energy PI Planning and sprint retros with live 2-way Jira, Azure DevOps, and GitHub synchronization.
                </p>
              </div>

              <div style="margin-top: var(--space-xl); display: flex; align-items: center; justify-content: space-between;">
                <a href="#agile" class="button-primary">Explore Agile Workflows</a>
                <span style="font-size: 36px;">⚡</span>
              </div>
            </div>

            <!-- 4. Pastel Rose Feature Card -->
            <div class="card-feature-rose" style="min-height: 380px;">
              <div>
                <span class="badge-promo" style="background: #fff; color: #600000; margin-bottom: var(--space-md);">STRATEGY & MAPPING</span>
                <h3 class="heading-2" style="margin-bottom: var(--space-md); color: var(--color-primary);">
                  Align global leadership on executive OKRs
                </h3>
                <p class="body-md" style="color: var(--color-charcoal); line-height: 1.6;">
                  Connect company roadmaps, strategic pillars, and market landscape analyses in a unified, executive-ready presentation canvas.
                </p>
              </div>

              <div style="margin-top: var(--space-xl); display: flex; align-items: center; justify-content: space-between;">
                <a href="#strategy" class="button-primary">Explore Strategy</a>
                <span style="font-size: 36px;">🎯</span>
              </div>
            </div>

          </div>

        </div>
      </section>
    `;
  }
}
