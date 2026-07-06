import Navbar from "../components/Navbar";
import TrendingProducts from "../components/TrendingProducts";
import Footer from "../components/Footer";

import products from "../data/products";

function Gold() {
  const goldProducts = products.filter(
    (product) => product.category.toLowerCase() === "gold"
  );

  return (
    <div className="category-page">
      <Navbar />

      <main>
        <section className="category-page-banner gold-page-banner">
          <div className="category-page-banner-overlay">
            <div className="category-page-banner-content">
              <p className="category-page-eyebrow">
                Muliya Gold & Diamonds
              </p>

              <h1>Gold Jewellery</h1>

              <p>
                Discover timeless gold jewellery crafted for weddings,
                celebrations, gifting, and everyday elegance.
              </p>
            </div>
          </div>
        </section>

        <section className="category-page-content">
          <div className="container">
            <div className="category-page-heading">
              <p className="section-eyebrow">Explore Our Collection</p>

              <h2>Gold Jewellery</h2>

              <p>
                Browse our collection of necklaces, bangles, rings, earrings,
                harams, and traditional gold jewellery designs.
              </p>
            </div>

            <TrendingProducts
              products={goldProducts}
              title="Gold Collection"
              subtitle="Explore our selection of gold jewellery designs."
              showViewAll={false}
            />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Gold;