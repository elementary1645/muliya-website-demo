const API_BASE_URL = "http://localhost:5000/api";

export const createExpertRequest = async (requestData) => {
  const response = await fetch(
    `${API_BASE_URL}/expert-requests`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(requestData),
    }
  );

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(
      data.message ||
        "Unable to connect with a jewellery expert."
    );
  }

  return data;
};