import { apiFetch } from "@/lib/apiClient";
import type { Order, OrderStatus, Pagination, PaymentMethod } from "@/data/types";

export interface CheckoutInput {
  addressId?: string;
  newAddress?: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country?: string;
  };
  paymentMethod: PaymentMethod;
  deliverySlot?: string;
}

interface OrderListResult {
  orders: Order[];
  pagination: Pagination;
}

export const orderService = {
  checkout(input: CheckoutInput) {
    return apiFetch<Order>("/orders", { method: "POST", body: input });
  },
  listMine(params: { page?: number; limit?: number } = {}) {
    return apiFetch<OrderListResult>("/orders", { query: params });
  },
  getMine(id: string) {
    return apiFetch<Order>(`/orders/${id}`);
  },

  // --- Admin ---
  listAll(params: { page?: number; limit?: number; status?: OrderStatus } = {}) {
    return apiFetch<OrderListResult>("/admin/orders", { query: params });
  },
  updateStatus(id: string, orderStatus: OrderStatus) {
    return apiFetch<Order>(`/admin/orders/${id}/status`, { method: "PATCH", body: { orderStatus } });
  },
};
