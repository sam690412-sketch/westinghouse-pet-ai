import { Link } from "react-router";
import { PageLayout } from "@/components/PageLayout";
import { FEEDERS } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowRight, Check } from "lucide-react";

export default function FeederCategoryPage() {
  return (
    <PageLayout
      title="自動餵食器"
      subtitle="定時定量智慧餵食，出差旅行也不怕毛孩挨餓"
      breadcrumbs={[{ label: "全部商品", href: "/products" }, { label: "自動餵食器" }]}
    >
      {/* Buying Guide */}
      <div className="rounded-xl bg-primary/5 border border-primary/10 p-5 mb-8">
        <h2 className="font-semibold text-lg mb-2">選購指南</h2>
        <p className="text-sm text-muted-foreground">選擇餵食器時，建議考量容量需求、是否需濕糧支援、以及APP遠端操控功能。多貓家庭建議選購多檯分流餵食。</p>
      </div>

      {/* Product Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-10">
        {FEEDERS.map((p) => (
          <Link key={p.slug} to={`/products/${p.slug}`} className="group rounded-xl border border-border bg-card p-4 transition-all hover:shadow-lg hover:border-primary/30">
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted mb-3">
              <img src={p.image} alt={p.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              {p.badge && <Badge className="absolute top-2 left-2 bg-primary text-white">{p.badge}</Badge>}
            </div>
            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{p.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{p.tagline}</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-lg font-bold text-primary">NT${(p.price / 100).toLocaleString()}</span>
              {p.originalPrice && <span className="text-sm text-muted-foreground line-through">NT${(p.originalPrice / 100).toLocaleString()}</span>}
            </div>
            <div className="mt-3 flex flex-wrap gap-1">
              {p.features.map((f) => (
                <span key={f} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] text-primary">{f}</span>
              ))}
            </div>
          </Link>
        ))}
      </div>

      {/* Comparison Table */}
      <h2 className="text-xl font-bold mb-4">機型比較</h2>
      <div className="rounded-xl border border-border overflow-hidden mb-8">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>功能</TableHead>
              {FEEDERS.map((p) => (
                <TableHead key={p.slug} className="text-center">{p.name.split(" ")[0]}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {["鮮食+乾糧","APP遠端操控","語音錄音","視訊監控","扭蛋趣味餵食"].map((feature) => (
              <TableRow key={feature}>
                <TableCell className="font-medium">{feature}</TableCell>
                {FEEDERS.map((p) => {
                  const hasFeature = p.features.some((f) => f.includes(feature.replace(/\+/g, "").substring(0, 2)) || (feature === "視訊監控" && f.includes("全景")) || (feature === "扭蛋趣味餵食" && f.includes("扭蛋")));
                  return <TableCell key={p.slug} className="text-center">{hasFeature ? <Check className="h-4 w-4 text-emerald-500 mx-auto" /> : "—"}</TableCell>;
                })}
              </TableRow>
            ))}
            <TableRow>
              <TableCell className="font-medium">價格</TableCell>
              {FEEDERS.map((p) => (
                <TableCell key={p.slug} className="text-center font-bold text-primary">NT${(p.price / 100).toLocaleString()}</TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div className="text-center">
        <Link to="/products/water-dispensers">
          <Button variant="outline">看看飲水機 <ArrowRight className="ml-2 h-4 w-4" /></Button>
        </Link>
      </div>
    </PageLayout>
  );
}
