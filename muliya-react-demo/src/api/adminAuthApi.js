const API_BASE_URL = "http://localhost:5000/api/admin/auth";

const request = async (
  endpoint,
  options = {}
) => {
  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      credentials: "include",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    }
  );

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(
      data.message ||
        "Unable to complete the admin request."
    );
  }

  return data;
};

export const loginAdmin = async ({
  email,
  password,
}) => {
  return request("/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });
};

export const logoutAdmin = async () => {
  return request("/logout", {
    method: "POST",
  });
};

export const getCurrentAdmin = async () => {
  return request("/me", {
    method: "GET",
  });
};

export const createAdmin = async (
  adminData
) => {
  return request("/create-admin", {
    method: "POST",
    body: JSON.stringify(adminData),
  });
};
