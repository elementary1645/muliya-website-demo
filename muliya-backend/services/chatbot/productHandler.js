import Product from "../../models/Product.js";

import {
  createAppointmentAction,
  createChatbotResponse,
  createDetail,
  createEnquiryAction,
  createExpertAction,
  createProductAction,
} from "./responseBuilder.js";

const PRODUCT_LIMIT = 5;

const categoryNames = [
  "gold",
  "diamond",
  "silver",
];

const productTypeKeywords = [
  "necklace",
  "ring",
  "earrings",
  "earring",
  "bangles",
  "bangle",
  "bracelet",
  "pendant",
  "kada",
  "haram",
  "anklet",
  "silverware",
  "diya",
  "pooja article",
  "gift article",
];

const normalizeText = (value) => {
  return String(value || "")
    .trim()
    .toLowerCase();
};

const escapeRegExp = (value) => {
  return String(value).replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
};

const findProductCode = (message) => {
  const match = String(message || "").match(
    /\bMJ[A-Z]\d{4}\b/i
  );

  return match
    ? match[0].toUpperCase()
    : null;
};

const findCategory = (message) => {
  const normalizedMessage = normalizeText(message);

  return categoryNames.find((category) =>
    normalizedMessage.includes(category)
  );
};

const findProductType = (message) => {
  const normalizedMessage = normalizeText(message);

  return productTypeKeywords.find((type) =>
    normalizedMessage.includes(type)
  );
};

const getAvailableBranches = (product) => {
  return Object.entries(
    product.branchAvailability || {}
  )
    .filter(([, available]) => available === true)
    .map(([branch]) => branch);
};

const getUnavailableBranches = (product) => {
  return Object.entries(
    product.branchAvailability || {}
  )
    .filter(([, available]) => available !== true)
    .map(([branch]) => branch);
};

const formatProductForChat = (product) => {
  return {
    id: String(product._id),

    code: product.code,

    name: product.name,

    category: product.category,

    type: product.type,

    collection: product.collection,

    price: product.price,

    weight: product.weight,

    purity: product.purity,

    availability: product.availability,

    image: product.image,

    availableBranches:
      getAvailableBranches(product),

    unavailableBranches:
      getUnavailableBranches(product),
  };
};

const buildProductDetails = (product) => {
  const availableBranches =
    getAvailableBranches(product);

  const unavailableBranches =
    getUnavailableBranches(product);

  return [
    createDetail(
      "Jewellery Code",
      product.code
    ),

    createDetail(
      "Category",
      product.category
    ),

    createDetail(
      "Type",
      product.type
    ),

    createDetail(
      "Collection",
      product.collection
    ),

    createDetail(
      "Price",
      product.price
    ),

    createDetail(
      "Weight",
      product.weight
    ),

    createDetail(
      "Purity",
      product.purity
    ),

    createDetail(
      "Availability",
      product.availability
    ),

    createDetail(
      "Available Branches",
      availableBranches.length > 0
        ? availableBranches.join(", ")
        : "Not currently marked available"
    ),

    createDetail(
      "Unavailable Branches",
      unavailableBranches.length > 0
        ? unavailableBranches.join(", ")
        : ""
    ),
  ];
};

const buildProductActions = (
  product,
  customerQuestion
) => {
  return [
    createProductAction(product),

    createAppointmentAction(product),

    createEnquiryAction(product),

    createExpertAction(
      customerQuestion,
      String(product._id)
    ),
  ];
};

const getProductByCode = async (
  productCode,
  customerQuestion
) => {
  const product = await Product.findOne({
    code: productCode,
  }).lean();

  if (!product) {
    return createChatbotResponse({
      reply:
        `I could not find a jewellery product with code ${productCode}. Please check the code and try again.`,

      confidence: 0.35,

      intent: "product_code_not_found",

      actions: [
        createExpertAction(customerQuestion),
      ],

      suggestions: [
        "Show me gold jewellery",
        "Show me diamond jewellery",
        "Search for bridal jewellery",
      ],

      needsExpert: true,
    });
  }

  const availableBranches =
    getAvailableBranches(product);

  const availabilityText =
    availableBranches.length > 0
      ? `It is currently marked available in ${availableBranches.join(
          " and "
        )}.`
      : "It is not currently marked available at any listed branch.";

  return createChatbotResponse({
    reply:
      `${product.name} (${product.code}) is a ` +
      `${product.purity} ${product.type} from the ` +
      `${product.collection}. Its listed price is ` +
      `${product.price}. ${availabilityText}`,

    confidence: 0.98,

    intent: "product_code",

    details: buildProductDetails(product),

    products: [
      formatProductForChat(product),
    ],

    actions: buildProductActions(
      product,
      customerQuestion
    ),

    suggestions: [
      "Which branches have this product?",
      "Book an appointment for this product",
      "I want to enquire about this product",
    ],

    relatedProduct: {
      id: String(product._id),
      code: product.code,
      name: product.name,
    },
  });
};

