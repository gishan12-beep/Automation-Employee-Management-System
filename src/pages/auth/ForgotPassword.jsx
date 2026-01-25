// src/pages/auth/ForgotPassword.jsx
import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { requestPasswordResetApi, resetPasswordApi } from "../../services/authService";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function ForgotPassword() {
  const navigate = useNavigate();
  const query = useQuery();
  const tokenFromUrl = query.get("token"); // if present => show reset form

  const [email, setEmail] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  const [loading, setLoading] = useState(false);
  const [okMsg, setOkMsg] = useState("");
  const [errMsg, setErrMsg] = useState("");

  // Small cooldown for "Resend"
  const [cooldown, setCooldown] = useState(0);

  const wrap = {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #f7fafc, #eef2ff)",
    padding: "24px",
    fontFamily: "Segoe UI, Arial, sans-serif",
  };

  const card = {
    width: "100%",
    maxWidth: "460px",
    background: "#fff",
    borderRadius: "16px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
    padding: "22px",
    border: "1px solid #eef2f7",
  };

  const title = {
    margin: 0,
    fontSize: "22px",
    fontWeight: 800,
    color: "#0f172a",
  };

  const sub = {
    marginTop: "8px",
    marginBottom: "16px",
    color: "#475569",
    fontSize: "13.5px",
    lineHeight: 1.5,
  };

  const label = { fontSize: "13px", fontWeight: 700, color: "#0f172a", marginBottom: "6px" };

  const input = {
    width: "100%",
    padding: "12px 12px",
    borderRadius: "10px",
    border: "1px solid #dbe4ee",
    outline: "none",
    fontSize: "14px",
    background: "#fff",
  };

  const btn = (disabled) => ({
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    background: disabled ? "#94a3b8" : "#2563eb",
    color: "#fff",
    fontWeight: 800,
    fontSize: "14px",
    marginTop: "12px",
  });

  const ghostBtn = (disabled) => ({
    width: "100%",
    padding: "10px",
    borderRadius: "10px",
    border: "1px solid #dbe4ee",
    cursor: disabled ? "not-allowed" : "pointer",
    background: disabled ? "#f1f5f9" : "#fff",
    color: "#0f172a",
    fontWeight: 700,
    fontSize: "13.5px",
    marginTop: "10px",
  });

  const msgOk = {
    background: "#ecfdf5",
    border: "1px solid #a7f3d0",
    color: "#065f46",
    borderRadius: "10px",
    padding: "10px 12px",
    fontSize: "13px",
    marginTop: "12px",
    lineHeight: 1.45,
  };

  const msgErr = {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#991b1b",
    borderRadius: "10px",
    padding: "10px 12px",
    fontSize: "13px",
    marginTop: "12px",
    lineHeight: 1.45,
  };

  const row = { display: "flex", gap: "10px" };
  const col = { flex: 1 };

  function startCooldown(seconds = 20) {
    setCooldown(seconds);
    const t = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          clearInterval(t);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  }

  const clearMsgs = () => {
    setOkMsg("");
    setErrMsg("");
  };

  const handleRequest = async (e) => {
    e.preventDefault();
    clearMsgs();

    const cleanEmail = (email || "").trim();
    if (!cleanEmail) {
      setErrMsg("Please enter your email address.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      setErrMsg("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      // ✅ Call backend (or you can mock it)
      await requestPasswordResetApi(cleanEmail);

      setOkMsg(
        "If this email exists in our system, we’ve sent a password reset link. Please check your inbox (and spam folder)."
      );
      startCooldown(20);
    } catch (err) {
      setErrMsg(err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    clearMsgs();

    if (!tokenFromUrl) {
      setErrMsg("Reset token is missing. Please use the link you received.");
      return;
    }
    if (!newPw || newPw.length < 6) {
      setErrMsg("New password must be at least 6 characters.");
      return;
    }
    if (newPw !== confirmPw) {
      setErrMsg("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      await resetPasswordApi(tokenFromUrl, newPw);

      setOkMsg("Password updated successfully. Redirecting to login...");
      setTimeout(() => navigate("/login"), 900);
    } catch (err) {
      setErrMsg(err?.message || "Failed to reset password. Try requesting a new link.");
    } finally {
      setLoading(false);
    }
  };

  const isResetMode = !!tokenFromUrl;

  return (
    <div style={wrap}>
      <div style={card}>
        <h2 style={title}>{isResetMode ? "Reset Password" : "Forgot Password"}</h2>
        <p style={sub}>
          {isResetMode
            ? "Create a new password for your account."
            : "Enter your email and we’ll send a reset link (if the account exists)."}
        </p>

        {!isResetMode ? (
          <form onSubmit={handleRequest}>
            <div style={{ marginBottom: "10px" }}>
              <div style={label}>Email address</div>
              <input
                style={input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="example@company.com"
                autoComplete="email"
              />
            </div>

            <button style={btn(loading)} disabled={loading}>
              {loading ? "Sending..." : "Send reset link"}
            </button>

            <button
              type="button"
              style={ghostBtn(loading || cooldown > 0)}
              disabled={loading || cooldown > 0}
              onClick={() => {
                // Resend = same request
                if (!email.trim()) {
                  setErrMsg("Enter your email above to resend the link.");
                  return;
                }
                handleRequest(new Event("submit"));
              }}
            >
              {cooldown > 0 ? `Resend available in ${cooldown}s` : "Resend link"}
            </button>

            {okMsg ? <div style={msgOk}>{okMsg}</div> : null}
            {errMsg ? <div style={msgErr}>{errMsg}</div> : null}

            <div style={{ marginTop: "14px", fontSize: "13px", color: "#475569" }}>
              Back to <Link to="/login" style={{ color: "#2563eb", fontWeight: 800, textDecoration: "none" }}>Login</Link>
            </div>
          </form>
        ) : (
          <form onSubmit={handleReset}>
            <div style={row}>
              <div style={{ ...col, marginBottom: "10px" }}>
                <div style={label}>New password</div>
                <input
                  style={input}
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  type="password"
                  placeholder="Enter new password"
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div style={{ marginBottom: "10px" }}>
              <div style={label}>Confirm password</div>
              <input
                style={input}
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                type="password"
                placeholder="Confirm new password"
                autoComplete="new-password"
              />
            </div>

            <button style={btn(loading)} disabled={loading}>
              {loading ? "Updating..." : "Update password"}
            </button>

            {okMsg ? <div style={msgOk}>{okMsg}</div> : null}
            {errMsg ? <div style={msgErr}>{errMsg}</div> : null}

            <div style={{ marginTop: "14px", fontSize: "13px", color: "#475569" }}>
              If the link expired, go to{" "}
              <Link
                to="/forgot-password"
                style={{ color: "#2563eb", fontWeight: 800, textDecoration: "none" }}
              >
                Forgot Password
              </Link>{" "}
              and request a new one.
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
