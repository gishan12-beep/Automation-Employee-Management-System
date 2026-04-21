import React, { useMemo, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
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
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState("");

  const validateStrongPassword = (p) => {
    if (p.length < 8) return "Password must be at least 8 characters.";
    if (p.length > 64) return "Password must be less than 65 characters.";
    if (/\s/.test(p)) return "Password must not contain spaces.";
    if (!/[a-z]/.test(p)) return "Include at least 1 lowercase letter.";
    if (!/[A-Z]/.test(p)) return "Include at least 1 uppercase letter.";
    if (!/[0-9]/.test(p)) return "Include at least 1 number.";
    if (!/[!@#$%^&*()_\-+=[\]{};:'",.<>/?\\|`~]/.test(p)) return "Include at least 1 special character.";
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
    <>
      {/* Inline CSS Animations (Same as Login) */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        @keyframes floatReverse {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(20px) translateX(-10px); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .floating-circle-1 { animation: float 20s ease-in-out infinite; }
        .floating-circle-2 { animation: floatReverse 25s ease-in-out infinite; }
        .floating-circle-3 { animation: float 18s ease-in-out infinite; }
        .floating-circle-4 { animation: floatReverse 22s ease-in-out infinite; }
        .spinner { animation: spin 0.8s linear infinite; }
      `}</style>

      <div style={styles.container}>
        {/* Animated background elements */}
        <div style={styles.backgroundPattern}>
          <div className="floating-circle-1" style={styles.floatingCircle1}></div>
          <div className="floating-circle-2" style={styles.floatingCircle2}></div>
          <div className="floating-circle-3" style={styles.floatingCircle3}></div>
          <div className="floating-circle-4" style={styles.floatingCircle4}></div>
        </div>

        <div style={styles.loginWrapper}>
          {/* Logo Section */}
          <div style={styles.logoSection}>
            <div style={styles.logoCircle}>
              <svg style={styles.logoIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="3" strokeWidth={2} />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m5.08 5.08l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m5.08-5.08l4.24-4.24" />
              </svg>
            </div>
            <h1 style={styles.brandName}>Reset Password</h1>
            <div style={styles.divider}></div>
            <p style={styles.brandTagline}>Enter a new strong password below</p>
          </div>

          <form onSubmit={onSubmit}>
            {msg.text && (
              <div style={{ ...styles.msg, ...(msg.type === "ok" ? styles.ok : styles.bad) }}>
                {msg.text}
              </div>
            )}

            <div style={styles.inputGroup}>
              <label style={styles.label}>New Password</label>
              <div style={styles.passwordWrapper}>
                <input
                  type={showNewPassword ? "text" : "password"}
                  style={{
                    ...styles.input,
                    ...(focusedInput === "new" ? styles.inputFocused : {}),
                    paddingRight: "48px",
                  }}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  onFocus={() => setFocusedInput("new")}
                  onBlur={() => setFocusedInput("")}
                  placeholder="Ej: Hello@123"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{
                    ...styles.eyeButton,
                    color: focusedInput === "new" ? "#4a7c4e" : "#9ca3af",
                  }}
                  tabIndex="-1"
                  aria-label={showNewPassword ? "Hide password" : "Show password"}
                >
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Confirm Password</label>
              <div style={styles.passwordWrapper}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  style={{
                    ...styles.input,
                    ...(focusedInput === "confirm" ? styles.inputFocused : {}),
                    paddingRight: "48px",
                  }}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onFocus={() => setFocusedInput("confirm")}
                  onBlur={() => setFocusedInput("")}
                  placeholder="Re-enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    ...styles.eyeButton,
                    color: focusedInput === "confirm" ? "#4a7c4e" : "#9ca3af",
                  }}
                  tabIndex="-1"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div style={styles.rules}>
              <div>✅ 8–64 characters</div>
              <div>✅ 1 uppercase + 1 lowercase</div>
              <div>✅ 1 number + 1 special character</div>
              <div>✅ No spaces</div>
            </div>

            <button style={styles.button} disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner" style={styles.spinner}></span>
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </button>
          </form>

          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <Link to="/" style={styles.forgotLink}>Back to Login</Link>
          </div>
        </div>
      </div>
    </>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #e8f5e9 0%, #f1f8f4 50%, #e0f2f1 100%)",
    padding: "20px",
    position: "relative",
    overflow: "hidden",
  },
  backgroundPattern: {
    position: "absolute",
    width: "100%",
    height: "100%",
    top: 0,
    left: 0,
    zIndex: 1,
    pointerEvents: "none",
  },
  floatingCircle1: {
    position: "absolute",
    width: "400px",
    height: "400px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(76, 175, 80, 0.08) 0%, transparent 70%)",
    top: "-100px",
    left: "-100px",
  },
  floatingCircle2: {
    position: "absolute",
    width: "350px",
    height: "350px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(56, 142, 60, 0.06) 0%, transparent 70%)",
    bottom: "-80px",
    right: "-80px",
  },
  floatingCircle3: {
    position: "absolute",
    width: "250px",
    height: "250px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(67, 160, 71, 0.05) 0%, transparent 70%)",
    top: "50%",
    right: "10%",
  },
  floatingCircle4: {
    position: "absolute",
    width: "300px",
    height: "300px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(46, 125, 50, 0.04) 0%, transparent 70%)",
    bottom: "20%",
    left: "15%",
  },
  loginWrapper: {
    position: "relative",
    width: "100%",
    maxWidth: "480px",
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(20px)",
    borderRadius: "24px",
    padding: "50px 45px",
    boxShadow: "0 20px 60px rgba(46, 125, 50, 0.15), 0 0 0 1px rgba(46, 125, 50, 0.05)",
    zIndex: 2,
    border: "2px solid rgba(255, 255, 255, 0.8)",
  },
  logoSection: { textAlign: "center", marginBottom: "35px" },
  logoCircle: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #4a7c4e 0%, #5a8c5e 100%)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: "0 auto 20px",
    boxShadow: "0 10px 30px rgba(74, 124, 78, 0.25)",
  },
  logoIcon: { width: "40px", height: "40px", color: "#ffffff" },
  brandName: { fontSize: "24px", fontWeight: "700", color: "#2c5530", marginBottom: "12px" },
  divider: {
    width: "60px",
    height: "3px",
    background: "linear-gradient(90deg, transparent 0%, #4a7c4e 50%, transparent 100%)",
    margin: "15px auto",
    borderRadius: "2px",
  },
  brandTagline: { fontSize: "14px", color: "#6b7280", fontWeight: "500" },

  inputGroup: { marginBottom: "20px" },
  passwordWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  eyeButton: {
    position: "absolute",
    right: "14px",
    background: "none",
    border: "none",
    padding: "4px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
    borderRadius: "8px",
    zIndex: 3,
  },
  label: { display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: "600", color: "#374151", textTransform: "uppercase" },
  input: {
    width: "100%",
    padding: "14px 18px",
    fontSize: "15px",
    borderRadius: "12px",
    border: "2px solid #e5e7eb",
    outline: "none",
    transition: "all 0.3s ease",
    backgroundColor: "#f9fafb",
  },
  inputFocused: {
    borderColor: "#4a7c4e",
    backgroundColor: "#ffffff",
    boxShadow: "0 0 0 3px rgba(74, 124, 78, 0.1)",
  },
  button: {
    width: "100%",
    padding: "15px 24px",
    background: "linear-gradient(135deg, #4a7c4e 0%, #5a8c5e 100%)",
    border: "none",
    fontWeight: "700",
    cursor: "pointer",
    borderRadius: "12px",
    color: "#ffffff",
    fontSize: "16px",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(74, 124, 78, 0.3)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "10px",
  },
  forgotLink: { color: "#4a7c4e", textDecoration: "none", fontWeight: "600" },

  msg: { padding: "12px", borderRadius: "10px", marginBottom: "20px", fontSize: "14px", fontWeight: "500" },
  ok: { background: "rgba(74, 124, 78, 0.1)", color: "#166534", border: "1px solid rgba(74, 124, 78, 0.2)" },
  bad: { background: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca" },

  rules: {
    fontSize: "13px",
    color: "#555",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    padding: "12px",
    borderRadius: "12px",
    marginBottom: "20px",
    lineHeight: "1.6"
  },
  spinner: {
    width: "16px",
    height: "16px",
    border: "2px solid rgba(255, 255, 255, 0.3)",
    borderTop: "2px solid #ffffff",
    borderRadius: "50%",
    display: "inline-block",
  },
};
