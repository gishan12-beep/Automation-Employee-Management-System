import api from "./api";

export async function login(emailOrUsername, password) {
  const res = await api.post("/auth/login", { emailOrUsername, password });

  // optional: auto-save here (so Login.jsx becomes cleaner)
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


// src/services/authService.js

const API_BASE = import.meta?.env?.VITE_API_BASE_URL || "http://localhost:5000";

// ✅ Request password reset email/link
export async function requestPasswordResetApi(email) {
  const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || "Failed to request password reset.");
  return data;
}

// ✅ Reset password using token
export async function resetPasswordApi(token, newPassword) {
  const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, newPassword }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || "Failed to reset password.");
  return data;
}
