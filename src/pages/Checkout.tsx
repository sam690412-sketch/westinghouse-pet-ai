import { env } from "@/lib/env";
import { useState } from "react";
import { useNavigate } from "react-router";
import { ShoppingCart, ArrowRight, AlertTriangle, Truck, CreditCard, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/hooks/useCart";
import { Heading, Text } from "@/components/atomic/Typography";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

/* ================================================================
   CHECKOUT PAGE — /checkout
   Taiwan address format, phone validation, server-side pricing
   ================================================================ */

interface FormData {
  name: string;
  phone: string;
  email: string;
  city: string;
  district: string;
  address: string;
  note: string;
  agreeTerms: boolean;
}

interface FormErrors {
  name?: string;
  phone?: string;
  email?: string;
  city?: string;
  district?: string;
  address?: string;
  agreeTerms?: string;
}

const API_BASE =
  env.API_BASE;

function validatePhone(phone: string): boolean {
  return /^09\d{8}$/.test(phone) || /^0[2-8]\d{7,8}$/.test(phone);
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function Checkout() {
  const navigate = useNavigate();
  const { items, cartTotal, freeShippingProgress, clearCart } = useCart();
  const [form, setForm] = useState<FormData>({
    name: "", phone: "", email: "", city: "", district: "", address: "", note: "", agreeTerms: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Redirect if cart is empty
  if (items.length === 0 && !isSubmitting) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <ShoppingCart className="mb-4 h-16 w-16 text-muted-foreground" />
        <Heading as="h1" variant="h3">購物車是空的</Heading>
        <Text variant="body" color="muted" className="mt-2">您需要先有商品才能結帳</Text>
        <Button className="mt-6 gap-2" asChild>
          <a href="/products">瀏覽商品 <ArrowRight className="h-4 w-4" /></a>
        </Button>
      </div>
    );
  }

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.name.trim()) e.name = "請輸入收件人姓名";
    if (!form.phone.trim()) e.phone = "請輸入聯絡電話";
    else if (!validatePhone(form.phone.trim())) e.phone = "請輸入有效的台灣電話號碼 (如 0912345678)";
    if (form.email.trim() && !validateEmail(form.email.trim())) e.email = "請輸入有效的電子郵件地址";
    if (!form.city.trim()) e.city = "請輸入縣市";
    if (!form.district.trim()) e.district = "請輸入鄉鎮市區";
    if (!form.address.trim()) e.address = "請輸入詳細地址";
    if (!form.agreeTerms) e.agreeTerms = "請同意服務條款";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch(`${API_BASE}/orders/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ sku: i.sku, quantity: i.quantity })),
          customer: {
            name: form.name.trim(),
            phone: form.phone.trim(),
            email: form.email.trim() || undefined,
            address: { city: form.city.trim(), district: form.district.trim(), line: form.address.trim() },
          },
          note: form.note.trim() || undefined,
        }),
      });
      const result = await res.json();
      if (result.error) throw new Error(result.error);

      // Clear cart and redirect to success
      clearCart();
      navigate(`/orders/${result.data.orderNumber}?success=1`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "訂單建立失敗");
      setIsSubmitting(false);
    }
  };

  const inputClass = (field: keyof FormErrors) =>
    cn(errors[field] && "border-error focus-visible:ring-error");

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 sm:px-12 lg:px-20">
      <Heading as="h1" variant="h2" className="mb-8">結帳</Heading>

      <div className="grid gap-10 lg:grid-cols-5">
        {/* Left: Form */}
        <div className="lg:col-span-3 space-y-8">
          {/* Submit error */}
          {submitError && (
            <div className="flex items-center gap-2 rounded-lg bg-error/10 px-4 py-3 text-sm text-error">
              <AlertTriangle className="h-4 w-4 shrink-0" /> {submitError}
            </div>
          )}

          {/* Contact Info */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <Heading as="h2" variant="h4">聯絡資訊</Heading>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium">收件人姓名 *</label>
                <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="王大明" className={inputClass("name")} />
                {errors.name && <p className="mt-1 text-xs text-error">{errors.name}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">手機號碼 *</label>
                <Input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="0912345678" className={inputClass("phone")} />
                {errors.phone && <p className="mt-1 text-xs text-error">{errors.phone}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">電子郵件</label>
                <Input value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="name@example.com" className={inputClass("email")} />
                {errors.email && <p className="mt-1 text-xs text-error">{errors.email}</p>}
              </div>
            </div>
          </section>

          {/* Shipping Address */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              <Heading as="h2" variant="h4">配送地址</Heading>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium">縣市 *</label>
                <Input value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                  placeholder="台北市" className={inputClass("city")} />
                {errors.city && <p className="mt-1 text-xs text-error">{errors.city}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">鄉鎮市區 *</label>
                <Input value={form.district} onChange={(e) => setForm((p) => ({ ...p, district: e.target.value }))}
                  placeholder="信義區" className={inputClass("district")} />
                {errors.district && <p className="mt-1 text-xs text-error">{errors.district}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium">詳細地址 *</label>
                <Input value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                  placeholder="信義路五段7號10樓" className={inputClass("address")} />
                {errors.address && <p className="mt-1 text-xs text-error">{errors.address}</p>}
              </div>
            </div>
          </section>

          {/* Note */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <Heading as="h2" variant="h4">訂單備註</Heading>
            </div>
            <textarea
              value={form.note}
              onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
              placeholder="有什麼需要我們注意的嗎？"
              className="min-h-[80px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </section>

          {/* Terms */}
          <label className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
            <input
              type="checkbox"
              checked={form.agreeTerms}
              onChange={(e) => setForm((p) => ({ ...p, agreeTerms: e.target.checked }))}
              className="mt-0.5 h-4 w-4 rounded border-border text-primary"
            />
            <div>
              <Text variant="bodySmall">
                我已閱讀並同意 <a href="/terms" className="text-primary hover:underline" target="_blank">服務條款</a> 與{" "}
                <a href="/privacy" className="text-primary hover:underline" target="_blank">隱私權政策</a>
              </Text>
              {errors.agreeTerms && <p className="mt-1 text-xs text-error">{errors.agreeTerms}</p>}
            </div>
          </label>

          {/* Submit */}
          <Button
            size="lg"
            className="w-full gap-2 text-base font-semibold shadow-button"
            disabled={isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? "處理中..." : <>提交訂單 <ArrowRight className="h-5 w-5" /></>}
          </Button>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-2">
          <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <Heading as="h2" variant="h4" className="mb-4">訂單摘要</Heading>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" loading="lazy" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">無圖</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Text variant="label" className="line-clamp-1">{item.name}</Text>
                    <Text variant="caption" color="muted">x{item.quantity}</Text>
                  </div>
                  <Text variant="label" weight="semibold">NT${item.subtotal.toLocaleString()}</Text>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">商品小計</span>
                <span>NT${cartTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">運費</span>
                <span className={freeShippingProgress.qualifies ? "text-success" : ""}>
                  {freeShippingProgress.qualifies ? "免運" : "NT$100"}
                </span>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex items-center justify-between">
              <span className="text-base font-bold">合計</span>
              <span className="text-xl font-bold text-primary">
                NT${(cartTotal + (freeShippingProgress.qualifies ? 0 : 100)).toLocaleString()}
              </span>
            </div>

            <div className="mt-4 text-xs text-muted-foreground">
              <p>* 伺服器將重新計算價格，以最終訂單為準</p>
              <p>* 庫存以最終確認時為準</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
