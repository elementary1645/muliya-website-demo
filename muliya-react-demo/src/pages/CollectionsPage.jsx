import { Link } from "react-router-dom";
import {
  ArrowRight,
  Crown,
  Gem,
  Heart,
  Sparkles,
  Star,
  WandSparkles,
  CalendarDays,
} from "lucide-react";

const collections = [
  {
    name: "Bridal Collection",
    slug: "Bridal",
    description:
      "Statement jewellery designed for weddings, receptions and traditional celebrations.",
    icon: Crown,
    number: "01",
  },
  {
    name: "Wedding Collection",
    slug: "Wedding",
    description:
      "Elegant gold and diamond pieces curated for every wedding ceremony.",
    icon: Heart,
    number: "02",
  },
  {
    name: "Temple Collection",
    slug: "Temple",
    description:
      "Traditional designs inspired by heritage motifs and classical craftsmanship.",
    icon: Sparkles,
    number: "03",
  },
  {
    name: "Everyday Collection",
    slug: "Everyday",
    description:
      "Lightweight and versatile jewellery designed for graceful daily wear.",
    icon: Star,
    number: "04",
  },
  {
    name: "Luxury Collection",
    slug: "Luxury",
    description:
      "Premium jewellery featuring refined details, precious stones and bold designs.",
    icon: Gem,
    number: "05",
  },
  {
    name: "Modern Collection",
    slug: "Modern",
    description:
      "Contemporary jewellery with clean lines, minimal styling and modern appeal.",
    icon: WandSparkles,
    number: "06",
  },
  {
    name: "Traditional Collection",
    slug: "Traditional",
    description:
      "Timeless jewellery inspired by Indian culture, festivals and family traditions.",
    icon: Crown,
    number: "07",
  },
  {
    name: "Men's Collection",
    slug: "Men",
    description:
      "Chains, rings, bracelets and statement pieces designed for men.",
    icon: Gem,
    number: "08",
  },
  {
    name: "Kids Collection",
    slug: "Kids",
    description:
      "Playful, lightweight and comfortable jewellery created for children.",
    icon: Star,
    number: "09",
  },
  {
    name: "Festive Collection",
    slug: "Festive",
    description:
      "Celebration-ready jewellery for festivals, family occasions and special moments.",
    icon: Sparkles,
    number: "10",
  },
];

function CollectionsPage() {
  return (
    <main className="collections-page">
      <section className="collections-hero">
        <div className="collections-hero-decoration collections-hero-decoration-one" />
        <div className="collections-hero-decoration collections-hero-decoration-two" />

        <div className="container collections-hero-content">
          <div className="collections-hero-copy">
            <p className="section-eyebrow">Curated Jewellery</p>

            <h1>
              Jewellery Collections
              <span> Crafted for Every Story</span>
            </h1>

            <p className="collections-hero-description">
              Discover jewellery created for weddings, celebrations, everyday
              elegance and unforgettable moments.
            </p>

            <div className="collections-hero-actions">
              <Link to="/products" className="primary-button">
                View All Jewellery
                <ArrowRight size={18} aria-hidden="true" />
              </Link>

              <Link to="/appointment" className="secondary-button">
                Book a Consultation
              </Link>
            </div>
          </div>

          <div className="collections-hero-showcase" aria-hidden="true">
            <div className="collections-hero-jewel">
              <Gem size={82} />
            </div>

            <div className="collections-hero-badge">
              <span>10</span>
              <small>Signature Collections</small>
            </div>
          </div>
        </div>
      </section>

      <section className="collections-section">
        <div className="container">
          <div className="section-heading collections-heading">
            <div>
              <p className="section-eyebrow">Explore by Style</p>
              <h2>Collections for Every Occasion</h2>
            </div>

            <p>
              Browse signature jewellery styles created for weddings,
              celebrations, modern living and timeless traditions.
            </p>
          </div>

          <div className="collections-grid">
            {collections.map((collection) => {
              const Icon = collection.icon;

              return (
                <article
                  key={collection.slug}
                  className="collection-card"
                >
                  <span className="collection-card-number">
                    {collection.number}
                  </span>

                  <div className="collection-card-icon" aria-hidden="true">
                    <Icon size={30} />
                  </div>

                  <div className="collection-card-content">
                    <h3>{collection.name}</h3>

                    <p>{collection.description}</p>

                    <Link
                      to={`/products?collection=${encodeURIComponent(
                        collection.slug,
                      )}`}
                      className="collection-card-link"
                    >
                      Explore Collection
                      <ArrowRight size={17} aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="collections-feature-section">
        <div className="container collections-feature-grid">
          <div className="collections-feature-content">
            <div className="collections-feature-icon" aria-hidden="true">
              <WandSparkles size={28} />
            </div>

            <p className="section-eyebrow">AI Jewellery Discovery</p>

            <h2>Find Jewellery That Matches Your Inspiration</h2>

            <p>
              Upload any jewellery image and let our AI search the Muliya
              catalogue for visually similar designs.
            </p>

            <div className="collections-feature-actions">
              <Link to="/image-search" className="primary-button">
                Try AI Image Search
                <ArrowRight size={18} aria-hidden="true" />
              </Link>

              <Link to="/products" className="secondary-button">
                Browse Catalogue
              </Link>
            </div>

            <div className="collections-feature-points">
              <span>Image-based discovery</span>
              <span>Visually similar results</span>
              <span>Instant catalogue matching</span>
            </div>
          </div>

          <div className="collections-feature-panel">
            <div className="collections-feature-panel-icon">
              <Gem size={46} aria-hidden="true" />
            </div>

            <p className="collections-feature-panel-label">
              Personal Jewellery Assistance
            </p>

            <h3>Need Help Choosing the Perfect Piece?</h3>

            <p>
              Meet our jewellery experts for personalised recommendations based
              on your occasion, style and preferred showroom.
            </p>

            <Link to="/appointment" className="collections-panel-button">
              <CalendarDays size={18} aria-hidden="true" />
              Book an Appointment
            </Link>
          </div>
        </div>
      </section>

      <section className="collections-final-cta">
        <div className="container collections-final-cta-content">
          <div>
            <p className="section-eyebrow">Discover Muliya</p>
            <h2>Timeless Craftsmanship, Made Personal</h2>
            <p>
              Explore our complete jewellery catalogue or visit a Muliya
              showroom for a personalised experience.
            </p>
          </div>

          <div className="collections-final-cta-actions">
            <Link to="/products" className="primary-button">
              Explore Jewellery
              <ArrowRight size={18} aria-hidden="true" />
            </Link>

            <Link to="/showrooms" className="secondary-button">
              Find a Showroom
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default CollectionsPage;