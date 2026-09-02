/**
 * MIRO MASSIVE 6-COLUMN DARK FOOTER COMPONENT
 * Compliant with DESIGN.md specifications
 */

export class FooterComponent {
  render() {
    return `
      <footer class="footer-region" role="contentinfo">
        <div class="container">
          
          <div class="footer-grid">
            
            <!-- Column 1: Product -->
            <div class="footer-col">
              <h4>Product</h4>
              <ul class="footer-link-list">
                <li><a href="#" class="footer-link">Visual Canvas</a></li>
                <li><a href="#" class="footer-link">Miro AI Workflows</a></li>
                <li><a href="#" class="footer-link">Diagramming & Mapping</a></li>
                <li><a href="#" class="footer-link">Mind Maps</a></li>
                <li><a href="#" class="footer-link">Online Whiteboard</a></li>
                <li><a href="#" class="footer-link">TalkTrack Video</a></li>
                <li><a href="#" class="footer-link">Miro Developer Platform</a></li>
              </ul>
            </div>

            <!-- Column 2: Solutions -->
            <div class="footer-col">
              <h4>Solutions</h4>
              <ul class="footer-link-list">
                <li><a href="#" class="footer-link">Engineering & Architecture</a></li>
                <li><a href="#" class="footer-link">Product Management</a></li>
                <li><a href="#" class="footer-link">UX & Product Design</a></li>
                <li><a href="#" class="footer-link">Agile & Scrum Teams</a></li>
                <li><a href="#" class="footer-link">Consultants & Agencies</a></li>
                <li><a href="#" class="footer-link">Enterprise Innovation</a></li>
              </ul>
            </div>

            <!-- Column 3: Tools & Integrations -->
            <div class="footer-col">
              <h4>Tools & Ecosystem</h4>
              <ul class="footer-link-list">
                <li><a href="#" class="footer-link">Jira & Confluence Sync</a></li>
                <li><a href="#" class="footer-link">Figma 2-Way Plugin</a></li>
                <li><a href="#" class="footer-link">GitHub Integration</a></li>
                <li><a href="#" class="footer-link">Slack & MS Teams App</a></li>
                <li><a href="#" class="footer-link">Zoom Whiteboard App</a></li>
                <li><a href="#" class="footer-link">Miro Marketplace (120+)</a></li>
              </ul>
            </div>

            <!-- Column 4: Resources -->
            <div class="footer-col">
              <h4>Resources</h4>
              <ul class="footer-link-list">
                <li><a href="#" class="footer-link">Miroverse Template Hub</a></li>
                <li><a href="#" class="footer-link">Miro Academy</a></li>
                <li><a href="#" class="footer-link">Customer Stories</a></li>
                <li><a href="#" class="footer-link">Visual Collaboration Blog</a></li>
                <li><a href="#" class="footer-link">Community Forum</a></li>
                <li><a href="#" class="footer-link">Help Center & Docs</a></li>
              </ul>
            </div>

            <!-- Column 5: Company -->
            <div class="footer-col">
              <h4>Company</h4>
              <ul class="footer-link-list">
                <li><a href="#" class="footer-link">About Us</a></li>
                <li><a href="#" class="footer-link">Careers (We're hiring!)</a></li>
                <li><a href="#" class="footer-link">News & Press</a></li>
                <li><a href="#" class="footer-link">Security & Trust Center</a></li>
                <li><a href="#" class="footer-link">Sustainability & ESG</a></li>
                <li><a href="#" class="footer-link">Contact Us</a></li>
              </ul>
            </div>

            <!-- Column 6: Plans & Pricing -->
            <div class="footer-col">
              <h4>Plans & Pricing</h4>
              <ul class="footer-link-list">
                <li><a href="#pricing" class="footer-link">Free Plan</a></li>
                <li><a href="#pricing" class="footer-link">Starter Plan</a></li>
                <li><a href="#pricing" class="footer-link">Business Plan</a></li>
                <li><a href="#pricing" class="footer-link">Enterprise Plan</a></li>
                <li><a href="#" class="footer-link">Miro for Startups</a></li>
                <li><a href="#" class="footer-link">Miro for Education</a></li>
              </ul>
            </div>

          </div>

          <!-- Bottom Footer Bar: Badges & Legal -->
          <div class="footer-bottom">
            <div style="display: flex; align-items: center; gap: var(--space-md); flex-wrap: wrap;">
              <a href="#" class="capterra-badge">
                <span style="font-weight: 700; color: #f59e0b;">★★★★★</span>
                <span><strong>4.8</strong> on Capterra & G2</span>
              </a>

              <a href="#" class="app-store-badge">
                <span>🍏</span>
                <span>App Store</span>
              </a>

              <a href="#" class="app-store-badge">
                <span>🤖</span>
                <span>Google Play</span>
              </a>
            </div>

            <div style="font-size: 12px; color: var(--color-on-dark-muted);">
              © 2026 Miro. All rights reserved. • Privacy Policy • Terms of Service • Security
            </div>
          </div>

        </div>
      </footer>
    `;
  }
}
