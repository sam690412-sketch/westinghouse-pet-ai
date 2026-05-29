import { env } from "@/lib/env";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Receipt,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Heading, Text } from "@/components/atomic/Typography";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const API_BASE =
  env.API_BASE;

/* ------------------------------------------------------------------ */
/*  TYPES                                                               */
/* ------------------------------------------------------------------ */

interface PaymentStatusData {
  orderNumber: string;
  orderStatus: string;
  paymentStatus: string | null;
  provider: string | null;
  amount: number | null;
  paidAt: string | null;
}

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                           */
/* ------------------------------------------------------------------ */

export default function PaymentStatus() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialOrder = searchParams.get("order") || "";

  const [orderNumber, setOrderNumber] = useState(initialOrder);
  const [inputValue, setInputValue] = useState(initialOrder);
  const [result, setResult] = useState<PaymentStatusData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-query if order number is in URL
  useEffect(() => {
    if (initialOrder) {
      doQuery(initialOrder);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doQuery = async (on: string) => {
    if (!on.trim()) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(
        `${API_BASE}/payments/status?orderNumber=${encodeURIComponent(on.trim())}`
      );
      const d = await res.json();
      if (d.error) throw new Error(d.error);
      setResult(d.data);
      // Update URL
      setSearchParams({ order: on.trim() });
    } catch (err) {
      setError(err instanceof Error ? err.message : "查詢失敗");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderNumber(inputValue);
    doQuery(inputValue);
  };

  const isPaid = result?.paymentStatus === "completed" || result?.paymentStatus === "success";
  const isFailed = result?.paymentStatus === "failed";
  const isPending = result && !isPaid && !isFailed;

  return (
    <main className="mx-auto max-w-2xl px-6 py-10 sm:px-12 lg:px-20">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Receipt className="h-8 w-8 text-primary" />
        </div>
        <Heading as="h1" variant="h2">
          付款狀態查詢
        </Heading>
        <Text variant="body" color="muted" className="mt-2">
          輸入訂單編號查詢最新付款狀態
        </Text>
      </div>

      {/* Search Form */}
      <form
        onSubmit={handleSubmit}
        className="mb-8 flex gap-2"
      >
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="輸入訂單編號 (如 WP-20260115-1234)"
          className="flex-1"
        />
        <Button type="submit" disabled={isLoading || !inputValue.trim()}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          查詢
        </Button>
      </form>

      {/* Error */}
      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-lg bg-error/10 px-4 py-3 text-sm text-error">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          {/* Status header */}
          <div className="mb-6 flex items-center gap-4">
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full",
                isPaid
                  ? "bg-success/10"
                  : isFailed
                    ? "bg-error/10"
                    : "bg-warning/10"
              )}
            >
              {isPaid ? (
                <CheckCircle2 className="h-6 w-6 text-success" />
              ) : isFailed ? (
                <AlertTriangle className="h-6 w-6 text-error" />
              ) : (
                <Clock className="h-6 w-6 text-warning" />
              )}
            </div>
            <div>
              <Heading as="h2" variant="h4">
                {isPaid
                  ? "付款成功"
                  : isFailed
                    ? "付款失敗"
                    : "等待付款"}
              </Heading>
              <Text variant="caption" color="muted">
                訂單編號：{result.orderNumber}
              </Text>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Details */}
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">訂單狀態</span>
              <OrderStatusLabel status={result.orderStatus} />
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">付款方式</span>
              <span>
                {result.provider === "newebpay"
                  ? "藍新金流 (NewebPay)"
                  : result.provider || "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">付款狀態</span>
              <PaymentStatusLabel status={result.paymentStatus} />
            </div>
            {result.amount !== null && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">付款金額</span>
                <span className="font-semibold">
                  NT${result.amount.toLocaleString()}
                </span>
              </div>
            )}
            {result.paidAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">付款時間</span>
                <span>{new Date(result.paidAt).toLocaleString("zh-TW")}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col gap-2">
            {isPending && (
              <Button className="w-full gap-2" asChild>
                <a href={`/orders/${result.orderNumber}`}>
                  前往付款 <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            )}
            <Button variant="outline" className="w-full" onClick={() => doQuery(orderNumber)}>
              <Clock className="mr-2 h-4 w-4" />
              重新整理
            </Button>
          </div>
        </div>
      )}

      {/* Empty state hint */}
      {!result && !isLoading && !error && (
        <div className="rounded-xl border border-dashed border-border bg-neutral-50 p-8 text-center text-sm text-muted-foreground">
          <Receipt className="mx-auto mb-3 h-8 w-8 opacity-40" />
          <p>輸入訂單編號即可查詢付款狀態</p>
          <p className="mt-1 text-xs">訂單編號格式：WP-YYYYMMDD-XXXX</p>
        </div>
      )}
    </main>
  );
}

/* ==================================================================== */
/*  HELPERS                                                             */
/* ==================================================================== */

function OrderStatusLabel({ status }: { status: string }) {
  const labels: Record<string, { text: string; className: string }> = {
    pending: { text: "待付款", className: "text-warning" },
    paid: { text: "已付款", className: "text-success" },
    failed: { text: "付款失敗", className: "text-error" },
    processing: { text: "處理中", className: "text-primary" },
    shipped: { text: "已出貨", className: "text-info" },
    completed: { text: "已完成", className: "text-success" },
    cancelled: { text: "已取消", className: "text-muted-foreground" },
  };
  const l = labels[status] || { text: status, className: "text-muted-foreground" };
  return <span className={cn("font-medium", l.className)}>{l.text}</span>;
}

function PaymentStatusLabel({ status }: { status: string | null }) {
  if (!status) return <span className="text-muted-foreground">未建立</span>;
  const labels: Record<string, { text: string; className: string }> = {
    pending: { text: "等待付款", className: "text-warning" },
    processing: { text: "處理中", className: "text-primary" },
    completed: { text: "付款成功", className: "text-success" },
    success: { text: "付款成功", className: "text-success" },
    failed: { text: "付款失敗", className: "text-error" },
    refunded: { text: "已退款", className: "text-muted-foreground" },
  };
  const l = labels[status] || { text: status, className: "text-muted-foreground" };
  return <span className={cn("font-medium", l.className)}>{l.text}</span>;
}
