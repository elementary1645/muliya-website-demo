import { useParams, Link } from "react-router-dom";
import { Heart, Scale, Camera, MapPin, ArrowLeft } from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import products from "../data/products";

function ProductDetails() {
  const { id } = useParams();

  const product = products.find((item) => item.id === Number(id));

  if (!product) {
    return (
      <div className="product-details-page">
        <Navbar />

        <main className="not-found-page">
          <h1>Product Not Found</h1>
          <p>The jewellery item you are looking for does not exist.</p>
          <Link to="/" className="primary-btn">
            Back to Home
          </Link>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="product-details-page">
      <Navbar />

      <main>
        <section className="product-details-section">
          <div className="container">
            <Link to="/" className="back-link">
              <ArrowLeft size={18} />
              Back to collections
            </Link>

            <div className="product-details-layout">
              <div className="product-details-image">
                <img src={product.image} alt={product.name} />

                <button className="ai-similar-btn">
                  <Camera size={18} />
                  Find Similar with AI
                </button>
              </div>

              <div className="product-details-info">
                <p className="product-category">{product.category}</p>

                <h1>{product.name}</h1>

                <p className="product-code">Jewellery Code: {product.code}</p>

                <p className="product-description">
                  A beautifully crafted jewellery design from Muliya Gold &
                  Diamonds, ideal for weddings, festive occasions, gifting, and
                  elegant everyday wear.
                </p>

                <div className="product-price">{product.price}</div>

                <div className="product-specs">
                  <div>
                    <span>Collection</span>
                    <strong>{product.collection}</strong>
                  </div>

                  <div>
                    <span>Weight</span>
                    <strong>{product.weight}</strong>
                  </div>

                  <div>
                    <span>Purity</span>
                    <strong>{product.purity}</strong>
                  </div>

                  <div>
                    <span>Availability</span>
                    <strong>{product.availability}</strong>
                  </div>
                </div>

                <div className="product-actions">
                  <button className="primary-btn">
                    Enquire Now
                  </button>

                  <button className="secondary-action-btn">
                    <Heart size={18} />
                    Wishlist
                  </button>

                  <button className="secondary-action-btn">
                    <Scale size={18} />
                    Compare
                  </button>
                </div>

                <div className="store-check-card">
                  <div>
                    <MapPin size={22} />
                  </div>

                  <div>
                    <h3>Check Branch Availability</h3>
                    <p>
                      View whether this design is available in Bangalore,
                      Puttur, Madikeri, or other Muliya showrooms.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default ProductDetails;