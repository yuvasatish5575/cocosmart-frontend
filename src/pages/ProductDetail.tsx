import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ProductGallery, ProductPurchasePanel, ProductBenefits, ProductInformation, RecommendationCarousel, Skeleton } from "@/components/Frontend";
import { productService } from "@/services/productService";
import { getReviewsForProduct } from "@/data/reviews";
import { ApiClientError } from "@/lib/apiClient";
import type { Product } from "@/data/types";

export default function ProductDetail() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const mediaRef = useRef<HTMLButtonElement>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setProduct(null);
    setError(null);
    productService
      .getBySlug(slug)
      .then((p) => {
        setProduct(p);
        return productService.list({ category: p.categorySlug, limit: 5 });
      })
      .then((res) => setRelated((res?.products ?? []).filter((p) => p.slug !== slug).slice(0, 4)))
      .catch((err) => {
        if (err instanceof ApiClientError && err.status === 404) {
          navigate("/shop", { replace: true });
          return;
        }
        setError("Unable to load this product. Please try again.");
      });
  }, [slug, navigate]);

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <p className="text-sm font-semibold text-error">{error}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <div className="flex flex-col gap-4">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-10 w-1/2" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  const reviews = getReviewsForProduct(product.slug);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="mb-6 text-xs text-charcoal-soft">
        <Link to="/" className="hover:text-coconut">Home</Link>
        {" / "}
        <Link to={`/shop?category=${product.categorySlug}`} className="hover:text-coconut">{product.category}</Link>
        {" / "}
        <span className="text-charcoal-muted">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
        <ProductGallery product={product} mediaRef={mediaRef} />
        <ProductPurchasePanel product={product} sourceRef={mediaRef} />
      </div>

      <div className="mt-16">
        <ProductBenefits benefits={product.benefits} />
      </div>

      <div className="mt-16 max-w-2xl">
        <ProductInformation product={product} reviews={reviews} />
      </div>

      {related.length > 0 && (
        <div className="mt-16 border-t border-line pt-10">
          <RecommendationCarousel title="You May Also Like" products={related} />
        </div>
      )}
    </div>
  );
}
