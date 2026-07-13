const GOLD_API_BASE_URL = "https://api.gold-api.com/price";

const CACHE_DURATION = 15 * 60 * 1000;

let cachedRates = null;
let cacheTimestamp = 0;

const fetchJson = async (url) => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Gold API request failed with status ${response.status}`
    );
  }

  return response.json();
};

const getMetalRates = async (req, res) => {
  try {
    const currentTime = Date.now();

    const cacheIsValid =
      cachedRates &&
      currentTime - cacheTimestamp < CACHE_DURATION;

    if (cacheIsValid) {
      return res.status(200).json({
        success: true,
        source: "cache",
        ...cachedRates,
      });
    }

    /*
      Fetch international Gold and Silver spot prices.

      XAU = Gold
      XAG = Silver

      Gold API returns prices in USD per troy ounce.
    */

    const [goldData, silverData] = await Promise.all([
      fetchJson(`${GOLD_API_BASE_URL}/XAU`),
      fetchJson(`${GOLD_API_BASE_URL}/XAG`),
    ]);

    const goldPrice = Number(goldData.price);
    const silverPrice = Number(silverData.price);

    if (
      !Number.isFinite(goldPrice) ||
      !Number.isFinite(silverPrice) ||
      goldPrice <= 0 ||
      silverPrice <= 0
    ) {
      throw new Error(
        "Invalid metal prices received from Gold API."
      );
    }

    const lastUpdated =
      goldData.updatedAt ||
      goldData.updated_at ||
      goldData.timestamp ||
      new Date().toISOString();

    const metalRates = {
      currency: "USD",

      gold: {
        symbol: "XAU",
        name: "Gold",
        price: goldPrice,
        unit: "troy ounce",
      },

      silver: {
        symbol: "XAG",
        name: "Silver",
        price: silverPrice,
        unit: "troy ounce",
      },

      lastUpdated,

      disclaimer:
        "International spot prices only. Showroom rates may differ based on local pricing, taxes, duties, making charges, and product specifications.",
    };

    cachedRates = metalRates;
    cacheTimestamp = currentTime;

    return res.status(200).json({
      success: true,
      source: "live",
      ...metalRates,
    });
  } catch (error) {
    console.error(
      "Metal rate error:",
      error.message
    );

    /*
      If the external API temporarily fails,
      return the last successfully retrieved prices.
    */

    if (cachedRates) {
      return res.status(200).json({
        success: true,
        source: "stale-cache",

        warning:
          "Fresh metal prices are temporarily unavailable. Showing the last successfully retrieved prices.",

        ...cachedRates,
      });
    }

    return res.status(500).json({
      success: false,

      message:
        "Unable to retrieve current international metal prices.",

      error: error.message,
    });
  }
};

export { getMetalRates };