import Navbar from "../components/Navbar";
import TrendingProducts from "../components/TrendingProducts";
import Footer from "../components/Footer";

import products from "../data/products";

function Silver() {
  const silverProducts = products.filter(
    (product) => product.category.toLowerCase() === "silver"
  );

  return (
    <div className="category-page">
      <Navbar />

      <main>
        <section className="category-page-banner silver-page-banner">
          <div className="category-page-banner-overlay">
            <div className="category-page-banner-content">
              <p className="category-page-eyebrow">
                Muliya Gold & Diamonds
              </p>

              <h1>Silver Collection</h1>

              <p>
                Discover beautifully crafted silver jewellery, gifting
                collections, traditional articles, and elegant designs for
                every occasion.
              </p>
            </div>
          </div>
        </section>

        <section className="category-page-content">
          <div className="container">
            <div className="category-page-heading">
              <p className="section-eyebrow">Timeless Silver</p>

              <h2>Silver Jewellery & Articles</h2>

              <p>
                Browse silver bracelets, pooja collections, premium silverware,
                gifting articles, and contemporary silver designs.
              </p>
            </div>

            <TrendingProducts
              products={silverProducts}
              title="Silver Collection"
              subtitle="Explore our selection of silver jewellery and premium silver articles."
              showViewAll={false}
            />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Silver;