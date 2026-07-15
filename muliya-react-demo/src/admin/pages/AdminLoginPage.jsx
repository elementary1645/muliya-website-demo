import { useState } from "react";
import {
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";

import { useAdminAuth } from "../context/AdminAuthContext";

function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    login,
    loading,
    authError,
    clearAuthError,
    isAuthenticated,
  } = useAdminAuth();

  const from =
    location.state?.from || "/admin";

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [submitting, setSubmitting] =
    useState(false);

  if (isAuthenticated) {
    return (
      <Navigate
        to={from}
        replace
      />
    );
  }

  const handleChange = (e) => {
    clearAuthError();

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      await login(formData);

      navigate(from, {
        replace: true,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <ShieldCheck size={48} />

          <h1>
            Muliya Admin Portal
          </h1>

          <p>
            Sign in to manage
            products, appointments,
            inventory and customer
            enquiries.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="admin-login-form"
        >
          <div className="admin-input-group">
            <Mail size={18} />

            <input
              type="email"
              name="email"
              placeholder="Admin Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="admin-input-group">
            <Lock size={18} />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {authError && (
            <div className="admin-login-error">
              {authError}
            </div>
          )}

          <button
            type="submit"
            className="admin-login-button"
            disabled={
              submitting || loading
            }
          >
            {submitting
              ? "Signing In..."
              : "Sign In"}
          </button>
        </form>

        <div className="admin-login-footer">
          © {new Date().getFullYear()} Muliya
          Jewels Administration
        </div>
      </div>
    </main>
  );
}

export default AdminLoginPage;