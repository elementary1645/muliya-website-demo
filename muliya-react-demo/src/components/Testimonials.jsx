import { Quote, Star } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Ananya Rao",
    location: "Bengaluru",
    message:
      "The improved website experience makes it easier to explore collections before visiting the showroom.",
  },
  {
    id: 2,
    name: "Rohit Shetty",
    location: "Puttur",
    message:
      "Features like wishlist, comparison and branch availability would make jewellery selection much more convenient.",
  },
  {
    id: 3,
    name: "Meera Bhat",
    location: "Madikeri",
    message:
      "AI image search is very useful because customers often come with reference images from social media.",
  },
];

function Testimonials() {
  return (
    <section className="testimonials-section">
      <div className="container">
        <div className="section-heading-center">
          <p className="section-eyebrow">Customer Experience</p>

          <h2 className="section-title">Built Around Jewellery Discovery</h2>

          <p className="section-description">
            These sample testimonials show how the proposed features improve
            the customer journey from browsing to showroom visit.
          </p>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((item) => (
            <article className="testimonial-card" key={item.id}>
              <Quote className="quote-icon" size={30} />

              <div className="testimonial-stars">
                <Star size={15} fill="currentColor" />
                <Star size={15} fill="currentColor" />
                <Star size={15} fill="currentColor" />
                <Star size={15} fill="currentColor" />
                <Star size={15} fill="currentColor" />
              </div>

              <p className="testimonial-message">“{item.message}”</p>

              <div className="testimonial-user">
                <h3>{item.name}</h3>
                <span>{item.location}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;