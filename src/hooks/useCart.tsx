import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { env } from "@/lib/env";
import { IS_LIVE_STORE } from "@/config/storeConfig";
import { PRODUCTS } from "@/data/products";

/* ================================================================
   CART SYSTEM — Westinghouse Pet Taiwan
   Guest: localStorage only
   Authenticated: Supabase cart_items (future)
   ================================================================ */

const API_BASE = env.API_BASE;
function normalizeSku(sku: string) {
 const key = sku.toUpperCase().replace(/^WH-/, "").replace(/-TW$/, "").replace(/-/g, "");
 return PRODUCTS.find(p => p.slug === sku || p.slug.split("-")[0].toUpperCase() === key)?.slug || sku;
}

// V32: never derive reservability from the static product seed.
async function fetchListedReservationSlugs(): Promise<Set<string>> {
  const response=await fetch(`${API_BASE}/products/prices`, {cache:'no-store',headers:{Accept:'application/json'}});
  if (!response.ok) throw new Error('Product availability temporarily unavailable');
  const payload=await response.json() as {data?: unknown};
  if (!Array.isArray(payload?.data)) throw new Error('Product availability temporarily unavailable');
  const result=new Set<string>();
  for (const row of payload.data) {
    if (row?.listed !== true || typeof row.sku !== 'string') continue;
    const slug=normalizeSku(row.sku);
    if (PRODUCTS.some(p=>p.slug===slug)) result.add(slug);
  }
  return result;
}

const STORAGE_KEY = "wpet_cart";
const STORAGE_VERSION = "1";

/** Raw cart item stored in localStorage */
interface CartStorageItem {
  sku: string;
  quantity: number;
  addedAt: string;
}

/** Enriched cart item for UI */
export interface CartItem {
  id: string;
  slug: string;
  sku: string;
  name: string;
  tagline?: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  stockStatus: string;
  stockQuantity: number;
  imageUrl?: string;
  subtotal: number;
  maxQuantity: number;
}

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  error: string | null;
  lastAction: string | null;
}

interface CartContextValue extends CartState {
  addItem: (sku: string, quantity?: number) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  removeItem: (id: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  isItemInCart: (sku: string) => boolean;
  freeShippingProgress: { current: number; threshold: number; percentage: number; qualifies: boolean };
}

const CartContext = createContext<CartContextValue | null>(null);

/* ---------------------------------------------------------------- */
/*  STORAGE HELPERS                                                   */
/* ---------------------------------------------------------------- */

function loadStorage(): CartStorageItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (parsed.v !== STORAGE_VERSION) return [];
    // Filter expired items (30 days)
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return (parsed.items || []).filter((i: CartStorageItem) => new Date(i.addedAt).getTime() > cutoff);
  } catch {
    return [];
  }
}

function saveStorage(items: CartStorageItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: STORAGE_VERSION, items }));
}

/* ---------------------------------------------------------------- */
/*  API HELPERS                                                       */
/* ---------------------------------------------------------------- */

async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

