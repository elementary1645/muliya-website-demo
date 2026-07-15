import { CalendarDays } from "lucide-react";

function AdminAppointmentsPage() {
  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="admin-section-eyebrow">Customer Bookings</p>
          <h1>Appointments</h1>
          <p>Review and manage showroom appointment requests.</p>
        </div>
      </div>

      <div className="admin-empty-state">
        <CalendarDays size={42} />
        <h2>Appointment management</h2>
        <p>Pending, confirmed, completed and cancelled bookings will appear here.</p>
      </div>
    </div>
  );
}

export default AdminAppointmentsPage;