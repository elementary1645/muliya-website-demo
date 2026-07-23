import { GOLD_API_BASE_URL } from "./apiConfig";

async function fetchJson(path, options = {}) {
  let response;

  try {
    response = await fetch(
      `${GOLD_API_BASE_URL}${path}`,
      {
        ...options,
        headers: {
          Accept: "application/json",
          ...options.headers,
        },
      },
    );
  } catch (networkError) {
    console.error(
      "Gold prediction network error:",
      networkError,
    );

    throw new Error(
      "The gold prediction service is unavailable. Confirm that it is running on port 8001.",
    );
  }

  const data = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.detail ||
        data?.message ||
        `Gold prediction request failed with status ${response.status}.`,
    );
  }

  if (data?.success === false) {
    throw new Error(
      data?.detail ||
        data?.message ||
        "Unable to retrieve gold prediction data.",
    );
  }

  return data;
}

export async function getGoldPrediction() {
  return fetchJson("/prediction");
}

export async function getGoldHistory(days = 90) {
  const numericDays = Number(days);

  const safeDays = Math.min(
    Math.max(
      Number.isFinite(numericDays)
        ? Math.round(numericDays)
        : 90,
      7,
    ),
    365,
  );

  return fetchJson(
    `/history?days=${safeDays}`,
  );
}

export async function getGoldModelInfo() {
  return fetchJson("/model-info");
}

export async function getGoldPredictionHealth() {
  return fetchJson("/health");
}