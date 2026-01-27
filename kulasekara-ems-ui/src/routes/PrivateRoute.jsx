import React from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function PrivateRoute({ allowedRoles = [], children }) {
  const location = useLocation();

  const token = localStorage.getItem("token");
  const role = (localStorage.getItem("role") || "").toUpperCase();
  const mustChange = localStorage.getItem("must_change_password") === "1";

  const isChangePasswordRoute = location.pathname.startsWith("/employee/change-password");

  // ❌ Not logged in
  if (!token) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  // ❌ Role not allowed
  if (allowedRoles.length && !allowedRoles.map(r => r.toUpperCase()).includes(role)) {
    return <Navigate to="/" replace />;
  }

  // 🔒 Employee MUST change password
  if (role === "EMPLOYEE" && mustChange && !isChangePasswordRoute) {
    return <Navigate to="/employee/change-password" replace />;
  }

  // ✅ Password already changed → block access to change-password page
  if (role === "EMPLOYEE" && !mustChange && isChangePasswordRoute) {
    return <Navigate to="/employee/dashboard" replace />;
  }

  return children;
}
