import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import Navbar from "../components/Navbar";
import TrendingProducts from "../components/TrendingProducts";
import Footer from "../components/Footer";

import localProducts from "../data/products";
import { getProducts } from "../api/productApi";

function SearchResults() {
  const [searchParams] = useSearchParams();

  const query = searchParams.get("q") || "";

  const [products, setProducts] = useState(localProducts);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  const [filters, setFilters] = useState({
    category: "",
    type: "",
    purity: "",
    collection: "",
  });

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setUsingFallback(false);

        const backendProducts = await getProducts();

        if (Array.isArray(backendProducts)) {
          setProducts(backendProducts);
        }
      } catch (error) {
        console.error("Unable to load products from backend:", error);

        setProducts(localProducts);
        setUsingFallback(true);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  useEffect(() => {
    setFilters({
      category: "",
      type: "",
      purity: "",
      collection: "",
    });
  }, [query]);

  const getUniqueValues = (fieldName) => {
    return [
      ...new Set(
        products
          .map((product) => product[fieldName])
          .filter(Boolean)
      ),
    ].sort((firstValue, secondValue) =>
      firstValue.localeCompare(secondValue)
    );
  };

  const categoryOptions = useMemo(
    () => getUniqueValues("category"),
    [products]
  );

  const typeOptions = useMemo(
    () => getUniqueValues("type"),
    [products]
  );

  const purityOptions = useMemo(
    () => getUniqueValues("purity"),
    [products]
  );

  const collectionOptions = useMemo(
    () => getUniqueValues("collection"),
    [products]
  );

  const filteredProducts = useMemo(() => {
    const searchValue = query.trim().toLowerCase();

    const categoryKeywords = ["gold", "diamond", "silver"];

    return products.filter((product) => {
      const productCategory = String(product.category || "").toLowerCase();

      let matchesSearch = true;

      if (searchValue) {
        if (categoryKeywords.includes(searchValue)) {
          matchesSearch = productCategory === searchValue;
        } else {
          const searchableFields = [
            product.name,
            product.code,
            product.category,
            product.type,
            product.collection,
            product.purity,
          ];

          matchesSearch = searchableFields.some((field) =>
            String(field || "")
              .toLowerCase()
              .includes(searchValue)
          );
        }
      }

      const matchesCategory =
        !filters.category ||
        product.category === filters.category;

      const matchesType =
        !filters.type ||
        product.type === filters.type;

      const matchesPurity =
        !filters.purity ||
        product.purity === filters.purity;

      const matchesCollection =
        !filters.collection ||
        product.collection === filters.collection;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesType &&
        matchesPurity &&
        matchesCollection
      );
    });
  }, [products, query, filters]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

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

  const hasActiveFilters = Boolean(
    filters.category ||
      filters.type ||
      filters.purity ||
      filters.collection
  );

  return (
    <div className="search-results-page">
      <Navbar />

      <main>
        <section className="search-results-banner">
          <div className="container">
            <p className="section-eyebrow">
              Search Results
            </p>

            <h1>
              {query
                ? `Results for “${query}”`
                : "All Jewellery"}
            </h1>

            {!loading && (
              <p>
                Found {filteredProducts.length} jewellery item
                {filteredProducts.length !== 1 ? "s" : ""}.
              </p>
            )}

            {usingFallback && (
              <p className="search-fallback-message">
                Backend unavailable. Showing local demo products.
              </p>
            )}
          </div>
        </section>

        <section className="search-filter-section">
          <div className="container">
            <div className="search-filter-card">
              <div className="search-filter-header">
                <div>
                  <h2>Filter Results</h2>

                  <p>
                    Refine products by category, type, purity,
                    and collection.
                  </p>
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
                  disabled={loading}
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
                  disabled={loading}
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
                  disabled={loading}
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
                  disabled={loading}
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

        {loading ? (
          <section className="search-loading-section">
            <div className="container">
              <div className="search-loading-card">
                <h2>Loading Jewellery...</h2>

                <p>
                  Retrieving products from the online database.
                </p>
              </div>
            </div>
          </section>
        ) : (
          <TrendingProducts
            products={filteredProducts}
            title="Matching Jewellery"
            subtitle="Products matching your search keyword and selected filters."
            showViewAll={false}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}

export default SearchResults;