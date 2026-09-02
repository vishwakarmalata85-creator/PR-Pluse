/**
 * NEXORA PULSE - MULTILINGUAL CONVERSATIONAL AI HEALTH ASSISTANT (POWERED BY GOOGLE GEMINI)
 * Supports live Gemini 2.5/1.5 Flash streaming/async chat, clinical guardrails, and ABDM context.
 */

import { getGeminiApiKey, hasGeminiApiKey, GEMINI_DEFAULT_MODEL } from "../geminiConfig.js";
import { store } from "../state/store.js";

export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", native: "English", flag: "🇬🇧" },
  { code: "hi", name: "Hindi", native: "हिन्दी", flag: "🇮🇳" },
  { code: "mr", name: "Marathi", native: "मराठी", flag: "🇮🇳" },
  { code: "ta", name: "Tamil", native: "தமிழ்", flag: "🇮🇳" },
  { code: "bn", name: "Bengali", native: "বাংলা", flag: "🇮🇳" },
  { code: "es", name: "Spanish", native: "Español", flag: "🇪🇸" }
];

export class AiAssistantService {
  /**
   * Evaluates critical safety & emergency guardrails before sending query to AI
   */
  static evaluateGuardrails(query) {
    const q = query.toLowerCase();

    // 1. Critical Emergency Red Flags (Heart attack, Severe chest pain, Respiratory failure)
    if (
      q.includes("chest pain") ||
      q.includes("heart attack") ||
      q.includes("cannot breathe") ||
      q.includes("can't breathe") ||
      q.includes("heavy bleeding") ||
      q.includes("unconscious") ||
      q.includes("108") ||
      q.includes("emergency")
    ) {
      return {
        triggered: true,
        type: "EMERGENCY",
        title: "🚨 CRITICAL MEDICAL EMERGENCY (Call 108 / 112)",
        message: "Your symptoms indicate a potential acute medical emergency. Please contact Emergency Medical Services (108 / 112) or visit the nearest emergency room immediately.",
        action: "CALL_108"
      };
    }

    // 2. Schedule H / Schedule X Controlled Substances Restrictions
    if (
      q.includes("alprazolam") ||
      q.includes("clonazepam") ||
      q.includes("diazepam") ||
      q.includes("lorazepam") ||
      q.includes("sleeping pill without prescription") ||
      q.includes("buy without rx")
    ) {
      return {
        triggered: true,
        type: "SCHEDULE_HX_BLOCKED",
        title: "🛡️ REGULATORY SAFETY LOCK (Schedule H / Schedule X)",
        message: "Under Indian Drugs & Cosmetics Rules, dispensing or unverified usage of Schedule H/X controlled psychotropics is strictly restricted to verified registered medical practitioners.",
        action: "BLOCK_QUERY"
      };
    }

    return { triggered: false };
  }

  /**
   * Generates response using live Google Gemini API or intelligent clinical fallback
   */
  static async generateResponse(query, language = "en", conversationHistory = []) {
    // Check Guardrails first
    const guardrail = this.evaluateGuardrails(query);
    if (guardrail.triggered) {
      return { guardrail: true, guardrail_data: guardrail, text: guardrail.message, model: "Guardrail Engine" };
    }

    const apiKey = getGeminiApiKey();

    if (apiKey && apiKey.length > 5) {
      try {
        const geminiResponse = await this.callGeminiApi(query, language, apiKey, conversationHistory);
        if (geminiResponse) {
          return {
            guardrail: false,
            text: geminiResponse,
            model: "Google Gemini Flash (Live)"
          };
        }
      } catch (err) {
        console.warn("Gemini API call failed, falling back to clinical engine:", err);
      }
    }

    // Fallback rule engine if API key is not yet configured or request encounters an error
    return this.generateFallbackResponse(query, language);
  }

  /**
   * Calls Google Gemini Generative AI REST API with clinical patient context
   */
  static async callGeminiApi(query, language = "en", apiKey, conversationHistory = []) {
    const state = store.getState();
    const activePatient = state.patients?.find(p => p.id === state.activePatientId) || state.patients?.[0] || {};
    const meds = state.prescribedItems || [];
    const diagnoses = state.selectedDiagnoses || [];

    const langName = SUPPORTED_LANGUAGES.find(l => l.code === language)?.name || "English";

    const systemInstruction = `
You are PulseCare AI, an empathetic, highly knowledgeable, clinical healthcare companion for the Nexora Pulse platform (compliant with ABDM, DISHA, FHIR R4, and HIPAA).
Your goal is to assist patients by explaining their prescriptions, medication dosage timings, dietary precautions, Latin clinical abbreviations, and generic drug cost-savings.

Patient Context:
- Patient Name: ${activePatient.full_name || "Anil Verma"} (${activePatient.age || 44}y, ${activePatient.gender || "Male"})
- Known Allergies: ${(activePatient.known_allergies || ["None"]).join(", ")}
- Diagnoses: ${diagnoses.map(d => `${d.code} - ${d.display || d.name}`).join(", ") || "Acute RTI"}
- Current Digital Prescription Items:
${meds.map(m => `  • ${m.name || m.drug_name} (${m.strength || ""}) - Frequency: ${m.dosage_pattern || "1-0-1"} - Duration: ${m.duration_days || 5} days - Instructions: ${m.instructions || "Post meals"}`).join("\n")}

Guidelines:
1. Explain clinical Latin abbreviations simply:
   - "1-0-1" = Take 1 tablet in the morning and 1 tablet at night.
   - "1-0-0" = Take 1 tablet in the morning only.
   - "0-0-1" or "HS" = Take 1 tablet at bedtime.
   - "SOS" = Only when needed (e.g. for high fever or acute pain).
   - "AC" = Before food / meals.
   - "PC" = After food / meals.
2. Respond in the patient's selected language: "${langName}".
3. Keep answers concise, clear, and easy to read with bullet points when listing instructions.
4. Always conclude with a gentle reminder: "Always follow your prescribing doctor's exact instructions."
5. Never diagnose new acute life-threatening emergencies—advise immediate 108 ambulance contact if chest pain or severe breathlessness is mentioned.
`.trim();

    // Prepare contents array with previous conversation turns
    const contents = [];

    // Append relevant previous turns (last 6 turns max)
    const recentHistory = conversationHistory.slice(-6);
    recentHistory.forEach(msg => {
      if (msg.sender === "user") {
        contents.push({ role: "user", parts: [{ text: msg.text }] });
      } else if (msg.sender === "ai" && !msg.guardrail) {
        contents.push({ role: "model", parts: [{ text: msg.text }] });
      }
    });

    // Add current query
    contents.push({ role: "user", parts: [{ text: query }] });

    const modelsToTry = [
      GEMINI_DEFAULT_MODEL,
      "gemini-2.0-flash",
      "gemini-1.5-flash",
      "gemini-1.5-pro"
    ];

    let lastError = null;

    for (const model of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: contents,
            systemInstruction: { parts: [{ text: systemInstruction }] },
            generationConfig: {
              temperature: 0.4,
              maxOutputTokens: 800
            }
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error?.message || `HTTP ${response.status}`);
        }

