import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { TraceabilityTimeline, ProductMedia, Button, ProductTraceability } from "@/components/Frontend";
import { farms } from "@/data/traceability";
import { productService } from "@/services/productService";
import type { TraceabilityRecord } from "@/data/types";

export default function Traceability() {
  const [batch, setBatch] = useState("CT-24081-A");
  const [searched, setSearched] = useState("CT-24081-A");
  const [record, setRecord] = useState<TraceabilityRecord>({ available: false });

  useEffect(() => {
    productService
      .getBySlug("tender-coconut-water")
      .then((p) => setRecord(p.traceability))
      .catch(() => setRecord({ available: false }));
  }, []);

  return (
    <div>
      <section className="bg-coconut px-4 py-16 text-center sm:px-6 lg:px-8">
        <span className="eyebrow text-gold-light">Batch-Level Traceability</span>
        <h1 className="mx-auto mt-3 max-w-xl font-display text-3xl text-white sm:text-4xl">
          Scan any pack. See its whole story.
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-white/75">
          Every CocoSmart bottle carries a batch ID that maps back to a farm, harvest date and
          processing run where that data is available. If a step isn't recorded yet, we say so —
          we never invent it.
        </p>
        <form
          className="mx-auto mt-8 flex max-w-md gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            setSearched(batch);
          }}
        >
          <input
            value={batch}
            onChange={(e) => setBatch(e.target.value)}
            placeholder="Enter batch ID e.g. CT-24081-A"
            aria-label="Batch ID"
            className="h-12 flex-1 rounded-full border border-white/30 bg-white/10 px-5 text-sm text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-gold"
          />
          <Button type="submit" variant="gold" size="lg" className="rounded-full">
            <Search className="h-4 w-4" /> Track
          </Button>
        </form>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="font-display text-2xl text-charcoal">The Journey — Farm to Home</h2>
        </div>
        <TraceabilityTimeline />
      </section>

      <section className="bg-cream px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-card">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-display text-xl text-charcoal">Batch {searched}</h3>
            <span className="rounded-full bg-gold-50 px-3 py-1 text-xs font-bold text-gold-dark">In Transit</span>
          </div>
          <ProductTraceability record={record} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-center font-display text-2xl text-charcoal">Meet the Farms Behind CocoSmart</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {farms.map((f) => (
            <article key={f.id} className="overflow-hidden rounded-lg border border-line">
              <div className="aspect-[4/3]">
                <ProductMedia label={f.name} tone="leaf" showLabel />
              </div>
              <div className="p-4">
                <h3 className="text-sm font-bold text-charcoal">{f.name}</h3>
                <p className="mt-1 text-xs text-charcoal-soft">{f.location} · Partner since {f.partnerSince}</p>
                <p className="mt-2 text-xs font-semibold text-leaf-light">{f.practice}</p>
                <p className="mt-1 text-xs text-charcoal-soft">Farmer: {f.farmerName}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
