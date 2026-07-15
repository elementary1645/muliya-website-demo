import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  AlertTriangle,
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  CircleDollarSign,
  Info,
  LoaderCircle,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import {
  getGoldHistory,
  getGoldModelInfo,
  getGoldPrediction,
} from "../api/goldPredictionApi";

const historyOptions = [
  {
    label: "30 Days",
    value: 30,
  },
  {
    label: "90 Days",
    value: 90,
  },
  {
    label: "180 Days",
    value: 180,
  },
  {
    label: "1 Year",
    value: 365,
  },
];

function GoldPredictionPage() {
  const [prediction, setPrediction] = useState(null);
  const [history, setHistory] = useState([]);
  const [modelInfo, setModelInfo] = useState(null);

  const [historyDays, setHistoryDays] = useState(90);

  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        predictionResponse,
        historyResponse,
        modelResponse,
      ] = await Promise.all([
        getGoldPrediction(),
        getGoldHistory(historyDays),
        getGoldModelInfo(),
      ]);

      setPrediction(predictionResponse);

      setHistory(
        Array.isArray(historyResponse.history)
          ? historyResponse.history
          : []
      );

      setModelInfo(modelResponse);
    } catch (requestError) {
      console.error(
        "Unable to load gold prediction dashboard:",
        requestError
      );

      setError(
        requestError.message ||
          "Unable to load the gold prediction dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    const loadHistory = async () => {
      if (loading) {
        return;
      }

      try {
        setHistoryLoading(true);
        setError("");

        const historyResponse = await getGoldHistory(
          historyDays
        );

        setHistory(
          Array.isArray(historyResponse.history)
            ? historyResponse.history
            : []
        );
      } catch (requestError) {
        console.error(
          "Unable to load gold history:",
          requestError
        );

        setError(
          requestError.message ||
            "Unable to load historical gold-price data."
        );
      } finally {
        setHistoryLoading(false);
      }
    };

    loadHistory();
  }, [historyDays]);

  const refreshPrediction = async () => {
    try {
      setRefreshing(true);
      setError("");

      const [
        predictionResponse,
        historyResponse,
        modelResponse,
      ] = await Promise.all([
        getGoldPrediction(),
        getGoldHistory(historyDays),
        getGoldModelInfo(),
      ]);

      setPrediction(predictionResponse);

      setHistory(
        Array.isArray(historyResponse.history)
          ? historyResponse.history
          : []
      );

      setModelInfo(modelResponse);
    } catch (requestError) {
      console.error(
        "Unable to refresh gold prediction:",
        requestError
      );

      setError(
        requestError.message ||
          "Unable to refresh the gold prediction."
      );
    } finally {
      setRefreshing(false);
    }
  };

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
      return "0.00%";
    }

    const sign = numericValue > 0 ? "+" : "";

    return `${sign}${numericValue.toFixed(3)}%`;
  };

  const formatDate = (value) => {
    if (!value) {
      return "Not available";
    }

    const date = new Date(`${value}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatGeneratedTime = (value) => {
    if (!value) {
      return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const chartData = useMemo(() => {
    return history.map((item) => ({
      ...item,
      formattedDate: new Date(
        `${item.date}T00:00:00`
      ).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      }),
    }));
  }, [history]);

  const trendInformation = useMemo(() => {
    const trend = prediction?.trend || "Stable";

    if (trend === "Up") {
      return {
        label: "Upward Estimate",
        className: "up",
        icon: TrendingUp,
      };
    }

    if (trend === "Down") {
      return {
        label: "Downward Estimate",
        className: "down",
        icon: TrendingDown,
      };
    }

    return {
      label: "Stable Estimate",
      className: "stable",
      icon: ArrowRight,
    };
  }, [prediction]);

  const TrendIcon = trendInformation.icon;

  const reliability =
    prediction?.model?.reliability ||
    modelInfo?.reliability ||
    {};

  const selectedModelMetrics =
    modelInfo?.holdoutResults?.[
      modelInfo?.modelName
    ] || {};

  const baselineMetrics =
    modelInfo?.naiveBaseline || {};

  const topFeatures = useMemo(() => {
    const featureImportance =
      modelInfo?.featureImportance;

    if (!Array.isArray(featureImportance)) {
      return [];
    }

    return featureImportance.slice(0, 8);
  }, [modelInfo]);

  const getFeaturePercentage = (importance) => {
    const numericValue = Number(importance);

    if (!Number.isFinite(numericValue)) {
      return 0;
    }

    return Math.max(
      2,
      Math.min(100, numericValue * 1000)
    );
  };

  if (loading) {
    return (
      <div className="gold-prediction-page">
        <Navbar />

        <main className="gold-prediction-loading-page">
          <LoaderCircle
            size={42}
            className="spinning"
          />

          <h1>Loading Gold Market Analysis</h1>

          <p>
            Retrieving recent market data and generating the
            experimental prediction.
          </p>
        </main>

        <Footer />
      </div>
    );
  }

  if (error && !prediction) {
    return (
      <div className="gold-prediction-page">
        <Navbar />

        <main className="gold-prediction-error-page">
          <AlertTriangle size={46} />

          <h1>Prediction Service Unavailable</h1>

          <p>{error}</p>

          <button
            type="button"
            className="primary-btn"
            onClick={loadDashboardData}
          >
            <RefreshCw size={17} />
            Try Again
          </button>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="gold-prediction-page">
      <Navbar />

      <main>
        <section className="gold-prediction-banner">
          <div className="container">
            <Link
              to="/"
              className="back-link"
            >
              <ArrowLeft size={18} />
              Back to Home
            </Link>

            <div className="gold-prediction-banner-content">
              <div>
                <p className="section-eyebrow">
                  Experimental Market Analysis
                </p>

                <h1>Gold Price Prediction</h1>

                <p>
                  Explore an experimental next-trading-day
                  estimate generated from historical gold-futures
                  market data and machine-learning features.
                </p>
              </div>

              <button
                type="button"
                className="gold-prediction-refresh-btn"
                onClick={refreshPrediction}
                disabled={refreshing}
              >
                <RefreshCw
                  size={17}
                  className={
                    refreshing ? "spinning" : ""
                  }
                />

                {refreshing
                  ? "Refreshing..."
                  : "Refresh Analysis"}
              </button>
            </div>
          </div>
        </section>

        {error && (
          <section className="gold-prediction-inline-error">
            <div className="container">
              <AlertTriangle size={18} />
              <p>{error}</p>
            </div>
          </section>
        )}

        <section className="gold-prediction-overview">
          <div className="container">
            <div className="gold-prediction-primary-grid">
              <article className="gold-prediction-main-card">
                <div className="gold-prediction-card-top">
                  <div>
                    <p className="section-eyebrow">
                      Next Trading-Day Estimate
                    </p>

                    <h2>
                      {formatCurrency(
                        prediction?.predictedPrice
                      )}
                    </h2>

                    <span>
                      USD per troy ounce
                    </span>
                  </div>

                  <div
                    className={`gold-prediction-trend-badge ${trendInformation.className}`}
                  >
                    <TrendIcon size={20} />
                    {trendInformation.label}
                  </div>
                </div>

                <div className="gold-prediction-change">
                  {Number(
                    prediction?.predictedChange
                  ) >= 0 ? (
                    <ArrowUpRight size={24} />
                  ) : (
                    <ArrowDownRight size={24} />
                  )}

                  <div>
                    <strong>
                      {formatCurrency(
                        prediction?.predictedChange
                      )}
                    </strong>

                    <span>
                      {formatPercent(
                        prediction?.predictedChangePercent
                      )}
                    </span>
                  </div>
                </div>

                <div className="gold-prediction-date-grid">
                  <div>
                    <CalendarDays size={18} />

                    <span>Latest Market Date</span>

                    <strong>
                      {formatDate(
                        prediction?.latestMarketDate
                      )}
                    </strong>
                  </div>

                  <div>
                    <Sparkles size={18} />

                    <span>Prediction Date</span>

                    <strong>
                      {formatDate(
                        prediction?.predictionDate
                      )}
                    </strong>
                  </div>
                </div>

                <p className="gold-prediction-generated">
                  Generated{" "}
                  {formatGeneratedTime(
                    prediction?.generatedAt
                  )}
                </p>
              </article>

              <article className="gold-prediction-current-card">
                <div className="gold-prediction-card-icon">
                  <CircleDollarSign size={27} />
                </div>

                <p>Current Gold Price</p>

                <h2>
                  {formatCurrency(
                    prediction?.currentPrice
                  )}
                </h2>

                <span>
                  GC=F · USD per troy ounce
                </span>

                <div className="gold-prediction-current-divider" />

                <div>
                  <strong>
                    Model Reliability
                  </strong>

                  <span
                    className={`gold-model-rating ${
                      String(
                        reliability?.rating || ""
                      ).toLowerCase()
                    }`}
                  >
                    {reliability?.rating ||
                      "Experimental"}
                  </span>
                </div>

                <small>
                  Baseline improvement:{" "}
                  {Number(
                    reliability
                      ?.returnMAEImprovementPercent ||
                      0
                  ).toFixed(2)}
                  %
                </small>
              </article>
            </div>

            <div className="gold-prediction-range-grid">
              <article>
                <span>80% Estimated Range</span>

                <h3>
                  {formatCurrency(
                    prediction?.range80?.lower
                  )}
                </h3>

                <ArrowRight size={18} />

                <h3>
                  {formatCurrency(
                    prediction?.range80?.upper
                  )}
                </h3>
              </article>

              <article>
                <span>95% Estimated Range</span>

                <h3>
                  {formatCurrency(
                    prediction?.range95?.lower
                  )}
                </h3>

                <ArrowRight size={18} />

                <h3>
                  {formatCurrency(
                    prediction?.range95?.upper
                  )}
                </h3>
              </article>
            </div>

            <div className="gold-prediction-warning-card">
              <ShieldAlert size={23} />

              <div>
                <h3>Experimental Prediction</h3>

                <p>
                  This model only marginally outperformed a
                  naïve zero-return baseline during testing.
                  The estimate should be treated as an
                  educational market-analysis prototype, not as
                  a reliable forecast or financial advice.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="gold-history-section">
          <div className="container">
            <div className="gold-history-header">
              <div>
                <p className="section-eyebrow">
                  Historical Gold Futures
                </p>

                <h2>Market Price History</h2>

                <p>
                  Historical daily closing prices for the GC=F
                  gold-futures contract.
                </p>
              </div>

              <div className="gold-history-period-buttons">
                {historyOptions.map((option) => (
                  <button
                    type="button"
                    key={option.value}
                    className={
                      historyDays === option.value
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setHistoryDays(option.value)
                    }
                    disabled={historyLoading}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="gold-history-chart-card">
              {historyLoading ? (
                <div className="gold-history-chart-loading">
                  <LoaderCircle
                    size={35}
                    className="spinning"
                  />

                  <p>
                    Loading historical prices...
                  </p>
                </div>
              ) : chartData.length > 0 ? (
                <ResponsiveContainer
                  width="100%"
                  height={430}
                >
                  <AreaChart
                    data={chartData}
                    margin={{
                      top: 20,
                      right: 20,
                      left: 10,
                      bottom: 10,
                    }}
                  >
                    <defs>
                      <linearGradient
                        id="goldPriceGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="currentColor"
                          stopOpacity={0.32}
                        />

                        <stop
                          offset="95%"
                          stopColor="currentColor"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="formattedDate"
                      minTickGap={35}
                      tick={{
                        fontSize: 10,
                      }}
                    />

                    <YAxis
                      domain={[
                        "dataMin - 50",
                        "dataMax + 50",
                      ]}
                      tick={{
                        fontSize: 10,
                      }}
                      tickFormatter={(value) =>
                        `$${Number(value).toFixed(0)}`
                      }
                    />

                    <Tooltip
                      formatter={(value) => [
                        formatCurrency(value),
                        "Closing Price",
                      ]}
                      labelFormatter={(_, payload) =>
                        payload?.[0]?.payload?.date ||
                        ""
                      }
                    />

                    <Area
                      type="monotone"
                      dataKey="close"
                      stroke="currentColor"
                      strokeWidth={2.2}
                      fill="url(#goldPriceGradient)"
                      activeDot={{
                        r: 5,
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="gold-history-chart-loading">
                  <BarChart3 size={35} />

                  <p>
                    No historical market data is available.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="gold-model-section">
          <div className="container">
            <div className="gold-model-header">
              <div>
                <p className="section-eyebrow">
                  Machine Learning Model
                </p>

                <h2>Model Performance</h2>

                <p>
                  Transparent testing information for the
                  experimental prediction model.
                </p>
              </div>

              <div className="gold-model-name">
                <Sparkles size={19} />

                <span>
                  {prediction?.model?.name ||
                    modelInfo?.modelName ||
                    "Random Forest"}
                </span>
              </div>
            </div>

            <div className="gold-model-metrics-grid">
              <article>
                <span>Price MAE</span>

                <strong>
                  {formatCurrency(
                    selectedModelMetrics?.priceMAE
                  )}
                </strong>

                <small>
                  Average absolute next-day price error
                </small>
              </article>

              <article>
                <span>Price MAPE</span>

                <strong>
                  {Number(
                    selectedModelMetrics?.priceMAPE ||
                      0
                  ).toFixed(3)}
                  %
                </strong>

                <small>
                  Average percentage price error
                </small>
              </article>

              <article>
                <span>Directional Accuracy</span>

                <strong>
                  {Number(
                    selectedModelMetrics
                      ?.directionalAccuracy || 0
                  ).toFixed(2)}
                  %
                </strong>

                <small>
                  Correct Up, Down or Stable labels
                </small>
              </article>

              <article>
                <span>Baseline Price MAE</span>

                <strong>
                  {formatCurrency(
                    baselineMetrics?.priceMAE
                  )}
                </strong>

                <small>
                  Error when tomorrow equals today
                </small>
              </article>
            </div>

            <div className="gold-model-content-grid">
              <article className="gold-feature-card">
                <div className="gold-feature-card-header">
                  <div>
                    <p className="section-eyebrow">
                      Feature Importance
                    </p>

                    <h3>
                      Main Model Inputs
                    </h3>
                  </div>

                  <Info size={19} />
                </div>

                <div className="gold-feature-list">
                  {topFeatures.map((feature) => (
                    <div key={feature.feature}>
                      <div>
                        <span>
                          {feature.feature.replaceAll(
                            "_",
                            " "
                          )}
                        </span>

                        <strong>
                          {(
                            Number(
                              feature.importance
                            ) * 100
                          ).toFixed(2)}
                          %
                        </strong>
                      </div>

                      <div className="gold-feature-progress">
                        <span
                          style={{
                            width: `${getFeaturePercentage(
                              feature.importance
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              <article className="gold-model-details-card">
                <p className="section-eyebrow">
                  Model Information
                </p>

                <h3>Technical Overview</h3>

                <div>
                  <span>Prediction Target</span>

                  <strong>
                    Next trading-day logarithmic return
                  </strong>
                </div>

                <div>
                  <span>Market Instrument</span>

                  <strong>
                    Gold Futures — GC=F
                  </strong>
                </div>

                <div>
                  <span>Feature Count</span>

                  <strong>
                    {prediction?.model?.featureCount ||
                      modelInfo?.featureCount ||
                      31}
                  </strong>
                </div>

                <div>
                  <span>Training Data</span>

                  <strong>
                    {formatDate(
                      modelInfo?.dataStartDate
                    )}{" "}
                    to{" "}
                    {formatDate(
                      modelInfo?.dataEndDate
                    )}
                  </strong>
                </div>

                <div>
                  <span>Baseline Beaten</span>

                  <strong>
                    {reliability?.beatsNaiveBaseline
                      ? "Yes"
                      : "No"}
                  </strong>
                </div>

                <div>
                  <span>Reliability Rating</span>

                  <strong>
                    {reliability?.rating ||
                      "Experimental"}
                  </strong>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="gold-disclaimer-section">
          <div className="container">
            <div className="gold-disclaimer-card">
              <AlertTriangle size={27} />

              <div>
                <h2>
                  Important Financial Disclaimer
                </h2>

                <p>
                  {prediction?.disclaimer ||
                    modelInfo?.disclaimer ||
                    "This is an experimental analytical estimate and not financial advice."}
                </p>

                <p>
                  The prediction represents the international
                  GC=F gold-futures market in US dollars per
                  troy ounce. It does not represent Muliya
                  showroom gold rates, jewellery prices, making
                  charges, taxes or final selling prices.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default GoldPredictionPage;