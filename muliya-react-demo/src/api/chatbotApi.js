const API_BASE_URL = "http://localhost:5000/api";

export const sendChatMessage = async (
  message,
  conversationContext = []
) => {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      message,
      conversationContext,
    }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(
      data.message || "Unable to send chatbot message."
    );
  }

  return data;
};