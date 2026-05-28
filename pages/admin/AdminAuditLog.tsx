import { useEffect, useState, useCallback } from "react";
import { Search, ChevronLeft, ChevronRight, Eye, X } from "lucide-react";
import { Heading, Text } from "@/components/atomic/Typography";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminApi } from "./useAdminApi";

interface AuditRow {
  id: string;
  event_type: string;
  table_name: string | null;
  record_id: string | null;
  order_number: string | null;
  details: Record<string, unknown>;
  created_at: string;
}

const eventColors: Record<string, string> = {
  payment_completed: "text-success",
  payment_failed: "text-error",
  payment_mock_completed: "text-info",
  inventory_adjusted: "text-warning",
  webhook_invalid: "text-error",
  webhook_amount_mismatch: "text-error",
  webhook_duplicate_ignored: "text-muted-foreground",
};

export default function AdminAuditLog() {
  const { data, isLoading, error: _error, fetchData } = useAdminApi<{ data: AuditRow[]; total: number }>();
  const [eventType, setEventType] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [page, setPage] = useState(0);
  const [jsonView, setJsonView] = useState<AuditRow | null>(null);
  const limit = 50;

  const loadAudit = useCallback(() => {
    const params = new URLSearchParams();
    params.set("limit", String(limit));
    params.set("offset", String(page * limit));
    if (eventType) params.set("eventType", eventType);
    if (orderNumber) params.set("orderNumber", orderNumber);
    fetchData(`/admin/audit-log?${params.toString()}`).catch(() => {});
  }, [eventType, orderNumber, page, fetchData]);

  useEffect(() => { loadAudit(); }, [loadAudit]);

  const total = data?.total ?? 0;
  const rows: AuditRow[] = data?.data ?? [];

  return (
    <div className="space-y-4">
      <Heading as="h1" variant="h2">稽核記錄</Heading>

      <div className="flex flex-wrap gap-3">
        <select
          value={eventType}
          onChange={(e) => { setEventType(e.target.value); setPage(0); }}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="">全部事件</option>
          <option value="payment_completed">付款完成</option>
          <option value="payment_failed">付款失敗</option>
          <option value="payment_mock_completed">模擬付款</option>
          <option value="inventory_adjusted">庫存調整</option>
          <option value="webhook_invalid">無效 Webhook</option>
          <option value="webhook_amount_mismatch">金額不符</option>
          <option value="webhook_duplicate_ignored">重複 Webhook</option>
        </select>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={orderNumber}
            onChange={(e) => { setOrderNumber(e.target.value); setPage(0); }}
            placeholder="搜尋訂單編號"
            className="pl-9"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left font-medium">事件</th>
              <th className="px-4 py-3 text-left font-medium">資料表</th>
              <th className="px-4 py-3 text-left font-medium">記錄</th>
              <th className="px-4 py-3 text-left font-medium">訂單</th>
              <th className="px-4 py-3 text-left font-medium">時間</th>
              <th className="px-4 py-3 text-left font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading && <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">載入中...</td></tr>}
            {!isLoading && rows.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">尚無記錄</td></tr>}
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-neutral-50">
                <td className={`px-4 py-3 text-xs font-medium ${eventColors[row.event_type] || "text-foreground"}`}>
                  {row.event_type}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{row.table_name || "N/A"}</td>
                <td className="px-4 py-3 text-xs font-mono text-muted-foreground">
                  {row.record_id ? (row.record_id as string).slice(0, 8) + "..." : "N/A"}
                </td>
                <td className="px-4 py-3 text-xs">{row.order_number || "N/A"}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {new Date(row.created_at).toLocaleString("zh-TW")}
                </td>
                <td className="px-4 py-3">
                  <Button variant="ghost" size="sm" onClick={() => setJsonView(row)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm">
        <Text variant="bodySmall" color="muted">
          顯示 {page * limit + 1}-{Math.min((page + 1) * limit, total)} / {total} 筆
        </Text>
        <div className="flex gap-1">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" disabled={(page + 1) * limit >= total} onClick={() => setPage(p => p + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* JSON Viewer */}
      {jsonView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setJsonView(null)} />
          <div className="relative max-h-[80vh] w-full max-w-2xl overflow-auto rounded-xl bg-card p-4 shadow-xl">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">{jsonView.event_type} — 詳細資料</span>
              <Button variant="ghost" size="sm" onClick={() => setJsonView(null)}><X className="h-4 w-4" /></Button>
            </div>
            <pre className="rounded-lg bg-neutral-900 p-3 text-xs text-neutral-100 overflow-auto">
              {JSON.stringify(jsonView.details, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
