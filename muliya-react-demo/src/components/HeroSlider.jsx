import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import worldRecord from "../assets/hero/world-record.jpg";
import showroom from "../assets/hero/showroom.jpg";
import brandAmbassador from "../assets/hero/brand-ambassador.png";
import cvdDiamond from "../assets/hero/cvd-diamond.png";
import templeJewellery from "../assets/hero/temple-jewellery.png";
import silveriya from "../assets/hero/silveriya.png";
import monsoonSale from "../assets/hero/monsoon-sale.jpg";

const slides = [
  {
    id: 1,
    image: worldRecord,
    alt: "Muliya Bengaluru world records",
  },
  {
    id: 2,
    image: showroom,
    alt: "Muliya jewellery showroom",
  },
  {
    id: 3,
    image: brandAmbassador,
    alt: "Muliya brand ambassador",
  },
  {
    id: 4,
    image: cvdDiamond,
    alt: "Muliya CVD diamond testing",
  },
  {
    id: 5,
    image: templeJewellery,
    alt: "Muliya temple jewellery",
  },
  {
    id: 6,
    image: silveriya,
    alt: "Muliya Silveriya collection",
  },
  {
    id: 7,
    image: monsoonSale,
    alt: "Muliya Monsoon Sale",
  },
];

function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) =>
      prev === slides.length - 1 ? 0 : prev + 1
    );
  };

  const previousSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? slides.length - 1 : prev - 1
    );
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) =>
        prev === slides.length - 1 ? 0 : prev + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="muliya-hero-slider">
      <div
        className="muliya-hero-track"
        style={{
          transform: `translateX(-${currentSlide * 100}%)`,
        }}
      >
        {slides.map((slide) => (
          <div
            className="muliya-hero-slide"
            key={slide.id}
          >
            <img
              src={slide.image}
              alt={slide.alt}
              draggable="false"
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        className="muliya-hero-arrow muliya-hero-arrow-left"
        onClick={previousSlide}
        aria-label="Previous slide"
      >
        <ChevronLeft size={28} />
      </button>

      <button
        type="button"
        className="muliya-hero-arrow muliya-hero-arrow-right"
        onClick={nextSlide}
        aria-label="Next slide"
      >
        <ChevronRight size={28} />
      </button>

      <div className="muliya-hero-dots">
        {slides.map((slide, index) => (
          <button
            type="button"
            key={slide.id}
            className={`muliya-hero-dot ${
              currentSlide === index ? "active" : ""
            }`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

export default HeroSlider;