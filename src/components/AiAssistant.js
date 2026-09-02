/**
 * NEXORA PULSE - MODULE 4: VERNACULAR AI ASSISTANT
 */

import { store } from "../state/store.js";
import { AiAssistantService, SUPPORTED_LANGUAGES } from "../services/aiAssistantService.js";

export class AiAssistantComponent {
  constructor(container) {
    this.container = container;
    this.currentLang = "en";
    this.isThinking = false;
    this.chatMessages = [
      { sender: "ai", text: "Hello! I am your Nexora Vernacular Health Companion. You can ask me about medication dosage timings, dietary precautions, and generic alternatives." }
    ];
  }

  render() {
    this.container.innerHTML = `
      <div class="ai-assistant-container" role="region" aria-label="Vernacular AI Health Guide">
        <aside class="ai-sidebar">
          <div class="panel">
            <div class="panel-header"><h2 class="panel-title" style="font-size: var(--text-base);"><span>🌐</span><span>Language</span></h2></div>
            <div class="language-selector-grid">
              ${SUPPORTED_LANGUAGES.map(l => `
                <button class="lang-btn ${this.currentLang === l.code ? 'active' : ''}" data-lang="${l.code}">
                  <span>${l.flag}</span><span>${l.native}</span>
                </button>
              `).join("")}
            </div>
          </div>

          <div class="panel">
            <div style="font-size: var(--text-xs); font-weight: 700; color: var(--text-muted); margin-bottom: var(--space-2);">Quick Clinical Tests</div>
            <div style="display: flex; flex-direction: column; gap: var(--space-2);">
              <button class="btn btn-secondary btn-ai-test" data-q="When should I take Cefixime 200mg?" style="font-size: var(--text-xs); justify-content: flex-start;">
                <span>💊</span> When to take Cefixime?
              </button>
              <button class="btn btn-secondary btn-ai-test" data-q="Can I get Alprazolam without doctor prescription?" style="font-size: var(--text-xs); justify-content: flex-start; border-color: var(--danger-critical);">
                <span>🔒</span> Schedule X Controlled Lock Test
              </button>
              <button class="btn btn-secondary btn-ai-test" data-q="I have severe sudden chest pain!" style="font-size: var(--text-xs); justify-content: flex-start; border-color: var(--danger-critical); color: var(--danger-light);">
                <span>🚨</span> Emergency EMS 108 Test
              </button>
            </div>
          </div>
        </aside>

        <section class="chat-thread-container">
          <div class="chat-messages-area" id="ai-chat-box">
            ${this.chatMessages.map(m => `
              <div class="chat-bubble ${m.sender === 'user' ? 'user' : m.guardrail ? 'guardrail-blocked' : 'ai'}">
                <div>${m.text}</div>
                ${m.sender === 'ai' && !m.guardrail ? `
                  <button class="audio-listen-btn btn-speak" data-text="${encodeURIComponent(m.text)}" style="margin-top: var(--space-2);">
                    <span>🔊 Listen Audio</span>
                  </button>
                ` : ''}
              </div>
            `).join("")}
            ${this.isThinking ? `
              <div class="chat-bubble ai" style="opacity: 0.8; font-style: italic;">
                ⚡ PulseCare AI is thinking with Gemini...
              </div>
            ` : ''}
          </div>

          <div class="chat-input-bar">
            <input type="text" id="ai-user-query" placeholder="Ask about medicine timings, diet precautions..." ${this.isThinking ? 'disabled' : ''} style="flex: 1;" />
            <button class="btn btn-primary" id="btn-send-ai" ${this.isThinking ? 'disabled' : ''}><span>Send</span></button>
          </div>
        </section>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    this.container.querySelectorAll(".lang-btn").forEach(b => {
      b.addEventListener("click", () => {
        this.currentLang = b.getAttribute("data-lang");
        this.render();
      });
    });

    this.container.querySelectorAll(".btn-ai-test").forEach(b => {
      b.addEventListener("click", () => this.sendQuery(b.getAttribute("data-q")));
    });

    const sendBtn = this.container.querySelector("#btn-send-ai");
    const input = this.container.querySelector("#ai-user-query");
    if (sendBtn && input) {
      sendBtn.addEventListener("click", () => this.sendQuery(input.value));
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") this.sendQuery(input.value);
      });
    }

    this.container.querySelectorAll(".btn-speak").forEach(b => {
      b.addEventListener("click", () => {
        AiAssistantService.speak(decodeURIComponent(b.getAttribute("data-text")));
      });
    });
  }

  async sendQuery(text) {
    if (!text || !text.trim() || this.isThinking) return;
    const query = text.trim();
    this.chatMessages.push({ sender: "user", text: query });
    this.isThinking = true;
    this.render();

    try {
      const res = await AiAssistantService.generateResponse(query, this.currentLang, this.chatMessages);
      this.isThinking = false;
      this.chatMessages.push({ sender: "ai", text: res.text, guardrail: res.guardrail });
      this.render();
      if (res.guardrail_data?.action === "CALL_108") {
        store.openModal("emergency_sos");
      }
    } catch (err) {
      this.isThinking = false;
      this.chatMessages.push({ sender: "ai", text: `Error: ${err.message}` });
      this.render();
    }
  }
}
