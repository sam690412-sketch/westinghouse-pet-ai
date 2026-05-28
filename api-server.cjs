/**
 * API Proxy Server — Westinghouse Pet Taiwan
 * Node.js HTTP server proxying to Supabase PostgreSQL
 * + NewebPay payment integration (test mode)
 * + Hardened: rate limiting, CORS, input validation, admin auth
 *
 * Run: node api-server.cjs
 * Default port: 3002
 */
const http = require("http");
const fs = require("fs");
const path = require("path");
const { Client } = require("pg");
const { URL } = require("url");
const paymentService = require("./payment-service.cjs");
const aiService = require("./ai-service.cjs");

/* ================================================================ */
/*  CONFIGURATION                                                     */
/* ================================================================ */

const PORT = process.env.API_PORT || 3002;
const DATABASE_URI = process.env.DATABASE_URI || "";
const ADMIN_SECRET = process.env.ADMIN_SECRET || "";

// CORS allowlist — production domains
const CORS_ALLOWLIST = (process.env.CORS_ALLOWLIST || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// Security: if no CORS_ALLOWLIST set, allow all (dev mode only)
const corsOrigin = CORS_ALLOWLIST.length > 0 ? null : "*";

const corsHeaders = {
  "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Admin-Secret",
  "Access-Control-Max-Age": "86400",
  "Content-Type": "application/json; charset=utf-8",
};

// Request size limits
const MAX_BODY_SIZE = 256 * 1024; // 256KB
const MAX_UPLOAD_SIZE = 10 * 1024 * 1024; // 10MB

// Admin secret minimum length
const ADMIN_SECRET_MIN_LENGTH = 16;

function sendJSON(res, status, data) {
  res.writeHead(status, corsHeaders);
  res.end(JSON.stringify(data));
}
function sendHTML(res, status, html) {
  res.writeHead(status, { "Content-Type": "text/html; charset=utf-8" });
  res.end(html);
}

function parsePath(url) {
  const parsed = new URL(url, `http://localhost:${PORT}`);
  return { pathname: parsed.pathname, searchParams: parsed.searchParams };
}

async function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try { resolve(body ? JSON.parse(body) : {}); }
      catch { reject(new Error("Invalid JSON")); }
    });
  });
}

/* ================================================================ */
/*  STATIC FILE SERVING (SPA fallback)                                */
/* ================================================================ */

const STATIC_DIR = path.resolve(__dirname, "dist");
const DEFAULT_PAGE = path.join(STATIC_DIR, "index.html");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".eot": "application/vnd.ms-fontobject",
  ".otf": "font/otf",
  ".webp": "image/webp",
};

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || "application/octet-stream";
}

function serveStaticFile(res, pathname) {
  // Security: prevent directory traversal
  const safePath = path.normalize(pathname).replace(/^(\.\.(\/|$))+/, "");
  let filePath = path.join(STATIC_DIR, safePath);

  // If path ends with /, serve index.html from that directory
  if (pathname.endsWith("/")) {
    filePath = path.join(filePath, "index.html");
  }

  // If no extension, assume it's a SPA route — serve index.html
  if (!path.extname(filePath)) {
    filePath = DEFAULT_PAGE;
  }

  return new Promise((resolve) => {
    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        // File not found — fallback to index.html for SPA routing
        fs.stat(DEFAULT_PAGE, (err2, stats2) => {
          if (err2 || !stats2.isFile()) {
            res.writeHead(404, { "Content-Type": "text/plain" });
            res.end("Not found");
            resolve(false);
          } else {
            fs.readFile(DEFAULT_PAGE, (err3, data) => {
              if (err3) {
                res.writeHead(500, { "Content-Type": "text/plain" });
                res.end("Server error");
                resolve(false);
              } else {
                res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
                res.end(data);
                resolve(true);
              }
            });
          }
        });
      } else {
        fs.readFile(filePath, (err2, data) => {
          if (err2) {
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end("Server error");
            resolve(false);
          } else {
            res.writeHead(200, { "Content-Type": getMimeType(filePath) });
            res.end(data);
            resolve(true);
          }
        });
      }
    });
  });
}

/* ================================================================ */
/*  ADMIN AUTH (hardened)                                             */
/* ================================================================ */

// Validate admin secret strength on startup
function validateAdminSecret() {
  if (!ADMIN_SECRET) {
    console.warn("[SECURITY] ADMIN_SECRET not set — admin endpoints disabled");
    return false;
  }
  if (ADMIN_SECRET.length < ADMIN_SECRET_MIN_LENGTH) {
    console.error(`[SECURITY] ADMIN_SECRET too short (min ${ADMIN_SECRET_MIN_LENGTH} chars) — admin endpoints disabled`);
    return false;
  }
  // Reject common weak secrets
  const weakPatterns = ["admin", "password", "123456", "secret", "default"];
  const lower = ADMIN_SECRET.toLowerCase();
  for (const pattern of weakPatterns) {
    if (lower.includes(pattern)) {
      console.error(`[SECURITY] ADMIN_SECRET contains weak pattern '${pattern}' — admin endpoints disabled`);
      return false;
    }
  }
  return true;
}
const ADMIN_ENABLED = validateAdminSecret();

const adminFailLog = new Map(); // ip -> { count, resetAt }
const ADMIN_FAIL_WINDOW = 5 * 60 * 1000; // 5 minutes
const ADMIN_FAIL_MAX = 5; // max failed attempts before lockout

function requireAdmin(req) {
  if (!ADMIN_ENABLED) return { error: "Admin access not configured", status: 503 };

  const ip = req.socket.remoteAddress || "unknown";
  const secret = req.headers["x-admin-secret"] || "";

  // Check fail lockout
  const failEntry = adminFailLog.get(ip);
  if (failEntry && Date.now() < failEntry.resetAt && failEntry.count >= ADMIN_FAIL_MAX) {
    return { error: "Too many failed attempts — try again later", status: 429 };
  }

  if (secret !== ADMIN_SECRET) {
    // Log failed attempt
    const now = Date.now();
    if (!failEntry || now > failEntry.resetAt) {
      adminFailLog.set(ip, { count: 1, resetAt: now + ADMIN_FAIL_WINDOW });
    } else {
      failEntry.count++;
    }
    // Audit log (fire and forget)
    queryDB("SELECT public.log_audit($1, $2, $3, $4, $5)", [
      "admin_auth_failed", null, null, null,
      JSON.stringify({ ip, userAgent: req.headers["user-agent"]?.slice(0, 200), timestamp: new Date().toISOString() }),
    ]).catch(() => {});
    return { error: "Unauthorized", status: 401 };
  }

  // Clear fail count on success
  adminFailLog.delete(ip);
  return null; // OK
}

/* ================================================================ */
/*  RATE LIMITING                                                     */
/* ================================================================ */

const rateLimits = new Map(); // ip -> { count, resetAt }
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 60; // requests per window (public)
const RATE_LIMIT_ADMIN_MAX = 30; // requests per window (admin)

function checkRateLimit(ip, isAdmin = false) {
  const now = Date.now();
  const entry = rateLimits.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimits.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return { ok: true };
  }
  const max = isAdmin ? RATE_LIMIT_ADMIN_MAX : RATE_LIMIT_MAX;
  if (entry.count >= max) {
    return { ok: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }
  entry.count++;
  return { ok: true };
}

// Clean up expired entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimits) {
    if (now > entry.resetAt) rateLimits.delete(ip);
  }
}, 10 * 60 * 1000);

/* ================================================================ */
/*  CORS VALIDATION                                                   */
/* ================================================================ */

function getCorsHeaders(origin) {
  if (CORS_ALLOWLIST.length === 0) {
    // Dev mode: allow all
    return { ...corsHeaders, "Access-Control-Allow-Origin": "*" };
  }
  if (origin && CORS_ALLOWLIST.includes(origin)) {
    return { ...corsHeaders, "Access-Control-Allow-Origin": origin, "Vary": "Origin" };
  }
  return corsHeaders; // No Access-Control-Allow-Origin = browser blocks
}

