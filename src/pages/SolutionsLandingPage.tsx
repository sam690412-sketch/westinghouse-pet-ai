import { Link } from "react-router";
import { PageLayout } from "@/components/PageLayout";
import { SOLUTIONS } from "@/data/solutions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Droplets, Users, Briefcase, Refrigerator, HeartPulse, Cat } from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  droplets: Droplets, users: Users, briefcase: Briefcase,
  refrigerator: Refrigerator, "heart-pulse": HeartPulse, cat: Cat,
};

export default function SolutionsLandingPage() {
  return (
    <PageLayout
      title="使用指南"
      subtitle="從飼主真實需求出發的專業指南"
      breadcrumbs={[{ label: "使用指南" }]}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SOLUTIONS.map((s) => {
          const Icon = iconMap[s.icon] || Cat;
          return (
            <Link key={s.slug} to={`/solutions/${s.slug}`} className="group">
              <Card className="h-full transition-all hover:shadow-lg hover:border-primary/30">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold group-hover:text-primary transition-colors">{s.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{s.subtitle}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {s.recommendedProducts.map((slug) => (
                          <Badge key={slug} variant="outline" className="text-[10px]">
                            {slug.includes("m81") ? "M81" : slug.includes("m12") ? "M12" : slug.includes("m31") ? "M31" : slug.includes("d11") ? "D11-BA" : "D61"}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </PageLayout>
  );
}
