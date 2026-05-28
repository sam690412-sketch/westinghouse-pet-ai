import { useEffect, useState, useCallback } from "react";
import { Search, ChevronLeft, ChevronRight, Eye, X } from "lucide-react";
import { Heading, Text } from "@/components/atomic/Typography";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminApi } from "./useAdminApi";

interface PaymentRow {
  id: string;
  order_number: string;
  customer_name: string;
  provider: string;
  amount: number;
  status: string;
  provider_transaction_id: string | null;
  paid_at: string | null;
  failure_reason: string | null;
  provider_response: Record<string, unknown>;
  created_at: string;
}

const statusColors: Record<string, string> = {
  pending: "text-warning",
  completed: "text-success",
  failed: "text-error",
  processing: "text-info",
};

export default function AdminPayments() {
  const { data, isLoading, error: _error, fetchData } = useAdminApi<{ data: PaymentRow[]; total: number }>();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(0);
  const [jsonView, setJsonView] = useState<PaymentRow | null>(null);
  const limit = 20;

  const loadPayments = useCallback(() => {
    const params = new URLSearchParams();
    params.set("limit", String(limit));
    params.set("offset", String(page * limit));
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    fetchData(`/admin/payments?${params.toString()}`).catch(() => {});
  }, [search, status, page, fetchData]);

  useEffect(() => { loadPayments(); }, [loadPayments]);

  const total = data?.total ?? 0;
  const rows: PaymentRow[] = data?.data ?? [];

  return (
    <div className="space-y-4">
      <Heading as="h1" variant="h2">付款管理</Heading>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder="搜尋訂單號或交易號"
            className="pl-9"
          />
        </div>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(0); }}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="">全部</option>
          <option value="pending">待付款</option>
          <option value="completed">已完成</option>
          <option value="failed">失敗</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left font-medium">訂單</th>
              <th className="px-4 py-3 text-left font-medium">客戶</th>
              <th className="px-4 py-3 text-left font-medium">金額</th>
              <th className="px-4 py-3 text-left font-medium">狀態</th>
              <th className="px-4 py-3 text-left font-medium">Provider Tx</th>
              <th className="px-4 py-3 text-left font-medium">付款時間</th>
              <th className="px-4 py-3 text-left font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading && <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">載入中...</td></tr>}
            {!isLoading && rows.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">尚無付款記錄</td></tr>}
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-neutral-50">
                <td className="px-4 py-3 font-mono text-xs">{row.order_number}</td>
                <td className="px-4 py-3">{row.customer_name}</td>
                <td className="px-4 py-3">NT${row.amount.toLocaleString()}</td>
                <td className={`px-4 py-3 text-xs font-medium ${statusColors[row.status] || ""}`}>{row.status}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{row.provider_transaction_id || "N/A"}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {row.paid_at ? new Date(row.paid_at).toLocaleString("zh-TW") : "-"}
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
              <span className="text-sm font-medium">Provider Response</span>
              <Button variant="ghost" size="sm" onClick={() => setJsonView(null)}><X className="h-4 w-4" /></Button>
            </div>
            <pre className="rounded-lg bg-neutral-900 p-3 text-xs text-neutral-100 overflow-auto">
              {JSON.stringify(jsonView.provider_response, null, 2)}
            </pre>
            {jsonView.failure_reason && (
              <div className="mt-3 rounded-lg bg-error/10 p-3 text-sm text-error">
                失敗原因: {jsonView.failure_reason}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
