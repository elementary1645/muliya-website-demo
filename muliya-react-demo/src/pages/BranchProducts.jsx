import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, Search } from "lucide-react";

import Navbar from "../components/Navbar";
import TrendingProducts from "../components/TrendingProducts";
import Footer from "../components/Footer";

import { getProducts } from "../api/productApi";

const supportedBranches = {
  bengaluru: "Bengaluru",
  puttur: "Puttur",
  madikeri: "Madikeri",
};

function BranchProducts() {
  const { branch } = useParams();

  const branchName = supportedBranches[branch?.toLowerCase()];

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchText, setSearchText] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const backendProducts = await getProducts();

        setProducts(backendProducts);
      } catch (requestError) {
        console.error(
          "Unable to load branch products:",
          requestError
        );

        setError(
          requestError.message ||
            "Unable to load branch availability."
        );
      } finally {
        setLoading(false);
      }
    };

    if (branchName) {
      loadProducts();
    } else {
      setLoading(false);
    }
  }, [branchName]);

  const branchProducts = useMemo(() => {
    if (!branchName) {
      return [];
    }

    const searchValue = searchText.trim().toLowerCase();

    return products.filter((product) => {
      const isAvailable =
        product.branchAvailability?.[branchName] === true;

      const matchesCategory =
        !category || product.category === category;

      const searchableFields = [
        product.name,
        product.code,
        product.category,
        product.type,
        product.collection,
        product.purity,
      ];

      const matchesSearch =
        !searchValue ||
        searchableFields.some((field) =>
          String(field || "")
            .toLowerCase()
            .includes(searchValue)
        );

      return (
        isAvailable &&
        matchesCategory &&
        matchesSearch
      );
    });
  }, [
    products,
    branchName,
    category,
    searchText,
  ]);

  const categories = useMemo(() => {
    if (!branchName) {
      return [];
    }

    return [
      ...new Set(
        products
          .filter(
            (product) =>
              product.branchAvailability?.[branchName] ===
              true
          )
          .map((product) => product.category)
          .filter(Boolean)
      ),
    ].sort();
  }, [products, branchName]);

  if (!branchName) {
    return (
      <div className="branch-products-page">
        <Navbar />

        <main className="not-found-page">
          <h1>Showroom Not Found</h1>

          <p>
            The selected showroom is not available.
          </p>

          <Link to="/#stores" className="primary-btn">
            View Showrooms
          </Link>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="branch-products-page">
      <Navbar />

      <main>
        <section className="branch-products-banner">
          <div className="container">
            <Link
              to="/#stores"
              className="back-link"
            >
              <ArrowLeft size={18} />
              Back to showrooms
            </Link>

            <div className="branch-products-heading">
              <div>
                <p className="section-eyebrow">
                  Showroom Availability
                </p>

                <h1>
                  Jewellery Available in {branchName}
                </h1>

                <p>
                  Explore jewellery designs currently
                  marked as available at our {branchName}{" "}
                  showroom.
                </p>
              </div>

              <div className="branch-location-badge">
                <MapPin size={20} />
                {branchName}
              </div>
            </div>
          </div>
        </section>

        <section className="branch-products-filter-section">
          <div className="container">
            <div className="branch-products-filter-card">
              <div className="branch-search-box">
                <Search size={18} />

                <input
                  type="text"
                  placeholder="Search available jewellery..."
                  value={searchText}
                  onChange={(event) =>
                    setSearchText(event.target.value)
                  }
                />
              </div>

              <select
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value)
                }
              >
                <option value="">
                  All Categories
                </option>

                {categories.map((item) => (
                  <option
                    value={item}
                    key={item}
                  >
                    {item}
                  </option>
                ))}
              </select>

              {(searchText || category) && (
                <button
                  type="button"
                  className="clear-filter-btn"
                  onClick={() => {
                    setSearchText("");
                    setCategory("");
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>

            {!loading && !error && (
              <p className="branch-products-count">
                {branchProducts.length} jewellery item
                {branchProducts.length !== 1 ? "s" : ""}{" "}
                available in {branchName}.
              </p>
            )}
          </div>
        </section>

        {loading ? (
          <section className="branch-products-status">
            <div className="container">
              <h2>Loading Availability...</h2>

              <p>
                Retrieving jewellery stock from the
                database.
              </p>
            </div>
          </section>
        ) : error ? (
          <section className="branch-products-status">
            <div className="container">
              <h2>Unable to Load Products</h2>

              <p>{error}</p>
            </div>
          </section>
        ) : (
          <TrendingProducts
            products={branchProducts}
            title={`${branchName} Showroom Collection`}
            subtitle={`Jewellery designs currently marked as available at the ${branchName} showroom.`}
            showViewAll={false}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}

export default BranchProducts;