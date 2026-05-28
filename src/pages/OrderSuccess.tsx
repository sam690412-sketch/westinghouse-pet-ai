import { env } from "@/lib/env";
import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useSearchParams } from "react-router";
import {
  CheckCircle2,
  ShoppingBag,
  Clock,
  ShieldCheck,
  Loader2,
  CreditCard,
  Bug,
  RefreshCw,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/hooks/useCart";
import { Heading, Text } from "@/components/atomic/Typography";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const API_BASE =
  env.API_BASE;

/* ------------------------------------------------------------------ */
/*  TYPES                                                               */
/* ------------------------------------------------------------------ */

interface OrderData {
  orderNumber: string;
  status: string;
  customer: {
    name: string;
    phone: string;
    email: string | null;
    address: Record<string, unknown> | null;
  };
  total: number;
  items: Array<{
    sku: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
  }>;
  payment: {
    provider: string;
    amount: number;
    currency: string;
    status: string;
  } | null;
  note: string | null;
  createdAt: string;
}

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

export default function OrderSuccess() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [searchParams] = useSearchParams();
  const isNew = searchParams.get("success") === "1";
  const { clearCart } = useCart();

  const [order, setOrder] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payStatus, setPayStatus] = useState<PaymentStatusData | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [isMocking, setIsMocking] = useState(false);
  const [pollCount, setPollCount] = useState(0);
  const [cartCleared, setCartCleared] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* -- Fetch order detail -- */
  useEffect(() => {
    if (!orderNumber) return;
    fetch(`${API_BASE}/orders/detail?orderNumber=${encodeURIComponent(orderNumber)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setOrder(d.data);
      })
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, [orderNumber]);

  /* -- Poll payment status -- */
  const pollPaymentStatus = useCallback(async () => {
    if (!orderNumber) return;
    try {
      const r = await fetch(
        `${API_BASE}/payments/status?orderNumber=${encodeURIComponent(orderNumber)}`
      );
      const d = await r.json();
      if (!d.error && d.data) {
        setPayStatus(d.data);
        setPollCount((c) => c + 1);
        // Stop polling if payment is settled
        if (d.data.paymentStatus === "success" || d.data.paymentStatus === "failed") {
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
          // Refresh order to get latest status
          const orderR = await fetch(
            `${API_BASE}/orders/detail?orderNumber=${encodeURIComponent(orderNumber)}`
          );
          const orderD = await orderR.json();
          if (!orderD.error) setOrder(orderD.data);
        }
      }
    } catch {
      /* ignore polling errors */
    }
  }, [orderNumber]);

  /* -- Start/stop polling -- */
  useEffect(() => {
    if (!order || order.status !== "pending") return;
    // Poll immediately
    pollPaymentStatus();
    // Then every 5 seconds, max 60 times (5 minutes)
    pollingRef.current = setInterval(() => {
      setPollCount((c) => {
        if (c >= 60 && pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
        return c;
      });
      pollPaymentStatus();
    }, 5000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [order?.status, order?.orderNumber, pollPaymentStatus]);

  /* -- Page title -- */
  useEffect(() => {
    const statusLabel =
      order?.status === "paid"
        ? "付款成功"
        : order?.status === "failed"
          ? "付款失敗"
          : "待付款";
    document.title = order
      ? `訂單 ${order.orderNumber} ${statusLabel} — Westinghouse Pet Taiwan`
      : "訂單確認 — Westinghouse Pet Taiwan";
  }, [order]);

  /* -- Navigate to NewebPay payment -- */
  const handlePayNow = async () => {
    if (!orderNumber) return;
    setIsPaying(true);
    try {
      const res = await fetch(`${API_BASE}/payments/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber }),
      });
      const html = await res.text();
      // Open NewebPay payment page in new window
      const w = window.open("", "_blank");
      if (w) {
        w.document.open();
        w.document.write(html);
        w.document.close();
      } else {
        // Fallback: inject form into current page
        const div = document.createElement("div");
        div.innerHTML = html;
        document.body.appendChild(div);
        const form = div.querySelector("form");
        form?.submit();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "付款頁面開啟失敗");
    } finally {
      setIsPaying(false);
    }
  };

  /* -- Mock payment (dev only) -- */
  const handleMockPay = async () => {
    if (!orderNumber) return;
    setIsMocking(true);
    try {
      const res = await fetch(`${API_BASE}/payments/mock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber }),
      });
      const d = await res.json();
      if (d.error) throw new Error(d.error);
      // Refresh status
      await pollPaymentStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "模擬付款失敗");
    } finally {
      setIsMocking(false);
    }
  };

  /* -- Status helpers -- */
  const isPaid = order?.status === "paid" || payStatus?.paymentStatus === "completed" || payStatus?.paymentStatus === "success";
  const isFailed = order?.status === "failed" || payStatus?.paymentStatus === "failed";
  const isPending = !isPaid && !isFailed;

  /* -- Clear cart on payment success -- */
  useEffect(() => {
    if (isPaid && !cartCleared) {
      clearCart();
      setCartCleared(true);
    }
  }, [isPaid, cartCleared, clearCart]);

  /* -- Loading -- */
  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  /* -- Error -- */
  if (error || !order) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <Text variant="bodyLarge" color="muted">
          {error || "找不到此訂單"}
        </Text>
        <Button className="mt-4" asChild>
          <a href="/">回到首頁</a>
        </Button>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-10 sm:px-12 lg:px-20">
      {/* ====== HEADER ====== */}
      <div className="mb-8 text-center">
        <div
          className={cn(
            "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full",
            isPaid
              ? "bg-success/10"
              : isFailed
                ? "bg-error/10"
                : isNew
                  ? "bg-success/10"
                  : "bg-primary/10"
          )}
        >
          {isPaid ? (
            <CheckCircle2 className="h-8 w-8 text-success" />
          ) : isFailed ? (
            <AlertTriangle className="h-8 w-8 text-error" />
          ) : isNew ? (
            <CheckCircle2 className="h-8 w-8 text-success" />
          ) : (
            <ShieldCheck className="h-8 w-8 text-primary" />
          )}
        </div>

        <Heading as="h1" variant="h2">
          {isPaid
            ? "付款成功！"
            : isFailed
              ? "付款失敗"
              : isNew
                ? "訂單建立成功！"
                : "訂單詳情"}
        </Heading>

        <Text variant="body" color="muted" className="mt-2">
          {isPaid
            ? "感謝您的購買，我們已確認您的付款"
            : isFailed
              ? "付款過程發生問題，請重新嘗試"
              : isNew
                ? "訂單已建立，請完成付款以確認訂單"
                : "以下是您的訂單資訊"}
        </Text>
      </div>

      {/* ====== ORDER CARD ====== */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        {/* Order number + Status */}
        <div className="flex items-center justify-between">
          <div>
            <Text variant="caption" color="muted">
              訂單編號
            </Text>
            <Text variant="bodyLarge" weight="bold" className="font-mono">
              {order.orderNumber}
            </Text>
          </div>
          <div className="text-right">
            <Text variant="caption" color="muted">
              訂單狀態
            </Text>
            <OrderStatusBadge status={order.status} />
          </div>
        </div>

        <Separator className="my-4" />

        {/* Payment status banner */}
        {isPending && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-warning/10 px-4 py-3 text-sm text-warning">
            <Clock className="h-4 w-4 shrink-0" />
            等待付款中... 請點擊下方「前往付款」按鈕完成信用卡付款
            {pollCount > 0 && (
              <span className="ml-auto text-xs text-muted-foreground">
                輪詢 #{pollCount}
              </span>
            )}
          </div>
        )}
        {isPaid && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-success/10 px-4 py-3 text-sm text-success">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            付款已確認，訂單處理中
          </div>
        )}
        {isFailed && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-error/10 px-4 py-3 text-sm text-error">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            付款未成功，請重新嘗試
          </div>
        )}

        {/* Items */}
        <div className="space-y-3">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 text-sm font-medium text-muted-foreground">
                  {item.quantity}x
                </div>
                <div>
                  <Text variant="label">{item.product_name}</Text>
                  <Text variant="caption" color="muted">
                    {item.sku}
                  </Text>
                </div>
              </div>
              <Text variant="label" weight="semibold">
                NT${item.subtotal.toLocaleString()}
              </Text>
            </div>
          ))}
        </div>

        <Separator className="my-4" />

        {/* Totals */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">商品小計</span>
            <span>NT${order.total.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">運費</span>
            <span className="text-success">免運</span>
          </div>
          <div className="flex justify-between text-base font-bold">
            <span>合計</span>
            <span className="text-primary">NT${order.total.toLocaleString()}</span>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Payment info */}
        {payStatus && (
          <>
            <div className="mb-3 space-y-1 text-sm">
              <Text variant="label" weight="semibold">
                付款資訊
              </Text>
              <div className="flex justify-between">
                <span className="text-muted-foreground">付款方式</span>
                <span>
                  {payStatus.provider === "newebpay"
                    ? "藍新金流 (NewebPay)"
                    : payStatus.provider || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">付款狀態</span>
                <PaymentStatusLabel status={payStatus.paymentStatus} />
              </div>
              {payStatus.paidAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">付款時間</span>
                  <span>{new Date(payStatus.paidAt).toLocaleString("zh-TW")}</span>
                </div>
              )}
            </div>
            <Separator className="my-4" />
          </>
        )}

        {/* Customer Info */}
        <div className="space-y-1 text-sm">
          <Text variant="label" weight="semibold">
            收件人資訊
          </Text>
          <p className="text-muted-foreground">{order.customer.name}</p>
          <p className="text-muted-foreground">{order.customer.phone}</p>
          {order.customer.email && (
            <p className="text-muted-foreground">{order.customer.email}</p>
          )}
          {order.customer.address && (
            <p className="text-muted-foreground">
              {(order.customer.address as Record<string, string>).city}
              {(order.customer.address as Record<string, string>).district}
              {(order.customer.address as Record<string, string>).line}
            </p>
          )}
        </div>

        {order.note && (
          <>
            <Separator className="my-4" />
            <div className="text-sm">
              <Text variant="label" weight="semibold">
                訂單備註
              </Text>
              <p className="text-muted-foreground">{order.note}</p>
            </div>
          </>
        )}
      </div>

      {/* ====== ACTION BUTTONS ====== */}
      <div className="mt-8 flex flex-col gap-3">
        {/* Pay Now — primary CTA when pending */}
        {isPending && (
          <Button
            size="lg"
            className="w-full gap-2 text-base font-semibold shadow-button"
            onClick={handlePayNow}
            disabled={isPaying}
          >
            {isPaying ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> 開啟付款頁面...
              </>
            ) : (
              <>
                <CreditCard className="h-5 w-5" /> 前往付款{" "}
                <ExternalLink className="h-4 w-4" />
              </>
            )}
          </Button>
        )}

        {/* Retry payment — when failed */}
        {isFailed && (
          <Button
            size="lg"
            className="w-full gap-2 text-base font-semibold shadow-button"
            onClick={handlePayNow}
            disabled={isPaying}
          >
            {isPaying ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <RefreshCw className="h-5 w-5" />
            )}
            重新付款
          </Button>
        )}

        {/* Mock Payment — dev testing only, shown as subtle option */}
        {isPending && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full gap-2 text-xs text-muted-foreground hover:text-foreground"
            onClick={handleMockPay}
            disabled={isMocking}
          >
            {isMocking ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Bug className="h-3.5 w-3.5" />
            )}
            模擬付款成功（開發測試）
          </Button>
        )}

        {/* Secondary CTAs */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button className="flex-1 gap-2" variant="outline" asChild>
            <a href="/products">
              <ShoppingBag className="h-4 w-4" /> 繼續購物
            </a>
          </Button>
          {isPaid && (
            <Button variant="outline" className="flex-1 gap-2">
              <ShieldCheck className="h-4 w-4" /> 註冊保固 (即將推出)
            </Button>
          )}
        </div>
      </div>

      {/* ====== HELP ====== */}
      <div className="mt-6 rounded-xl border border-border bg-neutral-50 p-4 text-center text-sm text-muted-foreground">
        如有問題請聯絡客服：
        <a href="tel:0800-000-000" className="text-primary hover:underline">
          0800-000-000
        </a>
      </div>
    </main>
  );
}

/* ==================================================================== */
/*  SUB-COMPONENTS                                                      */
/* ==================================================================== */

function OrderStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-warning/10 text-warning",
    paid: "bg-success/10 text-success",
    failed: "bg-error/10 text-error",
    processing: "bg-primary/10 text-primary",
    shipped: "bg-info/10 text-info",
    completed: "bg-success/10 text-success",
    cancelled: "bg-muted text-muted-foreground",
  };
  const labels: Record<string, string> = {
    pending: "待付款",
    paid: "已付款",
    failed: "付款失敗",
    processing: "處理中",
    shipped: "已出貨",
    completed: "已完成",
    cancelled: "已取消",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium",
        styles[status] || styles.pending
      )}
    >
      {status === "pending" && <Clock className="h-3.5 w-3.5" />}
      {labels[status] || status}
    </span>
  );
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
  return <span className={l.className}>{l.text}</span>;
}
