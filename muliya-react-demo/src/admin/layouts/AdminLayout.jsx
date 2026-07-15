import { useState } from "react";
import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Gem,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareText,
  Package,
  ShieldCheck,
  Store,
  UserRoundCheck,
  X,
} from "lucide-react";

import { useAdminAuth } from "../context/AdminAuthContext";

const navigationItems = [
  {
    label: "Dashboard",
    path: "/admin",
    icon: LayoutDashboard,
    end: true,
  },
  {
    label: "Products",
    path: "/admin/products",
    icon: Package,
  },
  {
    label: "Appointments",
    path: "/admin/appointments",
    icon: CalendarDays,
  },
  {
    label: "Enquiries",
    path: "/admin/enquiries",
    icon: MessageSquareText,
  },
  {
    label: "Expert Requests",
    path: "/admin/expert-requests",
    icon: UserRoundCheck,
  },
  {
    label: "Inventory",
    path: "/admin/inventory",
    icon: Store,
  },
];

function AdminLayout() {
  const navigate = useNavigate();

  const {
    admin,
    logout,
  } = useAdminAuth();

  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);

  const [mobileSidebarOpen, setMobileSidebarOpen] =
    useState(false);

  const handleLogout = async () => {
    try {
      await logout();

      navigate("/admin/login", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Admin logout failed:",
        error
      );
    }
  };

  const closeMobileSidebar = () => {
    setMobileSidebarOpen(false);
  };

  return (
    <div
      className={
        sidebarCollapsed
          ? "admin-shell sidebar-collapsed"
          : "admin-shell"
      }
    >
      <aside
        className={
          mobileSidebarOpen
            ? "admin-sidebar mobile-open"
            : "admin-sidebar"
        }
      >
        <div className="admin-sidebar-header">
          <div className="admin-brand">
            <div className="admin-brand-icon">
              <Gem size={23} />
            </div>

            {!sidebarCollapsed && (
              <div>
                <strong>Muliya</strong>
                <span>Admin Portal</span>
              </div>
            )}
          </div>

          <button
            type="button"
            className="admin-mobile-close"
            onClick={closeMobileSidebar}
            aria-label="Close admin navigation"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="admin-navigation">
          {navigationItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={closeMobileSidebar}
                className={({ isActive }) =>
                  isActive
                    ? "admin-nav-link active"
                    : "admin-nav-link"
                }
              >
                <Icon size={19} />

                {!sidebarCollapsed && (
                  <span>{item.label}</span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-sidebar-profile">
            <div className="admin-profile-avatar">
              <ShieldCheck size={19} />
            </div>

            {!sidebarCollapsed && (
              <div>
                <strong>
                  {admin?.name || "Administrator"}
                </strong>

                <span>
                  {admin?.role || "Admin"}
                </span>
              </div>
            )}
          </div>

          <button
            type="button"
            className="admin-sidebar-logout"
            onClick={handleLogout}
          >
            <LogOut size={18} />

            {!sidebarCollapsed && (
              <span>Logout</span>
            )}
          </button>
        </div>
      </aside>

      {mobileSidebarOpen && (
        <button
          type="button"
          className="admin-sidebar-overlay"
          onClick={closeMobileSidebar}
          aria-label="Close admin menu"
        />
      )}

      <section className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              type="button"
              className="admin-mobile-menu"
              onClick={() =>
                setMobileSidebarOpen(true)
              }
              aria-label="Open admin navigation"
            >
              <Menu size={21} />
            </button>

            <button
              type="button"
              className="admin-sidebar-toggle"
              onClick={() =>
                setSidebarCollapsed(
                  (currentValue) =>
                    !currentValue
                )
              }
              aria-label="Toggle sidebar"
            >
              {sidebarCollapsed ? (
                <ChevronRight size={20} />
              ) : (
                <ChevronLeft size={20} />
              )}
            </button>

            <div>
              <span>Administration</span>

              <strong>
                Muliya Gold & Diamonds
              </strong>
            </div>
          </div>

          <div className="admin-topbar-profile">
            <div>
              <strong>
                {admin?.name || "Administrator"}
              </strong>

              <span>
                {admin?.branch || "All Branches"}
              </span>
            </div>

            <div className="admin-topbar-avatar">
              {String(
                admin?.name || "A"
              )
                .charAt(0)
                .toUpperCase()}
            </div>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </section>
    </div>
  );
}

export default AdminLayout;