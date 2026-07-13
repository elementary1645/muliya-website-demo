import { useEffect, useState } from "react";
import {
  Coins,
  RefreshCw,
  TrendingUp,
} from "lucide-react";

const API_URL = "http://localhost:5000/api/metal-rates";

function MetalRates() {
  const [rates, setRates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRates = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load metal prices."
        );
      }

      setRates(data);
    } catch (requestError) {
      console.error(
        "Metal prices frontend error:",
        requestError
      );

      setError(
        requestError.message ||
          "Unable to retrieve current metal prices."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRates();
  }, []);

  const formatUSD = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "Recently updated";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Recently updated";
    }

    return date.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <section className="metal-rates-section">
      <div className="container">
        <div className="metal-rates-header">
          <div>
            <p className="section-eyebrow">
              International Market Prices
            </p>

            <h2 className="section-title">
              Live Gold & Silver Prices
            </h2>

            <p className="section-description">
              Follow current international gold and silver
              spot prices in US dollars.
            </p>
          </div>

          <button
            type="button"
            className="metal-rate-refresh-btn"
            onClick={loadRates}
            disabled={loading}
          >
            <RefreshCw
              size={17}
              className={loading ? "spinning" : ""}
            />

            {loading ? "Refreshing..." : "Refresh Prices"}
          </button>
        </div>

        {loading && !rates ? (
          <div className="metal-rates-status">
            <Coins size={32} />

            <h3>Loading market prices...</h3>

            <p>
              Retrieving current international gold and
              silver prices.
            </p>
          </div>
        ) : error && !rates ? (
          <div className="metal-rates-status metal-rates-error">
            <h3>Market prices unavailable</h3>

            <p>{error}</p>

            <button
              type="button"
              className="primary-btn"
              onClick={loadRates}
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            <div className="metal-rates-grid">
              <article className="metal-rate-card">
                <div className="metal-rate-card-icon">
                  <TrendingUp size={26} />
                </div>

                <p className="metal-rate-symbol">
                  {rates.gold.symbol}
                </p>

                <h3>{rates.gold.name}</h3>

                <div className="metal-rate-price">
                  {formatUSD(rates.gold.price)}
                </div>

                <span>per troy ounce</span>
              </article>

              <article className="metal-rate-card">
                <div className="metal-rate-card-icon">
                  <Coins size={26} />
                </div>

                <p className="metal-rate-symbol">
                  {rates.silver.symbol}
                </p>

                <h3>{rates.silver.name}</h3>

                <div className="metal-rate-price">
                  {formatUSD(rates.silver.price)}
                </div>

                <span>per troy ounce</span>
              </article>
            </div>

            <div className="metal-rates-footer">
              <p>
                Last updated: {formatDate(rates.lastUpdated)}
              </p>

              <p>
                Data status:{" "}
                <strong>
                  {rates.source === "live"
                    ? "Live"
                    : rates.source === "cache"
                    ? "Cached"
                    : "Last available"}
                </strong>
              </p>
            </div>

            {error && (
              <p className="metal-rate-warning">
                {error}
              </p>
            )}

            <p className="metal-rates-disclaimer">
              {rates.disclaimer}
            </p>
          </>
        )}
      </div>
    </section>
  );
}

export default MetalRates;