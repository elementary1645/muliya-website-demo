import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [pathname]);

  return null;
}

function CustomerLayout() {
  return (
    <div className="customer-website">
      <ScrollToTop />

      <Navbar />

      <main className="customer-main-content">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

export default CustomerLayout;