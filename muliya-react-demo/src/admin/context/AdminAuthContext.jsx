import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getCurrentAdmin,
  loginAdmin as loginAdminRequest,
  logoutAdmin as logoutAdminRequest,
} from "../../api/adminAuthApi";

const AdminAuthContext = createContext(null);

function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const restoreAdminSession = async () => {
      try {
        setLoading(true);
        setAuthError("");

        const data = await getCurrentAdmin();

        setAdmin(data.admin || null);
      } catch {
        setAdmin(null);
      } finally {
        setLoading(false);
      }
    };

    restoreAdminSession();
  }, []);

  const login = async ({
    email,
    password,
  }) => {
    try {
      setAuthError("");

      const data = await loginAdminRequest({
        email,
        password,
      });

      setAdmin(data.admin);

      return data.admin;
    } catch (error) {
      const message =
        error.message ||
        "Unable to log in to the admin dashboard.";

      setAuthError(message);

      throw error;
    }
  };

  const logout = async () => {
    try {
      setAuthError("");

      await logoutAdminRequest();
    } finally {
      setAdmin(null);
    }
  };

  const clearAuthError = () => {
    setAuthError("");
  };

  const hasRole = (...roles) => {
    if (!admin) {
      return false;
    }

    return roles.includes(admin.role);
  };

  const hasPermission = (
    section,
    action
  ) => {
    if (!admin) {
      return false;
    }

    if (admin.role === "Super Admin") {
      return true;
    }

    return (
      admin.permissions?.[section]?.[action] === true
    );
  };

  const canAccessBranch = (branch) => {
    if (!admin || !branch) {
      return false;
    }

    if (
      admin.role === "Super Admin" ||
      admin.branch === "All"
    ) {
      return true;
    }

    return admin.branch === branch;
  };

  const value = useMemo(
    () => ({
      admin,
      loading,
      authError,

      isAuthenticated: Boolean(admin),

      login,
      logout,
      clearAuthError,

      hasRole,
      hasPermission,
      canAccessBranch,
    }),
    [
      admin,
      loading,
      authError,
    ]
  );

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

function useAdminAuth() {
  const context = useContext(AdminAuthContext);

  if (!context) {
    throw new Error(
      "useAdminAuth must be used inside AdminAuthProvider."
    );
  }

  return context;
}

export {
  AdminAuthProvider,
  useAdminAuth,
};