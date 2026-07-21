import { Link } from "react-router-dom";
import { Mail, MapPin, Phone } from "lucide-react";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="container footer-grid">
          {/* Brand */}
          <div className="footer-brand-column">
            <Link
              to="/"
              className="footer-brand"
              aria-label="Muliya Gold and Diamonds Home"
            >
              <div className="footer-brand-mark">M</div>

              <div>
                <h2>Muliya</h2>
                <p>Gold &amp; Diamonds</p>
              </div>
            </Link>

            <p className="footer-description">
              Discover premium gold, diamond and silver jewellery through our
              modern digital experience featuring AI image search, smart product
              discovery, wishlist, comparison and appointment booking.
            </p>

            <div className="footer-socials">
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                IG
              </a>

              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                FB
              </a>

              <a
                href="https://www.youtube.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
              >
                YT
              </a>
            </div>
          </div>

          {/* Jewellery */}
          <div className="footer-column">
            <h3>Jewellery</h3>

            <ul>
              <li>
                <Link to="/products">All Jewellery</Link>
              </li>

              <li>
                <Link to="/gold">Gold Jewellery</Link>
              </li>

              <li>
                <Link to="/diamond">Diamond Jewellery</Link>
              </li>

              <li>
                <Link to="/silver">Silver Jewellery</Link>
              </li>

              <li>
                <Link to="/collections">Collections</Link>
              </li>

              <li>
                <Link to="/image-search">AI Image Search</Link>
              </li>
            </ul>
          </div>

          {/* Customer Services */}
          <div className="footer-column">
            <h3>Customer Services</h3>

            <ul>
              <li>
                <Link to="/showrooms">Our Showrooms</Link>
              </li>

              <li>
                <Link to="/appointment">Book Appointment</Link>
              </li>

              <li>
                <Link to="/contact">Contact Us</Link>
              </li>

              <li>
                <Link to="/wishlist">Wishlist</Link>
              </li>

              <li>
                <Link to="/compare">Compare Jewellery</Link>
              </li>

              <li>
                <Link to="/gold-prediction">
                  Gold Price Prediction
                </Link>
              </li>
            </ul>
          </div>

          {/* Information */}
          <div className="footer-column">
            <h3>Information</h3>

            <ul>
              <li>
                <Link to="/about">About Us</Link>
              </li>

              <li>
                <Link to="/faq">FAQ</Link>
              </li>

              <li>
                <Link to="/privacy">Privacy Policy</Link>
              </li>

              <li>
                <Link to="/terms">Terms &amp; Conditions</Link>
              </li>

              <li>
                <Link to="/disclaimer">Disclaimer</Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-column footer-contact-column">
            <h3>Contact</h3>

            <Link to="/showrooms" className="footer-contact-item">
              <MapPin size={18} />

              <p>
                Find your nearest Muliya Gold &amp; Diamonds showroom.
              </p>
            </Link>

            <Link to="/contact" className="footer-contact-item">
              <Phone size={18} />

              <p>Speak with our jewellery experts.</p>
            </Link>

            <Link to="/contact" className="footer-contact-item">
              <Mail size={18} />

              <p>Customer support and appointment assistance.</p>
            </Link>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-content">
          <p>
            © {currentYear} Muliya Gold &amp; Diamonds. All Rights Reserved.
          </p>

          <div className="footer-bottom-links">
            <Link to="/privacy">Privacy Policy</Link>

            <Link to="/terms">Terms &amp; Conditions</Link>

            <Link to="/disclaimer">Disclaimer</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;