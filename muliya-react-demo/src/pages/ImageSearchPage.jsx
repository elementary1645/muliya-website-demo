import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  ImagePlus,
  LoaderCircle,
  MapPin,
  RefreshCw,
  Search,
  Upload,
  X,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const API_URL = "http://localhost:5000/api/image-search";

const allowedFileTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;

function ImageSearchPage() {
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const [results, setResults] = useState([]);
  const [searchMeta, setSearchMeta] = useState(null);

  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  const availableBranches = (product) => {
    return Object.entries(product.branchAvailability || {})
      .filter(([, available]) => available)
      .map(([branch]) => branch);
  };

  const unavailableBranches = (product) => {
    return Object.entries(product.branchAvailability || {})
      .filter(([, available]) => !available)
      .map(([branch]) => branch);
  };

  const hasResults = results.length > 0;

  const selectedFileSize = useMemo(() => {
    if (!selectedFile) {
      return "";
    }

    const sizeInMb = selectedFile.size / (1024 * 1024);

    return `${sizeInMb.toFixed(2)} MB`;
  }, [selectedFile]);

  const clearPreviewUrl = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  const resetSearch = () => {
    clearPreviewUrl();

    setSelectedFile(null);
    setPreviewUrl("");
    setResults([]);
    setSearchMeta(null);
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateFile = (file) => {
    if (!file) {
      return "Please select an image.";
    }

    if (!allowedFileTypes.includes(file.type)) {
      return "Unsupported file type. Upload JPEG, PNG, or WebP.";
    }

    if (file.size > MAX_FILE_SIZE) {
      return "The image is too large. Maximum file size is 10 MB.";
    }

    return "";
  };

  const chooseFile = (file) => {
    const validationError = validateFile(file);

    if (validationError) {
      setError(validationError);
      return;
    }

    clearPreviewUrl();

    const newPreviewUrl = URL.createObjectURL(file);

    setSelectedFile(file);
    setPreviewUrl(newPreviewUrl);
    setResults([]);
    setSearchMeta(null);
    setError("");
  };

  const handleFileInputChange = (event) => {
    const file = event.target.files?.[0];

    if (file) {
      chooseFile(file);
    }
  };

  const handleDragEnter = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (event.currentTarget === event.target) {
      setIsDragging(false);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];

    if (file) {
      chooseFile(file);
    }
  };

  const searchSimilarJewellery = async () => {
    if (!selectedFile) {
      setError("Please upload a jewellery image first.");
      return;
    }

    try {
      setSearching(true);
      setError("");
      setResults([]);
      setSearchMeta(null);

      const formData = new FormData();
      formData.append("image", selectedFile);

      const response = await fetch(`${API_URL}?limit=4`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to complete the AI image search."
        );
      }

      setResults(Array.isArray(data.results) ? data.results : []);

      setSearchMeta({
        model: data.model,
        indexedReferenceImages: data.indexedReferenceImages,
        indexedProducts: data.indexedProducts,
      });
    } catch (requestError) {
      console.error("Image search error:", requestError);

      setError(
        requestError.message ||
          "Unable to complete the AI image search."
      );
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="image-search-page">
      <Navbar />

      <main>
        <section className="image-search-banner">
          <div className="container">
            <Link to="/" className="back-link">
              <ArrowLeft size={18} />
              Back to Home
            </Link>

            <div className="image-search-banner-content">
              <div>
                <p className="section-eyebrow">
                  AI Visual Search
                </p>

                <h1>Find Similar Jewellery from an Image</h1>

                <p>
                  Upload a jewellery photograph and our AI model will compare
                  it against the indexed Muliya demo catalogue to find visually
                  similar designs.
                </p>
              </div>

              <div className="image-search-banner-icon">
                <Camera size={34} />
              </div>
            </div>
          </div>
        </section>

        <section className="image-search-workspace">
          <div className="container">
            <div className="image-search-layout">
              <div className="image-search-upload-card">
                <div className="image-search-card-heading">
                  <div>
                    <p className="section-eyebrow">
                      Upload Jewellery Image
                    </p>

                    <h2>Choose a clear product photograph</h2>

                    <p>
                      For better results, use a front-facing image with minimal
                      background clutter.
                    </p>
                  </div>

                  {selectedFile && (
                    <button
                      type="button"
                      className="image-search-reset-btn"
                      onClick={resetSearch}
                      disabled={searching}
                    >
                      <RefreshCw size={16} />
                      Reset
                    </button>
                  )}
                </div>

                {!previewUrl ? (
                  <div
                    className={
                      isDragging
                        ? "image-search-dropzone active"
                        : "image-search-dropzone"
                    }
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        fileInputRef.current?.click();
                      }
                    }}
                  >
                    <div className="image-search-dropzone-icon">
                      <ImagePlus size={34} />
                    </div>

                    <h3>
                      {isDragging
                        ? "Drop your image here"
                        : "Drag and drop a jewellery image"}
                    </h3>

                    <p>or click to browse your device</p>

                    <span>JPEG, PNG or WebP · Maximum 10 MB</span>

                    <button
                      type="button"
                      className="primary-btn"
                      onClick={(event) => {
                        event.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                    >
                      <Upload size={17} />
                      Select Image
                    </button>
                  </div>
                ) : (
                  <div className="image-search-preview-card">
                    <div className="image-search-preview-image">
                      <img
                        src={previewUrl}
                        alt="Uploaded jewellery preview"
                      />

                      <button
                        type="button"
                        className="image-search-remove-btn"
                        onClick={resetSearch}
                        disabled={searching}
                        aria-label="Remove uploaded image"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <div className="image-search-file-info">
                      <div>
                        <span>Selected File</span>
                        <strong>{selectedFile?.name}</strong>
                        <small>{selectedFileSize}</small>
                      </div>

                      <CheckCircle2 size={22} />
                    </div>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  onChange={handleFileInputChange}
                  hidden
                />

                {error && (
                  <div className="image-search-error">
                    {error}
                  </div>
                )}

                <button
                  type="button"
                  className="primary-btn image-search-submit-btn"
                  onClick={searchSimilarJewellery}
                  disabled={!selectedFile || searching}
                >
                  {searching ? (
                    <>
                      <LoaderCircle
                        size={18}
                        className="spinning"
                      />
                      Analysing Image...
                    </>
                  ) : (
                    <>
                      <Search size={18} />
                      Find Similar Jewellery
                    </>
                  )}
                </button>

                <p className="image-search-supported-note">
                  Current demo dataset supports only the indexed necklace and
                  ring products.
                </p>
              </div>

              <aside className="image-search-info-card">
                <p className="section-eyebrow">
                  How It Works
                </p>

                <h2>Visual similarity powered by CLIP</h2>

                <div className="image-search-steps">
                  <div>
                    <span>01</span>

                    <div>
                      <h3>Upload Image</h3>
                      <p>
                        Select a jewellery image from your device.
                      </p>
                    </div>
                  </div>

                  <div>
                    <span>02</span>

                    <div>
                      <h3>Generate Embedding</h3>
                      <p>
                        The AI converts the uploaded image into a visual feature
                        vector.
                      </p>
                    </div>
                  </div>

                  <div>
                    <span>03</span>

                    <div>
                      <h3>Compare References</h3>
                      <p>
                        The vector is compared against all indexed reference
                        images.
                      </p>
                    </div>
                  </div>

                  <div>
                    <span>04</span>

                    <div>
                      <h3>Rank Products</h3>
                      <p>
                        The strongest match for each unique product is returned.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="image-search-disclaimer-card">
                  <strong>Prototype Notice</strong>

                  <p>
                    Similarity scores are AI-generated visual suggestions and
                    do not guarantee an exact product match.
                  </p>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {(searching || hasResults) && (
          <section className="image-search-results-section">
            <div className="container">
              <div className="image-search-results-header">
                <div>
                  <p className="section-eyebrow">
                    AI Match Results
                  </p>

                  <h2>
                    {searching
                      ? "Searching Similar Jewellery"
                      : "Recommended Similar Products"}
                  </h2>

                  <p>
                    Results are ranked using the highest matching reference
                    image for each product.
                  </p>
                </div>

                {searchMeta && (
                  <div className="image-search-meta">
                    <span>
                      {searchMeta.indexedReferenceImages} reference images
                    </span>

                    <span>
                      {searchMeta.indexedProducts} indexed products
                    </span>
                  </div>
                )}
              </div>

              {searching ? (
                <div className="image-search-loading-card">
                  <LoaderCircle
                    size={36}
                    className="spinning"
                  />

                  <h3>Analysing your image...</h3>

                  <p>
                    Generating the visual embedding and comparing it against
                    indexed jewellery references.
                  </p>
                </div>
              ) : (
                <div className="image-search-results-grid">
                  {results.map((product, index) => {
                    const available = availableBranches(product);
                    const unavailable = unavailableBranches(product);

                    return (
                      <article
                        className="image-search-result-card"
                        key={product._id}
                      >
                        <div className="image-search-result-rank">
                          #{index + 1}
                        </div>

                        <div className="image-search-result-image">
                          <img
                            src={product.image}
                            alt={product.name}
                          />

                          <div className="image-search-score-badge">
                            {Number(product.similarityScore).toFixed(1)}% Match
                          </div>
                        </div>

                        <div className="image-search-result-content">
                          <p className="product-card-code">
                            {product.code}
                          </p>

                          <h3>{product.name}</h3>

                          <div className="image-search-result-specs">
                            <div>
                              <span>Category</span>
                              <strong>{product.category}</strong>
                            </div>

                            <div>
                              <span>Type</span>
                              <strong>{product.type}</strong>
                            </div>

                            <div>
                              <span>Purity</span>
                              <strong>{product.purity}</strong>
                            </div>

                            <div>
                              <span>Weight</span>
                              <strong>{product.weight}</strong>
                            </div>
                          </div>

                          <div className="image-search-result-price">
                            {product.price}
                          </div>

                          <div className="image-search-branch-status">
                            <div>
                              <MapPin size={15} />

                              <span>
                                Available:{" "}
                                {available.length > 0
                                  ? available.join(", ")
                                  : "Not listed"}
                              </span>
                            </div>

                            {unavailable.length > 0 && (
                              <small>
                                Unavailable: {unavailable.join(", ")}
                              </small>
                            )}
                          </div>

                          <div className="image-search-result-actions">
                            <Link
                              to={`/product/${product._id}`}
                              className="primary-btn"
                            >
                              View Product
                            </Link>

                            <Link
                              to={`/product/${product._id}`}
                              className="secondary-btn"
                            >
                              Book Appointment
                            </Link>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        )}

        {!searching && selectedFile && !hasResults && !error && searchMeta && (
          <section className="image-search-empty-section">
            <div className="container">
              <div className="image-search-empty-card">
                <h2>No similar products found</h2>

                <p>
                  Try another jewellery image or add more reference images to
                  the AI dataset.
                </p>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default ImageSearchPage;