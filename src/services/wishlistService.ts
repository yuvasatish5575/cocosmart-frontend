import { apiFetch } from "@/lib/apiClient";
import type { Product } from "@/data/types";

export const wishlistService = {
  list() {
    return apiFetch<{ products: Product[] }>("/wishlist").then((r) => r.products);
  },
  add(productId: string) {
    return apiFetch<{ products: Product[] }>("/wishlist", { method: "POST", body: { productId } }).then((r) => r.products);
  },
  remove(productId: string) {
    return apiFetch<{ products: Product[] }>(`/wishlist/${productId}`, { method: "DELETE" }).then((r) => r.products);
  },
};
