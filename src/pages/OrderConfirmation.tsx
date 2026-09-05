import { Link, useLocation } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { Button, CoconutLeaf } from "@/components/Frontend";

export default function OrderConfirmation() {
  const location = useLocation();
  const orderNumber = (location.state as { orderNumber?: string } | null)?.orderNumber;

  return (
    <div className="relative mx-auto flex max-w-xl flex-col items-center gap-4 overflow-hidden px-4 py-24 text-center sm:px-6">
      <CoconutLeaf color="#C9A227" className="pointer-events-none absolute -top-6 left-1/2 w-40 -translate-x-1/2 opacity-10" />
      <span className="flex h-20 w-20 items-center justify-center rounded-full bg-success-soft text-success">
        <CheckCircle2 className="h-9 w-9" strokeWidth={1.5} />
      </span>
      <h1 className="font-display text-3xl text-charcoal">Order confirmed!</h1>
      <p className="text-sm text-charcoal-muted">
        {orderNumber ? (
          <>
            Your order <strong className="text-charcoal">#{orderNumber}</strong> has been placed and is on its way through
            our cold-chain to you.
          </>
        ) : (
          "Your order has been placed and is on its way through our cold-chain to you."
        )}
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        <Button size="lg" asChild>
          <Link to="/orders">Track Order</Link>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link to="/shop">Continue Shopping</Link>
        </Button>
      </div>
    </div>
  );
}
