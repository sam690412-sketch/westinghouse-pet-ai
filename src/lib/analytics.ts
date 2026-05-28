/**
 * Google Analytics 4 + Ecommerce Tracking
 * Phase 4.0 — Production Analytics
 *
 * All tracking is privacy-first:
 * - No PII in events
 * - No user-level tracking without consent
 * - All events use gtag('event', ...)
 */

import { env, features } from "./env";

const GA_ID = env.GA_ID;
const isDev = features.dev;

/** Check if gtag is available */
function gtagAvailable(): boolean {
  return typeof window !== "undefined" && !!(window as unknown as Record<string, unknown>).gtag && !!GA_ID;
}

/** Safe gtag wrapper */
function gtag(cmd: string, ...args: unknown[]) {
  if (!gtagAvailable()) {
    if (isDev) console.log("[GA]", cmd, ...args);
    return;
  }
  try {
    (window as unknown as Record<string, (c: string, ...a: unknown[]) => void>).gtag(cmd, ...args);
  } catch { /* silent */ }
}

/* ================================================================ */
/*  PAGE VIEW                                                                       */
/* ================================================================ */

export function pageView(path: string, title?: string) {
  gtag("event", "page_view", {
    page_location: window.location.href,
    page_path: path,
    page_title: title || document.title,
  });
}

/* ================================================================ */
/*  ECOMMERCE EVENTS                                                                */
/* ================================================================ */

export interface ProductItem {
  item_id: string;      // SKU
  item_name: string;
  item_category: string;
  price: number;
  quantity?: number;
}

/** view_item_list — product list viewed */
export function viewItemList(listName: string, items: ProductItem[]) {
  gtag("event", "view_item_list", {
    item_list_name: listName,
    items: items.map((item, i) => ({ ...item, index: i })),
  });
}

/** view_item — product detail viewed */
export function viewItem(item: ProductItem) {
  gtag("event", "view_item", { items: [item] });
}

/** add_to_cart */
export function addToCart(item: ProductItem) {
  gtag("event", "add_to_cart", {
    currency: "TWD",
    value: item.price * (item.quantity || 1),
    items: [item],
  });
}

/** remove_from_cart */
export function removeFromCart(item: ProductItem) {
  gtag("event", "remove_from_cart", {
    currency: "TWD",
    value: item.price * (item.quantity || 1),
    items: [item],
  });
}

/** begin_checkout */
export function beginCheckout(items: ProductItem[], value: number) {
  gtag("event", "begin_checkout", {
    currency: "TWD",
    value,
    items,
  });
}

/** purchase — order completed */
export function purchase(order: {
  transaction_id: string;
  value: number;
  items: ProductItem[];
}) {
  gtag("event", "purchase", {
    currency: "TWD",
    transaction_id: order.transaction_id,
    value: order.value,
    items: order.items,
  });
}

/* ================================================================ */
/*  CONVERSION EVENTS                                                               */
/* ================================================================ */

/** generate_lead — newsletter signup, support contact */
export function generateLead(source: string) {
  gtag("event", "generate_lead", { source });
}

/** warranty registration */
export function warrantyRegistered(warrantyCode: string) {
  gtag("event", "warranty_register", { warranty_code: warrantyCode });
}

/** support ticket created */
export function supportTicketCreated(ticketNumber: string) {
  gtag("event", "support_ticket", { ticket_number: ticketNumber });
}

/* ================================================================ */
/*  GA4 SCRIPT LOADER                                                               */
/* ================================================================ */

export function loadGAScript(): void {
  if (!GA_ID || typeof document === "undefined") return;
  if (document.querySelector(`script[src*="googletagmanager.com/gtag"]`)) return;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  const inline = document.createElement("script");
  inline.textContent = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${GA_ID}', {
      send_page_view: false,
      cookie_flags: 'SameSite=None;Secure',
      restricted_data_processing: true,
    });
  `;
  document.head.appendChild(inline);
}
