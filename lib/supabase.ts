/* ================================================================
   SUPABASE CLIENT — Westinghouse Pet Taiwan
   Safe fallback when env vars are missing (prevents white screen)
   ================================================================ */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { env } from "./env";

const SUPABASE_URL = env.SUPABASE_URL;
const SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY;

let _client: SupabaseClient | null = null;
let _configured = false;

try {
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    _client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      db: { schema: "public" },
      global: {
        headers: { "x-application-name": "westinghouse-pet-web" },
      },
    });
    _configured = true;
  }
} catch (e) {
  console.warn("[Supabase] Client init failed:", e);
  _client = null;
  _configured = false;
}

export const supabase = _client;

export function getSupabase(): SupabaseClient | null {
  return _client;
}

export function isSupabaseConfigured(): boolean {
  return _configured;
}

export const FALLBACK_IMAGE = "/images/placeholder-product.jpg";

export function buildImageUrl(
  pathOrUrl: string | null | undefined,
  alt: string = ""
): { url: string; alt: string } {
  if (!pathOrUrl) return { url: FALLBACK_IMAGE, alt: alt || "暫無圖片" };

  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return { url: pathOrUrl, alt: alt || "產品圖片" };
  }

  const R2_PUBLIC_URL = env.R2_PUBLIC_URL;
  if (!R2_PUBLIC_URL) return { url: FALLBACK_IMAGE, alt: alt || "暫無圖片" };

  const cleanPath = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return { url: `${R2_PUBLIC_URL}${cleanPath}`, alt: alt || "產品圖片" };
}
