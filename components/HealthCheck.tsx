/* ================================================================
   RUNTIME HEALTH CHECK — Westinghouse Pet Taiwan
   Checks: API, Supabase, Environment, Cart
   Auto-runs on mount in dev mode, manual trigger in production
   ================================================================ */

import { useState, useEffect, useCallback } from "react";
import { env, checkHealth, features } from "@/lib/env";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

interface CheckResult {
  name: string;
  status: "ok" | "warn" | "error";
  message: string;
  latency?: number;
}

/** Ping the health endpoint */
async function checkAPI(): Promise<CheckResult> {
  const start = performance.now();
  try {
    const res = await fetch(`${env.API_BASE}/health`, {
      method: "GET",
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    const latency = Math.round(performance.now() - start);
    if (res.ok) {
      return { name: "API 伺服器", status: "ok", message: `響應正常 (${latency}ms)`, latency };
    }
    return { name: "API 伺服器", status: "warn", message: `HTTP ${res.status}`, latency };
  } catch (err) {
    return {
      name: "API 伺服器",
      status: "error",
      message: err instanceof Error ? err.message : "無法連線",
    };
  }
}

/** Check Supabase connectivity */
async function checkSupabase(): Promise<CheckResult> {
  if (!isSupabaseConfigured()) {
    return { name: "Supabase 資料庫", status: "warn", message: "未配置環境變數" };
  }
  const start = performance.now();
  try {
    const client = getSupabase();
    if (!client) throw new Error("Client is null");
    const { error } = await client.from("products").select("id").limit(1);
    const latency = Math.round(performance.now() - start);
    if (error) throw error;
    return { name: "Supabase 資料庫", status: "ok", message: `連線正常 (${latency}ms)`, latency };
  } catch (err) {
    return {
      name: "Supabase 資料庫",
      status: "error",
      message: err instanceof Error ? err.message : "連線失敗",
    };
  }
}

/** Check environment configuration */
function checkEnv(): CheckResult {
  const h = checkHealth();
  if (h.ok && h.warnings.length === 0) {
    return { name: "環境配置", status: "ok", message: "所有配置正確" };
  }
  if (h.ok) {
    return { name: "環境配置", status: "warn", message: h.warnings.join("; ") };
  }
  return { name: "環境配置", status: "error", message: `缺少: ${h.missing.join(", ")}` };
}

/** Check localStorage/cart */
function checkCart(): CheckResult {
  try {
    const raw = localStorage.getItem("wpet_cart");
    if (!raw) return { name: "購物車儲存", status: "ok", message: "儲存空間正常" };
    const parsed = JSON.parse(raw);
    const count = parsed.items?.length || 0;
    return { name: "購物車儲存", status: "ok", message: `${count} 件商品在購物車` };
  } catch {
    return { name: "購物車儲存", status: "warn", message: "資料損壞，建議清除" };
  }
}

/* ================================================================ */
/*  COMPONENT                                                         */
/* ================================================================ */

export function HealthCheck({ compact = false }: { compact?: boolean }) {
  const [results, setResults] = useState<CheckResult[]>([]);
  const [running, setRunning] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const runChecks = useCallback(async () => {
    setRunning(true);
    const envCheck = checkEnv();
    const cartCheck = checkCart();

    const [apiCheck, supaCheck] = await Promise.all([
      features.api ? checkAPI() : Promise.resolve({ name: "API 伺服器", status: "warn" as const, message: "未啟用" }),
      features.supabase ? checkSupabase() : Promise.resolve({ name: "Supabase 資料庫", status: "warn" as const, message: "未啟用" }),
    ]);

    setResults([envCheck, apiCheck, supaCheck, cartCheck]);
    setRunning(false);
  }, []);

  // Auto-run once in development
  useEffect(() => {
    if (features.dev) {
      runChecks();
    }
  }, [runChecks]);

  const statusCount = {
    ok: results.filter((r) => r.status === "ok").length,
    warn: results.filter((r) => r.status === "warn").length,
    error: results.filter((r) => r.status === "error").length,
  };

  const overall = statusCount.error > 0 ? "error" : statusCount.warn > 0 ? "warn" : "ok";

  const statusDot = {
    ok: "bg-emerald-500",
    warn: "bg-amber-500",
    error: "bg-red-500",
  };

  if (compact) {
    return (
      <button
        onClick={() => setExpanded(!expanded)}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-xs shadow-lg backdrop-blur-sm border border-slate-200 hover:shadow-xl transition-shadow"
        title="點擊查看系統狀態"
      >
        <span className={`h-2.5 w-2.5 rounded-full ${statusDot[overall]} ${running ? "animate-pulse" : ""}`} />
        <span className="text-slate-600 font-medium">
          {running ? "檢查中..." : overall === "ok" ? "系統正常" : overall === "warn" ? "部分異常" : "需要關注"}
        </span>
        <span className="text-slate-400">{statusCount.ok}/{results.length}</span>
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`h-3 w-3 rounded-full ${statusDot[overall]}`} />
          <h3 className="font-semibold text-sm text-slate-800">系統健康檢查</h3>
        </div>
        <button
          onClick={runChecks}
          disabled={running}
          className="text-xs px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 disabled:opacity-50 transition-colors text-slate-600"
        >
          {running ? "檢查中..." : "重新檢查"}
        </button>
      </div>

      {results.length === 0 ? (
        <p className="text-sm text-slate-400">點擊「重新檢查」開始診斷</p>
      ) : (
        <ul className="space-y-2">
          {results.map((r) => (
            <li key={r.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <StatusIcon status={r.status} />
                <span className="text-slate-700">{r.name}</span>
              </div>
              <span className={`text-xs ${r.status === "ok" ? "text-emerald-600" : r.status === "warn" ? "text-amber-600" : "text-red-600"}`}>
                {r.message}
              </span>
            </li>
          ))}
        </ul>
      )}

      {expanded && (
        <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-400">
          <p>API Base: {env.API_BASE}</p>
          <p>GA: {features.analytics ? "已啟用" : "未啟用"}</p>
          <p>R2 Images: {features.r2Images ? "已啟用" : "未啟用"}</p>
          <p>Supabase: {features.supabase ? "已啟用" : "未啟用"}</p>
        </div>
      )}
    </div>
  );
}

function StatusIcon({ status }: { status: CheckResult["status"] }) {
  const cls = "h-4 w-4";
  if (status === "ok") return <svg className={`${cls} text-emerald-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>;
  if (status === "warn") return <svg className={`${cls} text-amber-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>;
  return <svg className={`${cls} text-red-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;
}

export default HealthCheck;
