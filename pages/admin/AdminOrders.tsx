import { useEffect, useState, useCallback } from "react";
import { Search, ChevronLeft, ChevronRight, X, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { Heading, Text } from "@/components/atomic/Typography";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminApi } from "./useAdminApi";

interface OrderRow {
  order_number: string;
  status: string;
  customer_name: string;
  customer_phone: string;
  total_amount: number;
  created_at: string;
  payment_status: string | null;
  provider_transaction_id: string | null;
  inventory_decremented_at: string | null;
}

const statusLabels: Record<string, string> = {
  pending: "待付款", paid: "已付款", failed: "失敗",
  shipped: "已出貨", completed: "已完成", cancelled: "已取消",
};
const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning",
  paid: "bg-success/10 text-success",
  failed: "bg-error/10 text-error",
  shipped: "bg-info/10 text-info",
  completed: "bg-success/10 text-success",
  cancelled: "bg-muted text-muted-foreground",
};
const payStatusColors: Record<string, string> = {
  pending: "text-warning",
  completed: "text-success",
  failed: "text-error",
  processing: "text-info",
};

export default function AdminOrders() {
  const { data, isLoading, error: _error, fetchData } = useAdminApi<{ data: OrderRow[]; total: number }>();
  const detailApi = useAdminApi<Record<string, unknown>>();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [payStatus, setPayStatus] = useState("");
  const [page, setPage] = useState(0);
  const [detailOpen, setDetailOpen] = useState(false);
  const limit = 20;

  const loadOrders = useCallback(() => {
    const params = new URLSearchParams();
    params.set("limit", String(limit));
    params.set("offset", String(page * limit));
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    if (payStatus) params.set("paymentStatus", payStatus);
    fetchData(`/admin/orders?${params.toString()}`).catch(() => {});
  }, [search, status, payStatus, page, fetchData]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const openDetail = (orderNumber: string) => {
    detailApi.fetchData(`/admin/orders/detail?orderNumber=${encodeURIComponent(orderNumber)}`).then(() => {
      setDetailOpen(true);
    }).catch(() => {});
  };

  const total = data?.total ?? 0;
  const rows: OrderRow[] = data?.data ?? [];

  return (
    <div className="space-y-4">
      <Heading as="h1" variant="h2">訂單管理</Heading>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder="搜尋訂單號、客戶名、電話"
            className="pl-9"
          />
        </div>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(0); }}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="">全部狀態</option>
          <option value="pending">待付款</option>
          <option value="paid">已付款</option>
          <option value="failed">失敗</option>
          <option value="shipped">已出貨</option>
          <option value="completed">已完成</option>
        </select>
        <select
          value={payStatus}
          onChange={(e) => { setPayStatus(e.target.value); setPage(0); }}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="">全部付款</option>
          <option value="pending">待付款</option>
          <option value="completed">已完成</option>
          <option value="failed">失敗</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left font-medium">訂單編號</th>
              <th className="px-4 py-3 text-left font-medium">客戶</th>
              <th className="px-4 py-3 text-left font-medium">金額</th>
              <th className="px-4 py-3 text-left font-medium">訂單狀態</th>
              <th className="px-4 py-3 text-left font-medium">付款</th>
              <th className="px-4 py-3 text-left font-medium">庫存扣減</th>
              <th className="px-4 py-3 text-left font-medium">時間</th>
              <th className="px-4 py-3 text-left font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">載入中...</td></tr>
            )}
            {!isLoading && rows.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">尚無訂單</td></tr>
            )}
            {rows.map((row) => (
              <tr key={row.order_number} className="hover:bg-neutral-50">
                <td className="px-4 py-3 font-mono text-xs">{row.order_number}</td>
                <td className="px-4 py-3">
                  <p className="font-medium">{row.customer_name}</p>
                  <p className="text-xs text-muted-foreground">{row.customer_phone}</p>
                </td>
                <td className="px-4 py-3">NT${row.total_amount.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[row.status] || ""}`}>
                    {statusLabels[row.status] || row.status}
                  </span>
                </td>
                <td className={cn("px-4 py-3 text-xs", payStatusColors[row.payment_status || ""])}>
                  {row.payment_status || "N/A"}
                </td>
                <td className="px-4 py-3">
                  {row.inventory_decremented_at ? (
                    <span className="text-xs text-success">已扣減</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">未扣減</span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {new Date(row.created_at).toLocaleDateString("zh-TW")}
                </td>
                <td className="px-4 py-3">
                  <Button variant="ghost" size="sm" onClick={() => openDetail(row.order_number)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
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

      {/* Detail drawer */}
      {detailOpen && detailApi.data && (
        <OrderDetailDrawer data={detailApi.data} onClose={() => setDetailOpen(false)} />
      )}
    </div>
  );
}

function OrderDetailDrawer({ data, onClose }: { data: Record<string, unknown>; onClose: () => void }) {
  const items = (data.items as Array<Record<string, unknown>>) ?? [];
  const auditTrail = (data.auditTrail as Array<Record<string, unknown>>) ?? [];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-lg overflow-y-auto bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border p-4">
          <Heading as="h2" variant="h4">{data.order_number as string}</Heading>
          <Button variant="ghost" size="sm" onClick={onClose}><X className="h-4 w-4" /></Button>
        </div>
        <div className="space-y-4 p-4">
          <Section title="客戶資訊">
            <p className="text-sm">{data.customer_name as string}</p>
            <p className="text-sm text-muted-foreground">{data.customer_phone as string}</p>
            <p className="text-sm text-muted-foreground">{data.customer_email as string}</p>
          </Section>
          <Section title="訂單項目">
            {items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span>{item.product_name as string} x{item.quantity as number}</span>
                <span>NT${(item.subtotal as number).toLocaleString()}</span>
              </div>
            ))}
          </Section>
          <Section title="付款資訊">
            <p className="text-sm">狀態: <span className="font-medium">{data.payment_status as string}</span></p>
            <p className="text-sm">交易方式: {data.provider as string}</p>
            {(data.provider_transaction_id as string | null) && (
              <p className="text-xs text-muted-foreground">Tx: {data.provider_transaction_id as string}</p>
            )}
            {(data.inventory_decremented_at as string | null) && (
              <p className="text-xs text-success">庫存已扣減: {new Date(data.inventory_decremented_at as string).toLocaleString("zh-TW")}</p>
            )}
          </Section>
          <Section title="稽核記錄">
            {auditTrail.length === 0 && <p className="text-sm text-muted-foreground">無記錄</p>}
            {auditTrail.map((a, i) => (
              <div key={i} className="rounded bg-neutral-50 px-2 py-1 text-xs">
                <span className="font-medium text-primary">{a.event_type as string}</span>
                <span className="ml-2 text-muted-foreground">{new Date(a.created_at as string).toLocaleString("zh-TW")}</span>
              </div>
            ))}
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-muted-foreground">{title}</h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
}
