import { MessageCircle, Clock, CheckCheck, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Heading, Text } from "@/components/atomic/Typography";
import { useState } from "react";

/* ------------------------------------------------------------------ */
/*  TYPES                                                              */
/* ------------------------------------------------------------------ */

interface LineMessage {
  type: "customer" | "service";
  content: string;
  time: string;
  read?: boolean;
}

interface LineConversation {
  id: string;
  title: string;
  subtitle: string;
  avatar: string;
  messages: LineMessage[];
  image?: string;
}

/* ------------------------------------------------------------------ */
/*  DATA — Authentic LINE conversations                                */
/* ------------------------------------------------------------------ */

const conversations: LineConversation[] = [
  {
    id: "lc1",
    title: "濾芯更換諮詢",
    subtitle: "新手飼主的疑問",
    avatar: "🐱",
    messages: [
      { type: "customer", content: "哈囉～想請問飲水機的濾芯多久要換一次呀？", time: "14:23" },
      { type: "service", content: "嗨！一般建議 4-6 週更換一次唷 💧\n不過如果家裡貓咪比較多，可以 3-4 週就換，水質會更乾淨～", time: "14:24" },
      { type: "customer", content: "了解！那濾芯要怎麼買呢？", time: "14:25" },
      { type: "service", content: "直接在我們官網下單就可以囉！滿 $1500 免運，買 6 入組還有 85 折 🎉\n我傳連結給你～", time: "14:26", read: true },
    ],
  },
  {
    id: "lc2",
    title: "使用回饋",
    subtitle: "真實飼主反饋",
    avatar: "💕",
    image: "/images/line-chat-feedback.jpg",
    messages: [
      { type: "customer", content: "跟你們回報！用了兩個禮拜，我家貓咪喝水量真的變多了 🐱💦", time: "20:15" },
      { type: "customer", content: "之前獸醫說牠喝太少要留意腎臟，現在我每天看 APP 紀錄都安心多了", time: "20:16" },
      { type: "service", content: "太好了！！聽到貓咪健康改善我們也超開心的 🥹✨\n謝謝你的回饋，這就是我們做產品的動力！", time: "20:18", read: true },
      { type: "customer", content: "已經推薦給貓咪社團的朋友了，有人問我哪裡買的哈哈", time: "20:20" },
      { type: "service", content: "太感謝了 🙏 朋友來買報你的名字，我們送濾芯一盒！", time: "20:21", read: true },
    ],
  },
  {
    id: "lc3",
    title: "安裝教學",
    subtitle: "5分鐘快速上手",
    avatar: "🔧",
    messages: [
      { type: "customer", content: "請問餵食器要怎麼設定 WiFi 呀？我弄了好久都不行 😅", time: "10:42" },
      { type: "service", content: "別擔心！很多人第一次都會遇到～ 我一步一步帶你 🙌", time: "10:43" },
      { type: "service", content: "1️⃣ 先長按機器背面的按鈕 5 秒，看到藍燈閃爍\n2️⃣ 打開 APP 點「新增設備」\n3️⃣ 選你的 WiFi 名稱，輸入密碼\n4️⃣ 等 30 秒就連好了！", time: "10:44" },
      { type: "customer", content: "成功了！！原來是我沒長按到 5 秒 😂", time: "10:48" },
      { type: "service", content: "太棒了！有任何問題隨時找我们唷 💚\n對了，建議先設 3-4 餐少量，讓貓咪適應新食盆～", time: "10:49", read: true },
    ],
  },
  {
    id: "lc4",
    title: "回購諮詢",
    subtitle: "老客戶再回購",
    avatar: "🛒",
    messages: [
      { type: "customer", content: "你好！之前買的 D61 用了半年很滿意，想再買一台 M12 餵食器給新養的第二隻貓 🐱", time: "16:30" },
      { type: "service", content: "哇！恭喜多了個毛孩家人 🎉\n老客戶回購有 95 折優惠唷！", time: "16:31" },
      { type: "customer", content: "太好了！那組合買會更划算嗎？", time: "16:32" },
      { type: "service", content: "有的！M12 + D11-BA 組合現省 $2,000，兩隻貓各一台剛剛好 💰\n我幫你算一下... 組合價 $5,560，老客戶再 95 折 = $5,282！", time: "16:34", read: true },
      { type: "customer", content: "下單了！感謝～快速到貨喔 😊", time: "16:40" },
      { type: "service", content: "收到！明天幫你出貨，預計後天到 🚚\n謝謝再次支持！", time: "16:41", read: true },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                          */
/* ------------------------------------------------------------------ */

export function LineConversationSection() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation({ threshold: 0.2 });
  const [activeId, setActiveId] = useState(conversations[0].id);
  const active = conversations.find((c) => c.id === activeId)!;

  return (
    <section
      className="bg-neutral-50 px-6 py-16 sm:px-12 lg:px-20 lg:py-20"
      aria-label="LINE 真人客服"
    >
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div
          ref={headerRef}
          className={cn(
            "mb-10 text-center transition-all duration-700",
            headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          <Text variant="overline" className="text-primary">
            REAL HUMAN SUPPORT
          </Text>
          <Heading as="h2" variant="h2" className="mt-2">
            有問題？真人客服在線等你
          </Heading>
          <Text variant="body" color="muted" className="mx-auto mt-3 max-w-xl">
            不是機器人，是真正有養貓經驗的客服夥伴。LINE 一對一即時回覆。
          </Text>
        </div>

        {/* Layout: Tabs + Chat */}
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Conversation List */}
          <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setActiveId(conv.id)}
                className={cn(
                  "flex shrink-0 items-start gap-3 rounded-xl border p-3 text-left transition-all",
                  "lg:w-full",
                  activeId === conv.id
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border bg-card hover:border-primary/30"
                )}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg">
                  {conv.avatar}
                </span>
                <div className="min-w-0">
                  <Text variant="label" weight="semibold" className="line-clamp-1">
                    {conv.title}
                  </Text>
                  <Text variant="caption" color="muted" className="line-clamp-1">
                    {conv.subtitle}
                  </Text>
                </div>
              </button>
            ))}

            {/* Contact CTA */}
            <a
              href="https://line.me/R/ti/p/@westinghousepet"
              target="_blank"
              rel="noopener noreferrer"
              className="flex shrink-0 items-center gap-3 rounded-xl border border-success/30 bg-success/5 p-3 transition-all hover:bg-success/10 lg:w-full"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success/20">
                <MessageCircle className="h-5 w-5 text-success" />
              </span>
              <div>
                <Text variant="label" weight="semibold" className="text-success">
                  加入 LINE 客服
                </Text>
                <Text variant="caption" color="muted">
                  即時一對一諮詢
                </Text>
              </div>
            </a>
          </div>

          {/* Chat Window */}
          <div className="overflow-hidden rounded-2xl border border-border bg-[#849EB8] shadow-lg">
            {/* LINE Header */}
            <div className="flex items-center gap-3 bg-white/95 px-4 py-3 backdrop-blur-sm">
              <button className="text-muted-foreground">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-lg">
                {active.avatar}
              </span>
              <div className="flex-1">
                <Text variant="label" weight="semibold">
                  Westinghouse Pet 客服
                </Text>
                <Text variant="caption" className="text-success">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    通常在 10 分鐘內回覆
                  </span>
                </Text>
              </div>
              <Phone className="h-5 w-5 text-muted-foreground" />
            </div>

            {/* Messages */}
            <div className="space-y-3 bg-[url('/images/line-bg-pattern.png')] bg-repeat p-4" style={{ minHeight: 360, background: 'linear-gradient(180deg, #A8C0D8 0%, #94B0CC 100%)' }}>
              {/* Date separator */}
              <div className="flex justify-center">
                <span className="rounded-full bg-black/10 px-3 py-1 text-[10px] text-white/80">
                  {active.messages[0]?.time} · 今天
                </span>
              </div>

              {active.messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex",
                    msg.type === "customer" ? "justify-end" : "justify-start"
                  )}
                >
                  <div className="flex max-w-[80%] items-end gap-1.5">
                    {msg.type === "service" && (
                      <span className="mb-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                        WH
                      </span>
                    )}
                    <div
                      className={cn(
                        "relative rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                        msg.type === "customer"
                          ? "rounded-br-sm bg-[#06C755] text-white"
                          : "rounded-bl-sm bg-white text-foreground shadow-sm"
                      )}
                    >
                      <p className="whitespace-pre-line">{msg.content}</p>
                      <div
                        className={cn(
                          "mt-1 flex items-center gap-1 text-[10px]",
                          msg.type === "customer" ? "justify-end text-white/70" : "text-muted-foreground"
                        )}
                      >
                        {msg.time}
                        {msg.read && msg.type === "service" && (
                          <CheckCheck className="h-3 w-3 text-success" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  WH
                </span>
                <div className="rounded-2xl rounded-bl-sm bg-white px-4 py-3 shadow-sm">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-neutral-300" style={{ animationDelay: '0ms' }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-neutral-300" style={{ animationDelay: '150ms' }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-neutral-300" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Input Bar */}
            <div className="flex items-center gap-2 border-t border-border bg-white px-3 py-2.5">
              <button className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-neutral-100">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>
              </button>
              <div className="flex-1 rounded-full bg-neutral-100 px-4 py-2 text-sm text-muted-foreground">
                輸入訊息...
              </div>
              <button className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-neutral-100">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
