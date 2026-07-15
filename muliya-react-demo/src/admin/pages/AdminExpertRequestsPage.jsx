import { UserRoundCheck } from "lucide-react";

function AdminExpertRequestsPage() {
  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="admin-section-eyebrow">Jewellery Assistance</p>
          <h1>Expert Requests</h1>
          <p>Assign and manage customer requests for jewellery experts.</p>
        </div>
      </div>

      <div className="admin-empty-state">
        <UserRoundCheck size={42} />
        <h2>Expert assistance requests</h2>
        <p>Chatbot and website expert requests will appear here.</p>
      </div>
    </div>
  );
}

export default AdminExpertRequestsPage;