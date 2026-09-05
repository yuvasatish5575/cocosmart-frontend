import type { Review } from "./types";

/**
 * Reviews remain local, illustrative content rather than a real backend
 * feature (no submission API was built for this pass — see README
 * "Known Limitations"). Keyed by product *slug*, which is stable, rather
 * than database id, which is generated at seed time.
 */
const reviewsBySlug: Record<string, Omit<Review, "productId">[]> = {
  "tender-coconut-water": [
    { id: "r-1", author: "Ananya R.", rating: 5, date: "3 Aug 2026", comment: "Tastes fresh, delivery was fast. Can taste the difference from the branded cartons.", verified: true, hasPhoto: true },
    { id: "r-2", author: "Kiran M.", rating: 4, date: "28 Jul 2026", comment: "Good quality, a bit pricey for the pack size, but worth it for the traceability.", verified: true },
    { id: "r-3", author: "Divya S.", rating: 5, date: "20 Jul 2026", comment: "Loved that I could see exactly which farm it came from. Subscribed immediately.", verified: true },
  ],
  "premium-coconut-milk": [
    { id: "r-4", author: "Rohan K.", rating: 5, date: "15 Jul 2026", comment: "Perfect consistency for curries, doesn't split like other brands.", verified: true },
  ],
  "virgin-coconut-oil": [
    { id: "r-5", author: "Meera P.", rating: 4, date: "9 Jul 2026", comment: "Great aroma, solidifies in winter which is expected for cold-pressed oil.", verified: true, hasPhoto: true },
  ],
  "coconut-cream": [
    { id: "r-6", author: "Arjun T.", rating: 5, date: "2 Jul 2026", comment: "Thick and rich, made an excellent coconut dessert with this.", verified: true },
  ],
};

export function getReviewsForProduct(productSlug: string): Review[] {
  return (reviewsBySlug[productSlug] ?? []).map((r) => ({ ...r, productId: productSlug }));
}

/** Flattened across all products — used for the homepage's illustrative reviews strip. */
export const reviews: Review[] = Object.entries(reviewsBySlug).flatMap(([slug, list]) =>
  list.map((r) => ({ ...r, productId: slug }))
);
