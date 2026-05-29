/**
 * PAYMENT SERVICE — NewebPay MPG v2.0 (test mode)
 * All encryption happens server-side only.
 * HashKey/HashIV never leave this file.
 */
const crypto = require("crypto");

// --- AES-256-CBC helpers ---
function padKey(key) { return key.padEnd(32, "\0").slice(0, 32); }
function padIv(iv) { return iv.padEnd(16, "\0").slice(0, 16); }

function aesEncrypt(plainText, key, iv) {
  const cipher = crypto.createCipheriv("aes-256-cbc", padKey(key), padIv(iv));
  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

function aesDecrypt(encryptedHex, key, iv) {
  try {
    const decipher = crypto.createDecipheriv("aes-256-cbc", padKey(key), padIv(iv));
    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch {
    return null;
  }
}

function sha256(text) {
  return crypto.createHash("sha256").update(text).digest("hex").toUpperCase();
}

// --- Config ---
function getConfig() {
  return {
    merchantId: process.env.NEWEBPAY_MERCHANT_ID || "",
    hashKey: process.env.NEWEBPAY_HASH_KEY || "",
    hashIv: process.env.NEWEBPAY_HASH_IV || "",
    apiUrl: process.env.NEWEBPAY_API_URL || "https://ccore.newebpay.com/MPG/mpg_gateway",
    returnUrl: process.env.NEWEBPAY_RETURN_URL || "",
    notifyUrl: process.env.NEWEBPAY_NOTIFY_URL || "",
  };
}

function isConfigured() {
  const c = getConfig();
  return c.merchantId && c.hashKey && c.hashIv;
}

// --- TradeInfo generation ---
function generatePayload(orderNumber, amount, itemDesc, email) {
  const cfg = getConfig();
  if (!isConfigured()) return { error: "Payment not configured — set NEWEBPAY_* env vars" };

  const tradeData = {
    MerchantID: cfg.merchantId,
    RespondType: "JSON",
    TimeStamp: Math.floor(Date.now() / 1000),
    Version: "2.0",
    MerchantOrderNo: orderNumber,
    Amt: amount,
    ItemDesc: (itemDesc || "Westinghouse Pet 商品").slice(0, 50),
    ReturnURL: cfg.returnUrl || undefined,
    NotifyURL: cfg.notifyUrl || undefined,
    ClientBackURL: cfg.returnUrl || undefined,
    Email: email || undefined,
    LoginType: 0,
    CREDIT: 1,
    LangType: "zh-tw",
  };

  // Build query string
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(tradeData)) {
    if (v !== undefined && v !== null && v !== "") params.append(k, String(v));
  }
  const tradeInfoPlain = params.toString();

  // Encrypt + hash
  const tradeInfo = aesEncrypt(tradeInfoPlain, cfg.hashKey, cfg.hashIv);
  const tradeSha = sha256(`HashKey=${cfg.hashKey}&${tradeInfo}&HashIV=${cfg.hashIv}`);

  return {
    MerchantID: cfg.merchantId,
    TradeInfo: tradeInfo,
    TradeSha: tradeSha,
    Version: "2.0",
  };
}

// --- Webhook verification ---
function verifyWebhook(body) {
  const cfg = getConfig();
  if (!isConfigured()) return { ok: false, error: "Payment not configured" };
  if (!body.Result) return { ok: false, error: "Missing Result" };

  const decrypted = aesDecrypt(body.Result, cfg.hashKey, cfg.hashIv);
  if (!decrypted) return { ok: false, error: "Decryption failed" };

  let result;
  try { result = JSON.parse(decrypted); } catch { return { ok: false, error: "Invalid JSON in decrypted data" }; }

  // Verify CheckCode
  if (result.CheckCode) {
    const expected = sha256(
      `HashIV=${cfg.hashIv}&Amt=${result.Amt}&MerchantID=${result.MerchantID}&MerchantOrderNo=${result.MerchantOrderNo}&TradeNo=${result.TradeNo}&HashKey=${cfg.hashKey}`
    );
    if (expected !== result.CheckCode) return { ok: false, error: "Invalid CheckCode — possible tampering" };
  }

  // Verify MerchantID
  if (result.MerchantID !== cfg.merchantId) return { ok: false, error: "MerchantID mismatch" };

  return { ok: true, data: result };
}

// --- Mock webhook for testing ---
function generateMockWebhook(orderNumber, amount) {
  const cfg = getConfig();
  if (!isConfigured()) return { error: "Not configured" };

  const result = {
    MerchantID: cfg.merchantId,
    Amt: amount,
    TradeNo: `TEST${Date.now()}`,
    MerchantOrderNo: orderNumber,
    PaymentType: "CREDIT",
    PayTime: new Date().toISOString().replace("T", " ").slice(0, 19),
    CheckCode: "",
  };
  result.CheckCode = sha256(
    `HashIV=${cfg.hashIv}&Amt=${result.Amt}&MerchantID=${result.MerchantID}&MerchantOrderNo=${result.MerchantOrderNo}&TradeNo=${result.TradeNo}&HashKey=${cfg.hashKey}`
  );
  const encrypted = aesEncrypt(JSON.stringify(result), cfg.hashKey, cfg.hashIv);
  return { Status: "SUCCESS", Message: "模擬付款成功", Result: encrypted };
}

// --- Auto-submit HTML form ---
function paymentFormHTML(payload) {
  return `<!DOCTYPE html><html><head><title>Redirecting...</title></head><body>
<form id="f" method="post" action="https://ccore.newebpay.com/MPG/mpg_gateway">
<input type="hidden" name="MerchantID" value="${payload.MerchantID}" />
<input type="hidden" name="TradeInfo" value="${payload.TradeInfo}" />
<input type="hidden" name="TradeSha" value="${payload.TradeSha}" />
<input type="hidden" name="Version" value="${payload.Version}" />
</form><script>document.getElementById("f").submit();</script></body></html>`;
}

module.exports = {
  isConfigured,
  generatePayload,
  verifyWebhook,
  generateMockWebhook,
  paymentFormHTML,
};
