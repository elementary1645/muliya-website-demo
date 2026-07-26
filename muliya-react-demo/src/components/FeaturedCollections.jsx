import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

import mahathiImage from "../assets/collections/mahathi.png";
import amuliyaImage from "../assets/collections/amuliya.png";
import indianBridalImage from "../assets/collections/indian-bridal.png";
import indianEthnicImage from "../assets/collections/indian-ethnic.png";
import rubyEmeraldImage from "../assets/collections/ruby-and-emerald.png";
import apsaraRoseGoldImage from "../assets/collections/apsara-rose-gold.png";

const collections = [
  {
    id: 1,
    title: "Mahathi",
    subtitle: "A Gold Collection",
    image: mahathiImage,
  },
  {
    id: 2,
    title: "Amuliya",
    subtitle: "Collection of Diamonds",
    image: amuliyaImage,
  },
  {
    id: 3,
    title: "Indian Bridal",
    subtitle: "Wedding Collection",
    image: indianBridalImage,
  },
  {
    id: 4,
    title: "Indian Ethnic",
    subtitle: "Traditional Collection",
    image: indianEthnicImage,
  },
  {
    id: 5,
    title: "Ruby and Emerald",
    subtitle: "Gemstone Collection",
    image: rubyEmeraldImage,
  },
  {
    id: 6,
    title: "Apsara Rose Gold",
    subtitle: "Rose Gold Collection",
    image: apsaraRoseGoldImage,
  },
];

function FeaturedCollections() {
  const navigate = useNavigate();

  return (
    <section
      className="home-featured-section"
      id="collections"
    >
      <div className="container">
        <div className="section-heading-center">
          <p className="section-eyebrow">
            Featured Collections
          </p>

          <h2 className="section-title">
            Discover Our Signature Collections
          </h2>

          <p className="section-description">
            Explore Muliya's distinctive jewellery collections,
            designed for weddings, traditions, celebrations,
            and everyday elegance.
          </p>
        </div>

        <div className="home-featured-grid">
          {collections.map((collection) => (
            <article
              className="home-featured-card"
              key={collection.id}
            >
              <div className="home-featured-image">
                <img
                  src={collection.image}
                  alt={collection.title}
                  loading="lazy"
                />
              </div>

              <div className="home-featured-content">
                <p className="home-featured-subtitle">
                  {collection.subtitle}
                </p>

                <h3>{collection.title}</h3>

                <button
                  type="button"
                  className="home-featured-button"
                  onClick={() => navigate("/collections")}
                >
                  View Collection
                  <ArrowRight size={16} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturedCollections;