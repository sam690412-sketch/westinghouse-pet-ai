import {
  ShieldCheck,
  Search,
  Wrench,
  MessageCircleQuestion,
  MessageSquare,
  ClipboardList,
} from "lucide-react";
import { Heading, Text } from "@/components/atomic/Typography";
import { Button } from "@/components/ui/button";

const cards = [
  {
    icon: ShieldCheck,
    title: "保固登錄",
    desc: "登錄您的產品以獲得保固服務",
    href: "/support/warranty-register",
    color: "text-success",
  },
  {
    icon: Search,
    title: "保固查詢",
    desc: "查詢您的保固狀態與到期日",
    href: "/support/warranty-check",
    color: "text-primary",
  },
  {
    icon: Wrench,
    title: "維修進度",
    desc: "查詢送修產品的處理進度",
    href: "/support/repair-status",
    color: "text-info",
  },
  {
    icon: ClipboardList,
    title: "建立工單",
    desc: "回報產品問題或申請維修",
    href: "/support/create-ticket",
    color: "text-warning",
  },
  {
    icon: MessageCircleQuestion,
    title: "常見問題",
    desc: "查看常見問題與解答",
    href: "/learn",
    color: "text-muted-foreground",
  },
  {
    icon: MessageSquare,
    title: "LINE 客服",
    desc: "透過 LINE 聯繫我們的客服團隊",
    href: "#",
    color: "text-success",
    placeholder: true,
  },
];

export default function SupportLanding() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-8 text-center">
        <Heading as="h1" variant="h2">售後服務中心</Heading>
        <Text variant="body" color="muted" className="mt-2">
          Westinghouse Pet Taiwan 為您提供完整的售後支援
        </Text>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <a
            key={card.title}
            href={card.href}
            onClick={card.placeholder ? (e) => { e.preventDefault(); alert("LINE 客服即將推出"); } : undefined}
            className="group flex flex-col items-center rounded-2xl border border-border bg-card p-6 text-center shadow-sm transition-all hover:shadow-md hover:border-primary/30"
          >
            <card.icon className={`h-10 w-10 ${card.color} mb-3 transition-transform group-hover:scale-110`} />
            <Heading as="h3" variant="h4">{card.title}</Heading>
            <Text variant="bodySmall" color="muted" className="mt-1">{card.desc}</Text>
            <Button variant="ghost" size="sm" className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
              前往 →
            </Button>
          </a>
        ))}
      </div>

      <div className="mt-10 rounded-xl border border-border bg-neutral-50 p-6 text-center text-sm text-muted-foreground">
        <p>客服專線：<a href="tel:0800-000-000" className="text-primary hover:underline">0800-000-000</a></p>
        <p className="mt-1">服務時間：週一至週五 09:00 - 18:00</p>
      </div>
    </main>
  );
}
