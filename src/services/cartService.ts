import { apiFetch } from "@/lib/apiClient";
import type { Cart } from "@/data/types";

export const cartService = {
  get() {
    return apiFetch<Cart>("/cart");
  },
  addItem(productId: string, size: string, quantity = 1) {
    return apiFetch<Cart>("/cart/items", { method: "POST", body: { productId, size, quantity } });
  },
  updateItem(itemKey: string, quantity: number) {
    return apiFetch<Cart>(`/cart/items/${itemKey}`, { method: "PATCH", body: { quantity } });
  },
  removeItem(itemKey: string) {
    return apiFetch<Cart>(`/cart/items/${itemKey}`, { method: "DELETE" });
  },
  clear() {
    return apiFetch<Cart>("/cart", { method: "DELETE" });
  },
};
