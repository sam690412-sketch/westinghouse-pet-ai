export interface ProductData {
  slug: string;
  name: string;
  tagline: string;
  category: "feeder" | "water" | "accessory";
  price: number;
  originalPrice?: number;
  image: string;
  badge?: string;
  features: string[];
}

export const PRODUCTS: ProductData[] = [
  {
    slug: "m81-fresh-food-feeder",
    name: "M81 鮮濕糧智慧餵食器",
    tagline: "鮮食乾糧混合餵食，APP遠端操控",
    category: "feeder",
    price: 499000,
    originalPrice: 599000,
    image: "/images/products/m81-main.webp",
    badge: "旗艦新品",
    features: ["鮮食+乾糧混合","APP遠端操控","語音錄音呼叫","精準分量控制","防潮密封設計"],
  },
  {
    slug: "m12-panoramic-feeder",
    name: "M12 智慧全景餵食器",
    tagline: "360°全景監控餵食，隨時看見毛孩",
    category: "feeder",
    price: 349000,
    originalPrice: 429000,
    image: "/images/products/m12-main.webp",
    badge: "熱銷",
    features: ["360°全景鏡頭","雙向語音","4L大容量","防卡糧設計","定時定量餵食"],
  },
  {
    slug: "m31-gashapon-feeder",
    name: "M31 智慧扭蛋餵食器",
    tagline: "趣味扭蛋餵食，互動玩樂兩相宜",
    category: "feeder",
    price: 289000,
    originalPrice: 349000,
    image: "/images/products/m31-main.webp",
    features: ["扭蛋趣味餵食","手機APP控制","不鏽鋼食盆","可拆洗設計","低功耗省電"],
  },
  {
    slug: "d11ba-water-dispenser",
    name: "D11-BA 智慧寵物飲水機",
    tagline: "靜音湧泉循環過濾，讓貓愛上喝水",
    category: "water",
    price: 249000,
    originalPrice: 299000,
    image: "/images/products/d11-ba-main.webp",
    badge: "熱銷冠軍",
    features: ["超靜音湧泉","四重過濾","2.5L大容量","水質監測","易拆洗設計"],
  },
  {
    slug: "d61-stainless-dispenser",
    name: "D61 智慧不鏽鋼寵物飲水機",
    tagline: "醫療級不鏽鋼，抗菌耐用首選",
    category: "water",
    price: 329000,
    originalPrice: 389000,
    image: "/images/products/d61-main.webp",
    features: ["304不鏽鋼材質","抗菌認證","循環過濾","低水位提醒","防漏電設計"],
  },
];

export const FEEDERS = PRODUCTS.filter((p) => p.category === "feeder");
export const WATER_DISPENSERS = PRODUCTS.filter((p) => p.category === "water");

/* ================================================================ */
/*  BACKWARD COMPATIBILITY — for legacy sections                     */
/* ================================================================ */

/* -- type alias -- */
export type Product = ProductData & Record<string, unknown>;

/* -- id / nameEn / etc. injected at runtime -- */
const compatProducts = PRODUCTS.map((p) => ({
  ...p,
  id: p.slug,
  nameEn: p.name,
  buyLink: `/products/${p.slug}`,
  specs: p.features.map((f) => ({ label: f, value: "是" })),
}));
export const products = compatProducts;

/* -- comparison data -- */
export const comparisonData = {
  items: [
    { feature: "APP遠端操控", other: "基本款", wh: "完整功能" },
    { feature: "智能感應餵食", other: "無", wh: "紅外線感應" },
    { feature: "濾芯更換提醒", other: "無", wh: "APP自動提醒" },
    { feature: "保固期限", other: "3個月", wh: "1-3年" },
    { feature: "台灣本地客服", other: "無", wh: "0800專線" },
  ],
};

/* -- FAQ data -- */
export const faqData = [
  { question: "智能飲水機的濾芯多久需要更換一次？", answer: "建議每 4-6 週更換一次，視使用頻率與水質而定。" },
  { question: "產品保固期是多長？", answer: "全系列產品均享有一年原廠保固，馬達核心部件延長至三年保固。" },
  { question: "可以退貨或換貨嗎？", answer: "收到商品後七天內，若產品未使用且包裝完整，可申請退換貨。" },
  { question: "如何連接APP進行遠端操控？", answer: "下載 Westinghouse Pet App，長按產品WiFi鍵3秒進入配對模式，依照App指示完成連線。" },
  { question: "運費如何計算？", answer: "全館消費滿 NT$1,500 即享免運，未達免運門檻收取 NT$100 運費。" },
];

/* -- testimonials -- */
export const testimonials = [
  { id: 1, name: "陳小姐", rating: 5, text: "貓咪終於愛喝水了！", content: "貓咪終於愛喝水了！水流設計很安靜，晚上也不會吵。", product: "D11-BA 飲水機", pet: "貓咪" },
  { id: 2, name: "林先生", rating: 5, text: "餵食器超級方便", content: "餵食器超級方便，APP操作直覺，最喜歡語音呼叫功能！", product: "M81 餵食器", pet: "貓咪" },
  { id: 3, name: "王太太", rating: 4, text: "烘乾箱設計很貼心", content: "烘乾箱設計很貼心，溫度溫和不用擔心燙傷。", product: "寵物烘乾箱", pet: "貓咪" },
];
