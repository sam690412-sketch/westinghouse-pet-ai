import { IS_LIVE_STORE } from "@/config/storeConfig";
import { modelBySlug } from "@/i18n/products";
import type { ProductModel } from "@/i18n/products";
import type { Locale } from "@/i18n/types";

/* ================================================================ */
/*  SHARED REVIEW DATA — used by Home + Reviews page                  */
/* ================================================================ */

export interface Review {
  id: string;
  name: string;
  avatar: string;
  avatarColor?: string;
  rating: number;
  date: string;
  product: string;
  content: string;
  scenario?: string;
  images?: number;
  photos?: string[];
  likes: number;
  verified: boolean;
  badge?: string;
  highlight?: string;
  recommend?: boolean;
}

const REVIEW_ARCHIVE: Review[] = [
  {
    id: "r1",
    name: "陳小雅",
    avatar: "陳",
    avatarColor: "bg-rose-100 text-rose-600",
    rating: 5,
    date: "2026-05-20",
    product: "M81 鮮濕糧智慧餵食器",
    content:
      "餵食器跟飲水機二合一真的太方便了！我家貓咪原本不愛喝水，換了這台之後每天都會主動去喝。而且鮮食保鮮功能超棒，濕糧放半天還是涼涼的。客服回覆也很快，有問題 LINE 問就解決了 👍",
    scenario: "單貓家庭，上班族",
    images: 3,
    photos: ["/images/reviews/review-01.webp"],
    likes: 42,
    verified: true,
    badge: "購買已驗證",
    highlight: "貓咪愛上喝水",
    recommend: true,
  },
  {
    id: "r2",
    name: "林建宏",
    avatar: "林",
    avatarColor: "bg-blue-100 text-blue-600",
    rating: 5,
    date: "2026-05-18",
    product: "D61 智慧不鏽鋼飲水機",
    content:
      "家裡三隻貓本來要搶水碗，現在 4L 大容量完全不夠搶。安裝超簡單，5 分鐘搞定。最滿意的是續航力，充一次電用了一個多月還有電。台灣一年保固很安心。",
    scenario: "多貓家庭（3隻）",
    images: 2,
    photos: ["/images/reviews/review-05.webp"],
    likes: 38,
    verified: true,
    badge: "多貓家庭推薦",
    highlight: "安裝超簡單",
    recommend: true,
  },
  {
    id: "r3",
    name: "王美琪",
    avatar: "王",
    avatarColor: "bg-amber-100 text-amber-600",
    rating: 5,
    date: "2026-05-15",
    product: "M12 智慧全景餵食器",
    content:
      "租屋族必備！每次加班到很晚都很擔心毛孩餓肚子，現在每天固定時間自動餵食，還能從手機看牠吃飯的樣子超療癒。密封效果真的很好，乾糧放兩週還是脆的。",
    scenario: "租屋族，單貓",
    images: 2,
    photos: ["/images/reviews/review-02.webp"],
    likes: 56,
    verified: true,
    badge: "上班族必備",
    highlight: "租屋族救星",
    recommend: true,
  },
  {
    id: "r4",
    name: "張志偉",
    avatar: "張",
    avatarColor: "bg-emerald-100 text-emerald-600",
    rating: 4,
    date: "2026-05-12",
    product: "D11-BA 智慧寵物飲水機",
    content:
      "飲水監控功能很實用，APP 會記錄每天的飲水量，有異常還會通知。不鏽鋼材質質感很好，清潔也很方便拆洗。唯一的缺點是 2.5L 對我家兩隻貓來說有時要勤換水，不過整體還是很推薦！",
    scenario: "雙貓家庭",
    images: 1,
    photos: ["/images/reviews/review-04.webp"],
    likes: 23,
    verified: true,
    badge: "健康管理推薦",
    recommend: true,
  },
  {
    id: "r5",
    name: "黃小婷",
    avatar: "黃",
    avatarColor: "bg-violet-100 text-violet-600",
    rating: 5,
    date: "2026-05-10",
    product: "M31 智慧扭蛋餵食器",
    content:
      "扭蛋造型超級可愛！！！放在客廳朋友都問這是什麼。我家的貓好像也知道這是牠的，每次出糧都會跑過來等。錄音功能也很好玩，我錄了自己的聲音叫牠來吃飯 🐱",
    scenario: "單貓家庭，設計師",
    images: 4,
    photos: ["/images/reviews/review-03.webp"],
    likes: 71,
    verified: true,
    badge: "顏值擔當",
    highlight: "扭蛋造型超療癒",
    recommend: true,
  },
  {
    id: "r6",
    name: "李詩涵",
    avatar: "李",
    avatarColor: "bg-cyan-100 text-cyan-600",
    rating: 5,
    date: "2026-05-08",
    product: "M81 鮮濕糧智慧餵食器",
    content:
      "出差一週完全不擔心！之前請人來餵貓花超多錢，現在自動餵食器 + 大容量飲水機一次搞定。15 天續航真的很夠用，回家看 APP 紀錄貓咪每天都有乖乖吃飯。",
    scenario: "經常出差，單貓",
    images: 2,
    photos: ["/images/reviews/review-06.webp"],
    likes: 45,
    verified: true,
    badge: "出差族推薦",
    highlight: "一週出差也不怕",
    recommend: true,
  },
  {
    id: "r7",
    name: "周家豪",
    avatar: "周",
    avatarColor: "bg-orange-100 text-orange-600",
    rating: 5,
    date: "2026-05-05",
    product: "M12 智慧全景餵食器",
    content:
      "買了兩台，一台放客廳一台放臥室。全景攝影機畫質很清晰，晚上紅外線也能看清楚。最喜歡雙向語音功能，上班無聊就開 APP 跟貓咪講話，同事都覺得我很奇怪 😂",
    scenario: "多貓家庭（2隻），科技業",
    images: 2,
    likes: 33,
    verified: true,
    badge: "科技控推薦",
    highlight: "雙向語音超有趣",
    recommend: true,
  },
  {
    id: "r8",
    name: "許雅芳",
    avatar: "許",
    avatarColor: "bg-pink-100 text-pink-600",
    rating: 5,
    date: "2026-05-03",
    product: "D11-BA 智慧寵物飲水機",
    content:
      "我家狗本來只喝馬桶水（很困擾），換了這台流動水飲水機後終於願意喝了！2.5L 對一隻中型犬剛剛好，濾芯換起來也很簡單。推薦給養狗的朋朋們 🐶",
    scenario: "單犬家庭（柴犬）",
    images: 3,
    likes: 29,
    verified: true,
    badge: "養犬也適用",
    highlight: "狗狗終於願喝水",
    recommend: true,
  },
  {
    id: "r9",
    name: "趙子涵",
    avatar: "趙",
    avatarColor: "bg-indigo-100 text-indigo-600",
    rating: 4,
    date: "2026-04-28",
    product: "M31 智慧扭蛋餵食器",
    content:
      "3L 容量對我家一隻貓來說綽綽有餘，出糧很順暢從來沒卡過。外觀真的很好看，放在家裡像擺飾品。唯一的建議是希望以後可以出更多顏色！",
    scenario: "單貓家庭，學生",
    images: 1,
    likes: 19,
    verified: true,
    recommend: true,
  },
  {
    id: "r10",
    name: "吳佩珊",
    avatar: "吳",
    avatarColor: "bg-teal-100 text-teal-600",
    rating: 5,
    date: "2026-04-25",
    product: "D61 智慧不鏽鋼飲水機",
    content:
      "全不鏽鋼材質質感一流，跟家裡的廚具風格很搭。4L 大容量讓我這個懶人不用每天換水，濾芯一個月換一次就好。客服回覆速度真的很快，問濾芯型號 3 分鐘就回。",
    scenario: "雙貓家庭，重視質感",
    likes: 52,
    verified: true,
    badge: "質感控推薦",
    highlight: "不鏽鋼質感超棒",
    recommend: true,
  },
  {
    id: "r11",
    name: "蔡宗翰",
    avatar: "蔡",
    avatarColor: "bg-sky-100 text-sky-600",
    rating: 5,
    date: "2026-04-20",
    product: "M81 鮮濕糧智慧餵食器",
    content:
      "貓咪之前因為不愛吃乾糧一直偏瘦，換了 M81 的濕糧保鮮功能後食慾明顯變好！300° 攝影機讓我隨時可以確認牠有沒有吃飽。這台真的值得投資。",
    scenario: "單貓家庭，貓咪挑食",
    images: 2,
    likes: 41,
    verified: true,
    badge: "挑食貓救星",
    highlight: "濕糧保鮮超實用",
    recommend: true,
  },
  {
    id: "r12",
    name: "鄭佳玲",
    avatar: "鄭",
    avatarColor: "bg-fuchsia-100 text-fuchsia-600",
    rating: 5,
    date: "2026-04-15",
    product: "D11-BA 智慧寵物飲水機",
    content:
      "貓咪之前有泌尿問題，獸醫建議要多喝水。換了這台流動水飲水機後，喝水量從每天 80ml 增加到 180ml！飲水監控功能讓我可以每天確認，超安心。",
    scenario: "貓咪有泌尿問題",
    likes: 67,
    verified: true,
    badge: "健康管理必備",
    highlight: "喝水量翻倍",
    recommend: true,
  },
];

