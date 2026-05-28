import { Instagram, Facebook, MessageSquare, Heart, MessageCircle, Share2, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Heading, Text } from "@/components/atomic/Typography";

/* ------------------------------------------------------------------ */
/*  DATA                                                               */
/* ------------------------------------------------------------------ */

const socialProofs = [
  {
    platform: "instagram" as const,
    username: "貓奴小雅",
    avatar: "雅",
    image: "/images/social-ig-post.jpg",
    caption: "自從換了這台飲水機，我家主子每天喝水量直接翻倍 💦\n不用再擔心腎臟問題了 #貓咪飲水機 #寵物智能用品",
    likes: 126,
    comments: 23,
    time: "2天前",
  },
  {
    platform: "facebook" as const,
    username: "林建宏",
    group: "貓咪用品分享社團",
    avatar: "林",
    image: "/images/social-fb-group.jpg",
    caption: "用了三個月的心得分享，這台餵食器真的蠻穩定的，密封效果很好乾糧不會軟掉。APP操作也很直覺，推薦給上班族！",
    likes: 89,
    comments: 34,
    shares: 12,
    time: "3天前",
  },
  {
    platform: "threads" as const,
    username: "momo_cat_mom",
    avatar: "M",
    content: "回購第二台了！！第一台用了8個月完全沒問題，這次買給爸媽家的貓咪。他們本來說不需要，結果看到APP可以遠端看貓咪吃飯就說要一台 😂",
    likes: 67,
    replies: 15,
    reposts: 8,
    time: "1天前",
  },
  {
    platform: "community" as const,
    username: "王小美",
    group: "台北貓咪交流群",
    avatar: "美",
    content: "跟大家分享一下，上週買的D61飲水機到貨了！安裝超簡單，我家三隻貓本來搶一個水碗，現在搶著喝流動水 😂\n客服LINE回覆超快，問濾芯問題5分鐘就回我。推推！",
    likes: 45,
    comments: 18,
    time: "5天前",
  },
];

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                          */
/* ------------------------------------------------------------------ */

export function SocialProofEcosystemSection({ limit }: { limit?: number }) {
  const displayProofs = limit ? socialProofs.slice(0, limit) : socialProofs;
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation({ threshold: 0.2 });

  return (
    <section
      className="section-px section-py"
      aria-label="社群口碑"
    >
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div
          ref={headerRef}
          className={cn(
            "mb-10 text-center transition-all duration-700",
            headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          <Text variant="overline" className="text-primary">
            SOCIAL PROOF
          </Text>
          <Heading as="h2" variant="h2" className="mt-2">
            飼主們都在社群推薦
          </Heading>
          <Text variant="body" color="muted" className="mx-auto mt-3 max-w-xl">
            從 Instagram 到 Facebook 貓咪社團，真實飼主自發分享的使用心得
          </Text>

          {/* Platform Stats */}
          <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Instagram className="h-4 w-4" />
              <span className="font-semibold text-foreground">2,400+</span> IG 標註
            </span>
            <span className="hidden sm:inline text-border">|</span>
            <span className="flex items-center gap-1.5">
              <Facebook className="h-4 w-4" />
              <span className="font-semibold text-foreground">50+</span> 社團分享
            </span>
            <span className="hidden sm:inline text-border">|</span>
            <span className="flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4" />
              <span className="font-semibold text-foreground">500+</span> Threads 討論
            </span>
            <span className="hidden sm:inline text-border">|</span>
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              <span className="font-semibold text-foreground">10+</span> 貓咪社團推薦
            </span>
          </div>
        </div>

        {/* Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {displayProofs.map((proof, i) => (
            <SocialCard key={proof.username} proof={proof} index={i} />
          ))}
        </div>

        {/* "Most Loved" Badge */}
        <div className="mt-10 flex justify-center">
          <div className="flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-5 py-2.5">
            <Heart className="h-4 w-4 fill-amber-400 text-amber-400" />
            <Text variant="bodySmall" weight="medium" className="text-amber-700">
              貓咪社團最多人推薦的智能寵物品牌
            </Text>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  SOCIAL CARD                                                        */
/* ------------------------------------------------------------------ */

function SocialCard({
  proof,
  index,
}: {
  proof: (typeof socialProofs)[number];
  index: number;
}) {
  const platformColors = {
    instagram: "from-purple-500 via-pink-500 to-orange-400",
    facebook: "from-blue-600 to-blue-400",
    threads: "from-neutral-900 to-neutral-600",
    community: "from-emerald-600 to-teal-400",
  };

  const platformLabels = {
    instagram: "Instagram",
    facebook: "Facebook",
    threads: "Threads",
    community: "貓咪社團",
  };

  return (
    <div
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm",
        "transition-all duration-300 hover:shadow-md",
        index === 0 || index === 1 ? "sm:col-span-1" : ""
      )}
    >
      {/* Platform Bar */}
      <div
        className={cn(
          "flex items-center gap-2 bg-gradient-to-r px-4 py-2.5",
          platformColors[proof.platform]
        )}
      >
        {proof.platform === "instagram" && <Instagram className="h-4 w-4 text-white" />}
        {proof.platform === "facebook" && <Facebook className="h-4 w-4 text-white" />}
        {proof.platform === "threads" && <MessageSquare className="h-4 w-4 text-white" />}
        {proof.platform === "community" && <Users className="h-4 w-4 text-white" />}
        <span className="text-xs font-semibold text-white">
          {platformLabels[proof.platform]}
        </span>
        {proof.platform === "facebook" && "group" in proof && (
          <span className="ml-auto text-[10px] text-white/80">
            {proof.group}
          </span>
        )}
      </div>

      {/* Image (if exists) */}
      {(proof.platform === "instagram" || proof.platform === "facebook") && "image" in proof && (
        <div className="relative aspect-square overflow-hidden">
          <img
            src={proof.image}
            alt={`${proof.username} 的分享`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      )}

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        {/* User */}
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            {proof.avatar}
          </span>
          <Text variant="label" weight="semibold" className="line-clamp-1">
            {proof.username}
          </Text>
        </div>

        {/* Caption/Content */}
        <Text variant="bodySmall" color="muted" className="mt-2 line-clamp-4 flex-1 leading-relaxed">
          {"caption" in proof ? proof.caption : proof.content}
        </Text>

        {/* Footer */}
        <div className="mt-3 flex items-center gap-3 border-t border-border pt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Heart className="h-3 w-3" />
            {proof.likes}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="h-3 w-3" />
            {proof.comments}
          </span>
          {"shares" in proof && (
            <span className="flex items-center gap-1">
              <Share2 className="h-3 w-3" />
              {proof.shares}
            </span>
          )}
          <span className="ml-auto">{proof.time}</span>
        </div>
      </div>
    </div>
  );
}
