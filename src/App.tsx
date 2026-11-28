import { IS_LIVE_STORE } from "@/config/storeConfig";
import { I18nProvider, useI18n } from "@/i18n";
import { Routes, Route, useLocation } from "react-router";
import { Header } from "@/components/organism/Header";
import { Footer } from "@/components/organism/Footer";
import { CartDrawer } from "@/components/organism/CartDrawer";
import { CartProvider } from "@/hooks/useCart";
import { ProductPricingProvider } from "@/context/ProductPricingContext";
import { Safe } from "@/components/SafeComponent";
import { ErrorOverlay, initErrorMonitoring } from "@/components/ErrorOverlay";
import { HealthCheck } from "@/components/HealthCheck";
import { DegradedBanner } from "@/components/DegradedBanner";
import { LinkInterceptor } from "@/components/LinkInterceptor";
import { AiChatWidget } from "@/components/AiChatWidget";
import { features, logDiagnostics } from "@/lib/env";
import { useState, useEffect, lazy, Suspense } from "react";
import Home from "./pages/Home";
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Checkout = lazy(() => import("./pages/Checkout"));
const OrderSuccess = lazy(() => import("./pages/OrderSuccess"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PlaceholderPage = lazy(() => import("./pages/PlaceholderPage"));
const ReviewsPage = lazy(() => import("./pages/ReviewsPage"));

/* ================================================================ */
/*  PHASE 4.8 — Real Content Pages                                  */
/* ================================================================ */
const ProductsPage = lazy(() => import("./pages/ProductsPage"));
const FeederCategoryPage = lazy(() => import("./pages/FeederCategoryPage"));
const WaterDispenserCategoryPage = lazy(() => import("./pages/WaterDispenserCategoryPage"));
const AccessoriesPage = lazy(() => import("./pages/AccessoriesPage"));
const SolutionsLandingPage = lazy(() => import("./pages/SolutionsLandingPage"));
const SolutionDetailPage = lazy(() => import("./pages/SolutionDetailPage"));
const BrandStoryPage = lazy(() => import("./pages/BrandStoryPage"));
const TrustPage = lazy(() => import("./pages/TrustPage"));
const FAQPage = lazy(() => import("./pages/FAQPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const AiKnowledgePage = lazy(() => import("./pages/admin/AiKnowledgePage"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminReservations = lazy(() => import("./pages/admin/AdminReservations"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminApprovals = lazy(() => import("./pages/admin/AdminApprovals"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));

export default function App() {
  return (
    <I18nProvider><ProductPricingProvider><CartProvider>
      <AppInner />
    </CartProvider></ProductPricingProvider></I18nProvider>
  );
}

function AppInner() {
  const [cartOpen, setCartOpen] = useState(false);
  const { pathname } = useLocation();
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");
  const { t } = useI18n();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

  useEffect(() => {
    const openCart = () => setCartOpen(true);
    window.addEventListener("wpet:open-cart", openCart);
    logDiagnostics();
    initErrorMonitoring();
    return () => window.removeEventListener("wpet:open-cart", openCart);
  }, []);

  return (
    <>
      {!isAdmin && <Safe name="Header">
        <Header onCartClick={() => setCartOpen(true)} />
      </Safe>}

      <div>
        {!isAdmin && <DegradedBanner />}
        <LinkInterceptor>
        <Suspense fallback={<div role="status" className="container-section flex min-h-[50vh] items-center justify-center py-12">{t("loading")}</div>}>
        <Routes>
          {/* Home */}
          <Route path="/" element={<Safe name="Home"><Home /></Safe>} />

          {/* ===== PRODUCTS ===== */}
          <Route path="/products" element={<Safe name="Products"><ProductsPage /></Safe>} />
          <Route path="/products/feeders" element={<Safe name="Feeders"><FeederCategoryPage /></Safe>} />
          <Route path="/products/water-dispensers" element={<Safe name="Water"><WaterDispenserCategoryPage /></Safe>} />
          <Route path="/products/accessories" element={<Safe name="Accessories"><AccessoriesPage /></Safe>} />
          <Route path="/products/:slug" element={<Safe name="ProductDetail"><ProductDetail /></Safe>} />

          {/* ===== SOLUTIONS / GUIDES ===== */}
          <Route path="/solutions" element={<Safe name="Solutions"><SolutionsLandingPage /></Safe>} />
          <Route path="/solutions/:slug" element={<Safe name="Solution"><SolutionDetailPage /></Safe>} />

          {/* ===== BRAND ===== */}
          <Route path="/brand" element={<Safe name="Brand"><BrandStoryPage /></Safe>} />
          <Route path="/brand/:slug" element={<Safe name="BrandPage"><BrandStoryPage /></Safe>} />

          {/* ===== TRUST ===== */}
          <Route path="/trust/:slug" element={<Safe name="Trust"><TrustPage /></Safe>} />

          {/* ===== REVIEWS ===== */}
          <Route path="/reviews" element={<Safe name="Reviews"><ReviewsPage /></Safe>} />

          {/* ===== FAQ ===== */}
          <Route path="/faq" element={<Safe name="FAQ"><FAQPage /></Safe>} />
          <Route path="/faq/:slug" element={<Safe name="FAQTopic"><FAQPage /></Safe>} />

          {/* ===== SUPPORT ===== */}
          <Route path="/support/:slug" element={<Safe name="Support"><PlaceholderPage /></Safe>} />

          {/* ===== CONTACT ===== */}
          <Route path="/contact" element={<Safe name="Contact"><ContactPage /></Safe>} />

          {/* ===== CHECKOUT / ORDER ===== */}
          <Route path="/checkout" element={IS_LIVE_STORE ? <Safe name="Checkout"><Checkout /></Safe> : <section className="mx-auto max-w-xl p-12 text-center"><h1>{t("reservation")}</h1><p className="my-4">{t("checkoutBlocked")}</p><button className="rounded bg-primary p-3 text-white" onClick={() => setCartOpen(true)}>{t("cart")}</button></section>} />
          <Route path="/order-success" element={<Safe name="OrderSuccess"><OrderSuccess /></Safe>} />

          {/* ===== ADMIN ===== */}

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminReservations />} />
            <Route path="reservations" element={<AdminReservations />} />
            <Route path="ai-knowledge" element={<AiKnowledgePage />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="approvals" element={<AdminApprovals />} />
            <Route path="users" element={<AdminUsers />} />
          </Route>
          {/* 404 fallback */}
          <Route path="*" element={<Safe name="NotFound"><NotFound /></Safe>} />
        </Routes>
        </Suspense>
        </LinkInterceptor>
      </div>

      {!isAdmin && <>
        <Safe name="Footer"><Footer /></Safe>
        <Safe name="CartDrawer">
          <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
        </Safe>
        <AiChatWidget />
      </>}

      <ErrorOverlay />
      {features.dev && <HealthCheck compact />}
    </>
  );
}
