// src/services/authService.js

// ✅ Base API URL (supports both CRA and Vite)
const API_BASE =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_URL) ||
  process.env.REACT_APP_API_URL ||
  "http://localhost:5000/api";

/** ---------------------------
 * Helpers
 * --------------------------*/
export const getAuth = () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const user_id = localStorage.getItem("user_id");
  const employee_id = localStorage.getItem("employee_id");
  const must_change_password = localStorage.getItem("must_change_password");
  return { token, role, user_id, employee_id, must_change_password };
};

export const getCurrentUser = () => {
  return {
    user_id: localStorage.getItem("user_id"),
    employee_id: localStorage.getItem("employee_id"),
    role: localStorage.getItem("role"),
  };
};

export const routeByRole = (role) => {
  const r = (role || "").toUpperCase();
  if (r === "MANAGER") return "/manager/dashboard";
  if (r === "ACCOUNTANT") return "/accountant/dashboard";
  if (r === "EMPLOYEE") return "/employee/dashboard";
  return "/";
};

/** ---------------------------
 * Auth APIs
 * --------------------------*/
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

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("user_id");
  localStorage.removeItem("employee_id");
  localStorage.removeItem("must_change_password");
};

/**
 * ✅ First-login password change (NO currentPassword)
 * Backend endpoint: POST /api/auth/change-password-first-login
 */
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

/**
 * ✅ Normal change password (requires current password)
 * Backend endpoint: POST /api/auth/change-password
 * (Keep this for “Change password” feature later)
 */
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

/** ---------------------------
 * Forgot/Reset password (existing)
 * --------------------------*/
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
