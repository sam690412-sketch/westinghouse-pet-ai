import { useEffect, useState, useCallback } from "react";
import { Search, ChevronLeft, ChevronRight, Eye, X } from "lucide-react";
import { Heading, Text } from "@/components/atomic/Typography";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminApi } from "./useAdminApi";

interface TicketRow {
  id: string;
  ticket_number: string;
  customer_name: string;
  customer_phone: string;
  product_sku: string;
  issue_type: string;
  issue_description: string;
  status: string;
  priority: string;
  timeline: Array<{ status: string; note: string; timestamp: string }>;
  created_at: string;
  updated_at: string;
}

const statusLabels: Record<string, string> = {
  new: "新工單", processing: "處理中", repairing: "維修中", shipping: "出貨中", completed: "已完成", closed: "已結案",
};
const statusColors: Record<string, string> = {
  new: "bg-warning/10 text-warning", processing: "bg-info/10 text-info",
  repairing: "bg-primary/10 text-primary", shipping: "bg-info/10 text-info",
  completed: "bg-success/10 text-success", closed: "bg-muted text-muted-foreground",
};
const priorityColors: Record<string, string> = {
  low: "text-muted-foreground", medium: "text-info", high: "text-warning", urgent: "text-error",
};

export default function AdminTickets() {
  const { data, isLoading, error: _error, fetchData } = useAdminApi<{ data: TicketRow[]; total: number }>();
  const updateApi = useAdminApi<{ ticketNumber: string; updated: boolean }>();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [page, setPage] = useState(0);
  const [detail, setDetail] = useState<TicketRow | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [note, setNote] = useState("");
  const limit = 20;

  const loadTickets = useCallback(() => {
    const params = new URLSearchParams();
    params.set("limit", String(limit));
    params.set("offset", String(page * limit));
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    if (priority) params.set("priority", priority);
    fetchData(`/admin/tickets?${params.toString()}`).catch(() => {});
  }, [search, status, priority, page, fetchData]);

  useEffect(() => { loadTickets(); }, [loadTickets]);

  const handleUpdate = async () => {
    if (!detail) return;
    try {
      await updateApi.patchData("/admin/tickets/update", {
        ticketNumber: detail.ticket_number,
        status: editStatus || undefined,
        note: note || undefined,
      });
      setDetail(null);
      loadTickets();
    } catch { /* error shown in updateApi */ }
  };

  const total = data?.total ?? 0;
  const rows: TicketRow[] = data?.data ?? [];

  return (
    <div className="space-y-4">
      <Heading as="h1" variant="h2">工單管理</Heading>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} placeholder="搜尋工單號或客戶名" className="pl-9" />
        </div>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(0); }} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
          <option value="">全部狀態</option>
          <option value="new">新工單</option>
          <option value="processing">處理中</option>
          <option value="repairing">維修中</option>
          <option value="shipping">出貨中</option>
          <option value="completed">已完成</option>
          <option value="closed">已結案</option>
        </select>
        <select value={priority} onChange={e => { setPriority(e.target.value); setPage(0); }} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
          <option value="">全部優先級</option>
          <option value="low">低</option>
          <option value="medium">中</option>
          <option value="high">高</option>
          <option value="urgent">緊急</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left font-medium">工單</th>
              <th className="px-4 py-3 text-left font-medium">客戶</th>
              <th className="px-4 py-3 text-left font-medium">產品</th>
              <th className="px-4 py-3 text-left font-medium">狀態</th>
              <th className="px-4 py-3 text-left font-medium">優先級</th>
              <th className="px-4 py-3 text-left font-medium">時間</th>
              <th className="px-4 py-3 text-left font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading && <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">載入中...</td></tr>}
            {!isLoading && rows.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">尚無工單</td></tr>}
            {rows.map(row => (
              <tr key={row.id} className="hover:bg-neutral-50">
                <td className="px-4 py-3 font-mono text-xs">{row.ticket_number}</td>
                <td className="px-4 py-3"><p className="font-medium">{row.customer_name}</p><p className="text-xs text-muted-foreground">{row.customer_phone}</p></td>
                <td className="px-4 py-3 text-xs">{row.product_sku || "N/A"}</td>
                <td className="px-4 py-3"><span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[row.status]}`}>{statusLabels[row.status]}</span></td>
                <td className={`px-4 py-3 text-xs font-medium ${priorityColors[row.priority]}`}>{row.priority}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(row.created_at).toLocaleDateString("zh-TW")}</td>
                <td className="px-4 py-3"><Button variant="ghost" size="sm" onClick={() => { setDetail(row); setEditStatus(row.status); setNote(""); }}><Eye className="h-4 w-4" /></Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm">
        <Text variant="bodySmall" color="muted">顯示 {page * limit + 1}-{Math.min((page + 1) * limit, total)} / {total} 筆</Text>
        <div className="flex gap-1">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
          <Button variant="outline" size="sm" disabled={(page + 1) * limit >= total} onClick={() => setPage(p => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>

      {/* Detail drawer */}
      {detail && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDetail(null)} />
          <div className="relative w-full max-w-lg overflow-y-auto bg-card shadow-xl">
            <div className="flex items-center justify-between border-b border-border p-4">
              <Heading as="h2" variant="h4">{detail.ticket_number}</Heading>
              <Button variant="ghost" size="sm" onClick={() => setDetail(null)}><X className="h-4 w-4" /></Button>
            </div>
            <div className="space-y-4 p-4">
              <div className="text-sm"><p className="text-muted-foreground">客戶</p><p className="font-medium">{detail.customer_name} / {detail.customer_phone}</p></div>
              <div className="text-sm"><p className="text-muted-foreground">問題</p><p>{detail.issue_type}: {detail.issue_description}</p></div>

              {/* Status update */}
              <div className="border-t border-border pt-4">
                <Text variant="label" weight="semibold">更新狀態</Text>
                <div className="mt-2 flex gap-2">
                  <select value={editStatus} onChange={e => setEditStatus(e.target.value)} className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm">
                    {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div className="mt-2">
                  <Input value={note} onChange={e => setNote(e.target.value)} placeholder="備註（選填）" />
                </div>
                {updateApi.error && <p className="mt-2 text-sm text-error">{updateApi.error}</p>}
                <Button className="mt-2" size="sm" onClick={handleUpdate} disabled={updateApi.isLoading}>
                  {updateApi.isLoading ? "更新中..." : "更新"}
                </Button>
              </div>

              {/* Timeline */}
              <div className="border-t border-border pt-4">
                <Text variant="label" weight="semibold">處理進度</Text>
                <div className="mt-2 space-y-2">
                  {(detail.timeline || []).map((entry, i) => (
                    <div key={i} className="rounded bg-neutral-50 px-2 py-1 text-xs">
                      <span className="font-medium">{statusLabels[entry.status] || entry.status}</span>
                      <span className="ml-2 text-muted-foreground">{entry.note}</span>
                      <span className="ml-2 text-muted-foreground">{new Date(entry.timestamp).toLocaleString("zh-TW")}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
