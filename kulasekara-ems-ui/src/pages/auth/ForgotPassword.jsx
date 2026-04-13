// src/pages/auth/ForgotPassword.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { requestPasswordResetApi } from "../../services/authService";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(false);
  const [hoveredButton, setHoveredButton] = useState(false);
  const [hoveredLink, setHoveredLink] = useState(false);

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
    <>
      {/* Inline CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-20px) translateX(10px);
          }
        }

        @keyframes floatReverse {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(20px) translateX(-10px);
          }
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .floating-circle-1 {
          animation: float 20s ease-in-out infinite;
        }

        .floating-circle-2 {
          animation: floatReverse 25s ease-in-out infinite;
        }

        .floating-circle-3 {
          animation: float 18s ease-in-out infinite;
        }

        .floating-circle-4 {
          animation: floatReverse 22s ease-in-out infinite;
        }

        .spinner {
          animation: spin 0.8s linear infinite;
        }

        .corner {
          animation: pulse 3s ease-in-out infinite;
        }

        .alert-message {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>

      <div style={styles.container}>
        {/* Animated background elements */}
        <div style={styles.backgroundPattern}>
          <div className="floating-circle-1" style={styles.floatingCircle1}></div>
          <div className="floating-circle-2" style={styles.floatingCircle2}></div>
          <div className="floating-circle-3" style={styles.floatingCircle3}></div>
          <div className="floating-circle-4" style={styles.floatingCircle4}></div>
        </div>

        {/* Main centered wrapper */}
        <div style={styles.wrapper}>
          {/* Decorative border elements */}
          <div className="corner" style={styles.cornerTopLeft}></div>
          <div className="corner" style={styles.cornerTopRight}></div>
          <div className="corner" style={styles.cornerBottomLeft}></div>
          <div className="corner" style={styles.cornerBottomRight}></div>

          {/* Icon section */}
          <div style={styles.iconSection}>
            <div style={styles.iconCircle}>
              <svg style={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
          </div>

          {/* Header */}
          <div style={styles.header}>
            <h2 style={styles.title}>Forgot Password?</h2>
            <p style={styles.subtitle}>
              No worries! Enter your email and we'll send you reset instructions.
            </p>
          </div>

          {/* Status/Error Messages */}
          {status && (
            <div className="alert-message" style={{ ...styles.alert, ...styles.alertSuccess }}>
              <svg style={styles.alertIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{status}</span>
            </div>
          )}

          {error && (
            <div className="alert-message" style={{ ...styles.alert, ...styles.alertError }}>
              <svg style={styles.alertIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={onSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <svg style={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Email Address
              </label>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedInput(true)}
                onBlur={() => setFocusedInput(false)}
                style={{
                  ...styles.input,
                  ...(focusedInput ? styles.inputFocused : {}),
                }}
                required
              />
            </div>

            <button
              type="submit"
              style={{
                ...styles.button,
                ...(hoveredButton && !loading ? styles.buttonHover : {}),
                ...(loading ? styles.buttonDisabled : {}),
              }}
              onMouseEnter={() => setHoveredButton(true)}
              onMouseLeave={() => setHoveredButton(false)}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner" style={styles.spinner}></span>
                  Sending...
                </>
              ) : (
                <>
                  <svg style={styles.buttonIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  Send Reset Link
                </>
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div style={styles.footer}>
            <Link
              to="/"
              style={{
                ...styles.backLink,
                ...(hoveredLink ? styles.backLinkHover : {}),
              }}
              onMouseEnter={() => setHoveredLink(true)}
              onMouseLeave={() => setHoveredLink(false)}
            >
              <svg style={styles.backIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

// Dynamic centered design with inline CSS
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
  wrapper: {
    position: "relative",
    width: "100%",
    maxWidth: "480px",
    background: "var(--glass-bg)",
    backdropFilter: "var(--glass-blur)",
    WebkitBackdropFilter: "var(--glass-blur)",
    borderRadius: "24px",
    padding: "50px 45px",
    boxShadow: "var(--glass-shadow)",
    zIndex: 2,
    border: "var(--glass-border)",
  },
  cornerTopLeft: {
    position: "absolute",
    top: "-2px",
    left: "-2px",
    width: "80px",
    height: "80px",
    borderTop: "3px solid #4a7c4e",
    borderLeft: "3px solid #4a7c4e",
    borderRadius: "24px 0 0 0",
  },
  cornerTopRight: {
    position: "absolute",
    top: "-2px",
    right: "-2px",
    width: "80px",
    height: "80px",
    borderTop: "3px solid #4a7c4e",
    borderRight: "3px solid #4a7c4e",
    borderRadius: "0 24px 0 0",
  },
  cornerBottomLeft: {
    position: "absolute",
    bottom: "-2px",
    left: "-2px",
    width: "80px",
    height: "80px",
    borderBottom: "3px solid #4a7c4e",
    borderLeft: "3px solid #4a7c4e",
    borderRadius: "0 0 0 24px",
  },
  cornerBottomRight: {
    position: "absolute",
    bottom: "-2px",
    right: "-2px",
    width: "80px",
    height: "80px",
    borderBottom: "3px solid #4a7c4e",
    borderRight: "3px solid #4a7c4e",
    borderRadius: "0 0 24px 0",
  },
  iconSection: {
    textAlign: "center",
    marginBottom: "25px",
  },
  iconCircle: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #4a7c4e 0%, #5a8c5e 100%)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: "0 auto",
    boxShadow: "0 8px 20px rgba(74, 124, 78, 0.25), inset 0 -2px 8px rgba(0, 0, 0, 0.1)",
  },
  icon: {
    width: "40px",
    height: "40px",
    color: "#ffffff",
    filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))",
  },
  header: {
    textAlign: "center",
    marginBottom: "30px",
  },
  title: {
    fontSize: "26px",
    fontWeight: "700",
    color: "#2c5530",
    marginBottom: "10px",
    letterSpacing: "0.3px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#6b7280",
    fontWeight: "400",
    lineHeight: "1.6",
    maxWidth: "350px",
    margin: "0 auto",
  },
  alert: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "14px 16px",
    borderRadius: "12px",
    marginBottom: "20px",
    fontSize: "14px",
    fontWeight: "500",
    lineHeight: "1.5",
  },
  alertSuccess: {
    background: "rgba(74, 124, 78, 0.1)",
    color: "#2c5530",
    border: "1px solid rgba(74, 124, 78, 0.2)",
  },
  alertError: {
    background: "rgba(220, 38, 38, 0.1)",
    color: "#991b1b",
    border: "1px solid rgba(220, 38, 38, 0.2)",
  },
  alertIcon: {
    width: "20px",
    height: "20px",
    flexShrink: 0,
  },
  form: {
    width: "100%",
  },
  inputGroup: {
    marginBottom: "24px",
  },
  label: {
    display: "flex",
    alignItems: "center",
    fontSize: "13px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "10px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  inputIcon: {
    width: "16px",
    height: "16px",
    marginRight: "8px",
    color: "#4a7c4e",
  },
  input: {
    width: "100%",
    padding: "14px 18px",
    fontSize: "15px",
    borderRadius: "12px",
    border: "2px solid #e5e7eb",
    outline: "none",
    transition: "all 0.3s ease",
    backgroundColor: "#f9fafb",
    boxSizing: "border-box",
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
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "10px",
  },
  buttonHover: {
    transform: "translateY(-2px)",
    boxShadow: "0 6px 20px rgba(74, 124, 78, 0.4)",
  },
  buttonDisabled: {
    opacity: 0.7,
    cursor: "not-allowed",
    transform: "none",
  },
  buttonIcon: {
    width: "18px",
    height: "18px",
  },
  spinner: {
    width: "16px",
    height: "16px",
    border: "2px solid rgba(255, 255, 255, 0.3)",
    borderTop: "2px solid #ffffff",
    borderRadius: "50%",
    display: "inline-block",
  },
  footer: {
    marginTop: "30px",
    textAlign: "center",
  },
  backLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    color: "#4a7c4e",
    textDecoration: "none",
    fontWeight: "600",
    transition: "all 0.2s ease",
    padding: "8px 16px",
    borderRadius: "8px",
  },
  backLinkHover: {
    color: "#2c5530",
    backgroundColor: "rgba(74, 124, 78, 0.08)",
  },
  backIcon: {
    width: "18px",
    height: "18px",
  },
};
