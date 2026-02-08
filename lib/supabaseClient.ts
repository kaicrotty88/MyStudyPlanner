import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Singleton Supabase browser client authenticated via Clerk session token.
 */
let client: SupabaseClient | null = null;

export function getSupabaseClient(getAccessToken: () => Promise<string | null>): SupabaseClient {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  client = createClient(url, anonKey, { accessToken: getAccessToken });
  return client;
}
