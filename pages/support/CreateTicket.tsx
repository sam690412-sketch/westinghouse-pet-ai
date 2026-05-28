import { env } from "@/lib/env";
import { useState } from "react";
import { ClipboardList, Loader2, CheckCircle2 } from "lucide-react";
import { Heading } from "@/components/atomic/Typography";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const API_BASE = env.API_BASE;

const issueTypes = [
  { value: "defect", label: "產品瑕疵" },
  { value: "damage", label: "運輸損壞" },
  { value: "usage", label: "使用問題" },
  { value: "other", label: "其他" },
];

export default function CreateTicket() {
  const [form, setForm] = useState({
    customerName: "", customerEmail: "", customerPhone: "",
    productSku: "", serialNumber: "", warrantyCode: "",
    issueType: "defect", issueDescription: "",
  });
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(""); setResult(null);
    if (!form.customerName || !form.customerPhone || !form.issueDescription) {
      setError("請填寫所有必填欄位"); return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/support/tickets`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.customerName, customerEmail: form.customerEmail || undefined,
          customerPhone: form.customerPhone, productSku: form.productSku || undefined,
          serialNumber: form.serialNumber || undefined, warrantyCode: form.warrantyCode || undefined,
          issueType: form.issueType, issueDescription: form.issueDescription,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "提交失敗");
    } finally { setLoading(false); }
  };

  if (result) {
    return (
      <main className="mx-auto max-w-lg px-6 py-10 text-center">
        <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-success" />
        <Heading as="h1" variant="h2">工單已建立</Heading>
        <div className="mt-6 rounded-xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">工單編號</p>
          <p className="text-2xl font-bold text-primary">{result.ticket_number as string}</p>
          <p className="mt-3 text-sm text-muted-foreground">請記下此編號以查詢進度</p>
        </div>
        <Button className="mt-6" variant="outline" asChild><a href="/support">返回服務中心</a></Button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg px-6 py-10">
      <div className="mb-6 text-center">
        <ClipboardList className="mx-auto mb-3 h-10 w-10 text-warning" />
        <Heading as="h1" variant="h2">建立工單</Heading>
      </div>

      {error && <div className="mb-4 rounded-lg bg-error/10 p-3 text-sm text-error">{error}</div>}

      <div className="space-y-4">
        <Field label="姓名 *" value={form.customerName} onChange={v => setForm(p => ({ ...p, customerName: v }))} />
        <Field label="電話 *" value={form.customerPhone} onChange={v => setForm(p => ({ ...p, customerPhone: v }))} />
        <Field label="Email" value={form.customerEmail} onChange={v => setForm(p => ({ ...p, customerEmail: v }))} type="email" />
        <Field label="產品 SKU" value={form.productSku} onChange={v => setForm(p => ({ ...p, productSku: v }))} placeholder="如 WH-M81-TW" />
        <Field label="序號" value={form.serialNumber} onChange={v => setForm(p => ({ ...p, serialNumber: v }))} />
        <Field label="保固編號" value={form.warrantyCode} onChange={v => setForm(p => ({ ...p, warrantyCode: v }))} placeholder="選填" />

        <div>
          <label className="mb-1 block text-sm font-medium">問題類型 *</label>
          <select
            value={form.issueType}
            onChange={e => setForm(p => ({ ...p, issueType: e.target.value }))}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            {issueTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">問題描述 *</label>
          <textarea
            value={form.issueDescription}
            onChange={e => setForm(p => ({ ...p, issueDescription: e.target.value }))}
            rows={4}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            placeholder="請描述您遇到的問題"
          />
        </div>

        <Button className="w-full" size="lg" disabled={loading} onClick={handleSubmit}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "提交工單"}
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
