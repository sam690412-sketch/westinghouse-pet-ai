export interface SolutionData {
  slug: string;
  title: string;
  subtitle: string;
  painPoint: string;
  solution: string;
  tips: string[];
  recommendedProducts: string[];
  icon: string;
}

export const SOLUTIONS: SolutionData[] = [
  {
    slug: "cat-not-drinking-water",
    title: "貓咪不喝水怎麼辦？",
    subtitle: "讓貓咪愛上喝水的五大技巧",
    painPoint: "貓咪天生不愛喝水，飲水不足容易導致腎臟疾病和泌尿問題。",
    solution: "使用流動水設計的智慧飲水機，模擬天然水源，吸引貓咪主動飲水。搭配正確擺放位置和獎勵機制，讓喝水變成貓咪的日常習慣。",
    tips: ["飲水機放在貓咪活動路徑上","每天更換新鮮水","使用流動水設計","食盆與水盆分開擺放","在水裡加一點貓草或肉湯提味"],
    recommendedProducts: ["d11ba-water-dispenser"],
    icon: "droplets",
  },
  {
    slug: "multi-cat-household-feeding",
    title: "多貓家庭餵食攻略",
    subtitle: "多貓共用與分流方案",
    painPoint: "多貓家庭中，搶食、食量不一、飲食衝突是常見困擾。",
    solution: "使用多檯餵食器分流餵食，設定不同的餵食時間和份量，讓每隻貓都能安心吃到專屬的食物。",
    tips: ["每隻貓專屬餵食器","分區擺放避免搶食","設定不同餵食時間","記錄每隻貓食量","定期觀察體重變化"],
    recommendedProducts: ["m81-fresh-food-feeder", "m12-panoramic-feeder"],
    icon: "users",
  },
  {
    slug: "long-hours-away-cat-care",
    title: "長時間不在家怎麼辦？",
    subtitle: "出差旅行安心餵食方案",
    painPoint: "上班族經常早出晚歸，週末或出差時擔心毛孩挨餓。",
    solution: "智慧餵食器搭配飲水機，透過手機APP隨時監控和調整餵食計畫，讓您無論身在何處都能安心。",
    tips: ["設定多時段自動餵食","使用大容量機型","開啟低食量和異常通知","出遠門請朋友定期探視","事先測試餵食器運作"],
    recommendedProducts: ["m81-fresh-food-feeder", "d11ba-water-dispenser"],
    icon: "briefcase",
  },
  {
    slug: "wet-food-fresh-storage",
    title: "濕糧保鮮保存指南",
    subtitle: "鮮食保鮮不浪費",
    painPoint: "開封後的濕糧容易變質，夏天尤其嚴重，倒掉又浪費。",
    solution: "使用密封設計的餵食器搭配保鮮功能，開封後可冷藏保存，分批定時餵食，避免食物變質浪費。",
    tips: ["開封後冷藏保存","使用密封餵食器","少量多次餵食","觀察食物新鮮度","避免長時間放置室溫"],
    recommendedProducts: ["m81-fresh-food-feeder"],
    icon: "refrigerator",
  },
  {
    slug: "kidney-disease-cat-care",
    title: "腎貓照護指南",
    subtitle: "腎貓飲水與飲食管理",
    painPoint: "腎臟病是貓咪常見疾病，需要特別管理飲水量和飲食內容。",
    solution: "確保充足飲水是腎貓照護的關鍵。使用流動飲水機鼓勵貓咪多喝水，搭配適當的飲食管理，延緩病情發展。",
    tips: ["確保隨時有新鮮飲水","監控每日飲水量","搭配獸醫建議的飼料","定期回診檢查","維持安靜舒適環境"],
    recommendedProducts: ["d11ba-water-dispenser", "d61-stainless-dispenser"],
    icon: "heart-pulse",
  },
  {
    slug: "first-time-cat-owner-essentials",
    title: "新手養貓必備指南",
    subtitle: "第一次養貓必備知識與用品",
    painPoint: "第一次養貓不知道要準備什麼，擔心買錯東西花冤枉錢。",
    solution: "從飲食管理到日常照護，智慧寵物用品能讓新手飼主事半功倍。自動餵食器和飲水機是最值得投資的入門裝備。",
    tips: ["先準備基本用品再慢慢添置","自動餵食器解決定時餵食困擾","飲水機確保貓咪喝足夠水","設置貓咪專屬活動空間","建立規律的生活作息"],
    recommendedProducts: ["m12-panoramic-feeder", "d11ba-water-dispenser"],
    icon: "cat",
  },
];
