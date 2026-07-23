import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ChevronLeft,
  ChevronRight,
  Filter,
  LoaderCircle,
  RefreshCw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import {
  useSearchParams,
} from "react-router-dom";

import Navbar from "../components/Navbar";
import TrendingProducts from "../components/TrendingProducts";
import Footer from "../components/Footer";

import localProducts from "../data/products";

import {
  getProducts,
  searchProducts,
} from "../api/productApi";

const PRODUCTS_PER_PAGE = 8;

const initialFilterState = {
  category: "",
  type: "",
  purity: "",
  collection: "",
  branch: "",
  availability: "",
  sort: "newest",
};

const branchOptions = [
  {
    label: "Bengaluru",
    value: "Bengaluru",
  },
  {
    label: "Puttur",
    value: "Puttur",
  },
  {
    label: "Madikeri",
    value: "Madikeri",
  },
];

const sortOptions = [
  {
    label: "Newest First",
    value: "newest",
  },
  {
    label: "Oldest First",
    value: "oldest",
  },
  {
    label: "Price: Low to High",
    value: "price-asc",
  },
  {
    label: "Price: High to Low",
    value: "price-desc",
  },
  {
    label: "Name: A to Z",
    value: "name-asc",
  },
  {
    label: "Name: Z to A",
    value: "name-desc",
  },
];

const normalizeValue = (value) => {
  return String(value || "")
    .trim()
    .toLowerCase();
};

const getUniqueValues = (
  products,
  fieldName,
) => {
  return [
    ...new Set(
      products
        .map((product) => product?.[fieldName])
        .filter(Boolean),
    ),
  ].sort((firstValue, secondValue) =>
    String(firstValue).localeCompare(
      String(secondValue),
      undefined,
      {
        sensitivity: "base",
      },
    ),
  );
};

const productMatchesLocalSearch = (
  product,
  query,
  filters,
) => {
  const normalizedQuery = normalizeValue(query);

  const searchableFields = [
    product?.name,
    product?.code,
    product?.category,
    product?.type,
    product?.collection,
    product?.purity,
    product?.availability,
    product?.weight,
  ];

  const matchesQuery =
    !normalizedQuery ||
    searchableFields.some((field) =>
      normalizeValue(field).includes(
        normalizedQuery,
      ),
    );

  const matchesCategory =
    !filters.category ||
    normalizeValue(product?.category) ===
      normalizeValue(filters.category);

  const matchesType =
    !filters.type ||
    normalizeValue(product?.type) ===
      normalizeValue(filters.type);

  const matchesPurity =
    !filters.purity ||
    normalizeValue(product?.purity) ===
      normalizeValue(filters.purity);

  const matchesCollection =
    !filters.collection ||
    normalizeValue(product?.collection) ===
      normalizeValue(filters.collection);

  const matchesAvailability =
    !filters.availability ||
    normalizeValue(product?.availability) ===
      normalizeValue(filters.availability);

  let matchesBranch = true;

  if (filters.branch) {
    const selectedBranch =
      filters.branch === "Bangalore"
        ? "Bengaluru"
        : filters.branch;

    matchesBranch = Boolean(
      product?.branchAvailability?.[
        selectedBranch
      ],
    );
  }

  return (
    matchesQuery &&
    matchesCategory &&
    matchesType &&
    matchesPurity &&
    matchesCollection &&
    matchesAvailability &&
    matchesBranch
  );
};

const parsePriceValue = (value) => {
  const numericValue = String(value || "")
    .replace(/,/g, "")
    .match(/\d+(\.\d+)?/);

  if (!numericValue) {
    return 0;
  }

  return Number(numericValue[0]) || 0;
};

