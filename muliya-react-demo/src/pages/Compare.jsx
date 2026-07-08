import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  ArrowLeft,
  Trash2,
  Scale,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Compare() {
  const [compare, setCompare] = useState([]);

  useEffect(() => {
    const savedCompare =
      JSON.parse(localStorage.getItem("muliyaCompare")) || [];

    setCompare(savedCompare);
  }, []);

  const removeFromCompare = (productId) => {
    const updatedCompare = compare.filter(
      (product) => product.id !== productId
    );

    setCompare(updatedCompare);
    localStorage.setItem("muliyaCompare", JSON.stringify(updatedCompare));
    window.dispatchEvent(new Event("compareUpdated"));
  };

  const clearCompare = () => {
    setCompare([]);
    localStorage.removeItem("muliyaCompare");
    window.dispatchEvent(new Event("compareUpdated"));
  };

  return (
    <div className="compare-page">
      <Navbar />

      <main className="compare-main">
        <div className="container">
          <Link to="/" className="back-link">
            <ArrowLeft size={18} />
            Continue Shopping
          </Link>

          <div className="compare-page-header">
            <div>
              <p className="section-eyebrow">Compare Jewellery</p>

              <h1 className="section-title">Product Compare</h1>

              <p className="section-description">
                Compare up to 3 jewellery designs side-by-side.
              </p>
            </div>

            {compare.length > 0 && (
              <button
                type="button"
                className="clear-compare-btn"
                onClick={clearCompare}
              >
                <Trash2 size={17} />
                Clear Compare
              </button>
            )}
          </div>

          {compare.length > 0 ? (
            <div className="compare-table-wrapper">
              <table className="compare-table">
                <tbody>
                  <tr>
                    <th>Product</th>
                    {compare.map((product) => (
                      <td key={product.id}>
                        <div className="compare-product-image">
                          <img src={product.image} alt={product.name} />
                        </div>

                        <h3>{product.name}</h3>

                        <p>{product.code}</p>

                        <button
                          type="button"
                          className="remove-compare-btn"
                          onClick={() => removeFromCompare(product.id)}
                        >
                          <Trash2 size={15} />
                          Remove
                        </button>
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <th>Price</th>
                    {compare.map((product) => (
                      <td key={product.id}>{product.price}</td>
                    ))}
                  </tr>

                  <tr>
                    <th>Category</th>
                    {compare.map((product) => (
                      <td key={product.id}>{product.category}</td>
                    ))}
                  </tr>

                  <tr>
                    <th>Collection</th>
                    {compare.map((product) => (
                      <td key={product.id}>{product.collection}</td>
                    ))}
                  </tr>

                  <tr>
                    <th>Purity</th>
                    {compare.map((product) => (
                      <td key={product.id}>{product.purity}</td>
                    ))}
                  </tr>

                  <tr>
                    <th>Weight</th>
                    {compare.map((product) => (
                      <td key={product.id}>{product.weight}</td>
                    ))}
                  </tr>

                  <tr>
                    <th>Availability</th>
                    {compare.map((product) => (
                      <td key={product.id}>{product.availability}</td>
                    ))}
                  </tr>

                  <tr>
                    <th>Action</th>
                    {compare.map((product) => (
                      <td key={product.id}>
                        <Link
                          to={`/product/${product.id}`}
                          className="primary-btn"
                        >
                          View Details
                        </Link>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-compare">
              <div className="empty-compare-icon">
                <Scale size={38} />
              </div>

              <h2>No Products Added</h2>

              <p>
                Add jewellery designs to compare their price, purity, weight,
                collection, and availability.
              </p>

              <Link to="/" className="primary-btn">
                Explore Jewellery
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Compare;