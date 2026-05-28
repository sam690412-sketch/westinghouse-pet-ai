import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { env } from "@/lib/env";

/* ================================================================
   CART SYSTEM — Westinghouse Pet Taiwan
   Guest: localStorage only
   Authenticated: Supabase cart_items (future)
   ================================================================ */

const API_BASE = env.API_BASE;

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
  const isFirstRender = useRef(true);

  /** Load cart from storage + enrich on mount */
  useEffect(() => {
    const stored = loadStorage();
    if (stored.length > 0) {
      enrichItems(stored);
    }
  }, []);

  /** Persist to storage whenever items change (after first render) */
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
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
      const result = await apiPost<{ data: CartItem[]; total: number }>("/cart/validate", {
        items: stored.map((s) => ({ sku: s.sku, quantity: s.quantity })),
      });
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
        // Check if already in cart
        const existing = items.find((i) => i.sku === sku);
        if (existing) {
          const newQty = existing.quantity + quantity;
          await updateQuantity(existing.id, newQty);
          setLastAction(`updated ${sku} to ${newQty}`);
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
