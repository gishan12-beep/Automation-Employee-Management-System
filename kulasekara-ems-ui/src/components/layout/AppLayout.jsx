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
      { name: "Reports", path: "/manager/reports" },
      { name: "Issues", path: "/manager/issues" },
      { name: "Final Settlement", path: "/manager/settlement" },
    ],
    EMPLOYEE: [
      { name: "Dashboard", path: "/employee/dashboard" },
      { name: "Attendance", path: "/employee/attendance" },
      { name: "Salary", path: "/employee/payroll/salary-history" },
      { name: "Issues", path: "/employee/issues/status" },
      { name: "Final Settlement", path: "/employee/settlement" },
    ],
    ACCOUNTANT: [
      { name: "Dashboard", path: "/accountant/dashboard" },
      { name: "Payroll Summary", path: "/accountant/payroll-summary" },
      { name: "EPF/ETF", path: "/accountant/epf-etf" },
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
      <aside
        style={{
          ...styles.sidebar,
          width: isSidebarOpen ? "260px" : "0",
          overflow: "hidden",
        }}
      >
        <div style={styles.sidebarContent}>
          {/* Brand */}
          <div style={styles.brand}>
            <div style={styles.brandIcon}>K</div>
            <div>
              <div style={styles.brandTitle}>KULASEKARA</div>
              <div style={styles.brandSub}>Oil Mills</div>
            </div>
          </div>

          {/* Role chip */}
          <div style={styles.roleChip}>
            <span style={styles.roleDot} />
            <span style={styles.roleChipText}>{roleLabel}</span>
          </div>

          {/* Menu */}
          <ul style={styles.menu}>
            {(menuItems[role] || []).map((item) => {
              const active = isActive(item.path);
              return (
                <li key={item.path} style={styles.menuItem}>
                  <Link
                    to={item.path}
                    style={{
                      ...styles.link,
                      ...(active ? styles.linkActive : {}),
                    }}
                  >
                    <span>{item.name}</span>
                    {active && <span style={styles.activePill} />}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Logout */}
          <button style={styles.logoutButton} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      <div style={styles.mainWrapper}>
        {/* Header */}
        <header style={styles.header}>
          <button
            style={styles.toggleButton}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label="Toggle sidebar"
          >
            {isSidebarOpen ? "✕" : "☰"}
          </button>

          <div style={styles.userSection}>
            <div style={styles.userInfo}>
              <p style={styles.welcomeText}>Welcome back</p>
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
 * Sidebar matches dashboard (clean, ERP-style)
 */
const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    background: "#F1F5F9",
  },

  // --- Sidebar ---
  sidebar: {
    background: "#0F172A",
    transition: "all 0.25s ease-in-out",
    borderRight: "1px solid rgba(255,255,255,0.06)",
  },
  sidebarContent: {
    padding: "18px 16px",
    width: "260px",
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 10px 14px 10px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    marginBottom: "14px",
  },
  brandIcon: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    background: "#2563EB",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: 800,
  },
  brandTitle: {
    color: "#E5E7EB",
    fontSize: "14px",
    fontWeight: 800,
    letterSpacing: "0.6px",
  },
  brandSub: {
    color: "#94A3B8",
    fontSize: "12px",
    marginTop: "2px",
  },

  roleChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 10px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.08)",
    width: "fit-content",
    margin: "0 10px 14px 10px",
  },
  roleDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#22C55E",
  },
  roleChipText: {
    color: "#E5E7EB",
    fontSize: "12px",
    fontWeight: 600,
  },

  menu: {
    listStyle: "none",
    padding: 0,
    margin: "0 0 14px 0",
    flex: 1,
  },
  menuItem: {
    marginBottom: "6px",
  },
  link: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    color: "#CBD5E1",
    textDecoration: "none",
    fontWeight: 600,
    padding: "10px 12px",
    borderRadius: "10px",
    transition: "background 0.18s ease, color 0.18s ease",
    fontSize: "13.5px",
    margin: "0 6px",
  },
  linkActive: {
    background: "rgba(37, 99, 235, 0.18)",
    color: "#FFFFFF",
    border: "1px solid rgba(37, 99, 235, 0.35)",
  },
  activePill: {
    width: "10px",
    height: "10px",
    borderRadius: "999px",
    background: "#2563EB",
    boxShadow: "0 0 0 4px rgba(37,99,235,0.18)",
  },

  logoutButton: {
    width: "calc(100% - 12px)",
    margin: "0 6px 6px 6px",
    background: "rgba(255,255,255,0.06)",
    color: "#E5E7EB",
    border: "1px solid rgba(255,255,255,0.10)",
    padding: "10px 12px",
    fontWeight: 700,
    cursor: "pointer",
    borderRadius: "10px",
    fontSize: "13.5px",
    transition: "background 0.18s ease",
  },

  // --- Header/Main ---
  mainWrapper: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  header: {
    background: "#fff",
    borderBottom: "1px solid #E2E8F0",
    padding: "14px 18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toggleButton: {
    background: "#F8FAFC",
    border: "1px solid #E2E8F0",
    fontSize: "18px",
    cursor: "pointer",
    color: "#334155",
    padding: "8px 12px",
    borderRadius: "10px",
  },
  userSection: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  userInfo: {
    textAlign: "right",
  },
  welcomeText: {
    fontSize: "12px",
    color: "#64748B",
    margin: "0 0 2px 0",
  },
  userName: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#0F172A",
    margin: 0,
    textTransform: "capitalize",
  },
  avatar: {
    width: "38px",
    height: "38px",
    borderRadius: "999px",
    background: "#2563EB",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: "800",
    fontSize: "14px",
  },
  main: {
    flex: 1,
    padding: "24px",
    overflowY: "auto",
  },
};
