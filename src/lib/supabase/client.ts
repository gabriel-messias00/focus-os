import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { getSupabasePublicConfig } from "@/lib/supabase/config";

let browserClient: SupabaseClient<Database> | null = null;

export function isSupabaseConfigured(): boolean {
  return getSupabasePublicConfig() !== null;
}

export function createClient(): SupabaseClient<Database> | null {
  const config = getSupabasePublicConfig();
  if (!config) return null;
  if (!browserClient) {
    browserClient = createBrowserClient<Database>(config.url, config.key);
  }
  return browserClient;
}
