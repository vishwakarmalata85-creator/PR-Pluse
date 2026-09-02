/**
 * MIRO AI WORKFLOWS PRODUCT SECTION
 * Interactive AI prompt synthesizer and agentic flow mockup
 */

export class AiWorkflowsComponent {
  render() {
    return `
      <section class="section-lg" id="ai-workflows" style="background-color: var(--color-surface); border-top: 1px solid var(--color-hairline); border-bottom: 1px solid var(--color-hairline);">
        <div class="container">
          
          <div style="display: grid; grid-template-columns: 1fr 1.2fr; gap: var(--space-section); align-items: center;">
            
            <!-- Left Info -->
            <div>
              <span class="badge-tag-purple" style="margin-bottom: var(--space-md);">
                <span>✨ Miro AI Workflows</span>
              </span>
              
              <h2 class="display-lg" style="margin-bottom: var(--space-lg);">
                Turn visual models into automated execution
              </h2>

              <p class="body-md" style="color: var(--color-slate); margin-bottom: var(--space-xl); line-height: 1.7;">
                Miro AI doesn't just generate text — it understands your entire visual board layout, recognizes relationships between diagrams and sticky notes, and auto-generates user stories, test cases, and code scaffolding.
              </p>

              <div style="display: flex; flex-direction: column; gap: var(--space-md); margin-bottom: var(--space-xxl);">
                <div style="display: flex; align-items: flex-start; gap: var(--space-sm);">
                  <span style="color: var(--color-brand-blue); font-size: 18px; font-weight: 700;">✓</span>
                  <div>
                    <strong>Sticky-to-Backlog Synthesis:</strong>
                    <span style="color: var(--color-slate); font-size: 14px;"> Instantly cluster 100+ raw brainstorm notes into weighted Jira epics.</span>
                  </div>
                </div>

                <div style="display: flex; align-items: flex-start; gap: var(--space-sm);">
                  <span style="color: var(--color-brand-blue); font-size: 18px; font-weight: 700;">✓</span>
                  <div>
                    <strong>AI Architecture Copilot:</strong>
                    <span style="color: var(--color-slate); font-size: 14px;"> Generate cloud infrastructure diagrams directly from natural language prompts.</span>
                  </div>
                </div>

                <div style="display: flex; align-items: flex-start; gap: var(--space-sm);">
                  <span style="color: var(--color-brand-blue); font-size: 18px; font-weight: 700;">✓</span>
                  <div>
                    <strong>Autonomous Agent Triggers:</strong>
                    <span style="color: var(--color-slate); font-size: 14px;"> Kick off automated webhooks and GitHub pull requests directly from visual flowcharts.</span>
                  </div>
                </div>
              </div>

              <div style="display: flex; gap: var(--space-md);">
                <a href="#ai-trial" class="button-blue">Try Miro AI Free</a>
                <a href="#ai-docs" class="button-secondary">Read AI Whitepaper</a>
              </div>
            </div>

            <!-- Right Interactive AI Workflow Card -->
            <div class="card-base" style="background: #fff; padding: var(--space-xxl); border-radius: var(--radius-xxl); box-shadow: var(--shadow-mockup);">
              
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-lg); padding-bottom: var(--space-md); border-bottom: 1px solid var(--color-hairline);">
                <div style="display: flex; align-items: center; gap: var(--space-sm);">
                  <span style="font-size: 20px;">🤖</span>
                  <span style="font-weight: 700; font-size: 16px;">AI Workflow Generator</span>
                </div>
                <span class="badge-tag-purple">Ready to Run</span>
              </div>

              <!-- Workflow Node Chain -->
              <div style="display: flex; flex-direction: column; gap: var(--space-md);">
                
                <div style="padding: var(--space-md); background: #f5f3ff; border: 1px solid #ddd6fe; border-radius: var(--radius-md);">
                  <div style="font-size: 11px; font-weight: 700; color: var(--color-brand-blue); text-transform: uppercase;">Step 1: Input Trigger</div>
                  <div style="font-size: 14px; font-weight: 600; margin-top: 2px;">Customer Feedback Canvas (34 Sticky Notes)</div>
                </div>

                <div style="text-align: center; color: var(--color-brand-blue); font-size: 16px; line-height: 1;">↓</div>

                <div style="padding: var(--space-md); background: #fff8e0; border: 1px solid #fde68a; border-radius: var(--radius-md);">
                  <div style="font-size: 11px; font-weight: 700; color: var(--color-yellow-dark); text-transform: uppercase;">Step 2: Miro AI Semantic Clustering</div>
                  <div style="font-size: 14px; font-weight: 600; margin-top: 2px;">Grouped into 4 themes: Usability, Performance, Pricing, Integrations</div>
                </div>

                <div style="text-align: center; color: var(--color-brand-blue); font-size: 16px; line-height: 1;">↓</div>

                <div style="padding: var(--space-md); background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <div style="font-size: 11px; font-weight: 700; color: var(--color-success-accent); text-transform: uppercase;">Step 3: Synced Outputs</div>
                    <div style="font-size: 14px; font-weight: 600; margin-top: 2px;">Created 12 Jira issues & 1 Product Spec Doc</div>
                  </div>
                  <span style="font-size: 12px; color: var(--color-success-accent); font-weight: 700;">✓ Synced</span>
                </div>

              </div>

              <!-- Run AI Action -->
              <div style="margin-top: var(--space-xl); padding-top: var(--space-md); border-top: 1px solid var(--color-hairline); display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 12px; color: var(--color-stone);">Execution time: <strong>0.84s</strong></span>
                <button class="button-yellow" id="btn-demo-ai-workflow" style="padding: 8px 20px; font-size: 13px;">
                  <span>⚡ Run Workflow Again</span>
                </button>
              </div>

            </div>

          </div>

        </div>
      </section>
    `;
  }
}
