import { useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Gem,
  MapPin,
  Phone,
  User,
} from "lucide-react";

const branches = [
  "Bengaluru",
  "Puttur",
  "Madikeri",
];

function AppointmentPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    branch: "Bengaluru",
    date: "",
    time: "",
    purpose: "",
    notes: "",
  });

  const [submitted, setSubmitted] =
    useState(false);

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    /*
      For now this confirms the UI flow.

      Later we can connect this to:
      POST /api/appointments
    */

    console.log(
      "Appointment request:",
      formData,
    );

    setSubmitted(true);
  };

  return (
    <main className="appointment-page">

      {/* HERO */}

      <section className="appointment-hero">
        <div className="appointment-hero-decoration appointment-decoration-one" />
        <div className="appointment-hero-decoration appointment-decoration-two" />

        <div className="container appointment-hero-layout">

          <div className="appointment-hero-copy">
            <p className="section-eyebrow">
              Personal Jewellery Experience
            </p>

            <h1>
              Book Your
              <span> Jewellery Consultation</span>
            </h1>

            <p>
              Schedule a personalised visit to a Muliya showroom
              and receive assistance with jewellery selection,
              collections, product availability and special
              occasions.
            </p>
          </div>

          <div className="appointment-hero-card">
            <CalendarDays size={42} />

            <strong>
              Personal
            </strong>

            <span>
              Jewellery
              <br />
              Assistance
            </span>
          </div>

        </div>
      </section>


      {/* MAIN SECTION */}

      <section className="appointment-main-section">
        <div className="container appointment-main-grid">

          {/* FORM */}

          <div className="appointment-form-wrapper">

            <div className="appointment-form-heading">
              <p className="section-eyebrow">
                Schedule Your Visit
              </p>

              <h2>
                Book an Appointment
              </h2>

              <p>
                Share your preferred showroom and visit details.
                Our team can then assist you with the jewellery
                you are interested in.
              </p>
            </div>


            {submitted ? (
              <div className="appointment-success">

                <div className="appointment-success-icon">
                  <CheckCircle2 size={42} />
                </div>

                <h3>
                  Appointment Request Received
                </h3>

                <p>
                  Thank you, {formData.name || "Customer"}.
                  Your appointment request for the
                  {" "}
                  <strong>{formData.branch}</strong>
                  {" "}
                  showroom has been recorded.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setSubmitted(false)
                  }
                >
                  Book Another Appointment
                </button>

              </div>
            ) : (
              <form
                className="appointment-form"
                onSubmit={handleSubmit}
              >

                <div className="appointment-form-grid">

                  <label className="appointment-field">
                    <span>
                      Full Name
                    </span>

                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your name"
                      required
                    />
                  </label>


                  <label className="appointment-field">
                    <span>
                      Phone Number
                    </span>

                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                      required
                    />
                  </label>


                  <label className="appointment-field">
                    <span>
                      Email Address
                    </span>

                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter email address"
                    />
                  </label>


                  <label className="appointment-field">
                    <span>
                      Preferred Showroom
                    </span>

                    <select
                      name="branch"
                      value={formData.branch}
                      onChange={handleChange}
                      required
                    >
                      {branches.map((branch) => (
                        <option
                          value={branch}
                          key={branch}
                        >
                          {branch}
                        </option>
                      ))}
                    </select>
                  </label>


                  <label className="appointment-field">
                    <span>
                      Preferred Date
                    </span>

                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                    />
                  </label>


                  <label className="appointment-field">
                    <span>
                      Preferred Time
                    </span>

                    <input
                      type="time"
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                      required
                    />
                  </label>

                </div>


                <label className="appointment-field">
                  <span>
                    What are you looking for?
                  </span>

                  <select
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      Select jewellery interest
                    </option>

                    <option value="Gold Jewellery">
                      Gold Jewellery
                    </option>

                    <option value="Diamond Jewellery">
                      Diamond Jewellery
                    </option>

                    <option value="Bridal Jewellery">
                      Bridal Jewellery
                    </option>

                    <option value="Collections">
                      Signature Collections
                    </option>

                    <option value="Product Enquiry">
                      Specific Product Enquiry
                    </option>

                    <option value="Other">
                      Other
                    </option>
                  </select>
                </label>


                <label className="appointment-field">
                  <span>
                    Additional Notes
                  </span>

                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Tell us about the jewellery, occasion or product you are interested in..."
                    rows={5}
                  />
                </label>


                <button
                  type="submit"
                  className="appointment-submit-btn"
                >
                  <CalendarDays size={18} />

                  Request Appointment
                </button>

              </form>
            )}

          </div>


          {/* RIGHT SIDE */}

          <aside className="appointment-info-panel">

            <div className="appointment-info-icon">
              <Gem size={34} />
            </div>

            <p className="appointment-info-label">
              Muliya Showroom Experience
            </p>

            <h2>
              Personalised Assistance for Every Occasion
            </h2>

            <p className="appointment-info-description">
              Whether you are selecting bridal jewellery,
              exploring a signature collection or checking
              a particular product, our showroom team can
              assist you personally.
            </p>


            <div className="appointment-benefits">

              <div>
                <User size={19} />

                <section>
                  <strong>
                    Personal Consultation
                  </strong>

                  <span>
                    One-to-one assistance with jewellery
                    selection.
                  </span>
                </section>
              </div>


              <div>
                <MapPin size={19} />

                <section>
                  <strong>
                    Choose Your Showroom
                  </strong>

                  <span>
                    Bengaluru, Puttur or Madikeri.
                  </span>
                </section>
              </div>


              <div>
                <Clock3 size={19} />

                <section>
                  <strong>
                    Preferred Time
                  </strong>

                  <span>
                    Select the date and time convenient for
                    your visit.
                  </span>
                </section>
              </div>


              <div>
                <Phone size={19} />

                <section>
                  <strong>
                    Follow-up Assistance
                  </strong>

                  <span>
                    Your request can be followed up by the
                    showroom team.
                  </span>
                </section>
              </div>

            </div>

          </aside>

        </div>
      </section>

    </main>
  );
}

export default AppointmentPage;