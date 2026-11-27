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
import { useState, useEffect } from "react";
import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import NotFound from "./pages/NotFound";
import PlaceholderPage from "./pages/PlaceholderPage";
import ReviewsPage from "./pages/ReviewsPage";

/* ================================================================ */
/*  PHASE 4.8 — Real Content Pages                                  */
/* ================================================================ */
import ProductsPage from "./pages/ProductsPage";
import FeederCategoryPage from "./pages/FeederCategoryPage";
import WaterDispenserCategoryPage from "./pages/WaterDispenserCategoryPage";
import AccessoriesPage from "./pages/AccessoriesPage";
import SolutionsLandingPage from "./pages/SolutionsLandingPage";
import SolutionDetailPage from "./pages/SolutionDetailPage";
import BrandStoryPage from "./pages/BrandStoryPage";
import TrustPage from "./pages/TrustPage";
import FAQPage from "./pages/FAQPage";
import ContactPage from "./pages/ContactPage";
import AiKnowledgePage from "./pages/admin/AiKnowledgePage";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminApprovals from "./pages/admin/AdminApprovals";
import AdminUsers from "./pages/admin/AdminUsers";

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
        <Header onCartClick={() => setCartOpen(true)} onSearch={() => {}} />
      </Safe>}

      <div className={isAdmin ? undefined : "pt-[60px]"}>
        {!isAdmin && <DegradedBanner />}
        <LinkInterceptor>
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
            <Route path="ai-knowledge" element={<AiKnowledgePage />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="approvals" element={<AdminApprovals />} />
            <Route path="users" element={<AdminUsers />} />
          </Route>
          {/* 404 fallback */}
          <Route path="*" element={<Safe name="NotFound"><NotFound /></Safe>} />
        </Routes>
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
