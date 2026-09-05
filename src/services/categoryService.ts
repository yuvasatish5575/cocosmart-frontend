import { apiFetch } from "@/lib/apiClient";
import type { Category } from "@/data/types";

export const categoryService = {
  list() {
    return apiFetch<{ categories: Category[] }>("/categories", { auth: false }).then((r) => r.categories);
  },
  create(input: Record<string, unknown>) {
    return apiFetch<Category>("/categories", { method: "POST", body: input });
  },
  update(id: string, input: Record<string, unknown>) {
    return apiFetch<Category>(`/categories/${id}`, { method: "PUT", body: input });
  },
  remove(id: string) {
    return apiFetch<void>(`/categories/${id}`, { method: "DELETE" });
  },
};
