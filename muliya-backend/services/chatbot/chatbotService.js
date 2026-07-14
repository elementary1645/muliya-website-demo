import {
  routeChatbotIntent,
} from "./intentRouter.js";

const normalizeConversationContext = (
  conversationContext = []
) => {
  if (!Array.isArray(conversationContext)) {
    return [];
  }

  return conversationContext
    .filter(
      (message) =>
        message &&
        ["customer", "bot"].includes(
          message.sender
        ) &&
        typeof message.text === "string" &&
        message.text.trim()
    )
    .slice(-10)
    .map((message) => ({
      sender: message.sender,
      text: message.text.trim(),
    }));
};

const generateChatbotResponse = async ({
  customerQuestion,
  conversationContext = [],
}) => {
  const normalizedQuestion = String(
    customerQuestion || ""
  ).trim();

  const normalizedContext =
    normalizeConversationContext(
      conversationContext
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
        response.details
      )
        ? response.details
        : [],

      products: Array.isArray(
        response.products
      )
        ? response.products
        : [],

      actions: Array.isArray(
        response.actions
      )
        ? response.actions
        : [],

      suggestions: Array.isArray(
        response.suggestions
      )
        ? response.suggestions
        : [],

      needsExpert:
        Boolean(response.needsExpert),

      relatedProduct:
        response.relatedProduct || null,
    };
  } catch (error) {
    console.error(
      "Modular chatbot service error:",
      error
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