// Pre-launch design preview. These archived examples are not verified purchases.
// Turn off with VITE_SHOW_PREVIEW_REVIEWS=false; always off for the live store.
export const SHOW_PREVIEW_REVIEWS = !IS_LIVE_STORE && import.meta.env.VITE_SHOW_PREVIEW_REVIEWS !== 'false';
const modelPattern = /^(M81|M12|M31|D61|D11-BA)(?:\s|$)/;
export function reviewModel(review: Review): ProductModel | undefined {
  const match = modelPattern.exec(review.product)?.[1];
  if (match === 'D11-BA') return 'D11BA';
  if (match === 'M81' || match === 'M12' || match === 'M31' || match === 'D61') return match;
  return undefined;
}
// Only independently verified IDs may be published as customer testimonials.
const APPROVED_REVIEW_IDS = new Set<string>();
export const PUBLISHED_REVIEWS = REVIEW_ARCHIVE.filter(r => reviewModel(r) && APPROVED_REVIEW_IDS.has(r.id) && r.verified);
export const REVIEWS: Review[] = SHOW_PREVIEW_REVIEWS
  ? REVIEW_ARCHIVE.filter(r => reviewModel(r)).map(r => ({...r, verified: false, badge: undefined, likes: 0, recommend: undefined, images: r.photos?.length ?? 0}))
  : PUBLISHED_REVIEWS;
