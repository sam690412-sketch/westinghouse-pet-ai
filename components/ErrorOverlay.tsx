/* ================================================================
   PRODUCTION ERROR OVERLAY — Westinghouse Pet Taiwan
   Lightweight runtime diagnostics panel
   Only visible when ?debug=1 is in URL (dev mode always on)
   ================================================================ */

import { useState, useEffect } from "react";
import { env, features, checkHealth } from "@/lib/env";
import { isSupabaseConfigured } from "@/lib/supabase";

type ErrorCategory = "api" | "supabase" | "payment" | "analytics" | "cart";

interface ErrorEntry {
  id: string;
  category: ErrorCategory;
  message: string;
  timestamp: string;
  details?: string;
}

/** Global error store */
const errorLog: ErrorEntry[] = [];
let listener: (() => void) | null = null;

function addError(entry: ErrorEntry) {
  errorLog.unshift(entry);
  if (errorLog.length > 50) errorLog.pop();
  listener?.();
}

function subscribe(cb: () => void) {
  listener = cb;
  return () => { listener = null; };
}

/* ================================================================ */
/*  PUBLIC API — Use these to report errors from anywhere             */
/* ================================================================ */

export function reportAPIError(message: string, details?: string) {
  addError({ id: crypto.randomUUID(), category: "api", message, timestamp: new Date().toISOString(), details });
}

export function reportSupabaseError(message: string, details?: string) {
  addError({ id: crypto.randomUUID(), category: "supabase", message, timestamp: new Date().toISOString(), details });
}

export function reportPaymentError(message: string, details?: string) {
  addError({ id: crypto.randomUUID(), category: "payment", message, timestamp: new Date().toISOString(), details });
}

export function reportAnalyticsError(message: string, details?: string) {
  addError({ id: crypto.randomUUID(), category: "analytics", message, timestamp: new Date().toISOString(), details });
}

/** Listen for global fetch errors */
export function initErrorMonitoring() {
  const origFetch = window.fetch;
  window.fetch = async function monitoredFetch(input: RequestInfo | URL, init?: RequestInit) {
    try {
      const res = await origFetch.call(window, input, init);
      if (!res.ok && res.status >= 500) {
        const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
        reportAPIError(`HTTP ${res.status}`, url);
      }
      return res;
    } catch (err) {
      const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      reportAPIError(err instanceof Error ? err.message : "Fetch failed", url);
      throw err;
    }
  };

  // Listen for unhandled errors
  window.addEventListener("error", (e) => {
    const msg = e.message || "Unknown error";
    if (msg.includes("supabase") || msg.includes("Supabase")) {
      reportSupabaseError(msg, e.filename);
    } else if (msg.includes("gtag") || msg.includes("analytics")) {
      reportAnalyticsError(msg, e.filename);
    } else {
      reportAPIError(msg, e.filename);
    }
  });

  // Listen for unhandled rejections
  window.addEventListener("unhandledrejection", (e) => {
    const msg = e.reason instanceof Error ? e.reason.message : String(e.reason);
    if (msg.includes("supabase") || msg.includes("Supabase")) {
      reportSupabaseError(msg);
    } else {
      reportAPIError(msg);
    }
  });
}

/* ================================================================ */
/*  COMPONENT                                                         */
/* ================================================================ */

export function ErrorOverlay() {
  const [visible, setVisible] = useState(false);
  const [errors, setErrors] = useState<ErrorEntry[]>([]);
  const [activeTab, setActiveTab] = useState<ErrorCategory | "all">("all");
  const [supaStatus, setSupaStatus] = useState<boolean>(false);

  useEffect(() => {
    const show = features.dev || window.location.search.includes("debug=1");
    setVisible(show);
  }, []);

  useEffect(() => {
    setSupaStatus(isSupabaseConfigured());
  }, []);

  useEffect(() => {
    return subscribe(() => setErrors([...errorLog]));
  }, []);

  if (!visible) return null;

  const filtered = activeTab === "all" ? errors : errors.filter((e) => e.category === activeTab);

  const categoryLabel: Record<ErrorCategory | "all", string> = {
    all: "全部",
    api: "API",
    supabase: "Supabase",
    payment: "付款",
    analytics: "分析",
    cart: "購物車",
  };

  const health = checkHealth();

  return (
    <div className="fixed bottom-4 left-4 z-[9999] max-h-[80vh] w-[400px] max-w-[calc(100vw-2rem)] rounded-lg border border-slate-700 bg-slate-900/95 text-white shadow-2xl backdrop-blur-sm flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-700 px-4 py-3">
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-semibold text-sm">診斷面板</span>
          {errors.length > 0 && (
            <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold">{errors.length}</span>
          )}
        </div>
        <button
          onClick={() => setVisible(false)}
          className="text-slate-400 hover:text-white transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Config Status */}
      <div className="border-b border-slate-700 px-4 py-2">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
          <StatusRow label="環境" value={env.MODE} ok />
          <StatusRow label="Supabase" value={supaStatus ? "已連線" : "未配置"} ok={supaStatus} />
          <StatusRow label="API" value={env.API_BASE} ok={!!env.API_BASE} />
          <StatusRow label="GA4" value={features.analytics ? "已啟用" : "未啟用"} ok={features.analytics} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-700 px-4 py-2 overflow-x-auto">
        {(["all", "api", "supabase", "analytics", "payment", "cart"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded px-2 py-1 text-[11px] whitespace-nowrap transition-colors ${
              activeTab === tab ? "bg-slate-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            {categoryLabel[tab]}
            {tab !== "all" && (
              <span className="ml-1 text-slate-500">{errors.filter((e) => e.category === tab).length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Error List */}
      <div className="flex-1 overflow-y-auto px-4 py-2 min-h-[120px]">
        {filtered.length === 0 ? (
          <p className="text-center text-xs text-slate-500 py-8">尚無錯誤記錄</p>
        ) : (
          <ul className="space-y-2">
            {filtered.map((err) => (
              <li key={err.id} className="rounded bg-slate-800 p-2 text-xs">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`h-1.5 w-1.5 rounded-full ${
                    err.category === "api" ? "bg-blue-400" :
                    err.category === "supabase" ? "bg-purple-400" :
                    err.category === "payment" ? "bg-amber-400" : "bg-green-400"
                  }`} />
                  <span className="font-medium text-slate-200">{err.message}</span>
                </div>
                {err.details && <p className="text-slate-500 truncate ml-3">{err.details}</p>}
                <p className="text-slate-600 ml-3">{new Date(err.timestamp).toLocaleTimeString()}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-700 px-4 py-2 flex justify-between items-center">
        <span className="text-[10px] text-slate-500">{env.PROD ? "Production" : "Development"}</span>
        {health.warnings.length > 0 && (
          <span className="text-[10px] text-amber-400">{health.warnings.length} 個警告</span>
        )}
      </div>
    </div>
  );
}

function StatusRow({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`h-1.5 w-1.5 rounded-full ${ok ? "bg-emerald-400" : "bg-amber-400"}`} />
      <span className="text-slate-400">{label}:</span>
      <span className={ok ? "text-emerald-300" : "text-amber-300"}>{value}</span>
    </div>
  );
}

export default ErrorOverlay;
