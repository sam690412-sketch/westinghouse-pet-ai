import { Link } from "react-router";
import { PageLayout } from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Heart, Users, Zap, ArrowRight, Check } from "lucide-react";

export default function BrandStoryPage() {
  return (
    <PageLayout
      title="品牌故事"
      subtitle="用科技守護毛孩的每一天"
      breadcrumbs={[{ label: "品牌故事" }]}
    >
      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-background p-8 mb-10">
        <div className="relative z-10 max-w-2xl">
          <Badge variant="outline" className="mb-3">Westinghouse Pet Taiwan</Badge>
          <h2 className="text-2xl font-bold mb-3">台灣官方旗艦店</h2>
          <p className="text-muted-foreground leading-relaxed">
            Westinghouse 擁有超過 130 年的品牌歷史，始終致力於以創新科技改善生活品質。
            Westinghouse Pet 將這份精神延續到寵物領域，專注於研發智能寵物用品，
            讓每一位飼主都能輕鬆給予毛孩最好的照顧。
          </p>
        </div>
      </div>

      {/* Values */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        {[
          { icon: Zap, title: "智能創新", desc: "結合物聯網與AI技術，打造真正懂寵物的智慧產品" },
          { icon: Heart, title: "以寵為本", desc: "從寵物行為學與獸醫專業出發，設計最符合毛孩需求的產品" },
          { icon: Shield, title: "安全至上", desc: "嚴格品質控管，所有材質均通過安全檢測認證" },
          { icon: Users, title: "飼主共創", desc: "持續收集台灣飼主回饋，不斷優化產品設計與服務體驗" },
        ].map((v) => (
          <Card key={v.title} className="text-center">
            <CardContent className="p-5">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <v.icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold">{v.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{v.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Taiwan Operation */}
      <div className="grid md:grid-cols-2 gap-8 mb-10">
        <div>
          <h2 className="text-xl font-bold mb-4">台灣官方營運</h2>
          <ul className="space-y-3">
            {[
              "台灣獨家總代理，正品保障",
              "全系列產品一年原廠保固",
              "馬達核心部件延長至三年保固",
              "台灣本地客服團隊",
              "維修與換貨服務在地處理",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-muted-foreground">
                <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />{item}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl bg-muted overflow-hidden">
          <img src="/images/family-scene.jpg" alt="Westinghouse Pet 台灣官方" className="w-full h-full object-cover" />
        </div>
      </div>

      {/* CTA */}
      <div className="flex flex-wrap justify-center gap-4">
        <Link to="/trust/official-license"><Button variant="outline">官方授權說明 <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
        <Link to="/trust/warranty-commitment"><Button variant="outline">保固政策 <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
        <Link to="/products"><Button>探索商品</Button></Link>
      </div>
    </PageLayout>
  );
}
