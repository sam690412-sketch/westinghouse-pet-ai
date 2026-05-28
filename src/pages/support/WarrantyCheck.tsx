import { env } from "@/lib/env";
import { useState } from "react";
import { Search, ShieldCheck, ShieldAlert, ShieldOff, Loader2 } from "lucide-react";
import { Heading } from "@/components/atomic/Typography";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const API_BASE = env.API_BASE;

interface WarrantyData {
  warranty_code: string;
  product_sku: string;
  product_name: string;
  serial_number: string | null;
  purchase_date: string;
  expiry_date: string;
  status: string;
  daysRemaining: number;
  customer_name: string;
}

export default function WarrantyCheck() {
  const [mode, setMode] = useState<"code" | "phone">("code");
  const [code, setCode] = useState("");
  const [phone, setPhone] = useState("");
  const [serial, setSerial] = useState("");
  const [result, setResult] = useState<WarrantyData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setError(""); setResult(null);
    if (mode === "code" && !code) { setError("請輸入保固編號"); return; }
    if (mode === "phone" && (!phone || !serial)) { setError("請輸入電話和序號"); return; }
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (mode === "code") params.set("code", code);
      else { params.set("phone", phone); params.set("serial", serial); }
      const res = await fetch(`${API_BASE}/support/warranty-check?${params.toString()}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "查詢失敗");
    } finally { setLoading(false); }
  };

  return (
    <main className="mx-auto max-w-lg px-6 py-10">
      <div className="mb-6 text-center">
        <ShieldCheck className="mx-auto mb-3 h-10 w-10 text-primary" />
        <Heading as="h1" variant="h2">保固查詢</Heading>
      </div>

      <div className="mb-4 flex gap-2">
        <Button variant={mode === "code" ? "default" : "outline"} size="sm" onClick={() => setMode("code")}>保固編號</Button>
        <Button variant={mode === "phone" ? "default" : "outline"} size="sm" onClick={() => setMode("phone")}>電話+序號</Button>
      </div>

      {error && <div className="mb-4 rounded-lg bg-error/10 p-3 text-sm text-error">{error}</div>}

      <div className="flex gap-2">
        {mode === "code" ? (
          <Input value={code} onChange={e => setCode(e.target.value)} placeholder="如 W-20260526-1234" className="flex-1" />
        ) : (
          <>
            <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="電話" className="flex-1" />
            <Input value={serial} onChange={e => setSerial(e.target.value)} placeholder="序號" className="flex-1" />
          </>
        )}
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </Button>
      </div>

      {result && <WarrantyResult data={result} />}
    </main>
  );
}

function WarrantyResult({ data }: { data: WarrantyData }) {
  const isActive = data.status === "active" && data.daysRemaining > 0;
  const isExpired = data.daysRemaining <= 0;
  const Icon = isActive ? ShieldCheck : isExpired ? ShieldOff : ShieldAlert;
  const color = isActive ? "text-success" : isExpired ? "text-error" : "text-warning";

  return (
    <div className="mt-6 rounded-xl border border-border bg-card p-6">
      <div className="mb-4 flex items-center gap-3">
        <Icon className={`h-8 w-8 ${color}`} />
        <div>
          <p className="text-sm text-muted-foreground">保固狀態</p>
          <p className={`font-semibold ${color}`}>
            {data.status === "active" ? "保固中" : data.status === "expired" ? "已過期" : "已使用"}
          </p>
        </div>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between"><span className="text-muted-foreground">保固編號</span><span className="font-mono">{data.warranty_code}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">產品</span><span>{data.product_name}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">SKU</span><span className="font-mono">{data.product_sku}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">購買日</span><span>{data.purchase_date}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">到期日</span><span>{data.expiry_date}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">剩餘天數</span>
          <span className={isActive ? "font-semibold text-success" : "text-error"}>
            {data.daysRemaining} 天
          </span>
        </div>
      </div>
    </div>
  );
}