const sortLocalProducts = (
  products,
  sortOption,
) => {
  const sortedProducts = [...products];

  switch (sortOption) {
    case "oldest":
      return sortedProducts.sort(
        (firstProduct, secondProduct) =>
          new Date(
            firstProduct?.createdAt || 0,
          ).getTime() -
          new Date(
            secondProduct?.createdAt || 0,
          ).getTime(),
      );

    case "price-asc":
      return sortedProducts.sort(
        (firstProduct, secondProduct) =>
          parsePriceValue(
            firstProduct?.price,
          ) -
          parsePriceValue(
            secondProduct?.price,
          ),
      );

    case "price-desc":
      return sortedProducts.sort(
        (firstProduct, secondProduct) =>
          parsePriceValue(
            secondProduct?.price,
          ) -
          parsePriceValue(
            firstProduct?.price,
          ),
      );

    case "name-asc":
      return sortedProducts.sort(
        (firstProduct, secondProduct) =>
          String(
            firstProduct?.name || "",
          ).localeCompare(
            String(
              secondProduct?.name || "",
            ),
            undefined,
            {
              sensitivity: "base",
            },
          ),
      );

    case "name-desc":
      return sortedProducts.sort(
        (firstProduct, secondProduct) =>
          String(
            secondProduct?.name || "",
          ).localeCompare(
            String(
              firstProduct?.name || "",
            ),
            undefined,
            {
              sensitivity: "base",
            },
          ),
      );

    case "newest":
    default:
      return sortedProducts.sort(
        (firstProduct, secondProduct) =>
          new Date(
            secondProduct?.createdAt || 0,
          ).getTime() -
          new Date(
            firstProduct?.createdAt || 0,
          ).getTime(),
      );
  }
};

