import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const categories = [
  {
    id: 1,
    name: "Gold",
    subtitle: "Timeless Traditions",
    description:
      "Discover traditional and contemporary gold jewellery crafted for weddings, celebrations and everyday elegance.",
    link: "/gold",
    image:
      "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=1000&q=85",
  },
  {
    id: 2,
    name: "Diamond",
    subtitle: "Celebrate Brilliance",
    description:
      "Explore elegant diamond jewellery designed to make life's most memorable moments shine brighter.",
    link: "/diamond",
    image:
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1000&q=85",
  },
  {
    id: 3,
    name: "Silver",
    subtitle: "Crafted Elegance",
    description:
      "Discover silver jewellery, premium silverware, gifting collections and traditional silver articles.",
    link: "/silver",
    image:
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1000&q=85",
  },
];

function Categories() {
  return (
    <section className="categories-section">
      <div className="container">
        <div className="section-heading-center">
          <p className="section-eyebrow">Explore Our Jewellery</p>

          <h2 className="section-title">Discover Our Collections</h2>

          <p className="section-description">
            Explore jewellery collections crafted for traditions, celebrations,
            gifting and everyday elegance.
          </p>
        </div>

        <div className="categories-grid">
          {categories.map((category) => (
            <Link
              to={category.link}
              className="category-card"
              key={category.id}
            >
              <img
                src={category.image}
                alt={`${category.name} jewellery collection`}
              />

              <div className="category-card-overlay" />

              <div className="category-card-content">
                <p>{category.subtitle}</p>

                <h3>{category.name}</h3>

                <span className="category-description">
                  {category.description}
                </span>

                <div className="category-explore-link">
                  Explore Collection
                  <ArrowRight size={17} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Categories;