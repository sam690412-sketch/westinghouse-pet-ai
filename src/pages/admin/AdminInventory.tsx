import { useEffect, useState, useCallback } from "react";
import { Search, AlertTriangle, ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Heading, Text } from "@/components/atomic/Typography";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminApi } from "./useAdminApi";

interface ProductRow {
  id: string;
  sku: string;
  name: string;
  category: string;
  hero_image_url: string | null;
  price: number;
  stock_quantity: number;
  stock_status: string;
  is_active: boolean;
  preorder: boolean;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  in_stock: { label: "庫存充足", className: "bg-success/10 text-success" },
  low_stock: { label: "庫存不足", className: "bg-warning/10 text-warning" },
  out_of_stock: { label: "缺貨", className: "bg-error/10 text-error" },
};

export default function AdminInventory() {
  const { data, isLoading, error: _error, fetchData, patchData } = useAdminApi<{ data: ProductRow[]; total: number }>();
  const adjustApi = useAdminApi<{ sku: string; oldQuantity: number; newQuantity: number }>();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(0);
  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [adjQty, setAdjQty] = useState(0);
  const [adjReason, setAdjReason] = useState("");
  const limit = 50;

  const loadInventory = useCallback(() => {
    const params = new URLSearchParams();
    params.set("limit", String(limit));
    params.set("offset", String(page * limit));
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    fetchData(`/admin/inventory?${params.toString()}`).catch(() => {});
  }, [search, status, page, fetchData]);

  useEffect(() => { loadInventory(); }, [loadInventory]);

  const openAdjust = (product: ProductRow) => {
    setEditing(product);
    setAdjQty(product.stock_quantity);
    setAdjReason("");
  };

  const submitAdjust = async () => {
    if (!editing || !adjReason.trim() || adjReason.trim().length < 3) return;
    try {
      await patchData("/admin/inventory/adjust", {
        sku: editing.sku,
        newQuantity: adjQty,
        reason: adjReason.trim(),
      });
      setEditing(null);
      loadInventory();
    } catch { /* error shown in adjustApi state */ }
  };

  const total = data?.total ?? 0;
  const rows: ProductRow[] = data?.data ?? [];

  return (
    <div className="space-y-4">
      <Heading as="h1" variant="h2">庫存管理</Heading>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder="搜尋 SKU 或商品名"
            className="pl-9"
          />
        </div>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(0); }}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="">全部庫存</option>
          <option value="in_stock">庫存充足</option>
          <option value="low_stock">庫存不足</option>
          <option value="out_of_stock">缺貨</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left font-medium">商品</th>
              <th className="px-4 py-3 text-left font-medium">SKU</th>
              <th className="px-4 py-3 text-left font-medium">價格</th>
              <th className="px-4 py-3 text-left font-medium">庫存</th>
              <th className="px-4 py-3 text-left font-medium">狀態</th>
              <th className="px-4 py-3 text-left font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading && <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">載入中...</td></tr>}
            {!isLoading && rows.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">尚無商品</td></tr>}
            {rows.map((row) => {
              const cfg = statusConfig[row.stock_status] || { label: row.stock_status, className: "" };
              return (
                <tr key={row.id} className={cn("hover:bg-neutral-50", row.stock_status === "low_stock" && "bg-warning/5")}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {row.hero_image_url ? (
                        <img src={row.hero_image_url} alt="" className="h-8 w-8 rounded object-cover" />
                      ) : (
                        <div className="h-8 w-8 rounded bg-neutral-200" />
                      )}
                      <span className="font-medium">{row.name}</span>
                      {row.preorder && <span className="rounded bg-info/10 px-1.5 py-0.5 text-xs text-info">預購</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{row.sku}</td>
                  <td className="px-4 py-3">NT${row.price.toLocaleString()}</td>
                  <td className="px-4 py-3 font-semibold">{row.stock_quantity}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${cfg.className}`}>
                      {row.stock_status === "low_stock" && <AlertTriangle className="h-3 w-3" />}
                      {cfg.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Button variant="outline" size="sm" onClick={() => openAdjust(row)}>調整</Button>
                  </td>
                </tr>
              );
            })}
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

      {/* Adjustment modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setEditing(null)} />
          <div className="relative w-full max-w-sm rounded-xl bg-card p-6 shadow-xl">
            <Heading as="h3" variant="h4">調整庫存</Heading>
            <p className="mt-1 text-sm text-muted-foreground">{editing.name} ({editing.sku})</p>
            <p className="text-sm">目前庫存: {editing.stock_quantity}</p>

            <div className="mt-4 flex items-center justify-center gap-3">
              <Button variant="outline" size="sm" onClick={() => setAdjQty(q => Math.max(0, q - 1))}>
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-16 text-center text-xl font-bold">{adjQty}</span>
              <Button variant="outline" size="sm" onClick={() => setAdjQty(q => q + 1)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-4">
              <label className="mb-1 block text-sm font-medium">調整原因 *</label>
              <Input
                value={adjReason}
                onChange={(e) => setAdjReason(e.target.value)}
                placeholder="至少 3 個字"
              />
              {adjReason.trim().length > 0 && adjReason.trim().length < 3 && (
                <p className="mt-1 text-xs text-error">原因至少需要 3 個字</p>
              )}
            </div>

            {adjustApi.error && <p className="mt-2 text-sm text-error">{adjustApi.error}</p>}

            <div className="mt-4 flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setEditing(null)}>取消</Button>
              <Button
                className="flex-1"
                disabled={!adjReason.trim() || adjReason.trim().length < 3 || adjustApi.isLoading}
                onClick={submitAdjust}
              >
                {adjustApi.isLoading ? "處理中..." : "確認調整"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
