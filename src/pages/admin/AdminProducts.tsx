import { useCallback, useEffect, useState } from "react";
import { useOutletContext } from "react-router";
import { Package, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useProductPricing } from "@/context/ProductPricingContext";
import { adminApi } from "@/lib/adminApi";
import type { AdminRole } from "@/config/adminPermissions";

type Product = {
  sku: string;
  commerce_sku: string;
  name_zh_tw: string;
  slug: string | null;
  hero_image_url: string | null;
  is_active: boolean | null;
  archived: boolean;
  stock_quantity: number | null;
  listing_issues: string[];
  msrp_twd: number;
  retail_twd: number;
  promo_twd: number;
};

const filters = [
  { label: "全部商品", key: "all" },
  { label: "已上架", key: "listed" },
  { label: "未上架", key: "unlisted" },
  { label: "需處理", key: "issues" },
] as const;
type Filter = typeof filters[number]["key"];
type Editing = { kind: "listing" | "price" | "inventory"; product: Product };
const priceFields = [
  ["msrp_twd", "建議售價"],
  ["retail_twd", "官網零售價"],
  ["promo_twd", "優惠價"],
] as const;

function isListed(product: Product) {
  return product.is_active === true && !!product.slug && !product.archived;
}

function matches(product: Product, filter: Filter) {
  if (filter === "listed") return isListed(product);
  if (filter === "unlisted") return !isListed(product);
  if (filter === "issues") return product.listing_issues.length > 0;
  return true;
}

function money(value: number) {
  return `NT$${value.toLocaleString("zh-TW")}`;
}

