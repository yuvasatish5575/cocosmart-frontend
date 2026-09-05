import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { cartService } from "@/services/cartService";
import type { Cart, Product } from "@/data/types";

interface CartContextValue {
  lines: Cart["lines"];
  count: number;
  subtotal: number;
  delivery: number;
  total: number;
  isLoading: boolean;
  addItem: (product: Product, size: string, qty?: number) => Promise<void>;
  updateQty: (key: string, qty: number) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
  clear: () => Promise<void>;
  refresh: () => Promise<void>;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const EMPTY_CART: Cart = { id: "", lines: [], count: 0, subtotal: 0, delivery: 0, total: 0 };

/**
 * Cart state always comes from the backend (see cartService) — there is no
 * local/optimistic quantity math here. Every mutation sends the request,
 * waits for the server's recomputed totals, and renders exactly that.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<Cart>(EMPTY_CART);
  const [isLoading, setIsLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(EMPTY_CART);
      return;
    }
    setIsLoading(true);
    try {
      setCart(await cartService.get());
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addItem = useCallback(async (product: Product, size: string, qty = 1) => {
    setCart(await cartService.addItem(product.id, size, qty));
  }, []);

  const updateQty = useCallback(async (key: string, qty: number) => {
    setCart(await cartService.updateItem(key, qty));
  }, []);

  const removeItem = useCallback(async (key: string) => {
    setCart(await cartService.removeItem(key));
  }, []);

  const clear = useCallback(async () => {
    setCart(await cartService.clear());
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      lines: cart.lines,
      count: cart.count,
      subtotal: cart.subtotal,
      delivery: cart.delivery,
      total: cart.total,
      isLoading,
      addItem,
      updateQty,
      removeItem,
      clear,
      refresh,
      drawerOpen,
      setDrawerOpen,
    }),
    [cart, isLoading, addItem, updateQty, removeItem, clear, refresh, drawerOpen]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
