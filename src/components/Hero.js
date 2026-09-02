/**
 * MIRO MARKETING HERO & LIVE WHITEBOARD CANVAS COMPONENT
 * Compliant with DESIGN.md specifications
 */

export class HeroComponent {
  constructor(container) {
    this.container = container;
  }

  render() {
    return `
      <section class="hero-band-marketing" id="hero" role="region" aria-label="Hero Section">
        <div class="container">
          
          <!-- Hero Header Text -->
          <div style="max-width: 960px; margin: 0 auto; text-align: center;">
            <div class="badge-tag-yellow" style="margin-bottom: var(--space-lg);">
              <span>⚡ The AI-Powered Visual Workspace</span>
            </div>
            
            <h1 class="hero-display" style="margin-bottom: var(--space-lg);">
              See how teams get great done with Miro
            </h1>

            <p class="subtitle" style="max-width: 720px; margin: 0 auto var(--space-xxl) auto;">
              The visual workspace for innovation where cross-functional teams turn big ideas into execution with AI workflows, smart diagramming, and real-time canvas collaboration.
            </p>

            <!-- Hero Action Buttons -->
            <div class="hero-cta-group" style="display: flex; align-items: center; justify-content: center; gap: var(--space-md); margin-bottom: var(--space-xl); flex-wrap: wrap;">
              <a href="#signup" class="button-primary" style="padding: 16px 32px; font-size: 16px;">
                <span>Get started free</span>
                <span>➔</span>
              </a>
              <a href="#demo" class="button-secondary" style="padding: 16px 32px; font-size: 16px;">
                <span>Book a demo</span>
              </a>
            </div>

            <!-- Review / Rating Trust Strip -->
            <div style="display: flex; align-items: center; justify-content: center; gap: var(--space-md); font-size: 13px; color: var(--color-stone); margin-bottom: var(--space-section);">
              <div style="display: flex; align-items: center; gap: 2px; color: #f59e0b;">
                ★★★★★
              </div>
              <span><strong>4.8 / 5</strong> rating based on 5,000+ reviews on G2 & Capterra</span>
              <span>• Free forever • No credit card needed</span>
            </div>
          </div>

          <!-- ====================================================================
               INTERACTIVE LIVE MIRO WHITEBOARD MOCKUP
               ==================================================================== -->
          <div class="whiteboard-mockup" id="interactive-whiteboard">
            
            <!-- Left Toolbar -->
            <div class="board-toolbar" aria-label="Canvas Tools">
              <button class="board-tool-btn active" title="Select Tool (V)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M4 0l16 12.279-6.951 1.17 4.325 8.817-3.596 1.734-4.35-8.879-5.428 5.428v-20.549z"/></svg>
              </button>
              <button class="board-tool-btn" id="btn-add-sticky" title="Add Sticky Note (N)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
              </button>
              <button class="board-tool-btn" title="Shapes (S)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/></svg>
              </button>
              <button class="board-tool-btn" title="Connector Line (L)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
              <button class="board-tool-btn" title="Miro AI (Cmd+K)" style="color: var(--color-brand-blue);">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
              </button>
            </div>

            <!-- Top Canvas Status -->
            <div style="position: absolute; top: 16px; right: 20px; z-index: 10; display: flex; align-items: center; gap: var(--space-sm); background: rgba(255,255,255,0.9); backdrop-filter: blur(8px); padding: 6px 14px; border-radius: var(--radius-full); border: 1px solid var(--color-hairline); box-shadow: var(--shadow-subtle);">
              <div style="width: 8px; height: 8px; border-radius: 50%; background: var(--color-success-accent);"></div>
              <span style="font-size: 13px; font-weight: 600; color: var(--color-ink);">Live Team Canvas: Q3 Product Roadmap</span>
              <span class="badge-tag-purple" style="padding: 2px 8px; font-size: 11px;">Miro AI Active</span>
            </div>

            <!-- Sticky Notes Layer -->
            <div class="sticky-note sticky-yellow" style="top: 80px; left: 120px; transform: rotate(-2deg);">
              <div>
                <strong>🚀 Q3 Launch Goal</strong>
                <p style="margin-top: 4px; font-size: 12px;">Unified visual workspace with live multi-agent sync.</p>
              </div>
              <div style="font-size: 10px; opacity: 0.8;">@henrik • Volvo</div>
            </div>

            <div class="sticky-note sticky-teal" style="top: 100px; left: 320px; transform: rotate(1deg);">
              <div>
                <strong>🤖 AI Prompt Engine</strong>
                <p style="margin-top: 4px; font-size: 12px;">Auto-generate user journeys from research notes.</p>
              </div>
              <div style="font-size: 10px; opacity: 0.8;">@sarah • Cisco</div>
            </div>

            <div class="sticky-note sticky-coral" style="top: 130px; left: 520px; transform: rotate(-1.5deg);">
              <div>
                <strong>⚡ Sprint Velocity</strong>
                <p style="margin-top: 4px; font-size: 12px;">Reduce cross-team alignment friction by 40%.</p>
              </div>
              <div style="font-size: 10px; opacity: 0.8;">@marcus • Nike</div>
            </div>

            <div class="sticky-note sticky-rose" style="top: 110px; left: 720px; transform: rotate(2deg);">
              <div>
                <strong>🎨 Design Tokens</strong>
                <p style="margin-top: 4px; font-size: 12px;">Figma to Miro bi-directional component mapping.</p>
              </div>
              <div style="font-size: 10px; opacity: 0.8;">@elena • Shopify</div>
            </div>

            <!-- Flowchart / Diagram Nodes -->
            <div style="position: absolute; top: 290px; left: 180px; background: #fff; border: 2px solid var(--color-brand-blue); border-radius: var(--radius-lg); padding: 14px 20px; box-shadow: var(--shadow-card); z-index: 5;">
              <div style="font-size: 12px; font-weight: 700; color: var(--color-brand-blue); text-transform: uppercase;">1. User Research & Brainstorm</div>
              <div style="font-size: 13px; font-weight: 500; margin-top: 2px;">Synthesize 250+ customer feedback cards</div>
            </div>

            <div style="position: absolute; top: 310px; left: 480px; width: 100px; height: 2px; background: var(--color-brand-blue); z-index: 4;">
              <span style="position: absolute; right: -4px; top: -5px; color: var(--color-brand-blue); font-size: 12px;">➔</span>
            </div>

            <div style="position: absolute; top: 290px; left: 600px; background: #fff; border: 2px solid var(--color-success-accent); border-radius: var(--radius-lg); padding: 14px 20px; box-shadow: var(--shadow-card); z-index: 5;">
              <div style="font-size: 12px; font-weight: 700; color: var(--color-success-accent); text-transform: uppercase;">2. Automated Jira User Stories</div>
              <div style="font-size: 13px; font-weight: 500; margin-top: 2px;">Miro AI extracts acceptance criteria</div>
            </div>

            <!-- Multi-User Real-time Live Cursors -->
            <div class="live-cursor" style="top: 230px; left: 290px;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#ffd02f"><path d="M4 0l16 12.279-6.951 1.17 4.325 8.817-3.596 1.734-4.35-8.879-5.428 5.428v-20.549z"/></svg>
              <span class="cursor-tag" style="background: #eab308; color: #000;">Henrik (Volvo)</span>
            </div>

            <div class="live-cursor" style="top: 260px; left: 740px;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#0fbcb0"><path d="M4 0l16 12.279-6.951 1.17 4.325 8.817-3.596 1.734-4.35-8.879-5.428 5.428v-20.549z"/></svg>
              <span class="cursor-tag" style="background: #0fbcb0;">Sarah (Cisco)</span>
            </div>

            <!-- Interactive AI Prompt Bar at Bottom of Canvas -->
            <div style="position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); width: 90%; max-width: 680px; z-index: 15; background: rgba(28, 28, 30, 0.95); backdrop-filter: blur(16px); padding: 10px 16px; border-radius: var(--radius-full); box-shadow: var(--shadow-modal); display: flex; align-items: center; justify-content: space-between; gap: var(--space-md);">
              <div style="display: flex; align-items: center; gap: var(--space-sm); flex: 1;">
                <span style="color: var(--color-brand-yellow); font-size: 18px;">✨</span>
                <input 
                  type="text" 
                  id="canvas-ai-prompt" 
                  placeholder="Ask Miro AI to cluster notes, generate user flows, or create sprint tasks..." 
                  style="background: transparent; border: none; color: #fff; font-size: 14px; width: 100%; padding: 0; outline: none;"
                  value="Cluster customer research stickies by theme & generate 5 Jira tickets"
                />
              </div>
              <button class="button-yellow" id="btn-run-canvas-ai" style="padding: 8px 18px; font-size: 13px;">
                <span>Generate</span>
              </button>
            </div>

          </div>

        </div>
      </section>
    `;
  }

