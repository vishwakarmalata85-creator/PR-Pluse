/**
 * NEXORA PULSECARE - PERSISTENT FLOATING AI COMPANION (Miro Design Patterns)
 * Connected to Google Gemini 2.5/1.5 Flash API with live key configuration & audio TTS
 */

import { store } from "../state/store.js";
import { AiAssistantService, SUPPORTED_LANGUAGES } from "../services/aiAssistantService.js";
import { getGeminiApiKey, setGeminiApiKey, hasGeminiApiKey } from "../geminiConfig.js";

export class PulseCareFloatingChatComponent {
  constructor(container) {
    this.container = container;
    this.isOpen = false;
    this.showKeyModal = false;
    this.isThinking = false;
    this.currentLang = "en";
    this.chatMessages = [
      {
        sender: "ai",
        text: "Hello Anil! I am your **PulseCare AI Health Companion** powered by Google Gemini. You can ask me what Latin abbreviations like `1-0-1` mean, when to take medicines, or check dietary precautions.",
        model: hasGeminiApiKey() ? "Google Gemini Live" : "Clinical Engine"
      }
    ];

    this.unsubscribe = store.subscribe(() => {
      if (this.isOpen) this.render();
    });

    window.addEventListener("geminiApiKeyChanged", () => {
      if (this.isOpen) this.render();
    });
  }

  render() {
    const hasKey = hasGeminiApiKey();

    this.container.innerHTML = `
      <div class="pulsecare-floating-root" style="position: fixed; bottom: var(--space-xl); right: var(--space-xl); z-index: 220;">
        
        <!-- Expanded Chat Drawer / Card (Miro Design: White surface with 24px rounded corners & shadow) -->
        ${this.isOpen ? `
          <div class="card-base" style="width: 410px; height: 570px; display: flex; flex-direction: column; padding: 0; box-shadow: var(--shadow-elevated); border: 1px solid var(--color-hairline); border-radius: var(--radius-xxl); margin-bottom: var(--space-md); background: #ffffff; overflow: hidden; animation: scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);">
            
            <!-- Chat Header (Pastel Yellow Tint) -->
            <div style="padding: 12px 18px; background: var(--color-surface-yellow); border-bottom: 1px solid #fde68a; display: flex; align-items: center; justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: var(--space-xs);">
                <div class="logo-square" style="width: 28px; height: 28px; font-size: 14px; background: var(--color-primary); color: #fff;">
                  ⚡
                </div>
                <div>
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <div style="font-weight: 800; font-size: 15px; color: var(--color-primary);">PulseCare AI</div>
                    <span class="badge-promo" style="font-size: 9px; padding: 1px 6px; background: ${hasKey ? '#10b981' : '#f59e0b'}; color: #fff;">
                      ${hasKey ? '✨ GEMINI LIVE' : '⚡ CLINICAL MODE'}
                    </span>
                  </div>
                  <div style="font-size: 11px; color: var(--color-yellow-dark);">Context: Active Rx & ABDM Linked</div>
                </div>
              </div>

              <div style="display: flex; align-items: center; gap: 6px;">
                <!-- Key Config Button -->
                <button class="pill-tab" id="btn-toggle-key-settings" style="padding: 3px 8px; font-size: 11px; background: #fff; border-color: ${hasKey ? '#10b981' : '#cbd5e1'};" title="Configure Google Gemini API Key">
                  🔑 ${hasKey ? 'Key Active' : 'Set Key'}
                </button>

                <!-- Language Selector -->
                <select id="pulsecare-lang-select" style="padding: 2px 6px; font-size: 11px; height: 26px; border-radius: var(--radius-full); border: 1px solid #cbd5e1; background: #fff; cursor: pointer;">
                  ${SUPPORTED_LANGUAGES.map(l => `<option value="${l.code}" ${this.currentLang === l.code ? 'selected' : ''}>${l.flag} ${l.code.toUpperCase()}</option>`).join("")}
                </select>

                <button class="pill-tab" id="btn-close-pulsecare" style="padding: 2px 8px; font-size: 12px; background: #fff;">✕</button>
              </div>
            </div>

            <!-- Gemini Key Settings Dropdown / Panel -->
            ${this.showKeyModal ? `
              <div style="padding: 12px 16px; background: #eff6ff; border-bottom: 1px solid #bfdbfe; font-size: 12px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                  <span style="font-weight: 700; color: #1e3a8a;">🔑 Google Gemini API Key Configuration</span>
                  <button id="btn-close-key-settings" style="background: none; border: none; font-size: 13px; cursor: pointer; color: #64748b;">✕</button>
                </div>
                <div style="display: flex; gap: 6px; margin-top: 6px;">
                  <input type="password" id="input-gemini-key" placeholder="AIzaSy..." value="${getGeminiApiKey()}" style="flex: 1; padding: 6px 10px; font-size: 11px; border-radius: var(--radius-md); border: 1px solid #93c5fd; background: #fff;" />
                  <button class="button-primary" id="btn-save-gemini-key" style="padding: 6px 12px; font-size: 11px;">
                    Save
                  </button>
                </div>
                <div style="font-size: 10px; color: #3b82f6; margin-top: 4px;">
                  Key is saved securely in your browser's local storage or in <code>src/geminiConfig.js</code>.
                </div>
              </div>
            ` : ''}

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
                  <span>PulseCare AI is thinking with Gemini...</span>
                </div>
              ` : ''}
            </div>

            <!-- Input Bar -->
            <div style="padding: 10px var(--space-md); background: #ffffff; border-top: 1px solid var(--color-hairline); display: flex; gap: var(--space-xs); align-items: center;">
              <input type="text" id="pulsecare-input" placeholder="Ask about medicines, timings, doses..." ${this.isThinking ? 'disabled' : ''} style="flex: 1; font-size: 13px; padding: 10px 14px; border-radius: var(--radius-full); border: 1px solid var(--color-hairline-strong);" />
              <button class="button-primary" id="btn-pulsecare-send" ${this.isThinking ? 'disabled' : ''} style="padding: 10px 18px; font-size: 13px;">
                <span>➔</span>
              </button>
            </div>

          </div>
        ` : ''}

