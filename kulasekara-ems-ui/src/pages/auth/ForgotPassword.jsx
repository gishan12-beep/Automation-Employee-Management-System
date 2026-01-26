import React, { useState } from "react";
import { Link } from "react-router-dom";
import { requestPasswordResetApi } from "../../services/authService";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e || "").trim());

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setStatus("");

    if (!email.trim()) return setError("Email is required.");
    if (!isValidEmail(email)) return setError("Enter a valid email address.");

    try {
      setLoading(true);
      const res = await requestPasswordResetApi(email.trim());
      setStatus(res?.message || "If this email exists, a reset link has been sent.");
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Request failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Forgot Password</h2>
        <p style={styles.sub}>Enter your email to receive a reset link.</p>

        {status ? <div style={{ ...styles.msg, ...styles.ok }}>{status}</div> : null}
        {error ? <div style={{ ...styles.msg, ...styles.bad }}>{error}</div> : null}

        <form onSubmit={onSubmit}>
          <label style={styles.label}>Email</label>
          <input
            style={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
          />

          <button style={styles.btn} disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
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
  card: { width: "100%", maxWidth: 420, background: "#fff", borderRadius: 14, padding: 18, boxShadow: "0 10px 30px rgba(0,0,0,0.08)" },
  title: { margin: 0, fontSize: 22 },
  sub: { marginTop: 6, marginBottom: 14, color: "#666", fontSize: 14 },
  label: { display: "block", marginBottom: 6, fontSize: 13, color: "#333" },
  input: { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd", outline: "none", marginBottom: 12 },
  btn: { width: "100%", padding: "10px 12px", borderRadius: 10, border: "none", background: "#0ea5e9", color: "#fff", cursor: "pointer", fontWeight: 600 },
  link: { color: "#0ea5e9", textDecoration: "none" },
  msg: { padding: "10px 12px", borderRadius: 10, marginBottom: 12, fontSize: 14 },
  ok: { background: "#ecfeff", color: "#155e75", border: "1px solid #a5f3fc" },
  bad: { background: "#fff1f2", color: "#9f1239", border: "1px solid #fecdd3" },
};
