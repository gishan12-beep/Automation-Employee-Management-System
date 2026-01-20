import React from "react";
import { Navigate } from "react-router-dom";

export default function PrivateRoute({ allowedRoles, children }) {
  const token = localStorage.getItem("token");
  const role = (localStorage.getItem("role") || "").toUpperCase();

  if (!token) return <Navigate to="/" replace />;

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
