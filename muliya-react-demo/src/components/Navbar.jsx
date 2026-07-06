import { Link, NavLink } from "react-router-dom";
import { Camera, Heart, MapPin, Menu, Search, X } from "lucide-react";
import { useState } from "react";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <div className="top-strip">
        <div className="top-strip-content">
          <p>Creating Happiness Since 1944</p>

          <div className="top-strip-links">
            <a href="#">Gold Rate</a>
            <a href="#">Silver Rate</a>
            <a href="#">Showrooms</a>
          </div>
        </div>
      </div>

      <header className="main-navbar">
        <div className="navbar-container">
          <Link to="/" className="brand-logo">
            <div className="brand-mark">M</div>

            <div>
              <h2>Muliya</h2>
              <p>Gold & Diamonds</p>
            </div>
          </Link>

          <nav className={menuOpen ? "nav-menu active" : "nav-menu"}>
            <NavLink to="/" onClick={() => setMenuOpen(false)}>
              Home
            </NavLink>

            <NavLink to="/gold" onClick={() => setMenuOpen(false)}>
              Gold
            </NavLink>

            <NavLink to="/diamond" onClick={() => setMenuOpen(false)}>
              Diamond
            </NavLink>

            <NavLink to="/silver" onClick={() => setMenuOpen(false)}>
              Silver
            </NavLink>

            <a href="#collections" onClick={() => setMenuOpen(false)}>
              Collections
            </a>

            <a href="#stores" onClick={() => setMenuOpen(false)}>
              Showrooms
            </a>
          </nav>

          <div className="navbar-actions">
            <button className="navbar-search">
              <Search size={18} />
              <span>Search</span>
            </button>

            <button className="navbar-icon-btn">
              <Camera size={19} />
            </button>

            <button className="navbar-icon-btn">
              <Heart size={19} />
            </button>

            <button className="navbar-icon-btn">
              <MapPin size={19} />
            </button>

            <button
              className="mobile-menu-btn"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>
    </>
  );
}

export default Navbar;