import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
} from "lucide-react";

const branches = [
  "Bengaluru",
  "Puttur",
  "Madikeri",
];

function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    branch: "Bengaluru",
    subject: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    console.log("Contact enquiry:", formData);

    setSubmitted(true);
  };

  return (
    <main className="contact-page">

      {/* HERO */}

      <section className="contact-hero">
        <div className="contact-hero-decoration contact-decoration-one" />
        <div className="contact-hero-decoration contact-decoration-two" />

        <div className="container contact-hero-layout">
          <div className="contact-hero-copy">
            <p className="section-eyebrow">
              Connect With Muliya
            </p>

            <h1>
              We’re Here to
              <span> Help You</span>
            </h1>

            <p>
              Have a question about a product, collection, showroom
              or appointment? Reach out to the Muliya team and we’ll
              help you with the information you need.
            </p>
          </div>

          <div className="contact-hero-card">
            <MessageSquare size={44} />

            <strong>
              Let’s Talk
            </strong>

            <span>
              Jewellery
              <br />
              Assistance
            </span>
          </div>
        </div>
      </section>


      {/* MAIN */}

      <section className="contact-main-section">
        <div className="container contact-main-grid">

          {/* CONTACT INFO */}

          <aside className="contact-info-panel">
            <p className="section-eyebrow">
              Contact Details
            </p>

            <h2>
              Get in Touch With Muliya
            </h2>

            <p className="contact-info-description">
              Choose the most convenient way to connect with us.
              Our team can assist with product enquiries, showroom
              visits and appointment requests.
            </p>


            <div className="contact-info-list">

              <div className="contact-info-item">
                <div>
                  <Phone size={20} />
                </div>

                <section>
                  <strong>Call Us</strong>
                  <span>
                    Contact your preferred Muliya showroom
                  </span>
                </section>
              </div>


              <div className="contact-info-item">
                <div>
                  <Mail size={20} />
                </div>

                <section>
                  <strong>Email</strong>
                  <span>
                    Send us your jewellery enquiry
                  </span>
                </section>
              </div>


              <div className="contact-info-item">
                <div>
                  <MapPin size={20} />
                </div>

                <section>
                  <strong>Visit a Showroom</strong>
                  <span>
                    Bengaluru, Puttur or Madikeri
                  </span>
                </section>
              </div>

            </div>


            <a
              href="/showrooms"
              className="contact-showrooms-link"
            >
              Explore Showrooms
              <ArrowRight size={17} />
            </a>
          </aside>


          {/* FORM */}

          <div className="contact-form-wrapper">

            <div className="contact-form-heading">
              <p className="section-eyebrow">
                Send an Enquiry
              </p>

              <h2>
                How Can We Help?
              </h2>

              <p>
                Fill in the form below and share your question
                with us.
              </p>
            </div>


            {submitted ? (
              <div className="contact-success">
                <div className="contact-success-icon">
                  <CheckCircle2 size={42} />
                </div>

                <h3>
                  Message Received
                </h3>

                <p>
                  Thank you, {formData.name || "Customer"}.
                  Your enquiry has been recorded successfully.
                </p>

                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form
                className="contact-form"
                onSubmit={handleSubmit}
              >

                <div className="contact-form-grid">

                  <label className="contact-field">
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


                  <label className="contact-field">
                    <span>
                      Email Address
                    </span>

                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      required
                    />
                  </label>


                  <label className="contact-field">
                    <span>
                      Phone Number
                    </span>

                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                    />
                  </label>


                  <label className="contact-field">
                    <span>
                      Preferred Showroom
                    </span>

                    <select
                      name="branch"
                      value={formData.branch}
                      onChange={handleChange}
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

                </div>


                <label className="contact-field">
                  <span>
                    Subject
                  </span>

                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Product enquiry, appointment, showroom..."
                    required
                  />
                </label>


                <label className="contact-field">
                  <span>
                    Message
                  </span>

                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us how we can help..."
                    rows={6}
                    required
                  />
                </label>


                <button
                  type="submit"
                  className="contact-submit-btn"
                >
                  <Send size={17} />
                  Send Enquiry
                </button>

              </form>
            )}

          </div>

        </div>
      </section>

    </main>
  );
}

export default ContactPage;