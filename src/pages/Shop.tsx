import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal } from "lucide-react";
import { ProductGrid, FilterPanel, defaultFilters, type Filters, Modal, Button } from "@/components/Frontend";
import { productService, type ProductListParams } from "@/services/productService";
import { categoryService } from "@/services/categoryService";
import type { Category, Product } from "@/data/types";

type SortKey = NonNullable<ProductListParams["sort"]>;

export default function Shop() {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get("category");
  const query = searchParams.get("q") ?? "";
  const [filters, setFilters] = useState<Filters>(
    initialCategory ? { ...defaultFilters, categorySlugs: [initialCategory] } : defaultFilters
  );
  const [sort, setSort] = useState<SortKey>("popularity");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    categoryService.list().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    // The backend only supports a single category filter; the sidebar UI
    // (checkbox list) is designed for future multi-select, so we just send
    // the first selection for now.
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);
    productService
      .list({
        limit: 48,
        category: filters.categorySlugs[0],
        maxPrice: filters.maxPrice,
        inStockOnly: filters.inStockOnly || undefined,
        search: query || undefined,
        sort,
      })
      .then((res) => {
        if (controller.signal.aborted) return;
        setProducts(res.products);
        setTotal(res.pagination.total);
      })
      .catch(() => {
        if (!controller.signal.aborted) setError("Unable to load products. Please try again.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [filters, sort, query]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <p className="text-xs text-charcoal-soft">Home / Shop</p>
      <h1 className="mt-2 font-display text-3xl text-charcoal sm:text-4xl">
        {query ? `Results for "${query}"` : "Shop All Products"}
      </h1>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">
          <FilterPanel filters={filters} onChange={setFilters} categories={categories} />
        </aside>

        <div>
          <div className="mb-6 flex items-center justify-between gap-3">
            <span className="text-sm text-charcoal-muted">{isLoading ? "Loading…" : `${total} products`}</span>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setSheetOpen(true)}>
                <SlidersHorizontal className="h-3.5 w-3.5" /> Filter
              </Button>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="h-10 rounded-md border border-line bg-white px-3 text-sm font-semibold"
                aria-label="Sort by"
              >
                <option value="popularity">Sort: Popularity</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Rating</option>
              </select>
            </div>
          </div>

          {error ? (
            <div className="rounded-lg border border-error-soft bg-error-soft px-4 py-6 text-center text-sm font-semibold text-error">
              {error}
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] animate-pulse rounded-lg bg-cream-dark" />
              ))}
            </div>
          ) : (
            <ProductGrid products={products} emptyMessage="Try resetting your filters or search for something else." />
          )}
        </div>
      </div>

      <Modal
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title="Filter & Sort"
        footer={
          <Button className="w-full" onClick={() => setSheetOpen(false)}>
            Show {total} results
          </Button>
        }
      >
        <FilterPanel filters={filters} onChange={setFilters} categories={categories} />
      </Modal>
    </div>
  );
}
