import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout, RequireAuth, RequireAdmin } from "@/components/Frontend";
import { AuthProvider } from "@/hooks/AuthContext";
import { CartProvider } from "@/hooks/CartContext";
import { ToastProvider } from "@/hooks/useToast";
import { WishlistProvider } from "@/hooks/WishlistContext";
import { FlyToCartProvider } from "@/hooks/FlyToCartContext";

const Home = lazy(() => import("@/pages/Home"));
const Shop = lazy(() => import("@/pages/Shop"));
const ProductDetail = lazy(() => import("@/pages/ProductDetail"));
const Traceability = lazy(() => import("@/pages/Traceability"));
const Subscriptions = lazy(() => import("@/pages/Subscriptions"));
const Checkout = lazy(() => import("@/pages/Checkout"));
const OrderConfirmation = lazy(() => import("@/pages/OrderConfirmation"));
const Orders = lazy(() => import("@/pages/Orders"));
const Wishlist = lazy(() => import("@/pages/Wishlist"));
const Addresses = lazy(() => import("@/pages/Addresses"));
const Account = lazy(() => import("@/pages/Account"));
const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/Register"));
const VerifyEmail = lazy(() => import("@/pages/VerifyEmail"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const About = lazy(() => import("@/pages/About"));
const Wholesale = lazy(() => import("@/pages/Wholesale"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const AdminLayout = lazy(() => import("@/pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminProducts = lazy(() => import("@/pages/admin/AdminProducts"));
const AdminOrders = lazy(() => import("@/pages/admin/AdminOrders"));

function RouteFallback() {
  return <div className="flex min-h-[50vh] items-center justify-center text-sm text-charcoal-soft">Loading…</div>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ToastProvider>
            <WishlistProvider>
              <FlyToCartProvider>
                <Suspense fallback={<RouteFallback />}>
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/verify-email" element={<VerifyEmail />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route element={<Layout />}>
                      <Route path="/" element={<Home />} />
                      <Route path="/shop" element={<Shop />} />
                      <Route path="/product/:slug" element={<ProductDetail />} />
                      <Route path="/traceability" element={<Traceability />} />
                      <Route path="/subscriptions" element={<Subscriptions />} />
                      <Route
                        path="/checkout"
                        element={
                          <RequireAuth>
                            <Checkout />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/order-confirmation"
                        element={
                          <RequireAuth>
                            <OrderConfirmation />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/orders"
                        element={
                          <RequireAuth>
                            <Orders />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/wishlist"
                        element={
                          <RequireAuth>
                            <Wishlist />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/account"
                        element={
                          <RequireAuth>
                            <Account />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/account/addresses"
                        element={
                          <RequireAuth>
                            <Addresses />
                          </RequireAuth>
                        }
                      />
                      <Route path="/about" element={<About />} />
                      <Route path="/wholesale" element={<Wholesale />} />
                      <Route
                        path="/admin"
                        element={
                          <RequireAdmin>
                            <AdminLayout />
                          </RequireAdmin>
                        }
                      >
                        <Route index element={<AdminDashboard />} />
                        <Route path="products" element={<AdminProducts />} />
                        <Route path="orders" element={<AdminOrders />} />
                      </Route>
                      <Route path="*" element={<NotFound />} />
                    </Route>
                  </Routes>
                </Suspense>
              </FlyToCartProvider>
            </WishlistProvider>
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
