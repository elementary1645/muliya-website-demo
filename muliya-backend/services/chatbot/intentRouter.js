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


/*
  ---------------------------------------------------------
  BASIC HELPERS
  ---------------------------------------------------------
*/

const normalizeText = (value) => {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
};


/*
  ---------------------------------------------------------
  KNOWN MULIYA BRANCHES
  ---------------------------------------------------------
*/

const branchAliases = {
  bengaluru: "Bengaluru",
  bangalore: "Bengaluru",
  puttur: "Puttur",
  madikeri: "Madikeri",
};


const findMentionedBranch = (
  customerQuestion,
) => {
  const message =
    normalizeText(customerQuestion);

  for (
    const [alias, branch]
    of Object.entries(branchAliases)
  ) {
    const pattern = new RegExp(
      `\\b${alias}\\b`,
      "i",
    );

    if (pattern.test(message)) {
      return branch;
    }
  }

  return null;
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


const getValidContextProducts = (
  message,
) => {
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


/*
  ---------------------------------------------------------
  FIND MOST RECENT BOT PRODUCT MESSAGE
  ---------------------------------------------------------
*/

const getMostRecentBotProductMessage = (
  conversationContext = [],
) => {
  const recentMessages =
    getRecentMessages(
      conversationContext,
    );

  for (
    let index =
      recentMessages.length - 1;
    index >= 0;
    index -= 1
  ) {
    const message =
      recentMessages[index];

    if (message.sender !== "bot") {
      continue;
    }

    const products =
      getValidContextProducts(
        message,
      );

    if (
      products.length > 0 ||
      message.relatedProduct
    ) {
      return message;
    }
  }

  return null;
};


/*
  ---------------------------------------------------------
  FIND MOST RECENT SELECTED PRODUCT

  This is important for conversations like:

  Customer:
  "Is the second one available in Bengaluru?"

  Bot:
  responds about MJD2006

  Customer:
  "What about Madikeri?"

  We use the bot's relatedProduct first.
  ---------------------------------------------------------
*/

const findRecentProductCode = (
  conversationContext = [],
) => {
  const recentMessages =
    getRecentMessages(
      conversationContext,
    );

  for (
    let index =
      recentMessages.length - 1;
    index >= 0;
    index -= 1
  ) {
    const message =
      recentMessages[index];

    /*
      Strongest context:
      bot explicitly marked a related product.
    */

    if (
      message.sender === "bot" &&
      message.relatedProduct?.code
    ) {
      return String(
        message.relatedProduct.code,
      ).toUpperCase();
    }

    /*
      Next strongest context:
      bot response contained exactly one product.
    */

    const products =
      getValidContextProducts(
        message,
      );

    if (
      message.sender === "bot" &&
      products.length === 1 &&
      products[0]?.code
    ) {
      return String(
        products[0].code,
      ).toUpperCase();
    }

    /*
      Fallback:
      product code mentioned in conversation text.
    */

    const codeMatch =
      message.text.match(
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
  ORDINAL PRODUCT REFERENCES
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
    normalizeText(
      customerQuestion,
    );

  for (
    const [word, index]
    of Object.entries(
      ordinalIndexMap,
    )
  ) {
    const pattern =
      new RegExp(
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


/*
  ---------------------------------------------------------
  PRODUCT REFERENCE DETECTION
  ---------------------------------------------------------
*/

const containsProductReference = (
  customerQuestion,
) => {
  const message =
    normalizeText(
      customerQuestion,
    );

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

    /\bcheapest\b/,
    /\bmost expensive\b/,
    /\bcostliest\b/,
    /\blowest price\b/,
    /\bhighest price\b/,
  ];

  return referencePatterns.some(
    (pattern) =>
      pattern.test(message),
  );
};


/*
  ---------------------------------------------------------
  RESOLVE ORDINAL PRODUCT
  ---------------------------------------------------------
*/

const resolveReferencedProduct = ({
  customerQuestion,
  conversationContext,
}) => {
  /*
    Explicit code always wins.
  */

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

  /*
    Last product.
  */

  if (
    requestedIndex === "last" &&
    products.length > 0
  ) {
    return products[
      products.length - 1
    ];
  }

  /*
    First / second / third etc.
  */

  if (
    Number.isInteger(
      requestedIndex,
    ) &&
    products[requestedIndex]
  ) {
    return products[
      requestedIndex
    ];
  }

  /*
    Generic follow-up after a single
    selected product.
  */

  if (
    recentBotMessage.relatedProduct
  ) {
    return (
      recentBotMessage.relatedProduct
    );
  }

  if (products.length === 1) {
    return products[0];
  }

  return null;
};


/*
  ---------------------------------------------------------
  PRODUCT FOLLOW-UP DETECTION
  ---------------------------------------------------------
*/

const isProductFollowUpQuestion = (
  customerQuestion,
) => {
  const message =
    normalizeText(
      customerQuestion,
    );

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

    "cheapest",
    "most expensive",
    "costliest",

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
        message.includes(
          keyword,
        ),
    )
  );
};


/*
  ---------------------------------------------------------
  ENRICH NORMAL PRODUCT FOLLOW-UP

  Example:

  "What is the price of the second one?"

  becomes:

  "What is the price of the second one? MJD2006"
  ---------------------------------------------------------
*/

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

  return (
    `${customerQuestion} ` +
    `${productCode}`
  );
};


/*
  ---------------------------------------------------------
  BRANCH FOLLOW-UP DETECTION

  Examples:

  "What about Madikeri?"
  "And Puttur?"
  "How about Bengaluru?"
  "What about Bangalore?"
  ---------------------------------------------------------
*/

const isBranchFollowUpQuestion = ({
  customerQuestion,
  conversationContext = [],
}) => {
  const branch =
    findMentionedBranch(
      customerQuestion,
    );

  if (!branch) {
    return false;
  }

  const message =
    normalizeText(
      customerQuestion,
    );

  /*
    Explicit availability wording is
    obviously product-related when recent
    product context exists.
  */

  const followUpPhrases = [
    "what about",
    "how about",
    "and bengaluru",
    "and bangalore",
    "and puttur",
    "and madikeri",
    "available in",
    "availability in",
    "stock in",
  ];

  const hasFollowUpPhrase =
    followUpPhrases.some(
      (phrase) =>
        message.includes(phrase),
    );

  if (!hasFollowUpPhrase) {
    return false;
  }

  const recentProductCode =
    findRecentProductCode(
      conversationContext,
    );

  return Boolean(
    recentProductCode,
  );
};


/*
  ---------------------------------------------------------
  ENRICH BRANCH FOLLOW-UP

  "What about Madikeri?"

  becomes:

  "Is MJD2006 available in Madikeri?"
  ---------------------------------------------------------
*/

const enrichBranchFollowUp = (
  customerQuestion,
  conversationContext,
) => {
  const branch =
    findMentionedBranch(
      customerQuestion,
    );

  const productCode =
    findRecentProductCode(
      conversationContext,
    );

  if (
    !branch ||
    !productCode
  ) {
    return customerQuestion;
  }

  return (
    `Is ${productCode} available ` +
    `in ${branch}?`
  );
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
    normalizeText(
      customerQuestion,
    );

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
      message.includes(
        keyword,
      ),
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
    normalizeText(
      customerQuestion,
    );

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
        message.includes(
          keyword,
        ),
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
    normalizeText(
      customerQuestion,
    );


  /*
    1. EMPTY MESSAGE
  */

  if (!normalizedQuestion) {
    return createChatbotResponse({
      reply:
        "Please enter a question. I can help you search jewellery, view product details, compare products, check branch availability, find showroom information, view metal prices, or connect with an expert.",

      confidence: 1,

      intent:
        "empty_message",

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
    3. PRODUCT COMPARISON

    Comparison must receive the ORIGINAL
    question so both ordinal references
    remain intact.

    Example:

    "Compare the first and second"
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
    4. BRANCH FOLLOW-UP MEMORY

    Example conversation:

    "Is the second one available in Bengaluru?"

    followed by:

    "What about Madikeri?"

    becomes:

    "Is MJD2006 available in Madikeri?"
  */

  if (
    isBranchFollowUpQuestion({
      customerQuestion,
      conversationContext,
    })
  ) {
    const branchQuestion =
      enrichBranchFollowUp(
        customerQuestion,
        conversationContext,
      );

    return handleProductIntent(
      branchQuestion,
      conversationContext,
    );
  }


  /*
    5. NORMAL PRODUCT FOLLOW-UP MEMORY
  */

  const enrichedQuestion =
    enrichProductFollowUp(
      customerQuestion,
      conversationContext,
    );


  /*
    6. PRODUCT AVAILABILITY

    Must run before showroom routing.
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
    7. METAL RATES
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
    8. PRODUCT SEARCH / DETAILS /
       CONTEXTUAL PRODUCT QUESTIONS
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
    9. SHOWROOM INFORMATION
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
    10. SUPPORT FEATURES

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
    11. UNKNOWN QUESTION
  */

  return createUnknownResponse(
    customerQuestion,
  );
};


export {
  routeChatbotIntent,
};