/**
 * NEXORA PULSECARE - LIVE AI ASSISTANT FLOATING CHAT WIDGET
 * Powered by Google Gemini through secure backend proxy.
 * API keys are kept 100% hidden on the server.
 */

import { store } from "../state/store.js";
import { AiAssistantService } from "../services/aiAssistantService.js";

const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", flag: "GB" },
  { code: "hi", name: "हिंदी (Hindi)", flag: "IN" },
  { code: "bn", name: "বাংলা (Bengali)", flag: "IN" },
  { code: "mr", name: "मराठी (Marathi)", flag: "IN" },
  { code: "ta", name: "தமிழ் (Tamil)", flag: "IN" },
  { code: "te", name: "తెలుగు (Telugu)", flag: "IN" },
  { code: "es", name: "Español", flag: "ES" }
];

export class PulseCareFloatingChat {
  constructor(containerId = "pulsecare-chat-container") {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      this.container = document.createElement("div");
      this.container.id = containerId;
      document.body.appendChild(this.container);
    }

    this.isOpen = false;
    this.isThinking = false;
    this.currentLang = "en";
    this.chatMessages = [
      {
        sender: "ai",
        text: `Hello! I am your **PulseCare AI Health Companion** powered by Google Gemini. You can ask me what Latin abbreviations like \`1-0-1\` mean, when to take medicines, or check dietary precautions.`,
        model: "Google Gemini Live"
      }
    ];

