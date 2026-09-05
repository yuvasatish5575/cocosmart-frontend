import { useEffect, useState } from "react";
import { Badge, Button } from "@/components/Frontend";
import { useToast } from "@/hooks/useToast";
import { orderService } from "@/services/orderService";
import { orderStatusLabels } from "@/data/orders";
import { ApiClientError } from "@/lib/apiClient";
import { formatINR } from "@/lib/utils";
import type { Order, OrderStatus, Pagination } from "@/data/types";

const statuses: OrderStatus[] = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];

const toneMap: Record<OrderStatus, "success" | "gold" | "neutral" | "error"> = {
  DELIVERED: "success",
  OUT_FOR_DELIVERY: "gold",
  SHIPPED: "gold",
  PROCESSING: "neutral",
  CONFIRMED: "neutral",
  PENDING: "neutral",
  CANCELLED: "error",
};

export default function AdminOrders() {
  const { show } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    orderService
      .listAll({ page, limit: 20, status: statusFilter || undefined })
      .then((res) => {
        setOrders(res.orders);
        setPagination(res.pagination);
      })
      .catch(() => show("Couldn't load orders", "Please try again.", "error"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter]);

  async function updateStatus(id: string, orderStatus: OrderStatus) {
    setUpdatingId(id);
    try {
      const updated = await orderService.updateStatus(id, orderStatus);
      setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
      show("Order updated", `#${updated.orderNumber} → ${orderStatusLabels[updated.orderStatus]}`);
    } catch (err) {
      show("Update failed", err instanceof ApiClientError ? err.message : "Please try again.", "error");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => {
            setStatusFilter("");
            setPage(1);
          }}
          className={
            statusFilter === ""
              ? "rounded-full bg-coconut px-4 py-1.5 text-xs font-bold text-white"
              : "rounded-full border border-line px-4 py-1.5 text-xs font-bold text-charcoal-muted hover:border-coconut"
          }
        >
          All
        </button>
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => {
              setStatusFilter(s);
              setPage(1);
            }}
            className={
              statusFilter === s
                ? "rounded-full bg-coconut px-4 py-1.5 text-xs font-bold text-white"
                : "rounded-full border border-line px-4 py-1.5 text-xs font-bold text-charcoal-muted hover:border-coconut"
            }
          >
            {orderStatusLabels[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-charcoal-muted">Loading orders…</p>
      ) : orders.length === 0 ? (
        <p className="rounded-lg border border-line px-4 py-8 text-center text-sm text-charcoal-muted">No orders found.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-line bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs font-bold uppercase tracking-wide text-charcoal-soft">
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Update</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-line last:border-b-0">
                  <td className="px-4 py-3 font-semibold text-charcoal">#{o.orderNumber}</td>
                  <td className="px-4 py-3 text-charcoal-muted">{o.customer?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-charcoal-soft">{new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</td>
                  <td className="px-4 py-3">
                    <Badge tone={o.paymentStatus === "PAID" ? "success" : o.paymentStatus === "FAILED" ? "error" : "neutral"}>
                      {o.paymentStatus}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-charcoal">{formatINR(o.totalAmount)}</td>
                  <td className="px-4 py-3">
                    <Badge tone={toneMap[o.orderStatus]}>{orderStatusLabels[o.orderStatus]}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <select
                      value={o.orderStatus}
                      disabled={updatingId === o.id}
                      onChange={(e) => updateStatus(o.id, e.target.value as OrderStatus)}
                      className="h-8 rounded-md border border-line bg-white px-2 text-xs font-semibold text-charcoal"
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s}>
                          {orderStatusLabels[s]}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="text-xs text-charcoal-muted">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button size="sm" variant="outline" disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
