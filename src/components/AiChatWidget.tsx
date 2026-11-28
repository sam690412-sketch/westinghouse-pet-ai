import { useI18n } from "@/i18n";
import { tr } from "@/i18n/storefront";
import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { env } from "@/lib/env";
import { cn } from "@/lib/utils";
import {
  MessageCircle, X, Send, Loader2, ChevronRight, User, Bot,
  Sparkles, Phone, ExternalLink, Trash2
} from "lucide-react";

/* ================================================================ */
/*  TYPES                                                             */
/* ================================================================ */

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  type?: string;
  actions?: { label: string; url: string; type: string }[];
  timestamp: number;
}

interface ChatContext {
  petType?: string;
  petCount?: number;
  problem?: string;
  knowledgeId?: string;
}

/* ================================================================ */
/*  PRESET QUESTIONS — Taiwan Traditional Chinese                     */
/* ================================================================ */

const PRESET_QUESTIONS_ZH = [
  "貓咪不喝水該選哪一台？",
  "M81 可以放濕糧嗎？",
  "D11-BA 和 D61 怎麼選？",
  "濾芯多久換一次？",
  "我要查保固",
  "我想找客服",
];

/* ================================================================ */
/*  STORAGE                                                           */
/* ================================================================ */

const STORAGE_KEY = "wpet_ai_chat";

function loadHistory(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function saveHistory(msgs: ChatMessage[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs.slice(-50)));
  } catch { /* storage full */ }
}

/* ================================================================ */
/*  COMPONENT                                                         */
/* ================================================================ */

