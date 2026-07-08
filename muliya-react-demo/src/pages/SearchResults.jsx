import { useSearchParams } from "react-router-dom";

import Navbar from "../components/Navbar";
import TrendingProducts from "../components/TrendingProducts";
import Footer from "../components/Footer";

import products from "../data/products";

function SearchResults() {
  const [searchParams] = useSearchParams();

  const query = searchParams.get("q") || "";

  const filteredProducts = products.filter((product) => {
    const searchValue = query.toLowerCase();

    return (
      product.name.toLowerCase().includes(searchValue) ||
      product.code.toLowerCase().includes(searchValue) ||
      product.category.toLowerCase().includes(searchValue) ||
      product.type.toLowerCase().includes(searchValue) ||
      product.collection.toLowerCase().includes(searchValue) ||
      product.purity.toLowerCase().includes(searchValue)
    );
  });

  return (
    <div className="search-results-page">
      <Navbar />

      <main>
        <section className="search-results-banner">
          <div className="container">
            <p className="section-eyebrow">Search Results</p>

            <h1>Results for “{query}”</h1>

            <p>
              Found {filteredProducts.length} jewellery item
              {filteredProducts.length !== 1 ? "s" : ""}.
            </p>
          </div>
        </section>

        <TrendingProducts
          products={filteredProducts}
          title="Matching Jewellery"
          subtitle="Products matching your search keyword."
          showViewAll={false}
        />
      </main>

      <Footer />
    </div>
  );
}

export default SearchResults;