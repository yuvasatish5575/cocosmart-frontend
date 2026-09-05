import { Link } from "react-router-dom";
import { Button } from "@/components/Frontend";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center gap-4 px-4 py-28 text-center">
      <span className="font-display text-7xl text-gold">404</span>
      <h1 className="font-display text-2xl text-charcoal">This page drifted off the tree.</h1>
      <p className="text-sm text-charcoal-muted">The page you're looking for doesn't exist or may have moved.</p>
      <Button size="lg" asChild>
        <Link to="/">Back to Home</Link>
      </Button>
    </div>
  );
}
