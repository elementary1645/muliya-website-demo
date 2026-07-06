import { ArrowRight } from "lucide-react";

const collections = [
  {
    id: 1,
    title: "Bridal Collection",
    subtitle: "For the big day",
    description:
      "Traditional and elegant jewellery designs crafted for weddings and grand celebrations.",
    image:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1000&q=85",
  },
  {
    id: 2,
    title: "Temple Collection",
    subtitle: "Rooted in tradition",
    description:
      "Heritage-inspired gold jewellery designs with classic South Indian craftsmanship.",
    image:
      "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=1000&q=85",
  },
  {
    id: 3,
    title: "Daily Wear",
    subtitle: "Everyday elegance",
    description:
      "Lightweight jewellery designs made for comfort, style, and regular wear.",
    image:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=85",
  },
];

function FeaturedCollections() {
  return (
    <section className="featured-collections-section" id="collections">
      <div className="container">
        <div className="section-heading-center">
          <p className="section-eyebrow">Featured Collections</p>

          <h2 className="section-title">Designed for Every Moment</h2>

          <p className="section-description">
            From bridal jewellery to everyday wear, the collection section helps
            customers quickly discover designs based on occasion and style.
          </p>
        </div>

        <div className="featured-collections-grid">
          {collections.map((collection) => (
            <article className="collection-card" key={collection.id}>
              <div className="collection-image">
                <img src={collection.image} alt={collection.title} />
              </div>

              <div className="collection-content">
                <p>{collection.subtitle}</p>

                <h3>{collection.title}</h3>

                <span>{collection.description}</span>

                <button className="collection-btn">
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