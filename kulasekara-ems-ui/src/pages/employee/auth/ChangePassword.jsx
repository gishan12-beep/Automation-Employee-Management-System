import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { changePasswordFirstLoginApi } from "../../../services/authService";

export default function ChangePassword() {
  const navigate = useNavigate();

  // ✅ read from localStorage (matches your Login.jsx & PrivateRoute approach)
  const token = localStorage.getItem("token") || "";
  const username =
    localStorage.getItem("role") === "EMPLOYEE"
      ? localStorage.getItem("employee_id") || "Employee"
      : "Employee";

  // ❌ removed currentPassword
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");

    if (!token) {
      setErr("Session expired. Please login again.");
      return;
    }
    if (!newPassword || !confirm) {
      setErr("Please fill all fields.");
      return;
    }
    if (newPassword.length < 8) {
      setErr("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirm) {
      setErr("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      // ✅ First-login change password (no current password needed)
      await changePasswordFirstLoginApi(token, newPassword);

      // ✅ unlock employee routes (AppRoutes reads this)
      localStorage.setItem("must_change_password", "0");

      setMsg("Password updated successfully. Redirecting...");
      setTimeout(() => navigate("/employee/dashboard", { replace: true }), 600);
    } catch (e2) {
      setErr(e2?.message || "Change password failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user_id");
    localStorage.removeItem("employee_id");
    localStorage.removeItem("must_change_password");
    navigate("/", { replace: true });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f6f7fb",
        padding: 16,
      }}
    >
      <div
        style={{
          width: 420,
          background: "#fff",
          borderRadius: 12,
          padding: 20,
          boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
        }}
      >
        <h2 style={{ margin: 0 }}>Set New Password</h2>
        <p style={{ marginTop: 6, color: "#555", fontSize: 14 }}>
          Hi {username}, please set a new password to continue.
        </p>

        {err ? (
          <div
            style={{
              background: "#ffe5e5",
              color: "#a40000",
              padding: 10,
              borderRadius: 8,
              marginBottom: 10,
            }}
          >
            {err}
          </div>
        ) : null}

        {msg ? (
          <div
            style={{
              background: "#e9fff0",
              color: "#0a7a2f",
              padding: 10,
              borderRadius: 8,
              marginBottom: 10,
            }}
          >
            {msg}
          </div>
        ) : null}

        <form onSubmit={onSubmit}>
          <label style={{ fontSize: 13, fontWeight: 700 }}>New Password</label>
          <input
            type={show ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={{
              width: "100%",
              padding: 10,
              marginTop: 6,
              marginBottom: 12,
              borderRadius: 8,
              border: "1px solid #ddd",
            }}
            autoComplete="new-password"
          />

          <label style={{ fontSize: 13, fontWeight: 700 }}>
            Confirm New Password
          </label>
          <input
            type={show ? "text" : "password"}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            style={{
              width: "100%",
              padding: 10,
              marginTop: 6,
              marginBottom: 10,
              borderRadius: 8,
              border: "1px solid #ddd",
            }}
            autoComplete="new-password"
          />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 14,
            }}
          >
            <input
              id="showPw"
              type="checkbox"
              checked={show}
              onChange={(e) => setShow(e.target.checked)}
            />
            <label htmlFor="showPw" style={{ fontSize: 13, color: "#333" }}>
              Show passwords
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: 11,
              borderRadius: 10,
              border: "none",
              background: "#2563eb",
              color: "#fff",
              fontWeight: 800,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Updating..." : "Update Password"}
          </button>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              width: "100%",
              padding: 11,
              borderRadius: 10,
              border: "1px solid #ddd",
              background: "#fff",
              fontWeight: 800,
              marginTop: 10,
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </form>
      </div>
    </div>
  );
}
