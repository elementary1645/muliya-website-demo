import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  LoaderCircle,
  RefreshCw,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import { getGoldPrediction } from "../api/goldPredictionApi";

function GoldPredictionPreview() {
  const navigate = useNavigate();

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadPrediction = async ({
    isRefresh = false,
  } = {}) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const data = await getGoldPrediction();

      setPrediction(data);
    } catch (requestError) {
      console.error(
        "Unable to load gold prediction preview:",
        requestError
      );

      setError(
        requestError.message ||
          "Gold prediction is currently unavailable."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPrediction();
  }, []);

  const formatCurrency = (value) => {
    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
      return "$0.00";
    }

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericValue);
  };

  const formatPercent = (value) => {
    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
      return "0.000%";
    }

    const sign =
      numericValue > 0 ? "+" : "";

    return `${sign}${numericValue.toFixed(3)}%`;
  };

  const formatDate = (value) => {
    if (!value) {
      return "Not available";
    }

    const date = new Date(
      `${value}T00:00:00`
    );

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getTrendInformation = () => {
    const trend = prediction?.trend;

    if (trend === "Up") {
      return {
        icon: TrendingUp,
        label: "Upward Estimate",
        className: "up",
      };
    }

    if (trend === "Down") {
      return {
        icon: TrendingDown,
        label: "Downward Estimate",
        className: "down",
      };
    }

    return {
      icon: ArrowRight,
      label: "Stable Estimate",
      className: "stable",
    };
  };

  const trendInformation =
    getTrendInformation();

  const TrendIcon =
    trendInformation.icon;

  const openPredictionPage = () => {
    navigate("/gold-prediction");
  };

  return (
    <section className="gold-prediction-preview-section">
      <div className="container">
        <div className="gold-prediction-preview-card">
          <div className="gold-prediction-preview-intro">
            <p className="section-eyebrow">
              Experimental Market Intelligence
            </p>

            <h2 className="section-title">
              AI Gold Price Analysis
            </h2>

            <p className="section-description">
              Explore an experimental next-trading-day gold-futures
              estimate generated using historical market data and
              machine-learning indicators.
            </p>

            <div className="gold-prediction-preview-features">
              <div>
                <Sparkles size={18} />

                <span>
                  Machine-learning estimate
                </span>
              </div>

              <div>
                <BarChart3 size={18} />

                <span>
                  Historical price chart
                </span>
              </div>

              <div>
                <AlertTriangle size={18} />

                <span>
                  Experimental analysis only
                </span>
              </div>
            </div>

            <button
              type="button"
              className="primary-btn gold-prediction-preview-open"
              onClick={openPredictionPage}
            >
              View Gold Prediction
              <ArrowRight size={17} />
            </button>

            <p className="gold-prediction-preview-note">
              This does not represent Muliya showroom gold rates or
              jewellery selling prices.
            </p>
          </div>

          <div className="gold-prediction-preview-data">
            <div className="gold-prediction-preview-data-header">
              <div>
                <span>
                  Next Trading-Day Estimate
                </span>

                <strong>
                  GC=F · USD per troy ounce
                </strong>
              </div>

              <button
                type="button"
                onClick={() =>
                  loadPrediction({
                    isRefresh: true,
                  })
                }
                disabled={refreshing || loading}
                aria-label="Refresh gold prediction"
              >
                <RefreshCw
                  size={16}
                  className={
                    refreshing
                      ? "spinning"
                      : ""
                  }
                />
              </button>
            </div>

            {loading ? (
              <div className="gold-prediction-preview-status">
                <LoaderCircle
                  size={34}
                  className="spinning"
                />

                <p>
                  Loading market analysis...
                </p>
              </div>
            ) : error ? (
              <div className="gold-prediction-preview-status error">
                <AlertTriangle size={30} />

                <p>{error}</p>

                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() =>
                    loadPrediction()
                  }
                >
                  Try Again
                </button>
              </div>
            ) : prediction ? (
              <>
                <div className="gold-prediction-preview-price">
                  <p>Predicted Price</p>

                  <h3>
                    {formatCurrency(
                      prediction.predictedPrice
                    )}
                  </h3>

                  <div
                    className={`gold-prediction-preview-trend ${trendInformation.className}`}
                  >
                    <TrendIcon size={18} />

                    <span>
                      {trendInformation.label}
                    </span>
                  </div>
                </div>

                <div className="gold-prediction-preview-change">
                  {Number(
                    prediction.predictedChange
                  ) >= 0 ? (
                    <ArrowUpRight size={22} />
                  ) : (
                    <ArrowDownRight size={22} />
                  )}

                  <div>
                    <strong>
                      {formatCurrency(
                        prediction.predictedChange
                      )}
                    </strong>

                    <span>
                      {formatPercent(
                        prediction.predictedChangePercent
                      )}
                    </span>
                  </div>
                </div>

                <div className="gold-prediction-preview-grid">
                  <div>
                    <span>
                      Current Price
                    </span>

                    <strong>
                      {formatCurrency(
                        prediction.currentPrice
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Prediction Date
                    </span>

                    <strong>
                      {formatDate(
                        prediction.predictionDate
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      80% Lower Range
                    </span>

                    <strong>
                      {formatCurrency(
                        prediction.range80?.lower
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      80% Upper Range
                    </span>

                    <strong>
                      {formatCurrency(
                        prediction.range80?.upper
                      )}
                    </strong>
                  </div>
                </div>

                <div className="gold-prediction-preview-reliability">
                  <AlertTriangle size={17} />

                  <div>
                    <strong>
                      Reliability:{" "}
                      {prediction.model?.reliability?.rating ||
                        "Experimental"}
                    </strong>

                    <p>
                      The model only marginally outperformed the
                      naïve baseline during testing.
                    </p>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

export default GoldPredictionPreview;