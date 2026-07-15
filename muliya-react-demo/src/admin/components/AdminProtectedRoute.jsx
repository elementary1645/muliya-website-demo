import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAdminAuth } from "../context/AdminAuthContext";

function AdminProtectedRoute() {
  const {
    isAuthenticated,
    loading,
  } = useAdminAuth();

  const location = useLocation();

  if (loading) {
    return (
      <main className="admin-auth-loading">
        <div className="admin-auth-spinner" />

        <h1>Checking Admin Session</h1>

        <p>Please wait while your login is verified.</p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  return <Outlet />;
}

export default AdminProtectedRoute;