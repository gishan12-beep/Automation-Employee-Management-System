import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login as loginApi } from "../../services/authService";

function Login() {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
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

      // Backend returns: { token, user: { user_id, role, employee_id, ... } }
      const data = await loginApi(emailOrUsername, password);

      // ✅ Save session
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("user_id", data.user.user_id);
      localStorage.setItem("employee_id", data.user.employee_id || "");

      // ✅ Redirect by role
      navigate(routeByRole(data.user.role), { replace: true });
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
    <div style={styles.container}>
      <form onSubmit={handleLogin} style={styles.form}>
        <h2 style={styles.title}>Kulasekara Oil Mills</h2>
        <p style={styles.subtitle}>Employee Management System</p>

        <input
          type="text"
          placeholder="Email or Username"
          value={emailOrUsername}
          onChange={(e) => setEmailOrUsername(e.target.value)}
          style={styles.input}
          autoComplete="username"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          autoComplete="current-password"
          required
        />

        <div style={styles.forgotWrap}>
          <Link to="/forgot-password" style={styles.forgotLink}>
            Forgot password?
          </Link>
        </div>

        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* Optional helper for testing */}
        <div style={styles.hintBox}>
          <div><b>Manager:</b> manager / Manager@123</div>
          <div><b>Accountant:</b> accountant / Accountant@123</div>
        </div>
      </form>
    </div>
  );
}

export default Login;

// Inline styles (blue theme)
const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f6f8",
    fontFamily: "Arial, sans-serif",
  },
  form: {
    width: "350px",
    padding: "30px",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column",
  },
  title: {
    textAlign: "center",
    marginBottom: "5px",
    color: "#1e3a8a",
  },
  subtitle: {
    textAlign: "center",
    marginBottom: "20px",
    color: "#666",
    fontSize: "14px",
  },
  input: {
    marginBottom: "15px",
    padding: "10px",
    fontSize: "14px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    outline: "none",
  },
  forgotWrap: {
    textAlign: "right",
    marginTop: "-6px",
    marginBottom: "12px",
  },
  forgotLink: {
    fontSize: "13px",
    color: "#2563eb",
    textDecoration: "none",
    fontWeight: "600",
  },
  button: {
    padding: "10px",
    backgroundColor: "#2645c0ff",
    border: "none",
    fontWeight: "bold",
    cursor: "pointer",
    borderRadius: "5px",
    color: "#fff",
  },
  hintBox: {
    marginTop: "14px",
    fontSize: "12px",
    color: "#555",
    background: "#f1f5ff",
    padding: "10px",
    borderRadius: "6px",
    lineHeight: "1.6",
  },
};
