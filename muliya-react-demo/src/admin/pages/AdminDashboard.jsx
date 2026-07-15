import {
  CalendarDays,
  CircleDollarSign,
  Clock3,
  Gem,
  Images,
  MessageSquareText,
  Package,
  Store,
  UserRoundCheck,
} from "lucide-react";

import { useAdminAuth } from "../context/AdminAuthContext";

const summaryCards = [
  {
    label: "Total Products",
    value: "18",
    description: "Products currently listed",
    icon: Package,
  },
  {
    label: "Pending Appointments",
    value: "2",
    description: "Awaiting confirmation",
    icon: CalendarDays,
  },
  {
    label: "Customer Enquiries",
    value: "1",
    description: "New enquiry received",
    icon: MessageSquareText,
  },
  {
    label: "Expert Requests",
    value: "2",
    description: "Jewellery expert callbacks",
    icon: UserRoundCheck,
  },
];

const recentActivity = [
  {
    title: "New showroom appointment",
    description:
      "A customer requested a Bengaluru showroom appointment.",
    time: "Recently",
    icon: CalendarDays,
  },
  {
    title: "New expert request",
    description:
      "A customer requested help choosing bridal jewellery.",
    time: "Recently",
    icon: UserRoundCheck,
  },
  {
    title: "AI Image Search",
    description:
      "The AI image search service is running successfully.",
    time: "System",
    icon: Images,
  },
  {
    title: "Gold Prediction",
    description:
      "Experimental gold prediction model is online.",
    time: "System",
    icon: CircleDollarSign,
  },
];

export default function AdminDashboard() {
  const { admin } = useAdminAuth();

  return (
    <div className="admin-dashboard-page">
      <section className="admin-dashboard-header">
        <div>
          <p className="admin-section-eyebrow">
            Administration Overview
          </p>

          <h1>
            Welcome back, {admin?.name || "Administrator"}
          </h1>

          <p>
            Manage products, appointments, enquiries,
            AI services and inventory.
          </p>
        </div>

        <div className="admin-dashboard-profile-card">
          <div>
            <span>Role</span>
            <strong>{admin?.role}</strong>
          </div>

          <div>
            <span>Branch</span>
            <strong>{admin?.branch}</strong>
          </div>
        </div>
      </section>

      <section className="admin-summary-grid">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              className="admin-summary-card"
              key={card.label}
            >
              <div className="admin-summary-card-icon">
                <Icon size={24} />
              </div>

              <div>
                <span>{card.label}</span>

                <h2>{card.value}</h2>

                <p>{card.description}</p>
              </div>
            </div>
          );
        })}
      </section>

      <section className="admin-dashboard-content-grid">
        <div className="admin-dashboard-panel">
          <div className="admin-dashboard-panel-header">
            <div>
              <p className="admin-section-eyebrow">
                Activity
              </p>

              <h2>Recent Activity</h2>
            </div>

            <Clock3 size={20} />
          </div>

          <div className="admin-activity-list">
            {recentActivity.map((activity) => {
              const Icon = activity.icon;

              return (
                <div
                  key={activity.title}
                  className="admin-activity-item"
                >
                  <div className="admin-activity-icon">
                    <Icon size={18} />
                  </div>

                  <div style={{ flex: 1 }}>
                    <strong>{activity.title}</strong>

                    <p>{activity.description}</p>
                  </div>

                  <small>{activity.time}</small>
                </div>
              );
            })}
          </div>
        </div>

        <div className="admin-dashboard-panel">
          <div className="admin-dashboard-panel-header">
            <div>
              <p className="admin-section-eyebrow">
                Services
              </p>

              <h2>System Status</h2>
            </div>

            <Store size={20} />
          </div>

          <div className="admin-service-status-list">
            <div>
              <Gem size={18} />
              <span>Catalogue</span>
              <strong className="online">Online</strong>
            </div>

            <div>
              <Images size={18} />
              <span>AI Image Search</span>
              <strong className="online">Online</strong>
            </div>

            <div>
              <CircleDollarSign size={18} />
              <span>Gold Prediction</span>
              <strong className="experimental">
                Experimental
              </strong>
            </div>

            <div>
              <MessageSquareText size={18} />
              <span>Chatbot</span>
              <strong className="online">Online</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="admin-branch-overview">
        <div className="admin-dashboard-panel-header">
          <div>
            <p className="admin-section-eyebrow">
              Branches
            </p>

            <h2>Inventory Overview</h2>
          </div>

          <Store size={20} />
        </div>

        <div className="admin-branch-grid">
          <article>
            <h3>Bengaluru</h3>
            <strong>18 Products</strong>
            <p>Main flagship showroom</p>
          </article>

          <article>
            <h3>Puttur</h3>
            <strong>18 Products</strong>
            <p>Inventory available</p>
          </article>

          <article>
            <h3>Madikeri</h3>
            <strong>0 Products</strong>
            <p>Currently unavailable</p>
          </article>
        </div>
      </section>
    </div>
  );
}