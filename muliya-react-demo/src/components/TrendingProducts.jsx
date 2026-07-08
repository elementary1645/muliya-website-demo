import { Link } from "react-router-dom";
import {
  ArrowRight,
  Camera,
  Eye,
  Heart,
  Scale,
} from "lucide-react";

import { useEffect, useState } from "react";

import productsData from "../data/products";

function TrendingProducts({
  products,
  title = "Trending Jewellery",
  subtitle = "Discover jewellery designs customers are exploring right now.",
  showViewAll = true,
}) {
  const [wishlist, setWishlist] = useState([]);
  const [compare, setCompare] = useState([]);

  const displayedProducts =
    products || productsData.filter((product) => product.trending).slice(0, 8);

  useEffect(() => {
    const savedWishlist =
      JSON.parse(localStorage.getItem("muliyaWishlist")) || [];

    const savedCompare =
      JSON.parse(localStorage.getItem("muliyaCompare")) || [];

    setWishlist(savedWishlist);
    setCompare(savedCompare);
  }, []);

  const toggleWishlist = (product) => {
    const productExists = wishlist.some(
      (wishlistProduct) => wishlistProduct.id === product.id
    );

    const updatedWishlist = productExists
      ? wishlist.filter((wishlistProduct) => wishlistProduct.id !== product.id)
      : [...wishlist, product];

    setWishlist(updatedWishlist);
    localStorage.setItem("muliyaWishlist", JSON.stringify(updatedWishlist));
    window.dispatchEvent(new Event("wishlistUpdated"));
  };

  const toggleCompare = (product) => {
    const productExists = compare.some(
      (compareProduct) => compareProduct.id === product.id
    );

    let updatedCompare;

    if (productExists) {
      updatedCompare = compare.filter(
        (compareProduct) => compareProduct.id !== product.id
      );
    } else {
      if (compare.length >= 3) {
        alert("You can compare only 3 jewellery items at a time.");
        return;
      }

      updatedCompare = [...compare, product];
    }

    setCompare(updatedCompare);
    localStorage.setItem("muliyaCompare", JSON.stringify(updatedCompare));
    window.dispatchEvent(new Event("compareUpdated"));
  };

  const isWishlisted = (productId) => {
    return wishlist.some((product) => product.id === productId);
  };

  const isCompared = (productId) => {
    return compare.some((product) => product.id === productId);
  };

  const handleAIButton = (product) => {
    console.log("AI similarity search requested for:", product.name);

    const aiSection = document.getElementById("ai-search");

    if (aiSection) {
      aiSection.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.href = "/#ai-search";
    }
  };

  return (
    <section className="trending-products-section">
      <div className="container">
        <div className="products-section-header">
          <div>
            <p className="section-eyebrow">Discover Jewellery</p>
            <h2 className="section-title">{title}</h2>
            <p className="section-description">{subtitle}</p>
          </div>

          {showViewAll && (
            <Link to="/gold" className="view-all-link">
              View All Jewellery
              <ArrowRight size={17} />
            </Link>
          )}
        </div>

        {displayedProducts.length > 0 ? (
          <div className="products-grid">
            {displayedProducts.map((product) => (
              <article className="product-card" key={product.id}>
                <div className="product-card-image">
                  <img src={product.image} alt={product.name} />

                  <div className="product-card-badge">{product.category}</div>

                  <div className="product-card-actions">
                    <button
                      type="button"
                      title={
                        isWishlisted(product.id)
                          ? "Remove from Wishlist"
                          : "Add to Wishlist"
                      }
                      className={
                        isWishlisted(product.id)
                          ? "wishlist-button active"
                          : "wishlist-button"
                      }
                      onClick={() => toggleWishlist(product)}
                    >
                      <Heart
                        size={18}
                        fill={isWishlisted(product.id) ? "currentColor" : "none"}
                      />
                    </button>

                    <button
                      type="button"
                      title={
                        isCompared(product.id)
                          ? "Remove from Compare"
                          : "Compare Jewellery"
                      }
                      className={
                        isCompared(product.id)
                          ? "compare-button active"
                          : "compare-button"
                      }
                      onClick={() => toggleCompare(product)}
                    >
                      <Scale size={18} />
                    </button>

                    <button
                      type="button"
                      title="Find Similar with AI"
                      onClick={() => handleAIButton(product)}
                    >
                      <Camera size={18} />
                    </button>
                  </div>

                  <Link to={`/product/${product.id}`} className="quick-view-btn">
                    <Eye size={17} />
                    View Details
                  </Link>
                </div>

                <div className="product-card-content">
                  <p className="product-card-code">{product.code}</p>

                  <Link to={`/product/${product.id}`}>
                    <h3>{product.name}</h3>
                  </Link>

                  <div className="product-card-meta">
                    <span>{product.collection}</span>
                    <span>{product.purity}</span>
                  </div>

                  <div className="product-card-bottom">
                    <strong>{product.price}</strong>

                    <Link
                      to={`/product/${product.id}`}
                      className="product-arrow-link"
                      aria-label={`View ${product.name}`}
                    >
                      <ArrowRight size={18} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-products">
            <h3>No jewellery found</h3>
            <p>No products are currently available in this category.</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default TrendingProducts;