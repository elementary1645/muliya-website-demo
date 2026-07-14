import {
  createChatbotResponse,
  createDetail,
  createExpertAction,
} from "./responseBuilder.js";

const GOLD_API_BASE_URL =
  "https://api.gold-api.com/price";

const CACHE_DURATION = 15 * 60 * 1000;

let cachedMetalRates = null;
let cacheTimestamp = 0;

const normalizeText = (value) => {
  return String(value || "")
    .trim()
    .toLowerCase();
};

const fetchJson = async (url) => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Metal-price request failed with status ${response.status}`
    );
  }

  return response.json();
};

const getMetalRates = async () => {
  const currentTime = Date.now();

  const cacheIsValid =
    cachedMetalRates &&
    currentTime - cacheTimestamp <
      CACHE_DURATION;

  if (cacheIsValid) {
    return {
      source: "cache",
      ...cachedMetalRates,
    };
  }

  const [goldData, silverData] =
    await Promise.all([
      fetchJson(
        `${GOLD_API_BASE_URL}/XAU`
      ),

      fetchJson(
        `${GOLD_API_BASE_URL}/XAG`
      ),
    ]);

  const goldPrice = Number(
    goldData.price
  );

  const silverPrice = Number(
    silverData.price
  );

  if (
    !Number.isFinite(goldPrice) ||
    !Number.isFinite(silverPrice) ||
    goldPrice <= 0 ||
    silverPrice <= 0
  ) {
    throw new Error(
      "Invalid metal-price data received."
    );
  }

  const lastUpdated =
    goldData.updatedAt ||
    goldData.updated_at ||
    goldData.timestamp ||
    new Date().toISOString();

  cachedMetalRates = {
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
  };

  cacheTimestamp = currentTime;

  return {
    source: "live",
    ...cachedMetalRates,
  };
};

const formatUsd = (value) => {
  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  ).format(value);
};

const formatDate = (dateValue) => {
  const date = new Date(dateValue);

  if (
    Number.isNaN(date.getTime())
  ) {
    return "Recently updated";
  }

  return date.toLocaleString(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  );
};

const isMetalRateQuestion = (
  customerQuestion
) => {
  const message = normalizeText(
    customerQuestion
  );

  const keywords = [
    "gold rate",
    "gold price",
    "silver rate",
    "silver price",
    "metal rate",
    "metal price",
    "xau",
    "xag",
    "today's gold",
    "todays gold",
    "current gold",
    "current silver",
    "live gold",
    "live silver",
  ];

  return keywords.some((keyword) =>
    message.includes(keyword)
  );
};

const handleMetalRateIntent = async (
  customerQuestion
) => {
  const message = normalizeText(
    customerQuestion
  );

  try {
    const rates =
      await getMetalRates();

    const asksOnlyGold =
      message.includes("gold") &&
      !message.includes("silver");

    const asksOnlySilver =
      message.includes("silver") &&
      !message.includes("gold");

    let reply =
      `The current international gold spot price is ` +
      `${formatUsd(rates.gold.price)} per troy ounce, and ` +
      `the silver spot price is ${formatUsd(
        rates.silver.price
      )} per troy ounce.`;

    let details = [
      createDetail(
        "Gold",
        `${formatUsd(
          rates.gold.price
        )} per troy ounce`
      ),

      createDetail(
        "Silver",
        `${formatUsd(
          rates.silver.price
        )} per troy ounce`
      ),

      createDetail(
        "Currency",
        rates.currency
      ),

      createDetail(
        "Data Status",
        rates.source === "live"
          ? "Live"
          : "Cached"
      ),

      createDetail(
        "Last Updated",
        formatDate(
          rates.lastUpdated
        )
      ),
    ];

    if (asksOnlyGold) {
      reply =
        `The current international gold spot price is ` +
        `${formatUsd(
          rates.gold.price
        )} per troy ounce.`;

      details = [
        createDetail(
          "Gold Symbol",
          rates.gold.symbol
        ),

        createDetail(
          "Gold Price",
          `${formatUsd(
            rates.gold.price
          )} per troy ounce`
        ),

        createDetail(
          "Data Status",
          rates.source === "live"
            ? "Live"
            : "Cached"
        ),

        createDetail(
          "Last Updated",
          formatDate(
            rates.lastUpdated
          )
        ),
      ];
    }

    if (asksOnlySilver) {
      reply =
        `The current international silver spot price is ` +
        `${formatUsd(
          rates.silver.price
        )} per troy ounce.`;

      details = [
        createDetail(
          "Silver Symbol",
          rates.silver.symbol
        ),

        createDetail(
          "Silver Price",
          `${formatUsd(
            rates.silver.price
          )} per troy ounce`
        ),

        createDetail(
          "Data Status",
          rates.source === "live"
            ? "Live"
            : "Cached"
        ),

        createDetail(
          "Last Updated",
          formatDate(
            rates.lastUpdated
          )
        ),
      ];
    }

    return createChatbotResponse({
      reply:
        `${reply} These are international spot prices only and do not represent Muliya showroom selling rates.`,

      confidence: 0.98,

      intent: "metal_rates",

      details,

      actions: [
        createExpertAction(
          customerQuestion
        ),
      ],

      suggestions: [
        "Show me gold jewellery",
        "Show me silver jewellery",
        "Connect me with an expert",
      ],
    });
  } catch (error) {
    console.error(
      "Metal-rate chatbot error:",
      error.message
    );

    return createChatbotResponse({
      reply:
        "I could not retrieve the latest metal prices right now. You can try again shortly or connect with a jewellery expert.",

      confidence: 0.25,

      intent:
        "metal_rates_unavailable",

      actions: [
        createExpertAction(
          customerQuestion
        ),
      ],

      suggestions: [
        "Try gold price again",
        "Show me gold jewellery",
        "Connect me with an expert",
      ],

      needsExpert: true,
    });
  }
};

export {
  isMetalRateQuestion,
  handleMetalRateIntent,
};