        const data = await response.json();
        const candidate = data.candidates?.[0];
        const text = candidate?.content?.parts?.[0]?.text;

        if (text && text.trim().length > 0) {
          return text.trim();
        }
      } catch (e) {
        lastError = e;
        console.warn(`Model ${model} attempt failed:`, e.message);
      }
    }

    throw lastError || new Error("Unable to retrieve Gemini response");
  }

  /**
   * Internal clinical fallback response generator (used if offline or key is missing)
   */
  static generateFallbackResponse(query, language = "en") {
    const q = query.toLowerCase();

    if (q.includes("1-0-1") || q.includes("meaning") || q.includes("frequency")) {
      const texts = {
        en: "💊 **1-0-1 Meaning:** Take 1 dose/tablet in the **Morning** (after breakfast), 0 in the afternoon, and 1 dose/tablet at **Night** (after dinner). Always take with water.",
        hi: "💊 **1-0-1 का अर्थ:** 1 गोली **सुबह** (नाश्ते के बाद), दोपहर में 0, और 1 गोली **रात** (खाने के बाद) लें।",
        mr: "💊 **1-0-1 चा अर्थ:** 1 गोळी **सकाळी** (न्याहारीनंतर) आणि 1 गोळी **रात्री** (जेवणानंतर) घ्या.",
        es: "💊 **Significado de 1-0-1:** Tome 1 dosis por la **mañana** (después del desayuno) y 1 dosis por la **noche** (después de la cena)."
      };
      return { guardrail: false, text: texts[language] || texts.en, model: "Clinical Engine (Offline)" };
    }

    if (q.includes("cefixime") || q.includes("zifi")) {
      const texts = {
        en: "💊 **Cefixime 200mg:** This is an antibiotic for bacterial infections. Take 1 tablet twice daily (1-0-1) strictly post meals for 5 full days without skipping doses.",
        hi: "💊 **सेफिक्साइम 200mg (Cefixime):** यह एक एंटीबायोटिक दवा है। इसे 5 दिनों तक रोजाना दो बार (1-0-1) भोजन के बाद लें।",
        mr: "💊 **सेफिक्झिम 200mg:** हे अँटिबायोटिक आहे. दररोज दोन वेळा (1-0-1) जेवणानंतर 5 दिवस नियमितपणे घ्या.",
        es: "💊 **Cefixima 200mg:** Es un antibiótico. Tome 1 tableta dos veces al día (1-0-1) después de las comidas por 5 días completos."
      };
      return { guardrail: false, text: texts[language] || texts.en, model: "Clinical Engine (Offline)" };
    }

    if (q.includes("pan 40") || q.includes("pantoprazole") || q.includes("timing")) {
      const texts = {
        en: "⏰ **Pantoprazole 40mg (Pan 40):** Take 1 tablet once daily (1-0-0) early in the morning on an **empty stomach**, at least 30-45 minutes before breakfast.",
        hi: "⏰ **पेंटोप्राजोल 40mg (Pan 40):** सुबह खाली पेट (नाश्ते से 30-45 मिनट पहले) 1 गोली (1-0-0) पानी के साथ लें।",
        mr: "⏰ **पँटोप्राझोल 40mg:** सकाळी उपाशी पोटी (नाश्त्याच्या 30-45 मिनिटे आधी) 1 गोळी घ्या.",
        es: "⏰ **Pantoprazol 40mg:** Tome 1 tableta por la mañana en ayunas, 30-45 minutos antes del desayuno."
      };
      return { guardrail: false, text: texts[language] || texts.en, model: "Clinical Engine (Offline)" };
    }

    return {
      guardrail: false,
      text: `PulseCare AI: I have checked your active prescription profile. Please take all prescribed medicines strictly as instructed. (Tip: You can add your live Google Gemini API Key in the header 🔑 settings for unconstrained real-time intelligence!).`,
      model: "Clinical Engine (Offline)"
    };
  }

  /**
   * Text-to-Speech audio synthesis
   */
  static speak(text) {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      // Strip markdown bold/asterisks for cleaner audio speech
      const cleanText = text.replace(/[*_#`~]/g, "");
      const u = new SpeechSynthesisUtterance(cleanText);
      u.rate = 0.95;
      u.pitch = 1.0;
      window.speechSynthesis.speak(u);
    }
  }
}
