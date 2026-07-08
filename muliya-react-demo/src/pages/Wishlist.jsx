import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import {
  ArrowLeft,
  Heart,
  Trash2,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    const savedWishlist =
      JSON.parse(localStorage.getItem("muliyaWishlist")) || [];

    setWishlist(savedWishlist);
  }, []);

  const removeFromWishlist = (productId) => {
    const updatedWishlist = wishlist.filter(
      (product) => product.id !== productId
    );

    setWishlist(updatedWishlist);

    localStorage.setItem(
      "muliyaWishlist",
      JSON.stringify(updatedWishlist)
    );

    window.dispatchEvent(new Event("wishlistUpdated"));
  };

  const clearWishlist = () => {
    setWishlist([]);

    localStorage.removeItem("muliyaWishlist");

    window.dispatchEvent(new Event("wishlistUpdated"));
  };

  return (
    <div className="wishlist-page">
      <Navbar />

      <main className="wishlist-main">
        <div className="container">
          <Link to="/" className="back-link">
            <ArrowLeft size={18} />
            Continue Shopping
          </Link>

          <div className="wishlist-page-header">
            <div>
              <p className="section-eyebrow">
                Saved Jewellery
              </p>

              <h1 className="section-title">
                My Wishlist
              </h1>

              <p className="section-description">
                Your saved jewellery designs are stored on this
                device for easy access.
              </p>
            </div>

            {wishlist.length > 0 && (
              <button
                type="button"
                className="clear-wishlist-btn"
                onClick={clearWishlist}
              >
                <Trash2 size={17} />
                Clear Wishlist
              </button>
            )}
          </div>

          {wishlist.length > 0 ? (
            <div className="wishlist-grid">
              {wishlist.map((product) => (
                <article
                  className="wishlist-card"
                  key={product.id}
                >
                  <Link
                    to={`/product/${product.id}`}
                    className="wishlist-card-image"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                    />
                  </Link>

                  <div className="wishlist-card-content">
                    <p className="product-card-code">
                      {product.code}
                    </p>

                    <Link to={`/product/${product.id}`}>
                      <h3>{product.name}</h3>
                    </Link>

                    <div className="wishlist-product-meta">
                      <span>{product.category}</span>
                      <span>{product.collection}</span>
                      <span>{product.purity}</span>
                    </div>

                    <strong className="wishlist-price">
                      {product.price}
                    </strong>

                    <div className="wishlist-card-actions">
                      <Link
                        to={`/product/${product.id}`}
                        className="primary-btn"
                      >
                        View Details
                      </Link>

                      <button
                        type="button"
                        className="remove-wishlist-btn"
                        onClick={() =>
                          removeFromWishlist(product.id)
                        }
                      >
                        <Trash2 size={17} />
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-wishlist">
              <div className="empty-wishlist-icon">
                <Heart size={38} />
              </div>

              <h2>Your Wishlist is Empty</h2>

              <p>
                Save jewellery designs you like and they will appear
                here.
              </p>

              <Link to="/" className="primary-btn">
                Explore Jewellery
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Wishlist;