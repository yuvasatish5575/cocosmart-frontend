import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Package } from "lucide-react";
import { useCart } from "./CartContext";
import { useToast } from "./useToast";
import { useAuth } from "./AuthContext";
import { getCartAnchorRect } from "@/lib/cartAnchor";
import { prefersReducedMotion } from "@/lib/utils";
import { ApiClientError } from "@/lib/apiClient";
import type { Product } from "@/data/types";

interface Flight {
  id: number;
  tone: Product["tone"];
  start: { x: number; y: number };
  mid: { x: number; y: number };
  end: { x: number; y: number };
}

interface Burst {
  id: number;
  x: number;
  y: number;
}

interface FlyToCartContextValue {
  trigger: (sourceEl: HTMLElement | null, product: Product, size: string, qty?: number) => void;
  bumpKey: number;
  announcement: string;
}

const FlyToCartContext = createContext<FlyToCartContextValue | null>(null);

const toneDot: Record<Product["tone"], string> = {
  coconut: "bg-coconut text-white",
  leaf: "bg-leaf text-white",
  gold: "bg-gold text-coconut-dark",
  cream: "bg-cream-dark text-coconut",
  charcoal: "bg-charcoal text-white",
};

export function FlyToCartProvider({ children }: { children: ReactNode }) {
  const { addItem } = useCart();
  const { show } = useToast();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const [bumpKey, setBumpKey] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const flightId = useRef(0);
  const burstId = useRef(0);
  const pendingRef = useRef(new Map<number, () => void>());

  const finish = useCallback(
    async (product: Product, size: string, qty: number, end?: { x: number; y: number }) => {
      try {
        await addItem(product, size, qty);
        setBumpKey((k) => k + 1);
        show("Added to your cart", `${product.name} · ${size}`);
        if (end) {
          const id = ++burstId.current;
          setBursts((prev) => [...prev, { id, x: end.x, y: end.y }]);
          setTimeout(() => setBursts((prev) => prev.filter((b) => b.id !== id)), 550);
        }
      } catch (err) {
        const message = err instanceof ApiClientError ? err.message : "Couldn't add that to your cart.";
        show("Not added", message, "error");
      }
    },
    [addItem, show]
  );

  const trigger = useCallback(
    (sourceEl: HTMLElement | null, product: Product, size: string, qty = 1) => {
      if (!isAuthenticated) {
        show("Sign in required", "Log in to add items to your cart.", "info");
        navigate("/login");
        return;
      }

      setAnnouncement(`${product.name}, ${size}, added to cart`);

      if (prefersReducedMotion() || !sourceEl) {
        void finish(product, size, qty);
        return;
      }

      const endRect = getCartAnchorRect();
      if (!endRect) {
        void finish(product, size, qty);
        return;
      }

      const startRect = sourceEl.getBoundingClientRect();
      const start = { x: startRect.left + startRect.width / 2, y: startRect.top + startRect.height / 2 };
      const end = { x: endRect.left + endRect.width / 2, y: endRect.top + endRect.height / 2 };
      const arcHeight = Math.max(70, Math.abs(start.x - end.x) * 0.25);
      const mid = { x: (start.x + end.x) / 2, y: Math.min(start.y, end.y) - arcHeight };

      const id = ++flightId.current;
      setFlights((prev) => [...prev, { id, tone: product.tone, start, mid, end }]);

      // finish() fires from onAnimationComplete on the flying element itself.
      pendingRef.current.set(id, () => {
        setFlights((prev) => prev.filter((f) => f.id !== id));
        void finish(product, size, qty, end);
      });
    },
    [finish, isAuthenticated, navigate, show]
  );

  return (
    <FlyToCartContext.Provider value={{ trigger, bumpKey, announcement }}>
      {children}
      {createPortal(
        <div aria-hidden="true">
          {flights.map((f) => (
            <motion.div
              key={f.id}
              initial={{ x: f.start.x, y: f.start.y, scale: 1, opacity: 1 }}
              animate={{
                x: [f.start.x, f.mid.x, f.end.x],
                y: [f.start.y, f.mid.y, f.end.y],
                scale: [1, 0.85, 0.35],
                opacity: [1, 1, 0.9],
              }}
              transition={{ duration: 0.9, times: [0, 0.55, 1], ease: [0.32, 0.72, 0.35, 1] }}
              onAnimationComplete={() => {
                pendingRef.current.get(f.id)?.();
                pendingRef.current.delete(f.id);
              }}
              style={{ position: "fixed", top: 0, left: 0, marginLeft: -16, marginTop: -16, zIndex: 200 }}
              className={`flex h-8 w-8 items-center justify-center rounded-full shadow-lifted ${toneDot[f.tone]}`}
            >
              <Package className="h-4 w-4" strokeWidth={2} />
            </motion.div>
          ))}
          {bursts.map((b) => (
            <div key={b.id} style={{ position: "fixed", left: b.x, top: b.y, zIndex: 199 }}>
              {Array.from({ length: 6 }).map((_, i) => {
                const angle = (i / 6) * Math.PI * 2;
                return (
                  <motion.span
                    key={i}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                    animate={{ x: Math.cos(angle) * 26, y: Math.sin(angle) * 26, opacity: 0, scale: 0.4 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    style={{ position: "absolute", width: 5, height: 5, borderRadius: "50%", background: "#C9A227" }}
                  />
                );
              })}
            </div>
          ))}
        </div>,
        document.body
      )}
      <div className="visually-hidden" role="status" aria-live="polite">
        {announcement}
      </div>
    </FlyToCartContext.Provider>
  );
}

export function useFlyToCart() {
  const ctx = useContext(FlyToCartContext);
  if (!ctx) throw new Error("useFlyToCart must be used within FlyToCartProvider");
  return ctx;
}
