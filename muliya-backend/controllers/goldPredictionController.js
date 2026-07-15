const GOLD_PREDICTION_SERVICE_URL =
  process.env.GOLD_PREDICTION_SERVICE_URL ||
  "http://localhost:8001";

const fetchPredictionService = async (endpoint) => {
  const response = await fetch(
    `${GOLD_PREDICTION_SERVICE_URL}${endpoint}`
  );

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error(
      "Gold prediction service returned an invalid response."
    );
  }

  if (!response.ok) {
    throw new Error(
      data.detail ||
        data.message ||
        "Gold prediction service request failed."
    );
  }

  return data;
};

const getGoldPrediction = async (req, res) => {
  try {
    const data = await fetchPredictionService(
      "/prediction"
    );

    return res.status(200).json(data);
  } catch (error) {
    console.error(
      "Gold prediction controller error:",
      error
    );

    return res.status(503).json({
      success: false,
      message:
        "The gold prediction service is currently unavailable.",
      error: error.message,
    });
  }
};

const getGoldHistory = async (req, res) => {
  try {
    const requestedDays = Number(req.query.days) || 90;

    const days = Math.min(
      Math.max(requestedDays, 7),
      365
    );

    const data = await fetchPredictionService(
      `/history?days=${days}`
    );

    return res.status(200).json(data);
  } catch (error) {
    console.error(
      "Gold history controller error:",
      error
    );

    return res.status(503).json({
      success: false,
      message:
        "Unable to retrieve historical gold-price data.",
      error: error.message,
    });
  }
};

const getGoldModelInfo = async (req, res) => {
  try {
    const data = await fetchPredictionService(
      "/model-info"
    );

    return res.status(200).json(data);
  } catch (error) {
    console.error(
      "Gold model-info controller error:",
      error
    );

    return res.status(503).json({
      success: false,
      message:
        "Unable to retrieve gold prediction model information.",
      error: error.message,
    });
  }
};

const getGoldPredictionHealth = async (req, res) => {
  try {
    const data = await fetchPredictionService(
      "/health"
    );

    return res.status(200).json(data);
  } catch (error) {
    return res.status(503).json({
      success: false,
      status: "unavailable",
      message:
        "Gold prediction service is unavailable.",
      error: error.message,
    });
  }
};

export {
  getGoldPrediction,
  getGoldHistory,
  getGoldModelInfo,
  getGoldPredictionHealth,
};