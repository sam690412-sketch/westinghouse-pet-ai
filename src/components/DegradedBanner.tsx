/* ================================================================
   DEGRADED MODE BANNER — Westinghouse Pet Taiwan
   Shows when core services are unavailable
   Renders in normal document flow — NEVER fixed/absolute
   Non-blocking: user can still browse and use cart
   ================================================================ */

import { useState, useEffect } from "react";
import { features } from "@/lib/env";
import { isSupabaseConfigured } from "@/lib/supabase";
import { WifiOff, X } from "lucide-react";

interface DegradedState {
  supabase: boolean;
  api: boolean;
}

export function DegradedBanner() {
  const [state, setState] = useState<DegradedState>({
    supabase: features.supabase,
    api: features.api,
  });
  const [dismissed, setDismissed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function checkServices() {
      setChecking(true);

      const supaOk = isSupabaseConfigured();

      let apiOk = false;
      if (features.api) {
        try {
          const res = await fetch(`${features.api ? "/api" : ""}/health`, {
            method: "HEAD",
            signal: AbortSignal.timeout(3000),
          });
          apiOk = res.ok;
        } catch {
          apiOk = false;
        }
      }

      if (!cancelled) {
        setState({ supabase: supaOk, api: apiOk });
        setChecking(false);
      }
    }

    checkServices();
    return () => { cancelled = true; };
  }, []);

  if (checking) return null;

  const allOk = state.supabase && state.api;
  if (allOk) return null;
  if (dismissed) return null;

  return (
    <div className="w-full bg-amber-50 border-b border-amber-200">
      <div className="mx-auto max-w-7xl px-4 py-2.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <WifiOff className="h-4 w-4 flex-shrink-0 text-amber-600" />
            <div className="text-sm text-amber-800">
              <span className="font-medium">部分功能受限</span>
              <span className="hidden sm:inline"> — </span>
              <span className="block sm:inline text-amber-700">
                {!state.supabase && !state.api
                  ? "目前使用離線模式，商品資料可能不是最新"
                  : !state.supabase
                    ? "資料庫連線異常"
                    : "API 伺服器連線異常"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-[11px] text-amber-600 hidden sm:inline">
              購物車與瀏覽功能正常運作
            </span>
            <button
              onClick={() => setDismissed(true)}
              className="rounded p-1 hover:bg-amber-100 transition-colors"
              title="暫時隱藏"
            >
              <X className="h-3.5 w-3.5 text-amber-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DegradedBanner;
