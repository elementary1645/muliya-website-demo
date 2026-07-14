import {
  generateChatbotResponse,
} from "../services/chatbot/chatbotService.js";

const sendChatMessage = async (req, res) => {
  try {
    const {
      message,
      conversationContext = [],
    } = req.body;

    if (
      !message ||
      typeof message !== "string" ||
      !message.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide a valid customer message.",
      });
    }

    if (message.length > 1000) {
      return res.status(400).json({
        success: false,
        message:
          "Message is too long. Maximum length is 1000 characters.",
      });
    }

    if (
      conversationContext &&
      !Array.isArray(conversationContext)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Conversation context must be an array.",
      });
    }

    const chatbotResponse =
      await generateChatbotResponse({
        customerQuestion: message.trim(),
        conversationContext,
      });

    return res.status(200).json({
      success: true,

      reply: chatbotResponse.reply,

      confidence:
        chatbotResponse.confidence,

      intent:
        chatbotResponse.intent,

      details:
        chatbotResponse.details,

      products:
        chatbotResponse.products,

      actions:
        chatbotResponse.actions,

      suggestions:
        chatbotResponse.suggestions,

      needsExpert:
        chatbotResponse.needsExpert,

      relatedProduct:
        chatbotResponse.relatedProduct,
    });
  } catch (error) {
    console.error(
      "Chatbot controller error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "The customer assistant is temporarily unavailable. Please try again.",

      reply:
        "I’m unable to answer right now. You can try again or connect with a jewellery expert.",

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
              typeof req.body?.message === "string"
                ? req.body.message
                : "",
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
    });
  }
};

export {
  sendChatMessage,
};