/* ================================================================ */
/*  INPUT VALIDATION                                                  */
/* ================================================================ */

function sanitizeString(str, maxLen = 500) {
  if (typeof str !== "string") return "";
  return str.slice(0, maxLen).replace(/[<>]/g, "").trim();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  return /^09\d{8}$/.test(phone);
}

function isValidSku(sku) {
  return /^WH-[A-Z0-9]{2,}-[A-Z]{2}$/.test(sku);
}

async function queryDB(sql, params = []) {
  const client = new Client({
    connectionString: DATABASE_URI,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
    query_timeout: 15000,
  });
  try {
    await client.connect();
    const result = await client.query(sql, params);
    return { rows: result.rows, count: result.rowCount };
  } finally {
    await client.end();
  }
}

/* ================================================================ */
/*  PRODUCT / CART / ORDER HELPERS                                    */
/* ================================================================ */

const PRODUCT_SELECT = `
  SELECT pc.slug, pc.sku, pc.name, pc.tagline, pc.short_description,
    pc.category, pc.solutions, pc.hero_image_url, pc.images, pc.features,
    pc.specs, pc.faq_items, pc.how_to_steps, pc.meta_title, pc.meta_description,
    pc.created_at, pc.updated_at, cp.price, cp.compare_at_price, cp.currency,
    cp.stock_quantity, cp.stock_status, cp.is_active as commerce_active,
    cp.preorder, cp.preorder_message, cp.shipping_class
  FROM product_contents pc
  INNER JOIN commerce_products cp ON pc.id = cp.product_content_id
  WHERE pc.deleted_at IS NULL AND cp.is_active = true
`;
const PRODUCT_ORDER = `ORDER BY cp.created_at DESC`;

async function getCommerceProduct(sku) {
  const r = await queryDB(
    "SELECT price, compare_at_price, stock_quantity, stock_status, is_active, preorder FROM commerce_products WHERE sku = $1",
    [sku]
  );
  return r.rows[0] || null;
}

async function enrichCartItems(items) {
  if (!items || items.length === 0) return [];
  const skus = items.map((i) => i.sku || i.product_sku);
  const placeholders = skus.map((_, i) => `$${i + 1}`).join(",");
  const result = await queryDB(
    `SELECT pc.slug, pc.sku, pc.name, pc.tagline, pc.hero_image_url, cp.price, cp.compare_at_price, cp.stock_status, cp.stock_quantity, cp.currency, cp.preorder
     FROM product_contents pc INNER JOIN commerce_products cp ON pc.id = cp.product_content_id
     WHERE pc.deleted_at IS NULL AND cp.is_active = true AND cp.sku IN (${placeholders})`,
    skus
  );
  const productMap = new Map(result.rows.map((r) => [r.sku, r]));
  return items.map((item) => {
    const sku = item.sku || item.product_sku;
    const product = productMap.get(sku);
    const qty = item.quantity || item.qty || 1;
    const price = product?.price || 0;
    return {
      id: item.id || `${sku}-${Date.now()}`,
      slug: product?.slug || "",
      sku, name: product?.name || sku, tagline: product?.tagline || undefined,
      price, originalPrice: product?.compare_at_price || undefined,
      quantity: qty, stockStatus: product?.stock_status || "unknown",
      stockQuantity: product?.stock_quantity || 0,
      imageUrl: product?.hero_image_url || undefined,
      subtotal: price * qty, maxQuantity: Math.min(product?.stock_quantity || 99, 99),
    };
  });
}

/* ================================================================ */
/*  ROUTES                                                            */
/* ================================================================ */

