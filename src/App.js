import "@/App.css";
import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FloatingActions from "@/components/layout/FloatingActions";
import ScrollToTop from "@/components/utils/ScrollToTop";
import { LocationProvider } from "@/hooks/useLocationContext";
import SOSSidePanel from "@/components/layout/SOSSidePanel";

// Lazy-loaded pages — each downloads only when visited
const HomePage = lazy(() => import("@/pages/HomePage"));
const AboutPage = lazy(() => import("@/pages/AboutPage"));
const CentreLocatorPage = lazy(() => import("@/pages/CentreLocatorPage"));
const ServicesPage = lazy(() => import("@/pages/ServicesPage"));
const TeamPage = lazy(() => import("@/pages/TeamPage"));
const BusinessPage = lazy(() => import("@/pages/BusinessPage"));
const HealthCardPage = lazy(() => import("@/pages/HealthCardPage"));
const CareerPage = lazy(() => import("@/pages/CareerPage"));
const TeamVerifyPage = lazy(() => import("@/pages/TeamVerifyPage"));
const NewsGalleryPage = lazy(() => import("@/pages/NewsGalleryPage"));
const ContactPage = lazy(() => import("@/pages/ContactPage"));
const FinancialServicesPage = lazy(() => import("@/pages/FinancialServicesPage"));
const CmsPage = lazy(() => import("@/pages/CmsPage"));
const ListYourLocatorPage = lazy(() => import("@/pages/ListYourLocatorPage"));

const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <Loader2 className="w-8 h-8 text-hw-primary animate-spin" />
  </div>
);

function App() {
  return (
    <div className="App min-h-screen bg-hw-base">
      <BrowserRouter>
        <LocationProvider>
          <ScrollToTop />
          <Navbar />
          <main>
            <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/centre-locator" element={<CentreLocatorPage />} />
              <Route
                path="/list-your-locator"
                element={<ListYourLocatorPage />}
              />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/team" element={<TeamPage />} />
              <Route path="/business" element={<BusinessPage />} />
              <Route path="/health-card" element={<HealthCardPage />} />
              <Route path="/careers" element={<CareerPage />} />
              <Route
                path="/team/verify/:uniqueId"
                element={<TeamVerifyPage />}
              />
              <Route path="/news-gallery" element={<NewsGalleryPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route
                path="/financial-services"
                element={<FinancialServicesPage />}
              />
              <Route path="/page/:slug" element={<CmsPage />} />
              <Route path="/privacy-policy" element={<CmsPage />} />
              <Route path="/terms-and-conditions" element={<CmsPage />} />
              <Route path="/refund-policy" element={<CmsPage />} />
              <Route path="/disclaimer" element={<CmsPage />} />
            </Routes>
            </Suspense>
          </main>
          <Footer />
          <SOSSidePanel />
          <FloatingActions />
        </LocationProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