export default function AdminProducts() {
  const { role } = useOutletContext<{ role: AdminRole }>();
  const { refresh } = useProductPricing();
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Editing | null>(null);
  const [reason, setReason] = useState("");
  const [direct, setDirect] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [dialogError, setDialogError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    try {
      const response = await adminApi("/api/admin/products");
      setProducts(response.data);
      setError("");
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "商品資料讀取失敗");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  function start(kind: Editing["kind"], product: Product) {
    setReason("");
    setDirect(false);
    setDialogError("");
    setNotice("");
    setEditing({ kind, product: { ...product } });
  }

  async function save() {
    if (!editing || pending) return;
    const { kind, product } = editing;
    setPending(true);
    setDialogError("");
    try {
      let path: string;
      let method = "PATCH";
      let body: object;
      if (kind === "listing") {
        path = `/api/admin/products/${product.commerce_sku}/listing`;
        body = { is_active: !product.is_active, reason };
      } else if (kind === "inventory") {
        path = "/api/admin/inventory/adjust";
        method = "POST";
        body = { sku: product.commerce_sku, newQuantity: product.stock_quantity, reason, direct };
      } else {
        path = `/api/admin/products/${encodeURIComponent(product.sku)}/price`;
        const { msrp_twd, retail_twd, promo_twd } = product;
        body = { msrp_twd, retail_twd, promo_twd, reason, direct };
      }
      const response = await adminApi(path, { method, body: JSON.stringify(body) });
      if (response.status === "pending") setNotice("已送主管審核，可到待審批中心查詢。");
      else if (kind === "listing") setNotice(product.is_active ? "商品已下架" : "商品已上架");
      else setNotice(kind === "inventory" ? "庫存已更新" : "價格已更新");
      setEditing(null);
      await Promise.all([load(), refresh()]);
    } catch (problem) {
      setDialogError(problem instanceof Error ? problem.message : "操作失敗，請重試");
    } finally {
      setPending(false);
    }
  }

  const search = query.trim().toLowerCase();
  const rows = products.filter(product => matches(product, filter) &&
    [product.sku, product.commerce_sku, product.name_zh_tw].some(value => value.toLowerCase().includes(search)));
  const action = editing?.kind === "listing" ? (editing.product.is_active ? "下架商品" : "上架商品") :
    editing?.kind === "inventory" ? "調整庫存" : "編輯價格";

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">商品上架與價格</h1>
        <p className="mt-1 text-sm text-muted-foreground">查詢商品、確認上架條件，並管理前台是否顯示。</p>
      </div>

      <div className="rounded-xl border bg-card">
        <div className="flex flex-wrap gap-1 border-b px-3 pt-2" aria-label="商品狀態篩選">
          {filters.map(({ key, label }) => (
            <button key={key} type="button" aria-pressed={filter === key} onClick={() => setFilter(key)}
              className={`border-b-2 px-3 py-3 text-sm font-medium ${filter === key ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}>
              {label} <span className="ml-1 tabular-nums">{products.filter(product => matches(product, key)).length}</span>
            </button>
          ))}
        </div>
        <div className="space-y-2 p-4">
          <label className="relative block max-w-sm">
            <Search aria-hidden="true" className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input aria-label="搜尋商品" placeholder="輸入商品名稱、型號或 SKU" value={query}
              onChange={event => setQuery(event.target.value)} className="pl-9" />
          </label>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          {notice && <p role="status" className="text-sm font-medium text-primary">{notice}</p>}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-left text-sm">
            <thead className="bg-muted/60 text-muted-foreground">
              <tr>{["商品", "官網優惠價", "可售庫存", "上架狀態", "操作"].map(label =>
                <th key={label} scope="col" className="px-4 py-3 font-medium">{label}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map(product => {
                const listed = isListed(product);
                const canChange = product.is_active === true || product.listing_issues.length === 0;
                return (
                  <tr key={product.sku} className="border-t align-top">
                    <th scope="row" className="px-4 py-4 font-normal">
                      <div className="flex items-center gap-3">
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-muted">
                          {product.hero_image_url?.startsWith("/images/") ?
                            <img src={product.hero_image_url} alt="" className="size-12 rounded-md object-contain" /> :
                            <Package aria-hidden="true" className="size-5 text-muted-foreground" />}
                        </div>
                        <div>
                          <p className="font-medium">{product.name_zh_tw}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{product.commerce_sku}</p>
                        </div>
                      </div>
                    </th>
                    <td className="whitespace-nowrap px-4 py-4">
                      <p className="font-medium">{money(product.promo_twd)}</p>
                      <p className="mt-1 text-xs text-muted-foreground">零售 {money(product.retail_twd)}</p>
                    </td>
                    <td className="px-4 py-4 tabular-nums">{product.stock_quantity ?? "未設定"}</td>
                    <td className="px-4 py-4">
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${listed ? "bg-green-100 text-green-900" : "bg-muted text-foreground"}`}>
                        {listed ? "已上架" : "未上架"}
                      </span>
                      {product.listing_issues.length > 0 &&
                        <p className="mt-2 max-w-40 text-xs leading-relaxed text-amber-800">{product.listing_issues.join("、")}</p>}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Button size="sm" variant={product.is_active ? "outline" : "default"} disabled={!canChange}
                          onClick={() => start("listing", product)}>{product.is_active ? "下架" : "上架"}</Button>
                        <Button size="sm" variant="ghost" onClick={() => start("price", product)}>改價</Button>
                        <Button size="sm" variant="ghost" disabled={product.stock_quantity === null}
                          onClick={() => start("inventory", product)}>庫存</Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">
                {loading ? "正在讀取商品…" : error ? "目前無法顯示商品" : "找不到符合條件的商品"}
              </td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!editing} onOpenChange={open => { if (!open && !pending) setEditing(null); }}>
        {editing && (
          <DialogContent className="z-[80]">
            <DialogTitle>{action}</DialogTitle>
            <DialogDescription>{editing.product.name_zh_tw} · {editing.product.commerce_sku}</DialogDescription>
            <form className="space-y-4" onSubmit={event => { event.preventDefault(); void save(); }}>
              {editing.kind === "listing" && <p className="text-sm">
                {editing.product.is_active ? "下架後，商品會從前台商品列表移除，顧客也無法再加入購物車。" : "上架後，顧客可在前台看見商品。付款功能由商店設定控制。"}
              </p>}
              {editing.kind === "price" && priceFields.map(([field, label]) =>
                <label key={field} className="block space-y-1 text-sm">
                  <span>{label}（NT$）</span>
                  <Input required min={1} max={2147483647} step={1} type="number" value={editing.product[field]}
                    onChange={event => setEditing({ ...editing, product: { ...editing.product, [field]: Number(event.target.value) } })} />
                </label>)}
              {editing.kind === "inventory" && <label className="block space-y-1 text-sm">
                <span>庫存數量</span>
                <Input required min={0} max={2147483647} step={1} type="number" value={editing.product.stock_quantity ?? ""}
                  onChange={event => setEditing({ ...editing, product: { ...editing.product, stock_quantity: event.target.value === "" ? null : Number(event.target.value) } })} />
              </label>}
              {editing.kind !== "listing" && role === "super_admin" && (
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={direct} onChange={event => setDirect(event.target.checked)} />立即生效
                </label>
              )}
              <label className="block space-y-1 text-sm">
                <span>操作原因</span>
                <Input required minLength={3} maxLength={240} value={reason} onChange={event => setReason(event.target.value)} />
              </label>
              {dialogError && <p role="alert" className="text-sm text-destructive">{dialogError}</p>}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" disabled={pending} onClick={() => setEditing(null)}>取消</Button>
                <Button type="submit" disabled={pending || reason.trim().length < 3}>
                  {pending ? "處理中…" : editing.kind === "listing" ? `確認${action}` : direct ? "儲存變更" : "送審"}
                </Button>
              </div>
            </form>
          </DialogContent>
        )}
      </Dialog>
    </section>
  );
}
