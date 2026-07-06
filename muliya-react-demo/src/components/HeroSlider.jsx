import { Link } from "react-router-dom";
import { ArrowRight, Camera } from "lucide-react";

function HeroSlider() {
  return (
    <section className="hero-slider">
      <div className="hero-slider-overlay">
        <div className="container">
          <div className="hero-slider-content">
            <p className="hero-eyebrow">Muliya Gold & Diamonds</p>

            <h1>
              Jewellery That Celebrates
              <span> Every Occasion</span>
            </h1>

            <p className="hero-description">
              Explore gold, diamond and silver jewellery collections with a
              smarter digital experience powered by AI image search, wishlist,
              comparison and branch availability.
            </p>

            <div className="hero-actions">
              <Link to="/gold" className="primary-btn">
                Explore Jewellery
                <ArrowRight size={17} />
              </Link>

              <button className="hero-ai-btn">
                <Camera size={17} />
                Try AI Image Search
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSlider;