/**
 * AI Customer Service — Westinghouse Pet Taiwan
 * Rule-based AI with knowledge base lookup
 * Traditional Chinese (Taiwan) output only
 * No hallucination of private order/warranty data
 */

const { Client } = require("pg");
const aiLLM = require("./ai-llm.cjs");

const DATABASE_URI = process.env.DATABASE_URI || "";

/* ================================================================ */
/*  DATABASE — Knowledge Base Queries                               */
/* ================================================================ */

async function queryKnowledge(category, keyword) {
  if (!DATABASE_URI) return [];
  const client = new Client({
    connectionString: DATABASE_URI,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
    query_timeout: 8000,
  });
  try {
    await client.connect();
    let sql, params;
    if (keyword && keyword.length >= 2) {
      sql = `
        SELECT id, category, question, answer, source_url, tags, priority
        FROM ai_knowledge
        WHERE enabled = true
          AND (category = $1 OR $1 IS NULL)
          AND (question ILIKE $2 OR answer ILIKE $2 OR $2 = ANY(tags))
        ORDER BY priority DESC, updated_at DESC
        LIMIT 5
      `;
      params = [category || null, `%${keyword}%`];
    } else {
      sql = `
        SELECT id, category, question, answer, source_url, tags, priority
        FROM ai_knowledge
        WHERE enabled = true AND (category = $1 OR $1 IS NULL)
        ORDER BY priority DESC, updated_at DESC
        LIMIT 5
      `;
      params = [category || null];
    }
    const result = await client.query(sql, params);
    return result.rows;
  } catch {
    return [];
  } finally {
    await client.end().catch(() => {});
  }
}

/* ================================================================ */
/*  PRODUCT DATABASE — For recommendations                          */
/* ================================================================ */

async function queryProducts(slug) {
  if (!DATABASE_URI) return null;
  const client = new Client({
    connectionString: DATABASE_URI,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
  });
  try {
    await client.connect();
    const result = await client.query(
      `SELECT slug, name, tagline, short_description, category, price, compare_at_price, stock_status
       FROM product_contents pc
       JOIN commerce_products cp ON pc.sku = cp.sku AND cp.commerce_active = true
       WHERE pc.slug = $1 LIMIT 1`,
      [slug]
    );
    return result.rows[0] || null;
  } catch {
    return null;
  } finally {
    await client.end().catch(() => {});
  }
}

/* ================================================================ */
/*  RESPONSE BUILDER — Taiwan Traditional Chinese                   */
/* ================================================================ */

function buildResponse({ text, type = "text", actions = [], shouldEscalate = false, context = {} }) {
  return { reply: text, type, actions, shouldEscalate, context };
}

/* ================================================================ */
/*  ESCALATION DETECTION                                            */
/* ================================================================ */

const ESCALATION_KEYWORDS = [
  "退款", "退貨", "退錢", "退費", "退全款", "退部分",
  "爛", "壞了", " defective", "故障", "不會動", "沒反應",
  "生氣", "憤怒", "投訴", "抱怨", "不爽", "垃圾", "爛貨",
  "詐騙", "騙", "欺騙", "告", "法律", "律師", "消保會",
  "拒保", "保固被拒", "不給保", "保固失敗",
  "危險", "電到", "漏電", "燒起來", "冒煙", "燙傷",
];

function detectEscalation(input) {
  const lower = input.toLowerCase();
  return ESCALATION_KEYWORDS.some((kw) => lower.includes(kw.toLowerCase()));
}

/* ================================================================ */
/*  INTENT CLASSIFIER                                               */
/* ================================================================ */

function classifyIntent(input) {
  const lower = input.toLowerCase();
  if (/推薦|選哪|建議|適合|推|買哪/.test(lower)) return "recommend";
  if (/保固|保養|維修|壞|故障|修/.test(lower)) return "warranty";
  if (/訂單|付款|付錢|交易|刷卡|轉帳/.test(lower)) return "order";
  if (/運費|配送|寄送|幾天|到貨|物流/.test(lower)) return "shipping";
  if (/退貨|退錢|退款|退/.test(lower)) return "refund";
  if (/濾芯|過濾|濾心|換濾/.test(lower)) return "filter";
  if (/怎麼用|設定|安裝|連線|配對|wifi|連接/.test(lower)) return "setup";
  if (/貓不喝水|不喝水|喝水/.test(lower)) return "cat_drinking";
  if (/多貓|兩隻|三隻|多隻/.test(lower)) return "multi_cat";
  if (/D11|D61|飲水機|喝水/.test(lower)) return "product_water";
  if (/M81|M12|M31|餵食器|餵食/.test(lower)) return "product_feeder";
  if (/新手|第一次|入門/.test(lower)) return "beginner";
  if (/人工|客服|真人|轉接|人/.test(lower)) return "human_handoff";
  return "general";
}

