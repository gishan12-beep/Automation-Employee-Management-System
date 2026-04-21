// src/services/authService.js

// Determines the base API URL by checking environment variables or defaulting to localhost
const API_BASE =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_URL) ||
  process.env.REACT_APP_API_URL ||
  "http://localhost:5000/api";

// Retrieves all stored authentication data (token, role, IDs, flags) from LocalStorage
export const getAuth = () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const user_id = localStorage.getItem("user_id");
  const employee_id = localStorage.getItem("employee_id");
  const must_change_password = localStorage.getItem("must_change_password");
  return { token, role, user_id, employee_id, must_change_password };
};

// Returns a subset of auth data specifically for the current user's identity and role
export const getCurrentUser = () => {
  return {
    user_id: localStorage.getItem("user_id"),
    employee_id: localStorage.getItem("employee_id"),
    role: localStorage.getItem("role"),
  };
};

// Maps a user's role to their specific dashboard landing page route
export const routeByRole = (role) => {
  const r = (role || "").toUpperCase();
  if (r === "MANAGER") return "/manager/dashboard";
  if (r === "ACCOUNTANT") return "/accountant/dashboard";
  if (r === "EMPLOYEE") return "/employee/dashboard";
  return "/";
};

// Performs a login request to the backend with email/username and password
export const login = async (emailOrUsername, password) => {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ emailOrUsername, password }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Login failed");
  return data; // { token, user }
};

// Clears all authentication-related items from LocalStorage to log the user out
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("user_id");
  localStorage.removeItem("employee_id");
  localStorage.removeItem("must_change_password");
};

// Handles the mandatory first-time password update for new accounts using only the new password
export const changePasswordFirstLoginApi = async (token, newPassword) => {
  const res = await fetch(`${API_BASE}/auth/change-password-first-login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ newPassword }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to change password");
  return data;
};

// Handles a standard password change that requires verifying the user's current password
export const changePasswordApi = async (token, currentPassword, newPassword) => {
  const res = await fetch(`${API_BASE}/auth/change-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to change password");
  return data;
};

// Sends a request to start the password recovery process via email
export const requestPasswordResetApi = async (email) => {
  const res = await fetch(`${API_BASE}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request reset failed");
  return data;
};

// Completes the password reset process using a reset token and a new password
export const resetPasswordApi = async (token, newPassword) => {
  const res = await fetch(`${API_BASE}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, newPassword }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Reset password failed");
  return data;
};
