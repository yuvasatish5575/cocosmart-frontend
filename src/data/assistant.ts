export interface AssistantEntry {
  keywords: string[];
  answer: string;
}

/**
 * Coco answers from this fixed, approved knowledge base only — no open-ended
 * generation. Anything outside it falls back to a human-support escalation.
 */
export const assistantKnowledgeBase: AssistantEntry[] = [
  {
    keywords: ["coconut cream", "cream used", "use cream"],
    answer:
      "Coconut Cream is our thickest product, skimmed from the first press with no water added. It's suited for curries, whipped desserts, and any recipe that calls for richness.",
  },
  {
    keywords: ["best for cooking", "cooking product", "which product", "choose a product", "help me choose", "recommend"],
    answer:
      "For everyday cooking, Coconut Milk and Virgin Coconut Oil are our most versatile picks. If you want richness for curries or desserts, go with Coconut Cream. Want me to open the Shop page for you?",
  },
  {
    keywords: ["where did this coconut come from", "origin", "farm", "sourced", "traceability"],
    answer:
      "Every batch is linked to a source farm and harvest date where that data is available — you'll find it on each product's Traceability tab, or on our full Traceability page. If a step isn't recorded yet, we say so rather than guessing.",
  },
  {
    keywords: ["where is my order", "track my order", "order status", "delivery status"],
    answer:
      "You can check real-time status for any order on the Order Tracking page — open Account → My Orders and select the order you'd like to track.",
  },
  {
    keywords: ["subscription", "subscribe", "pause", "skip delivery", "cancel subscription"],
    answer:
      "Subscriptions can be paused, skipped, modified or cancelled anytime from the Subscriptions page — no lock-in. Subscribing also saves you a percentage on every delivery.",
  },
  {
    keywords: ["shelf life", "expiry", "how long does it last", "storage"],
    answer:
      "Shelf life depends on the specific product and pack — check the Storage tab on each product page for validated guidance rather than a one-size-fits-all number.",
  },
  {
    keywords: ["payment", "upi", "cod", "cash on delivery", "pay"],
    answer: "We support UPI, major cards, and Cash on Delivery at checkout, through a secure payment gateway.",
  },
  {
    keywords: ["return", "refund", "complaint", "damaged", "recall"],
    answer:
      "If something arrives damaged or isn't right, please raise it from Account → Help & Support — every complaint is logged and investigated, and we'll make it right.",
  },
  {
    keywords: ["delivery time", "how long delivery", "shipping time"],
    answer:
      "Delivery windows depend on your service area and are shown as delivery slots at checkout — we don't promise a universal timeframe upfront.",
  },
];

export const suggestedQuestions = [
  "What is coconut cream used for?",
  "Which product is best for cooking?",
  "Where did this coconut come from?",
  "Where is my order?",
  "Help me choose a product",
];

export function matchAssistantAnswer(query: string): string | null {
  const q = query.toLowerCase();
  for (const entry of assistantKnowledgeBase) {
    if (entry.keywords.some((k) => q.includes(k))) {
      return entry.answer;
    }
  }
  return null;
}
