import { env } from "@/lib/env";
import { useState } from "react";
import { ShieldCheck, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Heading } from "@/components/atomic/Typography";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const API_BASE = env.API_BASE;

export default function WarrantyRegister() {
  const [form, setForm] = useState({
    customerName: "", customerPhone: "", customerEmail: "",
    productSku: "", serialNumber: "", purchaseDate: "",
    purchaseChannel: "", orderNumber: "",
  });
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(""); setResult(null);
    if (!form.customerName || !form.customerPhone || !form.productSku || !form.purchaseDate) {
      setError("請填寫所有必填欄位"); return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/support/warranty-register`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.customerName, customerPhone: form.customerPhone,
          customerEmail: form.customerEmail || undefined, productSku: form.productSku,
          serialNumber: form.serialNumber || undefined, purchaseDate: form.purchaseDate,
          purchaseChannel: form.purchaseChannel || undefined, orderNumber: form.orderNumber || undefined,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "登錄失敗");
    } finally { setLoading(false); }
  };

  if (result) {
    return (
      <main className="mx-auto max-w-lg px-6 py-10 text-center">
        <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-success" />
        <Heading as="h1" variant="h2">保固登錄成功</Heading>
        <div className="mt-6 rounded-xl border border-border bg-card p-6 text-left">
          <p className="text-sm text-muted-foreground">保固編號</p>
          <p className="text-xl font-bold text-primary">{result.warranty_code as string}</p>
          <p className="mt-3 text-sm text-muted-foreground">產品</p>
          <p className="font-medium">{result.product_name as string}</p>
          <p className="mt-3 text-sm text-muted-foreground">到期日</p>
          <p className="font-medium">{result.expiry_date as string}</p>
          {!!result.duplicateWarning && (
            <div className="mt-3 flex gap-2 rounded-lg bg-warning/10 p-3 text-sm text-warning">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {String(result.duplicateWarning)}
            </div>
          )}
        </div>
        <Button className="mt-6" variant="outline" asChild><a href="/support">返回服務中心</a></Button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg px-6 py-10">
      <div className="mb-6 text-center">
        <ShieldCheck className="mx-auto mb-3 h-10 w-10 text-success" />
        <Heading as="h1" variant="h2">保固登錄</Heading>
      </div>

      {error && <div className="mb-4 rounded-lg bg-error/10 p-3 text-sm text-error">{error}</div>}

      <div className="space-y-4">
        <Field label="姓名 *" value={form.customerName} onChange={v => setForm(p => ({ ...p, customerName: v }))} />
        <Field label="電話 *" value={form.customerPhone} onChange={v => setForm(p => ({ ...p, customerPhone: v }))} placeholder="0912345678" />
        <Field label="Email" value={form.customerEmail} onChange={v => setForm(p => ({ ...p, customerEmail: v }))} type="email" />
        <Field label="產品 SKU *" value={form.productSku} onChange={v => setForm(p => ({ ...p, productSku: v }))} placeholder="如 WH-M81-TW" />
        <Field label="序號" value={form.serialNumber} onChange={v => setForm(p => ({ ...p, serialNumber: v }))} />
        <div>
          <label className="mb-1 block text-sm font-medium">購買日期 *</label>
          <Input type="date" value={form.purchaseDate} onChange={e => setForm(p => ({ ...p, purchaseDate: e.target.value }))} />
        </div>
        <Field label="購買通路" value={form.purchaseChannel} onChange={v => setForm(p => ({ ...p, purchaseChannel: v }))} placeholder="官網 / 蝦皮 / 實體店" />
        <Field label="訂單編號" value={form.orderNumber} onChange={v => setForm(p => ({ ...p, orderNumber: v }))} placeholder="選填" />

        <Button className="w-full" size="lg" disabled={loading} onClick={handleSubmit}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "提交登錄"}
        </Button>
      </div>
    </main>
  );
}

function Field({ label, value, onChange, type = "text", placeholder }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      <Input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}