const buildProductQuery = ({
  category,
  productType,
  searchText,
}) => {
  const filters = [];

  if (category) {
    filters.push({
      category: new RegExp(
        `^${escapeRegExp(category)}$`,
        "i"
      ),
    });
  }

  if (productType) {
    const normalizedType =
      productType === "earring"
        ? "earrings"
        : productType === "bangle"
          ? "bangles"
          : productType;

    filters.push({
      type: new RegExp(
        escapeRegExp(normalizedType),
        "i"
      ),
    });
  }

  if (searchText) {
    const searchRegex = new RegExp(
      escapeRegExp(searchText),
      "i"
    );

    filters.push({
      $or: [
        { name: searchRegex },
        { code: searchRegex },
        { category: searchRegex },
        { type: searchRegex },
        { collection: searchRegex },
        { purity: searchRegex },
      ],
    });
  }

  if (filters.length === 0) {
    return {};
  }

  if (filters.length === 1) {
    return filters[0];
  }

  return {
    $and: filters,
  };
};

const cleanSearchText = (
  message,
  category,
  productType
) => {
  let cleanedMessage = normalizeText(message);

  const removablePhrases = [
    "show me",
    "find me",
    "search for",
    "do you have",
    "i want",
    "i need",
    "looking for",
    "jewellery",
    "jewelry",
    "products",
    "product",
    "designs",
    "design",
  ];

  removablePhrases.forEach((phrase) => {
    cleanedMessage = cleanedMessage.replace(
      new RegExp(
        `\\b${escapeRegExp(phrase)}\\b`,
        "gi"
      ),
      " "
    );
  });

  if (category) {
    cleanedMessage = cleanedMessage.replace(
      new RegExp(
        `\\b${escapeRegExp(category)}\\b`,
        "gi"
      ),
      " "
    );
  }

  if (productType) {
    cleanedMessage = cleanedMessage.replace(
      new RegExp(
        `\\b${escapeRegExp(productType)}\\b`,
        "gi"
      ),
      " "
    );
  }

  return cleanedMessage
    .replace(/\s+/g, " ")
    .trim();
};

const searchProducts = async (
  customerQuestion
) => {
  const category =
    findCategory(customerQuestion);

  const productType =
    findProductType(customerQuestion);

  const searchText = cleanSearchText(
    customerQuestion,
    category,
    productType
  );

  const query = buildProductQuery({
    category,
    productType,
    searchText,
  });

  const products = await Product.find(query)
    .sort({
      featured: -1,
      trending: -1,
      createdAt: -1,
    })
    .limit(PRODUCT_LIMIT)
    .lean();

  if (products.length === 0) {
    return createChatbotResponse({
      reply:
        "I could not find a jewellery product matching that request in the current catalogue.",

      confidence: 0.3,

      intent: "product_search_no_results",

      actions: [
        createExpertAction(customerQuestion),
      ],

      suggestions: [
        "Show me gold jewellery",
        "Show me diamond rings",
        "Show me silver jewellery",
        "Connect me with an expert",
      ],

      needsExpert: true,
    });
  }

  const formattedProducts = products.map(
    formatProductForChat
  );

  let description =
    "I found these jewellery products in the current catalogue.";

  if (category && productType) {
    description =
      `I found these ${category} ${productType} designs ` +
      "in the current catalogue.";
  } else if (category) {
    description =
      `I found these ${category} jewellery designs ` +
      "in the current catalogue.";
  } else if (productType) {
    description =
      `I found these ${productType} designs ` +
      "in the current catalogue.";
  }

  return createChatbotResponse({
    reply: description,

    confidence: 0.88,

    intent: "product_search",

    details: [
      createDetail(
        "Results Found",
        products.length
      ),

      createDetail(
        "Category",
        category
          ? category.charAt(0).toUpperCase() +
              category.slice(1)
          : "All"
      ),

      createDetail(
        "Product Type",
        productType || "All"
      ),
    ],

    products: formattedProducts,

    actions: [
      createExpertAction(customerQuestion),
    ],

    suggestions: [
      "Show me bridal jewellery",
      "Show me rings",
      "Show me necklaces",
      "Check branch availability",
    ],
  });
};