/* ---------------------------------------------------------------- */
/*  PROVIDER                                                          */
/* ---------------------------------------------------------------- */

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const storageReady = useRef(false);

  /** Load cart from storage + enrich on mount */
  useEffect(() => {
    const stored = loadStorage();
    if (stored.length > 0) {
      enrichItems(stored);
    } else {
      storageReady.current = true;
    }
  }, []);

  /** Persist to storage whenever items change (after first render) */
  useEffect(() => {
    if (!storageReady.current) return;
    const stored: CartStorageItem[] = items.map((i) => ({
      sku: i.sku,
      quantity: i.quantity,
      addedAt: new Date().toISOString(),
    }));
    saveStorage(stored);
  }, [items]);

  /** Enrich raw storage items via API */
  const enrichItems = useCallback(async (stored: CartStorageItem[]) => {
    setIsLoading(true);
    setError(null);
    try {
      if (!IS_LIVE_STORE) {
        const listed = await fetchListedReservationSlugs();
        const restored = new Map<string, CartItem>();
        for (const raw of stored) {
          if (typeof raw?.sku !== 'string' || !Number.isSafeInteger(raw.quantity) || raw.quantity < 1) continue;
          const product=PRODUCTS.find(p=>p.slug===normalizeSku(raw.sku));
          if (!product || !listed.has(product.slug)) continue;
          const quantity=Math.min(99,(restored.get(product.slug)?.quantity ?? 0)+raw.quantity);
          restored.set(product.slug,{id:product.slug,slug:product.slug,sku:product.slug,name:product.name,tagline:product.tagline,price:0,quantity,stockStatus:'pre_order',stockQuantity:99,imageUrl:product.image,subtotal:0,maxQuantity:99});
        }
        storageReady.current = true;
        setItems([...restored.values()]);
        if (stored.some(raw=>typeof raw?.sku !== 'string' || !listed.has(normalizeSku(raw.sku)))) setError('Some products are no longer available for reservation');
        return;
      }
      const result = await apiPost<{ data: CartItem[]; total: number }>("/cart/validate", {
        items: stored.map((s) => ({ sku: s.sku, quantity: s.quantity })),
      });
      storageReady.current = true;
      setItems(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load cart");
    } finally {
      setIsLoading(false);
    }
  }, []);

  /** Add item to cart */
  const addItem = useCallback(
    async (sku: string, quantity = 1) => {
      setError(null);
      setIsLoading(true);
      try {
        if (!storageReady.current && loadStorage().length > 0) throw new Error('Cart restoration incomplete. Reload to retry.');
        storageReady.current = true;
        if (!IS_LIVE_STORE) {
          if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 99) throw new Error('Invalid quantity');
          if (!(await fetchListedReservationSlugs()).has(normalizeSku(sku))) throw new Error('Product is not available for reservation');
        }
        // Check if already in cart
        const existing = items.find((i) => i.sku === (IS_LIVE_STORE ? sku : normalizeSku(sku)));
        if (existing) {
          const newQty = existing.quantity + quantity;
          if (!IS_LIVE_STORE) setItems(prev=>prev.map(i=>i.id===existing.id?{...i,quantity:Math.min(99,i.quantity+quantity)}:i));
          else await updateQuantity(existing.id, newQty);
          setLastAction(`updated ${sku} to ${newQty}`);
          return;
        }

        if (!IS_LIVE_STORE) {
          if (!Number.isInteger(quantity) || quantity < 1) throw new Error("Invalid quantity");
          const product=PRODUCTS.find(p=>p.slug===normalizeSku(sku));
          if (!product) throw new Error('Unknown product SKU');
          setItems(prev=>[...prev,{id:product.slug,slug:product.slug,sku:product.slug,name:product.name,tagline:product.tagline,price:0,quantity:Math.min(99,quantity),stockStatus:'pre_order',stockQuantity:99,imageUrl:product.image,subtotal:0,maxQuantity:99}]);
          return;
        }
        const result = await apiPost<{ data: CartItem }>("/cart/add", { sku, quantity });
        if (result.data) {
          setItems((prev) => [...prev, result.data]);
          setLastAction(`added ${sku}`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add item");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [items]
  );

  /** Update item quantity */
  const updateQuantity = useCallback(
    async (id: string, quantity: number) => {
      if (quantity < 1) return;
      const item = items.find((i) => i.id === id);
      if (!item) return;

      setError(null);
      try {
        if (!IS_LIVE_STORE) {
          if (!Number.isSafeInteger(quantity) || quantity < 1) throw new Error('Invalid quantity');
          if (quantity > item.quantity && !(await fetchListedReservationSlugs()).has(normalizeSku(item.sku))) throw new Error('Product is not available for reservation');
          setItems(prev=>prev.map(i=>i.id===id?{...i,quantity:Math.min(99,quantity)}:i));return;
        }
        const result = await apiPost<{ data: CartItem }>("/cart/add", {
          sku: item.sku,
          quantity,
        });
        if (result.data) {
          setItems((prev) =>
            prev.map((i) => (i.id === id ? { ...result.data!, id } : i))
          );
          setLastAction(`qty ${quantity}`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "庫存不足");
      }
    },
    [items]
  );

  /** Remove item */
  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    setLastAction(`removed ${id}`);
  }, []);

  /** Clear cart */
  const clearCart = useCallback(() => {
    setItems([]);
    saveStorage([]);
    setLastAction("cleared");
  }, []);

  /** Derived values */
  const cartCount = items.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = items.reduce((s, i) => s + i.subtotal, 0);
  const isItemInCart = useCallback(
    (sku: string) => items.some((i) => i.sku === sku),
    [items]
  );

  const FREE_SHIPPING_THRESHOLD = 1500;
  const freeShippingProgress = {
    current: cartTotal,
    threshold: FREE_SHIPPING_THRESHOLD,
    percentage: Math.min(100, (cartTotal / FREE_SHIPPING_THRESHOLD) * 100),
    qualifies: cartTotal >= FREE_SHIPPING_THRESHOLD,
  };

  return (
    <CartContext.Provider
      value={{
        items,
        isLoading,
        error,
        lastAction,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        cartCount,
        cartTotal,
        isItemInCart,
        freeShippingProgress,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/** Hook to access cart */
export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
