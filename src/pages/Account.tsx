import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapPin, CreditCard, Heart, LifeBuoy, ChevronRight, Package, LogOut, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/Frontend";
import { useAuth } from "@/hooks/AuthContext";
import { orderService } from "@/services/orderService";
import { orderStatusLabels } from "@/data/orders";
import type { Order } from "@/data/types";

const menu = [
  { icon: MapPin, label: "My Addresses", to: "/account/addresses" },
  { icon: CreditCard, label: "Payment Methods" },
  { icon: Heart, label: "Wishlist", to: "/wishlist" },
  { icon: LifeBuoy, label: "Help & Support" },
];

export default function Account() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  useEffect(() => {
    orderService
      .listMine({ limit: 2 })
      .then((res) => setRecentOrders(res.orders))
      .catch(() => setRecentOrders([]));
  }, []);

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <div>
      <section className="bg-gradient-to-br from-coconut to-coconut-dark px-4 py-12 text-white sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15 font-display text-xl text-gold-light">
              {user?.name?.charAt(0).toUpperCase() ?? "?"}
            </span>
            <div>
              <h1 className="font-display text-xl">Hi, {user?.name?.split(" ")[0] ?? "there"} 👋</h1>
              <span className="text-sm text-white/70">{user?.email}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-full border border-white/25 px-3 py-2 text-xs font-bold text-white hover:bg-white/10"
          >
            <LogOut className="h-3.5 w-3.5" /> Log Out
          </button>
        </div>
      </section>

      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        {user?.role === "ADMIN" && (
          <Link
            to="/admin"
            className="mb-8 flex items-center gap-3 rounded-lg border border-gold-100 bg-gold-50 px-4 py-4 text-sm font-bold text-gold-dark hover:bg-gold-100"
          >
            <ShieldCheck className="h-4 w-4" /> Go to Admin Dashboard
            <ChevronRight className="ml-auto h-4 w-4" />
          </Link>
        )}

        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg text-charcoal">My Orders</h2>
            <Link to="/orders" className="text-xs font-bold text-coconut">View all</Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="rounded-lg border border-line px-4 py-6 text-center text-sm text-charcoal-muted">No orders yet.</p>
          ) : (
            <div className="flex flex-col divide-y divide-line rounded-lg border border-line">
              {recentOrders.map((o) => (
                <div key={o.id} className="flex items-center gap-3 p-4">
                  <span className="flex h-9 w-9 items-center justify-center rounded-md bg-cream-dark text-charcoal-muted">
                    <Package className="h-4 w-4" />
                  </span>
                  <div className="flex-1">
                    <span className="text-sm font-bold text-charcoal">Order #{o.orderNumber}</span>
                    <p className="text-xs text-charcoal-soft">{new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                  </div>
                  <Badge tone={o.orderStatus === "DELIVERED" ? "success" : "gold"}>{orderStatusLabels[o.orderStatus]}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-lg border border-line">
          {menu.map((m) => (
            <Link
              key={m.label}
              to={m.to ?? "#"}
              className="flex items-center gap-3 border-b border-line px-4 py-4 text-sm font-semibold text-charcoal last:border-b-0 hover:bg-cream"
            >
              <m.icon className="h-4 w-4 text-coconut" strokeWidth={1.8} />
              {m.label}
              <ChevronRight className="ml-auto h-4 w-4 text-charcoal-soft" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
