import { Routes, Route } from "react-router";
import { Header } from "@/components/organism/Header";
import { Footer } from "@/components/organism/Footer";
import { CartDrawer } from "@/components/organism/CartDrawer";
import { CartProvider } from "@/hooks/useCart";
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

export default function App() {
  return (
    <CartProvider>
      <AppInner />
    </CartProvider>
  );
}

function AppInner() {
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    logDiagnostics();
    initErrorMonitoring();
  }, []);

  return (
    <>
      <Safe name="Header">
        <Header onCartClick={() => setCartOpen(true)} onSearch={() => {}} />
      </Safe>

      <div className="pt-[60px]">
        <DegradedBanner />
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
          <Route path="/reviews" element={<Safe name="Reviews"><PlaceholderPage /></Safe>} />

          {/* ===== FAQ ===== */}
          <Route path="/faq" element={<Safe name="FAQ"><FAQPage /></Safe>} />
          <Route path="/faq/:slug" element={<Safe name="FAQTopic"><FAQPage /></Safe>} />

          {/* ===== SUPPORT ===== */}
          <Route path="/support/:slug" element={<Safe name="Support"><PlaceholderPage /></Safe>} />

          {/* ===== CONTACT ===== */}
          <Route path="/contact" element={<Safe name="Contact"><ContactPage /></Safe>} />

          {/* ===== CHECKOUT / ORDER ===== */}
          <Route path="/checkout" element={<Safe name="Checkout"><Checkout /></Safe>} />
          <Route path="/order-success" element={<Safe name="OrderSuccess"><OrderSuccess /></Safe>} />

          {/* ===== ADMIN ===== */}
          <Route path="/admin/ai-knowledge" element={<Safe name="AIKnowledge"><AiKnowledgePage /></Safe>} />

          {/* 404 fallback */}
          <Route path="*" element={<Safe name="NotFound"><NotFound /></Safe>} />
        </Routes>
        </LinkInterceptor>
      </div>

      <Safe name="Footer"><Footer /></Safe>

      <Safe name="CartDrawer">
        <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      </Safe>

      {/* AI Customer Service — floating chat */}
      <AiChatWidget />

      <ErrorOverlay />
      {features.dev && <HealthCheck compact />}
    </>
  );
}
