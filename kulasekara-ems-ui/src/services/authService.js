import api from "./api";

/**
 * AUTH (existing)
 */
export async function login(emailOrUsername, password) {
  const res = await api.post("/auth/login", { emailOrUsername, password });

  const { token, user } = res.data;

  localStorage.setItem("token", token);
  localStorage.setItem("role", user.role);
  localStorage.setItem("user_id", user.user_id);
  localStorage.setItem("employee_id", user.employee_id || "");

  return res.data;
}

export async function getCurrentUser() {
  const res = await api.get("/auth/me");
  return res.data; // { user: { ... } }
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("user_id");
  localStorage.removeItem("employee_id");
}

export function getAuth() {
  return {
    token: localStorage.getItem("token"),
    role: (localStorage.getItem("role") || "").toUpperCase(),
    user_id: localStorage.getItem("user_id"),
    employee_id: localStorage.getItem("employee_id"),
  };
}

export function routeByRole(role) {
  const r = (role || "").toUpperCase();
  if (r === "MANAGER") return "/manager/dashboard";
  if (r === "ACCOUNTANT") return "/accountant/dashboard";
  if (r === "EMPLOYEE") return "/employee/dashboard";
  return "/";
}

/**
 * FORGOT / RESET PASSWORD (DEV MODE friendly)
 * Uses the same axios instance `api` so baseURL + interceptors work consistently.
 *
 * Backend endpoints:
 *  POST /api/auth/forgot-password
 *  POST /api/auth/reset-password
 */

// ✅ Request reset link (DEV MODE backend can return resetLink)
export async function requestPasswordResetApi(email) {
  const res = await api.post("/auth/forgot-password", { email });
  return res.data; // { message, resetLink? }
}

// ✅ Reset password using token
export async function resetPasswordApi(token, newPassword) {
  const res = await api.post("/auth/reset-password", { token, newPassword });
  return res.data; // { message }
}
