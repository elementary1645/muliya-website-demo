import { Link } from "react-router-dom";
import {
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Youtube,
} from "lucide-react";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="container footer-grid">
          <div className="footer-brand-column">
            <Link to="/" className="footer-brand">
              <div className="footer-brand-mark">M</div>

              <div>
                <h2>Muliya</h2>
                <p>Gold & Diamonds</p>
              </div>
            </Link>

            <p className="footer-description">
              Explore gold, diamond and silver jewellery through an improved
              digital discovery experience with smart search, AI image search,
              wishlist, comparison and branch availability.
            </p>

            <div className="footer-socials">
              <a href="#" aria-label="Instagram">
                <Instagram size={18} />
              </a>

              <a href="#" aria-label="Facebook">
                <Facebook size={18} />
              </a>

              <a href="#" aria-label="YouTube">
                <Youtube size={18} />
              </a>
            </div>
          </div>

          <div className="footer-column">
            <h3>Jewellery</h3>

            <ul>
              <li>
                <Link to="/gold">Gold Jewellery</Link>
              </li>

              <li>
                <Link to="/diamond">Diamond Jewellery</Link>
              </li>

              <li>
                <Link to="/silver">Silver Collection</Link>
              </li>

              <li>
                <a href="/#collections">Featured Collections</a>
              </li>

              <li>
                <a href="/#ai-search">AI Image Search</a>
              </li>
            </ul>
          </div>

          <div className="footer-column">
            <h3>Quick Links</h3>

            <ul>
              <li>
                <a href="/#stores">Our Showrooms</a>
              </li>

              <li>
                <a href="#">Gold Buying Plans</a>
              </li>

              <li>
                <a href="#">Virtual Tour</a>
              </li>

              <li>
                <a href="#">Book Appointment</a>
              </li>

              <li>
                <a href="#">Contact Us</a>
              </li>
            </ul>
          </div>

          <div className="footer-column footer-contact-column">
            <h3>Contact</h3>

            <div className="footer-contact-item">
              <MapPin size={18} />

              <p>
                Visit your nearest Muliya Gold & Diamonds showroom for jewellery
                enquiries and product assistance.
              </p>
            </div>

            <div className="footer-contact-item">
              <Phone size={18} />

              <p>Contact your preferred showroom</p>
            </div>

            <div className="footer-contact-item">
              <Mail size={18} />

              <p>Customer enquiries and appointment assistance</p>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-content">
          <p>
            © {new Date().getFullYear()} Muliya Gold & Diamonds. React website
            prototype for demonstration purposes.
          </p>

          <div className="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms & Conditions</a>
            <a href="#">Disclaimer</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;