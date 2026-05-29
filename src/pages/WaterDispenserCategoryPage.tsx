import { Link } from "react-router-dom";
import { PageLayout } from "@/components/PageLayout";
import { WATER_DISPENSERS } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowRight, Check, Droplets } from "lucide-react";

export default function WaterDispenserCategoryPage() {
  return (
    <PageLayout
      title="寵物飲水機"
      subtitle="循環過濾新鮮活水，讓毛孩愛上喝水"
      breadcrumbs={[{ label: "全部商品", href: "/products" }, { label: "寵物飲水機" }]}
    >
      {/* Health Guide */}
      <div className="rounded-xl bg-blue-50 border border-blue-100 p-5 mb-8">
        <div className="flex items-start gap-3">
          <Droplets className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div>
            <h2 className="font-semibold text-lg mb-1">貓咪飲水健康指南</h2>
            <p className="text-sm text-muted-foreground">貓咪每天每公斤體重需要 40-60ml 水分。流動水能吸引貓咪增加飲水量，有效預防腎臟和泌尿道疾病。選擇有過濾功能的飲水機，確保水質潔淨。</p>
          </div>
        </div>
      </div>

      {/* Product Cards */}
      <div className="grid gap-6 sm:grid-cols-2 mb-10">
        {WATER_DISPENSERS.map((p) => (
          <Link key={p.slug} to={`/products/${p.slug}`} className="group rounded-xl border border-border bg-card p-4 transition-all hover:shadow-lg hover:border-primary/30">
            <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-muted mb-3">
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
                <span key={f} className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] text-blue-600">{f}</span>
              ))}
            </div>
          </Link>
        ))}
      </div>

      {/* Comparison */}
      <h2 className="text-xl font-bold mb-4">機型比較</h2>
      <div className="rounded-xl border border-border overflow-hidden mb-8">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>功能</TableHead>
              {WATER_DISPENSERS.map((p) => (
                <TableHead key={p.slug} className="text-center">{p.name.split(" ")[0]}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {["超靜音設計","四重過濾","不鏽鋼材質","水質監測","大容量"].map((feature) => (
              <TableRow key={feature}>
                <TableCell className="font-medium">{feature}</TableCell>
                {WATER_DISPENSERS.map((p) => {
                  const hasFeature = p.features.some((f) => f.includes(feature.substring(0, 2)) || (feature === "不鏽鋼材質" && f.includes("不鏽鋼")) || (feature === "大容量" && f.includes("容量")));
                  return <TableCell key={p.slug} className="text-center">{hasFeature ? <Check className="h-4 w-4 text-emerald-500 mx-auto" /> : "—"}</TableCell>;
                })}
              </TableRow>
            ))}
            <TableRow>
              <TableCell className="font-medium">價格</TableCell>
              {WATER_DISPENSERS.map((p) => (
                <TableCell key={p.slug} className="text-center font-bold text-primary">NT${(p.price / 100).toLocaleString()}</TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div className="text-center">
        <Link to="/products/feeders">
          <Button variant="outline">看看餵食器 <ArrowRight className="ml-2 h-4 w-4" /></Button>
        </Link>
      </div>
    </PageLayout>
  );
}
