import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import Navbar from "../components/Navbar";
import TrendingProducts from "../components/TrendingProducts";
import Footer from "../components/Footer";

import products from "../data/products";

function SearchResults() {
  const [searchParams] = useSearchParams();

  const query = searchParams.get("q") || "";

  const [filters, setFilters] = useState({
    category: "",
    type: "",
    purity: "",
    collection: "",
  });

  const getUniqueValues = (fieldName) => {
    return [...new Set(products.map((product) => product[fieldName]))].filter(
      Boolean
    );
  };

  const categoryOptions = getUniqueValues("category");
  const typeOptions = getUniqueValues("type");
  const purityOptions = getUniqueValues("purity");
  const collectionOptions = getUniqueValues("collection");

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const searchValue = query.toLowerCase();

      const matchesSearch =
        !searchValue ||
        product.name.toLowerCase().includes(searchValue) ||
        product.code.toLowerCase().includes(searchValue) ||
        product.category.toLowerCase().includes(searchValue) ||
        product.type.toLowerCase().includes(searchValue) ||
        product.collection.toLowerCase().includes(searchValue) ||
        product.purity.toLowerCase().includes(searchValue);

      const matchesCategory =
        !filters.category || product.category === filters.category;

      const matchesType = !filters.type || product.type === filters.type;

      const matchesPurity =
        !filters.purity || product.purity === filters.purity;

      const matchesCollection =
        !filters.collection || product.collection === filters.collection;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesType &&
        matchesPurity &&
        matchesCollection
      );
    });
  }, [query, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    setFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: "",
      type: "",
      purity: "",
      collection: "",
    });
  };

  const hasActiveFilters =
    filters.category || filters.type || filters.purity || filters.collection;

  return (
    <div className="search-results-page">
      <Navbar />

      <main>
        <section className="search-results-banner">
          <div className="container">
            <p className="section-eyebrow">Search Results</p>

            <h1>{query ? `Results for “${query}”` : "All Jewellery"}</h1>

            <p>
              Found {filteredProducts.length} jewellery item
              {filteredProducts.length !== 1 ? "s" : ""}.
            </p>
          </div>
        </section>

        <section className="search-filter-section">
          <div className="container">
            <div className="search-filter-card">
              <div className="search-filter-header">
                <div>
                  <h2>Filter Results</h2>
                  <p>Refine products by category, type, purity, and collection.</p>
                </div>

                {hasActiveFilters && (
                  <button
                    type="button"
                    className="clear-filter-btn"
                    onClick={clearFilters}
                  >
                    Clear Filters
                  </button>
                )}
              </div>

              <div className="search-filter-grid">
                <select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                >
                  <option value="">All Categories</option>

                  {categoryOptions.map((category) => (
                    <option value={category} key={category}>
                      {category}
                    </option>
                  ))}
                </select>

                <select
                  name="type"
                  value={filters.type}
                  onChange={handleFilterChange}
                >
                  <option value="">All Types</option>

                  {typeOptions.map((type) => (
                    <option value={type} key={type}>
                      {type}
                    </option>
                  ))}
                </select>

                <select
                  name="purity"
                  value={filters.purity}
                  onChange={handleFilterChange}
                >
                  <option value="">All Purity</option>

                  {purityOptions.map((purity) => (
                    <option value={purity} key={purity}>
                      {purity}
                    </option>
                  ))}
                </select>

                <select
                  name="collection"
                  value={filters.collection}
                  onChange={handleFilterChange}
                >
                  <option value="">All Collections</option>

                  {collectionOptions.map((collection) => (
                    <option value={collection} key={collection}>
                      {collection}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>

        <TrendingProducts
          products={filteredProducts}
          title="Matching Jewellery"
          subtitle="Products matching your search keyword and selected filters."
          showViewAll={false}
        />
      </main>

      <Footer />
    </div>
  );
}

export default SearchResults;