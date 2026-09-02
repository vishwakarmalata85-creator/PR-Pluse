/**
 * NEXORA PULSECARE - SUPABASE CLIENT CONNECTION
 * Configures the Supabase client for database, authentication, and storage operations.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ============================================================================
// 1. PASTE YOUR SUPABASE PROJECT URL AND PUBLIC ANON KEY HERE:
// ============================================================================
export const SUPABASE_URL = "https://bhuuybpsiaseinqyhdqf.supabase.co";
export const SUPABASE_PUBLIC_KEY = "sb_publishable_cYMdVrhrRRgXe5XFtb8vKg_451dy-qT";

// ============================================================================
// 2. SUPABASE CLIENT EXPORT (Safe initialization for browser ESM)
// ============================================================================
let client;
try {
  client = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);
} catch (err) {
  console.warn("Supabase client initialized in fallback mode:", err);
  client = {
    auth: {
      signInWithPassword: async () => ({ error: { message: "Supabase key required." } }),
      signUp: async () => ({ error: { message: "Supabase key required." } }),
      signOut: async () => ({ error: null }),
      getUser: async () => ({ data: { user: null }, error: null })
    }
  };
}

export const supabase = client;
export default supabase;
