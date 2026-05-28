/* ================================================================
   ENVIRONMENT CONFIGURATION — Westinghouse Pet Taiwan
   Production-safe env loader with validation & diagnostics
   ================================================================ */

interface EnvConfig {
  /** Supabase project URL */
  SUPABASE_URL: string;
  /** Supabase anonymous/public key */
  SUPABASE_ANON_KEY: string;
  /** R2/S3 public bucket URL for image assets */
  R2_PUBLIC_URL: string;
  /** Backend API base path */
  API_BASE: string;
  /** Google Analytics 4 Measurement ID */
  GA_ID: string;
  /** Current environment */
  MODE: "development" | "production" | "test";
  /** Is development build */
  DEV: boolean;
  /** Is production build */
  PROD: boolean;
}

/* ---------------------------------------------------------------- */
/*  RAW ENVIRONMENT ACCESS — Safe for Vite builds                   */
/* ---------------------------------------------------------------- */

function getRawEnv(key: string): string | undefined {
  try {
    if (typeof import.meta !== "undefined" && import.meta.env) {
      return import.meta.env[key] as string | undefined;
    }
  } catch {
    /* module access failed */
  }
  return undefined;
}

/* ---------------------------------------------------------------- */
/*  CONFIGURATION EXTRACTION                                          */
/* ---------------------------------------------------------------- */

const SUPABASE_URL = getRawEnv("VITE_SUPABASE_URL") ?? "";
const SUPABASE_ANON_KEY = getRawEnv("VITE_SUPABASE_ANON_KEY") ?? "";
const R2_PUBLIC_URL = getRawEnv("VITE_R2_PUBLIC_URL") ?? "";
const API_BASE = getRawEnv("VITE_API_BASE") ?? "/api";
const GA_ID = getRawEnv("VITE_GA_ID") ?? "";

const MODE = (getRawEnv("MODE") as EnvConfig["MODE"]) || "production";
const DEV = MODE === "development";
const PROD = MODE === "production";

/* ---------------------------------------------------------------- */
/*  EXPORTED CONFIG                                                   */
/* ---------------------------------------------------------------- */

export const env: Readonly<EnvConfig> = Object.freeze({
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  R2_PUBLIC_URL,
  API_BASE,
  GA_ID,
  MODE,
  DEV,
  PROD,
});

/* ---------------------------------------------------------------- */
/*  VALIDATION & DIAGNOSTICS                                          */
/* ---------------------------------------------------------------- */

export interface HealthStatus {
  ok: boolean;
  checks: {
    supabase: boolean;
    api: boolean;
    analytics: boolean;
    r2: boolean;
  };
  missing: string[];
  warnings: string[];
}

/** Run a configuration health check */
export function checkHealth(): HealthStatus {
  const checks = {
    supabase: !!(SUPABASE_URL && SUPABASE_ANON_KEY),
    api: !!API_BASE,
    analytics: !!GA_ID,
    r2: !!R2_PUBLIC_URL,
  };
  const missing: string[] = [];
  const warnings: string[] = [];

  if (!SUPABASE_URL) missing.push("VITE_SUPABASE_URL");
  if (!SUPABASE_ANON_KEY) missing.push("VITE_SUPABASE_ANON_KEY");
  if (!API_BASE) missing.push("VITE_API_BASE");

  if (!GA_ID) warnings.push("VITE_GA_ID not set — analytics disabled");
  if (!R2_PUBLIC_URL) warnings.push("VITE_R2_PUBLIC_URL not set — using local images");

  const ok = checks.supabase && checks.api;

  return { ok, checks, missing, warnings };
}

/** Log environment diagnostics (dev only) */
export function logDiagnostics(): void {
  if (!DEV) return;
  const h = checkHealth();
  console.group("[Env] Configuration Diagnostics");
  console.log("Mode:", MODE);
  console.log("Health:", h.ok ? "OK" : "DEGRADED");
  console.log("Checks:", h.checks);
  if (h.missing.length) console.warn("Missing:", h.missing);
  if (h.warnings.length) console.warn("Warnings:", h.warnings);
  console.groupEnd();
}

/* ---------------------------------------------------------------- */
/*  FEATURE FLAGS                                                     */
/* ---------------------------------------------------------------- */

export const features = Object.freeze({
  /** Supabase database connectivity */
  supabase: !!(SUPABASE_URL && SUPABASE_ANON_KEY),
  /** Google Analytics tracking */
  analytics: !!GA_ID && !DEV,
  /** R2/S3 image hosting */
  r2Images: !!R2_PUBLIC_URL,
  /** Backend API integration */
  api: !!API_BASE,
  /** Is development environment */
  dev: DEV,
});

/* ================================================================ */
/*  DEFAULT EXPORT                                                    */
/* ================================================================ */

export default env;
