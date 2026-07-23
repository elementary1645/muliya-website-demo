import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Link } from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  Camera,
  CheckCircle2,
  ImagePlus,
  LoaderCircle,
  MapPin,
  RefreshCw,
  Search,
  Sparkles,
  Upload,
  X,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import { AI_API_BASE_URL } from "../api/apiConfig";

const SEARCH_RESULT_LIMIT = 4;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

function formatBranchName(branch) {
  return String(branch)
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getAvailableBranches(product) {
  return Object.entries(product?.branchAvailability || {})
    .filter(([, available]) => Boolean(available))
    .map(([branch]) => formatBranchName(branch));
}

function getUnavailableBranches(product) {
  return Object.entries(product?.branchAvailability || {})
    .filter(([, available]) => !available)
    .map(([branch]) => formatBranchName(branch));
}

function getSimilarityLabel(score) {
  const numericScore = Number(score) || 0;

  if (numericScore >= 80) {
    return "Excellent match";
  }

  if (numericScore >= 65) {
    return "Strong match";
  }

  if (numericScore >= 50) {
    return "Good match";
  }

  return "Possible match";
}

function getProductImage(product) {
  return (
    product?.image ||
    "/images/product-placeholder.jpg"
  );
}

function ImageSearchPage() {
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const [results, setResults] = useState([]);
  const [searchMeta, setSearchMeta] = useState(null);

  const [searching, setSearching] = useState(false);
  const [searchCompleted, setSearchCompleted] = useState(false);
  const [error, setError] = useState("");

  const selectedFileSize = useMemo(() => {
    if (!selectedFile) {
      return "";
    }

    const sizeInMb =
      selectedFile.size / (1024 * 1024);

    return `${sizeInMb.toFixed(2)} MB`;
  }, [selectedFile]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const validateFile = (file) => {
    if (!file) {
      return "Please select an image.";
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return "Unsupported file type. Upload a JPEG, PNG, or WebP image.";
    }

    if (file.size > MAX_FILE_SIZE) {
      return "The selected image is too large. Maximum file size is 10 MB.";
    }

    if (file.size === 0) {
      return "The selected image appears to be empty.";
    }

    return "";
  };

  const chooseFile = (file) => {
    const validationError = validateFile(file);

    if (validationError) {
      setError(validationError);
      return;
    }

    const nextPreviewUrl =
      URL.createObjectURL(file);

    setSelectedFile(file);
    setPreviewUrl(nextPreviewUrl);
    setResults([]);
    setSearchMeta(null);
    setSearchCompleted(false);
    setError("");
  };

  const resetSearch = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    setResults([]);
    setSearchMeta(null);
    setSearchCompleted(false);
    setSearching(false);
    setIsDragging(false);
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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

    const file =
      event.dataTransfer.files?.[0];

    if (file) {
      chooseFile(file);
    }
  };

  const searchSimilarJewellery = async () => {
    if (!selectedFile) {
      setError(
        "Please upload a jewellery image first.",
      );
      return;
    }

    try {
      setSearching(true);
      setSearchCompleted(false);
      setResults([]);
      setSearchMeta(null);
      setError("");

      const formData = new FormData();

      formData.append("image", selectedFile);

      const response = await fetch(
        `${AI_API_BASE_URL}/search?limit=${SEARCH_RESULT_LIMIT}`,
        {
          method: "POST",
          body: formData,
        },
      );

      const data = await response
        .json()
        .catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            data?.message ||
            `AI search failed with status ${response.status}.`,
        );
      }

      if (!data?.success) {
        throw new Error(
          data?.detail ||
            data?.message ||
            "The AI service could not complete the search.",
        );
      }

      const returnedResults =
        Array.isArray(data.results)
          ? data.results
          : [];

      setResults(returnedResults);

      setSearchMeta({
        model: data.model || "CLIP",
        indexedReferenceImages:
          data.indexedReferenceImages || 0,
        indexedProducts:
          data.indexedProducts || 0,
        resultCount:
          data.count ?? returnedResults.length,
      });

      setSearchCompleted(true);
    } catch (requestError) {
      console.error(
        "AI jewellery search error:",
        requestError,
      );

      if (
        requestError instanceof TypeError &&
        requestError.message === "Failed to fetch"
      ) {
        setError(
          "The AI search service is unavailable. Confirm that the FastAPI service is running on port 8000.",
        );
      } else {
        setError(
          requestError?.message ||
            "Unable to complete the AI image search.",
        );
      }

      setSearchCompleted(false);
    } finally {
      setSearching(false);
    }
  };

  const hasResults = results.length > 0;

  return (
    <div className="image-search-page">
      <Navbar />

      <main>
        <section className="image-search-banner">
          <div className="container">
            <Link to="/" className="back-link">
              <ArrowLeft
                size={18}
                aria-hidden="true"
              />
              Back to Home
            </Link>

            <div className="image-search-banner-content">
              <div>
                <p className="section-eyebrow">
                  AI Visual Search
                </p>

                <h1>
                  Find Similar Jewellery from an
                  Image
                </h1>

                <p>
                  Upload a jewellery photograph and
                  our CLIP model will compare it
                  against the indexed Muliya
                  catalogue to identify visually
                  similar designs.
                </p>
              </div>

              <div
                className="image-search-banner-icon"
                aria-hidden="true"
              >
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

                    <h2>
                      Choose a clear product
                      photograph
                    </h2>

                    <p>
                      Use a front-facing image with
                      good lighting and minimal
                      background clutter for better
                      matches.
                    </p>
                  </div>

                  {selectedFile && (
                    <button
                      type="button"
                      className="image-search-reset-btn"
                      onClick={resetSearch}
                      disabled={searching}
                    >
                      <RefreshCw
                        size={16}
                        aria-hidden="true"
                      />
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
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    onKeyDown={(event) => {
                      if (
                        event.key === "Enter" ||
                        event.key === " "
                      ) {
                        event.preventDefault();
                        fileInputRef.current?.click();
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="image-search-dropzone-icon">
                      <ImagePlus
                        size={34}
                        aria-hidden="true"
                      />
                    </div>

                    <h3>
                      {isDragging
                        ? "Drop your image here"
                        : "Drag and drop a jewellery image"}
                    </h3>

                    <p>
                      Or click to browse your device
                    </p>

                    <span>
                      JPEG, PNG or WebP · Maximum
                      10 MB
                    </span>

                    <button
                      type="button"
                      className="primary-btn"
                      onClick={(event) => {
                        event.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                    >
                      <Upload
                        size={17}
                        aria-hidden="true"
                      />
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
                        <X
                          size={18}
                          aria-hidden="true"
                        />
                      </button>
                    </div>

                    <div className="image-search-file-info">
                      <div>
                        <span>Selected File</span>
                        <strong>
                          {selectedFile?.name}
                        </strong>
                        <small>
                          {selectedFileSize}
                        </small>
                      </div>

                      <CheckCircle2
                        size={22}
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  onChange={
                    handleFileInputChange
                  }
                  hidden
                />

                {error && (
                  <div
                    className="image-search-error"
                    role="alert"
                  >
                    <X
                      size={18}
                      aria-hidden="true"
                    />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="button"
                  className="primary-btn image-search-submit-btn"
                  onClick={
                    searchSimilarJewellery
                  }
                  disabled={
                    !selectedFile || searching
                  }
                >
                  {searching ? (
                    <>
                      <LoaderCircle
                        className="spin"
                        size={19}
                        aria-hidden="true"
                      />
                      Analysing Jewellery...
                    </>
                  ) : (
                    <>
                      <Search
                        size={19}
                        aria-hidden="true"
                      />
                      Find Similar Jewellery
                    </>
                  )}
                </button>
              </div>

              <aside className="image-search-info-card">
                <div className="image-search-info-icon">
                  <Sparkles
                    size={26}
                    aria-hidden="true"
                  />
                </div>

                <p className="section-eyebrow">
                  How It Works
                </p>

                <h2>
                  Visual similarity powered by CLIP
                </h2>

                <ol className="image-search-steps">
                  <li>
                    <span>1</span>
                    <div>
                      <strong>
                        Upload an image
                      </strong>
                      <p>
                        Select a clear photograph of
                        jewellery you like.
                      </p>
                    </div>
                  </li>

                  <li>
                    <span>2</span>
                    <div>
                      <strong>
                        AI analyses the design
                      </strong>
                      <p>
                        The model compares its visual
                        features with indexed
                        reference images.
                      </p>
                    </div>
                  </li>

                  <li>
                    <span>3</span>
                    <div>
                      <strong>
                        Explore ranked matches
                      </strong>
                      <p>
                        Review similar products,
                        scores and showroom
                        availability.
                      </p>
                    </div>
                  </li>
                </ol>

                <div className="image-search-index-status">
                  <CheckCircle2
                    size={18}
                    aria-hidden="true"
                  />

                  <span>
                    AI service indexed with 45
                    reference images across 4
                    products
                  </span>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {searching && (
          <section
            className="image-search-results-section"
            aria-live="polite"
          >
            <div className="container">
              <div className="image-search-loading-state">
                <LoaderCircle
                  className="spin"
                  size={38}
                  aria-hidden="true"
                />

                <h2>
                  Analysing your jewellery image
                </h2>

                <p>
                  Comparing visual features against
                  the indexed catalogue. This may
                  take a few seconds on CPU.
                </p>
              </div>
            </div>
          </section>
        )}

        {!searching && searchCompleted && (
          <section className="image-search-results-section">
            <div className="container">
              <div className="image-search-results-heading">
                <div>
                  <p className="section-eyebrow">
                    AI Search Results
                  </p>

                  <h2>
                    {hasResults
                      ? `${results.length} Similar ${
                          results.length === 1
                            ? "Design"
                            : "Designs"
                        } Found`
                      : "No Similar Designs Found"}
                  </h2>

                  <p>
                    Results are ranked using visual
                    similarity between your image
                    and the indexed reference
                    photographs.
                  </p>
                </div>

                {searchMeta && (
                  <div className="image-search-meta">
                    <span>
                      {
                        searchMeta.indexedReferenceImages
                      }{" "}
                      reference images
                    </span>

                    <span>
                      {searchMeta.indexedProducts}{" "}
                      indexed products
                    </span>

                    <span>
                      Model:{" "}
                      {searchMeta.model}
                    </span>
                  </div>
                )}
              </div>

              {hasResults ? (
                <div className="image-search-results-grid">
                  {results.map(
                    (product, index) => {
                      const availableBranches =
                        getAvailableBranches(
                          product,
                        );

                      const unavailableBranches =
                        getUnavailableBranches(
                          product,
                        );

                      return (
                        <article
                          className="image-search-result-card"
                          key={
                            product.productId ||
                            product.code ||
                            index
                          }
                        >
                          <div className="image-search-result-image">
                            <img
                              src={getProductImage(
                                product,
                              )}
                              alt={
                                product.name ||
                                "Matching jewellery product"
                              }
                              onError={(event) => {
                                event.currentTarget.src =
                                  "/images/product-placeholder.jpg";
                              }}
                            />

                            <div className="image-search-similarity-badge">
                              <strong>
                                {Number(
                                  product.similarityScore,
                                ).toFixed(1)}
                                %
                              </strong>

                              <span>
                                {getSimilarityLabel(
                                  product.similarityScore,
                                )}
                              </span>
                            </div>

                            <span className="image-search-result-rank">
                              Match #{index + 1}
                            </span>
                          </div>

                          <div className="image-search-result-content">
                            <div className="image-search-result-tags">
                              {product.category && (
                                <span>
                                  {
                                    product.category
                                  }
                                </span>
                              )}

                              {product.collection && (
                                <span>
                                  {
                                    product.collection
                                  }
                                </span>
                              )}
                            </div>

                            <h3>
                              {product.name ||
                                "Jewellery Product"}
                            </h3>

                            <p className="image-search-result-code">
                              Product Code:{" "}
                              <strong>
                                {product.code ||
                                  "Not available"}
                              </strong>
                            </p>

                            <div className="image-search-result-details">
                              {product.price && (
                                <div>
                                  <span>
                                    Price
                                  </span>
                                  <strong>
                                    {
                                      product.price
                                    }
                                  </strong>
                                </div>
                              )}

                              {product.weight && (
                                <div>
                                  <span>
                                    Weight
                                  </span>
                                  <strong>
                                    {
                                      product.weight
                                    }
                                  </strong>
                                </div>
                              )}

                              {product.purity && (
                                <div>
                                  <span>
                                    Purity
                                  </span>
                                  <strong>
                                    {
                                      product.purity
                                    }
                                  </strong>
                                </div>
                              )}

                              {product.type && (
                                <div>
                                  <span>
                                    Type
                                  </span>
                                  <strong>
                                    {
                                      product.type
                                    }
                                  </strong>
                                </div>
                              )}
                            </div>

                            <div className="image-search-branch-block">
                              <div className="image-search-branch-title">
                                <MapPin
                                  size={17}
                                  aria-hidden="true"
                                />
                                Showroom Availability
                              </div>

                              {availableBranches.length >
                              0 ? (
                                <div className="image-search-branch-list">
                                  {availableBranches.map(
                                    (branch) => (
                                      <span
                                        className="available"
                                        key={branch}
                                      >
                                        {
                                          branch
                                        }
                                      </span>
                                    ),
                                  )}
                                </div>
                              ) : (
                                <p className="image-search-no-branch">
                                  Contact a showroom
                                  to confirm
                                  availability.
                                </p>
                              )}

                              {unavailableBranches.length >
                                0 && (
                                <small>
                                  Unavailable at:{" "}
                                  {unavailableBranches.join(
                                    ", ",
                                  )}
                                </small>
                              )}
                            </div>

                            {product.productId ? (
                              <Link
                                to={`/products/${product.productId}`}
                                className="primary-btn image-search-product-link"
                              >
                                View Product
                                <ArrowRight
                                  size={17}
                                  aria-hidden="true"
                                />
                              </Link>
                            ) : (
                              <Link
                                to={`/products?search=${encodeURIComponent(
                                  product.code ||
                                    product.name ||
                                    "",
                                )}`}
                                className="primary-btn image-search-product-link"
                              >
                                Find in Catalogue
                                <ArrowRight
                                  size={17}
                                  aria-hidden="true"
                                />
                              </Link>
                            )}
                          </div>
                        </article>
                      );
                    },
                  )}
                </div>
              ) : (
                <div className="image-search-empty-state">
                  <ImagePlus
                    size={42}
                    aria-hidden="true"
                  />

                  <h3>
                    No indexed product matched this
                    image
                  </h3>

                  <p>
                    Try another image with clearer
                    lighting, a front-facing angle
                    and less background clutter.
                  </p>

                  <button
                    type="button"
                    className="primary-btn"
                    onClick={resetSearch}
                  >
                    Upload Another Image
                  </button>
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default ImageSearchPage;