    this.init();
  }

  init() {
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <!-- Fixed Floating Container -->
      <div class="pulsecare-chat-widget-root" style="position: fixed; bottom: clamp(16px, 3vw, var(--space-xl)); right: clamp(12px, 3vw, var(--space-xl)); z-index: 1050; display: flex; flex-direction: column; align-items: flex-end; font-family: var(--font-family); max-width: calc(100vw - 24px);">
        
        <!-- Expanded Chat Drawer / Card -->
        ${this.isOpen ? `
          <div class="card-base pulsecare-chat-window" style="width: min(410px, calc(100vw - 24px)); height: min(570px, calc(100dvh - 130px)); display: flex; flex-direction: column; padding: 0; box-shadow: var(--shadow-elevated); border: 1px solid var(--color-hairline); border-radius: var(--radius-xxl); margin-bottom: var(--space-md); background: #ffffff; overflow: hidden; animation: scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);">
            
            <!-- Chat Header (Pastel Yellow Tint) -->
            <div style="padding: 12px 18px; background: var(--color-surface-yellow); border-bottom: 1px solid #fde68a; display: flex; align-items: center; justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: var(--space-xs);">
                <div class="logo-square" style="width: 28px; height: 28px; font-size: 14px; background: var(--color-primary); color: #fff;">
                  ⚡
                </div>
                <div>
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <div style="font-weight: 800; font-size: 15px; color: var(--color-primary);">PulseCare AI</div>
                    <span class="badge-promo" style="font-size: 9px; padding: 1px 6px; background: #10b981; color: #fff;">
                      ✨ AI LIVE
                    </span>
                  </div>
                  <div style="font-size: 11px; color: var(--color-yellow-dark);">Context: Active Rx & ABDM Linked</div>
                </div>
              </div>

              <div style="display: flex; align-items: center; gap: 6px;">
                <!-- Language Selector -->
                <select id="pulsecare-lang-select" style="padding: 2px 6px; font-size: 11px; height: 26px; border-radius: var(--radius-full); border: 1px solid #cbd5e1; background: #fff; cursor: pointer;">
                  ${SUPPORTED_LANGUAGES.map(l => `<option value="${l.code}" ${this.currentLang === l.code ? 'selected' : ''}>${l.flag} ${l.code.toUpperCase()}</option>`).join("")}
                </select>

                <button class="pill-tab" id="btn-close-pulsecare" style="padding: 2px 8px; font-size: 12px; background: #fff;" title="Close Chat">✕</button>
              </div>
            </div>

            <!-- Quick Question Chips (Miro Pill Chips) -->
            <div style="padding: 8px var(--space-md); background: var(--color-surface); border-bottom: 1px solid var(--color-hairline); display: flex; gap: 6px; overflow-x: auto; white-space: nowrap;">
              <button class="btn-chat-chip" data-q="What does 1-0-1 mean for Cefixime?">💊 1-0-1 Meaning?</button>
              <button class="btn-chat-chip" data-q="When should I take Pan 40?">⏰ Pan 40 Timing</button>
              <button class="btn-chat-chip" data-q="Can I take Paracetamol with Cefixime?">🔄 Drug Interactions</button>
              <button class="btn-chat-chip" data-q="Can I get Sleeping Pills without prescription?" style="border-color: #fde68a; color: var(--color-yellow-dark);">🔒 Schedule H Lock</button>
              <button class="btn-chat-chip" data-q="I have sudden severe chest pain!" style="border-color: #fecaca; color: #dc2626;">🚨 Chest Pain (108)</button>
            </div>

            <!-- Messages Stream Area -->
            <div class="pulsecare-messages-scroll" style="flex: 1; padding: var(--space-md); overflow-y: auto; display: flex; flex-direction: column; gap: var(--space-sm); background: #fafbfc;">
              ${this.chatMessages.map(m => `
                <div style="max-width: 88%; padding: 10px 14px; border-radius: 16px; font-size: 13px; line-height: 1.5; ${m.sender === 'user' ? 'align-self: flex-end; background: var(--color-primary); color: #ffffff; border-bottom-right-radius: 4px;' : m.guardrail ? 'align-self: flex-start; background: #fee2e2; border: 1px solid #ef4444; color: #991b1b; border-bottom-left-radius: 4px;' : 'align-self: flex-start; background: #ffffff; border: 1px solid var(--color-hairline); color: var(--color-primary); border-bottom-left-radius: 4px; box-shadow: var(--shadow-sm);'}">
                  <div>${this.formatMarkdown(m.text)}</div>
                  
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 6px; gap: 8px;">
                    ${m.sender === 'ai' && !m.guardrail ? `
                      <button class="btn-pulsecare-speak" data-text="${encodeURIComponent(m.text)}" style="padding: 2px 8px; font-size: 11px; font-weight: 600; border-radius: var(--radius-full); background: var(--color-surface-pricing-featured); border: 1px solid #ddd6fe; color: var(--color-brand-blue); cursor: pointer; display: inline-flex; align-items: center; gap: 4px;">
                        <span>🔊 Listen</span>
                      </button>
                    ` : '<div></div>'}

                    ${m.model ? `
                      <span style="font-size: 10px; color: var(--color-stone); font-family: var(--font-family-mono);">
                        ${m.model}
                      </span>
                    ` : ''}
                  </div>
                </div>
              `).join("")}

              <!-- Thinking Indicator -->
              ${this.isThinking ? `
                <div style="align-self: flex-start; background: #ffffff; border: 1px solid #cbd5e1; padding: 10px 14px; border-radius: 16px; border-bottom-left-radius: 4px; display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--color-slate);">
                  <div style="animation: spin 1s infinite linear; font-size: 14px;">⚡</div>
                  <span>PulseCare AI is thinking...</span>
                </div>
              ` : ''}
            </div>

            <!-- Input Bar & Prompt Area -->
            <div style="padding: 12px 16px; background: #ffffff; border-top: 1px solid var(--color-hairline); display: flex; gap: 8px; align-items: center;">
              <input 
                type="text" 
                id="pulsecare-input" 
                placeholder="Ask about medicines, timings, doses..." 
                style="flex: 1; padding: 10px 14px; font-size: 13px; border-radius: var(--radius-full); border: 1px solid var(--color-hairline-strong); background: var(--color-surface); outline: none; transition: border-color 0.2s;"
                ${this.isThinking ? 'disabled' : ''}
              />
              <button 
                id="btn-pulsecare-send" 
                class="button-primary" 
                style="width: 38px; height: 38px; padding: 0; border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; font-size: 16px;"
                ${this.isThinking ? 'disabled' : ''}
                title="Send Message"
              >
                ➔
              </button>
            </div>

          </div>
        ` : ''}

        <!-- Persistent Floating Launcher Bubble -->
        <button 
          id="btn-pulsecare-toggle" 
          class="button-primary" 
          style="width: 58px; height: 58px; border-radius: var(--radius-full); box-shadow: var(--shadow-elevated); padding: 0; display: flex; align-items: center; justify-content: center; font-size: 26px; border: 2px solid var(--color-brand-yellow); cursor: pointer; transition: transform 0.2s ease;"
          title="Open PulseCare AI Clinical Assistant"
        >
          ${this.isOpen ? '✕' : '⚡'}
        </button>

      </div>
    `;

    this.bindEvents();
  }

  formatMarkdown(text) {
    if (!text) return "";
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/`([^`]+)`/g, "<code style='background: #f1f5f9; padding: 1px 4px; border-radius: 4px; font-family: monospace;'>$1</code>")
      .replace(/\n\n/g, "<br/><br/>")
      .replace(/\n/g, "<br/>");
  }

  bindEvents() {
    const toggleBtn = this.container.querySelector("#btn-pulsecare-toggle");
    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => {
        this.isOpen = !this.isOpen;
        this.render();
      });
    }

    const closeBtn = this.container.querySelector("#btn-close-pulsecare");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        this.isOpen = false;
        this.render();
      });
    }

    const langSelect = this.container.querySelector("#pulsecare-lang-select");
    if (langSelect) {
      langSelect.addEventListener("change", (e) => {
        this.currentLang = e.target.value;
      });
    }

    this.container.querySelectorAll(".btn-chat-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        const q = chip.getAttribute("data-q");
        this.sendMessage(q);
      });
    });

    const sendBtn = this.container.querySelector("#btn-pulsecare-send");
    const input = this.container.querySelector("#pulsecare-input");
    if (sendBtn && input) {
      sendBtn.addEventListener("click", () => {
        this.sendMessage(input.value);
      });
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") this.sendMessage(input.value);
      });
    }

    this.container.querySelectorAll(".btn-pulsecare-speak").forEach(btn => {
      btn.addEventListener("click", () => {
        const text = decodeURIComponent(btn.getAttribute("data-text"));
        AiAssistantService.speak(text);
      });
    });
  }

  async sendMessage(text) {
    if (!text || !text.trim() || this.isThinking) return;
    const query = text.trim();
    
    this.chatMessages.push({ sender: "user", text: query });
    this.isThinking = true;
    this.render();

    setTimeout(() => {
      const scrollArea = this.container.querySelector(".pulsecare-messages-scroll");
      if (scrollArea) scrollArea.scrollTop = scrollArea.scrollHeight;
    }, 50);

    try {
      const res = await AiAssistantService.generateResponse(query, this.currentLang, this.chatMessages);
      this.isThinking = false;
      this.chatMessages.push({
        sender: "ai",
        text: res.text,
        guardrail: res.guardrail,
        model: res.model
      });
      this.render();

      setTimeout(() => {
        const scrollArea = this.container.querySelector(".pulsecare-messages-scroll");
        if (scrollArea) scrollArea.scrollTop = scrollArea.scrollHeight;
      }, 50);

      if (res.guardrail_data?.action === "CALL_108") {
        store.openModal("emergency_sos");
      }
    } catch (err) {
      this.isThinking = false;
      this.chatMessages.push({
        sender: "ai",
        text: `⚠️ An error occurred: ${err.message}. Operating in clinical safety fallback mode.`,
        model: "Clinical Engine"
      });
      this.render();
    }
  }

  destroy() {
    if (this.unsubscribe) this.unsubscribe();
  }
}

export const PulseCareFloatingChatComponent = PulseCareFloatingChat;
export default PulseCareFloatingChat;
