import { Link } from "react-router";
import { PageLayout } from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Droplets, MessageCircle, Phone, Wrench } from "lucide-react";

const accessories = [
  { name: "飲水機濾芯組（3入）", desc: "四重過濾，有效去除雜質與異味", price: 39000, icon: Droplets, image: "/images/products/d11ba-hero-banner.jpg" },
  { name: "不鏽鋼食盆", desc: "醫療級304不鏽鋼，抗菌易清潔", price: 29000, icon: Wrench, image: "/images/products/m81-hero-banner.jpg" },
  { name: "餵食器密封蓋", desc: "防潮密封設計，保持糧食新鮮", price: 19000, icon: Wrench, image: "/images/products/m12-hero-banner.jpg" },
];

export default function AccessoriesPage() {
  return (
    <PageLayout
      title="耗材配件"
      subtitle="原廠配件，確保產品長效運作"
      breadcrumbs={[{ label: "全部商品", href: "/products" }, { label: "耗材配件" }]}
    >
      {/* Accessories Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-10">
        {accessories.map((item) => (
          <Card key={item.name} className="overflow-hidden">
            <div className="aspect-[16/9] overflow-hidden bg-muted">
              <img src={item.image} alt={item.name} className="h-full w-full object-cover opacity-80" />
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold">{item.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
              <p className="text-lg font-bold text-primary mt-2">NT${(item.price / 100).toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter Replacement Guide */}
      <div className="rounded-xl bg-amber-50 border border-amber-200 p-6 mb-8">
        <h2 className="font-semibold text-lg mb-3 flex items-center gap-2">
          <Droplets className="h-5 w-5 text-amber-600" />
          濾芯更換指南
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { step: "1", title: "打開上蓋", desc: "輕輕掀起飲水機上蓋" },
            { step: "2", title: "取出舊濾芯", desc: "向上提起取出舊濾芯" },
            { step: "3", title: "裝入新濾芯", desc: "對準卡槽插入新濾芯即可" },
          ].map((s) => (
            <div key={s.step} className="flex items-start gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-200 text-sm font-bold text-amber-800 flex-shrink-0">{s.step}</span>
              <div>
                <p className="font-medium">{s.title}</p>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-sm text-amber-700 mt-4">建議每 4-6 週更換一次濾芯，以確保過濾效果。</p>
      </div>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 p-6 border border-primary/10">
        <div className="text-center sm:text-left">
          <h3 className="font-semibold">需要其他配件？</h3>
          <p className="text-sm text-muted-foreground">聯繫我們的客服團隊，為您確認適用配件</p>
        </div>
        <div className="flex gap-3">
          <Link to="/contact">
            <Button variant="outline"><Phone className="mr-2 h-4 w-4" />聯絡客服</Button>
          </Link>
          <a href="https://line.me/R/ti/p/@westinghousepet" target="_blank" rel="noopener noreferrer">
            <Button><MessageCircle className="mr-2 h-4 w-4" />LINE 諮詢</Button>
          </a>
        </div>
      </div>
    </PageLayout>
  );
}
