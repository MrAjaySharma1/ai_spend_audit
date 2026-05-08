/**
 * Supabase client helpers.
 * Uses lazy initialization — never creates clients at module load time.
 * This ensures the app works without Supabase credentials configured.
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

function isValidUrl(url: string | undefined): boolean {
  if (!url) return false;
  try {
    new URL(url);
    return url.startsWith("https://");
  } catch {
    return false;
  }
}

export function createServerClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!isValidUrl(url) || !key || key.length < 20) return null;
  try {
    return createClient(url!, key);
  } catch {
    return null;
  }
}

export function createBrowserClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!isValidUrl(url) || !key || key.length < 20) return null;
  try {
    return createClient(url!, key);
  } catch {
    return null;
  }
}
