import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

function AppLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // ✅ Normalize role from backend: MANAGER / ACCOUNTANT / EMPLOYEE
  const role = (localStorage.getItem("role") || "MANAGER").toUpperCase();

  // ✅ Menu keys MUST match role (uppercase)
  const menuItems = {
    MANAGER: [
      { name: "Dashboard", path: "/manager/dashboard" },
      { name: "Employees", path: "/manager/employees" },
      { name: "Attendance", path: "/manager/attendance" },
      { name: "Payroll", path: "/manager/payroll" },
      { name: "Issues", path: "/manager/issues" },
      { name: "Leave Requests", path: "/manager/leaves" },
      { name: "Final Settlement", path: "/manager/settlement" },
      { name: "Reports", path: "/manager/reports" },
      { name: "Settings", path: "/manager/settings" },
    ],
    EMPLOYEE: [
      { name: "Dashboard", path: "/employee/dashboard" },
      { name: "Attendance", path: "/employee/attendance" },
      { name: "Leave Requests", path: "/employee/leave" },
      { name: "Salary", path: "/employee/payroll/salary-history" },
      { name: "Issues", path: "/employee/issues/status" },
      { name: "Final Settlement", path: "/employee/settlement" },
    ],
    ACCOUNTANT: [
      { name: "Dashboard", path: "/accountant/dashboard" },
      { name: "Payroll", path: "/accountant/payroll" },
      { name: "Payroll Summary", path: "/accountant/payroll-summary" },
      { name: "EPF/ETF", path: "/accountant/epf-etf" },
      { name: "Bank Withdrawals", path: "/accountant/withdrawals" },
    ],
  };

  const handleLogout = () => {
    // ✅ Clear full session
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user_id");
    localStorage.removeItem("employee_id");
    navigate("/", { replace: true });
  };

  // ✅ Active check supports nested routes
  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  // ✅ Pretty role label
  const roleLabel = role.toLowerCase().replace(/^\w/, (c) => c.toUpperCase());

  return (
    <div style={styles.container}>
      {/* SIDEBAR */}
      <aside
        style={{
          ...styles.sidebar,
          width: isSidebarOpen ? "270px" : "0",
          opacity: isSidebarOpen ? 1 : 0,
        }}
      >
        <div style={styles.sidebarContent}>
          {/* Brand */}
          <div style={styles.brand}>
            <div style={styles.brandIcon}>K</div>
            <div>
              <div style={styles.brandTitle}>KULASEKARA</div>
              <div style={styles.brandSub}>Oil Mills ERP</div>
            </div>
          </div>

          {/* Role Pill */}
          <div style={styles.roleContainer}>
            <div style={styles.roleChip}>
              <span style={styles.roleDot} />
              <span style={styles.roleText}>{roleLabel} Workspace</span>
            </div>
          </div>

          {/* Menu */}
          <ul style={styles.menu}>
            {(menuItems[role] || []).map((item) => {
              const active = isActive(item.path);
              return (
                <li key={item.path} style={styles.menuItem}>
                  <Link
                    to={item.path}
                    style={active ? styles.linkActive : styles.link}
                  >
                    <span style={styles.linkText}>{item.name}</span>
                    {active && <div style={styles.activeIndicator} />}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Logout */}
          <div style={styles.footer}>
            <button style={styles.logoutButton} onClick={handleLogout}>
              <span style={{ fontSize: "16px" }}>↪</span> Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div style={styles.mainWrapper}>
        <header style={styles.header}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button
              style={styles.toggleButton}
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              title="Toggle Menu"
            >
              {isSidebarOpen ? "✕" : "☰"}
            </button>
          </div>

          <div style={styles.userSection}>
            <div style={styles.userInfo}>
              <p style={styles.welcomeText}>Logged in as</p>
              <p style={styles.userName}>{roleLabel}</p>
            </div>
            <div style={styles.avatar}>{roleLabel.charAt(0).toUpperCase()}</div>
          </div>
        </header>

        <main style={styles.main}>{children}</main>
      </div>
    </div>
  );
}

export default AppLayout;

/**
 * STYLES - Updated to match "Calm Professional" Green Theme (#4a7c4e)
 */
const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    // fontFamily: "'Inter', 'Segoe UI', sans-serif", // Inherited globally now
    background: "linear-gradient(135deg, #e8f5e9 0%, #f1f8f4 50%, #e0f2f1 100%)", // Matching Login Background
  },

  // Sidebar Styling
  sidebar: {
    background: "var(--glass-bg)",
    backdropFilter: "var(--glass-blur)",
    WebkitBackdropFilter: "var(--glass-blur)",
    transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease",
    borderRight: "var(--glass-border)",
    boxShadow: "var(--glass-shadow)",
    overflow: "hidden",
    whiteSpace: "nowrap",
    position: "relative",
    zIndex: 50,
  },
  sidebarContent: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    width: "270px", // Fixed width content to prevent squash during transition
  },

  // Brand Section
  brand: {
    padding: "24px 24px 20px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    borderBottom: "1px solid rgba(74, 124, 78, 0.1)", // Theme border
  },
  brandIcon: {
    width: "40px",
    height: "40px",
    background: "linear-gradient(135deg, #4a7c4e 0%, #5a8c5e 100%)", // The Theme Gradient (Matched to Login)
    borderRadius: "10px",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    fontWeight: "900",
    boxShadow: "0 4px 10px rgba(74, 124, 78, 0.2)",
  },
  brandTitle: {
    fontSize: "15px",
    fontWeight: "900",
    color: "#0b1220",
    letterSpacing: "-0.3px",
  },
  brandSub: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginTop: "2px",
  },

  // Role Chip
  roleContainer: { padding: "16px 20px 8px" },
  roleChip: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "#f0f7f1", // Light green bg
    border: "1px solid #dcfce7",
    padding: "8px 12px",
    borderRadius: "10px",
  },
  roleDot: {
    width: "8px",
    height: "8px",
    background: "#4a7c4e", // Theme Green
    borderRadius: "50%",
    boxShadow: "0 0 0 3px rgba(74, 124, 78, 0.15)",
  },
  roleText: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#14532d", // Dark Green text
    textTransform: "uppercase",
    letterSpacing: "0.4px",
  },

  // Navigation Menu
  menu: {
    listStyle: "none",
    padding: "10px 14px",
    margin: 0,
    flex: 1,
    overflowY: "auto",
  },
  menuItem: {
    marginBottom: "4px",
  },
  link: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    textDecoration: "none",
    borderRadius: "12px",
    color: "#64748b",
    transition: "all 0.2s ease",
    background: "transparent",
    fontWeight: "600",
    fontSize: "14px",
  },
  linkActive: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    textDecoration: "none",
    borderRadius: "12px",
    background: "#4a7c4e", // Theme Green Active
    color: "#ffffff",
    fontWeight: "700",
    fontSize: "14px",
    boxShadow: "0 8px 16px rgba(74, 124, 78, 0.2)",
  },
  linkText: {
    zIndex: 1,
  },
  activeIndicator: {
    width: "6px",
    height: "6px",
    background: "#fff",
    borderRadius: "50%",
  },

  // Footer / Logout
  footer: {
    padding: "16px",
    borderTop: "1px solid rgba(74, 124, 78, 0.1)", // Theme border
  },
  logoutButton: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "12px",
    background: "#fff",
    border: "1px solid rgba(74, 124, 78, 0.2)", // Theme border
    borderRadius: "12px",
    color: "#64748b",
    fontWeight: "700",
    fontSize: "13px",
    cursor: "pointer",
    transition: "all 0.2s",
  },

  // Main Content Area
  mainWrapper: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden", // Prevents double scrollbars
  },
  header: {
    padding: "16px 30px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "var(--glass-bg)",
    backdropFilter: "var(--glass-blur)",
    WebkitBackdropFilter: "var(--glass-blur)",
    borderBottom: "var(--glass-border)",
    boxShadow: "var(--glass-shadow)",
    zIndex: 40,
  },
  toggleButton: {
    background: "#fff",
    border: "1px solid rgba(74, 124, 78, 0.2)", // Theme border
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    cursor: "pointer",
    color: "#1e293b",
    boxShadow: "0 2px 5px rgba(0,0,0,0.03)",
  },

  // User Profile in Header
  userSection: { display: "flex", alignItems: "center", gap: "14px" },
  userInfo: { textAlign: "right" },
  welcomeText: { margin: 0, fontSize: "11px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase" },
  userName: { margin: "2px 0 0", fontSize: "14px", fontWeight: "800", color: "#1e293b" },
  avatar: {
    width: "44px",
    height: "44px",
    borderRadius: "14px",
    background: "#4a7c4e", // Theme Green
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    fontWeight: "800",
    boxShadow: "0 4px 12px rgba(74, 124, 78, 0.25)",
  },

  main: {
    flex: 1,
    padding: "0 30px 30px",
    overflowY: "auto",
  },
};