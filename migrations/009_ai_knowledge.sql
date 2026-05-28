-- ================================================================
-- Migration: AI Knowledge Base
-- Phase 5.0 — AI Customer Service
-- ================================================================

CREATE TABLE IF NOT EXISTS ai_knowledge (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category        VARCHAR(50) NOT NULL,
    question        TEXT NOT NULL,
    answer          TEXT NOT NULL,
    source_url      TEXT,
    tags            TEXT[] DEFAULT '{}',
    enabled         BOOLEAN DEFAULT true,
    priority        INTEGER DEFAULT 0,
    escalation_note TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_knowledge_category ON ai_knowledge(category);
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_enabled ON ai_knowledge(enabled);
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_priority ON ai_knowledge(priority DESC);
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_search ON ai_knowledge USING gin(to_tsvector('chinese', question || ' ' || COALESCE(answer, '')));

-- ================================================================
-- Seed Data — Product Knowledge
-- ================================================================

INSERT INTO ai_knowledge (category, question, answer, tags, priority) VALUES
('product', 'D11-BA 和 D61 怎麼選？', 'D11-BA 是我們最熱銷的入門款，靜音湧泉設計，價格親民（NT$2,490），適合大多數貓咪家庭。\n\nD61 採用醫療級 304 不鏽鋼材質，有抗菌認證（NT$3,290），適合對材質安全要求更高的飼主，或有腎臟保健需求的貓咪。\n\n如果預算充足且重視材質安全，選 D61；如果是第一台飲水機，D11-BA 就很好用。', ARRAY['飲水機', 'D11-BA', 'D61', '比較'], 10),
('product', 'M81 可以放濕糧嗎？', '可以！M81 是專為鮮食設計的智慧餵食器，支援鮮食與乾糧混合餵食。\n\n獨特的密封保鮮設計能延緩濕糧變質，讓您安心設定多時段自動餵食。\n\n如果您經常給貓咪吃罐頭或生骨肉，M81 是目前市面上最適合的選擇。', ARRAY['M81', '濕糧', '鮮食', '餵食器'], 10),
('product', 'M12 和 M31 怎麼選？', 'M12 有智慧全景鏡頭和雙向語音，4L 大容量，適合多貓家庭或想隨時看毛孩的飼主（NT$3,490）。\n\nM31 是趣味扭蛋餵食器，讓餵食變成互動遊戲，價格較親民（NT$2,890），適合單貓家庭或喜歡互動的貓咪。\n\n想要監控功能選 M12，想要趣味互動選 M31。', ARRAY['M12', 'M31', '餵食器', '比較'], 9),
('product', '新手應該買哪一台？', '新手飼主我們推薦「餵食 + 飲水」組合：\n\n1. D11-BA 飲水機（NT$2,490）— 讓貓咪愛上喝水\n2. M12 全景餵食器（NT$3,490）— 定時定量，隨時看見毛孩\n\n這兩台都有手機 APP 控制，操作簡單直覺。組合購買更優惠！', ARRAY['新手', '入門', '推薦', '組合'], 10),
('setup', '怎麼連接 WiFi？', '設定步驟：\n1. 下載 Westinghouse Pet App（iOS / Android）\n2. 長按產品上的 WiFi 鍵 3 秒，直到指示燈閃爍\n3. 打開 App，點「新增設備」\n4. 選擇您的 WiFi 網路並輸入密碼\n5. 等待配對完成（約 30 秒）\n\n注意：目前僅支援 2.4GHz WiFi，不支援 5GHz 或企業級 WiFi。', ARRAY['WiFi', '設定', '連接', 'App'], 10),
('filter', '濾芯多久換一次？', '建議每 4-6 週更換一次，視使用頻率與水質而定。\n\n更換方式：\n1. 打開飲水機上蓋\n2. 向上提起取出舊濾芯\n3. 插入新濾芯對準卡槽\n4. 更換後先讓水循環 5 分鐘再給寵物飲用\n\n當出水量明顯減少時，也表示該換濾芯了。建議使用 Westinghouse 原廠濾芯以確保過濾效果。', ARRAY['濾芯', '更換', '保養'], 10),
('warranty', '保固期多長？', '全系列產品均享有一年原廠保固，馬達核心部件延長至三年保固。\n\n保固範圍包括正常使用下的故障維修或更換。人為損壞、自行拆解、使用非原廠配件不在保固範圍內。\n\n建議收到商品後 30 天內完成保固登錄，以確保權益。', ARRAY['保固', '期限', '政策'], 10),
('warranty', '怎麼查保固狀態？', '請至「保固查詢」頁面，輸入您的訂單編號或產品序號即可查詢。\n\n如果您不確定序號在哪裡，請查看產品底部的標籤，或聯繫客服協助查詢。', ARRAY['保固', '查詢', '序號'], 9),
('shipping', '多久會到貨？', '台灣本島約 2-3 個工作天送達。超商取貨約 3-5 個工作天。外島約 5-7 個工作天。\n\n滿 NT$1,500 享免運。下單後會收到簡訊通知出貨進度。', ARRAY['配送', '運費', '到貨'], 9),
('shipping', '運費怎麼算？', '全館消費滿 NT$1,500 即享免運。未達免運門檻收取 NT$100 運費。外島地區另計。\n\n支援黑貓宅配、7-ELEVEN 取貨、全家取貨。', ARRAY['運費', '免運', '配送'], 9),
('payment', '支援哪些付款方式？', '我們支援信用卡（Visa / Master / JCB）、LINE Pay、超商取貨付款（7-ELEVEN / 全家）、銀行轉帳。\n\n信用卡可選擇 3 期、6 期、12 期零利率分期。', ARRAY['付款', '信用卡', '分期'], 8),
('refund', '退貨政策是什麼？', '收到商品後七天內，若產品未使用且包裝完整，可申請退換貨。\n\n退貨流程：\n1. 聯繫客服申請退貨\n2. 確認商品狀態符合退貨條件\n3. 寄回商品（運費由我方承擔）\n4. 收到商品檢查後 3-5 個工作天退款\n\n已使用或缺少配件的商品恕不接受退貨。', ARRAY['退貨', '退款', '退換'], 8)
ON CONFLICT DO NOTHING;
