const API_BASE_URL = "http://localhost:5000/api";

export const createEnquiry = async (enquiryData) => {
  const response = await fetch(`${API_BASE_URL}/enquiries`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(enquiryData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Unable to submit enquiry."
    );
  }

  return data;
};