import { apiFetch } from "@/lib/apiClient";
import type { AdminDashboard, Pagination } from "@/data/types";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
  _count: { orders: number };
}

export const adminService = {
  dashboard() {
    return apiFetch<AdminDashboard>("/admin/dashboard");
  },
  listUsers(params: { page?: number; limit?: number } = {}) {
    return apiFetch<{ users: AdminUser[]; pagination: Pagination }>("/admin/users", { query: params });
  },
};
