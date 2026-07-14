const API_BASE_URL = "http://localhost:5000/api";

export const getInstagramPosts = async () => {
  const response = await fetch(
    `${API_BASE_URL}/instagram/posts`
  );

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(
      data.message || "Unable to retrieve Instagram posts."
    );
  }

  return data;
};