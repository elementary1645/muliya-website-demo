import {
  Award,
  BadgeCheck,
  Gem,
  ShieldCheck,
} from "lucide-react";

const reasons = [
  {
    id: 1,
    icon: <Award size={28} />,
    title: "Since 1944",
    description:
      "A jewellery brand built on decades of trust, tradition and customer relationships.",
  },
  {
    id: 2,
    icon: <BadgeCheck size={28} />,
    title: "Certified Jewellery",
    description:
      "Gold, diamond and silver jewellery supported by quality checks and certification standards.",
  },
  {
    id: 3,
    icon: <Gem size={28} />,
    title: "Wide Collections",
    description:
      "Collections for weddings, festive occasions, gifting, daily wear and traditional jewellery needs.",
  },
  {
    id: 4,
    icon: <ShieldCheck size={28} />,
    title: "Trusted Showrooms",
    description:
      "Branch-wise availability and showroom support make product discovery easier for customers.",
  },
];

function WhyChooseUs() {
  return (
    <section className="why-choose-us-section">
      <div className="container">
        <div className="section-heading-center">
          <p className="section-eyebrow">Why Choose Muliya</p>

          <h2 className="section-title">Trust, Craftsmanship & Service</h2>

          <p className="section-description">
            This section highlights the core brand strengths while the new
            digital features improve product discovery and customer enquiries.
          </p>
        </div>

        <div className="why-grid">
          {reasons.map((reason) => (
            <article className="why-card" key={reason.id}>
              <div className="why-icon">{reason.icon}</div>

              <h3>{reason.title}</h3>

              <p>{reason.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default WhyChooseUs;