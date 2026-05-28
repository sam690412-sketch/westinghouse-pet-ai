import { env } from "@/lib/env";
import { useState } from "react";
import { Search, Loader2, Clock, CheckCircle2, Wrench, Truck, Package } from "lucide-react";
import { Heading, Text } from "@/components/atomic/Typography";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const API_BASE = env.API_BASE;

const statusIcons: Record<string, React.ElementType> = {
  new: Clock, processing: Clock, repairing: Wrench, shipping: Truck, completed: CheckCircle2, closed: Package,
};
const statusLabels: Record<string, string> = {
  new: "新工單", processing: "處理中", repairing: "維修中", shipping: "出貨中", completed: "已完成", closed: "已結案",
};
const statusColors: Record<string, string> = {
  new: "text-warning", processing: "text-info", repairing: "text-primary",
  shipping: "text-info", completed: "text-success", closed: "text-muted-foreground",
};

interface TicketData {
  ticket_number: string;
  customer_name: string;
  product_sku: string;
  issue_type: string;
  issue_description: string;
  status: string;
  priority: string;
  timeline: Array<{ status: string; note: string; timestamp: string }>;
  created_at: string;
  updated_at: string;
}

export default function RepairStatus() {
  const [ticketNumber, setTicketNumber] = useState("");
  const [result, setResult] = useState<TicketData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setError(""); setResult(null);
    if (!ticketNumber) { setError("請輸入工單編號"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/support/tickets/status?ticketNumber=${encodeURIComponent(ticketNumber)}`);
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
        <Wrench className="mx-auto mb-3 h-10 w-10 text-info" />
        <Heading as="h1" variant="h2">維修進度查詢</Heading>
      </div>

      {error && <div className="mb-4 rounded-lg bg-error/10 p-3 text-sm text-error">{error}</div>}

      <div className="flex gap-2">
        <Input value={ticketNumber} onChange={e => setTicketNumber(e.target.value)} placeholder="如 T-20260526-1234" className="flex-1" />
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </Button>
      </div>

      {result && <TicketResult data={result} />}
    </main>
  );
}

function TicketResult({ data }: { data: TicketData }) {
  const Icon = statusIcons[data.status] || Clock;
  const timeline = data.timeline || [];

  return (
    <div className="mt-6 rounded-xl border border-border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="font-mono text-lg font-bold">{data.ticket_number}</p>
          <p className="text-sm text-muted-foreground">{data.product_sku}</p>
        </div>
        <div className="flex items-center gap-2">
          <Icon className={`h-5 w-5 ${statusColors[data.status]}`} />
          <span className={`font-medium ${statusColors[data.status]}`}>{statusLabels[data.status] || data.status}</span>
        </div>
      </div>

      <div className="mb-4 text-sm">
        <p><span className="text-muted-foreground">問題類型:</span> {data.issue_type}</p>
        <p className="mt-1"><span className="text-muted-foreground">描述:</span> {data.issue_description}</p>
      </div>

      {/* Timeline */}
      <div className="border-t border-border pt-4">
        <Text variant="label" weight="semibold" className="mb-3">處理進度</Text>
        <div className="space-y-3">
          {timeline.length === 0 && <p className="text-sm text-muted-foreground">尚無進度更新</p>}
          {timeline.map((entry, i) => {
            const EntryIcon = statusIcons[entry.status] || Clock;
            return (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <EntryIcon className={`h-4 w-4 ${statusColors[entry.status] || ""}`} />
                  {i < timeline.length - 1 && <div className="mt-1 h-full w-px bg-border" />}
                </div>
                <div className="pb-3">
                  <p className="text-sm font-medium">{statusLabels[entry.status] || entry.status}</p>
                  <p className="text-xs text-muted-foreground">{entry.note}</p>
                  <p className="text-xs text-muted-foreground">{new Date(entry.timestamp).toLocaleString("zh-TW")}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
