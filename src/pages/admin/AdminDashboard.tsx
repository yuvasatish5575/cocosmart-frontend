import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { IndianRupee, Package, Users, ClipboardList, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/Frontend";
import { adminService } from "@/services/adminService";
import { formatINR } from "@/lib/utils";
import type { AdminDashboard as AdminDashboardData } from "@/data/types";

export default function AdminDashboard() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminService
      .dashboard()
      .then(setData)
      .catch(() => setError("Couldn't load dashboard stats."));
  }, []);

  if (error) return <p className="text-sm text-error">{error}</p>;
  if (!data) return <p className="text-sm text-charcoal-muted">Loading dashboard…</p>;

  const stats = [
    { label: "Total Revenue", value: formatINR(data.totalRevenue), icon: IndianRupee },
    { label: "Total Orders", value: data.totalOrders, icon: ClipboardList },
    { label: "Pending Orders", value: data.pendingOrders, icon: ClipboardList },
    { label: "Delivered Orders", value: data.deliveredOrders, icon: Package },
    { label: "Customers", value: data.totalCustomers, icon: Users },
    { label: "Products", value: data.totalProducts, icon: Package },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border border-line bg-white p-5">
            <s.icon className="h-5 w-5 text-coconut" strokeWidth={1.8} />
            <p className="mt-3 font-display text-xl text-charcoal">{s.value}</p>
            <p className="text-xs text-charcoal-muted">{s.label}</p>
          </div>
        ))}
      </div>

      {data.lowStockProducts.length > 0 && (
        <div>
          <h2 className="mb-3 flex items-center gap-2 font-display text-lg text-charcoal">
            <AlertTriangle className="h-4 w-4 text-gold-dark" /> Low Stock
          </h2>
          <div className="overflow-hidden rounded-lg border border-line bg-white">
            {data.lowStockProducts.map((p) => (
              <Link
                key={p.id}
                to={`/product/${p.slug}`}
                className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 text-sm last:border-b-0 hover:bg-cream"
              >
                <span className="font-semibold text-charcoal">{p.name}</span>
                <Badge tone={p.stockQuantity === 0 ? "error" : "gold"}>{p.stockQuantity} left</Badge>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="mb-3 font-display text-lg text-charcoal">Recent Orders</h2>
        <div className="overflow-x-auto rounded-lg border border-line bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs font-bold uppercase tracking-wide text-charcoal-soft">
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {data.recentOrders.map((o) => (
                <tr key={o.id} className="border-b border-line last:border-b-0">
                  <td className="px-4 py-3 font-semibold text-charcoal">#{o.orderNumber}</td>
                  <td className="px-4 py-3 text-charcoal-muted">{o.customer?.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Badge tone={o.orderStatus === "DELIVERED" ? "success" : o.orderStatus === "CANCELLED" ? "error" : "gold"}>
                      {o.orderStatus}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={o.paymentStatus === "PAID" ? "success" : o.paymentStatus === "FAILED" ? "error" : "neutral"}>
                      {o.paymentStatus}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-charcoal">{formatINR(o.totalAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
