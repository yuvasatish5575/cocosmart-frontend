export type ProductTone = "coconut" | "leaf" | "gold" | "cream" | "charcoal";

export interface ProductBenefit {
  title: string;
  description: string;
  icon: "leaf" | "droplet" | "shield" | "sparkles" | "sprout" | "flame";
}

export interface NutritionFact {
  label: string;
  value: string;
}

export interface TraceabilityRecord {
  available: boolean;
  batchId?: string;
  farmName?: string;
  farmLocation?: string;
  harvestDate?: string;
  processedDate?: string;
  qualityCheckedBy?: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  categorySlug: string;
  shortDescription: string;
  description: string;
  price: number;
  mrp?: number;
  sku: string;
  sizes: string[];
  rating: number;
  reviewCount: number;
  stock: "in-stock" | "low-stock" | "out-of-stock";
  stockQuantity: number;
  bestseller?: boolean;
  tone: ProductTone;
  image?: string;
  images: string[];
  benefits: ProductBenefit[];
  ingredients: string[];
  nutrition: NutritionFact[];
  storage?: string;
  origin?: string;
  traceability: TraceabilityRecord;
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  tone: ProductTone;
  isActive?: boolean;
}

export interface Review {
  id: string;
  productId: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
  hasPhoto?: boolean;
}

export interface TraceStage {
  key: string;
  label: string;
  detail: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export type UserRole = "CUSTOMER" | "ADMIN";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Address
// ---------------------------------------------------------------------------

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

// ---------------------------------------------------------------------------
// Cart
// ---------------------------------------------------------------------------

export interface CartLine {
  key: string;
  productId: string;
  slug: string;
  name: string;
  size: string;
  price: number;
  qty: number;
  tone: ProductTone;
  image?: string;
  lineTotal: number;
  available: boolean;
  stockQuantity: number;
}

export interface Cart {
  id: string;
  lines: CartLine[];
  count: number;
  subtotal: number;
  delivery: number;
  total: number;
}

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

export type OrderStatus = "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";
export type PaymentMethod = "UPI" | "CARD" | "COD";

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  size: string;
  price: number;
  quantity: number;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  subtotal: number;
  discount: number;
  shippingCost: number;
  tax: number;
  totalAmount: number;
  shippingAddress: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  deliverySlot?: string;
  items: OrderItem[];
  customer?: { id: string; name: string; email: string };
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

export interface AdminDashboard {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  totalCustomers: number;
  totalProducts: number;
  lowStockProducts: Product[];
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    orderStatus: OrderStatus;
    paymentStatus: PaymentStatus;
    totalAmount: number;
    customer?: { name: string; email: string };
    createdAt: string;
  }>;
}