/* ================================================================ */
/*  PRODUCT RECOMMENDATION ENGINE                                   */
/* ================================================================ */

function recommendProduct(input, context) {
  const lower = input.toLowerCase();
  let { petType, petCount, budget, problem } = context || {};

  // Detect pet type
  if (/貓|喵|cat/.test(lower)) petType = "cat";
  else if (/狗|汪|dog/.test(lower)) petType = "dog";

  // Detect count
  const countMatch = lower.match(/(\d+)\s*(隻|只|隻貓|隻狗)/);
  if (countMatch) petCount = parseInt(countMatch[1]);
  else if (/多貓|多隻|兩隻|三隻|四隻/.test(lower)) petCount = 2;
  else if (/一隻|單隻/.test(lower)) petCount = 1;

  // Detect budget
  if (/預算|價格|多少錢|便宜|貴/.test(lower)) {
    const budgetMatch = lower.match(/(\d{3,5})/);
    if (budgetMatch) budget = parseInt(budgetMatch[1]) * 100; // in cents
  }

  // Detect problem
  if (/不喝水|不愛喝|喝水少|不願意喝/.test(lower)) problem = "not_drinking";
  else if (/不在家|出差|旅行|加班/.test(lower)) problem = "away";
  else if (/濕糧|鮮食|罐頭|生骨肉/.test(lower)) problem = "wet_food";
  else if (/多貓|搶食|分開|各自/.test(lower)) problem = "multi_cat";
  else if (/腎|泌尿|結石/.test(lower)) problem = "kidney";
  else if (/新手|第一次/.test(lower)) problem = "beginner";

  // Recommendations
  const recs = [];

  if (problem === "not_drinking" || problem === "kidney") {
    recs.push({
      slug: "d11ba-water-dispenser",
      name: "D11-BA 智慧寵物飲水機",
      reason: "流動湧泉設計最能吸引貓咪喝水，四重過濾確保水質。特別適合不愛喝水或有腎臟保健需求的貓咪。",
      price: "NT$2,490",
    });
    if (budget >= 300000) {
      recs.push({
        slug: "d61-stainless-dispenser",
        name: "D61 智慧不鏽鋼寵物飲水機",
        reason: "醫療級 304 不鏽鋼材質，抗菌認證，對腎貓照護更安心。",
        price: "NT$3,290",
      });
    }
  }

  if (problem === "wet_food" || problem === "away") {
    recs.push({
      slug: "m81-fresh-food-feeder",
      name: "M81 鮮濕糧智慧餵食器",
      reason: "唯一支援鮮食與乾糧混合餵食的機型，密封保鮮設計讓濕糧不變質。出差也能遠端操控餵食。",
      price: "NT$4,990",
    });
  }

  if (problem === "multi_cat" && petCount >= 2) {
    recs.push({
      slug: "m12-panoramic-feeder",
      name: "M12 智慧全景餵食器",
      reason: "4L 大容量，360° 全景鏡頭可監控多貓用餐情況，設定不同餵食時段避免搶食。",
      price: "NT$3,490",
    });
  }

  if (recs.length === 0) {
    // Default recommendations
    if (petType === "cat" || !petType) {
      recs.push(
        {
          slug: "d11ba-water-dispenser",
          name: "D11-BA 智慧寵物飲水機",
          reason: "我們最熱銷的飲水機，流動湧泉讓貓咪愛上喝水。",
          price: "NT$2,490",
        },
        {
          slug: "m12-panoramic-feeder",
          name: "M12 智慧全景餵食器",
          reason: "內建全景鏡頭，適合新手飼主隨時關心毛孩。",
          price: "NT$3,490",
        }
      );
    }
  }

  return { petType, petCount, budget, problem, recommendations: recs };
}

