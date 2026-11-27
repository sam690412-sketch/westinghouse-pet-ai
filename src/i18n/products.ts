import type { Locale } from './types';
export type ProductModel = 'M81' | 'M12' | 'M31' | 'D61' | 'D11BA';
export interface ProductTranslation { name: string; tagline: string; features: string[]; specs: [string, string][] }
/** V3.2 specification baseline: supplied by the project owner. Usage-dependent figures retain their qualifiers. */
export const productCopy: Record<ProductModel, Record<Locale, ProductTranslation>> = {
  "M81": {
    "zh-TW": {
      "name": "M81 智能鮮濕糧餵食器",
      "tagline": "250 mL × 5 格 · 4 格 4°C 製冷＋1 格 25–28°C 預熱",
      "features": [
        "4 格 4°C 製冷＋1 格 25–28°C 預熱",
        "300° 旋轉鏡頭",
        "12V ⎓ 10A（附 100–240V 變壓器）"
      ],
      "specs": [
        [
          "食盆容量",
          "250 mL × 5 格"
        ],
        [
          "溫控",
          "4 格 4°C 製冷＋1 格 25–28°C 預熱"
        ],
        [
          "鏡頭",
          "300° 旋轉鏡頭"
        ],
        [
          "電源",
          "12V ⎓ 10A（附 100–240V 變壓器）"
        ],
        [
          "功率",
          "120W"
        ],
        [
          "尺寸",
          "310 × 300 × 253 mm"
        ]
      ]
    },
    "en": {
      "name": "M81 Smart Fresh & Wet Food Feeder",
      "tagline": "250 mL × 5 compartments · 4 compartments cooled to 4°C + 1 preheated to 25–28°C",
      "features": [
        "4 compartments cooled to 4°C + 1 preheated to 25–28°C",
        "300° rotating camera",
        "12V DC 10A (100–240V AC adapter included)"
      ],
      "specs": [
        [
          "Tray capacity",
          "250 mL × 5 compartments"
        ],
        [
          "Temperature control",
          "4 compartments cooled to 4°C + 1 preheated to 25–28°C"
        ],
        [
          "Camera",
          "300° rotating camera"
        ],
        [
          "Power supply",
          "12V DC 10A (100–240V AC adapter included)"
        ],
        [
          "Rated power",
          "120W"
        ],
        [
          "Dimensions",
          "310 × 300 × 253 mm"
        ]
      ]
    },
    "th": {
      "name": "M81 เครื่องให้อาหารเปียกอัจฉริยะ",
      "tagline": "250 มล. × 5 ช่อง · 4 ช่องทำความเย็น 4°C + 1 ช่องอุ่นล่วงหน้า 25–28°C",
      "features": [
        "4 ช่องทำความเย็น 4°C + 1 ช่องอุ่นล่วงหน้า 25–28°C",
        "กล้องหมุนได้ 300°",
        "12V DC 10A (มีอะแดปเตอร์ 100–240V AC)"
      ],
      "specs": [
        [
          "ความจุถาดอาหาร",
          "250 มล. × 5 ช่อง"
        ],
        [
          "การควบคุมอุณหภูมิ",
          "4 ช่องทำความเย็น 4°C + 1 ช่องอุ่นล่วงหน้า 25–28°C"
        ],
        [
          "กล้อง",
          "กล้องหมุนได้ 300°"
        ],
        [
          "แหล่งจ่ายไฟ",
          "12V DC 10A (มีอะแดปเตอร์ 100–240V AC)"
        ],
        [
          "กำลังไฟ",
          "120W"
        ],
        [
          "ขนาด",
          "310 × 300 × 253 mm"
        ]
      ]
    }
  },
  "M12": {
    "zh-TW": {
      "name": "M12 智能可視餵食器",
      "tagline": "4 L（約 2 kg 乾糧；成年貓約 3 週食量） · 可拆卸雲台：橫向 265°＋豎向 110°",
      "features": [
        "可拆卸雲台：橫向 265°＋豎向 110°",
        "紅外線感應；乾糧顆粒 ≤ 12 mm",
        "5V ⎓ 1A＋4 顆 3 號電池（AA）"
      ],
      "specs": [
        [
          "儲糧容量",
          "4 L（約 2 kg 乾糧；成年貓約 3 週食量）"
        ],
        [
          "攝影機",
          "可拆卸雲台：橫向 265°＋豎向 110°"
        ],
        [
          "防堵塞",
          "紅外線感應；乾糧顆粒 ≤ 12 mm"
        ],
        [
          "電源",
          "5V ⎓ 1A＋4 顆 3 號電池（AA）"
        ],
        [
          "尺寸",
          "252 × 330 × 335 mm"
        ]
      ]
    },
    "en": {
      "name": "M12 Smart Camera Feeder",
      "tagline": "4 L (approx. 2 kg of dry food; around 3 weeks for an adult cat) · Detachable pan-tilt camera: 265° horizontal + 110° vertical",
      "features": [
        "Detachable pan-tilt camera: 265° horizontal + 110° vertical",
        "Infrared anti-jam sensor; kibble ≤ 12 mm",
        "5V DC 1A + 4 AA batteries"
      ],
      "specs": [
        [
          "Food capacity",
          "4 L (approx. 2 kg of dry food; around 3 weeks for an adult cat)"
        ],
        [
          "Camera",
          "Detachable pan-tilt camera: 265° horizontal + 110° vertical"
        ],
        [
          "Anti-jam sensing",
          "Infrared anti-jam sensor; kibble ≤ 12 mm"
        ],
        [
          "Power supply",
          "5V DC 1A + 4 AA batteries"
        ],
        [
          "Dimensions",
          "252 × 330 × 335 mm"
        ]
      ]
    },
    "th": {
      "name": "M12 เครื่องให้อาหารอัจฉริยะพร้อมกล้อง",
      "tagline": "4 ลิตร (อาหารเม็ดประมาณ 2 กก. เพียงพอสำหรับแมวโตประมาณ 3 สัปดาห์) · กล้องแพน-ทิลต์ถอดได้: แนวนอน 265° + แนวตั้ง 110°",
      "features": [
        "กล้องแพน-ทิลต์ถอดได้: แนวนอน 265° + แนวตั้ง 110°",
        "เซนเซอร์อินฟราเรดป้องกันการติดขัด; เม็ดอาหาร ≤ 12 มม.",
        "5V DC 1A + ถ่าน AA 4 ก้อน"
      ],
      "specs": [
        [
          "ความจุอาหาร",
          "4 ลิตร (อาหารเม็ดประมาณ 2 กก. เพียงพอสำหรับแมวโตประมาณ 3 สัปดาห์)"
        ],
        [
          "กล้อง",
          "กล้องแพน-ทิลต์ถอดได้: แนวนอน 265° + แนวตั้ง 110°"
        ],
        [
          "ระบบป้องกันอาหารติดขัด",
          "เซนเซอร์อินฟราเรดป้องกันการติดขัด; เม็ดอาหาร ≤ 12 มม."
        ],
        [
          "แหล่งจ่ายไฟ",
          "5V DC 1A + ถ่าน AA 4 ก้อน"
        ],
        [
          "ขนาด",
          "252 × 330 × 335 mm"
        ]
      ]
    }
  },
  "M31": {
    "zh-TW": {
      "name": "M31 小Q智能餵食器",
      "tagline": "3 L（成年貓約 2 週食量） · 小於 A4 紙",
      "features": [
        "小於 A4 紙",
        "4 顆 3 號電池（AA）獨立續航 40 天",
        "3 秒全卡扣快拆"
      ],
      "specs": [
        [
          "儲糧容量",
          "3 L（成年貓約 2 週食量）"
        ],
        [
          "機身大小",
          "小於 A4 紙"
        ],
        [
          "電池續航",
          "4 顆 3 號電池（AA）獨立續航 40 天"
        ],
        [
          "拆洗",
          "3 秒全卡扣快拆"
        ],
        [
          "電源",
          "5V ⎓ 1A"
        ],
        [
          "尺寸",
          "182 × 300 × 262 mm"
        ]
      ]
    },
    "en": {
      "name": "M31 Compact Smart Feeder",
      "tagline": "3 L (around 2 weeks of food for an adult cat) · Footprint smaller than an A4 sheet",
      "features": [
        "Footprint smaller than an A4 sheet",
        "40 days on 4 AA batteries alone",
        "All-clip quick release in 3 seconds"
      ],
      "specs": [
        [
          "Food capacity",
          "3 L (around 2 weeks of food for an adult cat)"
        ],
        [
          "Compact footprint",
          "Footprint smaller than an A4 sheet"
        ],
        [
          "Battery runtime",
          "40 days on 4 AA batteries alone"
        ],
        [
          "Disassembly",
          "All-clip quick release in 3 seconds"
        ],
        [
          "Power supply",
          "5V DC 1A"
        ],
        [
          "Dimensions",
          "182 × 300 × 262 mm"
        ]
      ]
    },
    "th": {
      "name": "M31 เครื่องให้อาหารอัจฉริยะขนาดกะทัดรัด",
      "tagline": "3 ลิตร (อาหารสำหรับแมวโตประมาณ 2 สัปดาห์) · ใช้พื้นที่น้อยกว่ากระดาษ A4",
      "features": [
        "ใช้พื้นที่น้อยกว่ากระดาษ A4",
        "ใช้งานด้วยถ่าน AA 4 ก้อน ได้นาน 40 วัน",
        "ถอดทุกชิ้นด้วยคลิปล็อกภายใน 3 วินาที"
      ],
      "specs": [
        [
          "ความจุอาหาร",
          "3 ลิตร (อาหารสำหรับแมวโตประมาณ 2 สัปดาห์)"
        ],
        [
          "พื้นที่ติดตั้ง",
          "ใช้พื้นที่น้อยกว่ากระดาษ A4"
        ],
        [
          "ระยะเวลาใช้งานด้วยถ่าน",
          "ใช้งานด้วยถ่าน AA 4 ก้อน ได้นาน 40 วัน"
        ],
        [
          "การถอดล้าง",
          "ถอดทุกชิ้นด้วยคลิปล็อกภายใน 3 วินาที"
        ],
        [
          "แหล่งจ่ายไฟ",
          "5V DC 1A"
        ],
        [
          "ขนาด",
          "182 × 300 × 262 mm"
        ]
      ]
    }
  },
  "D61": {
    "zh-TW": {
      "name": "D61 不鏽鋼無線飲水機",
      "tagline": "4 L（成年貓 10 天以上飲水量） · 內置鋰電池最長 47 天",
      "features": [
        "內置鋰電池最長 47 天",
        "雷達感應＋定時雙模式",
        "≤ 30 dB"
      ],
      "specs": [
        [
          "水箱容量",
          "4 L（成年貓 10 天以上飲水量）"
        ],
        [
          "電池續航",
          "內置鋰電池最長 47 天"
        ],
        [
          "出水模式",
          "雷達感應＋定時雙模式"
        ],
        [
          "運轉噪音",
          "≤ 30 dB"
        ],
        [
          "電源／功率",
          "5V ⎓ 1A（2.5W）"
        ],
        [
          "尺寸",
          "192 × 250 × 155 mm"
        ]
      ]
    },
    "en": {
      "name": "D61 Cordless Stainless Steel Pet Fountain",
      "tagline": "4 L (over 10 days of drinking water for an adult cat) · Built-in lithium battery, up to 47 days",
      "features": [
        "Built-in lithium battery, up to 47 days",
        "Dual modes: radar sensing + timed flow",
        "≤ 30 dB"
      ],
      "specs": [
        [
          "Water capacity",
          "4 L (over 10 days of drinking water for an adult cat)"
        ],
        [
          "Cordless runtime",
          "Built-in lithium battery, up to 47 days"
        ],
        [
          "Water modes",
          "Dual modes: radar sensing + timed flow"
        ],
        [
          "Operating noise",
          "≤ 30 dB"
        ],
        [
          "Power supply / power",
          "5V DC 1A (2.5W)"
        ],
        [
          "Dimensions",
          "192 × 250 × 155 mm"
        ]
      ]
    },
    "th": {
      "name": "D61 น้ำพุสัตว์เลี้ยงสเตนเลสไร้สาย",
      "tagline": "4 ลิตร (ปริมาณน้ำดื่มสำหรับแมวโตมากกว่า 10 วัน) · แบตเตอรี่ลิเธียมในตัว ใช้งานไร้สายสูงสุด 47 วัน",
      "features": [
        "แบตเตอรี่ลิเธียมในตัว ใช้งานไร้สายสูงสุด 47 วัน",
        "2 โหมด: ตรวจจับด้วยเรดาร์ + ตั้งเวลา",
        "≤ 30 dB"
      ],
      "specs": [
        [
          "ความจุน้ำ",
          "4 ลิตร (ปริมาณน้ำดื่มสำหรับแมวโตมากกว่า 10 วัน)"
        ],
        [
          "ระยะเวลาใช้งานไร้สาย",
          "แบตเตอรี่ลิเธียมในตัว ใช้งานไร้สายสูงสุด 47 วัน"
        ],
        [
          "โหมดจ่ายน้ำ",
          "2 โหมด: ตรวจจับด้วยเรดาร์ + ตั้งเวลา"
        ],
        [
          "ระดับเสียง",
          "≤ 30 dB"
        ],
        [
          "แหล่งจ่ายไฟ / กำลังไฟ",
          "5V DC 1A (2.5W)"
        ],
        [
          "ขนาด",
          "192 × 250 × 155 mm"
        ]
      ]
    }
  },
  "D11BA": {
    "zh-TW": {
      "name": "D11-BA 雙無線飲水機",
      "tagline": "2.5 L（2,500 mL） · 3,000 mAh 鋰電池，45 天續航",
      "features": [
        "3,000 mAh 鋰電池，45 天續航",
        "內部無線磁感應水泵＋電池無線供電",
        "220° 超廣角雙雷達"
      ],
      "specs": [
        [
          "水箱容量",
          "2.5 L（2,500 mL）"
        ],
        [
          "電池續航",
          "3,000 mAh 鋰電池，45 天續航"
        ],
        [
          "雙無線",
          "內部無線磁感應水泵＋電池無線供電"
        ],
        [
          "感應",
          "220° 超廣角雙雷達"
        ],
        [
          "水盤",
          "5° 傾斜 304 不鏽鋼水盤"
        ],
        [
          "過濾",
          "Ag+ 銀離子五重抑菌過濾"
        ]
      ]
    },
    "en": {
      "name": "D11-BA Dual Cordless Pet Fountain",
      "tagline": "2.5 L (2,500 mL) · 3,000 mAh lithium battery, 45-day runtime",
      "features": [
        "3,000 mAh lithium battery, 45-day runtime",
        "Internal wireless magnetic-induction pump + cordless battery power",
        "220° ultra-wide-angle dual radar"
      ],
      "specs": [
        [
          "Water capacity",
          "2.5 L (2,500 mL)"
        ],
        [
          "Battery runtime",
          "3,000 mAh lithium battery, 45-day runtime"
        ],
        [
          "Dual cordless design",
          "Internal wireless magnetic-induction pump + cordless battery power"
        ],
        [
          "Sensing",
          "220° ultra-wide-angle dual radar"
        ],
        [
          "Drinking tray",
          "5° inclined 304 stainless-steel tray"
        ],
        [
          "Filtration",
          "Five-stage antibacterial filtration with Ag+ silver ions"
        ]
      ]
    },
    "th": {
      "name": "D11-BA น้ำพุสัตว์เลี้ยงไร้สายคู่",
      "tagline": "2.5 ลิตร (2,500 มล.) · แบตเตอรี่ลิเธียม 3,000 mAh ใช้งานได้ 45 วัน",
      "features": [
        "แบตเตอรี่ลิเธียม 3,000 mAh ใช้งานได้ 45 วัน",
        "ปั๊มน้ำภายในไร้สายแบบเหนี่ยวนำแม่เหล็ก + พลังงานแบตเตอรี่ไร้สาย",
        "เรดาร์คู่มุมกว้างพิเศษ 220°"
      ],
      "specs": [
        [
          "ความจุน้ำ",
          "2.5 ลิตร (2,500 มล.)"
        ],
        [
          "ระยะเวลาใช้งานแบตเตอรี่",
          "แบตเตอรี่ลิเธียม 3,000 mAh ใช้งานได้ 45 วัน"
        ],
        [
          "ระบบไร้สายคู่",
          "ปั๊มน้ำภายในไร้สายแบบเหนี่ยวนำแม่เหล็ก + พลังงานแบตเตอรี่ไร้สาย"
        ],
        [
          "การตรวจจับ",
          "เรดาร์คู่มุมกว้างพิเศษ 220°"
        ],
        [
          "ถาดน้ำ",
          "ถาดสเตนเลส 304 เอียง 5°"
        ],
        [
          "ระบบกรอง",
          "ระบบกรอง 5 ขั้นตอน ยับยั้งแบคทีเรียด้วยไอออนเงิน Ag+"
        ]
      ]
    }
  }
};
export const modelBySlug: Readonly<Partial<Record<string, ProductModel>>> = {
  "m81-fresh-food-feeder": "M81",
  "m12-panoramic-feeder": "M12",
  "m31-gashapon-feeder": "M31",
  "d61-stainless-dispenser": "D61",
  "d11ba-water-dispenser": "D11BA"
};
export const modelOrder: readonly ProductModel[] = ['M81','M12','M31','D61','D11BA'];
export function productBySku(sku: string, locale: Locale): ProductTranslation | undefined {
  const bySlug = modelBySlug[sku];
  const normalized = sku.toUpperCase().replace(/^WH-/, '').replace(/-TW$/, '').replace(/[^A-Z0-9]/g, '');
  const model = bySlug ?? modelOrder.find(m => m === normalized);
  return model ? productCopy[model][locale] : undefined;
}
