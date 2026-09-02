/**
 * NEXORA PULSECARE - GOOGLE GEMINI API CONFIGURATION & CLIENT
 * Configures the Google Gemini API key for PulseCare AI Chatbot and Gemini Vision OCR.
 */

const STORAGE_KEY_GEMINI = "pulsecare_gemini_api_key";

// ============================================================================
// 1. PASTE YOUR GOOGLE GEMINI API KEY HERE (OR ENTER IT VIA THE CHAT UI):
// ============================================================================
export const GEMINI_API_KEY = "";

// Supported models with prioritized fallback
export const GEMINI_DEFAULT_MODEL = "gemini-2.5-flash"; // or "gemini-1.5-flash"

/**
 * Retrieves the active Gemini API Key (checks localStorage first, then constant)
 */
export function getGeminiApiKey() {
  try {
    const storedKey = localStorage.getItem(STORAGE_KEY_GEMINI);
    if (storedKey && storedKey.trim().length > 0) {
      return storedKey.trim();
    }
  } catch (e) {
    console.warn("Could not read Gemini API key from localStorage:", e);
  }
  return GEMINI_API_KEY.trim();
}

/**
 * Saves a new Gemini API Key to localStorage
 */
export function setGeminiApiKey(key) {
  try {
    if (key && key.trim()) {
      localStorage.setItem(STORAGE_KEY_GEMINI, key.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY_GEMINI);
    }
    window.dispatchEvent(new CustomEvent("geminiApiKeyChanged", { detail: { key } }));
    return true;
  } catch (e) {
    console.error("Failed to save Gemini API key:", e);
    return false;
  }
}

/**
 * Checks if a Gemini API key is configured
 */
export function hasGeminiApiKey() {
  const key = getGeminiApiKey();
  return typeof key === "string" && key.length > 10;
}