/* ================================================================ */
/*  MAIN CHAT HANDLER                                               */
/* ================================================================ */
async function handleChat({ message, sessionId = "", context = {} }) {
  if (!message || typeof message !== "string") {
    return buildResponse({ text: "請問有什麼可以幫您的呢？😊" });
  }

  const trimmed = message.trim();
  if (trimmed.length === 0) {
    return buildResponse({ text: "請問有什麼可以幫您的呢？😊" });
  }

  // 1. Escalation check — ALWAYS first
  if (detectEscalation(trimmed)) {
    return buildResponse({
      text: "了解您的情況，這個問題我會幫您轉給專人處理。請稍等，或直接聯繫我們的客服團隊，我們會盡快為您解決。🙏",
      type: "escalation",
      actions: [
        { label: "聯繫 LINE 客服", url: "https://line.me/R/ti/p/@westinghousepet", type: "external" },
        { label: "填寫客服表單", url: "/support/tickets", type: "internal" },
      ],
      shouldEscalate: true,
    });
  }

  // 2. Human handoff
  const intent = classifyIntent(trimmed);
  if (intent === "human_handoff") {
    return buildResponse({
      text: "好的，幫您轉接真人客服。您可以透過以下方式聯繫我們：",
      type: "handoff",
      actions: [
        { label: "LINE 客服（最快回覆）", url: "https://line.me/R/ti/p/@westinghousepet", type: "external" },
        { label: "客服專線 0800-000-000", url: "tel:0800000000", type: "phone" },
        { label: "填寫客服表單", url: "/support/tickets", type: "internal" },
      ],
    });
  }

  // 3. Try LLM first if configured
  const hasLLM = !!process.env.OPENAI_API_KEY || !!process.env.ANTHROPIC_API_KEY;
  if (hasLLM) {
    try {
      const result = await aiLLM.callAI({ message: trimmed, sessionId: sessionId || "web" });
      return buildResponse({
        text: result.reply,
        type: "ai",
        actions: [
          { label: "常見問題", url: "/faq", type: "internal" },
          { label: "聯繫客服", url: "/contact", type: "internal" },
        ],
      });
    } catch (err) {
      console.warn("[AI] LLM failed, using rule fallback:", err.message);
    }
  }

  // 4. Product recommendation (rule-based)
  if (["recommend","product_water","product_feeder","cat_drinking","multi_cat","beginner"].includes(intent)) {
    const recCtx = recommendProduct(trimmed, context);
    const { recommendations, petType, petCount, problem } = recCtx;
    if (recommendations.length > 0) {
      let text = "";
      if (problem === "not_drinking") text = "貓咪不喝水是很多飼主的困擾！💧 推薦方案：\n\n";
      else if (problem === "away") text = "經常出差需要好的自動餵食方案！🏠 推薦：\n\n";
      else if (problem === "multi_cat") text = "多貓家庭的餵食管理很重要！🐱🐱 建議：\n\n";
      else if (problem === "wet_food") text = "濕糧保存是很多飼主的困擾！🥫 以下機型專為鮮食設計：\n\n";
      else if (problem === "kidney") text = "腎貓的飲水管理非常重要！💙 特別推薦：\n\n";
      else text = "根據您的需求，我推薦以下商品：\n\n";
      recommendations.forEach((r, i) => { text += `${i + 1}. **${r.name}**（${r.price}）\n${r.reason}\n\n`; });
      text += "需要更詳細的比較，或想直接帶回家嗎？😊";
      const actions = recommendations.map((r) => ({ label: `查看 ${r.name.split(" ")[0]}`, url: `/products/${r.slug}`, type: "internal" }));
      return buildResponse({ text, type: "recommendation", actions, context: { petType, petCount, problem } });
    }
  }

  // 5. Knowledge base lookup
  const kbResults = await queryKnowledge(intent === "general" ? null : intent, trimmed);
  if (kbResults.length > 0) {
    const best = kbResults[0];
    const actions = [];
    if (best.source_url) actions.push({ label: "查看詳細說明", url: best.source_url, type: "internal" });
    if (intent === "filter") actions.push({ label: "購買濾芯組", url: "/products/accessories", type: "internal" });
    else if (intent === "warranty") { actions.push({ label: "保固登錄", url: "/support/warranty-register", type: "internal" }); actions.push({ label: "查詢保固狀態", url: "/support/warranty-check", type: "internal" }); }
    return buildResponse({ text: best.answer, type: "knowledge", actions, context: { knowledgeId: best.id } });
  }

  // 6. Fallback
  const fallbacks = {
    warranty: "保固相關問題建議您先查看我們的保固政策頁面，或直接聯繫客服確認。全系列產品均享一年原廠保固，馬達核心部件延長至三年。\n\n如需查詢保固狀態，請準備好您的訂單編號或產品序號。",
    order: "訂單相關問題，建議您準備好訂單編號後聯繫客服查詢。我們不會在此顯示您的私人訂單資料以確保安全。\n\n一般出貨時間為下單後 1-3 個工作天。",
    shipping: "台灣本島約 2-3 個工作天送達。超商取貨約 3-5 個工作天。外島約 5-7 個工作天。\n\n滿 NT$1,500 享免運。",
    refund: "了解您想申請退貨。收到商品後七天內，若產品未使用且包裝完整，可申請退換貨。\n\n這個問題我會幫您轉給專人處理，請聯繫客服辦理。",
    setup: "產品設定很簡單！下載 Westinghouse Pet App，長按產品 WiFi 鍵 3 秒進入配對模式，依照 App 指示完成連線即可。\n\n遇到困難可以參考使用指南頁面，或聯繫客服協助。",
    filter: "濾芯建議每 4-6 週更換一次。更換方式：打開飲水機上蓋 → 取出舊濾芯 → 插入新濾芯即可。\n\n建議使用 Westinghouse 原廠濾芯以確保過濾效果。",
    cat_drinking: "貓咪天生偏好流動水！建議使用我們的 D11-BA 智慧飲水機，靜音湧泉設計能吸引貓咪主動喝水。\n\n也可以試試在水盆旁邊放幾顆貓草增加吸引力。",
    beginner: "歡迎加入養貓的行列！🎉 新手飼主我們推薦先準備：自動餵食器 + 飲水機組合，能讓您輕鬆管理毛孩的飲食。\n\n可以參考我們的「新手養貓指南」頁面了解更多。",
  };
  if (fallbacks[intent]) return buildResponse({ text: fallbacks[intent], type: "fallback", actions: [{ label: "聯繫客服", url: "/contact", type: "internal" }, { label: "常見問題", url: "/faq", type: "internal" }] });

  // 7. Ultimate fallback
  return buildResponse({ text: "謝謝您的提問！這個問題我建議您參考我們的常見問題頁面，或直接聯繫客服團隊，我們會盡快為您解答。😊", type: "fallback", actions: [{ label: "常見問題", url: "/faq", type: "internal" }, { label: "聯繫客服", url: "/contact", type: "internal" }, { label: "LINE 客服", url: "https://line.me/R/ti/p/@westinghousepet", type: "external" }] });
}

