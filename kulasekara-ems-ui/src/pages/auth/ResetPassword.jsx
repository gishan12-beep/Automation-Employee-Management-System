import React, { useMemo, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { resetPasswordApi } from "../../services/authService";

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  const token = useMemo(() => {
    const sp = new URLSearchParams(location.search);
    return sp.get("token") || "";
  }, [location.search]);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  const validateStrongPassword = (p) => {
    if (p.length < 8) return "Password must be at least 8 characters.";
    if (p.length > 64) return "Password must be less than 65 characters.";
    if (/\s/.test(p)) return "Password must not contain spaces.";
    if (!/[a-z]/.test(p)) return "Include at least 1 lowercase letter.";
    if (!/[A-Z]/.test(p)) return "Include at least 1 uppercase letter.";
    if (!/[0-9]/.test(p)) return "Include at least 1 number.";
    if (!/[!@#$%^&*()_\-+=\[\]{};:'\",.<>/?\\|`~]/.test(p)) return "Include at least 1 special character.";
    return "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });

    if (!token) {
      return setMsg({ type: "error", text: "Missing token. Please request a new reset link." });
    }

    const pwErr = validateStrongPassword(newPassword);
    if (pwErr) return setMsg({ type: "error", text: pwErr });

    if (newPassword !== confirmPassword) {
      return setMsg({ type: "error", text: "Passwords do not match." });
    }

    try {
      setLoading(true);
      const res = await resetPasswordApi(token, newPassword);
      setMsg({ type: "ok", text: res?.message || "Password updated successfully." });

      setTimeout(() => navigate("/"), 1200);
    } catch (err) {
      setMsg({
        type: "error",
        text: err?.response?.data?.message || err.message || "Reset failed.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Reset Password</h2>
        <p style={styles.sub}>Enter a new strong password.</p>

        {msg.text ? (
          <div style={{ ...styles.msg, ...(msg.type === "ok" ? styles.ok : styles.bad) }}>
            {msg.text}
          </div>
        ) : null}

        <form onSubmit={onSubmit}>
          <label style={styles.label}>New Password</label>
          <input
            type="password"
            style={styles.input}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Eg: Hello@123"
          />

          <label style={styles.label}>Confirm Password</label>
          <input
            type="password"
            style={styles.input}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter password"
          />

          <div style={styles.rules}>
            <div>✅ 8–64 characters</div>
            <div>✅ 1 uppercase + 1 lowercase</div>
            <div>✅ 1 number + 1 special character</div>
            <div>✅ No spaces</div>
          </div>

          <button style={styles.btn} disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>

        <div style={{ marginTop: 12, fontSize: 14 }}>
          <Link to="/" style={styles.link}>Back to Login</Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#f6f7fb", padding: 16 },
  card: { width: "100%", maxWidth: 440, background: "#fff", borderRadius: 14, padding: 18, boxShadow: "0 10px 30px rgba(0,0,0,0.08)" },
  title: { margin: 0, fontSize: 22 },
  sub: { marginTop: 6, marginBottom: 14, color: "#666", fontSize: 14 },
  label: { display: "block", marginBottom: 6, fontSize: 13, color: "#333" },
  input: { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd", outline: "none", marginBottom: 12 },
  btn: { width: "100%", padding: "10px 12px", borderRadius: 10, border: "none", background: "#0ea5e9", color: "#fff", cursor: "pointer", fontWeight: 600 },
  link: { color: "#0ea5e9", textDecoration: "none" },
  msg: { padding: "10px 12px", borderRadius: 10, marginBottom: 12, fontSize: 14 },
  ok: { background: "#ecfeff", color: "#155e75", border: "1px solid #a5f3fc" },
  bad: { background: "#fff1f2", color: "#9f1239", border: "1px solid #fecdd3" },
  rules: { fontSize: 13, color: "#555", background: "#f8fafc", border: "1px solid #e2e8f0", padding: 10, borderRadius: 10, marginBottom: 12 },
};
