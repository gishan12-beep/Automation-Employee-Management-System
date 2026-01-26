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
      { name: "Leave Requests", path: "/manager/leaves" },
      { name: "Final Settlement", path: "/manager/settlement" },
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

      // ✅ NEW: Accountant can create/finalize payslips here
      { name: "Payroll", path: "/accountant/payroll" },

      // Keep your existing ones (make sure routes exist)
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
    background: "#F3F6FB",
  },
  sidebar: {
    background: "#FFFFFF",
    transition: "all 0.25s ease-in-out",
    borderRight: "1px solid #E6EDF5",
    boxShadow: "0 2px 16px rgba(15, 23, 42, 0.04)",
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
    gap: "12px",
    padding: "8px 10px 16px 10px",
    borderBottom: "1px solid #EEF2F7",
    marginBottom: "14px",
  },
  brandIcon: {
    width: "44px",
    height: "44px",
    borderRadius: "14px",
    background: "#0F172A",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: 800,
    letterSpacing: "0.5px",
  },
  brandTitle: {
    color: "#0F172A",
    fontSize: "14px",
    fontWeight: 800,
    letterSpacing: "0.6px",
  },
  brandSub: {
    color: "#64748B",
    fontSize: "12px",
    marginTop: "2px",
  },
  roleChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 14px",
    borderRadius: "999px",
    background: "#F6FAFF",
    border: "1px solid #E6F0FF",
    width: "fit-content",
    margin: "0 10px 16px 10px",
    boxShadow: "0 1px 6px rgba(15, 23, 42, 0.04)",
  },
  roleDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    background: "#22C55E",
    boxShadow: "0 0 0 4px rgba(34, 197, 94, 0.12)",
  },
  roleChipText: {
    color: "#0F172A",
    fontSize: "12.5px",
    fontWeight: 700,
  },
  menu: { listStyle: "none", padding: 0, margin: "0 0 14px 0", flex: 1 },
  menuItem: { marginBottom: "8px" },
  link: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    color: "#0F172A",
    textDecoration: "none",
    fontWeight: 700,
    padding: "12px 14px",
    borderRadius: "12px",
    transition: "background 0.18s ease, color 0.18s ease, border 0.18s ease",
    fontSize: "14px",
    margin: "0 6px",
    background: "transparent",
    border: "1px solid transparent",
  },
  linkActive: {
    background: "#EEF5FF",
    color: "#0F172A",
    border: "1px solid #D9E9FF",
    boxShadow: "0 1px 10px rgba(37, 99, 235, 0.08)",
  },
  activePill: {
    width: "10px",
    height: "10px",
    borderRadius: "999px",
    background: "#2563EB",
    boxShadow: "0 0 0 5px rgba(37, 99, 235, 0.16)",
  },
  logoutButton: {
    width: "calc(100% - 12px)",
    margin: "0 6px 6px 6px",
    background: "#FFFFFF",
    color: "#0F172A",
    border: "1px solid #E6EDF5",
    padding: "12px 14px",
    fontWeight: 800,
    cursor: "pointer",
    borderRadius: "12px",
    fontSize: "14px",
    transition: "background 0.18s ease, box-shadow 0.18s ease",
    boxShadow: "0 2px 14px rgba(15, 23, 42, 0.06)",
  },
  mainWrapper: { flex: 1, display: "flex", flexDirection: "column" },
  header: {
    background: "transparent",
    borderBottom: "none",
    padding: "18px 22px 10px 22px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toggleButton: {
    background: "#FFFFFF",
    border: "1px solid #E6EDF5",
    fontSize: "18px",
    cursor: "pointer",
    color: "#0F172A",
    padding: "10px 14px",
    borderRadius: "14px",
    boxShadow: "0 2px 14px rgba(15, 23, 42, 0.06)",
  },
  userSection: { display: "flex", alignItems: "center", gap: "12px" },
  userInfo: { textAlign: "right" },
  welcomeText: {
    fontSize: "12px",
    color: "#64748B",
    margin: "0 0 2px 0",
    fontWeight: 600,
  },
  userName: {
    fontSize: "15px",
    fontWeight: "800",
    color: "#0F172A",
    margin: 0,
    textTransform: "capitalize",
  },
  avatar: {
    width: "42px",
    height: "42px",
    borderRadius: "999px",
    background: "#2563EB",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: "900",
    fontSize: "15px",
    boxShadow: "0 10px 18px rgba(37, 99, 235, 0.18)",
  },
  main: { flex: 1, padding: "18px 22px 28px 22px", overflowY: "auto" },
};
