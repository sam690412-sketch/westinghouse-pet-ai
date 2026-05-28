import { useState, useEffect, useCallback } from "react";
import { PageLayout } from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
// ScrollArea removed — not used in this page
import { env } from "@/lib/env";
import {
  Search, Plus, Pencil, Eye, EyeOff, AlertTriangle, Loader2,
  BookOpen, Sparkles, Filter, ChevronLeft, ChevronRight, Tag
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ================================================================ */
/*  TYPES                                                             */
/* ================================================================ */

interface KnowledgeEntry {
  id: string;
  category: string;
  question: string;
  answer: string;
  source_url?: string;
  tags?: string[];
  enabled: boolean;
  priority: number;
  escalation_note?: string;
  created_at: string;
  updated_at: string;
}

const CATEGORIES = [
  { value: "", label: "全部" },
  { value: "product", label: "產品" },
  { value: "warranty", label: "保固" },
  { value: "shipping", label: "配送" },
  { value: "payment", label: "付款" },
  { value: "repair", label: "維修" },
  { value: "filter", label: "濾芯" },
  { value: "setup", label: "設定" },
  { value: "refund", label: "退換貨" },
  { value: "brand", label: "品牌" },
];

/* ================================================================ */
/*  COMPONENT                                                         */
/* ================================================================ */

export default function AiKnowledgePage() {
  const [items, setItems] = useState<KnowledgeEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<KnowledgeEntry | null>(null);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    category: "product",
    question: "",
    answer: "",
    source_url: "",
    tags: "",
    priority: "0",
    enabled: true,
    escalation_note: "",
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (category) params.set("category", category);
      if (search) params.set("search", search);
      params.set("page", String(page));
      params.set("limit", "20");

      const res = await fetch(`${env.API_BASE}/admin/ai/knowledge?${params.toString()}`, {
        headers: { "X-Admin-Secret": localStorage.getItem("admin_secret") || "" },
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setItems(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "載入失敗");
      // Fallback: show empty state
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [category, search, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditingItem(null);
    setForm({
      category: "product", question: "", answer: "", source_url: "",
      tags: "", priority: "0", enabled: true, escalation_note: "",
    });
    setDialogOpen(true);
  };

  const openEdit = (item: KnowledgeEntry) => {
    setEditingItem(item);
    setForm({
      category: item.category,
      question: item.question,
      answer: item.answer,
      source_url: item.source_url || "",
      tags: item.tags?.join(", ") || "",
      priority: String(item.priority),
      enabled: item.enabled,
      escalation_note: item.escalation_note || "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.question.trim() || !form.answer.trim()) return;

    try {
      const body = {
        ...(editingItem ? { id: editingItem.id } : {}),
        category: form.category,
        question: form.question.trim(),
        answer: form.answer.trim(),
        source_url: form.source_url.trim() || undefined,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        priority: parseInt(form.priority, 10),
        enabled: form.enabled,
        escalation_note: form.escalation_note.trim() || undefined,
      };

      const res = await fetch(`${env.API_BASE}/admin/ai/knowledge${editingItem ? "/update" : ""}`, {
        method: editingItem ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Secret": localStorage.getItem("admin_secret") || "",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("儲存失敗");
      setDialogOpen(false);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "儲存失敗");
    }
  };

  const toggleEnabled = async (item: KnowledgeEntry) => {
    try {
      await fetch(`${env.API_BASE}/admin/ai/knowledge/update`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Secret": localStorage.getItem("admin_secret") || "",
        },
        body: JSON.stringify({ id: item.id, enabled: !item.enabled }),
      });
      fetchData();
    } catch { /* ignore */ }
  };

  const totalPages = Math.ceil(total / 20);
  const categoryColor: Record<string, string> = {
    product: "bg-blue-100 text-blue-700",
    warranty: "bg-green-100 text-green-700",
    shipping: "bg-amber-100 text-amber-700",
    payment: "bg-purple-100 text-purple-700",
    repair: "bg-red-100 text-red-700",
    filter: "bg-cyan-100 text-cyan-700",
    setup: "bg-slate-100 text-slate-700",
    refund: "bg-orange-100 text-orange-700",
    brand: "bg-pink-100 text-pink-700",
  };

  return (
    <PageLayout
      title="AI 知識庫管理"
      subtitle={`共 ${total} 條知識，管理 AI 客服回答內容`}
      breadcrumbs={[{ label: "管理後台", href: "/admin" }, { label: "AI 知識庫" }]}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="搜尋問題或回答..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
        <Select value={category} onValueChange={(v) => { setCategory(v); setPage(1); }}>
          <SelectTrigger className="w-[140px]">
            <Filter className="h-4 w-4 mr-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={openCreate}>
          <Plus className="mr-1 h-4 w-4" />新增
        </Button>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          {error} — 顯示離線模式（資料未同步）
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <BookOpen className="mx-auto h-10 w-10 mb-3 opacity-40" />
          <p>尚無知識庫資料</p>
          <p className="text-sm mt-1">點擊「新增」建立第一條知識，或確認 API 連線</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <Card key={item.id} className={cn("transition-all", !item.enabled && "opacity-60")}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={cn("text-[10px]", categoryColor[item.category] || "bg-slate-100")}>
                        {CATEGORIES.find((c) => c.value === item.category)?.label || item.category}
                      </Badge>
                      {!item.enabled && (
                        <Badge variant="outline" className="text-[10px]">已停用</Badge>
                      )}
                      {item.escalation_note && (
                        <Badge variant="outline" className="text-[10px] border-red-200 text-red-600">
                          <AlertTriangle className="h-3 w-3 mr-0.5" />
                          需升級
                        </Badge>
                      )}
                    </div>
                    <p className="font-medium text-sm mt-1.5 truncate">{item.question}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.answer}</p>
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {item.tags.map((tag) => (
                          <span key={tag} className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                            <Tag className="h-3 w-3" />{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => toggleEnabled(item)}
                      className="rounded p-1.5 text-muted-foreground hover:bg-accent transition-colors"
                      title={item.enabled ? "停用" : "啟用"}
                    >
                      {item.enabled ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => openEdit(item)}
                      className="rounded p-1.5 text-muted-foreground hover:bg-accent transition-colors"
                      title="編輯"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            第 {page} / {totalPages} 頁
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              {editingItem ? "編輯知識" : "新增知識"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium">分類</label>
              <Select value={form.category} onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.filter((c) => c.value).map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">問題 *</label>
              <Input
                value={form.question}
                onChange={(e) => setForm((p) => ({ ...p, question: e.target.value }))}
                placeholder="使用者可能問的問題..."
              />
            </div>

            <div>
              <label className="text-sm font-medium">回答 *</label>
              <Textarea
                value={form.answer}
                onChange={(e) => setForm((p) => ({ ...p, answer: e.target.value }))}
                placeholder="AI 客服的回答內容..."
                rows={5}
              />
            </div>

            <div>
              <label className="text-sm font-medium">來源網址（選填）</label>
              <Input
                value={form.source_url}
                onChange={(e) => setForm((p) => ({ ...p, source_url: e.target.value }))}
                placeholder="/faq 或 https://..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">標籤（逗號分隔）</label>
                <Input
                  value={form.tags}
                  onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
                  placeholder="飲水機, D11-BA"
                />
              </div>
              <div>
                <label className="text-sm font-medium">優先級</label>
                <Input
                  type="number"
                  value={form.priority}
                  onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">升級備註（選填）</label>
              <Textarea
                value={form.escalation_note}
                onChange={(e) => setForm((p) => ({ ...p, escalation_note: e.target.value }))}
                placeholder="遇到此問題時需升級給人工客服的說明..."
                rows={2}
              />
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={form.enabled}
                onCheckedChange={(v) => setForm((p) => ({ ...p, enabled: v }))}
              />
              <span className="text-sm">啟用此知識</span>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
            <Button onClick={handleSave} disabled={!form.question.trim() || !form.answer.trim()}>
              {editingItem ? "儲存變更" : "建立"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