  bindEvents() {
    const addStickyBtn = document.getElementById("btn-add-sticky");
    if (addStickyBtn) {
      addStickyBtn.addEventListener("click", () => {
        const board = document.getElementById("interactive-whiteboard");
        if (board) {
          const colors = ["sticky-yellow", "sticky-rose", "sticky-teal", "sticky-coral", "sticky-blue"];
          const randomColor = colors[Math.floor(Math.random() * colors.length)];
          const newSticky = document.createElement("div");
          newSticky.className = `sticky-note ${randomColor}`;
          newSticky.style.top = `${150 + Math.random() * 120}px`;
          newSticky.style.left = `${100 + Math.random() * 600}px`;
          newSticky.style.transform = `rotate(${(Math.random() * 6 - 3).toFixed(1)}deg)`;
          newSticky.innerHTML = `
            <div>
              <strong>💡 New Idea</strong>
              <p style="margin-top: 4px; font-size: 12px;">Added from whiteboard toolbar.</p>
            </div>
            <div style="font-size: 10px; opacity: 0.8;">@you • Live</div>
          `;
          board.appendChild(newSticky);
        }
      });
    }

    const aiRunBtn = document.getElementById("btn-run-canvas-ai");
    if (aiRunBtn) {
      aiRunBtn.addEventListener("click", () => {
        const input = document.getElementById("canvas-ai-prompt");
        const promptText = input ? input.value : "";
        alert(`✨ Miro AI generated 5 structured sprint cards on your canvas for: "${promptText}"`);
      });
    }
  }
}
