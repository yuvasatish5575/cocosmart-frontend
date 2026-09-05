import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, Package, ClipboardList, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "Products", icon: Package, end: false },
  { to: "/admin/orders", label: "Orders", icon: ClipboardList, end: false },
];

export default function AdminLayout() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <NavLink to="/account" className="mb-2 flex items-center gap-1 text-xs font-bold text-charcoal-soft hover:text-coconut">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Account
          </NavLink>
          <h1 className="font-display text-2xl text-charcoal">Admin Dashboard</h1>
        </div>
      </div>

      <nav className="mb-8 flex gap-2 border-b border-line">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-1.5 border-b-2 px-4 py-3 text-sm font-bold transition-colors",
                isActive ? "border-coconut text-coconut" : "border-transparent text-charcoal-muted hover:text-charcoal"
              )
            }
          >
            <t.icon className="h-4 w-4" strokeWidth={1.8} />
            {t.label}
          </NavLink>
        ))}
      </nav>

      <Outlet />
    </div>
  );
}
