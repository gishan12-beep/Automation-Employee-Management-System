// src/pages/auth/Login.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login as loginApi } from "../../services/authService";

function Login() {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState("");
  const [hoveredButton, setHoveredButton] = useState(false);
  const [hoveredLink, setHoveredLink] = useState(false);
  const navigate = useNavigate();

  const routeByRole = (role) => {
    const r = (role || "").toUpperCase();
    if (r === "MANAGER") return "/manager/dashboard";
    if (r === "ACCOUNTANT") return "/accountant/dashboard";
    if (r === "EMPLOYEE") return "/employee/dashboard";
    return "/";
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!emailOrUsername || !password) {
      alert("Please enter username/email and password.");
      return;
    }

    try {
      setLoading(true);

      const data = await loginApi(emailOrUsername, password);

      if (!data?.token || !data?.user) {
        alert("Login failed: invalid server response.");
        return;
      }

      const role = (data.user.role || "").toUpperCase();
      const mustChange = Number(data.user.must_change_password) === 1;

      localStorage.clear();
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", role);
      localStorage.setItem("user_id", data.user.user_id || "");
      localStorage.setItem("employee_id", data.user.employee_id || "");
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("must_change_password", mustChange ? "1" : "0");

      if (role === "EMPLOYEE" && mustChange) {
        navigate("/employee/change-password", { replace: true });
        return;
      }

      navigate(routeByRole(role), { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Login failed. Please try again.";
      alert(msg);
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
      `}</style>

      <div style={styles.container}>
        {/* Animated background elements */}
        <div style={styles.backgroundPattern}>
          <div className="floating-circle-1" style={styles.floatingCircle1}></div>
          <div className="floating-circle-2" style={styles.floatingCircle2}></div>
          <div className="floating-circle-3" style={styles.floatingCircle3}></div>
          <div className="floating-circle-4" style={styles.floatingCircle4}></div>
        </div>

        {/* Main centered login wrapper */}
        <div style={styles.loginWrapper}>
          {/* Decorative border elements */}
          <div className="corner" style={styles.cornerTopLeft}></div>
          <div className="corner" style={styles.cornerTopRight}></div>
          <div className="corner" style={styles.cornerBottomLeft}></div>
          <div className="corner" style={styles.cornerBottomRight}></div>

          {/* Logo section */}
          <div style={styles.logoSection}>
            <div style={styles.logoCircle}>
              <svg style={styles.logoIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="3" strokeWidth={2} />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m5.08 5.08l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m5.08-5.08l4.24-4.24"
                />
              </svg>
            </div>
            <h1 style={styles.brandName}>Kulasekara Oil Mills</h1>
            <div style={styles.divider}></div>
            <p style={styles.brandTagline}>Employee & Payroll Management System</p>
          </div>

          {/* Login form */}
          <form onSubmit={handleLogin} style={styles.form}>
            <div style={styles.formHeader}>
              <h2 style={styles.formTitle}>Welcome Back</h2>
              <p style={styles.formSubtitle}>Please sign in to continue</p>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <svg style={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Email or Username
              </label>
              <input
                type="text"
                placeholder="Enter your email or username"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                onFocus={() => setFocusedInput("username")}
                onBlur={() => setFocusedInput("")}
                style={{
                  ...styles.input,
                  ...(focusedInput === "username" ? styles.inputFocused : {}),
                }}
                autoComplete="username"
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <svg style={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedInput("password")}
                onBlur={() => setFocusedInput("")}
                style={{
                  ...styles.input,
                  ...(focusedInput === "password" ? styles.inputFocused : {}),
                }}
                autoComplete="current-password"
                required
              />
            </div>

            <div style={styles.forgotWrap}>
              <Link
                to="/forgot-password"
                style={{
                  ...styles.forgotLink,
                  ...(hoveredLink ? styles.forgotLinkHover : {}),
                }}
                onMouseEnter={() => setHoveredLink(true)}
                onMouseLeave={() => setHoveredLink(false)}
              >
                Forgot your password?
              </Link>
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
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>

            <div style={styles.footer}>
              <div style={styles.securityBadge}>
                <svg style={styles.shieldIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                <span style={styles.footerText}>Secure Login</span>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default Login;

// Dynamic centered design with unique wrapper styling - All inline CSS
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
    WebkitBackdropFilter: "blur(20px)",
    borderRadius: "24px",
    padding: "50px 45px",
    boxShadow: "0 20px 60px rgba(46, 125, 50, 0.15), 0 0 0 1px rgba(46, 125, 50, 0.05)",
    zIndex: 2,
    border: "2px solid rgba(255, 255, 255, 0.8)",
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
  logoSection: {
    textAlign: "center",
    marginBottom: "35px",
  },
  logoCircle: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #4a7c4e 0%, #5a8c5e 100%)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: "0 auto 20px",
    boxShadow: "0 10px 30px rgba(74, 124, 78, 0.25), inset 0 -2px 10px rgba(0, 0, 0, 0.1)",
    position: "relative",
  },
  logoIcon: {
    width: "50px",
    height: "50px",
    color: "#ffffff",
    filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))",
  },
  brandName: {
    fontSize: "26px",
    fontWeight: "700",
    color: "#2c5530",
    marginBottom: "12px",
    letterSpacing: "0.3px",
    lineHeight: "1.3",
  },
  divider: {
    width: "60px",
    height: "3px",
    background: "linear-gradient(90deg, transparent 0%, #4a7c4e 50%, transparent 100%)",
    margin: "15px auto",
    borderRadius: "2px",
  },
  brandTagline: {
    fontSize: "14px",
    color: "#6b7280",
    fontWeight: "500",
    letterSpacing: "0.5px",
  },
  form: {
    width: "100%",
  },
  formHeader: {
    textAlign: "center",
    marginBottom: "30px",
  },
  formTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: "6px",
  },
  formSubtitle: {
    fontSize: "14px",
    color: "#6b7280",
    fontWeight: "400",
  },
  inputGroup: {
    marginBottom: "22px",
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
    fontFamily: "inherit",
  },
  inputFocused: {
    borderColor: "#4a7c4e",
    backgroundColor: "#ffffff",
    boxShadow: "0 0 0 3px rgba(74, 124, 78, 0.1)",
  },
  forgotWrap: {
    textAlign: "right",
    marginTop: "-10px",
    marginBottom: "28px",
  },
  forgotLink: {
    fontSize: "13px",
    color: "#4a7c4e",
    textDecoration: "none",
    fontWeight: "600",
    transition: "all 0.2s ease",
    position: "relative",
  },
  forgotLinkHover: {
    color: "#2c5530",
    textDecoration: "underline",
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
  securityBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    background: "rgba(74, 124, 78, 0.08)",
    borderRadius: "20px",
    border: "1px solid rgba(74, 124, 78, 0.15)",
  },
  shieldIcon: {
    width: "18px",
    height: "18px",
    color: "#4a7c4e",
  },
  footerText: {
    fontSize: "12px",
    color: "#4a7c4e",
    fontWeight: "600",
    letterSpacing: "0.3px",
  },
};