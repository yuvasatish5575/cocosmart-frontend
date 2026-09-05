import { useEffect, useState } from "react";
import { Package } from "lucide-react";
import { Badge, OrderTracking, EmptyState, Button } from "@/components/Frontend";
import { orderService } from "@/services/orderService";
import { orderStatusLabels } from "@/data/orders";
import { formatINR } from "@/lib/utils";
import { Link } from "react-router-dom";
import type { Order, OrderStatus } from "@/data/types";

const toneMap: Record<OrderStatus, "success" | "gold" | "neutral" | "error"> = {
  DELIVERED: "success",
  OUT_FOR_DELIVERY: "gold",
  SHIPPED: "gold",
  PROCESSING: "neutral",
  CONFIRMED: "neutral",
  PENDING: "neutral",
  CANCELLED: "error",
};

export default function Orders() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    orderService
      .listMine({ limit: 50 })
      .then((res) => {
        setOrders(res.orders);
        setExpanded(res.orders[0]?.id ?? null);
      })
      .catch(() => setOrders([]));
  }, []);

  if (orders === null) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-8 font-display text-3xl text-charcoal">My Orders</h1>
        <p className="text-sm text-charcoal-muted">Loading your orders…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 font-display text-3xl text-charcoal">My Orders</h1>

      {orders.length === 0 ? (
        <EmptyState
          icon={<Package className="h-8 w-8" strokeWidth={1.5} />}
          title="No orders yet"
          description="Once you place an order, you'll be able to track it here."
          action={
            <Button asChild>
              <Link to="/shop">Start Shopping</Link>
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((o) => (
            <article key={o.id} className="overflow-hidden rounded-lg border border-line bg-white">
              <button
                onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                className="flex w-full items-center gap-4 p-5 text-left"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-coconut-50 text-coconut">
                  <Package className="h-5 w-5" strokeWidth={1.8} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-charcoal">Order #{o.orderNumber}</span>
                    <Badge tone={toneMap[o.orderStatus]}>{orderStatusLabels[o.orderStatus]}</Badge>
                  </div>
                  <p className="truncate text-xs text-charcoal-muted">
                    {o.items.map((i) => i.productName).join(", ")}
                  </p>
                  <p className="text-xs text-charcoal-soft">{new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                </div>
                <span className="shrink-0 text-sm font-bold text-coconut-dark">{formatINR(o.totalAmount)}</span>
              </button>
              {expanded === o.id && (
                <div className="border-t border-line px-5 py-6">
                  <OrderTracking order={o} />
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
