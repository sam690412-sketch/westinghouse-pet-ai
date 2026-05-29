import { useParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package, FileText, MessageCircle, HelpCircle } from "lucide-react";

const pageMeta: Record<string, { title: string; desc: string; icon: React.ReactNode; cta: string; ctaLink: string }> = {
  "/products": { title: "全部商品", desc: "瀏覽 Westinghouse Pet 全系列智能寵物用品", icon: <Package className="h-8 w-8" />, cta: "查看熱銷商品", ctaLink: "/" },
  "/products/feeders": { title: "自動餵食器", desc: "定時定量智慧餵食，出差旅行也不怕毛孩挨餓", icon: <Package className="h-8 w-8" />, cta: "查看 M81 餵食器", ctaLink: "/products/m81-fresh-food-feeder" },
  "/products/water-dispensers": { title: "寵物飲水機", desc: "循環過濾新鮮活水，讓毛孩愛上喝水", icon: <Package className="h-8 w-8" />, cta: "查看 D11-BA 飲水機", ctaLink: "/products/d11ba-water-dispenser" },
  "/products/accessories": { title: "耗材配件", desc: "原廠濾芯與配件，確保產品長效運作", icon: <Package className="h-8 w-8" />, cta: "查看飲水機濾芯", ctaLink: "/products/d11ba-water-dispenser" },
  "/solutions": { title: "使用指南", desc: "從飼主真實需求出發的專業指南", icon: <FileText className="h-8 w-8" />, cta: "瀏覽常見問題", ctaLink: "/faq" },
  "/brand/story": { title: "品牌故事", desc: "Westinghouse Pet 用科技守護毛孩的每一天", icon: <MessageCircle className="h-8 w-8" />, cta: "查看品牌介紹", ctaLink: "/brand" },
  "/trust/official-license": { title: "官方授權", desc: "台灣獨家總代理，正品保障", icon: <Package className="h-8 w-8" />, cta: "查看全部商品", ctaLink: "/products" },
  "/trust/warranty-commitment": { title: "台灣保固", desc: "全系列產品一年原廠保固，馬達核心部件延長至三年", icon: <HelpCircle className="h-8 w-8" />, cta: "保固登錄", ctaLink: "/support/warranty-register" },
  "/trust/quality-certifications": { title: "品質承諾", desc: "嚴格品質控管，通過多項國際認證", icon: <Package className="h-8 w-8" />, cta: "了解更多", ctaLink: "/brand" },
  "/support/faq": { title: "常見問題", desc: "付款、配送、保固、使用方式一次解答", icon: <HelpCircle className="h-8 w-8" />, cta: "聯絡客服", ctaLink: "/contact" },
};

export default function PlaceholderPage() {
  const { slug } = useParams<{ slug?: string }>();
  const location = useLocation();
  const path = location.pathname;

  // Try exact match first, then try without last segment
  const meta = pageMeta[path] || pageMeta[path.replace(/\/[^/]*$/, "")] || {
    title: slug ? decodeURIComponent(slug).replace(/-/g, " ") : "頁面",
    desc: "此頁面正在準備中，即將為您呈現完整內容",
    icon: <Package className="h-8 w-8" />,
    cta: "返回首頁",
    ctaLink: "/",
  };

  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-20 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
        {meta.icon}
      </div>

      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        {meta.title}
      </h1>

      <p className="mt-3 max-w-md text-muted-foreground">
        {meta.desc}
      </p>

      <p className="mt-2 text-sm text-muted-foreground/60">
        頁面內容即將上線，敬請期待
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button variant="outline" onClick={() => window.history.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回上一頁
        </Button>
        <Button asChild>
          <a href={meta.ctaLink}>{meta.cta}</a>
        </Button>
      </div>

      {/* Related product CTA */}
      <div className="mt-12 rounded-xl border border-border bg-card p-6 max-w-sm w-full">
        <p className="text-sm font-medium">推薦給您</p>
        <p className="mt-1 text-sm text-muted-foreground">
          先看看我們的熱銷商品
        </p>
        <Button className="mt-4 w-full" variant="secondary" asChild>
          <a href="/products/m81-fresh-food-feeder">M81 鮮濕糧智慧餵食器 →</a>
        </Button>
      </div>
    </main>
  );
}
