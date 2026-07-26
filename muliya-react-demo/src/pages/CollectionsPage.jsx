import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  Gem,
  WandSparkles,
} from "lucide-react";

import mahathiImage from "../assets/collections/mahathi.png";
import amuliyaImage from "../assets/collections/amuliya.png";
import indianBridalImage from "../assets/collections/indian-bridal.png";
import indianEthnicImage from "../assets/collections/indian-ethnic.png";
import rubyEmeraldImage from "../assets/collections/ruby-and-emerald.png";
import apsaraRoseGoldImage from "../assets/collections/apsara-rose-gold.png";


const collections = [
  {
    id: 1,
    name: "Mahathi",
    subtitle: "A Gold Collection",
    description:
      "A distinctive antique-inspired gold jewellery collection celebrating timeless Indian craftsmanship and traditional elegance.",
    image: mahathiImage,
    slug: "Mahathi",
  },
  {
    id: 2,
    name: "Amuliya",
    subtitle: "Collection of Diamonds",
    description:
      "Elegant diamond jewellery designed with refined detailing for celebrations, special occasions and contemporary styling.",
    image: amuliyaImage,
    slug: "Amuliya",
  },
  {
    id: 3,
    name: "Indian Bridal",
    subtitle: "Wedding Collection",
    description:
      "Grand bridal jewellery designed for unforgettable wedding moments, combining traditional richness with statement craftsmanship.",
    image: indianBridalImage,
    slug: "Indian Bridal",
  },
  {
    id: 4,
    name: "Indian Ethnic",
    subtitle: "Traditional Collection",
    description:
      "Jewellery rooted in Indian heritage, created for festivals, traditional occasions and timeless ethnic styling.",
    image: indianEthnicImage,
    slug: "Indian Ethnic",
  },
  {
    id: 5,
    name: "Ruby and Emerald",
    subtitle: "Gemstone Collection",
    description:
      "A vibrant collection featuring the richness of ruby and emerald tones in elegant jewellery crafted for statement occasions.",
    image: rubyEmeraldImage,
    slug: "Ruby and Emerald",
  },
  {
    id: 6,
    name: "Apsara Rose Gold",
    subtitle: "Rose Gold Collection",
    description:
      "Contemporary rose gold jewellery combining soft elegance with modern styling for celebrations and everyday sophistication.",
    image: apsaraRoseGoldImage,
    slug: "Apsara Rose Gold",
  },
];


function CollectionsPage() {
  return (
    <main className="signature-collections-page">

      {/* =====================================================
          HERO
          ===================================================== */}

      <section className="signature-collections-hero">
        <div className="signature-hero-decoration signature-hero-decoration-one" />
        <div className="signature-hero-decoration signature-hero-decoration-two" />

        <div className="container signature-hero-layout">
          <div className="signature-hero-copy">
            <p className="section-eyebrow">
              Muliya Signature Collections
            </p>

            <h1>
              Jewellery Created
              <span> for Every Story</span>
            </h1>

            <p>
              Discover Muliya's signature jewellery collections —
              from timeless gold and diamonds to bridal,
              traditional, gemstone and contemporary rose gold
              designs.
            </p>

            <div className="signature-hero-actions">
              <Link
                to="/products"
                className="signature-primary-btn"
              >
                Explore All Jewellery
                <ArrowRight size={18} />
              </Link>

              <Link
                to="/appointment"
                className="signature-secondary-btn"
              >
                Book a Consultation
              </Link>
            </div>
          </div>

          <div className="signature-hero-highlight">
            <div className="signature-hero-jewel">
              <Gem size={58} />
            </div>

            <strong>6</strong>

            <span>
              Signature
              <br />
              Collections
            </span>
          </div>
        </div>
      </section>


      {/* =====================================================
          COLLECTIONS
          ===================================================== */}

      <section className="signature-collections-section">
        <div className="container">

          <div className="signature-section-heading">
            <div>
              <p className="section-eyebrow">
                Discover the Collections
              </p>

              <h2>
                Six Expressions of Muliya
              </h2>
            </div>

            <p>
              Explore collections designed around tradition,
              weddings, gemstones, diamonds and modern
              jewellery styling.
            </p>
          </div>


          <div className="signature-collections-grid">
            {collections.map((collection) => (
              <article
                className="signature-collection-card"
                key={collection.id}
              >
                <Link
                  to={`/products?collection=${encodeURIComponent(
                    collection.slug
                  )}`}
                  className="signature-collection-image"
                >
                  <img
                    src={collection.image}
                    alt={collection.name}
                    loading="lazy"
                  />
                </Link>

                <div className="signature-collection-content">
                  <p className="signature-collection-subtitle">
                    {collection.subtitle}
                  </p>

                  <h3>
                    {collection.name}
                  </h3>

                  <p className="signature-collection-description">
                    {collection.description}
                  </p>

                  <Link
                    to={`/products?collection=${encodeURIComponent(
                      collection.slug
                    )}`}
                    className="signature-collection-link"
                  >
                    Explore Collection
                    <ArrowRight size={17} />
                  </Link>
                </div>
              </article>
            ))}
          </div>

        </div>
      </section>


      {/* =====================================================
          AI DISCOVERY
          ===================================================== */}

      <section className="signature-discovery-section">
        <div className="container signature-discovery-grid">

          <div className="signature-discovery-copy">
            <div className="signature-discovery-icon">
              <WandSparkles size={27} />
            </div>

            <p className="section-eyebrow">
              AI Jewellery Discovery
            </p>

            <h2>
              Have a Jewellery Design in Mind?
            </h2>

            <p>
              Upload a reference image and let our AI-powered
              image search find visually similar jewellery
              available in the Muliya catalogue.
            </p>

            <div className="signature-discovery-actions">
              <Link
                to="/image-search"
                className="signature-primary-btn"
              >
                Try AI Image Search
                <ArrowRight size={18} />
              </Link>

              <Link
                to="/products"
                className="signature-secondary-dark-btn"
              >
                Browse Catalogue
              </Link>
            </div>
          </div>


          <div className="signature-assistance-card">
            <div className="signature-assistance-icon">
              <Gem size={38} />
            </div>

            <p className="signature-assistance-label">
              Personal Jewellery Assistance
            </p>

            <h3>
              Need Help Finding the Perfect Piece?
            </h3>

            <p>
              Meet a Muliya jewellery expert for personalised
              recommendations based on your occasion, style
              and preferred showroom.
            </p>

            <Link
              to="/appointment"
              className="signature-appointment-btn"
            >
              <CalendarDays size={18} />
              Book an Appointment
            </Link>
          </div>

        </div>
      </section>


      {/* =====================================================
          FINAL CTA
          ===================================================== */}

      <section className="signature-final-cta">
        <div className="container signature-final-cta-layout">
          <div>
            <p className="section-eyebrow">
              Discover Muliya
            </p>

            <h2>
              Experience Jewellery Beyond the Screen
            </h2>

            <p>
              Explore the complete catalogue online or visit
              your nearest Muliya showroom for a personalised
              jewellery experience.
            </p>
          </div>

          <div className="signature-final-actions">
            <Link
              to="/products"
              className="signature-primary-btn"
            >
              Explore Jewellery
              <ArrowRight size={18} />
            </Link>

            <Link
              to="/showrooms"
              className="signature-secondary-btn"
            >
              Find a Showroom
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}

export default CollectionsPage;