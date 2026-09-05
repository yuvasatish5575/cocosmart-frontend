import { useEffect, useState } from "react";
import { Search, Check, X as XIcon } from "lucide-react";
import { Badge, Button, Input } from "@/components/Frontend";
import { useToast } from "@/hooks/useToast";
import { productService } from "@/services/productService";
import { ApiClientError } from "@/lib/apiClient";
import { formatINR } from "@/lib/utils";
import type { Product, Pagination } from "@/data/types";

export default function AdminProducts() {
  const { show } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [stockDraft, setStockDraft] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  function load() {
    setLoading(true);
    productService
      .listAdmin({ page, limit: 20, search: search || undefined })
      .then((res) => {
        setProducts(res.products);
        setPagination(res.pagination);
      })
      .catch(() => show("Couldn't load products", "Please try again.", "error"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  function startEdit(p: Product) {
    setEditingId(p.id);
    setStockDraft(String(p.stockQuantity));
  }

  async function saveStock(id: string) {
    const qty = Number(stockDraft);
    if (!Number.isInteger(qty) || qty < 0) {
      show("Invalid quantity", "Enter a whole number of 0 or more.", "error");
      return;
    }
    setSavingId(id);
    try {
      const updated = await productService.update(id, { stockQuantity: qty });
      setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
      setEditingId(null);
      show("Stock updated", `${updated.name} now has ${updated.stockQuantity} units.`);
    } catch (err) {
      show("Update failed", err instanceof ApiClientError ? err.message : "Please try again.", "error");
    } finally {
      setSavingId(null);
    }
  }

  async function toggleActive(p: Product) {
    setSavingId(p.id);
    try {
      const updated = await productService.update(p.id, { isActive: !p.isActive });
      setProducts((prev) => prev.map((x) => (x.id === p.id ? updated : x)));
      show(updated.isActive ? "Product activated" : "Product deactivated", updated.name);
    } catch (err) {
      show("Update failed", err instanceof ApiClientError ? err.message : "Please try again.", "error");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          load();
        }}
        className="flex gap-3"
      >
        <Input
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Button type="submit" variant="secondary" size="sm">
          <Search className="h-4 w-4" /> Search
        </Button>
      </form>

      {loading ? (
        <p className="text-sm text-charcoal-muted">Loading products…</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-line bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs font-bold uppercase tracking-wide text-charcoal-soft">
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-line last:border-b-0">
                  <td className="px-4 py-3 font-semibold text-charcoal">{p.name}</td>
                  <td className="px-4 py-3 text-charcoal-muted">{p.sku}</td>
                  <td className="px-4 py-3 text-charcoal-muted">{formatINR(p.mrp ?? p.price)}</td>
                  <td className="px-4 py-3">
                    {editingId === p.id ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min={0}
                          value={stockDraft}
                          onChange={(e) => setStockDraft(e.target.value)}
                          className="h-8 w-20 rounded-md border border-line px-2 text-sm"
                        />
                        <button
                          onClick={() => saveStock(p.id)}
                          disabled={savingId === p.id}
                          className="flex h-7 w-7 items-center justify-center rounded-md bg-success-soft text-success"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="flex h-7 w-7 items-center justify-center rounded-md bg-cream-dark text-charcoal-muted"
                        >
                          <XIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => startEdit(p)} className="font-semibold text-charcoal underline decoration-dotted underline-offset-4">
                        {p.stockQuantity}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={p.isActive ? "success" : "neutral"}>{p.isActive ? "Active" : "Inactive"}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant="outline" onClick={() => toggleActive(p)} disabled={savingId === p.id}>
                      {p.isActive ? "Deactivate" : "Activate"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="text-xs text-charcoal-muted">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button size="sm" variant="outline" disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
