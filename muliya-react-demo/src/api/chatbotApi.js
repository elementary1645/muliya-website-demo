import { API_BASE_URL } from "./apiConfig";

export async function sendChatMessage(
  message,
  conversationContext = [],
) {
  const cleanedMessage = String(message || "").trim();

  if (!cleanedMessage) {
    throw new Error("Please enter a message.");
  }

  let response;

  try {
    response = await fetch(`${API_BASE_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        message: cleanedMessage,
        conversationContext: Array.isArray(
          conversationContext,
        )
          ? conversationContext
          : [],
      }),
    });
  } catch (networkError) {
    console.error(
      "Chatbot network error:",
      networkError,
    );

    throw new Error(
      "Unable to connect to the Muliya customer assistant.",
    );
  }

  const data = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.error ||
        `Chatbot request failed with status ${response.status}.`,
    );
  }

  if (data?.success === false) {
    throw new Error(
      data?.message ||
        "Unable to send the chatbot message.",
    );
  }

  return {
    success: true,
    reply:
      data?.reply ||
      "I’m sorry, I could not generate a response.",
    confidence:
      Number(data?.confidence) || 0,
    intent:
      data?.intent || "unknown",
    details: Array.isArray(data?.details)
      ? data.details
      : [],
    products: Array.isArray(data?.products)
      ? data.products
      : [],
    actions: Array.isArray(data?.actions)
      ? data.actions
      : [],
    suggestions: Array.isArray(
      data?.suggestions,
    )
      ? data.suggestions
      : [],
    needsExpert: Boolean(
      data?.needsExpert,
    ),
    relatedProduct:
      data?.relatedProduct || null,
  };
}