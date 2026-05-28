import { env } from "@/lib/env";
import { useCallback, useState } from "react";

const API_BASE =
  env.API_BASE;

function getSecret(): string {
  return localStorage.getItem("admin_secret") || "";
}

interface ApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

export function useAdminApi<T>() {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const fetchData = useCallback(async (path: string) => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const res = await fetch(`${API_BASE}${path}`, {
        headers: { "X-Admin-Secret": getSecret() },
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setState({ data: json.data ?? json, isLoading: false, error: null });
      return json.data ?? json;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Request failed";
      setState({ data: null, isLoading: false, error: msg });
      throw e;
    }
  }, []);

  const patchData = useCallback(async (path: string, body: Record<string, unknown>) => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const res = await fetch(`${API_BASE}${path}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "X-Admin-Secret": getSecret() },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setState({ data: json.data ?? json, isLoading: false, error: null });
      return json.data ?? json;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Request failed";
      setState({ data: null, isLoading: false, error: msg });
      throw e;
    }
  }, []);

  return { ...state, fetchData, patchData };
}
