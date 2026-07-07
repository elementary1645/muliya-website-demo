import { useRef, useState } from "react";
import {
  ArrowRight,
  Camera,
  CheckCircle,
  ImagePlus,
  LoaderCircle,
  Search,
  Upload,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";

import products from "../data/products";

function AIImageSearch() {
  const fileInputRef = useRef(null);

  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchComplete, setSearchComplete] = useState(false);

  const similarProducts = products.slice(0, 3);

  const handleFile = (file) => {
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      return;
    }

    const imageUrl = URL.createObjectURL(file);

    setUploadedImage(imageUrl);
    setUploadedFileName(file.name);
    setSearchComplete(false);
  };

  const handleFileChange = (event) => {
    handleFile(event.target.files[0]);
  };

  const handleDrop = (event) => {
    event.preventDefault();

    const file = event.dataTransfer.files[0];

    handleFile(file);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleSearch = () => {
    if (!uploadedImage) {
      fileInputRef.current?.click();
      return;
    }

    setIsSearching(true);
    setSearchComplete(false);

    setTimeout(() => {
      setIsSearching(false);
      setSearchComplete(true);
    }, 1800);
  };

  const removeImage = () => {
    setUploadedImage(null);
    setUploadedFileName("");
    setIsSearching(false);
    setSearchComplete(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <section className="ai-image-search-section" id="ai-search">
      <div className="container">
        <div className="ai-search-layout">
          <div className="ai-search-information">
            <p className="section-eyebrow">AI Jewellery Discovery</p>

            <h2 className="section-title">
              Find Jewellery Using an Image
            </h2>

            <p className="section-description">
              Upload a jewellery photo, screenshot, or reference image. The AI
              search system can analyse the visual design and retrieve similar
              jewellery from the product catalogue.
            </p>

            <div className="ai-feature-list">
              <div className="ai-feature">
                <div className="ai-feature-icon">
                  <Upload size={21} />
                </div>

                <div>
                  <h3>Upload Jewellery Image</h3>
                  <p>
                    Customers can upload a photo from their device or use a
                    screenshot from social media.
                  </p>
                </div>
              </div>

              <div className="ai-feature">
                <div className="ai-feature-icon">
                  <Camera size={21} />
                </div>

                <div>
                  <h3>AI Analyses the Design</h3>
                  <p>
                    Image embeddings can identify visual characteristics such
                    as jewellery type, shape, pattern, and overall design.
                  </p>
                </div>
              </div>

              <div className="ai-feature">
                <div className="ai-feature-icon">
                  <Search size={21} />
                </div>

                <div>
                  <h3>Discover Similar Products</h3>
                  <p>
                    Customers receive visually similar jewellery results linked
                    to products in the catalogue.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="ai-search-demo-card">
            <div className="ai-demo-card-header">
              <div>
                <p>Smart Visual Search</p>
                <h3>Upload Jewellery Image</h3>
              </div>

              <div className="ai-status">
                <span />
                AI Ready
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              hidden
            />

            {!uploadedImage ? (
              <button
                type="button"
                className="ai-upload-zone"
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <div className="upload-icon-container">
                  <ImagePlus size={34} />
                </div>

                <h4>Drop your jewellery image here</h4>

                <p>or click to browse from your device</p>

                <span>JPG, JPEG, PNG, WEBP</span>
              </button>
            ) : (
              <div className="uploaded-image-preview">
                <img src={uploadedImage} alt="Uploaded jewellery preview" />

                <button
                  type="button"
                  className="remove-uploaded-image"
                  onClick={removeImage}
                  aria-label="Remove uploaded image"
                >
                  <X size={18} />
                </button>

                <div className="uploaded-file-information">
                  <CheckCircle size={17} />

                  <div>
                    <strong>Image uploaded successfully</strong>
                    <span>{uploadedFileName}</span>
                  </div>
                </div>
              </div>
            )}

            <button
              type="button"
              className="ai-search-button"
              onClick={handleSearch}
              disabled={isSearching}
            >
              {isSearching ? (
                <>
                  <LoaderCircle className="loading-spinner" size={19} />
                  Analysing Jewellery...
                </>
              ) : (
                <>
                  <Search size={18} />
                  Find Similar Jewellery
                </>
              )}
            </button>

            {searchComplete && (
              <div className="ai-search-results">
                <div className="ai-results-header">
                  <div>
                    <p>AI Search Complete</p>
                    <h4>Similar Jewellery Found</h4>
                  </div>

                  <span>{similarProducts.length} Results</span>
                </div>

                <div className="ai-results-grid">
                  {similarProducts.map((product) => (
                    <Link
                      to={`/product/${product.id}`}
                      className="ai-result-card"
                      key={product.id}
                    >
                      <img src={product.image} alt={product.name} />

                      <div>
                        <span>{product.code}</span>
                        <h5>{product.name}</h5>

                        <p>
                          View Product
                          <ArrowRight size={14} />
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>

                <p className="ai-demo-disclaimer">
                  Prototype result: products are currently selected from demo
                  catalogue data. A trained image similarity system can replace
                  this logic later.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default AIImageSearch;