export function reviewsForProduct(slug?: string): Review[] {
  if (!slug) return REVIEWS;
  const model = modelBySlug[slug];
  return model ? REVIEWS.filter(r => reviewModel(r) === model) : [];
}
export function reviewStats(reviews: readonly Review[]) {
  return {
    totalCount: reviews.length,
    avgRating: reviews.length ? Number((reviews.reduce((n,r)=>n+r.rating,0)/reviews.length).toFixed(2)) : 0,
    fiveStarPercent: reviews.length ? Math.round(100*reviews.filter(r=>r.rating===5).length/reviews.length) : 0,
  };
}
export const REVIEW_STATS = reviewStats(REVIEWS);
export const reviewLabels: Record<Locale, {heading:string;preview:string;published:string;count:string;photos:string;close:string;all:string;back:string;empty:string;five:string}> = {
  'zh-TW': {heading:'飼主使用分享',preview:'展示用分享｜網站規劃階段',published:'已發布顧客評價',count:'則分享',photos:'分享照片',close:'關閉',all:'查看全部分享',back:'返回首頁',empty:'目前尚無分享',five:'五星比例'},
  en: {heading:'Pet owner stories',preview:'Preview examples | Site planning stage',published:'Published customer reviews',count:'stories',photos:'Story photo',close:'Close',all:'View all stories',back:'Back to home',empty:'No stories yet',five:'Five-star share'},
  th: {heading:'เรื่องราวจากผู้เลี้ยงสัตว์',preview:'ตัวอย่างสำหรับการแสดงผล | ระหว่างวางแผนเว็บไซต์',published:'รีวิวลูกค้าที่เผยแพร่แล้ว',count:'เรื่องราว',photos:'ภาพประกอบเรื่องราว',close:'ปิด',all:'ดูเรื่องราวทั้งหมด',back:'กลับหน้าแรก',empty:'ยังไม่มีเรื่องราว',five:'สัดส่วนห้าดาว'},
};

/** Existing model-level presentation imagery; not attributed to individual review authors. */
const MODEL_ALBUM: Record<ProductModel, string[]> = {
  M81: ['/images/reviews/review-m81-01.jpg','/images/reviews/review-m81-02.jpg','/images/reviews/review-m81-03.jpg'],
  M12: ['/images/reviews/review-m12-01.jpg'],
  M31: ['/images/reviews/review-m31-01.jpg'],
  D61: ['/images/reviews/review-d61-01.jpg'],
  D11BA: ['/images/reviews/review-d11ba-01.jpg'],
};
export function previewAlbum(slug?: string): string[] {
  if (!SHOW_PREVIEW_REVIEWS) return [];
  const model = slug ? modelBySlug[slug] : undefined;
  return slug ? (model ? MODEL_ALBUM[model] : []) : Object.values(MODEL_ALBUM).flat();
}
export const albumLabels: Record<Locale, string> = {'zh-TW':'機型生活情境相簿（展示）',en:'Product lifestyle album (preview)',th:'อัลบั้มภาพการใช้งานสินค้า (ตัวอย่าง)'};
