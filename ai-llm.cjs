/**
 * AI LLM Provider Abstraction — Westinghouse Pet Taiwan
 * Supports: OpenAI, Claude (Anthropic), Rule Engine Fallback
 * NEVER allows hallucination of private order/warranty data
 * Phase 5.2 — Real AI Mode
 */

const https = require("https");

/* ================================================================ */
/*  CONFIG                                                            */
/* ================================================================ */

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || "claude-3-5-haiku-20241022";
const AI_TIMEOUT_MS = parseInt(process.env.AI_TIMEOUT_MS || "10000", 10);
const AI_MAX_TOKENS = parseInt(process.env.AI_MAX_TOKENS || "800", 10);
const AI_TEMPERATURE = parseFloat(process.env.AI_TEMPERATURE || "0.3");

/* ================================================================ */
/*  SYSTEM PROMPT — STRICT SAFETY RULES                             */
/* ================================================================ */

const SYSTEM_PROMPT = `你是 Westinghouse Pet 台灣官方的智能客服助理。請嚴格遵守以下規則：

【語言】只使用繁體中文（台灣用語），語氣溫暖專業。

【可回答】
- 產品推薦與比較
- 使用方式與設定指導
- 濾芯更換與保養
- 保固政策說明（一般性）
- 配送與付款方式
- 常見問題解答

【禁止回答】
- 具體訂單狀態（除非用戶提供訂單號並通過驗證）
- 具體付款結果
- 具體維修進度（除非用戶提供維修單號）
- 虛構產品規格或價格
- 醫療診斷建議

【升級規則】
遇到以下情況必須建議轉接人工客服：
- 退款/退貨要求
- 憤怒/投訴
- 產品安全疑慮
- 保固爭議
- 法律問題

回答要簡短，先給結論再補充說明。`;

/* ================================================================ */
/*  HTTP REQUEST HELPER                                               */
/* ================================================================ */

function httpRequest({ hostname, path, method, headers, body }) {
  return new Promise((resolve, reject) => {
    const req = https.request({ hostname, path, method, headers, timeout: AI_TIMEOUT_MS }, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => {
        try { resolve(JSON.parse(data)); }
        catch { reject(new Error(`Invalid JSON: ${data.slice(0, 200)}`)); }
      });
    });
    req.on("error", reject);
    req.on("timeout", () => { req.destroy(); reject(new Error("Request timeout")); });
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

/* ================================================================ */
/*  OPENAI PROVIDER                                                   */
/* ================================================================ */

async function callOpenAI(messages) {
  if (!OPENAI_API_KEY) throw new Error("OpenAI API key not configured");

  const result = await httpRequest({
    hostname: "api.openai.com",
    path: "/v1/chat/completions",
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: {
      model: OPENAI_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages,
      ],
      max_tokens: AI_MAX_TOKENS,
      temperature: AI_TEMPERATURE,
    },
  });

  if (result.error) throw new Error(result.error.message);
  return result.choices?.[0]?.message?.content?.trim() || "";
}

/* ================================================================ */
/*  ANTHROPIC (CLAUDE) PROVIDER                                     */
/* ================================================================ */

async function callClaude(messages) {
  if (!ANTHROPIC_API_KEY) throw new Error("Anthropic API key not configured");

  const result = await httpRequest({
    hostname: "api.anthropic.com",
    path: "/v1/messages",
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: {
      model: ANTHROPIC_MODEL,
      max_tokens: AI_MAX_TOKENS,
      temperature: AI_TEMPERATURE,
      system: SYSTEM_PROMPT,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    },
  });

  if (result.error) throw new Error(result.error.message);
  return result.content?.[0]?.text?.trim() || "";
}

/* ================================================================ */
/*  CONTEXT MEMORY — Session-based conversation history               */
/* ================================================================ */

const sessionMemory = new Map(); // sessionId -> { messages: [], lastAccess: timestamp }
const MEMORY_MAX_MESSAGES = 10;
const MEMORY_TTL_MS = 30 * 60 * 1000; // 30 minutes

function getMemory(sessionId) {
  cleanupMemory();
  const entry = sessionMemory.get(sessionId);
  return entry ? entry.messages : [];
}

function addToMemory(sessionId, role, content) {
  if (!sessionMemory.has(sessionId)) {
    sessionMemory.set(sessionId, { messages: [], lastAccess: Date.now() });
  }
  const entry = sessionMemory.get(sessionId);
  entry.messages.push({ role, content });
  entry.lastAccess = Date.now();
  // Trim to max messages
  if (entry.messages.length > MEMORY_MAX_MESSAGES * 2) {
    entry.messages = entry.messages.slice(-MEMORY_MAX_MESSAGES * 2);
  }
}

function cleanupMemory() {
  const now = Date.now();
  for (const [id, entry] of sessionMemory) {
    if (now - entry.lastAccess > MEMORY_TTL_MS) {
      sessionMemory.delete(id);
    }
  }
}

/* ================================================================ */
/*  MAIN INTERFACE — Provider selection with fallback                 */
/* ================================================================ */

/**
 * Call AI with provider fallback chain:
 * 1. Claude (if key configured)
 * 2. OpenAI (if key configured)
 * 3. Throw error (caller should use rule-based fallback)
 */
async function callAI({ message, sessionId = "default" }) {
  // Add user message to memory
  addToMemory(sessionId, "user", message);

  // Build message history (last N exchanges)
  const history = getMemory(sessionId).slice(-MEMORY_MAX_MESSAGES);

  let reply = "";
  let provider = "";
  const errors = [];

  // Try Claude first
  if (ANTHROPIC_API_KEY) {
    try {
      reply = await callClaude(history);
      provider = "claude";
    } catch (err) {
      errors.push(`Claude: ${err.message}`);
    }
  }

  // Fallback to OpenAI
  if (!reply && OPENAI_API_KEY) {
    try {
      reply = await callOpenAI(history);
      provider = "openai";
    } catch (err) {
      errors.push(`OpenAI: ${err.message}`);
    }
  }

  if (!reply) {
    throw new Error(`All AI providers failed: ${errors.join("; ")}`);
  }

  // Add assistant reply to memory
  addToMemory(sessionId, "assistant", reply);

  return { reply, provider };
}

/* ================================================================ */
/*  EXPORTS                                                           */
/* ================================================================ */

module.exports = {
  callAI,
  getMemory,
  addToMemory,
  // Exposed for testing
  SYSTEM_PROMPT,
};
