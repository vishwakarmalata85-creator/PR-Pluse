/**
 * NEXORA PULSECARE - CLIENT AI CONFIGURATION
 * All AI interactions are proxied securely through the Express backend (/api/ai/*).
 * API keys are kept safe on the server and are NEVER exposed to the frontend browser.
 */

export const GEMINI_DEFAULT_MODEL = "gemini-3.7-flash";

/**
 * AI Service is active and proxied securely via backend
 */
export function hasGeminiApiKey() {
  return true;
}

export function getGeminiApiKey() {
  return "";
}

export function setGeminiApiKey() {
  return true;
}
