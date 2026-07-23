import {
  canHandleProductIntent,
  handleProductIntent,
  isProductComparisonQuestion,
} from "./productHandler.js";

import {
  isShowroomQuestion,
  handleShowroomIntent,
} from "./showroomHandler.js";

import {
  isMetalRateQuestion,
  handleMetalRateIntent,
} from "./metalRateHandler.js";

import {
  canHandleSupportIntent,
  handleSupportIntent,
} from "./supportHandler.js";

import {
  createChatbotResponse,
  createExpertAction,
  createRetryAction,
} from "./responseBuilder.js";


const normalizeText = (value) => {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
};


/*
  ---------------------------------------------------------
  CONVERSATION CONTEXT HELPERS
  ---------------------------------------------------------
*/

const getRecentMessages = (
  conversationContext = [],
) => {
  if (!Array.isArray(conversationContext)) {
    return [];
  }

  return conversationContext
    .filter(
      (message) =>
        message &&
        ["customer", "bot"].includes(
          message.sender,
        ) &&
        typeof message.text === "string" &&
        message.text.trim(),
    )
    .slice(-10);
};


const getValidContextProducts = (message) => {
  if (
    !message ||
    !Array.isArray(message.products)
  ) {
    return [];
  }

  return message.products.filter(
    (product) =>
      product &&
      (
        product.code ||
        product.id ||
        product.name
      ),
  );
};


const getMostRecentBotProductMessage = (
  conversationContext = [],
) => {
  const recentMessages =
    getRecentMessages(conversationContext);

  for (
    let index = recentMessages.length - 1;
    index >= 0;
    index -= 1
  ) {
    const message = recentMessages[index];

    if (message.sender !== "bot") {
      continue;
    }

    const products =
      getValidContextProducts(message);

    if (
      products.length > 0 ||
      message.relatedProduct
    ) {
      return message;
    }
  }

  return null;
};


const findRecentProductCode = (
  conversationContext = [],
) => {
  const recentMessages =
    getRecentMessages(conversationContext);

  for (
    let index = recentMessages.length - 1;
    index >= 0;
    index -= 1
  ) {
    const message = recentMessages[index];

    if (message.relatedProduct?.code) {
      return String(
        message.relatedProduct.code,
      ).toUpperCase();
    }

    const products =
      getValidContextProducts(message);

    if (products[0]?.code) {
      return String(
        products[0].code,
      ).toUpperCase();
    }

    const codeMatch = message.text.match(
      /\bMJ[A-Z]\d{4}\b/i,
    );

    if (codeMatch) {
      return codeMatch[0].toUpperCase();
    }
  }

  return null;
};


/*
  ---------------------------------------------------------
  PRODUCT REFERENCE RESOLUTION
  ---------------------------------------------------------
*/

const ordinalIndexMap = {
  first: 0,
  "1st": 0,
  one: 0,

  second: 1,
  "2nd": 1,
  two: 1,

  third: 2,
  "3rd": 2,
  three: 2,

  fourth: 3,
  "4th": 3,
  four: 3,

  fifth: 4,
  "5th": 4,
  five: 4,
};


const findRequestedProductIndex = (
  customerQuestion,
) => {
  const message =
    normalizeText(customerQuestion);

  for (
    const [word, index]
    of Object.entries(ordinalIndexMap)
  ) {
    const pattern = new RegExp(
      `\\b${word}\\b`,
      "i",
    );

    if (pattern.test(message)) {
      return index;
    }
  }

  if (
    /\b(last|latest)\s+(one|product|item|ring|necklace|design|jewellery|jewelry)\b/i
      .test(message)
  ) {
    return "last";
  }

  return null;
};


const containsProductReference = (
  customerQuestion,
) => {
  const message =
    normalizeText(customerQuestion);

  const referencePatterns = [
    /\b(first|second|third|fourth|fifth)\b/,
    /\b(1st|2nd|3rd|4th|5th)\b/,
    /\b(last|latest)\s+(one|product|item|design)\b/,
    /\bthis product\b/,
    /\bthat product\b/,
    /\bthis jewellery\b/,
    /\bthat jewellery\b/,
    /\bthis jewelry\b/,
    /\bthat jewelry\b/,
    /\bthis one\b/,
    /\bthat one\b/,
    /\bthe one\b/,
    /\bit\b/,
    /\bits\b/,
    /\bthat ring\b/,
    /\bthis ring\b/,
    /\bthat necklace\b/,
    /\bthis necklace\b/,
    /\bthat design\b/,
    /\bthis design\b/,
  ];

  return referencePatterns.some(
    (pattern) => pattern.test(message),
  );
};


