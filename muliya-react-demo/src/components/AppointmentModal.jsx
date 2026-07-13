import { useEffect, useState } from "react";
import { Calendar, Clock, MapPin, X } from "lucide-react";

import { createAppointment } from "../api/appointmentApi";

const branches = ["Bengaluru", "Puttur", "Madikeri"];

const appointmentTimes = [
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
  "6:00 PM",
  "7:00 PM",
];

function AppointmentModal({
  isOpen,
  onClose,
  product = null,
  defaultBranch = "",
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    preferredBranch: defaultBranch,
    appointmentDate: "",
    appointmentTime: "",
    message: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: "",
        email: "",
        phone: "",
        preferredBranch: defaultBranch || "",
        appointmentDate: "",
        appointmentTime: "",
        message: "",
      });

      setError("");
      setSuccessMessage("");
      setSubmitting(false);
    }
  }, [isOpen, defaultBranch]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";

      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  const getMinimumDate = () => {
    const today = new Date();

    const year = today.getFullYear();

    const month = String(today.getMonth() + 1).padStart(2, "0");

    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value,
    }));

    setError("");
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      return "Please enter your name.";
    }

    if (!formData.email.trim()) {
      return "Please enter your email address.";
    }

    if (!formData.phone.trim()) {
      return "Please enter your phone number.";
    }

    if (!formData.preferredBranch) {
      return "Please select a showroom.";
    }

    if (!formData.appointmentDate) {
      return "Please select an appointment date.";
    }

    if (!formData.appointmentTime) {
      return "Please select an appointment time.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccessMessage("");

      const appointmentData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        preferredBranch: formData.preferredBranch,
        appointmentDate: formData.appointmentDate,
        appointmentTime: formData.appointmentTime,
        message: formData.message.trim(),

        /*
          When opened from ProductDetails, product._id is sent.

          When opened from StoreLocator, there may be no selected
          product, so productId is omitted.
        */
        ...(product?._id
          ? {
              productId: product._id,
            }
          : {}),
      };

      const response = await createAppointment(appointmentData);

      setSuccessMessage(
        response.message ||
          "Your appointment request has been submitted successfully."
      );

      setFormData({
        name: "",
        email: "",
        phone: "",
        preferredBranch: defaultBranch || "",
        appointmentDate: "",
        appointmentTime: "",
        message: "",
      });
    } catch (requestError) {
      console.error(
        "Appointment submission error:",
        requestError
      );

      setError(
        requestError.message ||
          "Unable to submit your appointment request."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="appointment-modal-overlay"
      onMouseDown={onClose}
    >
      <div
        className="appointment-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="appointment-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="appointment-modal-close"
          onClick={onClose}
          aria-label="Close appointment form"
        >
          <X size={22} />
        </button>

        <div className="appointment-modal-header">
          <p className="section-eyebrow">
            Visit Our Showroom
          </p>

          <h2 id="appointment-modal-title">
            Book an Appointment
          </h2>

          <p>
            Choose your preferred showroom, date, and time.
            Our team will contact you to confirm your appointment.
          </p>
        </div>

        {product && (
          <div className="appointment-product-summary">
            <img
              src={product.image}
              alt={product.name}
            />

            <div>
              <span>Selected Jewellery</span>

              <h3>{product.name}</h3>

              <p>{product.code}</p>
            </div>
          </div>
        )}

        {successMessage ? (
          <div className="appointment-success">
            <Calendar size={34} />

            <h3>Appointment Request Received</h3>

            <p>{successMessage}</p>

            <button
              type="button"
              className="primary-btn"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        ) : (
          <form
            className="appointment-form"
            onSubmit={handleSubmit}
          >
            <div className="appointment-form-grid">
              <div className="appointment-form-group">
                <label htmlFor="appointment-name">
                  Full Name
                </label>

                <input
                  id="appointment-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  required
                />
              </div>

              <div className="appointment-form-group">
                <label htmlFor="appointment-email">
                  Email Address
                </label>

                <input
                  id="appointment-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="appointment-form-group">
                <label htmlFor="appointment-phone">
                  Phone Number
                </label>

                <input
                  id="appointment-phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  autoComplete="tel"
                  required
                />
              </div>

              <div className="appointment-form-group">
                <label htmlFor="appointment-branch">
                  Preferred Showroom
                </label>

                <div className="appointment-input-icon">
                  <MapPin size={17} />

                  <select
                    id="appointment-branch"
                    name="preferredBranch"
                    value={formData.preferredBranch}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      Select showroom
                    </option>

                    {branches.map((branch) => (
                      <option
                        value={branch}
                        key={branch}
                      >
                        {branch}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="appointment-form-group">
                <label htmlFor="appointment-date">
                  Appointment Date
                </label>

                <div className="appointment-input-icon">
                  <Calendar size={17} />

                  <input
                    id="appointment-date"
                    type="date"
                    name="appointmentDate"
                    value={formData.appointmentDate}
                    onChange={handleChange}
                    min={getMinimumDate()}
                    required
                  />
                </div>
              </div>

              <div className="appointment-form-group">
                <label htmlFor="appointment-time">
                  Appointment Time
                </label>

                <div className="appointment-input-icon">
                  <Clock size={17} />

                  <select
                    id="appointment-time"
                    name="appointmentTime"
                    value={formData.appointmentTime}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      Select time
                    </option>

                    {appointmentTimes.map((time) => (
                      <option
                        value={time}
                        key={time}
                      >
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="appointment-form-group">
              <label htmlFor="appointment-message">
                Message (Optional)
              </label>

              <textarea
                id="appointment-message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us about the jewellery you are interested in or any special requirements."
                rows="4"
                maxLength="1000"
              />
            </div>

            {error && (
              <div className="appointment-form-error">
                {error}
              </div>
            )}

            <div className="appointment-form-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-btn"
                disabled={submitting}
              >
                {submitting
                  ? "Submitting..."
                  : "Request Appointment"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default AppointmentModal;