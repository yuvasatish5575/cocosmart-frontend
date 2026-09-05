/**
 * CocoSmart frontend component module.
 *
 * Every UI component for the app lives in this single file by design
 * (design system primitives, product/cart/checkout/layout components, and
 * the AI assistant) rather than split one-per-file.
 */
import { forwardRef, useEffect, useId, useRef, useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from "react";
import { Link, Navigate, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronDown,
  Droplet,
  Expand,
  Flame,
  Grid2x2,
  Heart,
  Home,
  ImageIcon,
  Leaf,
  LifeBuoy,
  Loader2,
  MapPin,
  Menu,
  Minus,
  Package,
  PackageSearch,
  Phone,
  Plus,
  Repeat,
  ScanLine,
  Search,
  Send,
  Shield,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Sprout,
  Star,
  Truck,
  User,
  X,
} from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn, formatINR } from "@/lib/utils";
import { cartAnchors } from "@/lib/cartAnchor";
import { useCart } from "@/hooks/CartContext";
import { useFlyToCart } from "@/hooks/FlyToCartContext";
import { useWishlist } from "@/hooks/WishlistContext";
import { useScrolled } from "@/hooks/useScrolled";
import { useAuth } from "@/hooks/AuthContext";
import { useToast } from "@/hooks/useToast";
import { productService } from "@/services/productService";
import { ApiClientError } from "@/lib/apiClient";
import type { CartLine, Category, NutritionFact, Order, Product, ProductBenefit, ProductTone, Review, TraceabilityRecord } from "@/data/types";
import { journeyStages } from "@/data/traceability";
import { orderTrackingStages, orderStatusLabels } from "@/data/orders";
import { matchAssistantAnswer, suggestedQuestions } from "@/data/assistant";
import { supportContact } from "@/data/contact";

/* ============================================================================
 * UI PRIMITIVES
 * ==========================================================================*/

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gradient-to-r from-cream-dark via-line to-cream-dark bg-[length:400%_100%]",
        className
      )}
      style={{ animation: "skeleton-shimmer 1.4s ease infinite" }}
    />
  );
}

type BadgeTone = "coconut" | "gold" | "neutral" | "success" | "error" | "outline";

const badgeToneClasses: Record<BadgeTone, string> = {
  coconut: "bg-coconut-50 text-coconut-dark",
  gold: "bg-gold-50 text-gold-dark",
  neutral: "bg-cream-dark text-charcoal-muted",
  success: "bg-success-soft text-success",
  error: "bg-error-soft text-error",
  outline: "border border-line text-charcoal-muted bg-transparent",
};

export function Badge({ tone = "neutral", className, children }: { tone?: BadgeTone; className?: string; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold leading-none tracking-wide",
        badgeToneClasses[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-all duration-200 ease-[var(--ease-premium)] disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]",
  {
    variants: {
      variant: {
        primary: "bg-coconut text-white shadow-soft hover:bg-coconut-dark",
        secondary: "border border-coconut text-coconut bg-white hover:bg-coconut-50",
        outline: "border border-line text-charcoal bg-transparent hover:bg-cream-dark",
        ghost: "text-charcoal hover:bg-cream-dark",
        gold: "bg-gold text-coconut-dark hover:bg-gold-dark",
        link: "text-coconut underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        sm: "h-9 px-4 text-xs",
        md: "h-11 px-6",
        lg: "h-14 px-8 text-base",
        icon: "h-11 w-11 shrink-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, loading, disabled, children, ...props }, ref) => {
    if (asChild) {
      // Slot requires exactly one element child, so loading/disabled (button-only
      // concerns) are intentionally not handled in this branch.
      return (
        <Slot ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props}>
          {children}
        </Slot>
      );
    }
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, hint, id, className, ...props }, ref) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-bold text-charcoal-muted">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={cn(
          "h-12 rounded-md border border-line bg-white px-4 text-sm text-charcoal placeholder:text-charcoal-soft transition-colors",
          "focus:outline-none focus:border-coconut focus:ring-2 focus:ring-coconut-50",
          error && "border-error focus:border-error focus:ring-error-soft",
          className
        )}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        {...props}
      />
      {error && (
        <span id={`${inputId}-error`} className="text-xs text-error" role="alert">
          {error}
        </span>
      )}
      {!error && hint && (
        <span id={`${inputId}-hint`} className="text-xs text-charcoal-soft">
          {hint}
        </span>
      )}
    </div>
  );
});
Input.displayName = "Input";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center gap-4 py-20 text-center", className)}>
      {icon && <div className="flex h-20 w-20 items-center justify-center rounded-full bg-coconut-50 text-coconut">{icon}</div>}
      <h3 className="font-display text-2xl text-charcoal">{title}</h3>
      {description && <p className="max-w-sm text-sm text-charcoal-muted">{description}</p>}
      {action}
    </div>
  );
}

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function Modal({ open, onOpenChange, title, children, footer, className }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-charcoal/50 backdrop-blur-sm transition-opacity" />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white shadow-lifted focus:outline-none",
            "max-h-[85vh] flex flex-col",
            className
          )}
        >
          <div className="flex items-center justify-between border-b border-line px-6 py-4">
            <Dialog.Title className="font-display text-lg text-charcoal">{title}</Dialog.Title>
            <Dialog.Close className="rounded-full p-2 text-charcoal-muted hover:bg-cream-dark" aria-label="Close">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>
          <div className="overflow-y-auto px-6 py-5">{children}</div>
          {footer && <div className="border-t border-line px-6 py-4">{footer}</div>}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export const Tabs = TabsPrimitive.Root;

export function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return <TabsPrimitive.List className={cn("flex gap-6 border-b border-line overflow-x-auto scrollbar-none", className)} {...props} />;
}

export function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "shrink-0 whitespace-nowrap border-b-2 border-transparent pb-3 pt-1 text-sm font-semibold text-charcoal-muted transition-colors",
        "data-[state=active]:border-gold data-[state=active]:text-coconut-dark",
        "focus-visible:outline-none",
        className
      )}
      {...props}
    />
  );
}

export function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content className={cn("pt-6 text-sm leading-relaxed text-charcoal-muted", className)} {...props} />;
}

export const Accordion = AccordionPrimitive.Root;

export function AccordionItem({ className, ...props }: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return <AccordionPrimitive.Item className={cn("border-b border-line", className)} {...props} />;
}

