import { useEffect, useState } from "react";
import { Clock, PauseCircle, Percent, ShieldCheck } from "lucide-react";
import { SubscriptionCard } from "@/components/Frontend";
import { useToast } from "@/hooks/useToast";
import { productService } from "@/services/productService";
import type { Product } from "@/data/types";

const perks = [
  { icon: Clock, title: "Pick your frequency", desc: "Weekly, fortnightly or monthly deliveries." },
  { icon: PauseCircle, title: "Pause or skip anytime", desc: "Full control, no lock-in, cancel whenever." },
  { icon: Percent, title: "Save on every order", desc: "An automatic discount applied to each delivery." },
  { icon: ShieldCheck, title: "Same traceability", desc: "Every subscription order is traced the same way." },
];

export default function Subscriptions() {
  const { show } = useToast();
  const [subscribable, setSubscribable] = useState<Product[]>([]);

  useEffect(() => {
    productService
      .list({ inStockOnly: true, limit: 8 })
      .then((res) => setSubscribable(res.products))
      .catch(() => setSubscribable([]));
  }, []);

  return (
    <div>
      <section className="bg-coconut px-4 py-16 text-center sm:px-6 lg:px-8">
        <span className="eyebrow text-gold-light">Never Run Out</span>
        <h1 className="mx-auto mt-3 max-w-lg font-display text-3xl text-white sm:text-4xl">
          Coconut, on your schedule.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-white/75">
          Choose products, set a frequency, and let CocoSmart handle the rest.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          {perks.map((p) => (
            <div key={p.title} className="rounded-lg border border-line p-5 text-center">
              <p.icon className="mx-auto h-6 w-6 text-coconut" strokeWidth={1.6} />
              <h3 className="mt-3 text-sm font-bold text-charcoal">{p.title}</h3>
              <p className="mt-1 text-xs text-charcoal-muted">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-center font-display text-2xl text-charcoal">Build Your Subscription</h2>
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {subscribable.map((p) => (
            <SubscriptionCard key={p.id} product={p} onSubscribe={(freq) => show("Subscribed", `${p.name} · ${freq}`)} />
          ))}
        </div>
      </section>
    </div>
  );
}
