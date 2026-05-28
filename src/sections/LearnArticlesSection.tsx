import { ArrowRight, Clock, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLearnArticles } from "@/hooks/useCMS";
import { useStaggerAnimation } from "@/hooks/useScrollAnimation";
import { SectionTitle } from "@/components/atomic/SectionTitle";
import { Text } from "@/components/atomic/Typography";
import { Button } from "@/components/ui/button";

const categoryLabels: Record<string, string> = {
  getting_started: "新手入門",
  troubleshooting: "故障排除",
  maintenance: "保養維護",
  safety: "安全須知",
  buying_guide: "選購指南",
};

export function LearnArticlesSection() {
  const { data: articles, isLoading } = useLearnArticles(4);
  const stagger = useStaggerAnimation(articles.length, { threshold: 0.1 });

  return (
    <section className="px-6 py-16 sm:px-12 lg:px-20 lg:py-20" aria-label="知識文章">
      <div className="mx-auto max-w-7xl">
        <SectionTitle
          title="飼養知識庫"
          subtitle="專業建議與實用技巧，讓您更懂毛孩"
          align="center"
        />

        {isLoading ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <div className="skeleton aspect-[16/10] rounded-xl" />
                <div className="mt-3 space-y-2">
                  <div className="skeleton h-4 w-1/3" />
                  <div className="skeleton h-5 w-full" />
                  <div className="skeleton h-4 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div
              ref={stagger.ref}
              className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
            >
              {articles.map((article, i) => (
                <a
                  key={article.id}
                  href={`/learn/${article.slug}`}
                  className={cn(
                    "group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all hover:shadow-card-hover",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  )}
                  style={stagger.getDelayStyle(i)}
                >
                  {/* Cover */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
                    <div
                      className="h-full w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                      style={{
                        backgroundImage: article.cover_image_url
                          ? `url(${article.cover_image_url})`
                          : undefined,
                      }}
                      role="img"
                      aria-label={article.title}
                    />
                    {/* Category badge */}
                    <span className="absolute left-3 top-3 rounded-full bg-primary/90 px-2.5 py-0.5 text-xs font-medium text-primary-foreground backdrop-blur-sm">
                      {article.category ? (categoryLabels[article.category] ?? article.category) : "文章"}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col p-4">
                    <Text variant="label" weight="semibold" className="line-clamp-2 flex-1">
                      {article.title}
                    </Text>
                    <Text variant="caption" color="muted" className="mt-1.5 line-clamp-2">
                      {article.excerpt}
                    </Text>
                    <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                      {article.author && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {article.author}
                        </span>
                      )}
                      {article.read_time && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {article.read_time} 分鐘
                        </span>
                      )}
                    </div>
                  </div>
                </a>
              ))}
            </div>

            <div className="mt-10 text-center">
              <Button variant="outline" className="gap-2" asChild>
                <a href="/learn">
                  查看更多文章
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
