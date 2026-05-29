import { Link, useParams } from "react-router-dom";
import { PageLayout } from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Award, CheckCircle, ArrowRight, Phone } from "lucide-react";

const trustContent: Record<string, { title: string; subtitle: string; icon: React.ElementType; sections: { title: string; items: string[] }[]; cta: { text: string; link: string } }> = {
  "official-license": {
    title: "官方授權",
    subtitle: "台灣獨家總代理，正品保障",
    icon: Shield,
    sections: [
      { title: "授權說明", items: ["Westinghouse Pet 台灣官方旗艦店為台灣地區獨家授權總代理","所有商品均為原廠正品，享有完整保固服務","未經授權之平行輸入商品無法享有原廠保固與售後服務"] },
      { title: "如何辨識正品", items: ["商品包裝印有 Westinghouse Pet 防偽標籤","每台產品皆有專屬序號可供官網驗證","隨貨附上中文說明書與台灣保固卡","由台灣本地倉庫出貨，非海外直寄"] },
      { title: "台灣本地服務", items: ["台灣本地倉儲與物流","中文客服團隊（週一至週五 09:00-18:00）","本地維修中心，無需寄回國外","符合台灣電器安全規範"] },
    ],
    cta: { text: "查看商品", link: "/products" },
  },
  "warranty-commitment": {
    title: "台灣保固",
    subtitle: "全系列一年原廠保固，馬達三年",
    icon: Award,
    sections: [
      { title: "保固範圍", items: ["全系列產品：一年原廠保固","馬達核心部件：延長至三年保固","保固期內非人為損壞免費維修或更換","包括零件費與維修人工費用"] },
      { title: "保固條件", items: ["須於購買後30天內完成保固登錄","保留原始購買憑證（發票或訂單）","非人為損壞、非自行拆解","使用原廠配件與濾芯"] },
      { title: "不保固範圍", items: ["人為損壞、摔落、進水","自行拆解或改裝","使用非原廠配件導致故障","消耗品（濾芯、電池等）","外觀磨損與正常使用痕跡"] },
    ],
    cta: { text: "保固登錄", link: "/support/warranty-register" },
  },
  "quality-certifications": {
    title: "品質承諾",
    subtitle: "嚴格品質控管，安全有保障",
    icon: CheckCircle,
    sections: [
      { title: "品質管理", items: ["全系列產品通過安全檢測","使用食品級與醫療級材質","電器產品符合台灣安規標準","每批產品均經過品質抽檢"] },
      { title: "材質安全", items: ["304不鏽鋼食盆：抗菌耐用","ABS環保機身：無毒無味","食品級矽膠密封件","電源供應器通過BSMI認證"] },
      { title: "持續改善", items: ["定期收集飼主使用回饋","與獸醫師合作優化產品設計","韌體持續更新優化功能","建立產品追蹤與改良機制"] },
    ],
    cta: { text: "了解品牌", link: "/brand/story" },
  },
};

export default function TrustPage() {
  const { slug } = useParams<{ slug: string }>();
  const content = trustContent[slug || ""];

  if (!content) {
    return (
      <PageLayout title="頁面" breadcrumbs={[{ label: "信任承諾" }]}>
        <div className="text-center py-12">
          <p className="text-muted-foreground">頁面內容準備中</p>
          <Link to="/brand/story"><Button className="mt-4">返回品牌故事</Button></Link>
        </div>
      </PageLayout>
    );
  }

  const Icon = content.icon;

  return (
    <PageLayout
      title={content.title}
      subtitle={content.subtitle}
      breadcrumbs={[{ label: "品牌故事", href: "/brand/story" }, { label: content.title }]}
    >
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Icon className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{content.title}</h2>
            <p className="text-muted-foreground">{content.subtitle}</p>
          </div>
        </div>

        <div className="space-y-6">
          {content.sections.map((section) => (
            <Card key={section.title}>
              <CardContent className="p-5">
                <h3 className="font-semibold text-lg mb-3">{section.title}</h3>
                <ul className="space-y-2">
                  {section.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />{item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-3 mt-8">
          <Link to={content.cta.link}><Button>{content.cta.text} <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
          <Link to="/contact"><Button variant="outline"><Phone className="mr-2 h-4 w-4" />聯絡客服</Button></Link>
        </div>
      </div>
    </PageLayout>
  );
}
