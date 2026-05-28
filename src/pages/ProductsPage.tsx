import { PageLayout } from "@/components/PageLayout";
import { Link } from "react-router";
import { PRODUCTS, FEEDERS, WATER_DISPENSERS } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
export default function ProductsPage() {
  return (
    <PageLayout
      title="全部商品"
      subtitle="Westinghouse Pet 全系列智能寵物用品"
      breadcrumbs={[{ label: "全部商品" }]}
    >
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Link to="/products">
          <Button variant="default" size="sm">全部商品 ({PRODUCTS.length})</Button>
        </Link>
        <Link to="/products/feeders">
          <Button variant="outline" size="sm">自動餵食器 ({FEEDERS.length})</Button>
        </Link>
        <Link to="/products/water-dispensers">
          <Button variant="outline" size="sm">寵物飲水機 ({WATER_DISPENSERS.length})</Button>
        </Link>
        <Link to="/products/accessories">
          <Button variant="outline" size="sm">耗材配件</Button>
        </Link>
      </div>

      {/* Product Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {PRODUCTS.map((p) => (
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
            <ul className="mt-3 space-y-1">
              {p.features.slice(0, 3).map((f) => (
                <li key={f} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="h-1 w-1 rounded-full bg-primary/60" />{f}
                </li>
              ))}
            </ul>
          </Link>
        ))}
      </div>
    </PageLayout>
  );
}
