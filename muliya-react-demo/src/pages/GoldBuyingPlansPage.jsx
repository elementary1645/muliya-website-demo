import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeIndianRupee,
  CalendarDays,
  CheckCircle2,
  Gem,
  HandCoins,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const jsapHighlights = [
  "Save ₹1,000 or more per month",
  "Plan duration: 12 months",
  "Get 50% of one installment as a bonus",
  "Redeem for gold jewellery at any Muliya showroom",
  "Transparent gold rate applies on the day of purchase",
];

const pipHighlights = [
  "Minimum deposit: ₹1,00,000",
  "Tenure: 12 months",
  "For 6 months: 25% off on VA",
  "For 12 months: 50% off on VA",
  "Redemption adjusted in gold or discount",
  "Exclusive plan for loyal Muliya customers",
];

function GoldBuyingPlansPage() {
  return (
    <main className="gold-plans-page">

      {/* HERO */}

      <section className="gold-plans-hero">
        <div className="container gold-plans-hero-content">
          <p className="section-eyebrow">
            Smart Jewellery Planning
          </p>

          <h1>
            Gold Buying Plans
          </h1>

          <p>
            Plan ahead for weddings, festive occasions,
            gifting or future jewellery purchases with
            Muliya's structured gold buying plans.
          </p>
        </div>
      </section>


      {/* INTRO */}

      <section className="gold-plans-intro">
        <div className="container gold-plans-intro-grid">

          <div className="gold-plans-intro-copy">
            <p className="section-eyebrow">
              Plan Today. Celebrate Tomorrow.
            </p>

            <h2>
              Make Your Gold Dreams a Reality
            </h2>

            <p>
              Whether you're planning for a wedding, a festive
              occasion or simply investing towards a future
              jewellery purchase, Muliya's Gold Buying Plans
              help you plan your purchase in a structured and
              convenient way.
            </p>

            <p>
              Choose from two plans designed for different
              buying needs.
            </p>

            <div className="gold-plan-mini-list">
              <div>
                <HandCoins size={20} />

                <section>
                  <strong>
                    Jewel SAP
                  </strong>

                  <span>
                    Monthly jewellery savings plan
                  </span>
                </section>
              </div>

              <div>
                <BadgeIndianRupee size={20} />

                <section>
                  <strong>
                    Partner in Progress
                  </strong>

                  <span>
                    One-time investment plan
                  </span>
                </section>
              </div>
            </div>
          </div>


          <div className="gold-plans-intro-card">
            <Gem size={52} />

            <span>
              Muliya Jewels
            </span>

            <strong>
              Gold Buying Plans
            </strong>
          </div>

        </div>
      </section>


      {/* JSAP */}

      <section className="gold-plan-section">
        <div className="container gold-plan-grid">

          <div className="gold-plan-copy">
            <p className="gold-plan-number">
              Plan 01
            </p>

            <h2>
              Muliya Jewel SAP
              <span> (JSAP)</span>
            </h2>

            <h3>
              Your Monthly Jewellery Savings Plan
            </h3>

            <div className="gold-plan-block">
              <strong>
                Overview
              </strong>

              <p>
                A monthly installment plan that allows you
                to save consistently and receive bonus
                benefits at the end of the term.
              </p>
            </div>

            <div className="gold-plan-block">
              <strong>
                Best For
              </strong>

              <p>
                Wedding shoppers, gifting and long-term
                jewellery planning.
              </p>
            </div>

            <Link
              to="/appointment"
              className="gold-plan-primary-btn"
            >
              Join JSAP Today
              <ArrowRight size={17} />
            </Link>

            <small className="gold-plan-terms">
              * Terms & Conditions apply
            </small>
          </div>


          <div className="gold-plan-highlights-card">

            <div className="gold-plan-card-icon">
              <Sparkles size={31} />
            </div>

            <p className="gold-plan-card-label">
              Jewel SAP
            </p>

            <h3>
              Plan Highlights
            </h3>

            <div className="gold-plan-highlights">
              {jsapHighlights.map((highlight) => (
                <div key={highlight}>
                  <CheckCircle2 size={17} />

                  <span>
                    {highlight}
                  </span>
                </div>
              ))}
            </div>

          </div>

        </div>
      </section>


      {/* PIP */}

      <section className="gold-plan-section gold-plan-section-alt">
        <div className="container gold-plan-grid">

          <div className="gold-plan-copy">
            <p className="gold-plan-number">
              Plan 02
            </p>

            <h2>
              Partner in Progress
              <span> (PIP)</span>
            </h2>

            <h3>
              A Loyalty-Based One-Time Investment Plan
            </h3>

            <div className="gold-plan-block">
              <strong>
                Overview
              </strong>

              <p>
                Designed for customers making high-value
                purchases. Invest once and receive plan
                benefits towards your jewellery purchase.
              </p>
            </div>

            <div className="gold-plan-block">
              <strong>
                Best For
              </strong>

              <p>
                Bulk buyers, high-value purchasers and
                loyal customers.
              </p>
            </div>

            <div className="gold-plan-actions">
              <Link
                to="/appointment"
                className="gold-plan-primary-btn"
              >
                Start Your PIP Journey
              </Link>

              <Link
                to="/contact"
                className="gold-plan-secondary-btn"
              >
                Talk to an Advisor
              </Link>
            </div>

            <small className="gold-plan-terms">
              * Terms & Conditions apply
            </small>
          </div>


          <div className="gold-plan-highlights-card">

            <div className="gold-plan-card-icon">
              <ShieldCheck size={31} />
            </div>

            <p className="gold-plan-card-label">
              Partner in Progress
            </p>

            <h3>
              Plan Highlights
            </h3>

            <div className="gold-plan-highlights">
              {pipHighlights.map((highlight) => (
                <div key={highlight}>
                  <CheckCircle2 size={17} />

                  <span>
                    {highlight}
                  </span>
                </div>
              ))}
            </div>

          </div>

        </div>
      </section>


      {/* COMPARISON */}

      <section className="gold-plan-comparison-section">
        <div className="container">

          <div className="gold-plan-comparison-heading">
            <p className="section-eyebrow">
              Choose the Right Plan
            </p>

            <h2>
              Compare the Plans
            </h2>

            <p>
              Compare both plans and select the option
              that best matches your jewellery purchase
              requirements.
            </p>
          </div>


          <div className="gold-plan-table-wrapper">

            <table className="gold-plan-table">

              <thead>
                <tr>
                  <th>
                    Feature
                  </th>

                  <th>
                    Jewel SAP (JSAP)
                  </th>

                  <th>
                    PIP (Partner in Progress)
                  </th>
                </tr>
              </thead>

              <tbody>

                <tr>
                  <td>
                    Type of Plan
                  </td>

                  <td>
                    Monthly Installments
                  </td>

                  <td>
                    One-Time Investment
                  </td>
                </tr>

                <tr>
                  <td>
                    Minimum Contribution
                  </td>

                  <td>
                    ₹1,000/month
                  </td>

                  <td>
                    ₹1,00,000
                  </td>
                </tr>

                <tr>
                  <td>
                    Duration
                  </td>

                  <td>
                    12 months
                  </td>

                  <td>
                    12 months
                  </td>
                </tr>

                <tr>
                  <td>
                    Maturity Benefit
                  </td>

                  <td>
                    50% bonus on one installment
                  </td>

                  <td>
                    6 months: 25% off VA
                    <br />
                    12 months: 50% off VA
                  </td>
                </tr>

                <tr>
                  <td>
                    Redemption
                  </td>

                  <td>
                    Jewellery purchase
                  </td>

                  <td>
                    Gold or purchase discount
                  </td>
                </tr>

                <tr>
                  <td>
                    Ideal For
                  </td>

                  <td>
                    Planned buyers & families
                  </td>

                  <td>
                    Bulk buyers & high-value purchasers
                  </td>
                </tr>

              </tbody>

            </table>

          </div>

        </div>
      </section>


      {/* CTA */}

      <section className="gold-plans-final-cta">
        <div className="container gold-plans-final-layout">

          <div>
            <p className="section-eyebrow">
              Need Assistance?
            </p>

            <h2>
              Find the Right Plan for Your Jewellery Goals
            </h2>

            <p>
              Speak with a Muliya jewellery advisor to
              understand the plans and choose an option
              based on your purchase requirements.
            </p>
          </div>

          <Link
            to="/appointment"
            className="gold-plan-cta-btn"
          >
            <CalendarDays size={18} />
            Book a Consultation
          </Link>

        </div>
      </section>

    </main>
  );
}

export default GoldBuyingPlansPage;