const resolveReferencedProduct = ({
  customerQuestion,
  conversationContext,
}) => {
  if (
    /\bMJ[A-Z]\d{4}\b/i.test(
      customerQuestion,
    )
  ) {
    return null;
  }

  if (
    !containsProductReference(
      customerQuestion,
    )
  ) {
    return null;
  }

  const recentBotMessage =
    getMostRecentBotProductMessage(
      conversationContext,
    );

  if (!recentBotMessage) {
    return null;
  }

  const products =
    getValidContextProducts(
      recentBotMessage,
    );

  const requestedIndex =
    findRequestedProductIndex(
      customerQuestion,
    );

  if (
    requestedIndex === "last" &&
    products.length > 0
  ) {
    return products[
      products.length - 1
    ];
  }

  if (
    Number.isInteger(requestedIndex) &&
    products[requestedIndex]
  ) {
    return products[requestedIndex];
  }

  if (
    recentBotMessage.relatedProduct
  ) {
    return recentBotMessage.relatedProduct;
  }

  if (products.length > 0) {
    return products[0];
  }

  return null;
};


/*
  ---------------------------------------------------------
  FOLLOW-UP QUESTION DETECTION
  ---------------------------------------------------------
*/

const isProductFollowUpQuestion = (
  customerQuestion,
) => {
  const message =
    normalizeText(customerQuestion);

  const followUpKeywords = [
    "this product",
    "that product",
    "this jewellery",
    "that jewellery",
    "this jewelry",
    "that jewelry",
    "this one",
    "that one",
    "the first",
    "the second",
    "the third",
    "the fourth",
    "the fifth",
    "first ring",
    "second ring",
    "third ring",
    "last one",
    "it available",
    "is it available",
    "where is it available",
    "which branches have it",
    "which branch has it",
    "book appointment for it",
    "appointment for it",
    "enquire about it",
    "enquiry about it",
    "tell me more about it",
    "more details",
    "what is its price",
    "what is the price",
    "what is its purity",
    "what is its weight",
    "how much is it",
    "show similar products",
  ];

  return (
    containsProductReference(
      customerQuestion,
    ) ||
    followUpKeywords.some(
      (keyword) =>
        message.includes(keyword),
    )
  );
};


const enrichProductFollowUp = (
  customerQuestion,
  conversationContext,
) => {
  if (
    !isProductFollowUpQuestion(
      customerQuestion,
    )
  ) {
    return customerQuestion;
  }

  const referencedProduct =
    resolveReferencedProduct({
      customerQuestion,
      conversationContext,
    });

  const productCode =
    referencedProduct?.code ||
    findRecentProductCode(
      conversationContext,
    );

  if (!productCode) {
    return customerQuestion;
  }

  if (
    String(customerQuestion)
      .toUpperCase()
      .includes(
        String(productCode)
          .toUpperCase(),
      )
  ) {
    return customerQuestion;
  }

  return `${customerQuestion} ${productCode}`;
};


/*
  ---------------------------------------------------------
  DIRECT EXPERT REQUEST
  ---------------------------------------------------------
*/

const isDirectExpertRequest = (
  customerQuestion,
) => {
  const message =
    normalizeText(customerQuestion);

  const expertKeywords = [
    "connect me with an expert",
    "talk to an expert",
    "speak to an expert",
    "talk to a person",
    "speak to a person",
    "talk to a human",
    "speak to a human",
    "customer care",
    "call me",
    "contact me",
    "need expert help",
    "jewellery expert",
    "jewelry expert",
  ];

  return expertKeywords.some(
    (keyword) =>
      message.includes(keyword),
  );
};


/*
  ---------------------------------------------------------
  PRODUCT AVAILABILITY DETECTION
  ---------------------------------------------------------
*/

const isProductAvailabilityQuestion = (
  customerQuestion,
) => {
  const message =
    normalizeText(customerQuestion);

  const containsProductCode =
    /\bMJ[A-Z]\d{4}\b/i.test(
      customerQuestion,
    );

  const availabilityKeywords = [
    "available",
    "availability",
    "stock",
    "which branch",
    "which showroom",
    "where can i find",
    "where is this product",
  ];

  return (
    containsProductCode &&
    availabilityKeywords.some(
      (keyword) =>
        message.includes(keyword),
    )
  );
};


