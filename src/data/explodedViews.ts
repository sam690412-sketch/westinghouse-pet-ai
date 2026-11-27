import type { Locale } from '@/i18n/types';
export type LocalizedCopy = Record<Locale, string>;
export interface Hotspot { x: number; y: number; title: LocalizedCopy; description: LocalizedCopy }
export interface ExplodedViewData { image: string; width: number; height: number; hotspots: Hotspot[] }
/** Hotspots are visual annotations of the supplied illustrations, not verified CAD component coordinates. */
export const explodedViews: Partial<Record<string, ExplodedViewData>> = {
  "m81-fresh-food-feeder": {
    "image": "/images/products/exploded/m81-exploded.png",
    "width": 1024,
    "height": 1536,
    "hotspots": [
      {
        "x": 40,
        "y": 6,
        "title": {
          "zh-TW": "旋轉鏡頭",
          "en": "Rotating camera",
          "th": "กล้องหมุน"
        },
        "description": {
          "zh-TW": "300° 旋轉鏡頭，可查看餵食情況。",
          "en": "300° rotating camera for viewing feeding.",
          "th": "กล้องหมุน 300° สำหรับดูการให้อาหาร"
        }
      },
      {
        "x": 50,
        "y": 27,
        "title": {
          "zh-TW": "五格食盆",
          "en": "Five food compartments",
          "th": "ถาดอาหารห้าช่อง"
        },
        "description": {
          "zh-TW": "每格 250 mL；四格 4°C 製冷，一格 25–28°C 預熱。",
          "en": "250 mL per compartment: four cooled to 4°C and one preheated to 25–28°C.",
          "th": "ช่องละ 250 มล. ทำความเย็น 4°C สี่ช่อง อุ่นล่วงหน้า 25–28°C หนึ่งช่อง"
        }
      },
      {
        "x": 47,
        "y": 42,
        "title": {
          "zh-TW": "食盆支撐層",
          "en": "Tray support layer",
          "th": "ชั้นรองถาด"
        },
        "description": {
          "zh-TW": "圖中食盆下方的支撐構造。",
          "en": "Illustrated support beneath the food tray.",
          "th": "ภาพแสดงโครงรองใต้ถาดอาหาร"
        }
      },
      {
        "x": 49,
        "y": 49,
        "title": {
          "zh-TW": "溫控區域",
          "en": "Temperature-control area",
          "th": "บริเวณควบคุมอุณหภูมิ"
        },
        "description": {
          "zh-TW": "製冷及預熱功能的工程示意位置。",
          "en": "Illustrated area associated with cooling and preheating.",
          "th": "บริเวณในภาพประกอบสำหรับการทำความเย็นและอุ่นอาหาร"
        }
      },
      {
        "x": 49,
        "y": 67,
        "title": {
          "zh-TW": "主機外殼",
          "en": "Main housing",
          "th": "ตัวเครื่อง"
        },
        "description": {
          "zh-TW": "機身尺寸 310 × 300 × 253 mm。",
          "en": "Dimensions: 310 × 300 × 253 mm.",
          "th": "ขนาดตัวเครื่อง 310 × 300 × 253 มม."
        }
      },
      {
        "x": 49,
        "y": 79,
        "title": {
          "zh-TW": "電控與底座",
          "en": "Electronics and base",
          "th": "ระบบไฟฟ้าและฐาน"
        },
        "description": {
          "zh-TW": "12V ⎓ 10A、120W；附 100–240V 變壓器。",
          "en": "12V DC 10A, 120W; 100–240V AC adapter included.",
          "th": "12V DC 10A, 120W พร้อมอะแดปเตอร์ 100–240V AC"
        }
      }
    ]
  },
  "m12-panoramic-feeder": {
    "image": "/images/products/exploded/m12-exploded.png",
    "width": 1024,
    "height": 1536,
    "hotspots": [
      {
        "x": 56,
        "y": 4,
        "title": {
          "zh-TW": "上蓋",
          "en": "Top cover",
          "th": "ฝาด้านบน"
        },
        "description": {
          "zh-TW": "圖中儲糧桶上方的可見上蓋。",
          "en": "Visible cover above the food hopper in the illustration.",
          "th": "ฝาที่เห็นเหนือถังอาหารในภาพ"
        }
      },
      {
        "x": 56,
        "y": 21,
        "title": {
          "zh-TW": "儲糧桶",
          "en": "Food hopper",
          "th": "ถังอาหาร"
        },
        "description": {
          "zh-TW": "4 L，約 2 kg 乾糧，成年貓約 3 週食量。",
          "en": "4 L, about 2 kg of dry food, around three weeks for an adult cat.",
          "th": "4 ลิตร อาหารเม็ดประมาณ 2 กก. สำหรับแมวโตประมาณ 3 สัปดาห์"
        }
      },
      {
        "x": 58,
        "y": 32,
        "title": {
          "zh-TW": "出糧機構",
          "en": "Dispensing mechanism",
          "th": "กลไกจ่ายอาหาร"
        },
        "description": {
          "zh-TW": "紅外線防堵塞感應，乾糧顆粒 ≤ 12 mm。",
          "en": "Infrared anti-jam sensing for kibble ≤ 12 mm.",
          "th": "เซนเซอร์อินฟราเรดป้องกันติดขัด สำหรับเม็ดอาหาร ≤ 12 มม."
        }
      },
      {
        "x": 18,
        "y": 57,
        "title": {
          "zh-TW": "可拆卸雲台鏡頭",
          "en": "Detachable pan-tilt camera",
          "th": "กล้องแพน-ทิลต์ถอดได้"
        },
        "description": {
          "zh-TW": "橫向 265°＋豎向 110°。",
          "en": "265° horizontal and 110° vertical.",
          "th": "แนวนอน 265° และแนวตั้ง 110°"
        }
      },
      {
        "x": 62,
        "y": 80,
        "title": {
          "zh-TW": "食盆",
          "en": "Feeding bowl",
          "th": "ชามอาหาร"
        },
        "description": {
          "zh-TW": "圖中機身下方的餵食區。",
          "en": "Illustrated feeding area below the housing.",
          "th": "พื้นที่ให้อาหารใต้ตัวเครื่องในภาพ"
        }
      },
      {
        "x": 54,
        "y": 92,
        "title": {
          "zh-TW": "底座與供電",
          "en": "Base and power",
          "th": "ฐานและแหล่งจ่ายไฟ"
        },
        "description": {
          "zh-TW": "5V ⎓ 1A＋4 顆 AA 電池；252 × 330 × 335 mm。",
          "en": "5V DC 1A + 4 AA batteries; 252 × 330 × 335 mm.",
          "th": "5V DC 1A + ถ่าน AA 4 ก้อน; 252 × 330 × 335 มม."
        }
      }
    ]
  },
  "m31-gashapon-feeder": {
    "image": "/images/products/exploded/m31-exploded.png",
    "width": 1024,
    "height": 1536,
    "hotspots": [
      {
        "x": 57,
        "y": 4,
        "title": {
          "zh-TW": "上蓋",
          "en": "Top lid",
          "th": "ฝาด้านบน"
        },
        "description": {
          "zh-TW": "圖中可見上蓋。",
          "en": "Visible top lid in the illustration.",
          "th": "ฝาด้านบนที่เห็นในภาพ"
        }
      },
      {
        "x": 57,
        "y": 25,
        "title": {
          "zh-TW": "3L 儲糧桶",
          "en": "3L food hopper",
          "th": "ถังอาหาร 3 ลิตร"
        },
        "description": {
          "zh-TW": "3 L，成年貓約 2 週食量。",
          "en": "3 L, around two weeks of food for an adult cat.",
          "th": "3 ลิตร สำหรับแมวโตประมาณ 2 สัปดาห์"
        }
      },
      {
        "x": 55,
        "y": 45,
        "title": {
          "zh-TW": "出糧與快拆",
          "en": "Dispensing and quick release",
          "th": "กลไกจ่ายอาหารและถอดเร็ว"
        },
        "description": {
          "zh-TW": "3 秒全卡扣快拆設計。",
          "en": "All-clip quick release in 3 seconds.",
          "th": "ถอดทุกชิ้นด้วยคลิปล็อกภายใน 3 วินาที"
        }
      },
      {
        "x": 58,
        "y": 60,
        "title": {
          "zh-TW": "小型機身",
          "en": "Compact housing",
          "th": "ตัวเครื่องกะทัดรัด"
        },
        "description": {
          "zh-TW": "機身占地小於 A4 紙，尺寸 182 × 300 × 262 mm。",
          "en": "Footprint smaller than A4; dimensions 182 × 300 × 262 mm.",
          "th": "ใช้พื้นที่น้อยกว่ากระดาษ A4; ขนาด 182 × 300 × 262 มม."
        }
      },
      {
        "x": 24,
        "y": 73,
        "title": {
          "zh-TW": "食盆",
          "en": "Feeding bowl",
          "th": "ชามอาหาร"
        },
        "description": {
          "zh-TW": "圖中可見的食盆。",
          "en": "Feeding bowl shown in the illustration.",
          "th": "ชามอาหารที่เห็นในภาพ"
        }
      },
      {
        "x": 61,
        "y": 86,
        "title": {
          "zh-TW": "底部供電",
          "en": "Base power",
          "th": "แหล่งจ่ายไฟที่ฐาน"
        },
        "description": {
          "zh-TW": "5V ⎓ 1A；4 顆 AA 電池獨立續航 40 天。",
          "en": "5V DC 1A; 40 days on 4 AA batteries alone.",
          "th": "5V DC 1A; ใช้ถ่าน AA 4 ก้อน ได้นาน 40 วัน"
        }
      }
    ]
  },
  "d61-stainless-dispenser": {
    "image": "/images/products/exploded/d61-exploded.png",
    "width": 1024,
    "height": 1536,
    "hotspots": [
      {
        "x": 50,
        "y": 14,
        "title": {
          "zh-TW": "飲水盤",
          "en": "Drinking tray",
          "th": "ถาดน้ำ"
        },
        "description": {
          "zh-TW": "圖中可見的不鏽鋼飲水區。",
          "en": "Illustrated stainless-steel drinking area.",
          "th": "บริเวณดื่มน้ำสเตนเลสในภาพ"
        }
      },
      {
        "x": 35,
        "y": 36,
        "title": {
          "zh-TW": "過濾區",
          "en": "Filter area",
          "th": "บริเวณกรองน้ำ"
        },
        "description": {
          "zh-TW": "圖示過濾層，實際濾材依原廠版本為準。",
          "en": "Illustrated filter layers; actual media depend on the manufacturer version.",
          "th": "ภาพแสดงชั้นกรอง วัสดุจริงขึ้นอยู่กับรุ่นของผู้ผลิต"
        }
      },
      {
        "x": 66,
        "y": 46,
        "title": {
          "zh-TW": "循環區",
          "en": "Circulation area",
          "th": "บริเวณหมุนเวียนน้ำ"
        },
        "description": {
          "zh-TW": "雷達感應＋定時雙模式，運轉噪音 ≤ 30 dB。",
          "en": "Radar sensing + timed modes; operating noise ≤ 30 dB.",
          "th": "โหมดเรดาร์ + ตั้งเวลา; ระดับเสียง ≤ 30 dB"
        }
      },
      {
        "x": 51,
        "y": 68,
        "title": {
          "zh-TW": "4L 水箱",
          "en": "4L reservoir",
          "th": "ถังน้ำ 4 ลิตร"
        },
        "description": {
          "zh-TW": "4 L，成年貓 10 天以上飲水量。",
          "en": "4 L, over ten days of drinking water for an adult cat.",
          "th": "4 ลิตร สำหรับแมวโตมากกว่า 10 วัน"
        }
      },
      {
        "x": 51,
        "y": 83,
        "title": {
          "zh-TW": "電控區域",
          "en": "Electronics area",
          "th": "บริเวณวงจรไฟฟ้า"
        },
        "description": {
          "zh-TW": "5V ⎓ 1A（2.5W），內置鋰電池最長 47 天。",
          "en": "5V DC 1A (2.5W), built-in lithium battery up to 47 days.",
          "th": "5V DC 1A (2.5W) แบตเตอรี่ลิเธียมในตัวสูงสุด 47 วัน"
        }
      },
      {
        "x": 50,
        "y": 92,
        "title": {
          "zh-TW": "底座",
          "en": "Base",
          "th": "ฐาน"
        },
        "description": {
          "zh-TW": "整機尺寸 192 × 250 × 155 mm。",
          "en": "Dimensions: 192 × 250 × 155 mm.",
          "th": "ขนาด 192 × 250 × 155 มม."
        }
      }
    ]
  },
  "d11ba-water-dispenser": {
    "image": "/images/products/exploded/d11ba-exploded.png",
    "width": 1024,
    "height": 1536,
    "hotspots": [
      {
        "x": 50,
        "y": 8,
        "title": {
          "zh-TW": "304 不鏽鋼水盤",
          "en": "304 stainless-steel tray",
          "th": "ถาดสเตนเลส 304"
        },
        "description": {
          "zh-TW": "5° 傾斜水盤。",
          "en": "5° inclined tray.",
          "th": "ถาดน้ำเอียง 5°"
        }
      },
      {
        "x": 50,
        "y": 17,
        "title": {
          "zh-TW": "五重過濾",
          "en": "Five-stage filtration",
          "th": "การกรองห้าขั้นตอน"
        },
        "description": {
          "zh-TW": "Ag+ 銀離子五重抑菌過濾。",
          "en": "Five-stage antibacterial filtration with Ag+ silver ions.",
          "th": "กรอง 5 ขั้นตอน ยับยั้งแบคทีเรียด้วยไอออนเงิน Ag+"
        }
      },
      {
        "x": 50,
        "y": 44,
        "title": {
          "zh-TW": "無線水泵",
          "en": "Wireless pump",
          "th": "ปั๊มน้ำไร้สาย"
        },
        "description": {
          "zh-TW": "內部無線磁感應水泵，搭配電池供電形成雙無線。",
          "en": "Internal wireless magnetic-induction pump plus battery-powered cordless operation.",
          "th": "ปั๊มน้ำไร้สายแบบเหนี่ยวนำแม่เหล็ก ใช้ร่วมกับแบตเตอรี่ไร้สาย"
        }
      },
      {
        "x": 50,
        "y": 66,
        "title": {
          "zh-TW": "2.5L 水箱",
          "en": "2.5L reservoir",
          "th": "ถังน้ำ 2.5 ลิตร"
        },
        "description": {
          "zh-TW": "容量 2,500 mL。",
          "en": "Capacity: 2,500 mL.",
          "th": "ความจุ 2,500 มล."
        }
      },
      {
        "x": 72,
        "y": 66,
        "title": {
          "zh-TW": "機身感應區",
          "en": "Housing sensing area",
          "th": "บริเวณตรวจจับที่ตัวเครื่อง"
        },
        "description": {
          "zh-TW": "220° 超廣角雙雷達；圖示位置不代表實際感應器安裝點。",
          "en": "220° ultra-wide dual radar; the illustration does not establish exact sensor placement.",
          "th": "เรดาร์คู่มุมกว้าง 220° ตำแหน่งในภาพไม่ใช่จุดติดตั้งเซนเซอร์จริง"
        }
      },
      {
        "x": 50,
        "y": 83,
        "title": {
          "zh-TW": "底座與電池",
          "en": "Base and battery",
          "th": "ฐานและแบตเตอรี่"
        },
        "description": {
          "zh-TW": "3,000 mAh 鋰電池，45 天續航。",
          "en": "3,000 mAh lithium battery, 45-day runtime.",
          "th": "แบตเตอรี่ลิเธียม 3,000 mAh ใช้งานได้ 45 วัน"
        }
      }
    ]
  }
};
const text = (zh: string, en: string, th: string): LocalizedCopy => ({'zh-TW': zh, en, th});
export const explodedLabels = {
  title: text('微精密工程結構展示','Precision engineering exploded view','ภาพแยกชิ้นส่วนวิศวกรรมความละเอียดสูง'),
  note: text('工程示意圖｜零件位置與拆裝方式以原廠資料為準。','Engineering illustration | Refer to manufacturer documentation for actual part positions and disassembly.','ภาพประกอบทางวิศวกรรม | ตำแหน่งชิ้นส่วนและวิธีถอดประกอบให้ยึดเอกสารผู้ผลิต'),
  reset: text('重設視角','Reset view','รีเซ็ตมุมมอง'),
  select: text('點選標點探索結構','Select a hotspot to explore','เลือกจุดเพื่อดูรายละเอียด'),
  unavailable: text('圖片暫時無法載入','Image temporarily unavailable','ไม่สามารถโหลดภาพได้ชั่วคราว'),
};
