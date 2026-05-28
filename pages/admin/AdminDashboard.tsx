import { useEffect } from "react";
import {
  ShoppingCart,
  CheckCircle2,
  Clock,
  DollarSign,
  AlertTriangle,
  Activity,
} from "lucide-react";
import { Heading, Text } from "@/components/atomic/Typography";
import { useAdminApi } from "./useAdminApi";

interface DashboardData {
  totalOrders: number;
  paidOrders: number;
  pendingPayments: number;
  revenue: number;
  lowStockCount: number;
  recentAudit: Array<{
    event_type: string;
    order_number: string | null;
    details: Record<string, unknown>;
    created_at: string;
  }>;
  recentOrders: Array<{
    order_number: string;
    status: string;
    customer_name: string;
    total_amount: number;
    created_at: string;
  }>;
}

const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning",
  paid: "bg-success/10 text-success",
  failed: "bg-error/10 text-error",
  shipped: "bg-info/10 text-info",
  completed: "bg-success/10 text-success",
  cancelled: "bg-muted text-muted-foreground",
};

const statusLabels: Record<string, string> = {
  pending: "待付款", paid: "已付款", failed: "付款失敗",
  shipped: "已出貨", completed: "已完成", cancelled: "已取消",
};

export default function AdminDashboard() {
  const { data, isLoading, error, fetchData } = useAdminApi<DashboardData>();

  useEffect(() => {
    fetchData("/admin/dashboard").catch(() => {});
  }, [fetchData]);

  if (isLoading) return <div className="py-12 text-center text-muted-foreground">載入中...</div>;
  if (error) return <div className="py-12 text-center text-error">錯誤: {error}</div>;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <Heading as="h1" variant="h2">儀表板</Heading>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard icon={ShoppingCart} label="總訂單" value={data.totalOrders} color="text-primary" />
        <StatCard icon={CheckCircle2} label="已付款" value={data.paidOrders} color="text-success" />
        <StatCard icon={Clock} label="待付款" value={data.pendingPayments} color="text-warning" />
        <StatCard icon={DollarSign} label="營業額" value={`NT$${(data.revenue / 1000).toFixed(0)}K`} color="text-info" />
        <StatCard icon={AlertTriangle} label="庫存不足" value={data.lowStockCount} color="text-error" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent orders */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <ShoppingCart className="h-4.5 w-4.5 text-primary" />
            <Heading as="h2" variant="h4">最近訂單</Heading>
          </div>
          <div className="space-y-2">
            {data.recentOrders.length === 0 && (
              <p className="text-sm text-muted-foreground">尚無訂單</p>
            )}
            {data.recentOrders.map((o) => (
              <div key={o.order_number} className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2">
                <div>
                  <p className="text-sm font-medium">{o.order_number}</p>
                  <p className="text-xs text-muted-foreground">{o.customer_name}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[o.status] || statusColors.pending}`}>
                    {statusLabels[o.status] || o.status}
                  </span>
                  <p className="mt-0.5 text-xs text-muted-foreground">NT${o.total_amount.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent audit */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Activity className="h-4.5 w-4.5 text-primary" />
            <Heading as="h2" variant="h4">最近稽核事件</Heading>
          </div>
          <div className="space-y-2">
            {data.recentAudit.length === 0 && (
              <p className="text-sm text-muted-foreground">尚無稽核記錄</p>
            )}
            {data.recentAudit.map((a, i) => (
              <div key={i} className="rounded-lg bg-neutral-50 px-3 py-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-primary">{a.event_type}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(a.created_at).toLocaleString("zh-TW")}
                  </span>
                </div>
                {a.order_number && <p className="text-xs text-muted-foreground">{a.order_number}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon, label, value, color,
}: {
  icon: React.ElementType; label: string; value: string | number; color: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <Icon className={`h-5 w-5 ${color}`} />
        <span className="text-2xl font-bold">{value}</span>
      </div>
      <Text variant="bodySmall" color="muted" className="mt-1">{label}</Text>
    </div>
  );
}
