const API_BASE_URL = "http://localhost:5000/api/gold-prediction";

const fetchJson = async (url) => {
  const response = await fetch(url);

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(
      data.message ||
        data.detail ||
        "Unable to retrieve gold prediction data."
    );
  }

  return data;
};

export const getGoldPrediction = async () => {
  return fetchJson(API_BASE_URL);
};

export const getGoldHistory = async (days = 90) => {
  const safeDays = Math.min(
    Math.max(Number(days) || 90, 7),
    365
  );

  return fetchJson(
    `${API_BASE_URL}/history?days=${safeDays}`
  );
};

export const getGoldModelInfo = async () => {
  return fetchJson(
    `${API_BASE_URL}/model-info`
  );
};

export const getGoldPredictionHealth = async () => {
  return fetchJson(
    `${API_BASE_URL}/health`
  );
};