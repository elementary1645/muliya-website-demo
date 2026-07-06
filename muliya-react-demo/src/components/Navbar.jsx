import { Search, Camera, Heart, MapPin, Menu } from "lucide-react";

function Navbar({ searchText, setSearchText, openImageSearch }) {
  return (
    <>
      {/* Top Announcement Bar */}
      <div className="top-bar">
        <div className="top-bar-content">
          <span>✨ Welcome to Muliya Jewels</span>

          <div className="top-links">
            <a href="#">Stores</a>
            <a href="#">Collections</a>
            <a href="#">Contact</a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="navbar">
        <div className="logo">
          <img
            src="https://muliya.in/wp-content/uploads/2022/10/logo.png"
            alt="Muliya Jewels"
          />
        </div>

        <ul className="nav-links">
          <li><a href="#">Gold</a></li>
          <li><a href="#">Diamond</a></li>
          <li><a href="#">Silver</a></li>
          <li><a href="#">Collections</a></li>
          <li><a href="#">Gifting</a></li>
          <li><a href="#">Offers</a></li>
        </ul>

        <div className="search-container">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search by Jewellery Code..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        <div className="nav-icons">
          <button
            className="icon-btn"
            title="AI Image Search"
            onClick={openImageSearch}
          >
            <Camera size={20} />
          </button>

          <button className="icon-btn" title="Wishlist">
            <Heart size={20} />
          </button>

          <button className="icon-btn" title="Store Locator">
            <MapPin size={20} />
          </button>

          <button className="menu-btn">
            <Menu size={24} />
          </button>
        </div>
      </nav>
    </>
  );
}

export default Navbar;