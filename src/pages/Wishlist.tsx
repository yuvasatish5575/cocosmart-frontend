import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { ProductGrid, EmptyState, Button } from "@/components/Frontend";
import { useWishlist } from "@/hooks/WishlistContext";

export default function Wishlist() {
  const { products } = useWishlist();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 font-display text-3xl text-charcoal">Your Wishlist</h1>
      {products.length === 0 ? (
        <EmptyState
          icon={<Heart className="h-8 w-8" strokeWidth={1.5} />}
          title="Nothing saved yet"
          description="Tap the heart on any product to save it here for later."
          action={
            <Button asChild>
              <Link to="/shop">Explore Products</Link>
            </Button>
          }
        />
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
}
