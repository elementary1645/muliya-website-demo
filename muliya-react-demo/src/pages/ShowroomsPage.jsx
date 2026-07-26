import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  MapPin,
  Phone,
  Store,
} from "lucide-react";

const showrooms = [
  {
    id: 1,
    branch: "Bengaluru",
    title: "Muliya Bengaluru",
    address:
      "Visit our Bengaluru showroom to explore gold, diamond, bridal and contemporary jewellery collections.",
    hours: "10:00 AM – 8:00 PM",
    phone: "Contact showroom",
  },
  {
    id: 2,
    branch: "Puttur",
    title: "Muliya Puttur",
    address:
      "Discover Muliya's signature collections and personalised jewellery assistance at our Puttur showroom.",
    hours: "10:00 AM – 8:00 PM",
    phone: "Contact showroom",
  },
  {
    id: 3,
    branch: "Madikeri",
    title: "Muliya Madikeri",
    address:
      "Explore selected Muliya jewellery collections and showroom assistance at our Madikeri location.",
    hours: "10:00 AM – 8:00 PM",
    phone: "Contact showroom",
  },
];

function ShowroomsPage() {
  return (
    <main className="showrooms-page">

      {/* HERO */}

      <section className="showrooms-page-hero">
        <div className="showrooms-page-decoration showrooms-page-decoration-one" />
        <div className="showrooms-page-decoration showrooms-page-decoration-two" />

        <div className="container showrooms-page-hero-layout">
          <div className="showrooms-page-hero-copy">
            <p className="section-eyebrow">
              Visit Muliya
            </p>

            <h1>
              Discover Jewellery
              <span> In Person</span>
            </h1>

            <p className="showrooms-page-hero-description">
              Visit a Muliya showroom for personalised jewellery
              assistance, collection discovery and branch-specific
              product availability.
            </p>

            <div className="showrooms-page-hero-actions">
              <Link
                to="/appointment"
                className="showrooms-primary-btn"
              >
                Book an Appointment
                <CalendarDays size={18} />
              </Link>

              <Link
                to="/products"
                className="showrooms-secondary-btn"
              >
                Browse Jewellery
              </Link>
            </div>
          </div>

          <div className="showrooms-page-hero-card">
            <div className="showrooms-page-hero-icon">
              <Store size={45} />
            </div>

            <strong>3</strong>

            <span>
              Showroom
              <br />
              Locations
            </span>
          </div>
        </div>
      </section>


      {/* SHOWROOMS */}

      <section className="showrooms-page-section">
        <div className="container">

          <div className="showrooms-page-heading">
            <div>
              <p className="section-eyebrow">
                Our Locations
              </p>

              <h2>
                Find Your Nearest Muliya Showroom
              </h2>
            </div>

            <p>
              Explore branch-specific jewellery and connect with
              showroom teams for availability, appointments and
              personalised assistance.
            </p>
          </div>

          <div className="showrooms-page-grid">
            {showrooms.map((showroom) => (
              <article
                key={showroom.id}
                className="showrooms-page-card"
              >
                <div className="showrooms-page-card-top">
                  <div className="showrooms-page-card-icon">
                    <MapPin size={24} />
                  </div>

                  <span>
                    {String(showroom.id).padStart(2, "0")}
                  </span>
                </div>

                <p className="showrooms-page-city">
                  {showroom.branch}
                </p>

                <h3>{showroom.title}</h3>

                <p className="showrooms-page-address">
                  {showroom.address}
                </p>

                <div className="showrooms-page-details">

                  <div>
                    <Clock3 size={17} />

                    <span>
                      {showroom.hours}
                    </span>
                  </div>

                  <div>
                    <Phone size={17} />

                    <span>
                      {showroom.phone}
                    </span>
                  </div>

                </div>

                <div className="showrooms-page-card-actions">

                  <Link
                    to={`/showrooms/${encodeURIComponent(
                      showroom.branch
                    )}`}
                    className="showrooms-view-btn"
                  >
                    View Collection
                    <ArrowRight size={17} />
                  </Link>

                  <Link
                    to="/appointment"
                    className="showrooms-appointment-link"
                  >
                    Book Appointment
                  </Link>

                </div>
              </article>
            ))}
          </div>

        </div>
      </section>


      {/* EXPERIENCE */}

      <section className="showrooms-experience-section">
        <div className="container showrooms-experience-layout">

          <div>
            <p className="section-eyebrow">
              Personal Experience
            </p>

            <h2>
              Jewellery Is Best Experienced Up Close
            </h2>

            <p>
              View craftsmanship, understand product details,
              check branch availability and receive personalised
              recommendations from the Muliya showroom team.
            </p>
          </div>

          <Link
            to="/appointment"
            className="showrooms-primary-btn"
          >
            Schedule Your Visit
            <ArrowRight size={18} />
          </Link>

        </div>
      </section>

    </main>
  );
}

export default ShowroomsPage;