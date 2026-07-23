import { API_BASE_URL } from "./apiConfig";

async function request(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  } catch (networkError) {
    console.error("Product API network error:", networkError);

    throw new Error(
      "Unable to connect to the product service.",
    );
  }

  const data = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.error ||
        `Request failed with status ${response.status}`,
    );
  }

  if (data?.success === false) {
    throw new Error(
      data?.message ||
        "Unable to complete the product request.",
    );
  }

  return data;
}

function buildQueryString(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      query.set(key, String(value));
    }
  });

  return query.toString();
}

/*
 * Use this on pages that only need the product array.
 * Existing pages can continue calling getProducts().
 */
export async function getProducts(params = {}) {
  const queryString = buildQueryString(params);

  const data = await request(
    `/products${queryString ? `?${queryString}` : ""}`,
  );

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.products)) {
    return data.products;
  }

  return [];
}

export async function getProductSuggestions(
  searchText,
  limit = 6,
) {
  const query = String(searchText || "").trim();

  if (query.length < 2) {
    return [];
  }

  const data = await request(
    `/products/suggestions?q=${encodeURIComponent(
      query,
    )}&limit=${limit}`,
  );

  return Array.isArray(data?.suggestions)
    ? data.suggestions
    : [];
}

/*
 * Use this on SearchResults.jsx and other paginated pages.
 * It preserves total, page, totalPages and filter metadata.
 */
export async function searchProducts(params = {}) {
  const queryString = buildQueryString(params);

  const data = await request(
    `/products${queryString ? `?${queryString}` : ""}`,
  );

  return {
    success: data?.success !== false,
    products: Array.isArray(data?.products)
      ? data.products
      : [],
    count: Number(data?.count) || 0,
    total: Number(data?.total) || 0,
    page: Number(data?.page) || 1,
    limit: Number(data?.limit) || 0,
    totalPages: Number(data?.totalPages) || 0,
    hasNextPage: Boolean(data?.hasNextPage),
    hasPreviousPage: Boolean(
      data?.hasPreviousPage,
    ),
    filters: data?.filters || {},
  };
}

export async function getProductById(productId) {
  if (!productId) {
    throw new Error("Product ID is required.");
  }

  const data = await request(
    `/products/${encodeURIComponent(productId)}`,
  );

  return data?.product ?? data;
}

export async function createProduct(product, token) {
  const data = await request("/products", {
    method: "POST",
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {},
    body: JSON.stringify(product),
  });

  return data?.product ?? data;
}

export async function updateProduct(
  productId,
  product,
  token,
) {
  if (!productId) {
    throw new Error("Product ID is required.");
  }

  const data = await request(
    `/products/${encodeURIComponent(productId)}`,
    {
      method: "PUT",
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
      body: JSON.stringify(product),
    },
  );

  return data?.product ?? data;
}

export async function deleteProduct(
  productId,
  token,
) {
  if (!productId) {
    throw new Error("Product ID is required.");
  }

  return request(
    `/products/${encodeURIComponent(productId)}`,
    {
      method: "DELETE",
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
    },
  );
}