const getProductAvailabilityResponse = async (
  customerQuestion
) => {
  const productCode =
    findProductCode(customerQuestion);

  if (!productCode) {
    return null;
  }

  const product = await Product.findOne({
    code: productCode,
  }).lean();

  if (!product) {
    return createChatbotResponse({
      reply:
        `I could not find a product with code ${productCode}.`,

      confidence: 0.3,

      intent: "product_availability_not_found",

      actions: [
        createExpertAction(customerQuestion),
      ],

      needsExpert: true,
    });
  }

  const availableBranches =
    getAvailableBranches(product);

  const unavailableBranches =
    getUnavailableBranches(product);

  return createChatbotResponse({
    reply:
      availableBranches.length > 0
        ? `${product.name} is currently marked available in ${availableBranches.join(
            " and "
          )}.`
        : `${product.name} is not currently marked available in the listed showrooms.`,

    confidence: 0.97,

    intent: "product_availability",

    details: [
      createDetail(
        "Jewellery Code",
        product.code
      ),

      createDetail(
        "Available Branches",
        availableBranches.length > 0
          ? availableBranches.join(", ")
          : "None"
      ),

      createDetail(
        "Unavailable Branches",
        unavailableBranches.length > 0
          ? unavailableBranches.join(", ")
          : "None"
      ),
    ],

    products: [
      formatProductForChat(product),
    ],

    actions: buildProductActions(
      product,
      customerQuestion
    ),

    suggestions: [
      "Book an appointment",
      "Submit a product enquiry",
      "Show similar products",
    ],

    relatedProduct: {
      id: String(product._id),
      code: product.code,
      name: product.name,
    },
  });
};

const isProductComparisonQuestion = (
  customerQuestion,
) => {
  const message =
    normalizeText(customerQuestion);

  return Boolean(
    message.includes("compare") ||
    message.includes("comparison") ||
    message.includes("difference between") ||
    message.includes("which is better") ||
    message.includes("better one")
  );
};


const getRecentProductsFromContext = (
  conversationContext = [],
) => {
  if (!Array.isArray(conversationContext)) {
    return [];
  }

  for (
    let index =
      conversationContext.length - 1;
    index >= 0;
    index -= 1
  ) {
    const message =
      conversationContext[index];

    if (
      message?.sender === "bot" &&
      Array.isArray(message.products) &&
      message.products.length > 0
    ) {
      return message.products;
    }
  }

  return [];
};


const getOrdinalIndex = (word) => {
  const ordinalMap = {
    first: 0,
    "1st": 0,

    second: 1,
    "2nd": 1,

    third: 2,
    "3rd": 2,

    fourth: 3,
    "4th": 3,

    fifth: 4,
    "5th": 4,
  };

  return ordinalMap[word] ?? null;
};


const findComparisonIndexes = (
  customerQuestion,
) => {
  const message =
    normalizeText(customerQuestion);

  const ordinalPattern =
    /\b(first|1st|second|2nd|third|3rd|fourth|4th|fifth|5th)\b/g;

  const matches =
    message.match(ordinalPattern) || [];

  const indexes = matches
    .map(getOrdinalIndex)
    .filter(
      (index) =>
        Number.isInteger(index),
    );

  return [...new Set(indexes)];
};


const formatComparisonValue = (
  value,
  fallback = "Not specified",
) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return fallback;
  }

  return String(value);
};


