import muliyaLogo from "../assets/Logo.svg";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  ArrowRight,
  CalendarDays,
  Camera,
  Heart,
  LoaderCircle,
  MapPin,
  Menu,
  Search,
  Scale,
  X,
} from "lucide-react";

import {
  getProductSuggestions,
} from "../api/productApi";

const readStoredItems = (key) => {
  try {
    const savedItems = JSON.parse(
      localStorage.getItem(key),
    );

    return Array.isArray(savedItems)
      ? savedItems
      : [];
  } catch {
    return [];
  }
};

const getProductId = (product) => {
  return product?._id || product?.id;
};

function Navbar() {
  const [menuOpen, setMenuOpen] =
    useState(false);

  const [searchText, setSearchText] =
    useState("");

  const [
    searchSuggestions,
    setSearchSuggestions,
  ] = useState([]);

  const [
    suggestionsOpen,
    setSuggestionsOpen,
  ] = useState(false);

  const [
    suggestionsLoading,
    setSuggestionsLoading,
  ] = useState(false);

  const [
    suggestionError,
    setSuggestionError,
  ] = useState("");

  const [
    activeSuggestionIndex,
    setActiveSuggestionIndex,
  ] = useState(-1);

  const [
    wishlistCount,
    setWishlistCount,
  ] = useState(0);

  const [
    compareCount,
    setCompareCount,
  ] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();

  const searchContainerRef = useRef(null);
  const requestIdRef = useRef(0);

  const updateSavedItemCounts = () => {
    setWishlistCount(
      readStoredItems(
        "muliyaWishlist",
      ).length,
    );

    setCompareCount(
      readStoredItems(
        "muliyaCompare",
      ).length,
    );
  };

  useEffect(() => {
    updateSavedItemCounts();

    window.addEventListener(
      "wishlistUpdated",
      updateSavedItemCounts,
    );

    window.addEventListener(
      "compareUpdated",
      updateSavedItemCounts,
    );

    window.addEventListener(
      "storage",
      updateSavedItemCounts,
    );

    return () => {
      window.removeEventListener(
        "wishlistUpdated",
        updateSavedItemCounts,
      );

      window.removeEventListener(
        "compareUpdated",
        updateSavedItemCounts,
      );

      window.removeEventListener(
        "storage",
        updateSavedItemCounts,
      );
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setSuggestionsOpen(false);
    setActiveSuggestionIndex(-1);
  }, [
    location.pathname,
    location.search,
  ]);

  useEffect(() => {
    const handleDocumentClick = (
      event,
    ) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(
          event.target,
        )
      ) {
        setSuggestionsOpen(false);
        setActiveSuggestionIndex(-1);
      }
    };

    document.addEventListener(
      "mousedown",
      handleDocumentClick,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleDocumentClick,
      );
    };
  }, []);

  useEffect(() => {
    const cleanedSearchText =
      searchText.trim();

    if (
      cleanedSearchText.length < 2
    ) {
      requestIdRef.current += 1;

      setSearchSuggestions([]);
      setSuggestionsLoading(false);
      setSuggestionError("");
      setActiveSuggestionIndex(-1);

      return undefined;
    }

    const requestId =
      requestIdRef.current + 1;

    requestIdRef.current = requestId;

    const debounceTimer =
      window.setTimeout(async () => {
        try {
          setSuggestionsLoading(true);
          setSuggestionError("");

          const suggestions =
            await getProductSuggestions(
              cleanedSearchText,
              6,
            );

          if (
            requestId !==
            requestIdRef.current
          ) {
            return;
          }

          setSearchSuggestions(
            suggestions,
          );

          setSuggestionsOpen(true);
          setActiveSuggestionIndex(-1);
        } catch (error) {
          if (
            requestId !==
            requestIdRef.current
          ) {
            return;
          }

          console.error(
            "Unable to load search suggestions:",
            error,
          );

          setSearchSuggestions([]);
          setSuggestionError(
            error.message ||
              "Unable to load suggestions.",
          );

          setSuggestionsOpen(true);
          setActiveSuggestionIndex(-1);
        } finally {
          if (
            requestId ===
            requestIdRef.current
          ) {
            setSuggestionsLoading(false);
          }
        }
      }, 250);

    return () => {
      window.clearTimeout(
        debounceTimer,
      );
    };
  }, [searchText]);

  const closeSearchSuggestions = () => {
    setSuggestionsOpen(false);
    setActiveSuggestionIndex(-1);
  };

  const handleSearch = (event) => {
    event.preventDefault();

    const cleanedSearchText =
      searchText.trim();

    if (!cleanedSearchText) {
      navigate("/products");

      closeSearchSuggestions();
      setMenuOpen(false);

      return;
    }

    navigate(
      `/search?q=${encodeURIComponent(
        cleanedSearchText,
      )}`,
    );

    setSearchText("");
    closeSearchSuggestions();
    setMenuOpen(false);
  };

  const openSuggestion = (
    product,
  ) => {
    const productId =
      getProductId(product);

    if (!productId) {
      return;
    }

    navigate(
      `/product/${productId}`,
    );

    setSearchText("");
    closeSearchSuggestions();
    setMenuOpen(false);
  };

  const openAllSearchResults = () => {
    const cleanedSearchText =
      searchText.trim();

    if (!cleanedSearchText) {
      return;
    }

    navigate(
      `/search?q=${encodeURIComponent(
        cleanedSearchText,
      )}`,
    );

    setSearchText("");
    closeSearchSuggestions();
    setMenuOpen(false);
  };

  const handleSearchKeyDown = (
    event,
  ) => {
    const hasSuggestions =
      searchSuggestions.length > 0;

    if (
      event.key === "ArrowDown"
    ) {
      if (
        !suggestionsOpen ||
        !hasSuggestions
      ) {
        return;
      }

      event.preventDefault();

      setActiveSuggestionIndex(
        (currentIndex) =>
          currentIndex >=
          searchSuggestions.length - 1
            ? 0
            : currentIndex + 1,
      );

      return;
    }

    if (
      event.key === "ArrowUp"
    ) {
      if (
        !suggestionsOpen ||
        !hasSuggestions
      ) {
        return;
      }

      event.preventDefault();

      setActiveSuggestionIndex(
        (currentIndex) =>
          currentIndex <= 0
            ? searchSuggestions.length - 1
            : currentIndex - 1,
      );

      return;
    }

    if (event.key === "Enter") {
      if (
        suggestionsOpen &&
        activeSuggestionIndex >= 0 &&
        searchSuggestions[
          activeSuggestionIndex
        ]
      ) {
        event.preventDefault();

        openSuggestion(
          searchSuggestions[
            activeSuggestionIndex
          ],
        );
      }

      return;
    }

    if (event.key === "Escape") {
      closeSearchSuggestions();
    }
  };

  const handleSearchFocus = () => {
    if (
      searchText.trim().length >= 2
    ) {
      setSuggestionsOpen(true);
    }
  };

  const clearSearch = () => {
    setSearchText("");
    setSearchSuggestions([]);
    setSuggestionError("");
    closeSearchSuggestions();
  };

  const navLinkClassName = ({
    isActive,
  }) =>
    isActive
      ? "active"
      : undefined;

  return (
    <>
      <div className="top-strip">
        <div className="top-strip-content">
          <p>
            Creating Happiness Since 1944
          </p>

          <div className="top-strip-links">
            <Link to="/gold-prediction">
              Gold Rate
            </Link>

            <Link to="/gold-buying-plans">
              Gold Buying Plans
            </Link>
            
            <Link to="/silver">
              Silver Jewellery
            </Link>

            <Link to="/showrooms">
              Showrooms
            </Link>
          </div>
        </div>
      </div>

      <header className="main-navbar">
        <div className="navbar-container">
          <Link
  to="/"
  className="brand-logo official-brand-logo"
  aria-label="Muliya Gold and Diamonds home"
>
  <img
    src={muliyaLogo}
    alt="Muliya Gold & Diamonds"
    className="official-navbar-logo"
  />
</Link>

          <nav
            id="main-navigation"
            className={
              menuOpen
                ? "nav-menu active"
                : "nav-menu"
            }
            aria-label="Main navigation"
          >
            <NavLink
              to="/"
              end
              className={
                navLinkClassName
              }
            >
              Home
            </NavLink>

            <NavLink
              to="/products"
              className={
                navLinkClassName
              }
            >
              Jewellery
            </NavLink>

            <NavLink
              to="/gold"
              className={
                navLinkClassName
              }
            >
              Gold
            </NavLink>

            <NavLink
              to="/diamond"
              className={
                navLinkClassName
              }
            >
              Diamond
            </NavLink>

            <NavLink
              to="/silver"
              className={
                navLinkClassName
              }
            >
              Silver
            </NavLink>

            <NavLink
              to="/collections"
              className={
                navLinkClassName
              }
            >
              Collections
            </NavLink>

            <NavLink
              to="/showrooms"
              className={
                navLinkClassName
              }
            >
              Showrooms
            </NavLink>

            <NavLink
              to="/appointment"
              className={
                navLinkClassName
              }
            >
              Appointment
            </NavLink>

            <NavLink
              to="/contact"
              className={
                navLinkClassName
              }
            >
              Contact
            </NavLink>
          </nav>

          <div className="navbar-actions">
            <div
              className="navbar-search-wrapper"
              ref={
                searchContainerRef
              }
            >
              <form
                className="navbar-search-form"
                role="search"
                onSubmit={
                  handleSearch
                }
              >
                <Search
                  size={17}
                  aria-hidden="true"
                />

                <input
                  type="search"
                  name="q"
                  aria-label="Search jewellery"
                  aria-expanded={
                    suggestionsOpen
                  }
                  aria-controls="navbar-search-suggestions"
                  aria-activedescendant={
                    activeSuggestionIndex >=
                    0
                      ? `navbar-search-suggestion-${activeSuggestionIndex}`
                      : undefined
                  }
                  placeholder="Search jewellery..."
                  value={searchText}
                  onChange={(event) =>
                    setSearchText(
                      event.target.value,
                    )
                  }
                  onFocus={
                    handleSearchFocus
                  }
                  onKeyDown={
                    handleSearchKeyDown
                  }
                  autoComplete="off"
                />

                {suggestionsLoading ? (
                  <LoaderCircle
                    size={16}
                    className="navbar-search-spinner"
                    aria-label="Loading suggestions"
                  />
                ) : searchText ? (
                  <button
                    type="button"
                    className="navbar-search-clear-btn"
                    onClick={
                      clearSearch
                    }
                    aria-label="Clear search"
                  >
                    <X
                      size={15}
                      aria-hidden="true"
                    />
                  </button>
                ) : null}
              </form>

              {suggestionsOpen && (
                <div
                  id="navbar-search-suggestions"
                  className="navbar-search-suggestions"
                  role="listbox"
                >
                  <div className="navbar-search-suggestions-header">
                    <span>
                      Search suggestions
                    </span>

                    {searchSuggestions.length >
                      0 && (
                      <small>
                        {
                          searchSuggestions.length
                        }{" "}
                        matches
                      </small>
                    )}
                  </div>

                  {suggestionsLoading && (
                    <div className="navbar-search-state">
                      <LoaderCircle
                        size={19}
                        className="navbar-search-spinner"
                        aria-hidden="true"
                      />

                      <span>
                        Searching jewellery...
                      </span>
                    </div>
                  )}

                  {!suggestionsLoading &&
                    suggestionError && (
                      <div className="navbar-search-state error">
                        <span>
                          {
                            suggestionError
                          }
                        </span>
                      </div>
                    )}

                  {!suggestionsLoading &&
                    !suggestionError &&
                    searchSuggestions.length ===
                      0 && (
                      <div className="navbar-search-state">
                        <Search
                          size={18}
                          aria-hidden="true"
                        />

                        <span>
                          No jewellery found
                          for “
                          {searchText.trim()}
                          ”.
                        </span>
                      </div>
                    )}

                  {!suggestionsLoading &&
                    !suggestionError &&
                    searchSuggestions.length >
                      0 && (
                      <div className="navbar-search-suggestion-list">
                        {searchSuggestions.map(
                          (
                            product,
                            index,
                          ) => {
                            const productId =
                              getProductId(
                                product,
                              );

                            return (
                              <button
                                id={`navbar-search-suggestion-${index}`}
                                type="button"
                                role="option"
                                aria-selected={
                                  activeSuggestionIndex ===
                                  index
                                }
                                key={
                                  productId ||
                                  product.code
                                }
                                className={
                                  activeSuggestionIndex ===
                                  index
                                    ? "navbar-search-suggestion active"
                                    : "navbar-search-suggestion"
                                }
                                onMouseEnter={() =>
                                  setActiveSuggestionIndex(
                                    index,
                                  )
                                }
                                onClick={() =>
                                  openSuggestion(
                                    product,
                                  )
                                }
                              >
                                <div className="navbar-search-suggestion-image">
                                  <img
                                    src={
                                      product.image
                                    }
                                    alt=""
                                  />
                                </div>

                                <div className="navbar-search-suggestion-content">
                                  <strong>
                                    {
                                      product.name
                                    }
                                  </strong>

                                  <span>
                                    {
                                      product.code
                                    }{" "}
                                    •{" "}
                                    {
                                      product.category
                                    }{" "}
                                    •{" "}
                                    {
                                      product.type
                                    }
                                  </span>

                                  <small>
                                    {
                                      product.price
                                    }
                                  </small>
                                </div>

                                <ArrowRight
                                  size={16}
                                  aria-hidden="true"
                                />
                              </button>
                            );
                          },
                        )}
                      </div>
                    )}

                  <button
                    type="button"
                    className="navbar-search-view-all"
                    onClick={
                      openAllSearchResults
                    }
                  >
                    <span>
                      View all results for “
                      {searchText.trim()}”
                    </span>

                    <ArrowRight
                      size={16}
                      aria-hidden="true"
                    />
                  </button>
                </div>
              )}
            </div>

            <Link
              to="/image-search"
              className="navbar-icon-btn"
              title="AI image search"
              aria-label="Open AI image search"
            >
              <Camera
                size={19}
                aria-hidden="true"
              />
            </Link>

            <Link
              to="/wishlist"
              className="navbar-icon-btn wishlist-navbar-button"
              title="Wishlist"
              aria-label={`Open wishlist. ${wishlistCount} saved items.`}
            >
              <Heart
                size={19}
                aria-hidden="true"
              />

              {wishlistCount > 0 && (
                <span
                  className="wishlist-count"
                  aria-hidden="true"
                >
                  {wishlistCount > 99
                    ? "99+"
                    : wishlistCount}
                </span>
              )}
            </Link>

            <Link
              to="/compare"
              className="navbar-icon-btn wishlist-navbar-button"
              title="Compare jewellery"
              aria-label={`Open comparison. ${compareCount} selected items.`}
            >
              <Scale
                size={19}
                aria-hidden="true"
              />

              {compareCount > 0 && (
                <span
                  className="wishlist-count"
                  aria-hidden="true"
                >
                  {compareCount > 99
                    ? "99+"
                    : compareCount}
                </span>
              )}
            </Link>

            <Link
              to="/showrooms"
              className="navbar-icon-btn"
              title="Showrooms"
              aria-label="View showrooms"
            >
              <MapPin
                size={19}
                aria-hidden="true"
              />
            </Link>

            <Link
              to="/appointment"
              className="navbar-icon-btn"
              title="Book an appointment"
              aria-label="Book an appointment"
            >
              <CalendarDays
                size={19}
                aria-hidden="true"
              />
            </Link>

            <button
              type="button"
              className="mobile-menu-btn"
              aria-label={
                menuOpen
                  ? "Close navigation menu"
                  : "Open navigation menu"
              }
              aria-expanded={
                menuOpen
              }
              aria-controls="main-navigation"
              onClick={() =>
                setMenuOpen(
                  (currentValue) =>
                    !currentValue,
                )
              }
            >
              {menuOpen ? (
                <X
                  size={24}
                  aria-hidden="true"
                />
              ) : (
                <Menu
                  size={24}
                  aria-hidden="true"
                />
              )}
            </button>
          </div>
        </div>
      </header>
    </>
  );
}

export default Navbar;