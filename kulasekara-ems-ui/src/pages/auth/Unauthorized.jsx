import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, ArrowLeft, Home, Lock } from "lucide-react";

const Unauthorized = () => {
  const navigate = useNavigate();
  const [hoveredBtn, setHoveredBtn] = useState(null);

  const role = (localStorage.getItem("role") || "EMPLOYEE").toLowerCase();
  const dashboardPath = role === "manager" ? "/manager/dashboard" 
                      : role === "accountant" ? "/accountant/dashboard" 
                      : "/employee/dashboard";

  return (
    <div style={styles.container}>
      {/* Dynamic Background */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .glow {
          position: absolute;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(220, 38, 38, 0.08) 0%, transparent 70%);
          border-radius: 50%;
          filter: blur(60px);
          z-index: 0;
          animation: pulse 8s ease-in-out infinite;
        }
        .float-icon {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
      
      <div className="glow" style={{ top: "-100px", right: "-100px" }}></div>
      <div className="glow" style={{ bottom: "-100px", left: "-100px", animationDelay: "-4s" }}></div>

      <div style={styles.card}>
        <div className="float-icon" style={styles.iconWrapper}>
          <div style={styles.iconCircle}>
            <ShieldAlert size={48} color="#dc2626" strokeWidth={1.5} />
          </div>
          <div style={styles.lockBadge}>
            <Lock size={14} color="#fff" />
          </div>
        </div>

        <h1 style={styles.title}>Access Denied</h1>
        <div style={styles.divider}></div>
        
        <p style={styles.message}>
          Oops! It seems you don't have the necessary permissions to access this page. 
          If you believe this is an error, please contact your system administrator.
        </p>

        <div style={styles.buttonGroup}>
          <button
            style={{
              ...styles.btnSecondary,
              transform: hoveredBtn === "back" ? "translateY(-2px)" : "none",
              background: hoveredBtn === "back" ? "#f1f5f9" : "#fff",
            }}
            onMouseEnter={() => setHoveredBtn("back")}
            onMouseLeave={() => setHoveredBtn(null)}
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={18} />
            Go Back
          </button>

          <button
            style={{
              ...styles.btnPrimary,
              transform: hoveredBtn === "home" ? "translateY(-2px)" : "none",
              boxShadow: hoveredBtn === "home" ? "0 10px 20px rgba(44, 85, 48, 0.2)" : "0 4px 12px rgba(44, 85, 48, 0.15)",
            }}
            onMouseEnter={() => setHoveredBtn("home")}
            onMouseLeave={() => setHoveredBtn(null)}
            onClick={() => navigate(dashboardPath)}
          >
            <Home size={18} />
            Return to Dashboard
          </button>
        </div>

        <div style={styles.footer}>
            <p style={styles.footerText}>Error Code: 403 Forbidden</p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f8fafc",
    padding: "24px",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  },
  card: {
    background: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(12px)",
    borderRadius: "32px",
    padding: "60px 40px",
    width: "100%",
    maxWidth: "500px",
    textAlign: "center",
    boxShadow: "0 20px 50px rgba(0,0,0,0.05)",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    position: "relative",
    zIndex: 1,
  },
  iconWrapper: {
    position: "relative",
    display: "inline-block",
    marginBottom: "32px",
  },
  iconCircle: {
    width: "100px",
    height: "100px",
    borderRadius: "30px",
    background: "#fef2f2",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 10px 25px rgba(220, 38, 38, 0.1)",
  },
  lockBadge: {
    position: "absolute",
    bottom: "-5px",
    right: "-5px",
    width: "32px",
    height: "32px",
    borderRadius: "12px",
    background: "#dc2626",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "3px solid #fff",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  },
  title: {
    fontSize: "32px",
    fontWeight: 900,
    color: "#1e293b",
    margin: "0 0 16px 0",
    letterSpacing: "-0.02em",
  },
  divider: {
    width: "60px",
    height: "4px",
    background: "#e2e8f0",
    borderRadius: "2px",
    margin: "0 auto 24px auto",
  },
  message: {
    fontSize: "16px",
    color: "#64748b",
    lineHeight: "1.6",
    margin: "0 0 40px 0",
    fontWeight: 500,
  },
  buttonGroup: {
    display: "flex",
    gap: "16px",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  btnPrimary: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "#2c5530",
    color: "#fff",
    border: "none",
    padding: "14px 24px",
    borderRadius: "14px",
    fontWeight: 700,
    fontSize: "14px",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
  },
  btnSecondary: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "#fff",
    color: "#475569",
    border: "1px solid #e2e8f0",
    padding: "14px 24px",
    borderRadius: "14px",
    fontWeight: 700,
    fontSize: "14px",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
  },
  footer: {
    marginTop: "48px",
    borderTop: "1px solid #f1f5f9",
    paddingTop: "24px",
  },
  footerText: {
    fontSize: "12px",
    fontWeight: 700,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    margin: 0,
  }
};

export default Unauthorized;
