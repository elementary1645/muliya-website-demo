import { Route, Routes, useLocation } from "react-router-dom";

import Home from "./pages/Home";
import Gold from "./pages/Gold";
import Diamond from "./pages/Diamond";
import Silver from "./pages/Silver";
import ProductDetails from "./pages/ProductDetails";
import SearchResults from "./pages/SearchResults";
import Wishlist from "./pages/Wishlist";
import Compare from "./pages/Compare";
import BranchProducts from "./pages/BranchProducts";
import ImageSearchPage from "./pages/ImageSearchPage";
import GoldPredictionPage from "./pages/GoldPredictionPage";

import CollectionsPage from "./pages/CollectionsPage";

import Chatbot from "./components/Chatbot";

import AdminProtectedRoute from "./admin/components/AdminProtectedRoute";
import AdminLayout from "./admin/layouts/AdminLayout";

import AdminLoginPage from "./admin/pages/AdminLoginPage";
import AdminDashboard from "./admin/pages/AdminDashboard";
import AdminProductsPage from "./admin/pages/AdminProductsPage";
import AdminAppointmentsPage from "./admin/pages/AdminAppointmentsPage";
import AdminEnquiriesPage from "./admin/pages/AdminEnquiriesPage";
import AdminExpertRequestsPage from "./admin/pages/AdminExpertRequestsPage";
import AdminInventoryPage from "./admin/pages/AdminInventoryPage";

function NotFoundPage() {
  return (
    <main
      style={{
        minHeight: "72vh",
        display: "grid",
        placeItems: "center",
        padding: "48px 20px",
        textAlign: "center",
      }}
    >
      <section>
        <p
          style={{
            marginBottom: "8px",
            fontSize: "14px",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}
        >
          Error 404
        </p>

        <h1
          style={{
            marginBottom: "12px",
            fontSize: "clamp(2rem, 6vw, 4.5rem)",
          }}
        >
          Page not found
        </h1>

        <p
          style={{
            maxWidth: "560px",
            margin: "0 auto 24px",
            lineHeight: 1.7,
          }}
        >
          The page you requested may have been moved, renamed, or may no
          longer exist.
        </p>

        <a
          href="/"
          style={{
            display: "inline-block",
            padding: "12px 22px",
            borderRadius: "999px",
            background: "#111111",
            color: "#ffffff",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          Return to home
        </a>
      </section>
    </main>
  );
}

function App() {
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <>
      <Routes>
        {/* Customer website routes */}

        <Route path="/" element={<Home />} />

        <Route path="/gold" element={<Gold />} />

        <Route path="/diamond" element={<Diamond />} />

        <Route path="/silver" element={<Silver />} />

        <Route path="/products" element={<SearchResults />} />

        <Route path="/search" element={<SearchResults />} />

        <Route path="/product/:id" element={<ProductDetails />} />

        <Route path="/wishlist" element={<Wishlist />} />

        <Route path="/compare" element={<Compare />} />

        <Route path="/collections" element={<CollectionsPage />} />

        <Route
          path="/branch/:branch"
          element={<BranchProducts />}
        />

        <Route
          path="/showrooms/:branch"
          element={<BranchProducts />}
        />

        <Route
          path="/image-search"
          element={<ImageSearchPage />}
        />

        <Route
          path="/gold-prediction"
          element={<GoldPredictionPage />}
        />

        {/* Admin login */}

        <Route
          path="/admin/login"
          element={<AdminLoginPage />}
        />

        {/* Protected admin routes */}

        <Route element={<AdminProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />

            <Route
              path="products"
              element={<AdminProductsPage />}
            />

            <Route
              path="appointments"
              element={<AdminAppointmentsPage />}
            />

            <Route
              path="enquiries"
              element={<AdminEnquiriesPage />}
            />

            <Route
              path="expert-requests"
              element={<AdminExpertRequestsPage />}
            />

            <Route
              path="inventory"
              element={<AdminInventoryPage />}
            />
          </Route>
        </Route>

        {/* Fallback route */}

        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      {!isAdminRoute && <Chatbot />}
    </>
  );
}

export default App;