export function AccordionTrigger({ className, children, ...props }: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        className={cn(
          "group flex flex-1 items-center justify-between py-4 text-left text-sm font-semibold text-charcoal focus-visible:outline-none",
          className
        )}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 shrink-0 text-charcoal-muted transition-transform duration-200 group-data-[state=open]:rotate-180" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

export function AccordionContent({ className, children, ...props }: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content className="overflow-hidden text-sm text-charcoal-muted data-[state=closed]:animate-none" {...props}>
      <div className={cn("pb-4", className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}

/* ============================================================================
 * BRAND
 * ==========================================================================*/

interface CoconutLeafProps {
  className?: string;
  color?: string;
}

/**
 * A single elegant coconut-palm frond silhouette — the recurring botanical
 * motif used sparingly across the brand (watermarks, dividers, empty states).
 */
export function CoconutLeaf({ className, color = "currentColor" }: CoconutLeafProps) {
  return (
    <svg viewBox="0 0 200 120" fill="none" className={cn("h-auto w-full", className)} aria-hidden="true">
      <path d="M4 116C40 92 70 60 96 24" stroke={color} strokeWidth="2" strokeLinecap="round" />
      {Array.from({ length: 9 }).map((_, i) => {
        const t = i / 8;
        const x = 4 + t * 92;
        const y = 116 - t * 92;
        const len = 34 - t * 16;
        const angle = -40 - t * 25;
        const rad = (angle * Math.PI) / 180;
        const x2 = x + len * Math.cos(rad);
        const y2 = y + len * Math.sin(rad);
        return (
          <path
            key={i}
            d={`M${x},${y} Q${(x + x2) / 2 + 6},${(y + y2) / 2 - 4} ${x2},${y2}`}
            stroke={color}
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity={0.85 - t * 0.3}
          />
        );
      })}
    </svg>
  );
}

/** A loose cluster of fronds for hero/footer backdrops. */
export function CoconutLeafCluster({ className, color = "currentColor" }: CoconutLeafProps) {
  return (
    <div className={cn("relative", className)} aria-hidden="true">
      <CoconutLeaf color={color} className="absolute inset-0 -rotate-12 opacity-70" />
      <CoconutLeaf color={color} className="absolute inset-0 rotate-6 scale-90 opacity-50" />
      <CoconutLeaf color={color} className="absolute inset-0 rotate-[28deg] scale-75 opacity-30" />
    </div>
  );
}

interface LogoProps {
  className?: string;
  variant?: "light" | "dark";
  markOnly?: boolean;
}

/**
 * CocoSmart wordmark + mark. The mark is the brand's icon artwork
 * (public/cocosmart-icon.png) — a self-contained circular badge with a
 * transparent background, so it drops in at any size on light or dark.
 */
export function Logo({ className, variant = "dark", markOnly = false }: LogoProps) {
  const wordColor = variant === "light" ? "text-white" : "text-coconut";
  const accentColor = variant === "light" ? "text-gold-light" : "text-gold-dark";

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <img src="/cocosmart-icon.png" alt="" aria-hidden="true" className="h-8 w-8 shrink-0" />
      {!markOnly && (
        <span className={cn("font-display text-xl font-semibold tracking-tight", wordColor)}>
          Coco<span className={accentColor}>Smart</span>
        </span>
      )}
    </span>
  );
}

/* ============================================================================
 * PRODUCT PRIMITIVES
 * ==========================================================================*/

const toneGradients: Record<ProductTone, string> = {
  coconut: "from-coconut-mid to-coconut-dark",
  leaf: "from-leaf-lighter to-coconut",
  gold: "from-gold-light to-gold-dark",
  cream: "from-cream-dark to-sand",
  charcoal: "from-charcoal-soft to-charcoal",
};

const toneIcon: Record<ProductTone, typeof Droplet> = {
  coconut: Package,
  leaf: Droplet,
  gold: Flame,
  cream: Package,
  charcoal: Leaf,
};

interface ProductMediaProps {
  label: string;
  tone: ProductTone;
  image?: string;
  className?: string;
  iconClassName?: string;
  showLabel?: boolean;
}

/**
 * Stand-in for premium product photography. Swap the fill for a real <img>
 * once photography is available — the tone prop keeps a consistent, branded
 * placeholder system in the meantime instead of a broken-image look.
 */
export function ProductMedia({ label, tone, image, className, iconClassName, showLabel = true }: ProductMediaProps) {
  const Icon = toneIcon[tone];
  const isLight = tone === "cream";
  const [imageFailed, setImageFailed] = useState(false);
  if (image && !imageFailed) {
    return (
      <div className={cn("relative h-full w-full overflow-hidden bg-cream", className)}>
        <img src={image} alt={label} loading="lazy" onError={() => setImageFailed(true)} className="h-full w-full object-cover" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-charcoal/20 to-transparent" />
      </div>
    );
  }
  return (
    <div className={cn("relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br", toneGradients[tone], className)}>
      <CoconutLeaf color={isLight ? "#0B4D32" : "#FFFFFF"} className="absolute -bottom-4 -right-6 w-2/3 opacity-[0.12]" />
      <Icon className={cn("h-9 w-9", isLight ? "text-coconut" : "text-white", iconClassName)} strokeWidth={1.5} />
      {showLabel && (
        <span className={cn("absolute bottom-3 left-1/2 -translate-x-1/2 text-center text-[11px] font-semibold tracking-wide", isLight ? "text-coconut/70" : "text-white/80")}>
          {label}
        </span>
      )}
    </div>
  );
}

export function Rating({ value, count, size = 14, className }: { value: number; count?: number; size?: number; className?: string }) {
  return (
    <div className={cn("inline-flex items-center gap-1.5", className)} aria-label={`Rated ${value} out of 5${count ? ` from ${count} reviews` : ""}`}>
      <span className="relative inline-flex" aria-hidden="true">
        <span className="flex gap-0.5 text-line">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={size} fill="currentColor" strokeWidth={0} />
          ))}
        </span>
        <span className="absolute inset-0 flex gap-0.5 overflow-hidden text-gold" style={{ width: `${(value / 5) * 100}%` }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={size} fill="currentColor" strokeWidth={0} />
          ))}
        </span>
      </span>
      <span className="text-xs font-bold text-charcoal">{value.toFixed(1)}</span>
      {count !== undefined && <span className="text-xs text-charcoal-soft">({count})</span>}
    </div>
  );
}

interface QuantitySelectorProps {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
}

