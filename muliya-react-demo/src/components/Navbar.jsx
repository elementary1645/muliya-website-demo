import { Link, NavLink, useNavigate } from "react-router-dom";
import { Camera, Heart, MapPin, Menu, Search, X } from "lucide-react";
import { useState } from "react";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();

    if (!searchText.trim()) return;

    navigate(`/search?q=${encodeURIComponent(searchText.trim())}`);
    setSearchText("");
    setMenuOpen(false);
  };

  return (
    <>
      <div className="top-strip">
        <div className="top-strip-content">
          <p>Creating Happiness Since 1944</p>

          <div className="top-strip-links">
            <a href="#">Gold Rate</a>
            <a href="#">Silver Rate</a>
            <a href="#stores">Showrooms</a>
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

            <a href="/#collections">Collections</a>
            <a href="/#stores">Showrooms</a>
          </nav>

          <div className="navbar-actions">
            <form className="navbar-search-form" onSubmit={handleSearch}>
              <Search size={17} />

              <input
                type="text"
                placeholder="Search jewellery..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </form>

            <a href="/#ai-search" className="navbar-icon-btn">
              <Camera size={19} />
            </a>

            <button className="navbar-icon-btn">
              <Heart size={19} />
            </button>

            <a href="/#stores" className="navbar-icon-btn">
              <MapPin size={19} />
            </a>

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