async function listKnowledge({ category, search, page = 1, limit = 20 }) {
  if (!DATABASE_URI) return { items: [], total: 0 };
  const client = new Client({ connectionString: DATABASE_URI, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    let where = "WHERE 1=1";
    const params = [];
    if (category) { params.push(category); where += ` AND category = $${params.length}`; }
    if (search) { params.push(`%${search}%`); where += ` AND (question ILIKE $${params.length} OR answer ILIKE $${params.length})`; }

    const countResult = await client.query(`SELECT COUNT(*) FROM ai_knowledge ${where}`, params);
    const total = parseInt(countResult.rows[0].count);

    params.push(limit, (page - 1) * limit);
    const result = await client.query(
      `SELECT id, category, question, answer, source_url, tags, enabled, priority, escalation_note, created_at, updated_at
       FROM ai_knowledge ${where}
       ORDER BY updated_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    return { items: result.rows, total };
  } catch (err) { return { items: [], total: 0, error: err.message }; }
  finally { await client.end().catch(() => {}); }
}

async function createKnowledge({ category, question, answer, source_url, tags, priority, escalation_note }) {
  if (!DATABASE_URI) return { error: "Database not configured" };
  const client = new Client({ connectionString: DATABASE_URI, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    const result = await client.query(
      `INSERT INTO ai_knowledge (category, question, answer, source_url, tags, enabled, priority, escalation_note)
       VALUES ($1,$2,$3,$4,$5,true,$6,$7) RETURNING *`,
      [category, question, answer, source_url, tags || [], priority || 0, escalation_note || ""]
    );
    return { item: result.rows[0] };
  } catch (err) { return { error: err.message }; }
  finally { await client.end().catch(() => {}); }
}

async function updateKnowledge(id, { category, question, answer, source_url, tags, enabled, priority, escalation_note }) {
  if (!DATABASE_URI) return { error: "Database not configured" };
  const client = new Client({ connectionString: DATABASE_URI, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    const fields = []; const values = []; let idx = 1;
    if (category !== undefined) { fields.push(`category = $${idx++}`); values.push(category); }
    if (question !== undefined) { fields.push(`question = $${idx++}`); values.push(question); }
    if (answer !== undefined) { fields.push(`answer = $${idx++}`); values.push(answer); }
    if (source_url !== undefined) { fields.push(`source_url = $${idx++}`); values.push(source_url); }
    if (tags !== undefined) { fields.push(`tags = $${idx++}`); values.push(tags); }
    if (enabled !== undefined) { fields.push(`enabled = $${idx++}`); values.push(enabled); }
    if (priority !== undefined) { fields.push(`priority = $${idx++}`); values.push(priority); }
    if (escalation_note !== undefined) { fields.push(`escalation_note = $${idx++}`); values.push(escalation_note); }
    fields.push(`updated_at = NOW()`);
    values.push(id);
    const result = await client.query(
      `UPDATE ai_knowledge SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
      values
    );
    return { item: result.rows[0] || null };
  } catch (err) { return { error: err.message }; }
  finally { await client.end().catch(() => {}); }
}

/* ================================================================ */
/*  EXPORTS                                                          */
/* ================================================================ */

module.exports = {
  handleChat,
  listKnowledge,
  createKnowledge,
  updateKnowledge,
  detectEscalation,
  classifyIntent,
  recommendProduct,
};