export function QuantitySelector({ value, onChange, min = 1, max = 20, size = "md" }: QuantitySelectorProps) {
  const dim = size === "sm" ? "h-7 w-7" : "h-9 w-9";
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-line bg-white p-1" role="group" aria-label="Quantity">
      <button
        type="button"
        className={cn("flex items-center justify-center rounded-full text-charcoal transition-colors hover:bg-cream-dark disabled:opacity-30", dim)}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Decrease quantity"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="min-w-[1.75rem] text-center text-sm font-bold" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        className={cn("flex items-center justify-center rounded-full text-charcoal transition-colors hover:bg-cream-dark disabled:opacity-30", dim)}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Increase quantity"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function PackSelector({ sizes, value, onChange }: { sizes: string[]; value: string; onChange: (size: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Pack size">
      {sizes.map((s) => (
        <button
          key={s}
          type="button"
          role="radio"
          aria-checked={value === s}
          onClick={() => onChange(s)}
          className={cn(
            "min-h-11 rounded-md border px-4 text-sm font-semibold transition-colors",
            value === s ? "border-coconut bg-coconut text-white" : "border-line bg-white text-charcoal hover:border-coconut"
          )}
        >
          {s}
        </button>
      ))}
    </div>
  );
}

export function NutritionPanel({ facts }: { facts: NutritionFact[] }) {
  return (
    <dl className="divide-y divide-line rounded-lg border border-line">
      {facts.map((f) => (
        <div key={f.label} className="flex items-center justify-between px-4 py-3">
          <dt className="text-sm text-charcoal-muted">{f.label}</dt>
          <dd className="text-sm font-bold text-charcoal">{f.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function ProductTraceability({ record }: { record: TraceabilityRecord }) {
  if (!record.available) {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-dashed border-line bg-cream px-4 py-4 text-sm text-charcoal-muted">
        <ScanLine className="mt-0.5 h-4 w-4 shrink-0 text-charcoal-soft" strokeWidth={1.8} />
        Traceability information is currently unavailable for this batch.
      </div>
    );
  }

  const rows: [string, string][] = [
    ["Batch ID", record.batchId ?? "—"],
    ["Farm", record.farmName ?? "—"],
    ["Location", record.farmLocation ?? "—"],
    ["Harvested", record.harvestDate ?? "—"],
    ["Processed", record.processedDate ?? "—"],
    ["Quality checked by", record.qualityCheckedBy ?? "—"],
  ];

  return (
    <div className="overflow-hidden rounded-lg border border-line">
      <div className="flex items-center gap-2 bg-coconut-50 px-4 py-2.5 text-xs font-bold text-coconut-dark">
        <MapPin className="h-3.5 w-3.5" strokeWidth={2} /> Traced to source
      </div>
      <dl className="divide-y divide-line">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between px-4 py-2.5">
            <dt className="text-sm text-charcoal-muted">{label}</dt>
            <dd className="text-sm font-semibold text-charcoal">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/* ============================================================================
 * PRODUCT COMPOSITE COMPONENTS
 * ==========================================================================*/

export interface Filters {
  categorySlugs: string[];
  maxPrice: number;
  inStockOnly: boolean;
}

export const defaultFilters: Filters = { categorySlugs: [], maxPrice: 1300, inStockOnly: false };

export function FilterPanel({
  filters,
  onChange,
  categories,
}: {
  filters: Filters;
  onChange: (next: Filters) => void;
  categories: Category[];
}) {
  function toggleCategory(slug: string) {
    const set = new Set(filters.categorySlugs);
    set.has(slug) ? set.delete(slug) : set.add(slug);
    onChange({ ...filters, categorySlugs: Array.from(set) });
  }

  return (
    <div className="flex flex-col gap-7">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg text-charcoal">Filters</h3>
        <button onClick={() => onChange(defaultFilters)} className="text-xs font-bold text-coconut">
          Reset
        </button>
      </div>

      <div>
        <h4 className="mb-3 text-xs font-bold uppercase tracking-wide text-charcoal-muted">Category</h4>
        <div className="flex flex-col gap-2.5">
          {categories.map((c) => (
            <label key={c.slug} className="flex items-center gap-2.5 text-sm text-charcoal-muted">
              <input type="checkbox" checked={filters.categorySlugs.includes(c.slug)} onChange={() => toggleCategory(c.slug)} className="h-4 w-4 accent-coconut" />
              {c.name}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-xs font-bold uppercase tracking-wide text-charcoal-muted">Max Price</h4>
        <input
          type="range"
          min={50}
          max={1300}
          step={10}
          value={filters.maxPrice}
          onChange={(e) => onChange({ ...filters, maxPrice: Number(e.target.value) })}
          className="w-full accent-coconut"
          aria-label="Maximum price"
        />
        <span className="mt-1 block text-xs text-charcoal-soft">Up to ₹{filters.maxPrice}</span>
      </div>

      <label className="flex items-center gap-2.5 text-sm text-charcoal-muted">
        <input type="checkbox" checked={filters.inStockOnly} onChange={(e) => onChange({ ...filters, inStockOnly: e.target.checked })} className="h-4 w-4 accent-coconut" />
        In stock only
      </label>
    </div>
  );
}

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link to={`/shop?category=${category.slug}`} className="group flex flex-col gap-3">
      <div className="aspect-square overflow-hidden rounded-lg shadow-soft transition-shadow duration-300 group-hover:shadow-card">
        <div className="h-full w-full transition-transform duration-500 ease-[var(--ease-premium)] group-hover:scale-105">
          <ProductMedia label={category.name} tone={category.tone} showLabel={false} />
        </div>
      </div>
      <div>
        <h3 className="text-sm font-bold text-charcoal">{category.name}</h3>
        <p className="text-xs text-charcoal-soft">{category.description}</p>
        <span className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-coconut opacity-0 transition-opacity group-hover:opacity-100">
          Explore <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </Link>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const { trigger } = useFlyToCart();
  const { toggle, isWishlisted } = useWishlist();
  const { isAuthenticated } = useAuth();
  const { show } = useToast();
  const navigate = useNavigate();
  const mediaRef = useRef<HTMLAnchorElement>(null);
  const [adding, setAdding] = useState(false);
  const wishlisted = isWishlisted(product.id);
  const outOfStock = product.stock === "out-of-stock";
  const discount = product.mrp ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    if (outOfStock) return;
    trigger(mediaRef.current, product, product.sizes[0]);
    setAdding(true);
    setTimeout(() => setAdding(false), 700);
  }

  function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    if (!isAuthenticated) {
      show("Sign in required", "Log in to save items to your wishlist.", "info");
      navigate("/login");
      return;
    }
    void toggle(product.id);
  }

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-lg border border-line bg-white transition-all duration-300 ease-[var(--ease-premium)] hover:-translate-y-1 hover:shadow-card">
      <Link to={`/product/${product.slug}`} className="relative block aspect-[4/3] overflow-hidden" ref={mediaRef}>
        <div className="h-full w-full transition-transform duration-500 ease-[var(--ease-premium)] group-hover:scale-[1.03]">
          <ProductMedia label={product.name} tone={product.tone} image={product.image} showLabel={false} />
        </div>
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.bestseller && <Badge tone="gold">Bestseller</Badge>}
          {discount > 0 && <Badge tone="coconut">Save {discount}%</Badge>}
        </div>
        <button
          type="button"
          onClick={handleWishlist}
          className={cn(
            "absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-soft transition-transform hover:scale-110",
            wishlisted ? "text-error" : "text-charcoal-muted"
          )}
          aria-pressed={wishlisted}
          aria-label="Toggle wishlist"
        >
          <Heart className="h-4 w-4" fill={wishlisted ? "currentColor" : "none"} strokeWidth={1.8} />
        </button>
        <CoconutLeaf color="#C9A227" className="absolute -bottom-2 -left-2 w-14 opacity-0 transition-opacity duration-300 group-hover:opacity-25" />
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <span className="text-[11px] font-bold uppercase tracking-wide text-leaf-light">{product.category}</span>
        <Link to={`/product/${product.slug}`} className="text-sm font-bold text-charcoal hover:text-coconut">
          {product.name}
        </Link>
        <Rating value={product.rating} count={product.reviewCount} />

        <div className={cn("grid transition-all duration-300", "grid-rows-[0fr] opacity-0 group-hover:grid-rows-[1fr] group-hover:opacity-100")}>
          <p className="overflow-hidden text-xs text-charcoal-soft">{product.shortDescription}</p>
        </div>

        <div className="mt-1 flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-charcoal">{formatINR(product.price)}</span>
            <span className="text-xs text-charcoal-soft">/ {product.sizes[0]}</span>
          </div>
        </div>

        {outOfStock ? (
          <button disabled className="mt-1 h-10 rounded-md border border-line text-xs font-bold text-charcoal-soft">
            Notify Me
          </button>
        ) : (
          <button
            onClick={handleAdd}
            className={cn(
              "mt-1 h-10 rounded-md text-xs font-bold uppercase tracking-wide transition-all duration-200",
              "bg-coconut-50 text-coconut-dark group-hover:bg-coconut group-hover:text-white",
              adding && "scale-95 bg-success-soft text-success"
            )}
          >
            {adding ? "Added ✓" : "Add to Cart"}
          </button>
        )}

        {product.stock === "low-stock" && <span className="text-[11px] font-bold text-warning">Only a few left</span>}
      </div>
    </article>
  );
}

export function ProductGrid({ products: list, emptyMessage = "No products match your filters." }: { products: Product[]; emptyMessage?: string }) {
  if (list.length === 0) {
    return <EmptyState icon={<PackageSearch className="h-8 w-8" strokeWidth={1.5} />} title="Nothing here yet" description={emptyMessage} />;
  }
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
      {list.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

export function ProductGallery({ product, mediaRef }: { product: Product; mediaRef?: React.RefObject<HTMLButtonElement | null> }) {
  const [active, setActive] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const galleryImages = product.images.length > 0 ? product.images : product.image ? [product.image] : [undefined];
  const activeImage = galleryImages[active] ?? product.image;
  const shots = [product.name, `${product.name} — packaging`, `${product.name} — detail`, `${product.name} — batch label`];

  return (
    <div className="flex flex-col gap-3">
      <button
        ref={mediaRef}
        type="button"
        onClick={() => setFullscreen(true)}
        className="group relative aspect-square w-full overflow-hidden rounded-2xl shadow-card"
        aria-label="View fullscreen"
      >
        <div className="h-full w-full transition-transform duration-500 ease-[var(--ease-premium)] group-hover:scale-105">
          <ProductMedia label={product.name} tone={product.tone} image={activeImage} showLabel />
        </div>
        <span className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-charcoal opacity-0 shadow-soft transition-opacity group-hover:opacity-100">
          <Expand className="h-4 w-4" />
        </span>
      </button>

      <div className="grid grid-cols-4 gap-2.5" role="tablist" aria-label={`Product images for ${shots[0]}`}>
        {galleryImages.map((image, i) => (
          <button
            key={image ?? i}
            role="tab"
            aria-selected={active === i}
            onClick={() => setActive(i)}
            className={cn("aspect-square overflow-hidden rounded-md border-2 transition-colors", active === i ? "border-gold" : "border-transparent hover:border-line")}
          >
            <ProductMedia label={`${product.name} view ${i + 1}`} tone={product.tone} image={image} showLabel={false} />
          </button>
        ))}
      </div>

      <Dialog.Root open={fullscreen} onOpenChange={setFullscreen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-charcoal/90" />
          <Dialog.Content className="fixed inset-4 z-50 flex items-center justify-center outline-none sm:inset-10">
            <Dialog.Title className="visually-hidden">{product.name} — fullscreen image</Dialog.Title>
            <div className="aspect-square w-full max-w-xl overflow-hidden rounded-2xl">
              <ProductMedia label={product.name} tone={product.tone} image={activeImage} showLabel />
            </div>
            <Dialog.Close className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20" aria-label="Close">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

const benefitIconMap = { leaf: Leaf, droplet: Droplet, shield: ShieldCheck, sparkles: Sparkles, sprout: Sprout, flame: Flame };

export function ProductBenefits({ benefits, title = "Why You'll Love It" }: { benefits: ProductBenefit[]; title?: string }) {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-coconut px-6 py-10 sm:px-10 sm:py-14">
      <h2 className="eyebrow mb-8 text-center text-gold-light">{title}</h2>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {benefits.map((b, i) => {
          const Icon = benefitIconMap[b.icon];
          return (
            <div key={b.title} className="flex flex-col gap-3 border-b border-white/10 pb-6 last:border-b-0 last:pb-0 sm:border-b-0 sm:pb-0">
              <span className="font-display text-sm text-gold-light">{String(i + 1).padStart(2, "0")}</span>
              <Icon className="h-6 w-6 text-white" strokeWidth={1.5} />
              <h3 className="text-sm font-bold uppercase tracking-wide text-white">{b.title}</h3>
              <p className="text-sm leading-relaxed text-white/70">{b.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="flex flex-col gap-2.5 rounded-lg border border-line bg-white p-5">
      <div className="flex items-center justify-between gap-2">
        <Rating value={review.rating} />
        {review.verified && (
          <span className="flex items-center gap-1 text-[11px] font-bold text-success">
            <BadgeCheck className="h-3.5 w-3.5" /> Verified Purchase
          </span>
        )}
      </div>
      <p className="text-sm leading-relaxed text-charcoal">{review.comment}</p>
      {review.hasPhoto && (
        <span className="flex h-14 w-14 items-center justify-center rounded-md bg-cream-dark text-charcoal-soft">
          <ImageIcon className="h-5 w-5" strokeWidth={1.5} />
        </span>
      )}
      <div className="flex items-center gap-1.5 text-xs text-charcoal-soft">
        <span className="font-bold text-charcoal-muted">{review.author}</span>
        <span aria-hidden="true">·</span>
        <span>{review.date}</span>
      </div>
    </article>
  );
}

export function ProductInformation({ product, reviews }: { product: Product; reviews: Review[] }) {
  return (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
        <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
        <TabsTrigger value="storage">Storage</TabsTrigger>
        <TabsTrigger value="traceability">Traceability</TabsTrigger>
        <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <p>{product.description}</p>
      </TabsContent>

      <TabsContent value="ingredients">
        <ul className="list-disc space-y-1 pl-5">
          {product.ingredients.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      </TabsContent>

      <TabsContent value="nutrition">
        <NutritionPanel facts={product.nutrition} />
      </TabsContent>

      <TabsContent value="storage">
        <p>{product.storage}</p>
        <p className="mt-2">Origin: {product.origin}</p>
      </TabsContent>

      <TabsContent value="traceability">
        <ProductTraceability record={product.traceability} />
      </TabsContent>

      <TabsContent value="reviews">
        {reviews.length > 0 ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Rating value={product.rating} count={product.reviewCount} size={16} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {reviews.map((r) => (
                <ReviewCard key={r.id} review={r} />
              ))}
            </div>
          </div>
        ) : (
          <p>No written reviews yet for this batch — be the first.</p>
        )}
      </TabsContent>
    </Tabs>
  );
}

const purchaseFrequencies = ["Every week", "Every 2 weeks", "Every month"];

export function ProductPurchasePanel({ product, sourceRef }: { product: Product; sourceRef: React.RefObject<HTMLElement | null> }) {
  const [size, setSize] = useState(product.sizes[0]);
  const [qty, setQty] = useState(1);
  const [subscribe, setSubscribe] = useState(false);
  const [freq, setFreq] = useState(purchaseFrequencies[1]);
  const [buying, setBuying] = useState(false);
  const { addItem } = useCart();
  const { trigger } = useFlyToCart();
  const { isAuthenticated } = useAuth();
  const { show } = useToast();
  const navigate = useNavigate();
  const anchorRef = useRef<HTMLDivElement>(null);

  const outOfStock = product.stock === "out-of-stock";
  const discount = product.mrp ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
  const subscriptionPrice = Math.round(product.price * 0.9);

  function handleAddToCart() {
    trigger(sourceRef.current ?? anchorRef.current, product, size, qty);
  }

  async function handleBuyNow() {
    if (!isAuthenticated) {
      show("Sign in required", "Log in to buy this product.", "info");
      navigate("/login");
      return;
    }
    setBuying(true);
    try {
      await addItem(product, size, qty);
      navigate("/checkout");
    } catch (err) {
      show("Couldn't add to cart", err instanceof ApiClientError ? err.message : "Please try again.", "error");
    } finally {
      setBuying(false);
    }
  }

  return (
    <div className="flex flex-col gap-5" ref={anchorRef}>
      <div>
        <span className="text-xs font-bold uppercase tracking-wide text-leaf-light">{product.category}</span>
        <h1 className="mt-1 font-display text-3xl text-charcoal sm:text-4xl">{product.name}</h1>
      </div>

      <div className="flex items-center gap-3">
        <Rating value={product.rating} count={product.reviewCount} />
        {product.bestseller && <Badge tone="gold">Bestseller</Badge>}
      </div>

      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold text-coconut-dark">{formatINR(product.price)}</span>
        {product.mrp && <span className="text-base text-charcoal-soft line-through">{formatINR(product.mrp)}</span>}
        {discount > 0 && <Badge tone="coconut">Save {discount}%</Badge>}
      </div>

      <div>
        <span className="mb-2 block text-xs font-bold text-charcoal-muted">Pack Size</span>
        <PackSelector sizes={product.sizes} value={size} onChange={setSize} />
      </div>

      <div className="flex items-center gap-4">
        <div>
          <span className="mb-2 block text-xs font-bold text-charcoal-muted">Quantity</span>
          <QuantitySelector value={qty} onChange={setQty} />
        </div>
        <span className={outOfStock ? "text-xs font-bold text-error" : product.stock === "low-stock" ? "text-xs font-bold text-warning" : "text-xs font-bold text-success"}>
          {outOfStock ? "Out of stock" : product.stock === "low-stock" ? "Only a few left" : "In stock"}
        </span>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button size="lg" className="flex-1" onClick={handleAddToCart} disabled={outOfStock}>
          <ShoppingCart className="h-4 w-4" /> Add to Cart
        </Button>
        <Button size="lg" variant="secondary" className="flex-1" onClick={handleBuyNow} disabled={outOfStock} loading={buying}>
          Buy Now
        </Button>
      </div>

      <div className="rounded-lg border border-line bg-cream p-4">
        <label className="flex cursor-pointer items-start gap-3">
          <input type="checkbox" checked={subscribe} onChange={(e) => setSubscribe(e.target.checked)} className="mt-0.5 h-4 w-4 accent-coconut" />
          <span className="flex-1">
            <span className="flex items-center gap-1.5 text-sm font-bold text-charcoal">
              <Repeat className="h-3.5 w-3.5 text-coconut" /> Subscribe &amp; Save
            </span>
            <span className="text-xs text-charcoal-muted">{formatINR(subscriptionPrice)} per delivery (10% off) — pause, skip or cancel anytime.</span>
          </span>
        </label>
        {subscribe && (
          <div className="mt-3 flex flex-wrap gap-2 pl-7">
            {purchaseFrequencies.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFreq(f)}
                className={freq === f ? "rounded-full bg-coconut px-3 py-1.5 text-xs font-bold text-white" : "rounded-full border border-line px-3 py-1.5 text-xs font-bold text-charcoal-muted"}
              >
                {f}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function RecommendationCarousel({ title, products: list }: { title: string; products: Product[] }) {
  if (list.length === 0) return null;
  return (
    <div>
      <h3 className="eyebrow mb-3 text-charcoal-muted">{title}</h3>
      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
        {list.map((p) => (
          <Link key={p.id} to={`/product/${p.slug}`} className="flex w-32 shrink-0 flex-col gap-2 rounded-md border border-line p-2 transition-colors hover:border-coconut">
            <div className="aspect-square overflow-hidden rounded-sm">
              <ProductMedia label="" tone={p.tone} image={p.image} showLabel={false} />
            </div>
            <span className="line-clamp-2 text-xs font-semibold text-charcoal">{p.name}</span>
            <span className="text-xs font-bold text-coconut-dark">{formatINR(p.price)}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

const subscriptionFrequencies = ["Weekly", "Every 2 weeks", "Monthly"];

export function SubscriptionCard({ product, onSubscribe }: { product: Product; onSubscribe: (freq: string) => void }) {
  const [freq, setFreq] = useState(subscriptionFrequencies[1]);
  const discounted = Math.round(product.price * 0.9);

  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-line bg-white">
      <div className="aspect-square">
        <ProductMedia label={product.name} tone={product.tone} image={product.image} showLabel={false} />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="text-sm font-bold text-charcoal">{product.name}</h3>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-lg font-bold text-coconut-dark">{formatINR(discounted)}</span>
          <span className="text-xs text-charcoal-soft line-through">{formatINR(product.price)}</span>
          <Badge tone="gold">Save 10%</Badge>
        </div>
        <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Delivery frequency">
          {subscriptionFrequencies.map((f) => (
            <button
              key={f}
              type="button"
              role="radio"
              aria-checked={freq === f}
              onClick={() => setFreq(f)}
              className={freq === f ? "rounded-full bg-coconut-50 px-2.5 py-1 text-[11px] font-bold text-coconut-dark" : "rounded-full border border-line px-2.5 py-1 text-[11px] font-bold text-charcoal-muted"}
            >
              {f}
            </button>
          ))}
        </div>
        <button onClick={() => onSubscribe(freq)} className="mt-auto h-10 rounded-md bg-coconut text-xs font-bold uppercase tracking-wide text-white hover:bg-coconut-dark">
          Subscribe &amp; Save
        </button>
      </div>
    </article>
  );
}

/* ============================================================================
 * CART
 * ==========================================================================*/

interface CartIconProps {
  variant?: "light" | "dark";
  onClick?: () => void;
}

export const CartIcon = forwardRef<HTMLButtonElement, CartIconProps>(({ variant = "dark", onClick }, ref) => {
  const { count } = useCart();
  const { bumpKey } = useFlyToCart();
  const controls = useAnimationControls();

  useEffect(() => {
    if (bumpKey === 0) return;
    controls.start({ scale: [1, 1.22, 0.94, 1], transition: { duration: 0.45, ease: "easeOut" } });
  }, [bumpKey, controls]);

  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={onClick}
      animate={controls}
      className={cn("relative flex h-10 w-10 items-center justify-center rounded-full transition-colors", variant === "light" ? "text-white hover:bg-white/10" : "text-charcoal hover:bg-cream-dark")}
      aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
    >
      <ShoppingCart className="h-5 w-5" strokeWidth={1.8} />
      {count > 0 && (
        <motion.span
          key={count}
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 20 }}
          className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-coconut-dark"
        >
          {count}
        </motion.span>
      )}
    </motion.button>
  );
});
CartIcon.displayName = "CartIcon";

interface CartItemRowProps {
  line: CartLine;
  onQtyChange: (key: string, qty: number) => void;
  onRemove: (key: string) => void;
}

export function CartItemRow({ line, onQtyChange, onRemove }: CartItemRowProps) {
  return (
    <div className="flex gap-3 py-4">
      <Link to={`/product/${line.slug}`} className="h-16 w-16 shrink-0 overflow-hidden rounded-md">
        <ProductMedia label="" tone={line.tone} image={line.image} showLabel={false} />
      </Link>
      <div className="flex flex-1 flex-col gap-1.5 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <Link to={`/product/${line.slug}`} className="text-sm font-bold text-charcoal hover:text-coconut">
            {line.name}
          </Link>
          <button onClick={() => onRemove(line.key)} className="shrink-0 rounded-full p-1 text-charcoal-soft hover:bg-error-soft hover:text-error" aria-label={`Remove ${line.name}`}>
            <X className="h-4 w-4" />
          </button>
        </div>
        <span className="text-xs text-charcoal-soft">{line.size}</span>
        <div className="mt-1 flex items-center justify-between">
          <QuantitySelector value={line.qty} onChange={(q) => onQtyChange(line.key, q)} size="sm" />
          <span className="text-sm font-bold text-coconut-dark">{formatINR(line.price * line.qty)}</span>
        </div>
      </div>
    </div>
  );
}

export function CartDrawer() {
  const { lines, updateQty, removeItem, subtotal, delivery, total, drawerOpen, setDrawerOpen } = useCart();
  const navigate = useNavigate();
  const [recommended, setRecommended] = useState<Product[]>([]);

  useEffect(() => {
    if (!drawerOpen) return;
    productService
      .list({ featured: true, limit: 8 })
      .then((res) => setRecommended(res.products.filter((p) => !lines.some((l) => l.productId === p.id)).slice(0, 6)))
      .catch(() => setRecommended([]));
  }, [drawerOpen, lines]);

  return (
    <Dialog.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-charcoal/50 backdrop-blur-sm" />
        <Dialog.Content
          forceMount
          className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-lifted outline-none transition-transform duration-300 ease-[var(--ease-premium)] data-[state=closed]:translate-x-full data-[state=open]:translate-x-0"
        >
          <div className="flex items-center justify-between border-b border-line px-6 py-5">
            <div>
              <Dialog.Title className="font-display text-xl text-charcoal">Your Cart</Dialog.Title>
              <CoconutLeaf color="#C9A227" className="mt-1 h-2 w-16 opacity-70" />
            </div>
            <Dialog.Close className="rounded-full p-2 text-charcoal-muted hover:bg-cream-dark" aria-label="Close cart">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          {lines.length === 0 ? (
            <div className="flex flex-1 items-center justify-center px-6">
              <EmptyState
                icon={<ShoppingBag className="h-8 w-8" strokeWidth={1.5} />}
                title="Your cart is waiting."
                description="Discover something naturally good."
                action={
                  <Button
                    onClick={() => {
                      setDrawerOpen(false);
                      navigate("/shop");
                    }}
                  >
                    Explore Products
                  </Button>
                }
              />
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto px-6">
                <div className="divide-y divide-line">
                  {lines.map((line) => (
                    <CartItemRow key={line.key} line={line} onQtyChange={updateQty} onRemove={removeItem} />
                  ))}
                </div>
                <div className="border-t border-line py-5">
                  <RecommendationCarousel title="You may also like" products={recommended} />
                </div>
              </div>

              <div className="border-t border-line px-6 py-5">
                <div className="mb-1 flex justify-between text-sm text-charcoal-muted">
                  <span>Subtotal</span>
                  <span className="font-semibold text-charcoal">{formatINR(subtotal)}</span>
                </div>
                <div className="mb-3 flex justify-between text-sm text-charcoal-muted">
                  <span>Delivery</span>
                  <span className="font-semibold text-charcoal">{delivery === 0 ? "Free" : formatINR(delivery)}</span>
                </div>
                <div className="mb-4 flex justify-between border-t border-line pt-3 text-base font-bold text-charcoal">
                  <span>Total</span>
                  <span>{formatINR(total)}</span>
                </div>
                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => {
                    setDrawerOpen(false);
                    navigate("/checkout");
                  }}
                >
                  Proceed to Checkout
                </Button>
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/* ============================================================================
 * CHECKOUT
 * ==========================================================================*/

const checkoutSteps = ["Address", "Delivery", "Payment", "Confirmation"];

export function CheckoutStepper({ current }: { current: number }) {
  return (
    <ol className="flex items-center justify-center gap-2 py-6">
      {checkoutSteps.map((label, i) => {
        const state = i < current ? "done" : i === current ? "current" : "pending";
        return (
          <li key={label} className="flex items-center gap-2">
            <span
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
                state === "done" && "bg-coconut text-white",
                state === "current" && "bg-gold text-coconut-dark",
                state === "pending" && "bg-cream-dark text-charcoal-soft"
              )}
            >
              {state === "done" ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </span>
            <span className={cn("hidden text-xs font-bold sm:inline", state === "pending" ? "text-charcoal-soft" : "text-charcoal")}>{label}</span>
            {i < checkoutSteps.length - 1 && <span className="mx-1 h-px w-6 bg-line sm:w-8" aria-hidden="true" />}
          </li>
        );
      })}
    </ol>
  );
}

export const checkoutStepLabels = checkoutSteps;

export function OrderTracking({ order }: { order: Order }) {
  const currentIndex = order.orderStatus === "CANCELLED" ? -1 : orderTrackingStages.indexOf(order.orderStatus);

  if (order.orderStatus === "CANCELLED") {
    return <p className="rounded-lg border border-error-soft bg-error-soft px-4 py-3 text-sm font-semibold text-error">This order was cancelled.</p>;
  }

  return (
    <ol className="flex flex-col gap-0">
      {orderTrackingStages.map((stage, i) => {
        const state = i < currentIndex ? "done" : i === currentIndex ? "current" : "pending";
        return (
          <li key={stage} className="relative flex gap-4 pb-8 last:pb-0">
            {i < orderTrackingStages.length - 1 && <span className={cn("absolute left-[15px] top-8 h-full w-px", state === "done" ? "bg-coconut" : "bg-line")} aria-hidden="true" />}
            <span
              className={cn(
                "z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2",
                state === "done" && "border-coconut bg-coconut text-white",
                state === "current" && "border-gold bg-gold-50 text-gold-dark",
                state === "pending" && "border-line bg-white text-charcoal-soft"
              )}
            >
              {state === "done" ? <Check className="h-4 w-4" /> : <span className="h-2 w-2 rounded-full bg-current" />}
            </span>
            <div className="pt-1">
              <span className={cn("text-sm font-bold", state === "pending" ? "text-charcoal-soft" : "text-charcoal")}>{orderStatusLabels[stage]}</span>
              {state === "current" && order.deliverySlot && <p className="text-xs text-charcoal-muted">Delivery slot: {order.deliverySlot}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/* ============================================================================
 * HOME
 * ==========================================================================*/

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-coconut">
      <CoconutLeaf color="#FFFFFF" className="pointer-events-none absolute -left-10 -top-10 w-56 -rotate-[18deg] opacity-[0.08] sm:w-72" />
      <CoconutLeaf color="#D4AF37" className="pointer-events-none absolute -bottom-16 -right-10 w-64 rotate-[24deg] opacity-[0.14] sm:w-80" />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
          <span className="eyebrow inline-block rounded-full bg-white/10 px-3 py-1.5 text-gold-light">Farm to Bottle, Traceable Always</span>
          <h1 className="mt-5 font-display text-4xl leading-[1.08] text-white sm:text-5xl lg:text-6xl">
            Pure coconut.
            <br />
            Nothing extra.
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-white/80">
            From carefully sourced coconuts to your home — quality, transparency and natural goodness at every step.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" variant="gold" asChild>
              <Link to="/shop">Shop Products</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10" asChild>
              <Link to="/about">Explore Our Story</Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-2xl shadow-lifted"
        >
          <ProductMedia label="Fresh coconuts, farm harvest" tone="leaf" showLabel />
        </motion.div>
      </div>
    </section>
  );
}

const trustStripItems = [
  { icon: Leaf, label: "Naturally Sourced" },
  { icon: Sparkles, label: "Batch-Level Traceability" },
  { icon: ShieldCheck, label: "Quality Checked" },
  { icon: Truck, label: "Cold-Chain Delivery" },
];

export function TrustStrip() {
  return (
    <div className="border-b border-line bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap justify-center gap-x-8 gap-y-3 px-4 py-5 sm:px-6 lg:px-8">
        {trustStripItems.map((it) => (
          <span key={it.label} className="flex items-center gap-2 text-xs font-bold text-charcoal-muted">
            <it.icon className="h-4 w-4 text-coconut" strokeWidth={1.8} />
            {it.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ============================================================================
 * TRACEABILITY
 * ==========================================================================*/

export function TraceabilityTimeline() {
  return (
    <ol className="relative flex flex-col gap-8 sm:flex-row sm:gap-4">
      {journeyStages.map((stage, i) => (
        <motion.li
          key={stage.key}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex flex-1 flex-col items-start gap-3 sm:items-center sm:text-center"
        >
          {i < journeyStages.length - 1 && (
            <span aria-hidden="true" className="absolute left-[19px] top-10 h-[calc(100%-1rem)] w-px bg-gold/40 sm:left-1/2 sm:top-5 sm:h-px sm:w-full sm:translate-x-1/2" />
          )}
          <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-coconut text-white">
            <Check className="h-4 w-4" strokeWidth={2.5} />
          </span>
          <div>
            <h3 className="text-sm font-bold text-charcoal">{stage.label}</h3>
            <p className="mt-1 max-w-[160px] text-xs leading-relaxed text-charcoal-soft">{stage.detail}</p>
          </div>
        </motion.li>
      ))}
    </ol>
  );
}

/* ============================================================================
 * LAYOUT
 * ==========================================================================*/

const navLinks = [
  { to: "/shop", label: "Shop" },
  { to: "/traceability", label: "Traceability" },
  { to: "/subscriptions", label: "Subscriptions" },
  { to: "/about", label: "Our Story" },
  { to: "/wholesale", label: "Wholesale" },
];

export function Navbar() {
  const scrolled = useScrolled();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { setDrawerOpen } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { isAuthenticated } = useAuth();
  const cartBtnRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    cartAnchors.desktop = cartBtnRef.current;
  });

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) navigate(`/shop?q=${encodeURIComponent(query.trim())}`);
    setSearchOpen(false);
  }

  return (
    <header className={cn("sticky top-0 z-40 bg-coconut transition-shadow duration-300", scrolled && "bg-coconut-dark shadow-lifted")}>
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8" style={{ height: 72 }}>
        <button className="flex h-10 w-10 items-center justify-center rounded-full text-white lg:hidden" onClick={() => setMenuOpen((v) => !v)} aria-label="Toggle menu" aria-expanded={menuOpen}>
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <Link to="/" className="shrink-0" aria-label="CocoSmart home">
          <Logo variant="light" />
        </Link>

        <nav className="mx-auto hidden items-center gap-8 lg:flex">
          {navLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                cn("relative py-2 text-sm font-semibold text-white/85 transition-colors hover:text-white", isActive && "text-white after:absolute after:-bottom-0.5 after:left-0 after:right-0 after:h-0.5 after:bg-gold")
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <div className="relative hidden sm:block">
            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center">
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onBlur={() => !query && setSearchOpen(false)}
                  placeholder="Search coconut water, oil..."
                  className="h-9 w-52 rounded-full border border-white/30 bg-white/10 px-4 text-sm text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </form>
            ) : (
              <button className="flex h-10 w-10 items-center justify-center rounded-full text-white/90 hover:bg-white/10" onClick={() => setSearchOpen(true)} aria-label="Search">
                <Search className="h-5 w-5" strokeWidth={1.8} />
              </button>
            )}
          </div>
          <Link
            to={isAuthenticated ? "/account" : "/login"}
            className="flex h-10 w-10 items-center justify-center rounded-full text-white/90 hover:bg-white/10"
            aria-label="Account"
          >
            <User className="h-5 w-5" strokeWidth={1.8} />
          </Link>
          <Link to="/wishlist" className="relative flex h-10 w-10 items-center justify-center rounded-full text-white/90 hover:bg-white/10" aria-label={`Wishlist, ${wishlistCount} items`}>
            <Heart className="h-5 w-5" strokeWidth={1.8} />
            {wishlistCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-coconut-dark">{wishlistCount}</span>
            )}
          </Link>
          <CartIcon ref={cartBtnRef} variant="light" onClick={() => setDrawerOpen(true)} />
        </div>
      </div>

      {menuOpen && (
        <nav className="flex flex-col gap-1 border-t border-white/10 bg-coconut px-4 pb-4 pt-2 lg:hidden">
          {navLinks.map((l) => (
            <NavLink key={l.to} to={l.to} onClick={() => setMenuOpen(false)} className="rounded-md px-2 py-3 text-sm font-semibold text-white/90 hover:bg-white/10">
              {l.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}

function FooterCol({ title, children }: { title: string; children: ReactNode }) {
  return (
    <nav className="flex flex-col gap-2.5 text-sm text-leaf-lighter/90 [&_a:hover]:text-gold-light">
      <h4 className="eyebrow mb-1 text-gold-light">{title}</h4>
      {children}
    </nav>
  );
}

export function Footer() {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <footer className="relative overflow-hidden bg-coconut-dark pb-24 pt-16 text-leaf-lighter sm:pb-10">
      <CoconutLeaf color="#FFFFFF" className="pointer-events-none absolute -bottom-10 -right-10 w-96 opacity-[0.06] rotate-[18deg]" />

      <div className="relative mx-auto grid max-w-7xl grid-cols-2 gap-10 px-4 sm:px-6 lg:grid-cols-5 lg:px-8">
        <div className="col-span-2">
          <Logo variant="light" />
          <p className="mt-4 max-w-[220px] text-sm text-leaf-lighter/90">Pure coconut. Nothing extra.</p>
        </div>

        <FooterCol title="Shop">
          <Link to="/shop">All Products</Link>
          <Link to="/shop?category=coconut-water">Coconut Water</Link>
          <Link to="/shop?category=coconut-oil">Coconut Oil</Link>
          <Link to="/subscriptions">Subscriptions</Link>
        </FooterCol>

        <FooterCol title="Company">
          <Link to="/traceability">Traceability</Link>
          <Link to="/about">Our Story</Link>
          <Link to="/wholesale">Wholesale</Link>
          <a href="#careers">Careers</a>
        </FooterCol>

        <FooterCol title="Support">
          <Link to="/orders">Track Order</Link>
          <a href="#returns">Returns &amp; Refunds</a>
          <a href="#faq">FAQ</a>
          <button type="button" onClick={() => setContactOpen(true)} className="text-left hover:text-gold-light">
            Contact Us
          </button>
        </FooterCol>

        <div>
          <h4 className="eyebrow mb-3 text-gold-light">Trust</h4>
          <div className="flex flex-col gap-2 text-sm text-leaf-lighter/90">
            <span className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-gold-light" strokeWidth={1.8} /> Secure Payments
            </span>
            <span className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-gold-light" strokeWidth={1.8} /> Cold-Chain Delivery
            </span>
            <span className="flex items-center gap-2">
              <Leaf className="h-4 w-4 text-gold-light" strokeWidth={1.8} /> Traceable Sourcing
            </span>
          </div>
        </div>
      </div>

      <div className="relative mx-auto mt-12 flex max-w-7xl flex-col items-start justify-between gap-3 border-t border-white/10 px-4 pt-6 text-xs text-leaf-lighter/70 sm:flex-row sm:items-center sm:px-6 lg:px-8">
        <span>© 2026 CocoSmart. All rights reserved.</span>
        <div className="flex gap-5">
          <a href="#privacy" className="hover:text-white">Privacy Policy</a>
          <a href="#terms" className="hover:text-white">Terms of Service</a>
        </div>
      </div>

      <Modal open={contactOpen} onOpenChange={setContactOpen} title="Contact Us">
        <div className="flex flex-col gap-4 text-charcoal">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-coconut-50 text-coconut">
              <User className="h-4 w-4" strokeWidth={1.8} />
            </span>
            <div>
              <span className="block text-xs font-bold text-charcoal-muted">Team</span>
              <span className="text-sm font-semibold">{supportContact.teamName}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-coconut-50 text-coconut">
              <Phone className="h-4 w-4" strokeWidth={1.8} />
            </span>
            <div>
              <span className="block text-xs font-bold text-charcoal-muted">Phone</span>
              <a href={supportContact.phoneHref} className="text-sm font-semibold hover:text-coconut">
                {supportContact.phone}
              </a>
            </div>
          </div>
        </div>
      </Modal>
    </footer>
  );
}

const mobileTabs = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/shop", label: "Shop", icon: Grid2x2 },
  { to: "/wishlist", label: "Wishlist", icon: Heart },
  { to: "/login", label: "Account", icon: User },
];

function MobileTab({ to, label, icon: Icon, end }: (typeof mobileTabs)[number]) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => cn("flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-bold text-charcoal-soft", isActive && "text-coconut")}
    >
      <Icon className="h-5 w-5" strokeWidth={1.8} />
      {label}
    </NavLink>
  );
}

export function MobileNav() {
  const { count, setDrawerOpen } = useCart();
  const { bumpKey } = useFlyToCart();
  const { isAuthenticated } = useAuth();
  const cartRef = useRef<HTMLButtonElement>(null);
  const controls = useAnimationControls();

  useEffect(() => {
    cartAnchors.mobile = cartRef.current;
  });

  useEffect(() => {
    if (bumpKey === 0) return;
    controls.start({ scale: [1, 1.25, 0.94, 1], transition: { duration: 0.45, ease: "easeOut" } });
  }, [bumpKey, controls]);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center border-t border-line bg-white pb-[env(safe-area-inset-bottom,0)] sm:hidden" aria-label="Primary">
      {mobileTabs.slice(0, 2).map((t) => (
        <MobileTab key={t.to} {...t} />
      ))}

      <button
        ref={cartRef}
        type="button"
        onClick={() => setDrawerOpen(true)}
        className="relative flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-charcoal-soft"
        aria-label={`Cart, ${count} items`}
      >
        <motion.span animate={controls} className="relative flex">
          <ShoppingCart className="h-5 w-5" strokeWidth={1.8} />
          {count > 0 && <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[9px] font-bold text-coconut-dark">{count}</span>}
        </motion.span>
        <span className="text-[10px] font-bold">Cart</span>
      </button>

      {mobileTabs.slice(2).map((t) => (
        <MobileTab key={t.to} {...t} to={t.to === "/login" ? (isAuthenticated ? "/account" : "/login") : t.to} />
      ))}
    </nav>
  );
}

/* ============================================================================
 * AI ASSISTANT
 * ==========================================================================*/

interface AssistantMessage {
  id: number;
  from: "user" | "coco";
  text: string;
  escalate?: boolean;
}

export function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<AssistantMessage[]>([{ id: 0, from: "coco", text: "Hi! I'm Coco. How can I help?" }]);
  const [input, setInput] = useState("");
  const idRef = useRef(1);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  function ask(question: string) {
    const userMsg: AssistantMessage = { id: idRef.current++, from: "user", text: question };
    const answer = matchAssistantAnswer(question);
    const cocoMsg: AssistantMessage = answer
      ? { id: idRef.current++, from: "coco", text: answer }
      : { id: idRef.current++, from: "coco", text: "I don't have a confident answer for that yet. Let me connect you with our support team.", escalate: true };
    setMessages((prev) => [...prev, userMsg, cocoMsg]);
    setInput("");
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-24 right-4 z-50 flex h-[70vh] max-h-[520px] w-[92vw] max-w-sm flex-col overflow-hidden rounded-lg bg-white shadow-lifted sm:bottom-24 sm:right-6"
            role="dialog"
            aria-label="Coco, CocoSmart assistant"
          >
            <div className="flex items-center justify-between bg-coconut px-4 py-3.5">
              <div className="flex items-center gap-2 text-white">
                <span aria-hidden="true">🥥</span>
                <span className="font-display text-base">Coco</span>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-full p-1.5 text-white/80 hover:bg-white/10" aria-label="Close assistant">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((m) => (
                <div key={m.id} className={cn("flex flex-col gap-2", m.from === "user" ? "items-end" : "items-start")}>
                  <div className={cn("max-w-[85%] rounded-lg px-3.5 py-2.5 text-sm leading-relaxed", m.from === "user" ? "bg-coconut text-white" : "bg-cream text-charcoal")}>{m.text}</div>
                  {m.escalate && (
                    <a href={supportContact.phoneHref} className="flex items-center gap-1.5 text-xs font-bold text-coconut hover:underline">
                      <LifeBuoy className="h-3.5 w-3.5" /> Call {supportContact.teamName} · {supportContact.phone}
                    </a>
                  )}
                </div>
              ))}

              {messages.length === 1 && (
                <div className="flex flex-col gap-2 pt-2">
                  {suggestedQuestions.map((q) => (
                    <button key={q} onClick={() => ask(q)} className="rounded-md border border-line px-3 py-2 text-left text-xs font-semibold text-charcoal-muted hover:border-coconut hover:text-coconut">
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <form
              className="flex items-center gap-2 border-t border-line p-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (input.trim()) ask(input.trim());
              }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about a product or order..."
                className="h-10 flex-1 rounded-full border border-line bg-cream px-4 text-sm focus:outline-none focus:ring-2 focus:ring-coconut-50"
              />
              <button type="submit" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-coconut text-white disabled:opacity-40" aria-label="Send" disabled={!input.trim()}>
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-24 right-4 z-50 flex items-center gap-2 rounded-full bg-coconut px-4 py-3 text-sm font-bold text-white shadow-lifted transition-transform hover:scale-105 sm:bottom-6 sm:right-6"
          aria-label="Ask Coco, the CocoSmart assistant"
        >
          <span aria-hidden="true">🥥</span> Ask Coco
        </button>
      )}
    </>
  );
}

export function Layout() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Navbar />
      <main id="main-content" className="flex-1 pb-16 sm:pb-0">
        <Outlet />
      </main>
      <Footer />
      <MobileNav />
      <CartDrawer />
      <AIAssistant />
    </>
  );
}

/* ============================================================================
 * ROUTE GUARDS
 * ==========================================================================*/

/** Redirects to /login (preserving the intended destination) until a session is confirmed. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="flex min-h-[50vh] items-center justify-center text-sm text-charcoal-soft">Loading…</div>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
}

/** Same as RequireAuth, plus a 404 (not a 403) for signed-in non-admins — consistent with the backend's "don't confirm existence" posture. */
export function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="flex min-h-[50vh] items-center justify-center text-sm text-charcoal-soft">Loading…</div>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (user?.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
