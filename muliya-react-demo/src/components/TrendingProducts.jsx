import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Camera, Eye, Heart, Scale } from "lucide-react";
import { useEffect, useState } from "react";

import productsData from "../data/products";

function TrendingProducts({
  products,
  title = "Trending Jewellery",
  subtitle = "Discover jewellery designs customers are exploring right now.",
  showViewAll = true,
}) {
  const navigate = useNavigate();

  const [wishlist, setWishlist] = useState([]);
  const [compare, setCompare] = useState([]);

  const displayedProducts =
    products ||
    productsData.filter((product) => product.trending).slice(0, 8);

  useEffect(() => {
    setWishlist(
      JSON.parse(localStorage.getItem("muliyaWishlist")) || []
    );

    setCompare(
      JSON.parse(localStorage.getItem("muliyaCompare")) || []
    );
  }, []);

  const getProductId = (product) => {
    return product?._id || product?.id;
  };

  const isWishlisted = (product) => {
    const productId = getProductId(product);

    return wishlist.some(
      (item) => getProductId(item) === productId
    );
  };

  const isCompared = (product) => {
    const productId = getProductId(product);

    return compare.some(
      (item) => getProductId(item) === productId
    );
  };

  const toggleWishlist = (product) => {
    const productId = getProductId(product);

    const updatedWishlist = isWishlisted(product)
      ? wishlist.filter(
          (item) => getProductId(item) !== productId
        )
      : [...wishlist, product];

    setWishlist(updatedWishlist);

    localStorage.setItem(
      "muliyaWishlist",
      JSON.stringify(updatedWishlist)
    );

    window.dispatchEvent(new Event("wishlistUpdated"));
  };

  const toggleCompare = (product) => {
    const productId = getProductId(product);

    let updatedCompare;

    if (isCompared(product)) {
      updatedCompare = compare.filter(
        (item) => getProductId(item) !== productId
      );
    } else {
      if (compare.length >= 3) {
        alert("You can compare only 3 jewellery items at a time.");
        return;
      }

      updatedCompare = [...compare, product];
    }

    setCompare(updatedCompare);

    localStorage.setItem(
      "muliyaCompare",
      JSON.stringify(updatedCompare)
    );

    window.dispatchEvent(new Event("compareUpdated"));
  };

  const handleAIButton = () => {
    navigate("/#ai-search");
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
            {displayedProducts.map((product) => {
              const productId = getProductId(product);

              return (
                <article
                  className="product-card"
                  key={productId}
                >
                  <div className="product-card-image">
                    <img
                      src={product.image}
                      alt={product.name}
                    />

                    <div className="product-card-badge">
                      {product.category}
                    </div>

                    <div className="product-card-actions">
                      <button
                        type="button"
                        title={
                          isWishlisted(product)
                            ? "Remove from Wishlist"
                            : "Add to Wishlist"
                        }
                        className={
                          isWishlisted(product)
                            ? "wishlist-button active"
                            : "wishlist-button"
                        }
                        onClick={() => toggleWishlist(product)}
                      >
                        <Heart
                          size={18}
                          fill={
                            isWishlisted(product)
                              ? "currentColor"
                              : "none"
                          }
                        />
                      </button>

                      <button
                        type="button"
                        title={
                          isCompared(product)
                            ? "Remove from Compare"
                            : "Compare Jewellery"
                        }
                        className={
                          isCompared(product)
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
                        onClick={handleAIButton}
                      >
                        <Camera size={18} />
                      </button>
                    </div>

                    <Link
                      to={`/product/${productId}`}
                      className="quick-view-btn"
                    >
                      <Eye size={17} />
                      View Details
                    </Link>
                  </div>

                  <div className="product-card-content">
                    <p className="product-card-code">
                      {product.code}
                    </p>

                    <Link to={`/product/${productId}`}>
                      <h3>{product.name}</h3>
                    </Link>

                    <div className="product-card-meta">
                      <span>{product.collection}</span>
                      <span>{product.purity}</span>
                    </div>

                    <div className="product-card-bottom">
                      <strong>{product.price}</strong>

                      <Link
                        to={`/product/${productId}`}
                        className="product-arrow-link"
                        aria-label={`View ${product.name}`}
                      >
                        <ArrowRight size={18} />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="empty-products">
            <h3>No jewellery found</h3>

            <p>
              No products are currently available in this category.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default TrendingProducts;