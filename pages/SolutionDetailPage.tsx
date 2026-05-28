import { Link, useParams } from "react-router";
import { PageLayout } from "@/components/PageLayout";
import { SOLUTIONS } from "@/data/solutions";
import { PRODUCTS } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, ArrowRight, Package } from "lucide-react";

export default function SolutionDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const solution = SOLUTIONS.find((s) => s.slug === slug);

  if (!solution) {
    return (
      <PageLayout title="指南頁面" breadcrumbs={[{ label: "使用指南", href: "/solutions" }, { label: "未找到" }]}>
        <div className="text-center py-12">
          <p className="text-muted-foreground">此指南頁面正在準備中</p>
          <Link to="/solutions"><Button className="mt-4">返回使用指南</Button></Link>
        </div>
      </PageLayout>
    );
  }

  const recommended = PRODUCTS.filter((p) => solution.recommendedProducts.includes(p.slug));

  return (
    <PageLayout
      title={solution.title}
      subtitle={solution.subtitle}
      breadcrumbs={[{ label: "使用指南", href: "/solutions" }, { label: solution.title }]}
    >
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pain Point */}
          <Card>
            <CardContent className="p-5">
              <h2 className="font-semibold text-lg mb-2 text-red-600 flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />困擾
              </h2>
              <p className="text-muted-foreground">{solution.painPoint}</p>
            </CardContent>
          </Card>

          {/* Solution */}
          <Card>
            <CardContent className="p-5">
              <h2 className="font-semibold text-lg mb-2 text-primary flex items-center gap-2">
                <Package className="h-5 w-5" />解決方案
              </h2>
              <p className="text-muted-foreground">{solution.solution}</p>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardContent className="p-5">
              <h2 className="font-semibold text-lg mb-3">實用技巧</h2>
              <ol className="space-y-2">
                {solution.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary flex-shrink-0">{i + 1}</span>
                    <span className="text-muted-foreground">{tip}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Recommended Products */}
        <div className="space-y-4">
          <h2 className="font-semibold">推薦商品</h2>
          {recommended.map((p) => (
            <Link key={p.slug} to={`/products/${p.slug}`} className="group block">
              <Card className="overflow-hidden transition-all hover:shadow-md">
                <div className="aspect-[16/9] overflow-hidden bg-muted">
                  <img src={p.image} alt={p.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                </div>
                <CardContent className="p-3">
                  <h3 className="font-medium text-sm group-hover:text-primary transition-colors">{p.name}</h3>
                  <p className="text-primary font-bold mt-1">NT${(p.price / 100).toLocaleString()}</p>
                </CardContent>
              </Card>
            </Link>
          ))}

          <Link to="/solutions">
            <Button variant="outline" className="w-full"><ArrowRight className="mr-2 h-4 w-4" />查看全部指南</Button>
          </Link>
        </div>
      </div>
    </PageLayout>
  );
}
