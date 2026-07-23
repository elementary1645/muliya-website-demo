import OpenAI from "openai";

const AI_ENABLED =
  String(process.env.OPENAI_CHAT_ENABLED || "")
    .trim()
    .toLowerCase() === "true";

const MODEL =
  process.env.OPENAI_CHAT_MODEL ||
  "gpt-5-mini";

let openaiClient = null;

const getOpenAIClient = () => {
  if (!AI_ENABLED) {
    return null;
  }

  if (!process.env.OPENAI_API_KEY) {
    console.warn(
      "OPENAI_CHAT_ENABLED is true but OPENAI_API_KEY is missing.",
    );

    return null;
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  return openaiClient;
};


const cleanString = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
};


const cleanNumber = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const numericValue = Number(value);

  return Number.isFinite(numericValue)
    ? numericValue
    : null;
};


const normalizeIntentResult = (result) => {
  const allowedIntents = [
    "product_recommendation",
    "product_search",
    "product_details",
    "product_comparison",
    "product_availability",
    "showroom",
    "metal_rate",
    "appointment",
    "enquiry",
    "general_jewellery_advice",
    "unknown",
  ];

  const intent = allowedIntents.includes(
    result?.intent,
  )
    ? result.intent
    : "unknown";

  return {
    intent,

    category:
      cleanString(result?.category),

    type:
      cleanString(result?.type),

    collection:
      cleanString(result?.collection),

    purity:
      cleanString(result?.purity),

    branch:
      cleanString(result?.branch),

    occasion:
      cleanString(result?.occasion),

    recipient:
      cleanString(result?.recipient),

    style:
      cleanString(result?.style),

    searchText:
      cleanString(result?.searchText),

    maxPrice:
      cleanNumber(result?.maxPrice),

    minPrice:
      cleanNumber(result?.minPrice),

    maxWeight:
      cleanNumber(result?.maxWeight),

    minWeight:
      cleanNumber(result?.minWeight),

    sort:
      cleanString(result?.sort),

    explanation:
      cleanString(result?.explanation),

    confidence: Math.max(
      0,
      Math.min(
        1,
        Number(result?.confidence) || 0,
      ),
    ),
  };
};


const buildConversationText = (
  conversationContext = [],
) => {
  if (!Array.isArray(conversationContext)) {
    return "";
  }

  return conversationContext
    .slice(-8)
    .map((message) => {
      const role =
        message.sender === "customer"
          ? "Customer"
          : "Assistant";

      const products = Array.isArray(
        message.products,
      )
        ? message.products
            .slice(0, 5)
            .map((product, index) => {
              return [
                `${index + 1}.`,
                product.name || "",
                product.code
                  ? `(${product.code})`
                  : "",
              ]
                .filter(Boolean)
                .join(" ");
            })
            .join("; ")
        : "";

      return products
        ? `${role}: ${message.text}\nProducts shown: ${products}`
        : `${role}: ${message.text}`;
    })
    .join("\n");
};


const interpretCustomerQuestion = async ({
  customerQuestion,
  conversationContext = [],
}) => {
  const client = getOpenAIClient();

  if (!client) {
    return null;
  }

  const question = cleanString(
    customerQuestion,
  );

  if (!question) {
    return null;
  }

  const conversation =
    buildConversationText(
      conversationContext,
    );

  try {
    const response =
      await client.responses.create({
        model: MODEL,

        instructions: `
You are the intent interpretation layer for the
Muliya Gold & Diamonds website chatbot.

You must return your result as a valid JSON object.

Your job is NOT to answer the customer directly.

Your job is to convert the customer's natural-language
request into structured search information that another
server component will use to query the real Muliya
MongoDB product catalogue.

CRITICAL RULES:

1. Never invent a product.
2. Never invent a product code.
3. Never invent a price.
4. Never invent stock or branch availability.
5. Never claim that a product exists.
6. Extract only information expressed or strongly implied
   by the customer.
7. Product results will be retrieved separately from the
   real database.
8. Prices should be returned as plain INR numbers.
9. Weights should be returned as gram numbers.
10. If uncertain, leave a field empty or null.
11. Consider recent conversation when interpreting
    follow-up requests.
12. Return the response strictly as a valid JSON object.
13. Do not include markdown, code fences, explanations, or any text outside the JSON object.

Allowed intents:

product_recommendation
product_search
product_details
product_comparison
product_availability
showroom
metal_rate
appointment
enquiry
general_jewellery_advice
unknown

Return exactly this JSON shape:

{
  "intent": "",
  "category": "",
  "type": "",
  "collection": "",
  "purity": "",
  "branch": "",
  "occasion": "",
  "recipient": "",
  "style": "",
  "searchText": "",
  "maxPrice": null,
  "minPrice": null,
  "maxWeight": null,
  "minWeight": null,
  "sort": "",
  "explanation": "",
  "confidence": 0
}

Examples:

Customer:
"I need an elegant diamond ring for my engagement
under 1 lakh"

Expected interpretation:

{
  "intent": "product_recommendation",
  "category": "Diamond",
  "type": "Ring",
  "collection": "",
  "purity": "",
  "branch": "",
  "occasion": "Engagement",
  "recipient": "",
  "style": "Elegant",
  "searchText": "",
  "maxPrice": 100000,
  "minPrice": null,
  "maxWeight": null,
  "minWeight": null,
  "sort": "price-asc",
  "explanation": "Customer wants an elegant diamond engagement ring within ₹1 lakh.",
  "confidence": 0.95
}

Customer:
"show lightweight 22k gold chains"

Expected interpretation:

{
  "intent": "product_search",
  "category": "Gold",
  "type": "Chain",
  "collection": "",
  "purity": "22K",
  "branch": "",
  "occasion": "",
  "recipient": "",
  "style": "Lightweight",
  "searchText": "",
  "maxPrice": null,
  "minPrice": null,
  "maxWeight": null,
  "minWeight": null,
  "sort": "",
  "explanation": "Customer is searching for lightweight 22K gold chains.",
  "confidence": 0.95
}
        `.trim(),

       input: `
Return the interpretation of the following customer request as JSON.

Recent conversation:
${conversation || "No previous conversation."}

Current customer question:
${question}
`.trim(),

        text: {
          format: {
            type: "json_object",
          },
        },
      });

    const outputText =
      response.output_text?.trim();

    if (!outputText) {
      return null;
    }

    const parsedResult =
      JSON.parse(outputText);

    return normalizeIntentResult(
      parsedResult,
    );
  } catch (error) {
    console.error(
      "AI intent interpretation failed:",
      error?.message || error,
    );

    return null;
  }
};


const isAIIntentServiceAvailable = () => {
  return Boolean(
    AI_ENABLED &&
    process.env.OPENAI_API_KEY,
  );
};


export {
  interpretCustomerQuestion,
  isAIIntentServiceAvailable,
};