/*
  ---------------------------------------------------------
  GENERIC FALLBACK
  ---------------------------------------------------------
*/

const createUnknownResponse = (
  customerQuestion,
) => {
  return createChatbotResponse({
    reply:
      "I could not find a reliable answer to that question using the available Muliya product and showroom information. You can ask another question or connect with a jewellery expert.",

    confidence: 0.2,

    intent: "unknown",

    actions: [
      createRetryAction(),

      createExpertAction(
        customerQuestion,
      ),
    ],

    suggestions: [
      "Show me gold jewellery",
      "Show me diamond rings",
      "Where are your showrooms?",
      "What is the current gold price?",
      "Connect me with an expert",
    ],

    needsExpert: true,
  });
};


/*
  ---------------------------------------------------------
  MAIN INTENT ROUTER
  ---------------------------------------------------------
*/

const routeChatbotIntent = async ({
  customerQuestion,
  conversationContext = [],
}) => {
  const normalizedQuestion =
    normalizeText(customerQuestion);


  /*
    1. EMPTY MESSAGE
  */

  if (!normalizedQuestion) {
    return createChatbotResponse({
      reply:
        "Please enter a question. I can help you search jewellery, view product details, compare products, check branch availability, find showroom information, view metal prices, or connect with an expert.",

      confidence: 1,

      intent: "empty_message",

      actions: [
        createExpertAction(""),
      ],

      suggestions: [
        "Show me gold jewellery",
        "Show me diamond rings",
        "Where are your showrooms?",
        "What is the current gold price?",
        "Connect me with an expert",
      ],
    });
  }


  /*
    2. DIRECT EXPERT REQUEST
  */

  if (
    isDirectExpertRequest(
      normalizedQuestion,
    )
  ) {
    return handleSupportIntent(
      customerQuestion,
    );
  }


  /*
    ---------------------------------------------------------
    IMPORTANT:

    Product comparisons must be checked using the ORIGINAL
    customer question.

    We do NOT enrich:

    "Compare the first and second"

    into:

    "Compare the first and second MJG1001"

    because the comparison handler needs both ordinal
    references.
    ---------------------------------------------------------
  */

  if (
    isProductComparisonQuestion(
      customerQuestion,
    )
  ) {
    return handleProductIntent(
      customerQuestion,
      conversationContext,
    );
  }


  /*
    3. CONVERSATION FOLLOW-UP RESOLUTION

    Example:

    "Is the first ring available?"

    becomes:

    "Is the first ring available? MJG1006"
  */

  const enrichedQuestion =
    enrichProductFollowUp(
      customerQuestion,
      conversationContext,
    );


  /*
    4. PRODUCT AVAILABILITY

    Must be before showroom routing because:

    "Which branch has MJG1006?"

    is a product question, not a generic showroom question.
  */

  if (
    isProductAvailabilityQuestion(
      enrichedQuestion,
    )
  ) {
    return handleProductIntent(
      enrichedQuestion,
      conversationContext,
    );
  }


  /*
    5. METAL RATES
  */

  if (
    isMetalRateQuestion(
      enrichedQuestion,
    )
  ) {
    return handleMetalRateIntent(
      enrichedQuestion,
    );
  }


  /*
    6. PRODUCT SEARCH / PRODUCT DETAILS
  */

  if (
    canHandleProductIntent(
      enrichedQuestion,
    )
  ) {
    return handleProductIntent(
      enrichedQuestion,
      conversationContext,
    );
  }


  /*
    7. SHOWROOM INFORMATION
  */

  if (
    isShowroomQuestion(
      enrichedQuestion,
    )
  ) {
    return handleShowroomIntent(
      enrichedQuestion,
    );
  }


  /*
    8. SUPPORT FEATURES

    Appointments
    Enquiries
    Wishlist
    Compare page
    Instagram
    Image search
    Greetings
  */

  if (
    canHandleSupportIntent(
      enrichedQuestion,
    )
  ) {
    return handleSupportIntent(
      enrichedQuestion,
    );
  }


  /*
    9. UNKNOWN QUESTION
  */

  return createUnknownResponse(
    customerQuestion,
  );
};


export {
  routeChatbotIntent,
};