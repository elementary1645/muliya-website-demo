import {
  routeChatbotIntent,
} from "./intentRouter.js";


const normalizeProductContext = (product) => {
  if (!product || typeof product !== "object") {
    return null;
  }

  const normalizedProduct = {
    id: String(
      product.id ||
        product._id ||
        "",
    ).trim(),

    code: String(
      product.code || "",
    ).trim(),

    name: String(
      product.name || "",
    ).trim(),

    category: String(
      product.category || "",
    ).trim(),

    type: String(
      product.type || "",
    ).trim(),

    collection: String(
      product.collection || "",
    ).trim(),

    price: String(
      product.price || "",
    ).trim(),

    purity: String(
      product.purity || "",
    ).trim(),

    weight: String(
      product.weight || "",
    ).trim(),

    availability: String(
      product.availability || "",
    ).trim(),

    availableBranches: Array.isArray(
      product.availableBranches,
    )
      ? product.availableBranches
          .map((branch) =>
            String(branch || "").trim(),
          )
          .filter(Boolean)
      : [],

    unavailableBranches: Array.isArray(
      product.unavailableBranches,
    )
      ? product.unavailableBranches
          .map((branch) =>
            String(branch || "").trim(),
          )
          .filter(Boolean)
      : [],
  };

  if (
    !normalizedProduct.id &&
    !normalizedProduct.code &&
    !normalizedProduct.name
  ) {
    return null;
  }

  return normalizedProduct;
};


const normalizeRelatedProduct = (
  relatedProduct,
) => {
  if (
    !relatedProduct ||
    typeof relatedProduct !== "object"
  ) {
    return null;
  }

  const normalizedProduct = {
    id: String(
      relatedProduct.id ||
        relatedProduct._id ||
        "",
    ).trim(),

    code: String(
      relatedProduct.code || "",
    ).trim(),

    name: String(
      relatedProduct.name || "",
    ).trim(),
  };

  if (
    !normalizedProduct.id &&
    !normalizedProduct.code &&
    !normalizedProduct.name
  ) {
    return null;
  }

  return normalizedProduct;
};


const normalizeConversationContext = (
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
    .slice(-10)
    .map((message) => ({
      sender: message.sender,

      text: message.text.trim(),

      intent:
        typeof message.intent === "string"
          ? message.intent.trim()
          : "",

      products: Array.isArray(
        message.products,
      )
        ? message.products
            .map(normalizeProductContext)
            .filter(Boolean)
            .slice(0, 5)
        : [],

      relatedProduct:
        normalizeRelatedProduct(
          message.relatedProduct,
        ),
    }));
};


const generateChatbotResponse = async ({
  customerQuestion,
  conversationContext = [],
}) => {
  const normalizedQuestion = String(
    customerQuestion || "",
  ).trim();

  const normalizedContext =
    normalizeConversationContext(
      conversationContext,
    );

  try {
    const response =
      await routeChatbotIntent({
        customerQuestion:
          normalizedQuestion,

        conversationContext:
          normalizedContext,
      });

    return {
      reply:
        response.reply ||
        "I could not generate a response.",

      confidence:
        typeof response.confidence ===
        "number"
          ? response.confidence
          : 0,

      intent:
        response.intent || "unknown",

      details: Array.isArray(
        response.details,
      )
        ? response.details
        : [],

      products: Array.isArray(
        response.products,
      )
        ? response.products
        : [],

      actions: Array.isArray(
        response.actions,
      )
        ? response.actions
        : [],

      suggestions: Array.isArray(
        response.suggestions,
      )
        ? response.suggestions
        : [],

      needsExpert: Boolean(
        response.needsExpert,
      ),

      relatedProduct:
        response.relatedProduct || null,
    };
  } catch (error) {
    console.error(
      "Modular chatbot service error:",
      error,
    );

    return {
      reply:
        "The customer assistant is temporarily unavailable. You can try again or connect with a jewellery expert.",

      confidence: 0,

      intent: "system_error",

      details: [],

      products: [],

      actions: [
        {
          type: "expert",

          label:
            "Connect with a Jewellery Expert",

          url: "",

          data: {
            question:
              normalizedQuestion,

            productId: null,
          },
        },
      ],

      suggestions: [
        "Try again",
        "Connect me with an expert",
      ],

      needsExpert: true,

      relatedProduct: null,
    };
  }
};


export {
  generateChatbotResponse,
};