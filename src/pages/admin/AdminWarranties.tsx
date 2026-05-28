import { useEffect, useState, useCallback } from "react";
import { Search, ChevronLeft, ChevronRight, Eye, X } from "lucide-react";
import { Heading, Text } from "@/components/atomic/Typography";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminApi } from "./useAdminApi";

interface WarrantyRow {
  id: string;
  warranty_code: string;
  product_sku: string;
  product_name: string;
  serial_number: string | null;
  customer_name: string;
  customer_phone: string;
  purchase_date: string;
  expiry_date: string;
  status: string;
  registered_at: string;
  extension_notes: string | null;
}

const statusLabels: Record<string, string> = { active: "保固中", expired: "已過期", claimed: "已使用" };
const statusColors: Record<string, string> = {
  active: "bg-success/10 text-success", expired: "bg-error/10 text-error", claimed: "bg-warning/10 text-warning",
};

export default function AdminWarranties() {
  const { data, isLoading, error: _error, fetchData } = useAdminApi<{ data: WarrantyRow[]; total: number }>();
  const updateApi = useAdminApi<{ warrantyCode: string; action: string; updated: boolean }>();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(0);
  const [detail, setDetail] = useState<WarrantyRow | null>(null);
  const [newExpiry, setNewExpiry] = useState("");
  const [reason, setReason] = useState("");
  const limit = 20;

  const loadWarranties = useCallback(() => {
    const params = new URLSearchParams();
    params.set("limit", String(limit));
    params.set("offset", String(page * limit));
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    fetchData(`/admin/warranties?${params.toString()}`).catch(() => {});
  }, [search, status, page, fetchData]);

  useEffect(() => { loadWarranties(); }, [loadWarranties]);

  const handleExtend = async () => {
    if (!detail || !newExpiry || !reason.trim()) return;
    try {
      await updateApi.patchData("/admin/warranties/update", {
        warrantyCode: detail.warranty_code, action: "extend", newExpiryDate: newExpiry, reason: reason.trim(),
      });
      setDetail(null); setNewExpiry(""); setReason("");
      loadWarranties();
    } catch { /* error in updateApi */ }
  };

  const handleClaim = async () => {
    if (!detail) return;
    try {
      await updateApi.patchData("/admin/warranties/update", { warrantyCode: detail.warranty_code, action: "claim" });
      setDetail(null);
      loadWarranties();
    } catch { /* error in updateApi */ }
  };

  const total = data?.total ?? 0;
  const rows: WarrantyRow[] = data?.data ?? [];

  return (
    <div className="space-y-4">
      <Heading as="h1" variant="h2">保固管理</Heading>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} placeholder="搜尋保固編號、客戶名或電話" className="pl-9" />
        </div>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(0); }} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
          <option value="">全部狀態</option>
          <option value="active">保固中</option>
          <option value="expired">已過期</option>
          <option value="claimed">已使用</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left font-medium">保固編號</th>
              <th className="px-4 py-3 text-left font-medium">客戶</th>
              <th className="px-4 py-3 text-left font-medium">產品</th>
              <th className="px-4 py-3 text-left font-medium">到期日</th>
              <th className="px-4 py-3 text-left font-medium">狀態</th>
              <th className="px-4 py-3 text-left font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading && <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">載入中...</td></tr>}
            {!isLoading && rows.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">尚無保固</td></tr>}
            {rows.map(row => {
              const daysLeft = Math.ceil((new Date(row.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              return (
                <tr key={row.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 font-mono text-xs">{row.warranty_code}</td>
                  <td className="px-4 py-3"><p className="font-medium">{row.customer_name}</p><p className="text-xs text-muted-foreground">{row.customer_phone}</p></td>
                  <td className="px-4 py-3 text-xs">{row.product_name}</td>
                  <td className="px-4 py-3 text-xs">{row.expiry_date} ({daysLeft > 0 ? `剩${daysLeft}天` : "已過期"})</td>
                  <td className="px-4 py-3"><span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[row.status]}`}>{statusLabels[row.status]}</span></td>
                  <td className="px-4 py-3"><Button variant="ghost" size="sm" onClick={() => setDetail(row)}><Eye className="h-4 w-4" /></Button></td>
                </tr>
              );
            })}
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
              <Heading as="h2" variant="h4">{detail.warranty_code}</Heading>
              <Button variant="ghost" size="sm" onClick={() => setDetail(null)}><X className="h-4 w-4" /></Button>
            </div>
            <div className="space-y-4 p-4 text-sm">
              <div><p className="text-muted-foreground">客戶</p><p className="font-medium">{detail.customer_name} / {detail.customer_phone}</p></div>
              <div><p className="text-muted-foreground">產品</p><p>{detail.product_name} ({detail.product_sku})</p></div>
              {detail.serial_number && <div><p className="text-muted-foreground">序號</p><p className="font-mono">{detail.serial_number}</p></div>}
              <div className="flex justify-between"><span className="text-muted-foreground">購買日</span><span>{detail.purchase_date}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">到期日</span><span>{detail.expiry_date}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">狀態</span>
                <span className={`font-medium ${detail.status === "active" ? "text-success" : detail.status === "expired" ? "text-error" : "text-warning"}`}>{statusLabels[detail.status]}</span>
              </div>
              {detail.extension_notes && <div className="rounded bg-info/10 p-2 text-xs text-info">延長備註: {detail.extension_notes}</div>}

              {/* Actions */}
              <div className="border-t border-border pt-4 space-y-3">
                <Text variant="label" weight="semibold">管理操作</Text>

                {/* Extend */}
                <div className="rounded-lg bg-neutral-50 p-3">
                  <p className="text-sm font-medium mb-2">延長保固</p>
                  <div className="flex gap-2">
                    <Input type="date" value={newExpiry} onChange={e => setNewExpiry(e.target.value)} className="flex-1" />
                  </div>
                  <Input className="mt-2" value={reason} onChange={e => setReason(e.target.value)} placeholder="原因（至少3字）" />
                  {updateApi.error && <p className="mt-1 text-xs text-error">{updateApi.error}</p>}
                  <Button className="mt-2" size="sm" onClick={handleExtend} disabled={!newExpiry || !reason.trim() || reason.trim().length < 3}>
                    延長保固
                  </Button>
                </div>

                {/* Claim */}
                {detail.status !== "claimed" && (
                  <Button variant="outline" size="sm" className="w-full" onClick={handleClaim}>
                    標記為已使用
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
