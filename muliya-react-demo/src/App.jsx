import {
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import Home from "./pages/Home";
import ProductDetails from "./pages/ProductDetails";
import ImageSearchPage from "./pages/ImageSearchPage";
import GoldPredictionPage from "./pages/GoldPredictionPage";

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

function App() {
  const location = useLocation();

  const isAdminRoute =
    location.pathname.startsWith("/admin");

  return (
    <>
      <Routes>
        {/* Customer website routes */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/product/:id"
          element={<ProductDetails />}
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
          <Route
            path="/admin"
            element={<AdminLayout />}
          >
            <Route
              index
              element={<AdminDashboard />}
            />

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

        <Route
          path="*"
          element={
            <main
              style={{
                minHeight: "70vh",
                display: "grid",
                placeItems: "center",
                padding: "40px 20px",
                textAlign: "center",
              }}
            >
              <div>
                <h1>Page Not Found</h1>

                <p>
                  The page you requested does not exist.
                </p>
              </div>
            </main>
          }
        />
      </Routes>

      {!isAdminRoute && <Chatbot />}
    </>
  );
}

export default App;