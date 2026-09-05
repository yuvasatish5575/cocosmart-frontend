import type { OrderStatus } from "./types";

/** Matches the backend's OrderStatus enum exactly — order here is the visual sequence in OrderTracking. */
export const orderTrackingStages: OrderStatus[] = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"];

export const orderStatusLabels: Record<OrderStatus, string> = {
  PENDING: "Order Placed",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};
