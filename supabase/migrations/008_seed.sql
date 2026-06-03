-- ============================================================
-- 008_seed.sql
-- Initial product data for 5 SKUs
-- ============================================================

-- Seed product contents (synced from Payload CMS)
INSERT INTO public.product_contents (slug, sku, name, tagline, short_description, specs, features, category, solutions, hero_image_url, created_at, updated_at)
VALUES 
(
    'm81-fresh-food-feeder',
    'WH-M81-TW',
    'M81 鮮濕糧智慧餵食器',
    '4°C鎖鮮保存×25°C溫熱出糧',
    '西屋M81鮮濕糧智慧餵食器，4°C冷藏鎖鮮保存濕糧，25°C溫熱出糧，300°旋轉攝像機全屋可視，304不鏽鋼食碗防黑下巴。',
    '[
        {"label": "容量", "value": "4L"},
        {"label": "攝像頭", "value": "300°旋轉"},
        {"label": "材質", "value": "304不鏽鋼食碗"},
        {"label": "電壓", "value": "110V台灣專用"},
        {"label": "保固", "value": "1年"}
    ]'::jsonb,
    '[
        {"title": "4°C鎖鮮保存", "description": "冷藏保存濕糧，保持食材新鮮不變質", "icon": "snowflake"},
        {"title": "25°C溫熱出糧", "description": "加熱至適口溫度，讓貓咪愛上吃飯", "icon": "thermometer"},
        {"title": "300°全景攝像機", "description": "全屋可視，隨時查看貓咪進食狀況", "icon": "camera"},
        {"title": "304不鏽鋼食碗", "description": "防黑下巴設計，安全無毒", "icon": "shield"}
    ]'::jsonb,
    'feeder',
    ARRAY['wet-food-storage', 'kidney-disease-cat-care', 'long-hours-away-cat-care'],
    '/images/products/m81-hero.jpg',
    now(),
    now()
),
(
    'm12-panoramic-feeder',
    'WH-M12-TW',
    'M12 智慧全景餵食器',
    '全景可視科學餵養',
    '西屋M12智慧全景餵食器，4L大容量，全景攝影機，三重防卡糧設計，電源/電池雙供電，出差三周也不怕。',
    '[
        {"label": "容量", "value": "4L"},
        {"label": "攝像頭", "value": "全景"},
        {"label": "供電", "value": "電源/電池雙供電"},
        {"label": "電壓", "value": "110V台灣專用"},
        {"label": "保固", "value": "1年"}
    ]'::jsonb,
    '[
        {"title": "4L大容量", "description": "出差三周也不怕，大容量儲糧", "icon": "package"},
        {"title": "全景攝影機", "description": "隨時查看寵物進食情況", "icon": "camera"},
        {"title": "三重防卡糧", "description": "穩定出糧不卡糧，確保每一餐準時", "icon": "check-circle"},
        {"title": "雙供電系統", "description": "電源+電池備援，停電也不怕", "icon": "battery"}
    ]'::jsonb,
    'feeder',
    ARRAY['long-hours-away-cat-care', 'multi-cat-household-feeding'],
    '/images/products/m12-hero.jpg',
    now(),
    now()
),
(
    'm31-gashapon-feeder',
    'WH-M31-TW',
    'M31 智慧扭蛋餵食器',
    '扭蛋萌造型×3L黃金容量',
    '西屋M31智慧扭蛋餵食器，可愛扭蛋造型，3L黃金容量，全可拆洗設計，4節電池40天續航。',
    '[
        {"label": "容量", "value": "3L"},
        {"label": "造型", "value": "扭蛋機"},
        {"label": "續航", "value": "40天（電池）"},
        {"label": "電壓", "value": "110V台灣專用"},
        {"label": "保固", "value": "1年"}
    ]'::jsonb,
    '[
        {"title": "扭蛋可愛造型", "description": "萌趣設計，融入家居裝潢", "icon": "smile"},
        {"title": "3L黃金容量", "description": "小巧不佔空間，容量剛剛好", "icon": "package"},
        {"title": "全可拆洗", "description": "糧桶、食碗均可拆卸清洗", "icon": "droplet"},
        {"title": "40天續航", "description": "電池供電，擺放位置不受限", "icon": "battery"}
    ]'::jsonb,
    'feeder',
    ARRAY['first-time-cat-owner-essentials'],
    '/images/products/m31-hero.jpg',
    now(),
    now()
),
(
    'd11ba-water-dispenser',
    'WH-D11BA-TW',
    'D11-BA 智慧寵物飲水機',
    '2.5L大容量×飲水量監控',
    '西屋D11-BA智慧寵物飲水機，2.5L大容量，飲水量智能監控，靜音設計，讓貓咪愛上喝水。',
    '[
        {"label": "容量", "value": "2.5L"},
        {"label": "監控", "value": "飲水量統計"},
        {"label": "噪音", "value": "<30dB靜音"},
        {"label": "電壓", "value": "110V台灣專用"},
        {"label": "保固", "value": "1年"}
    ]'::jsonb,
    '[
        {"title": "飲水量監控", "description": "APP查看每日飲水量，掌握健康狀況", "icon": "activity"},
        {"title": "2.5L大容量", "description": "減少加水頻率，適合單貓家庭", "icon": "droplet"},
        {"title": "超靜音設計", "description": "<30dB運轉，不打擾睡眠", "icon": "volume-x"},
        {"title": "循環過濾", "description": "持續循環過濾，水質新鮮", "icon": "refresh-cw"}
    ]'::jsonb,
    'water_dispenser',
    ARRAY['cat-not-drinking-water', 'kidney-disease-cat-care'],
    '/images/products/d11ba-hero.jpg',
    now(),
    now()
),
(
    'd61-stainless-dispenser',
    'WH-D61-TW',
    'D61 智慧不鏽鋼寵物飲水機',
    '4L超大容量×47天續航',
    '西屋D61智慧不鏽鋼寵物飲水機，4L超大容量，47天超長續航，斷電不斷水，304不鏽鋼材質。',
    '[
        {"label": "容量", "value": "4L"},
        {"label": "續航", "value": "47天"},
        {"label": "材質", "value": "304不鏽鋼"},
        {"label": "電壓", "value": "110V台灣專用"},
        {"label": "保固", "value": "1年"}
    ]'::jsonb,
    '[
        {"title": "4L超大容量", "description": "多貓家庭首選，減少加水次數", "icon": "droplet"},
        {"title": "47天續航", "description": "內建電池，長時間外出也不怕", "icon": "battery"},
        {"title": "斷電不斷水", "description": "停電時仍可提供飲水", "icon": "zap"},
        {"title": "304不鏽鋼", "description": "食品級材質，不生鏽不殘留", "icon": "shield"}
    ]'::jsonb,
    'water_dispenser',
    ARRAY['cat-not-drinking-water', 'multi-cat-household-feeding', 'kidney-disease-cat-care'],
    '/images/products/d61-hero.jpg',
    now(),
    now()
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    tagline = EXCLUDED.tagline,
    short_description = EXCLUDED.short_description,
    specs = EXCLUDED.specs,
    features = EXCLUDED.features,
    solutions = EXCLUDED.solutions,
    hero_image_url = EXCLUDED.hero_image_url,
    updated_at = now();

-- Seed solutions
INSERT INTO public.solutions (slug, title, pain_point, audience, content, recommended_products, is_published, created_at, updated_at)
VALUES
(
    'cat-not-drinking-water',
    '貓咪不喝水怎麼辦？',
    '貓咪天生不愛喝水，長期飲水不足導致腎臟疾病',
    '貓咪飼主，特別是發現貓咪很少喝水的家庭',
    '{"sections": []}'::jsonb,
    ARRAY['WH-D11BA-TW', 'WH-D61-TW'],
    true,
    now(),
    now()
),
(
    'long-hours-away-cat-care',
    '長時間不在家貓咪怎麼辦？',
    '加班、出差無法準時餵食，貓咪餓肚子',
    '上班族、經常出差的飼主',
    '{"sections": []}'::jsonb,
    ARRAY['WH-M81-TW', 'WH-M12-TW'],
    true,
    now(),
    now()
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    pain_point = EXCLUDED.pain_point,
    recommended_products = EXCLUDED.recommended_products,
    updated_at = now();