        <!-- Floating Yellow/Black Trigger Button -->
        <button class="pulsecare-floating-btn" id="btn-toggle-pulsecare" style="width: 58px; height: 58px; border-radius: 50%; background: var(--color-brand-yellow); color: var(--color-primary); display: flex; align-items: center; justify-content: center; font-size: 24px; box-shadow: var(--shadow-elevated); cursor: pointer; border: 2px solid #ffffff; transition: transform var(--transition-fast);" title="Open PulseCare AI Companion">
          ${this.isOpen ? '✕' : '🤖'}
          ${!this.isOpen ? `<div style="position: absolute; top: 4px; right: 4px; width: 12px; height: 12px; border-radius: 50%; background: ${hasKey ? '#10b981' : '#f59e0b'}; border: 2px solid #fff;"></div>` : ''}
        </button>

      </div>
    `;

    this.bindEvents();
  }

  formatMarkdown(text) {
    if (!text) return "";
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/`([^`]+)`/g, "<code style='background: rgba(0,0,0,0.06); padding: 1px 4px; border-radius: 4px; font-family: var(--font-family-mono); font-size: 12px;'>$1</code>")
      .replace(/\n/g, "<br/>");
  }

  bindEvents() {
    const toggleBtn = this.container.querySelector("#btn-toggle-pulsecare");
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

    const keyToggleBtn = this.container.querySelector("#btn-toggle-key-settings");
    if (keyToggleBtn) {
      keyToggleBtn.addEventListener("click", () => {
        this.showKeyModal = !this.showKeyModal;
        this.render();
      });
    }

    const closeKeyBtn = this.container.querySelector("#btn-close-key-settings");
    if (closeKeyBtn) {
      closeKeyBtn.addEventListener("click", () => {
        this.showKeyModal = false;
        this.render();
      });
    }

    const saveKeyBtn = this.container.querySelector("#btn-save-gemini-key");
    const inputKey = this.container.querySelector("#input-gemini-key");
    if (saveKeyBtn && inputKey) {
      saveKeyBtn.addEventListener("click", () => {
        const val = inputKey.value.trim();
        setGeminiApiKey(val);
        this.showKeyModal = false;
        this.chatMessages.push({
          sender: "ai",
          text: val.length > 5 ? "✅ **Google Gemini API Key successfully saved!** PulseCare AI is now connected to live Gemini models." : "ℹ️ Gemini API key cleared. Operating in offline clinical engine mode.",
          model: val.length > 5 ? "Google Gemini Flash (Live)" : "Clinical Engine"
        });
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