const compareProducts = async ({
  customerQuestion,
  conversationContext = [],
}) => {
  const recentProducts =
    getRecentProductsFromContext(
      conversationContext,
    );

  if (recentProducts.length < 2) {
    return createChatbotResponse({
      reply:
        "Please ask me to show some jewellery first, then I can compare the products for you.",

      confidence: 0.8,

      intent:
        "product_comparison_missing_context",

      actions: [
        createExpertAction(
          customerQuestion,
        ),
      ],

      suggestions: [
        "Show me diamond rings",
        "Show me gold jewellery",
        "Show me necklaces",
      ],
    });
  }

  const requestedIndexes =
    findComparisonIndexes(
      customerQuestion,
    );

  let firstIndex = 0;
  let secondIndex = 1;

  if (
    requestedIndexes.length >= 2
  ) {
    [
      firstIndex,
      secondIndex,
    ] = requestedIndexes;
  } else if (
    requestedIndexes.length === 1
  ) {
    firstIndex =
      requestedIndexes[0];

    secondIndex =
      firstIndex === 0
        ? 1
        : 0;
  }

  const firstContextProduct =
    recentProducts[firstIndex];

  const secondContextProduct =
    recentProducts[secondIndex];

  if (
    !firstContextProduct ||
    !secondContextProduct
  ) {
    return createChatbotResponse({
      reply:
        "I could not find both of those products in the recent results. Please choose two products that were shown.",

      confidence: 0.6,

      intent:
        "product_comparison_invalid_reference",

      suggestions: [
        "Compare the first and second",
        "Compare the second and third",
      ],
    });
  }

  const productCodes = [
    firstContextProduct.code,
    secondContextProduct.code,
  ].filter(Boolean);

  let databaseProducts = [];

  if (productCodes.length > 0) {
    databaseProducts =
      await Product.find({
        code: {
          $in: productCodes,
        },
      }).lean();
  }

  const resolveFullProduct = (
    contextProduct,
  ) => {
    const databaseProduct =
      databaseProducts.find(
        (product) =>
          product.code ===
          contextProduct.code,
      );

    return (
      databaseProduct ||
      contextProduct
    );
  };

  const firstProduct =
    resolveFullProduct(
      firstContextProduct,
    );

  const secondProduct =
    resolveFullProduct(
      secondContextProduct,
    );

  const firstBranches =
    firstProduct.branchAvailability
      ? getAvailableBranches(
          firstProduct,
        )
      : firstProduct.availableBranches ||
        [];

  const secondBranches =
    secondProduct.branchAvailability
      ? getAvailableBranches(
          secondProduct,
        )
      : secondProduct.availableBranches ||
        [];

  const firstName =
    firstProduct.name ||
    firstProduct.code ||
    "Product 1";

  const secondName =
    secondProduct.name ||
    secondProduct.code ||
    "Product 2";

  return createChatbotResponse({
    reply:
      `Here is a comparison between ${firstName} and ${secondName}.`,

    confidence: 0.98,

    intent:
      "product_comparison",

    details: [
      createDetail(
        "Products",
        `${firstName} vs ${secondName}`,
      ),

      createDetail(
        "Price",
        `${formatComparisonValue(
          firstProduct.price,
        )} vs ${formatComparisonValue(
          secondProduct.price,
        )}`,
      ),

      createDetail(
        "Weight",
        `${formatComparisonValue(
          firstProduct.weight,
        )} vs ${formatComparisonValue(
          secondProduct.weight,
        )}`,
      ),

      createDetail(
        "Purity",
        `${formatComparisonValue(
          firstProduct.purity,
        )} vs ${formatComparisonValue(
          secondProduct.purity,
        )}`,
      ),

      createDetail(
        "Collection",
        `${formatComparisonValue(
          firstProduct.collection,
        )} vs ${formatComparisonValue(
          secondProduct.collection,
        )}`,
      ),

      createDetail(
        "Available Branches",
        `${firstBranches.length
          ? firstBranches.join(", ")
          : "None"} vs ${
          secondBranches.length
            ? secondBranches.join(", ")
            : "None"
        }`,
      ),
    ],

    products: [
      formatProductForChat(
        firstProduct,
      ),

      formatProductForChat(
        secondProduct,
      ),
    ],

    actions: [
      createExpertAction(
        customerQuestion,
      ),
    ],

    suggestions: [
      "Tell me more about the first one",
      "Tell me more about the second one",
      "Which one is available in Bengaluru?",
    ],
  });
};

const canHandleProductIntent = (
  customerQuestion
) => {
  const message =
    normalizeText(customerQuestion);

  return Boolean(
    findProductCode(message) ||
      findCategory(message) ||
      findProductType(message) ||
      message.includes("jewellery") ||
      message.includes("jewelry") ||
      message.includes("bridal") ||
      message.includes("collection") ||
      message.includes("product") ||
      message.includes("design")
  );
};

const handleProductIntent = async (
  customerQuestion,
  conversationContext = [],
) => {
  const message =
    normalizeText(customerQuestion);

    if (
  isProductComparisonQuestion(
    customerQuestion,
  )
) {
  return compareProducts({
    customerQuestion,
    conversationContext,
  });
}

  const productCode =
    findProductCode(message);

  const asksAvailability =
    message.includes("available") ||
    message.includes("availability") ||
    message.includes("stock") ||
    message.includes("which branch");

  if (productCode && asksAvailability) {
    return getProductAvailabilityResponse(
      customerQuestion
    );
  }

  if (productCode) {
    return getProductByCode(
      productCode,
      customerQuestion
    );
  }

  return searchProducts(customerQuestion);
};

export {
  canHandleProductIntent,
  compareProducts,
  formatProductForChat,
  getAvailableBranches,
  getUnavailableBranches,
  handleProductIntent,
  isProductComparisonQuestion,
};