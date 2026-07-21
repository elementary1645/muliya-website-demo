import { useEffect, useState } from "react";
import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  CalendarDays,
  Camera,
  Heart,
  MapPin,
  Menu,
  Search,
  Scale,
  X,
} from "lucide-react";

const readStoredItems = (key) => {
  try {
    const savedItems = JSON.parse(localStorage.getItem(key));
    return Array.isArray(savedItems) ? savedItems : [];
  } catch {
    return [];
  }
};

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [wishlistCount, setWishlistCount] = useState(0);
  const [compareCount, setCompareCount] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();

  const updateSavedItemCounts = () => {
    setWishlistCount(readStoredItems("muliyaWishlist").length);
    setCompareCount(readStoredItems("muliyaCompare").length);
  };

  useEffect(() => {
    updateSavedItemCounts();

    window.addEventListener(
      "wishlistUpdated",
      updateSavedItemCounts,
    );

    window.addEventListener(
      "compareUpdated",
      updateSavedItemCounts,
    );

    window.addEventListener(
      "storage",
      updateSavedItemCounts,
    );

    return () => {
      window.removeEventListener(
        "wishlistUpdated",
        updateSavedItemCounts,
      );

      window.removeEventListener(
        "compareUpdated",
        updateSavedItemCounts,
      );

      window.removeEventListener(
        "storage",
        updateSavedItemCounts,
      );
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscapeKey,
      );
    };
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();

    const cleanedSearchText = searchText.trim();

    if (!cleanedSearchText) {
      navigate("/products");
      return;
    }

    navigate(
      `/search?q=${encodeURIComponent(cleanedSearchText)}`,
    );

    setSearchText("");
    setMenuOpen(false);
  };

  const navLinkClassName = ({ isActive }) =>
    isActive ? "active" : undefined;

  return (
    <>
      <div className="top-strip">
        <div className="top-strip-content">
          <p>Creating Happiness Since 1944</p>

          <div className="top-strip-links">
            <Link to="/gold-prediction">
              Gold Rate
            </Link>

            <Link to="/silver">
              Silver Jewellery
            </Link>

            <Link to="/showrooms">
              Showrooms
            </Link>
          </div>
        </div>
      </div>

      <header className="main-navbar">
        <div className="navbar-container">
          <Link
            to="/"
            className="brand-logo"
            aria-label="Muliya Gold and Diamonds home"
          >
            <div
              className="brand-mark"
              aria-hidden="true"
            >
              M
            </div>

            <div>
              <h2>Muliya</h2>
              <p>Gold &amp; Diamonds</p>
            </div>
          </Link>

          <nav
            id="main-navigation"
            className={
              menuOpen
                ? "nav-menu active"
                : "nav-menu"
            }
            aria-label="Main navigation"
          >
            <NavLink
              to="/"
              end
              className={navLinkClassName}
            >
              Home
            </NavLink>

            <NavLink
              to="/products"
              className={navLinkClassName}
            >
              Jewellery
            </NavLink>

            <NavLink
              to="/gold"
              className={navLinkClassName}
            >
              Gold
            </NavLink>

            <NavLink
              to="/diamond"
              className={navLinkClassName}
            >
              Diamond
            </NavLink>

            <NavLink
              to="/silver"
              className={navLinkClassName}
            >
              Silver
            </NavLink>

            <NavLink
              to="/collections"
              className={navLinkClassName}
            >
              Collections
            </NavLink>

            <NavLink
              to="/showrooms"
              className={navLinkClassName}
            >
              Showrooms
            </NavLink>

            <NavLink
              to="/appointment"
              className={navLinkClassName}
            >
              Appointment
            </NavLink>

            <NavLink
              to="/contact"
              className={navLinkClassName}
            >
              Contact
            </NavLink>
          </nav>

          <div className="navbar-actions">
            <form
              className="navbar-search-form"
              role="search"
              onSubmit={handleSearch}
            >
              <Search
                size={17}
                aria-hidden="true"
              />

              <input
                type="search"
                name="q"
                aria-label="Search jewellery"
                placeholder="Search jewellery..."
                value={searchText}
                onChange={(event) =>
                  setSearchText(event.target.value)
                }
                autoComplete="off"
              />
            </form>

            <Link
              to="/image-search"
              className="navbar-icon-btn"
              title="AI image search"
              aria-label="Open AI image search"
            >
              <Camera
                size={19}
                aria-hidden="true"
              />
            </Link>

            <Link
              to="/wishlist"
              className="navbar-icon-btn wishlist-navbar-button"
              title="Wishlist"
              aria-label={`Open wishlist. ${wishlistCount} saved items.`}
            >
              <Heart
                size={19}
                aria-hidden="true"
              />

              {wishlistCount > 0 && (
                <span
                  className="wishlist-count"
                  aria-hidden="true"
                >
                  {wishlistCount > 99
                    ? "99+"
                    : wishlistCount}
                </span>
              )}
            </Link>

            <Link
              to="/compare"
              className="navbar-icon-btn wishlist-navbar-button"
              title="Compare jewellery"
              aria-label={`Open comparison. ${compareCount} selected items.`}
            >
              <Scale
                size={19}
                aria-hidden="true"
              />

              {compareCount > 0 && (
                <span
                  className="wishlist-count"
                  aria-hidden="true"
                >
                  {compareCount > 99
                    ? "99+"
                    : compareCount}
                </span>
              )}
            </Link>

            <Link
              to="/showrooms"
              className="navbar-icon-btn"
              title="Showrooms"
              aria-label="View showrooms"
            >
              <MapPin
                size={19}
                aria-hidden="true"
              />
            </Link>

            <Link
              to="/appointment"
              className="navbar-icon-btn"
              title="Book an appointment"
              aria-label="Book an appointment"
            >
              <CalendarDays
                size={19}
                aria-hidden="true"
              />
            </Link>

            <button
              type="button"
              className="mobile-menu-btn"
              aria-label={
                menuOpen
                  ? "Close navigation menu"
                  : "Open navigation menu"
              }
              aria-expanded={menuOpen}
              aria-controls="main-navigation"
              onClick={() =>
                setMenuOpen((currentValue) => !currentValue)
              }
            >
              {menuOpen ? (
                <X
                  size={24}
                  aria-hidden="true"
                />
              ) : (
                <Menu
                  size={24}
                  aria-hidden="true"
                />
              )}
            </button>
          </div>
        </div>
      </header>
    </>
  );
}

export default Navbar;