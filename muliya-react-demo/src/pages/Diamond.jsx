import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import TrendingProducts from "../components/TrendingProducts";
import Footer from "../components/Footer";

import localProducts from "../data/products";
import { getProducts } from "../api/productApi";

function Diamond() {
  const [products, setProducts] = useState(localProducts);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const backendProducts = await getProducts();

        if (backendProducts.length > 0) {
          setProducts(backendProducts);
        }
      } catch (error) {
        console.log("Using local products fallback:", error.message);
      }
    };

    loadProducts();
  }, []);

  const diamondProducts = products.filter(
    (product) => product.category.toLowerCase() === "diamond"
  );

  return (
    <div className="category-page">
      <Navbar />

      <main>
        <section className="category-page-banner diamond-page-banner">
          <div className="category-page-banner-overlay">
            <div className="category-page-banner-content">
              <p className="category-page-eyebrow">Muliya Gold & Diamonds</p>

              <h1>Diamond Jewellery</h1>

              <p>
                Discover elegant diamond jewellery designed for celebrations,
                special occasions, gifting, and timeless everyday luxury.
              </p>
            </div>
          </div>
        </section>

        <section className="category-page-content">
          <div className="container">
            <div className="category-page-heading">
              <p className="section-eyebrow">Discover Brilliance</p>

              <h2>Diamond Jewellery</h2>

              <p>
                Browse our collection of diamond rings, earrings, pendants,
                necklaces, bracelets, and bridal jewellery designs.
              </p>
            </div>

            <TrendingProducts
              products={diamondProducts}
              title="Diamond Collection"
              subtitle="Explore our selection of elegant diamond jewellery designs."
              showViewAll={false}
            />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Diamond;