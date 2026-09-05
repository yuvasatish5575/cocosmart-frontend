import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { wishlistService } from "@/services/wishlistService";
import type { Product } from "@/data/types";

interface WishlistContextValue {
  products: Product[];
  ids: Set<string>;
  isWishlisted: (productId: string) => boolean;
  toggle: (productId: string) => Promise<void>;
  count: number;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      setProducts([]);
      return;
    }
    wishlistService.list().then(setProducts).catch(() => setProducts([]));
  }, [isAuthenticated]);

  const ids = useMemo(() => new Set(products.map((p) => p.id)), [products]);
  const isWishlisted = useCallback((productId: string) => ids.has(productId), [ids]);

  const toggle = useCallback(
    async (productId: string) => {
      const result = ids.has(productId) ? await wishlistService.remove(productId) : await wishlistService.add(productId);
      setProducts(result);
    },
    [ids]
  );

  const value = useMemo(() => ({ products, ids, isWishlisted, toggle, count: products.length }), [products, ids, isWishlisted, toggle]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
