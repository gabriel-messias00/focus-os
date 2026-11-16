export function getSupabasePublicConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ?? "";
  if (!url || !key) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.hostname !== "localhost" && parsed.hostname !== "127.0.0.1") return null;
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
    return { url: parsed.origin, key };
  } catch {
    return null;
  }
}

export function isSupabasePublicConfigValid(): boolean {
  return getSupabasePublicConfig() !== null;
}
