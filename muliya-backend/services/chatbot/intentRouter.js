import {
  canHandleProductIntent,
  handleProductIntent,
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

  These functions allow the chatbot to understand simple
  follow-up questions.

  Example:

  Customer:
  "Tell me about MJG1006"

  Customer:
  "Which branches have it?"

  The router can use the previous product context.
*/


const getRecentMessages = (conversationContext = []) => {
  if (!Array.isArray(conversationContext)) {
    return [];
  }

  return conversationContext
    .filter(
      (message) =>
        message &&
        ["customer", "bot"].includes(message.sender) &&
        typeof message.text === "string" &&
        message.text.trim()
    )
    .slice(-10);
};


const findRecentProductCode = (conversationContext = []) => {
  const recentMessages =
    getRecentMessages(conversationContext);

  for (
    let index = recentMessages.length - 1;
    index >= 0;
    index -= 1
  ) {
    const message = recentMessages[index];

    const match = message.text.match(
      /\bMJ[A-Z]\d{4}\b/i
    );

    if (match) {
      return match[0].toUpperCase();
    }
  }

  return null;
};


const isProductFollowUpQuestion = (customerQuestion) => {
  const message = normalizeText(customerQuestion);

  const followUpKeywords = [
    "this product",
    "that product",
    "this jewellery",
    "that jewellery",
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
  ];

  return followUpKeywords.some((keyword) =>
    message.includes(keyword)
  );
};


const enrichProductFollowUp = (
  customerQuestion,
  conversationContext
) => {
  if (
    !isProductFollowUpQuestion(customerQuestion)
  ) {
    return customerQuestion;
  }

  const recentProductCode =
    findRecentProductCode(conversationContext);

  if (!recentProductCode) {
    return customerQuestion;
  }

  return `${customerQuestion} ${recentProductCode}`;
};


/*
  ---------------------------------------------------------
  DIRECT EXPERT REQUEST
  ---------------------------------------------------------
*/


const isDirectExpertRequest = (customerQuestion) => {
  const message = normalizeText(customerQuestion);

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

  return expertKeywords.some((keyword) =>
    message.includes(keyword)
  );
};


/*
  ---------------------------------------------------------
  PRODUCT AVAILABILITY DETECTION

  Product availability needs to be checked before generic
  showroom routing because questions such as:

  "Which branch has MJG1006?"

  contain the word "branch", but they are product questions.
  ---------------------------------------------------------
*/


const isProductAvailabilityQuestion = (
  customerQuestion
) => {
  const message = normalizeText(customerQuestion);

  const containsProductCode =
    /\bMJ[A-Z]\d{4}\b/i.test(customerQuestion);

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
    availabilityKeywords.some((keyword) =>
      message.includes(keyword)
    )
  );
};


/*
  ---------------------------------------------------------
  GENERIC FALLBACK RESPONSE
  ---------------------------------------------------------
*/


const createUnknownResponse = (customerQuestion) => {
  return createChatbotResponse({
    reply:
      "I could not find a reliable answer to that question using the available Muliya product and showroom information. You can ask another question or connect with a jewellery expert.",

    confidence: 0.2,

    intent: "unknown",

    actions: [
      createRetryAction(),

      createExpertAction(customerQuestion),
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

  if (!normalizedQuestion) {
    return createChatbotResponse({
      reply:
        "Please enter a question. I can help you search jewellery, view product details, check branch availability, find showroom information, view metal prices, or connect with an expert.",

      confidence: 1,

      intent: "empty_message",

      actions: [
        createExpertAction(""),
      ],

      suggestions: [
        "Show me gold jewellery",
        "Where are your showrooms?",
        "What is the current gold price?",
        "Connect me with an expert",
      ],
    });
  }


  /*
    1. DIRECT EXPERT REQUEST

    Highest priority because the customer has explicitly
    requested human assistance.
  */

  if (isDirectExpertRequest(normalizedQuestion)) {
    return handleSupportIntent(
      customerQuestion
    );
  }


  /*
    2. ADD SIMPLE CONVERSATION CONTEXT

    Convert:

    "Which branches have it?"

    into:

    "Which branches have it? MJG1006"

    when a recent product code exists.
  */

  const enrichedQuestion =
    enrichProductFollowUp(
      customerQuestion,
      conversationContext
    );


  /*
    3. PRODUCT AVAILABILITY

    Must run before showroom routing.
  */

  if (
    isProductAvailabilityQuestion(
      enrichedQuestion
    )
  ) {
    return handleProductIntent(
      enrichedQuestion
    );
  }


  /*
    4. METAL PRICES
  */

  if (
    isMetalRateQuestion(
      enrichedQuestion
    )
  ) {
    return handleMetalRateIntent(
      enrichedQuestion
    );
  }


  /*
    5. PRODUCT SEARCH AND PRODUCT DETAILS
  */

  if (
    canHandleProductIntent(
      enrichedQuestion
    )
  ) {
    return handleProductIntent(
      enrichedQuestion
    );
  }


  /*
    6. SHOWROOM INFORMATION
  */

  if (
    isShowroomQuestion(
      enrichedQuestion
    )
  ) {
    return handleShowroomIntent(
      enrichedQuestion
    );
  }


  /*
    7. WEBSITE SUPPORT FEATURES

    Appointments
    Enquiries
    Wishlist
    Compare
    Instagram
    Image Search
    Greetings
  */

  if (
    canHandleSupportIntent(
      enrichedQuestion
    )
  ) {
    return handleSupportIntent(
      enrichedQuestion
    );
  }


  /*
    8. UNKNOWN QUESTION → EXPERT HANDOFF
  */

  return createUnknownResponse(
    customerQuestion
  );
};


export {
  routeChatbotIntent,
};