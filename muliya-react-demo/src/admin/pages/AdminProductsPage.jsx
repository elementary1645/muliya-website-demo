import { Package, Plus, Search } from "lucide-react";

function AdminProductsPage() {
  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="admin-section-eyebrow">Catalogue Management</p>
          <h1>Products</h1>
          <p>View, add, edit and remove jewellery products.</p>
        </div>

        <button type="button" className="admin-primary-button">
          <Plus size={17} />
          Add Product
        </button>
      </div>

      <div className="admin-toolbar">
        <div className="admin-search-box">
          <Search size={17} />
          <input
            type="text"
            placeholder="Search by product name or code..."
          />
        </div>
      </div>

      <div className="admin-empty-state">
        <Package size={42} />
        <h2>Product management is ready</h2>
        <p>The next step is connecting this page to the product API.</p>
      </div>
    </div>
  );
}

export default AdminProductsPage;