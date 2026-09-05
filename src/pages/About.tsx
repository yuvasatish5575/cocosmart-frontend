import { Link } from "react-router-dom";
import { Leaf, ScanLine, ShieldCheck } from "lucide-react";
import { ProductMedia, Button } from "@/components/Frontend";

export default function About() {
  return (
    <div>
      <section className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <span className="eyebrow text-leaf-light">Our Story</span>
          <h1 className="mt-3 font-display text-3xl text-charcoal sm:text-4xl">Farm-fresh, technology-traced.</h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-charcoal-muted">
            CocoSmart began with a simple question: why should coconut products lose their story
            somewhere between the farm and your home? We built a technology-enabled supply chain
            so every bottle keeps both its freshness and its origin.
          </p>
          <Button size="lg" className="mt-6" asChild>
            <Link to="/traceability">See the Traceability</Link>
          </Button>
        </div>
        <div className="aspect-[4/5] overflow-hidden rounded-2xl">
          <ProductMedia label="Coconut farm at sunrise" tone="leaf" showLabel />
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 pb-16 sm:px-6 sm:grid-cols-3 lg:px-8">
        <div className="rounded-lg border border-line p-6">
          <Leaf className="h-6 w-6 text-coconut" strokeWidth={1.6} />
          <h3 className="mt-4 text-sm font-bold text-charcoal">Nature</h3>
          <p className="mt-1 text-xs leading-relaxed text-charcoal-muted">Sourced from partner coconut farms across South India.</p>
        </div>
        <div className="rounded-lg border border-line p-6">
          <ScanLine className="h-6 w-6 text-coconut" strokeWidth={1.6} />
          <h3 className="mt-4 text-sm font-bold text-charcoal">Technology</h3>
          <p className="mt-1 text-xs leading-relaxed text-charcoal-muted">Every batch is logged from harvest to doorstep.</p>
        </div>
        <div className="rounded-lg border border-line p-6">
          <ShieldCheck className="h-6 w-6 text-coconut" strokeWidth={1.6} />
          <h3 className="mt-4 text-sm font-bold text-charcoal">Premium</h3>
          <p className="mt-1 text-xs leading-relaxed text-charcoal-muted">Cold-pressed, minimally processed, quality-checked.</p>
        </div>
      </section>
    </div>
  );
}
