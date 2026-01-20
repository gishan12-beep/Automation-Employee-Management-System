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
