import { Link, useParams } from "react-router";
import { PageLayout } from "@/components/PageLayout";
import { FAQ_TOPICS } from "@/data/faq";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle, CreditCard, Truck, Shield, Settings, Droplets, MessageCircle } from "lucide-react";

const topicIcons: Record<string, React.ElementType> = {
  payment: CreditCard, shipping: Truck, warranty: Shield,
  "product-usage": Settings, "filter-replacement": Droplets,
};

export default function FAQPage() {
  const { slug } = useParams<{ slug?: string }>();

  if (!slug) {
    // FAQ landing page
    return (
      <PageLayout
        title="常見問題"
        subtitle="付款、配送、保固、使用方式一次解答"
        breadcrumbs={[{ label: "常見問題" }]}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          {FAQ_TOPICS.map((topic) => {
            const Icon = topicIcons[topic.slug] || HelpCircle;
            return (
              <Link key={topic.slug} to={`/faq/${topic.slug}`} className="group">
                <Card className="h-full transition-all hover:shadow-lg hover:border-primary/30">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold group-hover:text-primary transition-colors">{topic.label}</h3>
                        <p className="text-sm text-muted-foreground">{topic.items.length} 個常見問題</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* General FAQ Accordion */}
        <h2 className="text-xl font-bold mb-4">熱門問題</h2>
        <Card>
          <CardContent className="p-5">
            <Accordion type="multiple" defaultValue={["q0"]}>
              {FAQ_TOPICS.flatMap((t) => t.items).slice(0, 6).map((item, i) => (
                <AccordionItem key={i} value={`q${i}`}>
                  <AccordionTrigger className="text-left">{item.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <p className="text-muted-foreground mb-3">找不到答案？直接聯繫我們</p>
          <Link to="/contact"><Button><MessageCircle className="mr-2 h-4 w-4" />聯絡客服</Button></Link>
        </div>
      </PageLayout>
    );
  }

  // Topic detail page
  const topic = FAQ_TOPICS.find((t) => t.slug === slug);
  if (!topic) {
    return (
      <PageLayout title="FAQ" breadcrumbs={[{ label: "常見問題", href: "/faq" }, { label: "未找到" }]}>
        <div className="text-center py-12">
          <p className="text-muted-foreground">此分類正在準備中</p>
          <Link to="/faq"><Button className="mt-4">返回常見問題</Button></Link>
        </div>
      </PageLayout>
    );
  }

  const Icon = topicIcons[topic.slug] || HelpCircle;

  return (
    <PageLayout
      title={topic.label}
      subtitle={`${topic.items.length} 個常見問題`}
      breadcrumbs={[{ label: "常見問題", href: "/faq" }, { label: topic.label }]}
    >
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <h2 className="font-semibold text-lg">{topic.label}</h2>
          </div>
          <Accordion type="multiple">
            {topic.items.map((item, i) => (
              <AccordionItem key={i} value={`q${i}`}>
                <AccordionTrigger className="text-left">{item.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <div className="flex justify-between mt-6">
        <Link to="/faq"><Button variant="outline">返回分類</Button></Link>
        <Link to="/contact"><Button variant="outline"><MessageCircle className="mr-2 h-4 w-4" />還有疑問</Button></Link>
      </div>
    </PageLayout>
  );
}
