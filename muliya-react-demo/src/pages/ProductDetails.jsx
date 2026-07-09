import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

import {
  Heart,
  Scale,
  Camera,
  MapPin,
  ArrowLeft,
  X,
  CalendarDays,
  Clock,
  Share2,
  Check,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import TrendingProducts from "../components/TrendingProducts";

import products from "../data/products";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const product = products.find((item) => item.id === Number(id));

  const [wishlist, setWishlist] = useState([]);
  const [compare, setCompare] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  const [linkCopied, setLinkCopied] = useState(false);

  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [enquirySuccess, setEnquirySuccess] = useState(false);

  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [appointmentSuccess, setAppointmentSuccess] = useState(false);

  const [selectedImage, setSelectedImage] = useState("");
  const [showZoomModal, setShowZoomModal] = useState(false);

  const [enquiryForm, setEnquiryForm] = useState({
    name: "",
    phone: "",
    email: "",
    branch: "Bengaluru",
    message: "",
  });

  const [appointmentForm, setAppointmentForm] = useState({
    name: "",
    phone: "",
    email: "",
    branch: "Bengaluru",
    date: "",
    time: "",
    message: "",
  });

  useEffect(() => {
    setWishlist(JSON.parse(localStorage.getItem("muliyaWishlist")) || []);
    setCompare(JSON.parse(localStorage.getItem("muliyaCompare")) || []);
  }, []);

  useEffect(() => {
    if (!product) return;

    const productImages = product.images || [product.image];

    setSelectedImage(productImages[0]);
    setShowZoomModal(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [product]);

  useEffect(() => {
    if (!product) return;

    const savedRecentlyViewed =
      JSON.parse(localStorage.getItem("muliyaRecentlyViewed")) || [];

    const previousProducts = savedRecentlyViewed.filter(
      (item) => item.id !== product.id
    );

    setRecentlyViewed(previousProducts.slice(0, 6));

    const updatedRecentlyViewed = [product, ...previousProducts].slice(0, 6);

    localStorage.setItem(
      "muliyaRecentlyViewed",
      JSON.stringify(updatedRecentlyViewed)
    );
  }, [product]);

  const isWishlisted = product
    ? wishlist.some((item) => item.id === product.id)
    : false;

  const isCompared = product
    ? compare.some((item) => item.id === product.id)
    : false;

  const getSimilarProducts = () => {
    if (!product) return [];

    const otherProducts = products.filter((item) => item.id !== product.id);

    return otherProducts
      .map((item) => {
        let score = 0;

        if (item.category === product.category) score += 3;
        if (item.type === product.type) score += 2;
        if (item.collection === product.collection) score += 2;
        if (item.purity === product.purity) score += 1;

        return {
          ...item,
          similarityScore: score,
        };
      })
      .filter((item) => item.similarityScore > 0)
      .sort(
        (firstProduct, secondProduct) =>
          secondProduct.similarityScore - firstProduct.similarityScore
      )
      .slice(0, 4);
  };

  const similarProducts = getSimilarProducts();

  const getTodayDate = () => {
    const today = new Date();
    const timezoneOffset = today.getTimezoneOffset() * 60000;

    return new Date(today.getTime() - timezoneOffset)
      .toISOString()
      .split("T")[0];
  };

  const openDirections = () => {
    const selectedBranch = appointmentForm.branch || "Bengaluru";

    const branchAddresses = {
      Bengaluru: "Muliya Gold & Diamonds, Jayanagar, Bengaluru, Karnataka",
      Puttur: "Muliya Gold & Diamonds, Main Road, Puttur, Karnataka",
      Madikeri: "Muliya Gold & Diamonds, Madikeri Town, Karnataka",
    };

    const destination = encodeURIComponent(
      branchAddresses[selectedBranch] || branchAddresses.Bengaluru
    );

    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${destination}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const toggleWishlist = () => {
    if (!product) return;

    const updatedWishlist = isWishlisted
      ? wishlist.filter((item) => item.id !== product.id)
      : [...wishlist, product];

    setWishlist(updatedWishlist);
    localStorage.setItem("muliyaWishlist", JSON.stringify(updatedWishlist));
    window.dispatchEvent(new Event("wishlistUpdated"));
  };

  const toggleCompare = () => {
    if (!product) return;

    let updatedCompare;

    if (isCompared) {
      updatedCompare = compare.filter((item) => item.id !== product.id);
    } else {
      if (compare.length >= 3) {
        alert("You can compare only 3 jewellery items at a time.");
        return;
      }

      updatedCompare = [...compare, product];
    }

    setCompare(updatedCompare);
    localStorage.setItem("muliyaCompare", JSON.stringify(updatedCompare));
    window.dispatchEvent(new Event("compareUpdated"));
  };

  const handleEnquiryChange = (e) => {
    const { name, value } = e.target;

    setEnquiryForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleEnquirySubmit = (e) => {
    e.preventDefault();

    const existingEnquiries =
      JSON.parse(localStorage.getItem("muliyaEnquiries")) || [];

    const newEnquiry = {
      id: Date.now(),
      productId: product.id,
      productName: product.name,
      productCode: product.code,
      productPrice: product.price,
      ...enquiryForm,
      submittedAt: new Date().toISOString(),
    };

    localStorage.setItem(
      "muliyaEnquiries",
      JSON.stringify([...existingEnquiries, newEnquiry])
    );

    setEnquirySuccess(true);

    setEnquiryForm({
      name: "",
      phone: "",
      email: "",
      branch: "Bengaluru",
      message: "",
    });
  };

  const closeEnquiryModal = () => {
    setShowEnquiryModal(false);
    setEnquirySuccess(false);
  };

  const handleAppointmentChange = (e) => {
    const { name, value } = e.target;

    setAppointmentForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleAppointmentSubmit = (e) => {
    e.preventDefault();

    const existingAppointments =
      JSON.parse(localStorage.getItem("muliyaAppointments")) || [];

    const newAppointment = {
      id: Date.now(),
      productId: product.id,
      productName: product.name,
      productCode: product.code,
      productImage: product.image,
      ...appointmentForm,
      status: "Pending",
      submittedAt: new Date().toISOString(),
    };

    localStorage.setItem(
      "muliyaAppointments",
      JSON.stringify([...existingAppointments, newAppointment])
    );

    setAppointmentSuccess(true);

    setAppointmentForm({
      name: "",
      phone: "",
      email: "",
      branch: "Bengaluru",
      date: "",
      time: "",
      message: "",
    });
  };

  const openAppointmentModal = () => {
    setAppointmentSuccess(false);
    setShowAppointmentModal(true);
  };

  const closeAppointmentModal = () => {
    setShowAppointmentModal(false);
    setAppointmentSuccess(false);
  };

  const handleShareProduct = async () => {
    if (!product) return;

    const productUrl = window.location.href;

    const shareData = {
      title: product.name,
      text: `Check out ${product.name} - Jewellery Code: ${product.code}`,
      url: productUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }

      await navigator.clipboard.writeText(productUrl);

      setLinkCopied(true);

      setTimeout(() => {
        setLinkCopied(false);
      }, 2000);
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Unable to share product:", error);
      }
    }
  };

  const handleAISearch = () => {
    navigate("/#ai-search");
  };

  if (!product) {
    return (
      <div className="product-details-page">
        <Navbar />

        <main className="not-found-page">
          <h1>Product Not Found</h1>
          <p>The jewellery item you are looking for does not exist.</p>

          <Link to="/" className="primary-btn">
            Back to Home
          </Link>
        </main>

        <Footer />
      </div>
    );
  }

  const productImages = product.images || [product.image];

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
              <div className="product-gallery">
                <div
                  className="product-main-image"
                  onClick={() => setShowZoomModal(true)}
                >
                  <img
                    src={selectedImage || product.image}
                    alt={product.name}
                  />

                  <span>Click to zoom</span>
                </div>

                <div className="product-thumbnails">
                  {productImages.map((image, index) => (
                    <button
                      type="button"
                      key={`${image}-${index}`}
                      className={
                        selectedImage === image
                          ? "product-thumbnail active"
                          : "product-thumbnail"
                      }
                      onClick={() => setSelectedImage(image)}
                    >
                      <img
                        src={image}
                        alt={`${product.name} view ${index + 1}`}
                      />
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  className="ai-similar-btn"
                  onClick={handleAISearch}
                >
                  <Camera size={18} />
                  <span>Find Similar with AI</span>
                </button>
              </div>

              <div className="product-details-info">
                <p className="product-category">{product.category}</p>

                <h1>{product.name}</h1>

                <p className="product-code">Jewellery Code: {product.code}</p>

                <p className="product-description">
                  A beautifully crafted jewellery design from Muliya Gold &
                  Diamonds, ideal for weddings, festive occasions, gifting, and
                  elegant everyday wear.
                </p>

                <div className="product-price">{product.price}</div>

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
                    onClick={() => setShowEnquiryModal(true)}
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
                      fill={isWishlisted ? "currentColor" : "none"}
                    />
                    {isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
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
                    {isCompared ? "Remove Compare" : "Compare"}
                  </button>

                  <button
                    type="button"
                    className={
                      linkCopied
                        ? "secondary-action-btn share-product-btn copied"
                        : "secondary-action-btn share-product-btn"
                    }
                    onClick={handleShareProduct}
                  >
                    {linkCopied ? <Check size={18} /> : <Share2 size={18} />}
                    {linkCopied ? "Link Copied" : "Share Product"}
                  </button>
                </div>

                <div className="branch-availability-card">
                  <div className="branch-availability-header">
                    <MapPin size={22} />

                    <div>
                      <h3>Branch Availability</h3>
                      <p>
                        Check where this jewellery design is currently
                        available.
                      </p>
                    </div>
                  </div>

                  <div className="branch-list">
                    {Object.entries(product.branchAvailability || {}).map(
                      ([branch, available]) => (
                        <div className="branch-row" key={branch}>
                          <span>{branch}</span>

                          <strong
                            className={
                              available ? "available" : "not-available"
                            }
                          >
                            {available ? "Available" : "Out of Stock"}
                          </strong>
                        </div>
                      )
                    )}
                  </div>

                  <div className="branch-actions">
                    <button
                      type="button"
                      className="primary-btn"
                      onClick={openAppointmentModal}
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
            subtitle="Explore related jewellery designs based on category, type, collection, and purity."
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
        <div className="modal-overlay">
          <div className="enquiry-modal">
            <button
              type="button"
              className="modal-close-btn"
              onClick={closeEnquiryModal}
              aria-label="Close enquiry modal"
            >
              <X size={22} />
            </button>

            {!enquirySuccess ? (
              <>
                <p className="section-eyebrow">Product Enquiry</p>
                <h2>Enquire Now</h2>

                <div className="modal-product-summary">
                  <img src={product.image} alt={product.name} />

                  <div>
                    <h3>{product.name}</h3>
                    <p>{product.code}</p>
                    <strong>{product.price}</strong>
                  </div>
                </div>

                <form className="enquiry-form" onSubmit={handleEnquirySubmit}>
                  <input
                    type="text"
                    name="name"
                    placeholder="Your Name"
                    value={enquiryForm.name}
                    onChange={handleEnquiryChange}
                    required
                  />

                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    value={enquiryForm.phone}
                    onChange={handleEnquiryChange}
                    required
                  />

                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={enquiryForm.email}
                    onChange={handleEnquiryChange}
                  />

                  <select
                    name="branch"
                    value={enquiryForm.branch}
                    onChange={handleEnquiryChange}
                  >
                    <option value="Bengaluru">Bengaluru</option>
                    <option value="Puttur">Puttur</option>
                    <option value="Madikeri">Madikeri</option>
                  </select>

                  <textarea
                    name="message"
                    placeholder="Message or enquiry details"
                    value={enquiryForm.message}
                    onChange={handleEnquiryChange}
                    rows="4"
                  />

                  <button type="submit" className="primary-btn">
                    Submit Enquiry
                  </button>
                </form>
              </>
            ) : (
              <div className="enquiry-success">
                <h2>Enquiry Submitted</h2>

                <p>
                  Thank you. Your enquiry has been saved successfully for this
                  demo.
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

      {showAppointmentModal && (
        <div className="modal-overlay">
          <div className="appointment-modal">
            <button
              type="button"
              className="modal-close-btn"
              onClick={closeAppointmentModal}
              aria-label="Close appointment modal"
            >
              <X size={22} />
            </button>

            {!appointmentSuccess ? (
              <>
                <p className="section-eyebrow">Showroom Visit</p>
                <h2>Book Appointment</h2>

                <p className="appointment-modal-description">
                  Select your preferred showroom, date, and time to request a
                  visit for this jewellery design.
                </p>

                <div className="modal-product-summary">
                  <img src={product.image} alt={product.name} />

                  <div>
                    <h3>{product.name}</h3>
                    <p>{product.code}</p>
                    <strong>{product.price}</strong>
                  </div>
                </div>

                <form
                  className="appointment-form"
                  onSubmit={handleAppointmentSubmit}
                >
                  <div className="appointment-form-row">
                    <div className="appointment-form-field">
                      <label htmlFor="appointment-name">Name</label>

                      <input
                        id="appointment-name"
                        type="text"
                        name="name"
                        placeholder="Your Name"
                        value={appointmentForm.name}
                        onChange={handleAppointmentChange}
                        required
                      />
                    </div>

                    <div className="appointment-form-field">
                      <label htmlFor="appointment-phone">Phone Number</label>

                      <input
                        id="appointment-phone"
                        type="tel"
                        name="phone"
                        placeholder="Phone Number"
                        value={appointmentForm.phone}
                        onChange={handleAppointmentChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="appointment-form-field">
                    <label htmlFor="appointment-email">Email Address</label>

                    <input
                      id="appointment-email"
                      type="email"
                      name="email"
                      placeholder="Email Address"
                      value={appointmentForm.email}
                      onChange={handleAppointmentChange}
                    />
                  </div>

                  <div className="appointment-form-field">
                    <label htmlFor="appointment-branch">Preferred Showroom</label>

                    <select
                      id="appointment-branch"
                      name="branch"
                      value={appointmentForm.branch}
                      onChange={handleAppointmentChange}
                      required
                    >
                      <option value="Bengaluru">Bengaluru</option>
                      <option value="Puttur">Puttur</option>
                      <option value="Madikeri">Madikeri</option>
                    </select>
                  </div>

                  <div className="appointment-form-row">
                    <div className="appointment-form-field">
                      <label htmlFor="appointment-date">
                        <CalendarDays size={16} />
                        Preferred Date
                      </label>

                      <input
                        id="appointment-date"
                        type="date"
                        name="date"
                        min={getTodayDate()}
                        value={appointmentForm.date}
                        onChange={handleAppointmentChange}
                        required
                      />
                    </div>

                    <div className="appointment-form-field">
                      <label htmlFor="appointment-time">
                        <Clock size={16} />
                        Preferred Time
                      </label>

                      <select
                        id="appointment-time"
                        name="time"
                        value={appointmentForm.time}
                        onChange={handleAppointmentChange}
                        required
                      >
                        <option value="">Select Time</option>
                        <option value="10:00 AM">10:00 AM</option>
                        <option value="11:00 AM">11:00 AM</option>
                        <option value="12:00 PM">12:00 PM</option>
                        <option value="2:00 PM">2:00 PM</option>
                        <option value="3:00 PM">3:00 PM</option>
                        <option value="4:00 PM">4:00 PM</option>
                        <option value="5:00 PM">5:00 PM</option>
                        <option value="6:00 PM">6:00 PM</option>
                      </select>
                    </div>
                  </div>

                  <div className="appointment-form-field">
                    <label htmlFor="appointment-message">
                      Message or Special Request
                    </label>

                    <textarea
                      id="appointment-message"
                      name="message"
                      placeholder="Add any special request or additional details"
                      value={appointmentForm.message}
                      onChange={handleAppointmentChange}
                      rows="4"
                    />
                  </div>

                  <button type="submit" className="primary-btn">
                    Request Appointment
                  </button>
                </form>
              </>
            ) : (
              <div className="appointment-success">
                <CalendarDays size={46} />

                <h2>Appointment Requested</h2>

                <p>
                  Your showroom appointment request has been saved successfully
                  for this demo.
                </p>

                <p className="appointment-success-note">
                  A production website would send this request to the backend
                  for showroom confirmation.
                </p>

                <button
                  type="button"
                  className="primary-btn"
                  onClick={closeAppointmentModal}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showZoomModal && (
        <div className="zoom-modal-overlay">
          <button
            type="button"
            className="zoom-close-btn"
            onClick={() => setShowZoomModal(false)}
            aria-label="Close image zoom"
          >
            <X size={26} />
          </button>

          <img
            src={selectedImage || product.image}
            alt={product.name}
            className="zoomed-product-image"
          />
        </div>
      )}

      <Footer />
    </div>
  );
}

export default ProductDetails;