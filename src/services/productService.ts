import { apiFetch } from "@/lib/apiClient";
import type { Pagination, Product } from "@/data/types";

export interface ProductListParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  inStockOnly?: boolean;
  sort?: "popularity" | "price_asc" | "price_desc" | "rating" | "newest";
}

interface ProductListResult {
  products: Product[];
  pagination: Pagination;
}

export const productService = {
  list(params: ProductListParams = {}) {
    return apiFetch<ProductListResult>("/products", { query: params as Record<string, string | number | boolean>, auth: false });
  },
  getBySlug(slug: string) {
    return apiFetch<Product>(`/products/slug/${encodeURIComponent(slug)}`, { auth: false });
  },

  // --- Admin ---
  listAdmin(params: ProductListParams = {}) {
    return apiFetch<ProductListResult>("/products/admin", { query: params as Record<string, string | number | boolean> });
  },
  create(input: Record<string, unknown>) {
    return apiFetch<Product>("/products", { method: "POST", body: input });
  },
  update(id: string, input: Record<string, unknown>) {
    return apiFetch<Product>(`/products/${id}`, { method: "PATCH", body: input });
  },
  deactivate(id: string) {
    return apiFetch<void>(`/products/${id}`, { method: "DELETE" });
  },
};
