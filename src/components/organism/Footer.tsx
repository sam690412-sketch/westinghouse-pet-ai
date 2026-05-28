import {
  PawPrint,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Youtube,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { forwardRef, useState } from "react";

/* ------------------------------------------------------------------ */
/*  TYPES                                                              */
/* ------------------------------------------------------------------ */

export interface FooterLinkGroup {
  title: string;
  links: { label: string; href: string }[];
}

export interface FooterProps extends React.HTMLAttributes<HTMLElement> {
  /** Logo text */
  logoText?: string;
  /** Tagline below logo */
  tagline?: string;
  /** Link groups for footer columns */
  linkGroups?: FooterLinkGroup[];
  /** Contact info */
  contact?: {
    phone?: string;
    email?: string;
    address?: string;
    hours?: string;
  };
  /** Social media URLs */
  social?: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
  };
  /** Newsletter submit callback */
  onNewsletterSubmit?: (email: string) => void;
  /** Bottom bar text (copyright) */
  copyright?: string;
  /** Additional bottom links */
  bottomLinks?: { label: string; href: string }[];
}

/* ------------------------------------------------------------------ */
/*  DEFAULT DATA                                                       */
/* ------------------------------------------------------------------ */

const defaultLinkGroups: FooterLinkGroup[] = [
  {
    title: "商品與服務",
    links: [
      { label: "智能寵物飲水機", href: "/products/smart-water-fountain" },
      { label: "智能自動餵食器", href: "/products/smart-feeder" },
      { label: "智能寵物烘乾箱", href: "/products/pet-dryer-box" },
      { label: "智能冷暖寵物窩", href: "/products/smart-pet-house" },
      { label: "貓砂盆與配件", href: "/products/litter-box" },
      { label: "美容工具組", href: "/products/grooming-kit" },
    ],
  },
  {
    title: "使用指南",
    links: [
      { label: "新手入門", href: "/solutions/getting-started" },
      { label: "常見問題排解", href: "/solutions/troubleshooting" },
      { label: "清潔保養教學", href: "/solutions/maintenance" },
      { label: "配件安裝指南", href: "/solutions/accessories" },
      { label: "安全使用須知", href: "/solutions/safety" },
      { label: "韌體更新說明", href: "/solutions/firmware" },
    ],
  },
  {
    title: "關於我們",
    links: [
      { label: "品牌故事", href: "/brand" },
      { label: "顧客評價", href: "/reviews" },
      { label: "常見問題", href: "/faq" },
      { label: "聯絡我們", href: "/contact" },
      { label: "隱私權政策", href: "/privacy" },
      { label: "服務條款", href: "/terms" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                          */
/* ------------------------------------------------------------------ */

export const Footer = forwardRef<HTMLElement, FooterProps>(
  (
    {
      logoText = "Westinghouse Pet",
      tagline = "以科技守護毛孩的每一天",
      linkGroups = defaultLinkGroups,
      contact = {
        phone: "0800-000-000",
        email: "support@westinghousepet.tw",
        address: "台北市信義區信義路五段7號",
        hours: "週一至週五 09:00-18:00",
      },
      social = {
        facebook: "https://facebook.com/westinghousepet.tw",
        instagram: "https://instagram.com/westinghousepet.tw",
        youtube: "https://youtube.com/@westinghousepettw",
      },
      onNewsletterSubmit,
      copyright = `© ${new Date().getFullYear()} Westinghouse Pet Taiwan. All rights reserved.`,
      bottomLinks = [
        { label: "隱私權政策", href: "/privacy" },
        { label: "服務條款", href: "/terms" },
        { label: "Cookie 設定", href: "/cookies" },
      ],
      className,
      ...props
    },
    ref
  ) => {
    const [email, setEmail] = useState("");

    const handleNewsletterSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (email.trim()) {
        onNewsletterSubmit?.(email.trim());
        setEmail("");
      }
    };

    return (
      <footer
        ref={ref}
        className={cn(
          "border-t border-border bg-neutral-50 text-foreground",
          className
        )}
        {...props}
      >
        {/* Newsletter Section */}
        <div className="border-b border-border bg-primary px-4 py-8 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 md:flex-row md:justify-between">
            <div className="text-center md:text-left">
              <h3 className="text-lg font-bold text-primary-foreground">
                訂閱電子報
              </h3>
              <p className="mt-1 text-sm text-primary-foreground/80">
                獲取新品上市資訊、獨家優惠與寵物照護知識
              </p>
            </div>
            <form
              onSubmit={handleNewsletterSubmit}
              className="flex w-full max-w-md gap-2"
            >
              <Input
                type="email"
                placeholder="輸入您的電子信箱"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-10 border-primary-foreground/30 bg-white/10 text-primary-foreground placeholder:text-primary-foreground/50"
                aria-label="電子信箱"
              />
              <Button
                type="submit"
                variant="secondary"
                className="h-10 gap-1 whitespace-nowrap px-5"
              >
                訂閱
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="px-4 py-10 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-8 sm:grid-cols-2 lg:grid-cols-12">
            {/* Brand Column */}
            <div className="lg:col-span-4">
              <a href="/" className="inline-flex items-center gap-2 text-xl font-bold">
                <PawPrint className="h-6 w-6 text-primary" />
                {logoText}
              </a>
              <p className="mt-2 text-sm text-muted-foreground">{tagline}</p>

              {/* Contact Info */}
              <div className="mt-4 space-y-2">
                {contact.phone && (
                  <a
                    href={`tel:${contact.phone}`}
                    className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Phone className="h-4 w-4 shrink-0 text-primary" />
                    {contact.phone}
                  </a>
                )}
                {contact.email && (
                  <a
                    href={`mailto:${contact.email}`}
                    className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Mail className="h-4 w-4 shrink-0 text-primary" />
                    {contact.email}
                  </a>
                )}
                {contact.address && (
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 shrink-0 text-primary" />
                    <span>{contact.address}</span>
                  </div>
                )}
                {contact.hours && (
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="ml-6">{contact.hours}</span>
                  </div>
                )}
              </div>

              {/* Social Icons */}
              <div className="mt-5 flex items-center gap-2">
                {social.facebook && (
                  <a
                    href={social.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-200 text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                    aria-label="Facebook"
                  >
                    <Facebook className="h-4 w-4" />
                  </a>
                )}
                {social.instagram && (
                  <a
                    href={social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-200 text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                    aria-label="Instagram"
                  >
                    <Instagram className="h-4 w-4" />
                  </a>
                )}
                {social.youtube && (
                  <a
                    href={social.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-200 text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                    aria-label="YouTube"
                  >
                    <Youtube className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>

            {/* Link Groups */}
            {linkGroups.map((group) => (
              <div key={group.title} className="lg:col-span-2">
                <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-foreground">
                  {group.title}
                </h4>
                <ul className="space-y-2">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-primary"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Trust Badges / Payment */}
            <div className="lg:col-span-2">
              <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-foreground">
                付款與配送
              </h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>信用卡 (Visa / Master / JCB)</p>
                <p>LINE Pay</p>
                <p>超商取貨付款</p>
                <p>銀行轉帳</p>
              </div>
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">配送方式</p>
                <p>黑貓宅配</p>
                <p>7-ELEVEN 取貨</p>
                <p>全家取貨</p>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-3 px-4 py-4 text-xs text-muted-foreground sm:flex-row lg:px-8">
          <p>{copyright}</p>
          <div className="flex items-center gap-4">
            {bottomLinks.map((link, i) => (
              <span key={link.href} className="flex items-center gap-4">
                {i > 0 && <span className="text-border">|</span>}
                <a href={link.href} className="hover:text-foreground">
                  {link.label}
                </a>
              </span>
            ))}
          </div>
        </div>
      </footer>
    );
  }
);
Footer.displayName = "Footer";
