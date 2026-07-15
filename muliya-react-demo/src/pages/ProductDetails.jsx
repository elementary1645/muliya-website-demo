import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

import {
  Heart,
  Scale,
  Camera,
  MapPin,
  ArrowLeft,
  Share2,
  X,
  Send,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import TrendingProducts from "../components/TrendingProducts";
import AppointmentModal from "../components/AppointmentModal";

import {
  getProducts,
  getProductById,
} from "../api/productApi";

import { createEnquiry } from "../api/enquiryApi";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [wishlist, setWishlist] = useState([]);
  const [compare, setCompare] = useState([]);

  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [enquirySubmitting, setEnquirySubmitting] = useState(false);
  const [enquirySuccess, setEnquirySuccess] = useState(false);
  const [enquiryError, setEnquiryError] = useState("");

  const [showAppointmentModal, setShowAppointmentModal] =
    useState(false);

  const [enquiryForm, setEnquiryForm] = useState({
    name: "",
    email: "",
    phone: "",
    preferredBranch: "Bengaluru",
    message: "",
  });

  const getProductId = (item) => {
    return item?._id || item?.id;
  };

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const [backendProduct, backendProducts] = await Promise.all([
          getProductById(id),
          getProducts(),
        ]);

        setProduct(backendProduct);
        setAllProducts(backendProducts);
      } catch (requestError) {
        console.error("Unable to load product:", requestError);

        setError("Product not found.");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  useEffect(() => {
    const savedWishlist =
      JSON.parse(localStorage.getItem("muliyaWishlist")) || [];

    const savedCompare =
      JSON.parse(localStorage.getItem("muliyaCompare")) || [];

    setWishlist(savedWishlist);
    setCompare(savedCompare);
  }, []);

  useEffect(() => {
    if (!product) {
      return;
    }

    const currentProductId = getProductId(product);

    const savedRecentlyViewed =
      JSON.parse(localStorage.getItem("muliyaRecentlyViewed")) || [];

    const previousProducts = savedRecentlyViewed.filter(
      (item) => getProductId(item) !== currentProductId
    );

    setRecentlyViewed(previousProducts.slice(0, 4));

    const updatedRecentlyViewed = [
      product,
      ...previousProducts,
    ].slice(0, 6);

    localStorage.setItem(
      "muliyaRecentlyViewed",
      JSON.stringify(updatedRecentlyViewed)
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [product]);

  const isWishlisted = product
    ? wishlist.some(
        (item) => getProductId(item) === getProductId(product)
      )
    : false;

  const isCompared = product
    ? compare.some(
        (item) => getProductId(item) === getProductId(product)
      )
    : false;

  const toggleWishlist = () => {
    if (!product) {
      return;
    }

    const productId = getProductId(product);

    const updatedWishlist = isWishlisted
      ? wishlist.filter(
          (item) => getProductId(item) !== productId
        )
      : [...wishlist, product];

    setWishlist(updatedWishlist);

    localStorage.setItem(
      "muliyaWishlist",
      JSON.stringify(updatedWishlist)
    );

    window.dispatchEvent(new Event("wishlistUpdated"));
  };

  const toggleCompare = () => {
    if (!product) {
      return;
    }

    const productId = getProductId(product);

    let updatedCompare;

    if (isCompared) {
      updatedCompare = compare.filter(
        (item) => getProductId(item) !== productId
      );
    } else {
      if (compare.length >= 3) {
        alert("You can compare only 3 jewellery items at a time.");
        return;
      }

      updatedCompare = [...compare, product];
    }

    setCompare(updatedCompare);

    localStorage.setItem(
      "muliyaCompare",
      JSON.stringify(updatedCompare)
    );

    window.dispatchEvent(new Event("compareUpdated"));
  };

   const handleAISearch = () => {
  navigate("/image-search");
};

  const handleShare = async () => {
    if (!product) {
      return;
    }

    const shareData = {
      title: product.name,
      text: `View ${product.name} from Muliya Gold & Diamonds`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);

        alert("Product link copied to clipboard.");
      }
    } catch (shareError) {
      if (shareError.name !== "AbortError") {
        console.error("Unable to share product:", shareError);
      }
    }
  };

  const openDirections = () => {
    const branchAddresses = {
      Bengaluru:
        "Muliya Gold & Diamonds, Jayanagar, Bengaluru, Karnataka",
      Puttur:
        "Muliya Gold & Diamonds, Main Road, Puttur, Karnataka",
      Madikeri:
        "Muliya Gold & Diamonds, Madikeri Town, Karnataka",
    };

    const destination = encodeURIComponent(
      branchAddresses.Bengaluru
    );

    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${destination}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleEnquiryChange = (event) => {
    const { name, value } = event.target;

    setEnquiryForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));

    setEnquiryError("");
  };

  const openEnquiryModal = () => {
    setEnquiryError("");
    setEnquirySuccess(false);
    setShowEnquiryModal(true);
  };

  const closeEnquiryModal = () => {
    if (enquirySubmitting) {
      return;
    }

    setShowEnquiryModal(false);
    setEnquiryError("");
    setEnquirySuccess(false);
  };

  const handleEnquirySubmit = async (event) => {
    event.preventDefault();

    if (!product) {
      return;
    }

    try {
      setEnquirySubmitting(true);
      setEnquiryError("");

      await createEnquiry({
        name: enquiryForm.name.trim(),
        email: enquiryForm.email.trim(),
        phone: enquiryForm.phone.trim(),
        preferredBranch: enquiryForm.preferredBranch,
        message: enquiryForm.message.trim(),
        productId: getProductId(product),
      });

      setEnquirySuccess(true);

      setEnquiryForm({
        name: "",
        email: "",
        phone: "",
        preferredBranch: "Bengaluru",
        message: "",
      });
    } catch (requestError) {
      console.error("Unable to submit enquiry:", requestError);

      setEnquiryError(
        requestError.message || "Unable to submit enquiry."
      );
    } finally {
      setEnquirySubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="product-details-page">
        <Navbar />

        <main className="not-found-page">
          <h1>Loading Product...</h1>

          <p>
            Retrieving jewellery details from the database.
          </p>
        </main>

        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-details-page">
        <Navbar />

        <main className="not-found-page">
          <h1>Product Not Found</h1>

          <p>
            The jewellery item you are looking for does not exist.
          </p>

          <Link to="/" className="primary-btn">
            Back to Home
          </Link>
        </main>

        <Footer />
      </div>
    );
  }

  const currentProductId = getProductId(product);

  const similarProducts = allProducts
    .filter(
      (item) => getProductId(item) !== currentProductId
    )
    .map((item) => {
      let similarityScore = 0;

      if (item.category === product.category) {
        similarityScore += 3;
      }

      if (item.type === product.type) {
        similarityScore += 2;
      }

      if (item.collection === product.collection) {
        similarityScore += 2;
      }

      if (item.purity === product.purity) {
        similarityScore += 1;
      }

      return {
        ...item,
        similarityScore,
      };
    })
    .filter((item) => item.similarityScore > 0)
    .sort(
      (firstItem, secondItem) =>
        secondItem.similarityScore -
        firstItem.similarityScore
    )
    .slice(0, 4);

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
                <img
                  src={product.image}
                  alt={product.name}
                />

                <button
                  type="button"
                  className="ai-similar-btn"
                  onClick={handleAISearch}
                >
                  <Camera size={18} />

                  <span>
                    Find Similar Jewellery with AI
                  </span>
                </button>
              </div>

              <div className="product-details-info">
                <p className="product-category">
                  {product.category}
                </p>

                <h1>{product.name}</h1>

                <p className="product-code">
                  Jewellery Code: {product.code}
                </p>

                <p className="product-description">
                  A beautifully crafted jewellery design from
                  Muliya Gold & Diamonds, ideal for weddings,
                  festive occasions, gifting, and elegant everyday
                  wear.
                </p>

                <div className="product-price">
                  {product.price}
                </div>

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
                  <button
                    type="button"
                    className="primary-btn"
                    onClick={openEnquiryModal}
                  >
                    Enquire Now
                  </button>

                  <button
                    type="button"
                    className={
                      isWishlisted
                        ? "secondary-action-btn wishlist-details-btn active"
                        : "secondary-action-btn wishlist-details-btn"
                    }
                    onClick={toggleWishlist}
                  >
                    <Heart
                      size={18}
                      fill={
                        isWishlisted
                          ? "currentColor"
                          : "none"
                      }
                    />

                    {isWishlisted
                      ? "Remove from Wishlist"
                      : "Add to Wishlist"}
                  </button>

                  <button
                    type="button"
                    className={
                      isCompared
                        ? "secondary-action-btn compare-details-btn active"
                        : "secondary-action-btn compare-details-btn"
                    }
                    onClick={toggleCompare}
                  >
                    <Scale size={18} />

                    {isCompared
                      ? "Remove Compare"
                      : "Compare"}
                  </button>

                  <button
                    type="button"
                    className="secondary-action-btn share-product-btn"
                    onClick={handleShare}
                  >
                    <Share2 size={18} />
                    Share Product
                  </button>
                </div>

                <div className="branch-availability-card">
                  <div className="branch-availability-header">
                    <MapPin size={22} />

                    <div>
                      <h3>Branch Availability</h3>

                      <p>
                        Check where this jewellery design is
                        currently available.
                      </p>
                    </div>
                  </div>

                  <div className="branch-list">
                    {Object.entries(
                      product.branchAvailability || {}
                    ).map(([branch, available]) => (
                      <div
                        className="branch-row"
                        key={branch}
                      >
                        <span>{branch}</span>

                        <strong
                          className={
                            available
                              ? "available"
                              : "not-available"
                          }
                        >
                          {available
                            ? "Available"
                            : "Out of Stock"}
                        </strong>
                      </div>
                    ))}
                  </div>

                  <div className="branch-actions">
                    <button
                      type="button"
                      className="primary-btn"
                      onClick={() =>
                        setShowAppointmentModal(true)
                      }
                    >
                      Book Appointment
                    </button>

                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={openDirections}
                    >
                      Get Directions
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {similarProducts.length > 0 && (
          <TrendingProducts
            products={similarProducts}
            title="Similar Jewellery"
            subtitle="Explore related jewellery designs from the database."
            showViewAll={false}
          />
        )}

        {recentlyViewed.length > 0 && (
          <TrendingProducts
            products={recentlyViewed}
            title="Recently Viewed"
            subtitle="Continue exploring jewellery designs you viewed recently."
            showViewAll={false}
          />
        )}
      </main>

      {showEnquiryModal && (
        <div
          className="modal-overlay"
          onMouseDown={closeEnquiryModal}
        >
          <div
            className="enquiry-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <button
              type="button"
              className="modal-close-btn"
              onClick={closeEnquiryModal}
              aria-label="Close enquiry form"
              disabled={enquirySubmitting}
            >
              <X size={22} />
            </button>

            {!enquirySuccess ? (
              <>
                <p className="section-eyebrow">
                  Product Enquiry
                </p>

                <h2>Enquire Now</h2>

                <div className="modal-product-summary">
                  <img
                    src={product.image}
                    alt={product.name}
                  />

                  <div>
                    <h3>{product.name}</h3>
                    <p>{product.code}</p>
                    <strong>{product.price}</strong>
                  </div>
                </div>

                <form
                  className="enquiry-form"
                  onSubmit={handleEnquirySubmit}
                >
                  <div className="enquiry-form-field">
                    <label htmlFor="enquiry-name">
                      Name
                    </label>

                    <input
                      id="enquiry-name"
                      type="text"
                      name="name"
                      placeholder="Your full name"
                      value={enquiryForm.name}
                      onChange={handleEnquiryChange}
                      required
                    />
                  </div>

                  <div className="enquiry-form-field">
                    <label htmlFor="enquiry-email">
                      Email Address
                    </label>

                    <input
                      id="enquiry-email"
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      value={enquiryForm.email}
                      onChange={handleEnquiryChange}
                      required
                    />
                  </div>

                  <div className="enquiry-form-field">
                    <label htmlFor="enquiry-phone">
                      Phone Number
                    </label>

                    <input
                      id="enquiry-phone"
                      type="tel"
                      name="phone"
                      placeholder="Enter your phone number"
                      value={enquiryForm.phone}
                      onChange={handleEnquiryChange}
                      required
                    />
                  </div>

                  <div className="enquiry-form-field">
                    <label htmlFor="enquiry-branch">
                      Preferred Showroom
                    </label>

                    <select
                      id="enquiry-branch"
                      name="preferredBranch"
                      value={enquiryForm.preferredBranch}
                      onChange={handleEnquiryChange}
                      required
                    >
                      <option value="Bengaluru">
                        Bengaluru
                      </option>

                      <option value="Puttur">
                        Puttur
                      </option>

                      <option value="Madikeri">
                        Madikeri
                      </option>
                    </select>
                  </div>

                  <div className="enquiry-form-field">
                    <label htmlFor="enquiry-message">
                      Message
                    </label>

                    <textarea
                      id="enquiry-message"
                      name="message"
                      placeholder="Tell us what you would like to know"
                      value={enquiryForm.message}
                      onChange={handleEnquiryChange}
                      rows="4"
                    />
                  </div>

                  {enquiryError && (
                    <p className="enquiry-error-message">
                      {enquiryError}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="primary-btn enquiry-submit-btn"
                    disabled={enquirySubmitting}
                  >
                    <Send size={17} />

                    {enquirySubmitting
                      ? "Submitting..."
                      : "Submit Enquiry"}
                  </button>
                </form>
              </>
            ) : (
              <div className="enquiry-success">
                <h2>Enquiry Submitted</h2>

                <p>
                  Your enquiry has been saved successfully in
                  the database.
                </p>

                <button
                  type="button"
                  className="primary-btn"
                  onClick={closeEnquiryModal}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <AppointmentModal
        isOpen={showAppointmentModal}
        onClose={() => setShowAppointmentModal(false)}
        product={product}
        defaultBranch="Bengaluru"
      />

      <Footer />
    </div>
  );
}

export default ProductDetails;