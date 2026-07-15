import { Camera, ImagePlus, Search, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

function AIImageSearch() {
  const navigate = useNavigate();

  const openImageSearch = () => {
    navigate("/image-search");
  };

  return (
    <section className="ai-image-search-section" id="ai-search">
      <div className="container">
        <div className="ai-image-search-card">
          <div className="ai-image-search-content">
            <p className="section-eyebrow">
              AI Visual Jewellery Search
            </p>

            <h2 className="section-title">
              Find Jewellery from an Image
            </h2>

            <p className="section-description">
              Upload a jewellery photograph and discover visually similar
              necklace and ring designs from the indexed demo catalogue.
            </p>

            <div className="ai-image-search-features">
              <div>
                <Camera size={20} />

                <span>Upload a jewellery image</span>
              </div>

              <div>
                <Sparkles size={20} />

                <span>AI visual similarity matching</span>
              </div>

              <div>
                <Search size={20} />

                <span>Ranked catalogue recommendations</span>
              </div>
            </div>

            <button
              type="button"
              className="primary-btn ai-image-search-open-btn"
              onClick={openImageSearch}
            >
              <ImagePlus size={18} />
              Start AI Image Search
            </button>

            <p className="ai-image-search-note">
              Current prototype supports indexed necklace and ring products.
            </p>
          </div>

          <div className="ai-image-search-visual">
            <div className="ai-image-search-visual-icon">
              <Camera size={54} />
            </div>

            <h3>Upload. Analyse. Discover.</h3>

            <p>
              The CLIP model compares your image against multiple reference
              photographs and returns the closest unique product matches.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AIImageSearch;