import type { Locale } from './types';

export type Localized = Readonly<Record<Locale, string>>;
export function tr(locale: Locale, zh: string, en: string, th: string): string {
  return locale === 'en' ? en : locale === 'th' ? th : zh;
}

export const storefront = {
  launch: {'zh-TW':'上市資訊待公布', en:'Launch details to be announced', th:'รอประกาศข้อมูลการเปิดตัว'},
  shipping: {'zh-TW':'上市及出貨時程待公布', en:'Launch and shipping dates to be announced', th:'รอประกาศกำหนดเปิดตัวและจัดส่ง'},
  noPayment: {'zh-TW':'僅登記預約意向，現階段不收取款項。', en:'Register your interest; no payment is collected at this stage.', th:'ลงทะเบียนแสดงความสนใจเท่านั้น ยังไม่มีการเรียกเก็บเงินในขณะนี้'},
  referencePrice: {'zh-TW':'台灣早鳥參考價（TWD，非結帳金額）', en:'Taiwan early-bird reference price (TWD; not a checkout total)', th:'ราคาอ้างอิงช่วงเปิดตัวในไต้หวัน (TWD ไม่ใช่ยอดชำระเงิน)'},
  support: {'zh-TW':'客服與售後服務資訊待公布', en:'Support and after-sales details to be announced', th:'รอประกาศข้อมูลบริการลูกค้าและบริการหลังการขาย'},
  warranty: {'zh-TW':'台灣保固條款待公布', en:'Taiwan warranty terms to be announced', th:'รอประกาศเงื่อนไขการรับประกันในไต้หวัน'},
  terms: {'zh-TW':'正式售價、付款及配送條件以後續上市公告為準。', en:'Final prices, payment and delivery terms will be confirmed at launch.', th:'ราคา เงื่อนไขการชำระเงินและการจัดส่งจะยืนยันเมื่อเปิดตัว'},
  unavailable: {'zh-TW':'目前無法取得商品資料，請稍後重試。', en:'Product information is temporarily unavailable. Please try again.', th:'ไม่สามารถโหลดข้อมูลสินค้าได้ในขณะนี้ โปรดลองอีกครั้ง'},
  collection: {'zh-TW':'探索五款智慧寵物家電', en:'Explore our five smart pet appliances', th:'สำรวจเครื่องใช้ไฟฟ้าอัจฉริยะสำหรับสัตว์เลี้ยงทั้ง 5 รุ่น'},
  overview: {'zh-TW':'產品展示', en:'Product overview', th:'ภาพรวมสินค้า'},
  imageUnavailable: {'zh-TW':'圖片暫時無法載入', en:'Image temporarily unavailable', th:'ไม่สามารถโหลดรูปภาพได้ชั่วคราว'},
  previewOnly: {'zh-TW':'情境示意', en:'Illustrative scene', th:'ภาพประกอบสถานการณ์'},
} satisfies Record<string, Localized>;

// A non-2xx response, an HTML fallback, or an unhealthy DB never counts as ready.
export function isBackendHealthy(status: number, payload: unknown): boolean {
  if (status < 200 || status >= 300 || !payload || typeof payload !== 'object') return false;
  const health = payload as Record<string, unknown>;
  return health.status === 'ok' && health.db === 'connected';
}