function SearchResults() {
  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  const query =
    searchParams.get("q") || "";

  const currentPage = Math.max(
    Number.parseInt(
      searchParams.get("page"),
      10,
    ) || 1,
    1,
  );

  const filters = useMemo(
    () => ({
      category:
        searchParams.get("category") || "",
      type:
        searchParams.get("type") || "",
      purity:
        searchParams.get("purity") || "",
      collection:
        searchParams.get("collection") || "",
      branch:
        searchParams.get("branch") || "",
      availability:
        searchParams.get(
          "availability",
        ) || "",
      sort:
        searchParams.get("sort") ||
        "newest",
    }),
    [searchParams],
  );

  const [products, setProducts] =
    useState([]);

  const [
    catalogueProducts,
    setCatalogueProducts,
  ] = useState([]);

  const [metadata, setMetadata] =
    useState({
      total: 0,
      count: 0,
      page: 1,
      limit: PRODUCTS_PER_PAGE,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    });

  const [loading, setLoading] =
    useState(true);

  const [
    optionsLoading,
    setOptionsLoading,
  ] = useState(true);

  const [error, setError] =
    useState("");

  const [
    usingFallback,
    setUsingFallback,
  ] = useState(false);

  const updateSearchParams = useCallback(
    (updates) => {
      const nextParams =
        new URLSearchParams(
          searchParams,
        );

      Object.entries(updates).forEach(
        ([key, value]) => {
          if (
            value === undefined ||
            value === null ||
            value === "" ||
            (key === "sort" &&
              value === "newest") ||
            (key === "page" &&
              Number(value) === 1)
          ) {
            nextParams.delete(key);
          } else {
            nextParams.set(
              key,
              String(value),
            );
          }
        },
      );

      setSearchParams(nextParams);
    },
    [
      searchParams,
      setSearchParams,
    ],
  );

  const loadCatalogueOptions =
    useCallback(async () => {
      try {
        setOptionsLoading(true);

        const allProducts =
          await getProducts();

        if (Array.isArray(allProducts)) {
          setCatalogueProducts(
            allProducts,
          );
        }
      } catch (requestError) {
        console.error(
          "Unable to load filter options:",
          requestError,
        );

        setCatalogueProducts(
          localProducts,
        );
      } finally {
        setOptionsLoading(false);
      }
    }, []);

  const loadSearchResults =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");
        setUsingFallback(false);

        const response =
          await searchProducts({
            q: query,
            category:
              filters.category,
            type:
              filters.type,
            purity:
              filters.purity,
            collection:
              filters.collection,
            branch:
              filters.branch,
            availability:
              filters.availability,
            sort:
              filters.sort,
            page: currentPage,
            limit:
              PRODUCTS_PER_PAGE,
          });

        setProducts(
          response.products,
        );

        setMetadata({
          total: response.total,
          count: response.count,
          page: response.page,
          limit:
            response.limit ||
            PRODUCTS_PER_PAGE,
          totalPages:
            response.totalPages,
          hasNextPage:
            response.hasNextPage,
          hasPreviousPage:
            response.hasPreviousPage,
        });

        if (
          response.totalPages > 0 &&
          currentPage >
            response.totalPages
        ) {
          updateSearchParams({
            page:
              response.totalPages,
          });
        }
      } catch (requestError) {
        console.error(
          "Unable to load search results:",
          requestError,
        );

        setError(
          requestError.message ||
            "Unable to load jewellery products.",
        );

        setUsingFallback(true);

        const locallyFiltered =
          localProducts.filter(
            (product) =>
              productMatchesLocalSearch(
                product,
                query,
                filters,
              ),
          );

        const locallySorted =
          sortLocalProducts(
            locallyFiltered,
            filters.sort,
          );

        const total =
          locallySorted.length;

        const totalPages =
          total > 0
            ? Math.ceil(
                total /
                  PRODUCTS_PER_PAGE,
              )
            : 0;

        const safePage =
          totalPages > 0
            ? Math.min(
                currentPage,
                totalPages,
              )
            : 1;

        const startIndex =
          (safePage - 1) *
          PRODUCTS_PER_PAGE;

        const paginatedProducts =
          locallySorted.slice(
            startIndex,
            startIndex +
              PRODUCTS_PER_PAGE,
          );

        setProducts(
          paginatedProducts,
        );

        setMetadata({
          total,
          count:
            paginatedProducts.length,
          page: safePage,
          limit:
            PRODUCTS_PER_PAGE,
          totalPages,
          hasNextPage:
            safePage < totalPages,
          hasPreviousPage:
            safePage > 1,
        });
      } finally {
        setLoading(false);
      }
    }, [
      currentPage,
      filters,
      query,
      updateSearchParams,
    ]);

  useEffect(() => {
    loadCatalogueOptions();
  }, [loadCatalogueOptions]);

  useEffect(() => {
    loadSearchResults();
  }, [loadSearchResults]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [
    currentPage,
    query,
    filters.category,
    filters.type,
    filters.purity,
    filters.collection,
    filters.branch,
    filters.availability,
    filters.sort,
  ]);

  const categoryOptions =
    useMemo(
      () =>
        getUniqueValues(
          catalogueProducts,
          "category",
        ),
      [catalogueProducts],
    );

  const typeOptions =
    useMemo(
      () =>
        getUniqueValues(
          catalogueProducts,
          "type",
        ),
      [catalogueProducts],
    );

  const purityOptions =
    useMemo(
      () =>
        getUniqueValues(
          catalogueProducts,
          "purity",
        ),
      [catalogueProducts],
    );

  const collectionOptions =
    useMemo(
      () =>
        getUniqueValues(
          catalogueProducts,
          "collection",
        ),
      [catalogueProducts],
    );

  const availabilityOptions =
    useMemo(
      () =>
        getUniqueValues(
          catalogueProducts,
          "availability",
        ),
      [catalogueProducts],
    );

  const hasActiveFilters =
    Boolean(
      filters.category ||
        filters.type ||
        filters.purity ||
        filters.collection ||
        filters.branch ||
        filters.availability ||
        filters.sort !== "newest",
    );

  const handleFilterChange = (
    event,
  ) => {
    const {
      name,
      value,
    } = event.target;

    updateSearchParams({
      [name]: value,
      page: 1,
    });
  };

  const clearFilters = () => {
    const nextParams =
      new URLSearchParams();

    if (query) {
      nextParams.set("q", query);
    }

    setSearchParams(nextParams);
  };

  const clearEverything = () => {
    setSearchParams(
      new URLSearchParams(),
    );
  };

  const goToPage = (pageNumber) => {
    const safePage = Math.max(
      1,
      Math.min(
        pageNumber,
        metadata.totalPages || 1,
      ),
    );

    updateSearchParams({
      page: safePage,
    });
  };

  const visiblePages =
    useMemo(() => {
      const totalPages =
        metadata.totalPages;

      if (totalPages <= 1) {
        return [];
      }

      const pageNumbers = [];
      const startPage =
        Math.max(
          1,
          metadata.page - 2,
        );

      const endPage =
        Math.min(
          totalPages,
          startPage + 4,
        );

      const adjustedStart =
        Math.max(
          1,
          endPage - 4,
        );

      for (
        let page =
          adjustedStart;
        page <= endPage;
        page += 1
      ) {
        pageNumbers.push(page);
      }

      return pageNumbers;
    }, [
      metadata.page,
      metadata.totalPages,
    ]);

  const resultStart =
    metadata.total > 0
      ? (metadata.page - 1) *
          metadata.limit +
        1
      : 0;

  const resultEnd =
    metadata.total > 0
      ? Math.min(
          resultStart +
            metadata.count -
            1,
          metadata.total,
        )
      : 0;

  return (
    <div className="search-results-page">
      <Navbar />

      <main>
        <section className="search-results-banner">
          <div className="container">
            <p className="section-eyebrow">
              Jewellery Search
            </p>

            <h1>
              {query
                ? `Results for “${query}”`
                : "Explore All Jewellery"}
            </h1>

            {!loading && (
              <p>
                {metadata.total > 0
                  ? `Showing ${resultStart}–${resultEnd} of ${metadata.total} jewellery items.`
                  : "No matching jewellery items found."}
              </p>
            )}

            {usingFallback && (
              <div className="search-fallback-message">
                <RefreshCw
                  size={15}
                  aria-hidden="true"
                />

                <span>
                  Backend unavailable.
                  Showing local demo
                  products.
                </span>
              </div>
            )}
          </div>
        </section>

        <section className="search-filter-section">
          <div className="container">
            <div className="search-filter-card">
              <div className="search-filter-header">
                <div>
                  <div className="search-filter-title-row">
                    <SlidersHorizontal
                      size={20}
                      aria-hidden="true"
                    />

                    <h2>
                      Filter Results
                    </h2>
                  </div>

                  <p>
                    Refine jewellery by
                    category, type,
                    purity, collection,
                    branch and
                    availability.
                  </p>
                </div>

                {hasActiveFilters && (
                  <button
                    type="button"
                    className="clear-filter-btn"
                    onClick={
                      clearFilters
                    }
                  >
                    <X
                      size={15}
                      aria-hidden="true"
                    />

                    Clear Filters
                  </button>
                )}
              </div>

              <div className="search-filter-grid">
                <label>
                  <span>Category</span>

                  <select
                    name="category"
                    value={
                      filters.category
                    }
                    onChange={
                      handleFilterChange
                    }
                    disabled={
                      loading ||
                      optionsLoading
                    }
                  >
                    <option value="">
                      All Categories
                    </option>

                    {categoryOptions.map(
                      (category) => (
                        <option
                          value={
                            category
                          }
                          key={
                            category
                          }
                        >
                          {category}
                        </option>
                      ),
                    )}
                  </select>
                </label>

                <label>
                  <span>Type</span>

                  <select
                    name="type"
                    value={
                      filters.type
                    }
                    onChange={
                      handleFilterChange
                    }
                    disabled={
                      loading ||
                      optionsLoading
                    }
                  >
                    <option value="">
                      All Types
                    </option>

                    {typeOptions.map(
                      (type) => (
                        <option
                          value={type}
                          key={type}
                        >
                          {type}
                        </option>
                      ),
                    )}
                  </select>
                </label>

                <label>
                  <span>Purity</span>

                  <select
                    name="purity"
                    value={
                      filters.purity
                    }
                    onChange={
                      handleFilterChange
                    }
                    disabled={
                      loading ||
                      optionsLoading
                    }
                  >
                    <option value="">
                      All Purity
                    </option>

                    {purityOptions.map(
                      (purity) => (
                        <option
                          value={
                            purity
                          }
                          key={
                            purity
                          }
                        >
                          {purity}
                        </option>
                      ),
                    )}
                  </select>
                </label>

                <label>
                  <span>
                    Collection
                  </span>

                  <select
                    name="collection"
                    value={
                      filters.collection
                    }
                    onChange={
                      handleFilterChange
                    }
                    disabled={
                      loading ||
                      optionsLoading
                    }
                  >
                    <option value="">
                      All Collections
                    </option>

                    {collectionOptions.map(
                      (collection) => (
                        <option
                          value={
                            collection
                          }
                          key={
                            collection
                          }
                        >
                          {collection}
                        </option>
                      ),
                    )}
                  </select>
                </label>

                <label>
                  <span>Branch</span>

                  <select
                    name="branch"
                    value={
                      filters.branch
                    }
                    onChange={
                      handleFilterChange
                    }
                    disabled={loading}
                  >
                    <option value="">
                      All Branches
                    </option>

                    {branchOptions.map(
                      (branch) => (
                        <option
                          value={
                            branch.value
                          }
                          key={
                            branch.value
                          }
                        >
                          {branch.label}
                        </option>
                      ),
                    )}
                  </select>
                </label>

                <label>
                  <span>
                    Availability
                  </span>

                  <select
                    name="availability"
                    value={
                      filters.availability
                    }
                    onChange={
                      handleFilterChange
                    }
                    disabled={
                      loading ||
                      optionsLoading
                    }
                  >
                    <option value="">
                      All Availability
                    </option>

                    {availabilityOptions.map(
                      (availability) => (
                        <option
                          value={
                            availability
                          }
                          key={
                            availability
                          }
                        >
                          {availability}
                        </option>
                      ),
                    )}
                  </select>
                </label>

                <label>
                  <span>Sort By</span>

                  <select
                    name="sort"
                    value={
                      filters.sort
                    }
                    onChange={
                      handleFilterChange
                    }
                    disabled={loading}
                  >
                    {sortOptions.map(
                      (option) => (
                        <option
                          value={
                            option.value
                          }
                          key={
                            option.value
                          }
                        >
                          {option.label}
                        </option>
                      ),
                    )}
                  </select>
                </label>
              </div>
            </div>
          </div>
        </section>

        {error &&
          usingFallback && (
            <section className="search-warning-section">
              <div className="container">
                <div className="search-warning-card">
                  <p>
                    {error}
                  </p>

                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={
                      loadSearchResults
                    }
                  >
                    <RefreshCw
                      size={16}
                      aria-hidden="true"
                    />

                    Retry Backend
                  </button>
                </div>
              </div>
            </section>
          )}

        {loading ? (
          <section className="search-loading-section">
            <div className="container">
              <div className="search-loading-card">
                <LoaderCircle
                  size={38}
                  className="loading-spinner"
                  aria-hidden="true"
                />

                <h2>
                  Searching Jewellery
                </h2>

                <p>
                  Retrieving matching
                  products from the
                  catalogue.
                </p>
              </div>
            </div>
          </section>
        ) : products.length > 0 ? (
          <>
            <TrendingProducts
              products={products}
              title="Matching Jewellery"
              subtitle="Products matching your search and selected filters."
              showViewAll={false}
            />

            {metadata.totalPages >
              1 && (
              <section className="search-pagination-section">
                <div className="container">
                  <nav
                    className="search-pagination"
                    aria-label="Search result pages"
                  >
                    <button
                      type="button"
                      className="pagination-arrow"
                      onClick={() =>
                        goToPage(
                          metadata.page -
                            1,
                        )
                      }
                      disabled={
                        !metadata.hasPreviousPage
                      }
                      aria-label="Previous page"
                    >
                      <ChevronLeft
                        size={18}
                        aria-hidden="true"
                      />

                      Previous
                    </button>

                    <div className="pagination-pages">
                      {visiblePages.map(
                        (pageNumber) => (
                          <button
                            type="button"
                            key={
                              pageNumber
                            }
                            className={
                              pageNumber ===
                              metadata.page
                                ? "pagination-page active"
                                : "pagination-page"
                            }
                            onClick={() =>
                              goToPage(
                                pageNumber,
                              )
                            }
                            aria-current={
                              pageNumber ===
                              metadata.page
                                ? "page"
                                : undefined
                            }
                          >
                            {pageNumber}
                          </button>
                        ),
                      )}
                    </div>

                    <button
                      type="button"
                      className="pagination-arrow"
                      onClick={() =>
                        goToPage(
                          metadata.page +
                            1,
                        )
                      }
                      disabled={
                        !metadata.hasNextPage
                      }
                      aria-label="Next page"
                    >
                      Next

                      <ChevronRight
                        size={18}
                        aria-hidden="true"
                      />
                    </button>
                  </nav>

                  <p className="pagination-summary">
                    Page {metadata.page} of{" "}
                    {metadata.totalPages}
                  </p>
                </div>
              </section>
            )}
          </>
        ) : (
          <section className="search-empty-section">
            <div className="container">
              <div className="search-empty-card">
                <div className="search-empty-icon">
                  <Search
                    size={34}
                    aria-hidden="true"
                  />
                </div>

                <p className="section-eyebrow">
                  No Results
                </p>

                <h2>
                  No jewellery matched
                  your search
                </h2>

                <p>
                  Try a different keyword,
                  remove one or more
                  filters, or browse the
                  complete jewellery
                  catalogue.
                </p>

                <div className="search-empty-suggestions">
                  <span>
                    Gold Necklace
                  </span>

                  <span>
                    Diamond Ring
                  </span>

                  <span>
                    Bridal Collection
                  </span>

                  <span>
                    Silver Jewellery
                  </span>
                </div>

                <div className="search-empty-actions">
                  {hasActiveFilters && (
                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={
                        clearFilters
                      }
                    >
                      <Filter
                        size={16}
                        aria-hidden="true"
                      />

                      Clear Filters
                    </button>
                  )}

                  <button
                    type="button"
                    className="primary-btn"
                    onClick={
                      clearEverything
                    }
                  >
                    View All Jewellery
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default SearchResults;