export function AiChatWidget() {
  const {locale,t}=useI18n();
  const presets=locale==='zh-TW'?PRESET_QUESTIONS_ZH:locale==='en'?['Which fountain fits my pet?','Does M81 support wet food?','Compare D11-BA and D61','Filter compatibility','Warranty information','How to reserve']:['น้ำพุรุ่นใดเหมาะกับสัตว์เลี้ยง','M81 รองรับอาหารเปียกหรือไม่','เปรียบเทียบ D11-BA กับ D61','ไส้กรองที่รองรับ','ข้อมูลการรับประกัน','วิธีจองล่วงหน้า'];
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(loadHistory);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState<ChatContext>({});
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Save history
  useEffect(() => { saveHistory(messages); }, [messages]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text: text.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch(`${env.API_BASE}/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          sessionId: "web",
          context,
        }),
      });

      if (!res.ok) throw new Error("API error");
      const data = await res.json();

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        text: data.reply || tr(locale,"暫時無法回答，請查看常見問題。","No answer is available. Please see the FAQ.","ยังไม่มีคำตอบ โปรดดูคำถามที่พบบ่อย"),
        type: data.type,
        actions: data.actions || [],
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      if (data.context) {
        setContext((prev) => ({ ...prev, ...data.context }));
      }
    } catch {
      // Fallback: show offline message with contact options
      const fallbackMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        text: tr(locale,"智能客服暫時無法連線，請查看常見問題與上市資訊。","The assistant is temporarily unavailable. Please see the FAQ and launch information.","ผู้ช่วยไม่พร้อมใช้งานชั่วคราว โปรดดูคำถามที่พบบ่อยและข้อมูลการเปิดตัว"),
        type: "offline",
        actions: [
          { label: t("faq"), url: "/faq", type: "internal" },
          { label: t("contact"), url: "/contact", type: "internal" },
        ],
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, context, locale, t]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handlePresetClick = (q: string) => {
    sendMessage(q);
  };

  const clearHistory = () => {
    setMessages([]);
    setContext({});
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleActionClick = (action: { url: string; type: string }) => {
    if (action.type === "external") {
      window.open(action.url, "_blank", "noopener,noreferrer");
    } else if (action.type === "phone") {
      window.location.href = action.url;
    } else {
      window.location.href = action.url.startsWith("/") ? `#${action.url}` : action.url;
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={cn(
            "fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center",
            "rounded-full bg-primary text-white shadow-lg",
            "transition-all duration-300 hover:scale-110 hover:shadow-xl",
            "focus:outline-none focus:ring-2 focus:ring-primary/40"
          )}
          aria-label={tr(locale,"開啟 AI 客服","Open AI assistant","เปิดผู้ช่วย AI")}
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div
          className={cn(
            "fixed inset-0 z-50 flex items-end justify-center sm:items-end sm:justify-end",
            "sm:inset-auto sm:bottom-5 sm:right-5",
            "sm:h-[520px] sm:w-[400px]"
          )}
        >
          {/* Mobile backdrop */}
          <div
            className="absolute inset-0 bg-black/20 sm:hidden"
            onClick={() => setIsOpen(false)}
          />

          <div className={cn(
            "relative flex h-full w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl",
            "sm:h-full sm:rounded-2xl sm:border sm:border-border"
          )}>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border bg-primary px-4 py-3">
              <div className="flex items-center gap-2 text-white">
                <Sparkles className="h-5 w-5" />
                <div>
                  <p className="text-sm font-semibold">{tr(locale,"Westinghouse AI 客服","Westinghouse AI assistant","ผู้ช่วย AI Westinghouse")}</p>
                  <p className="text-[11px] text-white/70">{tr(locale,"產品資訊助手 · 服務可能暫時受限","Product information assistant · Availability may vary","ผู้ช่วยข้อมูลสินค้า · ความพร้อมใช้งานอาจแตกต่างกัน")}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={clearHistory}
                  className="rounded p-1.5 text-white/70 hover:bg-white/20 transition-colors"
                  title={tr(locale,"清除對話","Clear conversation","ล้างการสนทนา")}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded p-1.5 text-white/70 hover:bg-white/20 transition-colors"
                  aria-label={tr(locale,"關閉","Close","ปิด")}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.length === 0 && (
                <div className="space-y-4">
                  {/* Welcome */}
                  <div className="flex gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div className="max-w-[80%]">
                      <div className="rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-2.5">
                        <p className="text-sm text-slate-700">
                          {tr(locale,"歡迎詢問商品規格或上市預約資訊。回覆可能使用繁體中文。","Ask about specifications or reservations. Replies may be in Traditional Chinese.","สอบถามข้อมูลจำเพาะหรือการจองล่วงหน้าได้ คำตอบอาจเป็นภาษาจีนตัวเต็ม")}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Preset Questions */}
                  <div className="ml-10.5 space-y-1.5">
                    {presets.map((q) => (
                      <button
                        key={q}
                        onClick={() => handlePresetClick(q)}
                        className="flex w-full items-center justify-between rounded-lg border border-border px-3 py-2 text-left text-sm text-slate-600 transition-all hover:border-primary/30 hover:bg-primary/5"
                      >
                        <span>{q}</span>
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    ))}
                  </div>

                  {/* Privacy notice */}
                  <p className="text-center text-[10px] text-muted-foreground pt-2">
                    {tr(locale,"對話紀錄儲存在裝置中；送出問題時會傳送至後端服務，請勿輸入敏感個資。","History is stored on your device; submitted questions are sent to the backend. Avoid sensitive personal data.","ประวัติจัดเก็บในอุปกรณ์ คำถามที่ส่งจะถูกส่งไปยังระบบหลังบ้าน โปรดหลีกเลี่ยงข้อมูลส่วนบุคคลที่ละเอียดอ่อน")}
                  </p>
                </div>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex gap-2.5",
                    msg.role === "user" ? "flex-row-reverse" : ""
                  )}
                >
                  <div className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                    msg.role === "user" ? "bg-slate-200" : "bg-primary/10"
                  )}>
                    {msg.role === "user" ? (
                      <User className="h-4 w-4 text-slate-600" />
                    ) : (
                      <Bot className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <div className={cn("max-w-[80%]", msg.role === "user" ? "items-end" : "")}>
                    <div className={cn(
                      "rounded-2xl px-4 py-2.5 text-sm whitespace-pre-line",
                      msg.role === "user"
                        ? "rounded-tr-sm bg-primary text-white"
                        : "rounded-tl-sm bg-slate-100 text-slate-700"
                    )}>
                      {msg.text}
                    </div>

                    {/* Action buttons */}
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {msg.actions.map((a) => (
                          <button
                            key={a.label}
                            onClick={() => handleActionClick(a)}
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors",
                              a.type === "external"
                                ? "bg-green-50 text-green-700 hover:bg-green-100"
                                : a.type === "phone"
                                ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                                : "bg-primary/5 text-primary hover:bg-primary/10"
                            )}
                          >
                            {a.type === "external" && <ExternalLink className="h-3 w-3" />}
                            {a.type === "phone" && <Phone className="h-3 w-3" />}
                            {a.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-2.5">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="border-t border-border p-3">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={tr(locale,"輸入您的問題…","Type your question…","พิมพ์คำถาม…")}
                  className="flex-1 text-sm"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim() || isLoading}
                  className="shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
                {tr(locale,"AI 回答僅供參考，產品與保固以正式公告為準。","AI answers are for reference only; follow confirmed product and warranty notices.","คำตอบ AI ใช้อ้างอิงเท่านั้น โปรดอ้างอิงประกาศสินค้าและการรับประกันที่ยืนยันแล้ว")}
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default AiChatWidget;
