import { Link } from "react-router-dom";
import {
  ArrowRight,
  Camera,
  Eye,
  Heart,
  Scale,
} from "lucide-react";

import productsData from "../data/products";

function TrendingProducts({
  products,
  title = "Trending Jewellery",
  subtitle = "Discover jewellery designs customers are exploring right now.",
  showViewAll = true,
}) {
  const displayedProducts =
    products || productsData.filter((product) => product.trending).slice(0, 8);

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

                  <div className="product-card-badge">
                    {product.category}
                  </div>

                  <div className="product-card-actions">
                    <button title="Add to Wishlist">
                      <Heart size={18} />
                    </button>

                    <button title="Compare Jewellery">
                      <Scale size={18} />
                    </button>

                    <button title="Find Similar with AI">
                      <Camera size={18} />
                    </button>
                  </div>

                  <Link
                    to={`/product/${product.id}`}
                    className="quick-view-btn"
                  >
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