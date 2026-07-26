import {
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import Home from "./pages/Home";
import Gold from "./pages/Gold";
import Diamond from "./pages/Diamond";
import Silver from "./pages/Silver";

import ProductDetails from "./pages/ProductDetails";
import SearchResults from "./pages/SearchResults";
import Wishlist from "./pages/Wishlist";
import Compare from "./pages/Compare";
import BranchProducts from "./pages/BranchProducts";
import ContactPage from "./pages/ContactPage";
import GoldBuyingPlansPage from "./pages/GoldBuyingPlansPage";

import ImageSearchPage from "./pages/ImageSearchPage";
import GoldPredictionPage from "./pages/GoldPredictionPage";

import CollectionsPage from "./pages/CollectionsPage";
import ShowroomsPage from "./pages/ShowroomsPage";
import AppointmentPage from "./pages/AppointmentPage";

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
          The page you requested may have been moved,
          renamed, or may no longer exist.
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

  const isAdminRoute =
    location.pathname.startsWith(
      "/admin"
    );

  return (
    <>
      <Routes>

        {/* CUSTOMER WEBSITE */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/gold"
          element={<Gold />}
        />

        <Route
          path="/diamond"
          element={<Diamond />}
        />

        <Route
          path="/silver"
          element={<Silver />}
        />

        <Route
          path="/products"
          element={<SearchResults />}
        />

        <Route
          path="/search"
          element={<SearchResults />}
        />

        <Route
          path="/product/:id"
          element={<ProductDetails />}
        />

        <Route
          path="/wishlist"
          element={<Wishlist />}
        />

        <Route
          path="/compare"
          element={<Compare />}
        />


        {/* COLLECTIONS */}

        <Route
          path="/collections"
          element={<CollectionsPage />}
        />


        {/* SHOWROOMS */}

        <Route
          path="/showrooms"
          element={<ShowroomsPage />}
        />

        <Route
          path="/showrooms/:branch"
          element={<BranchProducts />}
        />

        <Route
          path="/branch/:branch"
          element={<BranchProducts />}
        />

        <Route
          path="/appointment"
          element={<AppointmentPage />}
        />

        <Route
          path="/contact"
          element={<ContactPage />}
        />

        <Route
          path="/gold-buying-plans"
          element={<GoldBuyingPlansPage />}
        />



        {/* AI FEATURES */}

        <Route
          path="/image-search"
          element={<ImageSearchPage />}
        />

        <Route
          path="/gold-prediction"
          element={<GoldPredictionPage />}
        />


        {/* ADMIN LOGIN */}

        <Route
          path="/admin/login"
          element={<AdminLoginPage />}
        />


        {/* PROTECTED ADMIN */}

        <Route
          element={
            <AdminProtectedRoute />
          }
        >
          <Route
            path="/admin"
            element={<AdminLayout />}
          >
            <Route
              index
              element={
                <AdminDashboard />
              }
            />

            <Route
              path="products"
              element={
                <AdminProductsPage />
              }
            />

            <Route
              path="appointments"
              element={
                <AdminAppointmentsPage />
              }
            />

            <Route
              path="enquiries"
              element={
                <AdminEnquiriesPage />
              }
            />

            <Route
              path="expert-requests"
              element={
                <AdminExpertRequestsPage />
              }
            />

            <Route
              path="inventory"
              element={
                <AdminInventoryPage />
              }
              
            />
          </Route>
        </Route>


        {/* FALLBACK */}

        <Route
          path="*"
          element={<NotFoundPage />}
        />

      </Routes>

      {!isAdminRoute && <Chatbot />}
    </>
  );
}


export default App;