const routes = {
  // Health
  "/api/health": async () => {
    const start = Date.now();
    const result = await queryDB("SELECT NOW() as now");
    return { status: "ok", db: "connected", latency_ms: Date.now() - start };
  },

  // Products
  "/api/products": async (sp) => {
    const category = sp.get("category");
    const limit = Math.min(parseInt(sp.get("limit") || "50", 10), 100);
    const offset = parseInt(sp.get("offset") || "0", 10);
    let sql = PRODUCT_SELECT; const params = [];
    if (category) { sql += ` AND pc.category = $${params.length + 1}`; params.push(category); }
    sql += ` ${PRODUCT_ORDER} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
    const result = await queryDB(sql, params);
    return { data: result.rows, count: result.rows.length };
  },

  "/api/products/detail": async (sp) => {
    const slug = sp.get("slug");
    if (!slug) return { error: "slug required" };
    const result = await queryDB(`${PRODUCT_SELECT} AND pc.slug = $1 ${PRODUCT_ORDER}`, [slug]);
    return { data: result.rows[0] || null };
  },

  "/api/products/bestsellers": async (sp) => {
    const limit = Math.min(parseInt(sp.get("limit") || "6", 10), 20);
    const result = await queryDB(`${PRODUCT_SELECT} ${PRODUCT_ORDER} LIMIT $1`, [limit]);
    return { data: result.rows, count: result.rows.length };
  },

  // Solutions
  "/api/solutions": async (sp) => {
    const limit = Math.min(parseInt(sp.get("limit") || "20", 10), 50);
    const result = await queryDB(
      `SELECT id, slug, title, pain_point, audience, content, recommended_products, meta_title, meta_description, is_published, created_at, updated_at FROM solutions WHERE is_published = true ORDER BY created_at DESC LIMIT $1`, [limit]
    );
    return { data: result.rows };
  },

  // Learn articles
  "/api/learn-articles": async (sp) => {
    const limit = Math.min(parseInt(sp.get("limit") || "10", 10), 50);
    const result = await queryDB(
      `SELECT id, slug, title, excerpt, content, category, cover_image_url, author, read_time, published_at, updated_at FROM learn_articles ORDER BY published_at DESC NULLS LAST LIMIT $1`, [limit]
    );
    return { data: result.rows };
  },

  // Reviews
  "/api/reviews": async (sp) => {
    const limit = Math.min(parseInt(sp.get("limit") || "10", 10), 50);
    const result = await queryDB(
      `SELECT id, author_name, avatar_url, rating, title, content, product_sku, product_slug, verified, helpful_count, created_at FROM reviews ORDER BY created_at DESC LIMIT $1`, [limit]
    );
    return { data: result.rows };
  },

  // Cart
  "/api/cart/validate": async (_sp, body) => {
    const items = body.items;
    if (!Array.isArray(items)) return { error: "items array required" };
    const enriched = await enrichCartItems(items);
    const total = enriched.reduce((s, i) => s + i.subtotal, 0);
    return { data: enriched, total };
  },

  "/api/cart/add": async (_sp, body) => {
    const { sku, quantity = 1 } = body;
    if (!sku) return { error: "sku required" };
    if (quantity < 1) return { error: "quantity must be >= 1" };
    const product = await getCommerceProduct(sku);
    if (!product) return { error: "商品不存在" };
    if (!product.is_active) return { error: "商品已下架" };
    if (product.stock_status === "out_of_stock") return { error: "此商品暫時缺貨" };
    if (quantity > product.stock_quantity) return { error: `庫存不足，僅剩 ${product.stock_quantity} 件` };
    if (quantity > 99) return { error: "最多 99 件" };
    const enriched = await enrichCartItems([{ sku, quantity }]);
    return { data: enriched[0] };
  },

  // Orders
  "/api/orders/create": async (_sp, body) => {
    const { items: cartItems, customer, note } = body;
    if (!Array.isArray(cartItems) || cartItems.length === 0) return { error: "Cart is empty" };
    if (!customer || !customer.name || !customer.phone) return { error: "Customer name and phone required" };

    const client = new Client({ connectionString: DATABASE_URI, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 10000, query_timeout: 15000 });
    try {
      await client.connect();
      await client.query("BEGIN");

      const validatedItems = [];
      let serverTotal = 0;
      for (const item of cartItems) {
        const product = await getCommerceProduct(item.sku);
        if (!product) throw new Error(`商品不存在: ${item.sku}`);
        if (!product.is_active) throw new Error(`商品已下架: ${item.sku}`);
        if (product.stock_status === "out_of_stock") throw new Error(`${item.sku} 暫時缺貨`);
        if (item.quantity > product.stock_quantity) throw new Error(`${item.sku} 庫存不足，僅剩 ${product.stock_quantity} 件`);

        const nameRes = await client.query("SELECT name FROM product_contents WHERE sku = $1 AND deleted_at IS NULL", [item.sku]);
        const productName = nameRes.rows[0]?.name || item.sku;
        const subtotal = product.price * item.quantity;
        serverTotal += subtotal;
        validatedItems.push({ sku: item.sku, product_name: productName, quantity: item.quantity, unit_price: product.price, subtotal });
      }

      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const orderNumber = `WP-${dateStr}-${Math.floor(1000 + Math.random() * 9000)}`;

      const orderRes = await client.query(
        `INSERT INTO orders (order_number, status, customer_name, customer_phone, customer_email, shipping_address, total_amount, items_snapshot, note, is_guest, created_at, updated_at)
         VALUES ($1, 'pending', $2, $3, $4, $5, $6, $7, $8, true, NOW(), NOW())
         RETURNING id, order_number, total_amount, created_at`,
        [orderNumber, customer.name, customer.phone, customer.email || null, customer.address ? JSON.stringify(customer.address) : null, serverTotal, JSON.stringify(validatedItems), note || null]
      );
      const order = orderRes.rows[0];

      for (const item of validatedItems) {
        await client.query(
          `INSERT INTO order_items (order_id, sku, product_name, quantity, unit_price, subtotal) VALUES ($1, $2, $3, $4, $5, $6)`,
          [order.id, item.sku, item.product_name, item.quantity, item.unit_price, item.subtotal]
        );
      }

      await client.query(
        `INSERT INTO payments (order_id, provider, amount, currency, status, created_at) VALUES ($1, 'newebpay', $2, 'TWD', 'pending', NOW())`,
        [order.id, serverTotal]
      );

      await client.query("COMMIT");
      return { data: { orderId: order.id, orderNumber: order.order_number, total: order.total_amount, items: validatedItems, createdAt: order.created_at } };
    } catch (err) {
      await client.query("ROLLBACK").catch(() => {});
      return { error: err.message };
    } finally {
      await client.end().catch(() => {});
    }
  },

  "/api/orders/detail": async (sp) => {
    const orderNumber = sp.get("orderNumber");
    if (!orderNumber) return { error: "orderNumber required" };
    const client = new Client({ connectionString: DATABASE_URI, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 10000, query_timeout: 15000 });
    try {
      await client.connect();
      const orderRes = await client.query(
        `SELECT id, order_number, status, customer_name, customer_phone, customer_email, shipping_address, total_amount, items_snapshot, note, created_at FROM orders WHERE order_number = $1`, [orderNumber]
      );
      if (orderRes.rows.length === 0) return { error: "Order not found" };
      const order = orderRes.rows[0];
      const itemsRes = await client.query(`SELECT sku, product_name, quantity, unit_price, subtotal FROM order_items WHERE order_id = $1`, [order.id]);
      const paymentRes = await client.query(`SELECT provider, amount, currency, status, paid_at FROM payments WHERE order_id = $1`, [order.id]);
      return { data: { orderNumber: order.order_number, status: order.status, customer: { name: order.customer_name, phone: order.customer_phone, email: order.customer_email, address: order.shipping_address }, total: order.total_amount, items: itemsRes.rows, payment: paymentRes.rows[0] || null, note: order.note, createdAt: order.created_at } };
    } catch (err) { return { error: err.message }; }
    finally { await client.end().catch(() => {}); }
  },

  /* ================================================================ */
  /*  PAYMENT ENDPOINTS                                                 */
  /* ================================================================ */

  // POST /api/payments/create — Generate NewebPay payment request
  "/api/payments/create": async (_sp, body) => {
    const { orderNumber } = body;
    if (!orderNumber) return { error: "orderNumber required" };

    // Verify order exists and is pending
    const orderRes = await queryDB(
      "SELECT id, order_number, total_amount, status, customer_email, items_snapshot FROM orders WHERE order_number = $1",
      [orderNumber]
    );
    if (orderRes.rows.length === 0) return { error: "Order not found" };
    const order = orderRes.rows[0];
    if (order.status !== "pending") return { error: `Order status is ${order.status}, cannot create payment` };

    // Generate NewebPay payload
    const payload = paymentService.generatePayload(order.order_number, order.total_amount, "Westinghouse Pet 商品", order.customer_email);
    if (payload.error) return { error: payload.error };

    return {
      data: {
        formHtml: paymentService.paymentFormHTML(payload),
        merchantId: payload.MerchantID,
        orderNumber: order.order_number,
        amount: order.total_amount,
      },
    };
  },

  // GET /api/payments/status?orderNumber= — Query payment status
  "/api/payments/status": async (sp) => {
    const orderNumber = sp.get("orderNumber");
    if (!orderNumber) return { error: "orderNumber required" };

    const client = new Client({ connectionString: DATABASE_URI, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 10000, query_timeout: 15000 });
    try {
      await client.connect();
      const orderRes = await client.query(
        `SELECT o.id, o.order_number, o.status as order_status, o.total_amount, p.status as payment_status, p.provider, p.amount, p.paid_at, p.provider_response
         FROM orders o LEFT JOIN payments p ON o.id = p.order_id WHERE o.order_number = $1`, [orderNumber]
      );
      if (orderRes.rows.length === 0) return { error: "Order not found" };
      const row = orderRes.rows[0];
      return {
        data: {
          orderNumber: row.order_number,
          orderStatus: row.order_status,
          paymentStatus: row.payment_status,
          provider: row.provider,
          amount: row.amount,
          paidAt: row.paid_at,
        },
      };
    } catch (err) { return { error: err.message }; }
    finally { await client.end().catch(() => {}); }
  },

  // POST /api/payments/newebpay/notify — NewebPay async notify (webhook)
  // Hardened: uses process_payment_webhook() for idempotency + inventory decrement + audit logging
  "/api/payments/newebpay/notify": async (_sp, body) => {
    const logPrefix = "[WEBHOOK]";
    console.log(logPrefix, "Received notify:", JSON.stringify(body).slice(0, 200));

    // 1. Verify signature
    const verify = paymentService.verifyWebhook(body);
    if (!verify.ok) {
      console.error(logPrefix, "Verification failed:", verify.error);
      // Audit: invalid webhook
      await queryDB(
        "SELECT public.log_audit($1, $2, $3, $4, $5)",
        ["webhook_invalid", "payments", null, null, JSON.stringify({ error: verify.error, body: JSON.stringify(body).slice(0, 500) })]
      );
      return { error: verify.error };
    }
    const data = verify.data;
    const providerTxId = data.TradeNo || null;
    const webhookEventId = body.EventId || providerTxId || null;
    console.log(logPrefix, "Verified:", data.MerchantOrderNo, "Amt:", data.Amt, "Tx:", providerTxId);

    // 2. Find order
    const orderRes = await queryDB(
      "SELECT id, order_number, total_amount, status FROM orders WHERE order_number = $1",
      [data.MerchantOrderNo]
    );
    if (orderRes.rows.length === 0) {
      console.error(logPrefix, "Order not found:", data.MerchantOrderNo);
      await queryDB(
        "SELECT public.log_audit($1, $2, $3, $4, $5)",
        ["webhook_order_not_found", "orders", null, data.MerchantOrderNo, JSON.stringify({ tradeNo: providerTxId })]
      );
      return { error: "Order not found" };
    }
    const order = orderRes.rows[0];

    // 3. Verify amount matches (critical anti-tampering)
    if (order.total_amount !== data.Amt) {
      console.error(logPrefix, `Amount mismatch: order=${order.total_amount}, webhook=${data.Amt}`);
      await queryDB(
        "SELECT public.log_audit($1, $2, $3, $4, $5)",
        ["webhook_amount_mismatch", "orders", order.id, order.order_number,
         JSON.stringify({ expected: order.total_amount, received: data.Amt, tradeNo: providerTxId })]
      );
      return { error: "Amount mismatch — possible tampering" };
    }

    // 4. Process via hardened function (idempotency + state transition + locking)
    const isSuccess = body.Status === "SUCCESS";
    const client = new Client({ connectionString: DATABASE_URI, ssl: { rejectUnauthorized: false } });
    try {
      await client.connect();
      await client.query("BEGIN");

      // Use process_payment_webhook for atomic idempotent update
      const procRes = await client.query(
        "SELECT * FROM public.process_payment_webhook($1, $2, $3, $4, $5, $6)",
        [order.id, providerTxId, webhookEventId, isSuccess,
         JSON.stringify({ ...body, decryptedResult: data }),
         isSuccess ? null : (body.Message || "Payment failed")]
      );
      const { processed, order_status } = procRes.rows[0];

      if (!processed) {
        await client.query("COMMIT");
        console.log(logPrefix, "Duplicate or already processed:", order.order_number, "status:", order_status);
        await queryDB(
          "SELECT public.log_audit($1, $2, $3, $4, $5)",
          ["webhook_duplicate_ignored", "orders", order.id, order.order_number,
           JSON.stringify({ tradeNo: providerTxId, status: order_status })]
        );
        return { data: { message: "Already processed", orderNumber: order.order_number, status: order_status } };
      }

      // 5. Inventory decrement (only on SUCCESS and only once)
      let inventoryResults = [];
      if (isSuccess) {
        const invRes = await client.query("SELECT * FROM public.decrement_order_inventory($1)", [order.id]);
        inventoryResults = invRes.rows;
        if (inventoryResults.length > 0) {
          console.log(logPrefix, "Inventory decremented:", inventoryResults.map(r => `${r.sku}: ${r.old_qty}→${r.new_qty}`).join(", "));
        }
      }

      // 6. Audit log: payment completed/failed
      await client.query(
        "SELECT public.log_audit($1, $2, $3, $4, $5)",
        [isSuccess ? "payment_completed" : "payment_failed", "payments", order.id, order.order_number,
         JSON.stringify({
           provider: "newebpay", tradeNo: providerTxId, amount: data.Amt,
           inventory: inventoryResults, status: order_status
         })]
      );

      await client.query("COMMIT");
      console.log(logPrefix, "Processed:", order.order_number, "->", order_status, "inventory:", inventoryResults.length, "items");
      return { data: { message: isSuccess ? "Payment completed" : "Payment failed", orderNumber: order.order_number, status: order_status, inventoryDecremented: inventoryResults.length } };
    } catch (err) {
      await client.query("ROLLBACK").catch(() => {});
      console.error(logPrefix, "DB error:", err.message);
      await queryDB(
        "SELECT public.log_audit($1, $2, $3, $4, $5)",
        ["webhook_db_error", "payments", order.id, order.order_number, JSON.stringify({ error: err.message })]
      );
      return { error: err.message };
    } finally {
      await client.end().catch(() => {});
    }
  },

  // GET /api/payments/newebpay/return — NewebPay sync return (browser redirect)
  "/api/payments/newebpay/return": async (sp) => {
    // The return URL receives encrypted data via POST (NewebPay sends POST)
    // For GET fallback, just redirect to status page
    const orderNumber = sp.get("orderNumber");
    return { data: { message: "Please check payment status", orderNumber: orderNumber || null } };
  },

  // POST /api/payments/mock — Simulate NewebPay webhook (dev only)
  // Uses the same hardened flow as real webhook: verify -> process_payment_webhook -> inventory -> audit
  "/api/payments/mock": async (_sp, body) => {
    const { orderNumber } = body;
    if (!orderNumber) return { error: "orderNumber required" };

    // Get order details
    const orderRes = await queryDB("SELECT id, order_number, total_amount, status FROM orders WHERE order_number = $1", [orderNumber]);
    if (orderRes.rows.length === 0) return { error: "Order not found" };
    const order = orderRes.rows[0];

    // Generate mock webhook payload
    const mockPayload = paymentService.generateMockWebhook(orderNumber, order.total_amount);
    if (mockPayload.error) return { error: mockPayload.error };

    // Verify signature (same as real webhook)
    const verify = paymentService.verifyWebhook(mockPayload);
    if (!verify.ok) return { error: verify.error };

    const data = verify.data;
    const providerTxId = data.TradeNo;
    const isSuccess = mockPayload.Status === "SUCCESS";

    // Process via hardened function (same as real webhook)
    const client = new Client({ connectionString: DATABASE_URI, ssl: { rejectUnauthorized: false } });
    try {
      await client.connect();
      await client.query("BEGIN");

      const procRes = await client.query(
        "SELECT * FROM public.process_payment_webhook($1, $2, $3, $4, $5, $6)",
        [order.id, providerTxId, providerTxId, isSuccess,
         JSON.stringify(mockPayload), null]
      );
      const { processed, order_status } = procRes.rows[0];

      if (!processed) {
        await client.query("COMMIT");
        return { data: { message: "Already processed", orderNumber, status: order_status } };
      }

      // Inventory decrement (only on success)
      let inventoryResults = [];
      if (isSuccess) {
        const invRes = await client.query("SELECT * FROM public.decrement_order_inventory($1)", [order.id]);
        inventoryResults = invRes.rows;
      }

      // Audit log
      await client.query(
        "SELECT public.log_audit($1, $2, $3, $4, $5)",
        ["payment_mock_completed", "payments", order.id, orderNumber,
         JSON.stringify({ tradeNo: providerTxId, amount: order.total_amount, inventory: inventoryResults })]
      );

      await client.query("COMMIT");
      return { data: { message: "Mock payment processed", orderNumber, status: order_status, inventoryDecremented: inventoryResults.length } };
    } catch (err) {
      await client.query("ROLLBACK").catch(() => {});
      return { error: err.message };
    } finally {
      await client.end().catch(() => {});
    }
  },

  /* ================================================================ */
  /*  ADMIN ENDPOINTS                                                   */
  /* ================================================================ */

  // GET /api/admin/dashboard — Overview stats
  "/api/admin/dashboard": async (_sp, _body, req) => {
    const authErr = requireAdmin(req);
    if (authErr) return authErr;

    const client = new Client({ connectionString: DATABASE_URI, ssl: { rejectUnauthorized: false } });
    try {
      await client.connect();
      const totalOrders = await client.query("SELECT COUNT(*)::int FROM orders");
      const paidOrders = await client.query("SELECT COUNT(*)::int FROM orders WHERE status = 'paid'");
      const pendingPayments = await client.query("SELECT COUNT(*)::int FROM payments WHERE status = 'pending'");
      const revenue = await client.query("SELECT COALESCE(SUM(total_amount), 0)::int FROM orders WHERE status = 'paid'");
      const lowStock = await client.query(
        "SELECT COUNT(*)::int FROM commerce_products WHERE stock_status IN ('low_stock', 'out_of_stock') AND is_active = true"
      );
      const recentAudit = await client.query(
        "SELECT event_type, order_number, details, created_at FROM audit_log ORDER BY created_at DESC LIMIT 10"
      );
      const recentOrders = await client.query(
        `SELECT order_number, status, customer_name, total_amount, created_at FROM orders ORDER BY created_at DESC LIMIT 5`
      );

      return {
        data: {
          totalOrders: totalOrders.rows[0].count,
          paidOrders: paidOrders.rows[0].count,
          pendingPayments: pendingPayments.rows[0].count,
          revenue: revenue.rows[0].coalesce,
          lowStockCount: lowStock.rows[0].count,
          recentAudit: recentAudit.rows,
          recentOrders: recentOrders.rows,
        },
      };
    } catch (err) { return { error: err.message }; }
    finally { await client.end().catch(() => {}); }
  },

  // GET /api/admin/orders — Order list with filters
  "/api/admin/orders": async (sp, _body, req) => {
    const authErr = requireAdmin(req);
    if (authErr) return authErr;

    const status = sp.get("status") || "";
    const paymentStatus = sp.get("paymentStatus") || "";
    const search = sp.get("search") || "";
    const dateFrom = sp.get("dateFrom") || "";
    const dateTo = sp.get("dateTo") || "";
    const limit = Math.min(parseInt(sp.get("limit") || "20", 10), 100);
    const offset = parseInt(sp.get("offset") || "0", 10);

    let sql = `
      SELECT o.id, o.order_number, o.status, o.customer_name, o.customer_phone, o.customer_email,
        o.total_amount, o.shipping_address, o.items_snapshot, o.note, o.is_guest, o.created_at, o.updated_at,
        p.status as payment_status, p.provider, p.amount as payment_amount, p.paid_at,
        p.provider_transaction_id, p.inventory_decremented_at
      FROM orders o
      LEFT JOIN payments p ON o.id = p.order_id
      WHERE 1=1
    `;
    const params = [];

    if (status) { sql += ` AND o.status = $${params.length + 1}`; params.push(status); }
    if (paymentStatus) { sql += ` AND p.status = $${params.length + 1}`; params.push(paymentStatus); }
    if (search) {
      sql += ` AND (o.order_number ILIKE $${params.length + 1} OR o.customer_name ILIKE $${params.length + 1} OR o.customer_phone ILIKE $${params.length + 1})`;
      params.push(`%${search}%`);
    }
    if (dateFrom) { sql += ` AND o.created_at >= $${params.length + 1}`; params.push(dateFrom); }
    if (dateTo) { sql += ` AND o.created_at <= $${params.length + 1}`; params.push(dateTo + "T23:59:59"); }

    // Count query
    let countSql = `SELECT COUNT(*)::int FROM orders o LEFT JOIN payments p ON o.id = p.order_id WHERE 1=1`;
    const countParams = [...params];

    sql += ` ORDER BY o.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const client = new Client({ connectionString: DATABASE_URI, ssl: { rejectUnauthorized: false } });
    try {
      await client.connect();
      const dataRes = await client.query(sql, params);
      const countRes = await client.query(countSql + sql.split("WHERE 1=1")[1].split("ORDER BY")[0], countParams);
      return { data: dataRes.rows, total: countRes.rows[0].count, limit, offset };
    } catch (err) { return { error: err.message }; }
    finally { await client.end().catch(() => {}); }
  },

  // GET /api/admin/orders/:orderNumber — Single order detail
  "/api/admin/orders/detail": async (sp, _body, req) => {
    const authErr = requireAdmin(req);
    if (authErr) return authErr;

    const orderNumber = sp.get("orderNumber");
    if (!orderNumber) return { error: "orderNumber required" };

    const client = new Client({ connectionString: DATABASE_URI, ssl: { rejectUnauthorized: false } });
    try {
      await client.connect();
      const orderRes = await client.query(
        `SELECT o.*, p.status as payment_status, p.provider, p.provider_transaction_id,
          p.webhook_event_id, p.processed_at, p.inventory_decremented_at, p.failure_reason,
          p.provider_response, p.paid_at
         FROM orders o LEFT JOIN payments p ON o.id = p.order_id
         WHERE o.order_number = $1`, [orderNumber]
      );
      if (orderRes.rows.length === 0) return { error: "Order not found" };

      const order = orderRes.rows[0];
      const itemsRes = await client.query("SELECT * FROM order_items WHERE order_id = $1", [order.id]);
      const auditRes = await client.query(
        "SELECT event_type, details, created_at FROM audit_log WHERE order_number = $1 ORDER BY created_at DESC",
        [orderNumber]
      );

      return { data: { ...order, items: itemsRes.rows, auditTrail: auditRes.rows } };
    } catch (err) { return { error: err.message }; }
    finally { await client.end().catch(() => {}); }
  },

  // GET /api/admin/payments — Payment list
  "/api/admin/payments": async (sp, _body, req) => {
    const authErr = requireAdmin(req);
    if (authErr) return authErr;

    const status = sp.get("status") || "";
    const search = sp.get("search") || "";
    const limit = Math.min(parseInt(sp.get("limit") || "20", 10), 100);
    const offset = parseInt(sp.get("offset") || "0", 10);

    let sql = `
      SELECT p.*, o.order_number, o.customer_name, o.total_amount
      FROM payments p
      JOIN orders o ON o.id = p.order_id
      WHERE 1=1
    `;
    const params = [];
    if (status) { sql += ` AND p.status = $${params.length + 1}`; params.push(status); }
    if (search) {
      sql += ` AND (o.order_number ILIKE $${params.length + 1} OR p.provider_transaction_id ILIKE $${params.length + 1})`;
      params.push(`%${search}%`);
    }
    sql += ` ORDER BY p.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const client = new Client({ connectionString: DATABASE_URI, ssl: { rejectUnauthorized: false } });
    try {
      await client.connect();
      const dataRes = await client.query(sql, params);
      const countRes = await client.query(`SELECT COUNT(*)::int FROM payments`);
      return { data: dataRes.rows, total: countRes.rows[0].count, limit, offset };
    } catch (err) { return { error: err.message }; }
    finally { await client.end().catch(() => {}); }
  },

  // GET /api/admin/inventory — Product inventory list
  "/api/admin/inventory": async (sp, _body, req) => {
    const authErr = requireAdmin(req);
    if (authErr) return authErr;

    const status = sp.get("status") || "";
    const search = sp.get("search") || "";
    const limit = Math.min(parseInt(sp.get("limit") || "50", 10), 100);
    const offset = parseInt(sp.get("offset") || "0", 10);

    let sql = `
      SELECT pc.id, pc.sku, pc.name, pc.category, pc.hero_image_url,
        cp.price, cp.stock_quantity, cp.stock_status, cp.is_active, cp.preorder
      FROM product_contents pc
      INNER JOIN commerce_products cp ON pc.id = cp.product_content_id
      WHERE pc.deleted_at IS NULL
    `;
    const params = [];
    if (status) { sql += ` AND cp.stock_status = $${params.length + 1}`; params.push(status); }
    if (search) {
      sql += ` AND (pc.sku ILIKE $${params.length + 1} OR pc.name ILIKE $${params.length + 1})`;
      params.push(`%${search}%`);
    }
    sql += ` ORDER BY cp.stock_quantity ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const client = new Client({ connectionString: DATABASE_URI, ssl: { rejectUnauthorized: false } });
    try {
      await client.connect();
      const dataRes = await client.query(sql, params);
      const countRes = await client.query(`SELECT COUNT(*)::int FROM commerce_products WHERE is_active = true`);
      return { data: dataRes.rows, total: countRes.rows[0].count, limit, offset };
    } catch (err) { return { error: err.message }; }
    finally { await client.end().catch(() => {}); }
  },

  // PATCH /api/admin/inventory/:sku — Manual stock adjustment
  "/api/admin/inventory/adjust": async (_sp, body, req) => {
    const authErr = requireAdmin(req);
    if (authErr) return authErr;

    const { sku, newQuantity, reason } = body;
    if (!sku) return { error: "sku required" };
    if (typeof newQuantity !== "number" || newQuantity < 0) return { error: "newQuantity must be >= 0" };
    if (!reason || reason.trim().length < 3) return { error: "reason required (min 3 chars)" };

    const client = new Client({ connectionString: DATABASE_URI, ssl: { rejectUnauthorized: false } });
    try {
      await client.connect();
      await client.query("BEGIN");

      const oldRes = await client.query(
        "SELECT stock_quantity, stock_status FROM commerce_products WHERE sku = $1", [sku]
      );
      if (oldRes.rows.length === 0) { await client.query("ROLLBACK"); return { error: "Product not found" }; }
      const old = oldRes.rows[0];

      const newStatus = newQuantity === 0 ? "out_of_stock" : newQuantity <= 5 ? "low_stock" : "in_stock";

      await client.query(
        "UPDATE commerce_products SET stock_quantity = $1, stock_status = $2, updated_at = NOW() WHERE sku = $3",
        [newQuantity, newStatus, sku]
      );

      // Audit log
      await client.query(
        "SELECT public.log_audit($1, $2, $3, $4, $5)",
        ["inventory_adjusted", "commerce_products", sku, null, JSON.stringify({
          oldQuantity: old.stock_quantity, newQuantity, oldStatus: old.stock_status,
          newStatus, reason: reason.trim(), adjustedBy: "admin"
        })]
      );

      await client.query("COMMIT");
      return { data: { sku, oldQuantity: old.stock_quantity, newQuantity, newStatus, reason: reason.trim() } };
    } catch (err) {
      await client.query("ROLLBACK").catch(() => {});
      return { error: err.message };
    } finally {
      await client.end().catch(() => {});
    }
  },

  // GET /api/admin/audit-log — Audit log list
  "/api/admin/audit-log": async (sp, _body, req) => {
    const authErr = requireAdmin(req);
    if (authErr) return authErr;

    const eventType = sp.get("eventType") || "";
    const orderNumber = sp.get("orderNumber") || "";
    const limit = Math.min(parseInt(sp.get("limit") || "50", 10), 100);
    const offset = parseInt(sp.get("offset") || "0", 10);

    let sql = "SELECT * FROM audit_log WHERE 1=1";
    const params = [];
    if (eventType) { sql += ` AND event_type = $${params.length + 1}`; params.push(eventType); }
    if (orderNumber) { sql += ` AND order_number = $${params.length + 1}`; params.push(orderNumber); }
    sql += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const client = new Client({ connectionString: DATABASE_URI, ssl: { rejectUnauthorized: false } });
    try {
      await client.connect();
      const dataRes = await client.query(sql, params);
      const countRes = await client.query("SELECT COUNT(*)::int FROM audit_log");
      return { data: dataRes.rows, total: countRes.rows[0].count, limit, offset };
    } catch (err) { return { error: err.message }; }
    finally { await client.end().catch(() => {}); }
  },

  /* ================================================================ */
  /*  PUBLIC SUPPORT ENDPOINTS                                          */
  /* ================================================================ */

  // POST /api/support/warranty-register — Register a warranty
  "/api/support/warranty-register": async (_sp, body) => {
    const { customerName, customerPhone, customerEmail, productSku, serialNumber, purchaseDate, purchaseChannel, orderNumber, proofUrl } = body;
    if (!customerName || !customerPhone || !productSku) return { error: "Name, phone, and product SKU required" };
    if (!purchaseDate) return { error: "Purchase date required" };

    const client = new Client({ connectionString: DATABASE_URI, ssl: { rejectUnauthorized: false } });
    try {
      await client.connect();

      // Get product name from SKU
      const productRes = await client.query("SELECT name FROM product_contents WHERE sku = $1 AND deleted_at IS NULL", [productSku]);
      const productName = productRes.rows[0]?.name || productSku;

      // Calculate expiry: purchase_date + 1 year
      const expiryDate = new Date(purchaseDate);
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);

      // Generate warranty code
      const codeRes = await client.query("SELECT public.generate_warranty_code() as code");
      const warrantyCode = codeRes.rows[0].code;

      // Check for duplicate serial number
      let duplicateWarning = null;
      if (serialNumber) {
        const dupRes = await client.query("SELECT warranty_code FROM warranties WHERE serial_number = $1", [serialNumber]);
        if (dupRes.rows.length > 0) {
          duplicateWarning = `Serial number already registered: ${dupRes.rows[0].warranty_code}`;
        }
      }

      const result = await client.query(
        `INSERT INTO warranties (warranty_code, product_sku, product_name, serial_number, purchase_date, expiry_date,
          purchase_channel, status, customer_name, customer_phone, customer_email, order_number, proof_url, registered_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'active', $8, $9, $10, $11, $12, NOW())
         RETURNING *`,
        [warrantyCode, productSku, productName, serialNumber || null, purchaseDate, expiryDate.toISOString().slice(0, 10),
         purchaseChannel || null, customerName, customerPhone, customerEmail || null, orderNumber || null, proofUrl || null]
      );

      // Audit log
      await client.query("SELECT public.log_audit($1, $2, $3, $4, $5)",
        ["warranty_registered", "warranties", result.rows[0].id, null,
         JSON.stringify({ warrantyCode, productSku, customerName, serialNumber, duplicateWarning })]
      );

      return { data: { ...result.rows[0], duplicateWarning } };
    } catch (err) { return { error: err.message }; }
    finally { await client.end().catch(() => {}); }
  },

  // GET /api/support/warranty-check — Check warranty by code or phone+serial
  "/api/support/warranty-check": async (sp) => {
    const code = sp.get("code");
    const phone = sp.get("phone");
    const serial = sp.get("serial");

    if (!code && !(phone && serial)) return { error: "Provide warranty code, or phone + serial number" };

    let sql = "SELECT * FROM warranties WHERE 1=1";
    const params = [];
    if (code) { sql += " AND warranty_code = $1"; params.push(code); }
    else { sql += " AND customer_phone = $1 AND serial_number = $2"; params.push(phone, serial); }
    sql += " ORDER BY registered_at DESC LIMIT 1";

    try {
      const result = await queryDB(sql, params);
      if (result.rows.length === 0) return { error: "Warranty not found" };
      const w = result.rows[0];
      const daysRemaining = Math.ceil((new Date(w.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return { data: { ...w, daysRemaining: Math.max(0, daysRemaining) } };
    } catch (err) { return { error: err.message }; }
  },

  // POST /api/support/tickets — Create a support ticket
  "/api/support/tickets": async (_sp, body) => {
    const { customerName, customerEmail, customerPhone, productSku, serialNumber, warrantyCode, issueType, issueDescription, images } = body;
    if (!customerName || !customerPhone) return { error: "Name and phone required" };
    if (!issueType || !issueDescription) return { error: "Issue type and description required" };

    const client = new Client({ connectionString: DATABASE_URI, ssl: { rejectUnauthorized: false } });
    try {
      await client.connect();

      // Find warranty if code provided
      let warrantyId = null;
      if (warrantyCode) {
        const wRes = await client.query("SELECT id FROM warranties WHERE warranty_code = $1", [warrantyCode]);
        if (wRes.rows.length > 0) warrantyId = wRes.rows[0].id;
      }

      // Generate ticket number
      const numRes = await client.query("SELECT public.generate_ticket_number() as num");
      const ticketNumber = numRes.rows[0].num;

      const result = await client.query(
        `INSERT INTO tickets (ticket_number, warranty_id, customer_name, customer_email, customer_phone,
          product_sku, issue_type, issue_description, status, priority, warranty_code, images, timeline, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'new', 'medium', $9, $10, $11, NOW(), NOW())
         RETURNING *`,
        [ticketNumber, warrantyId, customerName, customerEmail || null, customerPhone,
         productSku || null, issueType, issueDescription, warrantyCode || null,
         JSON.stringify(images || []),
         JSON.stringify([{ status: "new", note: "Ticket created", timestamp: new Date().toISOString() }])]
      );

      return { data: result.rows[0] };
    } catch (err) { return { error: err.message }; }
    finally { await client.end().catch(() => {}); }
  },

  // GET /api/support/tickets/status — Check repair status
  "/api/support/tickets/status": async (sp) => {
    const ticketNumber = sp.get("ticketNumber");
    if (!ticketNumber) return { error: "ticketNumber required" };

    try {
      const result = await queryDB("SELECT * FROM tickets WHERE ticket_number = $1", [ticketNumber]);
      if (result.rows.length === 0) return { error: "Ticket not found" };
      return { data: result.rows[0] };
    } catch (err) { return { error: err.message }; }
  },

  /* ================================================================ */
  /*  ADMIN SUPPORT ENDPOINTS                                           */
  /* ================================================================ */

  // GET /api/admin/tickets — Ticket list with filters
  "/api/admin/tickets": async (sp, _body, req) => {
    const authErr = requireAdmin(req);
    if (authErr) return authErr;

    const status = sp.get("status") || "";
    const priority = sp.get("priority") || "";
    const sku = sp.get("sku") || "";
    const search = sp.get("search") || "";
    const limit = Math.min(parseInt(sp.get("limit") || "20", 10), 100);
    const offset = parseInt(sp.get("offset") || "0", 10);

    let sql = "SELECT * FROM tickets WHERE 1=1";
    const params = [];
    if (status) { sql += ` AND status = $${params.length + 1}`; params.push(status); }
    if (priority) { sql += ` AND priority = $${params.length + 1}`; params.push(priority); }
    if (sku) { sql += ` AND product_sku = $${params.length + 1}`; params.push(sku); }
    if (search) {
      sql += ` AND (ticket_number ILIKE $${params.length + 1} OR customer_name ILIKE $${params.length + 1})`;
      params.push(`%${search}%`);
    }
    sql += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const client = new Client({ connectionString: DATABASE_URI, ssl: { rejectUnauthorized: false } });
    try {
      await client.connect();
      const dataRes = await client.query(sql, params);
      const countRes = await client.query("SELECT COUNT(*)::int FROM tickets");
      return { data: dataRes.rows, total: countRes.rows[0].count, limit, offset };
    } catch (err) { return { error: err.message }; }
    finally { await client.end().catch(() => {}); }
  },

  // PATCH /api/admin/tickets/:ticketNumber — Update ticket status/priority/notes
  "/api/admin/tickets/update": async (_sp, body, req) => {
    const authErr = requireAdmin(req);
    if (authErr) return authErr;

    const { ticketNumber, status, priority, note, internalNote } = body;
    if (!ticketNumber) return { error: "ticketNumber required" };

    const client = new Client({ connectionString: DATABASE_URI, ssl: { rejectUnauthorized: false } });
    try {
      await client.connect();
      await client.query("BEGIN");

      const tRes = await client.query("SELECT id, status FROM tickets WHERE ticket_number = $1", [ticketNumber]);
      if (tRes.rows.length === 0) { await client.query("ROLLBACK"); return { error: "Ticket not found" }; }
      const ticket = tRes.rows[0];

      const updates = [];
      const params = [];
      let paramIdx = 1;

      if (status && status !== ticket.status) {
        updates.push(`status = $${paramIdx++}`);
        params.push(status);
        // Add timeline entry
        await client.query("SELECT public.add_ticket_timeline($1, $2, $3)", [ticket.id, status, note || `Status changed to ${status}`]);
      }
      if (priority) { updates.push(`priority = $${paramIdx++}`); params.push(priority); }
      if (internalNote) {
        updates.push(`internal_notes = internal_notes || $${paramIdx++}::jsonb`);
        params.push(JSON.stringify([{ note: internalNote, timestamp: new Date().toISOString() }]));
      }
      if (note) {
        updates.push(`notes = notes || $${paramIdx++}::jsonb`);
        params.push(JSON.stringify([{ note, timestamp: new Date().toISOString() }]));
      }

      if (updates.length === 0) { await client.query("ROLLBACK"); return { error: "No fields to update" }; }

      params.push(ticketNumber);
      await client.query(`UPDATE tickets SET ${updates.join(", ")}, updated_at = NOW() WHERE ticket_number = $${paramIdx}`, params);

      // Audit log
      await client.query("SELECT public.log_audit($1, $2, $3, $4, $5)",
        ["ticket_updated", "tickets", ticket.id, null,
         JSON.stringify({ ticketNumber, status, priority, note, internalNote })]
      );

      await client.query("COMMIT");
      return { data: { ticketNumber, updated: true } };
    } catch (err) {
      await client.query("ROLLBACK").catch(() => {});
      return { error: err.message };
    } finally {
      await client.end().catch(() => {});
    }
  },

  // GET /api/admin/warranties — Warranty list with filters
  "/api/admin/warranties": async (sp, _body, req) => {
    const authErr = requireAdmin(req);
    if (authErr) return authErr;

    const status = sp.get("status") || "";
    const sku = sp.get("sku") || "";
    const search = sp.get("search") || "";
    const limit = Math.min(parseInt(sp.get("limit") || "20", 10), 100);
    const offset = parseInt(sp.get("offset") || "0", 10);

    let sql = "SELECT * FROM warranties WHERE 1=1";
    const params = [];
    if (status) { sql += ` AND status = $${params.length + 1}`; params.push(status); }
    if (sku) { sql += ` AND product_sku = $${params.length + 1}`; params.push(sku); }
    if (search) {
      sql += ` AND (warranty_code ILIKE $${params.length + 1} OR customer_name ILIKE $${params.length + 1} OR customer_phone ILIKE $${params.length + 1})`;
      params.push(`%${search}%`);
    }
    sql += ` ORDER BY registered_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const client = new Client({ connectionString: DATABASE_URI, ssl: { rejectUnauthorized: false } });
    try {
      await client.connect();
      const dataRes = await client.query(sql, params);
      const countRes = await client.query("SELECT COUNT(*)::int FROM warranties");
      return { data: dataRes.rows, total: countRes.rows[0].count, limit, offset };
    } catch (err) { return { error: err.message }; }
    finally { await client.end().catch(() => {}); }
  },

  // PATCH /api/admin/warranties/:warrantyCode — Extend or mark claimed
  "/api/admin/warranties/update": async (_sp, body, req) => {
    const authErr = requireAdmin(req);
    if (authErr) return authErr;

    const { warrantyCode, action, newExpiryDate, reason } = body;
    if (!warrantyCode) return { error: "warrantyCode required" };
    if (!action) return { error: "action required (extend/claim)" };

    const client = new Client({ connectionString: DATABASE_URI, ssl: { rejectUnauthorized: false } });
    try {
      await client.connect();
      await client.query("BEGIN");

      const wRes = await client.query("SELECT * FROM warranties WHERE warranty_code = $1", [warrantyCode]);
      if (wRes.rows.length === 0) { await client.query("ROLLBACK"); return { error: "Warranty not found" }; }
      const warranty = wRes.rows[0];

      if (action === "extend") {
        if (!newExpiryDate) { await client.query("ROLLBACK"); return { error: "newExpiryDate required for extend" }; }
        if (!reason || reason.trim().length < 3) { await client.query("ROLLBACK"); return { error: "reason required (min 3 chars)" }; }
        await client.query(
          "UPDATE warranties SET expiry_date = $1, extension_notes = $2, extended_by = 'admin', status = 'active', updated_at = NOW() WHERE warranty_code = $3",
          [newExpiryDate, reason.trim(), warrantyCode]
        );
        await client.query("SELECT public.log_audit($1, $2, $3, $4, $5)",
          ["warranty_extended", "warranties", warranty.id, null,
           JSON.stringify({ warrantyCode, oldExpiry: warranty.expiry_date, newExpiry: newExpiryDate, reason: reason.trim() })]
        );
      } else if (action === "claim") {
        await client.query(
          "UPDATE warranties SET status = 'claimed', updated_at = NOW() WHERE warranty_code = $1",
          [warrantyCode]
        );
        await client.query("SELECT public.log_audit($1, $2, $3, $4, $5)",
          ["warranty_claimed", "warranties", warranty.id, null,
           JSON.stringify({ warrantyCode, productSku: warranty.product_sku })]
        );
      } else {
        await client.query("ROLLBACK");
        return { error: "Invalid action. Use 'extend' or 'claim'" };
      }

      await client.query("COMMIT");
      return { data: { warrantyCode, action, updated: true } };
    } catch (err) {
      await client.query("ROLLBACK").catch(() => {});
      return { error: err.message };
    } finally {
      await client.end().catch(() => {});
    }
  },

  /* ================================================================ */
  /*  AI CUSTOMER SERVICE ROUTES                                      */
  /* ================================================================ */

  // POST /api/ai/chat — AI chat handler
  "/api/ai/chat": async (_sp, body) => {
    const { message, sessionId, context } = body || {};
    return aiService.handleChat({ message, sessionId, context });
  },

  // GET /api/admin/ai/knowledge — List knowledge entries
  "/api/admin/ai/knowledge": async (sp, _body, req) => {
    const adminCheck = requireAdmin(req);
    if (adminCheck) return adminCheck;
    const { items, total, error } = await aiService.listKnowledge({
      category: sp.get("category") || null,
      search: sp.get("search") || null,
      page: parseInt(sp.get("page") || "1", 10),
      limit: parseInt(sp.get("limit") || "20", 10),
    });
    if (error) return { error };
    return { items, total };
  },

  // POST /api/admin/ai/knowledge — Create knowledge entry
  "/api/admin/ai/knowledge/create": async (_sp, body, req) => {
    const adminCheck = requireAdmin(req);
    if (adminCheck) return adminCheck;
    return aiService.createKnowledge(body);
  },

  // PATCH /api/admin/ai/knowledge/:id — Update knowledge entry
  "/api/admin/ai/knowledge/update": async (_sp, body, req) => {
    const adminCheck = requireAdmin(req);
    if (adminCheck) return adminCheck;
    const { id, ...data } = body || {};
    if (!id) return { error: "id is required" };
    return aiService.updateKnowledge(id, data);
  },
};

/* ================================================================ */
/*  HTTP SERVER                                                       */
/* ================================================================ */

/* ================================================================ */
/*  HTTP SERVER (hardened)                                            */
/* ================================================================ */

const server = http.createServer(async (req, res) => {
  const ip = req.socket.remoteAddress || "unknown";
  const origin = req.headers.origin || "";
  const { pathname, searchParams } = parsePath(req.url);

  // 1. CORS preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204, getCorsHeaders(origin));
    res.end();
    return;
  }

  // 2. Method validation
  if (!["GET", "POST", "PATCH", "OPTIONS"].includes(req.method)) {
    sendJSON(res, 405, { error: "Method not allowed" });
    return;
  }

  // 3. Response headers with CORS
  const responseHeaders = getCorsHeaders(origin);

  // 4. Request size limit
  const contentLength = parseInt(req.headers["content-length"] || "0", 10);
  if (contentLength > MAX_BODY_SIZE) {
    res.writeHead(413, responseHeaders);
    res.end(JSON.stringify({ error: "Request body too large" }));
    return;
  }

  // 5. Rate limiting
  const isAdminPath = pathname.startsWith("/api/admin/");
  const rateLimit = checkRateLimit(ip, isAdminPath);
  if (!rateLimit.ok) {
    res.writeHead(429, { ...responseHeaders, "Retry-After": String(rateLimit.retryAfter) });
    res.end(JSON.stringify({ error: "Rate limit exceeded" }));
    return;
  }

  // 5.5 Static file serving (non-API routes)
  if (!pathname.startsWith("/api/")) {
    const served = await serveStaticFile(res, pathname);
    if (served) return;
    // If serveStaticFile somehow falls through, continue to API 404
  }

  // 6. Route lookup
  let handler = routes[pathname];

  if (!handler && req.method === "POST") {
    if (pathname === "/api/cart/validate") handler = routes["/api/cart/validate"];
    else if (pathname === "/api/cart/add") handler = routes["/api/cart/add"];
    else if (pathname === "/api/orders/create") handler = routes["/api/orders/create"];
    else if (pathname === "/api/payments/create") handler = routes["/api/payments/create"];
    else if (pathname === "/api/payments/newebpay/notify") handler = routes["/api/payments/newebpay/notify"];
    else if (pathname === "/api/payments/mock") handler = routes["/api/payments/mock"];
    else if (pathname === "/api/support/warranty-register") handler = routes["/api/support/warranty-register"];
    else if (pathname === "/api/support/tickets") handler = routes["/api/support/tickets"];
    else if (pathname === "/api/ai/chat") handler = routes["/api/ai/chat"];
    else if (pathname === "/api/admin/ai/knowledge/create") handler = routes["/api/admin/ai/knowledge/create"];
    else if (pathname === "/api/admin/ai/knowledge/update") handler = routes["/api/admin/ai/knowledge/update"];
  }

  if (!handler && req.method === "GET") {
    if (pathname === "/api/orders/detail") handler = routes["/api/orders/detail"];
    else if (pathname === "/api/payments/status") handler = routes["/api/payments/status"];
    else if (pathname === "/api/payments/newebpay/return") handler = routes["/api/payments/newebpay/return"];
    else if (pathname === "/api/admin/dashboard") handler = routes["/api/admin/dashboard"];
    else if (pathname === "/api/admin/orders") handler = routes["/api/admin/orders"];
    else if (pathname === "/api/admin/orders/detail") handler = routes["/api/admin/orders/detail"];
    else if (pathname === "/api/admin/payments") handler = routes["/api/admin/payments"];
    else if (pathname === "/api/admin/inventory") handler = routes["/api/admin/inventory"];
    else if (pathname === "/api/admin/audit-log") handler = routes["/api/admin/audit-log"];
    else if (pathname === "/api/support/warranty-check") handler = routes["/api/support/warranty-check"];
    else if (pathname === "/api/support/tickets/status") handler = routes["/api/support/tickets/status"];
    else if (pathname === "/api/admin/tickets") handler = routes["/api/admin/tickets"];
    else if (pathname === "/api/admin/warranties") handler = routes["/api/admin/warranties"];
    else if (pathname === "/api/admin/ai/knowledge") handler = routes["/api/admin/ai/knowledge"];
  }

  if (!handler && req.method === "PATCH") {
    if (pathname === "/api/admin/inventory/adjust") handler = routes["/api/admin/inventory/adjust"];
    else if (pathname === "/api/admin/tickets/update") handler = routes["/api/admin/tickets/update"];
    else if (pathname === "/api/admin/warranties/update") handler = routes["/api/admin/warranties/update"];
  }

  if (!handler) {
    res.writeHead(404, responseHeaders);
    res.end(JSON.stringify({ error: `Not found: ${pathname}` }));
    return;
  }

  // 7. Execute handler
  try {
    let body = {};
    if (req.method === "POST" || req.method === "PATCH") {
      try { body = await parseBody(req); } catch { /* empty ok */ }
    }
    const data = await handler(searchParams, body, req);

    const statusCode = typeof data.status === "number" ? data.status : (data.error ? 400 : 200);
    if (pathname === "/api/payments/create" && data.data?.formHtml) {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(data.data.formHtml);
      return;
    }
    res.writeHead(statusCode, responseHeaders);
    res.end(JSON.stringify(data));
  } catch (err) {
    console.error(`[API ERROR] ${pathname} ${err.message}`);
    res.writeHead(500, responseHeaders);
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
});

server.listen(PORT, () => {
  console.log(`\n=== API Server running on http://localhost:${PORT} ===`);
  console.log("Endpoints:");
  console.log(`  GET  /api/health`);
  console.log(`  GET  /api/products`);
  console.log(`  GET  /api/products/detail?slug=`);
  console.log(`  GET  /api/products/bestsellers`);
  console.log(`  GET  /api/solutions`);
  console.log(`  GET  /api/learn-articles`);
  console.log(`  GET  /api/reviews`);
  console.log(`  POST /api/cart/validate`);
  console.log(`  POST /api/cart/add`);
  console.log(`  POST /api/orders/create`);
  console.log(`  GET  /api/orders/detail?orderNumber=`);
  console.log(`  POST /api/payments/create           — NewebPay payment form`);
  console.log(`  GET  /api/payments/status?orderNumber=`);
  console.log(`  POST /api/payments/newebpay/notify  — Webhook handler`);
  console.log(`  GET  /api/payments/newebpay/return  — Return URL`);
  console.log(`  POST /api/payments/mock             — Simulate payment (dev)`);
  console.log("============================================\n");
});

process.on("SIGINT", () => { console.log("\nShutting down..."); server.close(() => process.exit(0)); });
