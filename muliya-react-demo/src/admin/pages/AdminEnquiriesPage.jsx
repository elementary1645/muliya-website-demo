import { MessageSquareText } from "lucide-react";

function AdminEnquiriesPage() {
  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="admin-section-eyebrow">Customer Support</p>
          <h1>Enquiries</h1>
          <p>Manage product enquiries and customer questions.</p>
        </div>
      </div>

      <div className="admin-empty-state">
        <MessageSquareText size={42} />
        <h2>Customer enquiries</h2>
        <p>New and resolved enquiry requests will appear here.</p>
      </div>
    </div>
  );
}

export default AdminEnquiriesPage;