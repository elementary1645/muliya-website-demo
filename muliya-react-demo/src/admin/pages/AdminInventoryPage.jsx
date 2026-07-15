import { Store } from "lucide-react";

function AdminInventoryPage() {
  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="admin-section-eyebrow">Branch Stock</p>
          <h1>Inventory</h1>
          <p>Manage branch-wise stock and product availability.</p>
        </div>
      </div>

      <div className="admin-empty-state">
        <Store size={42} />
        <h2>Branch inventory</h2>
        <p>Bengaluru, Puttur and Madikeri stock will be managed here.</p>
      </div>
    </div>
  );
}

export default AdminInventoryPage;