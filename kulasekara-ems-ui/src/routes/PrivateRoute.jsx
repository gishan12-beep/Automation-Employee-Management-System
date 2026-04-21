import React from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function PrivateRoute({ allowedRoles = [], children }) {
  const location = useLocation();

  const token = localStorage.getItem("token");
  const role = (localStorage.getItem("role") || "").toUpperCase();
  const mustChange = localStorage.getItem("must_change_password") === "1";

  const isChangePasswordRoute = location.pathname.startsWith("/employee/change-password");

  // ❌ If you aren't logged in, send you back to the login page.
  if (!token) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  // ❌ If your job role isn't allowed to see this page, show an "Access Denied" message.
  if (allowedRoles.length && !allowedRoles.map(r => r.toUpperCase()).includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 🔒 If you are an employee and haven't set your own password yet, force you to do that now.
  if (role === "EMPLOYEE" && mustChange && !isChangePasswordRoute) {
    return <Navigate to="/employee/change-password" replace />;
  }

  // ✅ Once you have set your password, you no longer need to see the "Change Password" screen.
  if (role === "EMPLOYEE" && !mustChange && isChangePasswordRoute) {
    return <Navigate to="/employee/dashboard" replace />;
  }

  return children;
}
