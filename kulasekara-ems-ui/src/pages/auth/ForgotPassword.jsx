import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const navigate = useNavigate();

  // Step control: 1 = identify user, 2 = verify, 3 = reset
  const [step, setStep] = useState(1);

  // Inputs
  const [identifier, setIdentifier] = useState(""); // email or username
  const [verifyMethod, setVerifyMethod] = useState("otp"); // "otp" | "security"
  const [otp, setOtp] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI messages
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const canGoStep2 = useMemo(() => identifier.trim().length >= 3, [identifier]);

  const handleVerifyUser = (e) => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!canGoStep2) {
      setError("Please enter a valid Email or Username.");
      return;
    }

    // ✅ Later: call backend to validate user exists
    // await authService.findUser(identifier)

    setInfo("User verified (UI demo). Choose a verification method to continue.");
    setStep(2);
  };

  const handleVerification = (e) => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (verifyMethod === "otp") {
      if (otp.trim().length < 4) {
        setError("Please enter the OTP code.");
        return;
      }

      // ✅ Later: verify OTP with backend
      // await authService.verifyOtp(identifier, otp)

      setInfo("OTP verified (UI demo). You can now reset your password.");
      setStep(3);
      return;
    }

    if (verifyMethod === "security") {
      if (securityAnswer.trim().length < 2) {
        setError("Please answer the security question.");
        return;
      }

      // ✅ Later: verify security answer with backend
      // await authService.verifySecurityAnswer(identifier, securityAnswer)

      setInfo("Answer verified (UI demo). You can now reset your password.");
      setStep(3);
    }
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // ✅ Later: update password in database
    // await authService.resetPassword(identifier, newPassword)

    setInfo("Password updated successfully (UI demo). You can login now.");
    setTimeout(() => navigate("/"), 800);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={{ marginTop: 0 }}>Forgot Password</h2>
        <p style={{ marginTop: -6, color: "#64748b" }}>
          Follow the steps to reset your password securely.
        </p>

        {/* Alerts */}
        {error ? <div style={styles.errorBox}>{error}</div> : null}
        {info ? <div style={styles.infoBox}>{info}</div> : null}

        {/* Step indicator */}
        <div style={styles.stepRow}>
          <StepPill active={step === 1} label="1. Identify" />
          <StepPill active={step === 2} label="2. Verify" />
          <StepPill active={step === 3} label="3. Reset" />
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <form onSubmit={handleVerifyUser}>
            <label style={styles.label}>Email / Username</label>
            <input
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Enter your email or username"
              style={styles.input}
            />

            <button type="submit" style={styles.primaryBtn}>
              Verify User
            </button>
          </form>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <form onSubmit={handleVerification}>
            <label style={styles.label}>Verification Method</label>
            <select
              value={verifyMethod}
              onChange={(e) => setVerifyMethod(e.target.value)}
              style={styles.input}
            >
              <option value="otp">OTP (Email/SMS)</option>
              <option value="security">Security Question</option>
            </select>

            {verifyMethod === "otp" ? (
              <>
                <div style={styles.smallInfo}>
                  (UI demo) In real system, OTP will be sent to your registered email/phone.
                </div>

                <label style={styles.label}>Enter OTP</label>
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="e.g., 123456"
                  style={styles.input}
                />
              </>
            ) : (
              <>
                <div style={styles.smallInfo}>
                  (UI demo) In real system, question comes from database for this user.
                </div>

                <label style={styles.label}>Security Question</label>
                <input
                  value={"What is your favorite color?"}
                  disabled
                  style={{ ...styles.input, background: "#f8fafc" }}
                />

                <label style={styles.label}>Answer</label>
                <input
                  value={securityAnswer}
                  onChange={(e) => setSecurityAnswer(e.target.value)}
                  placeholder="Enter your answer"
                  style={styles.input}
                />
              </>
            )}

            <button type="submit" style={styles.primaryBtn}>
              Verify & Continue
            </button>

            <button
              type="button"
              onClick={() => {
                setStep(1);
                setError("");
                setInfo("");
              }}
              style={styles.secondaryBtn}
            >
              ← Back
            </button>
          </form>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <form onSubmit={handleResetPassword}>
            <div style={styles.smallInfo}>
              (Backend-ready) New password will be saved in database as new credentials.
            </div>

            <label style={styles.label}>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              style={styles.input}
            />

            <label style={styles.label}>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              style={styles.input}
            />

            <button type="submit" style={styles.primaryBtn}>
              Reset Password
            </button>

            <button type="button" onClick={() => navigate("/")} style={styles.secondaryBtn}>
              ← Back to Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function StepPill({ active, label }) {
  return (
    <span
      style={{
        padding: "6px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        border: "1px solid #ddd",
        background: active ? "#111" : "#fff",
        color: active ? "#fff" : "#334155",
      }}
    >
      {label}
    </span>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f6f8",
    padding: 16,
    fontFamily: "Arial, sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: 480,
    background: "#fff",
    padding: 22,
    borderRadius: 12,
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  },
  stepRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    margin: "12px 0 16px",
  },
  label: { display: "block", fontSize: 14, fontWeight: 700, marginTop: 10 },
  input: {
    width: "100%",
    marginTop: 6,
    marginBottom: 10,
    padding: 10,
    borderRadius: 8,
    border: "1px solid #ccc",
    outline: "none",
    fontSize: 14,
  },
  primaryBtn: {
    width: "100%",
    marginTop: 6,
    padding: 10,
    borderRadius: 8,
    border: "none",
    background: "#2645c0ff",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },
  secondaryBtn: {
    width: "100%",
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    border: "1px solid #ddd",
    background: "#fff",
    cursor: "pointer",
    fontWeight: 700,
  },
  errorBox: {
    background: "#fff1f2",
    border: "1px solid #fecdd3",
    color: "#9f1239",
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  infoBox: {
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    color: "#1e3a8a",
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  smallInfo: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 8,
  },
};
