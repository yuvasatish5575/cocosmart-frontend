import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Leaf, ScanLine, ShieldCheck, Sparkles } from "lucide-react";
import { Hero, TrustStrip, CategoryCard, ProductGrid, ReviewCard, TraceabilityTimeline, CoconutLeaf, ProductMedia, Button } from "@/components/Frontend";
import { categoryService } from "@/services/categoryService";
import { productService } from "@/services/productService";
import { reviews } from "@/data/reviews";
import type { Category, Product } from "@/data/types";

const storyBenefits = [
  { icon: Leaf, title: "Naturally Sourced", desc: "From partner farms across Tamil Nadu and Kerala." },
  { icon: ScanLine, title: "Batch Traceable", desc: "Every pack maps back to its harvest where data allows." },
  { icon: ShieldCheck, title: "Quality Checked", desc: "Released only after defined quality checks pass." },
  { icon: Sparkles, title: "Minimally Processed", desc: "Cold-pressed and lightly filtered, nothing extra." },
];

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [bestsellers, setBestsellers] = useState<Product[]>([]);
  const featuredReviews = reviews.slice(0, 3);

  useEffect(() => {
    categoryService.list().then(setCategories).catch(() => setCategories([]));
    productService
      .list({ featured: true, limit: 8, sort: "popularity" })
      .then((res) => setBestsellers(res.products))
      .catch(() => setBestsellers([]));
  }, []);

  return (
    <div>
      <Hero />
      <TrustStrip />

      {/* Shop by category — white */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <span className="eyebrow text-leaf-light">Explore</span>
          <h2 className="mt-2 font-display text-3xl text-charcoal">Shop by Category</h2>
        </div>
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((c) => (
            <CategoryCard key={c.id} category={c} />
          ))}
        </div>
      </section>

      {/* Bestsellers — white */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <span className="eyebrow text-leaf-light">Loved by many</span>
            <h2 className="mt-2 font-display text-3xl text-charcoal">Bestsellers</h2>
          </div>
          <Link to="/shop" className="text-sm font-bold text-coconut hover:underline">
            View all →
          </Link>
        </div>
        <ProductGrid products={bestsellers} />
      </section>

      {/* Brand story — cream */}
      <section className="bg-cream py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-xl">
            <span className="eyebrow text-leaf-light">Our Promise</span>
            <h2 className="mt-2 font-display text-3xl text-charcoal">Quality you can trace, not just taste</h2>
          </div>
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {storyBenefits.map((b) => (
              <div key={b.title} className="flex flex-col gap-3">
                <b.icon className="h-6 w-6 text-coconut" strokeWidth={1.6} />
                <h3 className="text-sm font-bold text-charcoal">{b.title}</h3>
                <p className="text-xs leading-relaxed text-charcoal-muted">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Traceability teaser — deep green */}
      <section className="relative overflow-hidden bg-coconut py-16">
        <CoconutLeaf color="#D4AF37" className="pointer-events-none absolute -bottom-10 -left-10 w-72 opacity-[0.1]" />
        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <span className="eyebrow text-gold-light">From Farm to Home</span>
            <h2 className="mt-2 font-display text-3xl text-white">Know exactly where it came from</h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/75">
              Scan any pack for its story. If a step isn't available yet, we say so — we never invent it.
            </p>
            <Button variant="gold" className="mt-6" asChild>
              <Link to="/traceability">Explore Traceability →</Link>
            </Button>
          </div>
          <div className="rounded-2xl bg-white/5 p-6">
            <TraceabilityTimeline />
          </div>
        </div>
      </section>

      {/* Reviews — white */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <span className="eyebrow text-leaf-light">What customers say</span>
          <h2 className="mt-2 font-display text-3xl text-charcoal">Real reviews, verified purchases</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {featuredReviews.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </div>
      </section>

      {/* Subscription teaser — deep green */}
      <section className="relative overflow-hidden bg-coconut-dark py-16">
        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="order-2 aspect-[4/3] overflow-hidden rounded-2xl lg:order-1">
            <ProductMedia label="Subscription delivery" tone="gold" showLabel />
          </div>
          <div className="order-1 lg:order-2">
            <span className="eyebrow text-gold-light">Never Run Out</span>
            <h2 className="mt-2 font-display text-3xl text-white">Coconut, on your schedule</h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/75">
              Choose your favourites, set a frequency, and save on every delivery — pause, skip or cancel anytime.
            </p>
            <Button variant="gold" className="mt-6" asChild>
              <Link to="/subscriptions">Start a Subscription</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
