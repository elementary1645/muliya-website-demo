import { MapPin, Phone, Clock, Navigation, Calendar } from "lucide-react";

const stores = [
  {
    id: 1,
    city: "Bengaluru",
    showroom: "Muliya Gold & Diamonds",
    address:
      "Jayanagar, Bengaluru, Karnataka",
    phone: "+91 98765 43210",
    hours: "10:00 AM - 8:30 PM",
    availability: "1200+ Designs Available",
  },
  {
    id: 2,
    city: "Puttur",
    showroom: "Muliya Gold & Diamonds",
    address:
      "Main Road, Puttur, Karnataka",
    phone: "+91 98765 43211",
    hours: "10:00 AM - 8:30 PM",
    availability: "900+ Designs Available",
  },
  {
    id: 3,
    city: "Madikeri",
    showroom: "Muliya Gold & Diamonds",
    address:
      "Madikeri Town, Karnataka",
    phone: "+91 98765 43212",
    hours: "10:00 AM - 8:30 PM",
    availability: "650+ Designs Available",
  },
];

function StoreLocator() {
  return (
    <section className="store-locator-section" id="stores">
      <div className="container">

        <div className="section-heading-center">
          <p className="section-eyebrow">
            Visit Our Showrooms
          </p>

          <h2 className="section-title">
            Find a Store Near You
          </h2>

          <p className="section-description">
            Check jewellery availability across all branches,
            schedule appointments, and get directions instantly.
          </p>
        </div>

        <div className="stores-grid">
          {stores.map((store) => (
            <div className="store-card" key={store.id}>

              <div className="store-city">
                {store.city}
              </div>

              <h3>{store.showroom}</h3>

              <div className="store-detail">
                <MapPin size={17}/>
                <span>{store.address}</span>
              </div>

              <div className="store-detail">
                <Phone size={17}/>
                <span>{store.phone}</span>
              </div>

              <div className="store-detail">
                <Clock size={17}/>
                <span>{store.hours}</span>
              </div>

              <div className="availability-badge">
                {store.availability}
              </div>

              <div className="store-buttons">

                <button className="primary-btn">
                  Check Availability
                </button>

                <button className="secondary-btn">
                  <Calendar size={16}/>
                  Appointment
                </button>

                <button className="secondary-btn">
                  <Navigation size={16}/>
                  Directions
                </button>

              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default StoreLocator;