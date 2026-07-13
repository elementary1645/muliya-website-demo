const API_BASE_URL = "http://localhost:5000/api";

export const getProducts = async () => {
  const response = await fetch(`${API_BASE_URL}/products`);

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(
      data.message || "Unable to retrieve products."
    );
  }

  return data.products;
};

export const getProductById = async (productId) => {
  const response = await fetch(
    `${API_BASE_URL}/products/${productId}`
  );

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(
      data.message || "Unable to retrieve product."
    );
  }

  return data.product;
};