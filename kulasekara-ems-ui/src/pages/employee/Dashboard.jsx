// src/pages/employee/EmployeeDashboard.jsx
import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import AppLayout from "../../components/layout/AppLayout";
import { getEmployeeDashboardStats, getRecentActivity as getRecentActivityApi } from "../../services/dashboardService";

function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// ✅ prevent showing "manager" / "employee" as a "name"
function cleanName(name) {
  const n = String(name || "").trim();
  if (!n) return "";

  const bad = ["manager", "employee", "accountant", "admin", "administrator", "user", "role"];
  if (bad.includes(n.toLowerCase())) return "";

  return n;
}

function buildDisplayName(userObj) {
  if (!userObj) return "";

  // prefer proper first/last
  const first = cleanName(userObj.firstName || userObj.first_name);
  const last = cleanName(userObj.lastName || userObj.last_name);
  const full = `${first} ${last}`.trim();
  if (full) return full;

  // other common keys
  const byName = cleanName(userObj.name);
  if (byName) return byName;

  const byUsername = cleanName(userObj.username);
  if (byUsername) return byUsername;

  // email fallback (only if not empty)
  const email = String(userObj.email || "").trim();
  if (email) return email;

  return "";
}


export default function EmployeeDashboard() {
  const employeeIdLS = localStorage.getItem("employee_id") || localStorage.getItem("employeeId") || "";
  const [user, setUser] = useState(() => safeParse(localStorage.getItem("user") || "null"));
  const [fetchedProfile, setFetchedProfile] = useState(null);
  
  const [stats, setStats] = useState({
    presentDays: 0,
    absentDays: 0,
    otHours: 0,
    thisMonthNet: 0,
    pendingIssues: 0,
    approvedLeaves: 0,
  });

  const [recentAttendance, setRecentAttendance] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = safeParse(localStorage.getItem("user") || "null");
    if (u) setUser(u);
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const statsData = await getEmployeeDashboardStats();
      const activityData = await getRecentActivityApi();
      
      setStats(statsData);
      if (statsData.profile) {
        setFetchedProfile(statsData.profile);
      }
      
      setRecentAttendance(activityData.attendance || []);
      setNotifications(activityData.notifications || []);
    } catch (err) {
      console.error("Dashboard data fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const employee = useMemo(() => {
    // Prioritize fetched data from database, fallback to localStorage
    const p = fetchedProfile || user || {};
    
    // build name
    const first = cleanName(p.firstName || p.first_name);
    const last = cleanName(p.lastName || p.last_name);
    const full = `${first} ${last}`.trim() || cleanName(p.name) || cleanName(p.username) || p.email || "Employee";

    return {
      name: full,
      role: "Employee",
      department: p.department_name || p.departmentName || p.department || "—",
      employeeId: p.employee_id || p.employeeId || employeeIdLS || "—",
      email: p.email || "—",
      phone: p.phone || p.contactNo || p.contact_no || "—",
      status: p.status || "Active",
    };
  }, [user, fetchedProfile, employeeIdLS]);

  const quickActions = [
    { title: "View Attendance", subtitle: "Check daily in/out", icon: "🕒", path: "/employee/attendance" },
    { title: "View Payslips", subtitle: "Download salary slips", icon: "📄", path: "/employee/payroll/salary-history" },
    { title: "Request Leave", subtitle: "Send leave request", icon: "📝", path: "/employee/leave" },
    { title: "Raise Issue", subtitle: "Report a concern", icon: "⚠️", path: "/employee/issues/status" },
  ];

  const [isCompact, setIsCompact] = useState(() => window.innerWidth < 1200);
  useEffect(() => {
    const onResize = () => setIsCompact(window.innerWidth < 1200);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const styles = {
    page: { padding: 18 },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 16,
      marginBottom: 14,
      flexWrap: "wrap",
    },
    title: { margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: -0.2 },
    subtitle: { margin: "6px 0 0", fontSize: 13, opacity: 0.85 },

    chip: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: 12,
      borderRadius: 14,
      background: "var(--glass-bg)",
      backdropFilter: "var(--glass-blur)",
      WebkitBackdropFilter: "var(--glass-blur)",
      border: "var(--glass-border)",
      boxShadow: "var(--glass-shadow)",
      minWidth: 280,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 12,
      background: "linear-gradient(135deg, #4a7c4e 0%, #5a8c5e 100%)",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 800,
      textTransform: "uppercase",
      boxShadow: "0 4px 10px rgba(74, 124, 78, 0.2)",
    },
    chipText: { flex: 1, lineHeight: 1.1 },
    chipName: { fontWeight: 800, fontSize: 14 },
    chipMeta: { fontSize: 12, opacity: 0.75, marginTop: 4 },
    status: (ok) => ({
      fontSize: 12,
      fontWeight: 800,
      padding: "6px 10px",
      borderRadius: 999,
      border: "1px solid rgba(74, 124, 78, 0.2)",
      background: ok ? "rgba(74, 124, 78, 0.15)" : "rgba(245,158,11,0.10)",
      borderColor: ok ? "rgba(74, 124, 78, 0.3)" : "rgba(245,158,11,0.25)",
      color: ok ? "#14532d" : "#78350f",
      whiteSpace: "nowrap",
    }),

    kpis: {
      display: "grid",
      gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
      gap: 12,
      margin: "14px 0",
    },
    kpi: {
      background: "var(--glass-bg)",
      backdropFilter: "var(--glass-blur)",
      WebkitBackdropFilter: "var(--glass-blur)",
      border: "var(--glass-border)",
      borderRadius: 16,
      padding: 12,
      boxShadow: "var(--glass-shadow)",
      minHeight: 86,
    },
    kpiLabel: { fontSize: 12, opacity: 0.75, fontWeight: 700 },
    kpiValue: { marginTop: 8, fontSize: 18, fontWeight: 900 },
    kpiHint: { marginTop: 6, fontSize: 12, opacity: 0.7 },

    grid: { display: "grid", gridTemplateColumns: "1.2fr 1.8fr", gap: 12 },

    card: {
      background: "var(--glass-bg)",
      backdropFilter: "var(--glass-blur)",
      WebkitBackdropFilter: "var(--glass-blur)",
      border: "var(--glass-border)",
      borderRadius: 16,
      padding: 14,
      boxShadow: "var(--glass-shadow)",
    },
    cardHead: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 10,
      marginBottom: 12,
      flexWrap: "wrap",
    },
    cardTitle: { margin: 0, fontSize: 14, fontWeight: 900 },
    tag: {
      fontSize: 12,
      fontWeight: 800,
      padding: "6px 10px",
      borderRadius: 999,
      background: "rgba(74, 124, 78, 0.1)",
      border: "1px solid rgba(74, 124, 78, 0.15)",
      color: "#2c5530",
    },
    linkBtn: {
      border: "none",
      background: "transparent",
      fontWeight: 800,
      fontSize: 12,
      cursor: "pointer",
      opacity: 0.85,
      padding: 0,
      color: "#4a7c4e",
    },

    actions: { display: "flex", flexDirection: "column", gap: 10 },
    actionBtn: {
      width: "100%",
      display: "flex",
      gap: 10,
      alignItems: "center",
      borderRadius: 14,
      padding: 12,
      border: "1px solid rgba(74, 124, 78, 0.15)",
      background: "rgba(74, 124, 78, 0.04)",
      cursor: "pointer",
      transition: "transform 0.08s ease, background 0.12s ease",
      textAlign: "left",
    },
    actionIcon: {
      width: 36,
      height: 36,
      borderRadius: 12,
      background: "rgba(74, 124, 78, 0.1)",
      color: "#4a7c4e",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 18,
      flexShrink: 0,
    },
    actionText: { flex: 1 },
    actionTitle: { fontWeight: 900, fontSize: 13 },
    actionSub: { fontSize: 12, opacity: 0.75, marginTop: 2 },
    actionArrow: { fontSize: 20, opacity: 0.6 },

    tableWrap: { overflow: "auto", borderRadius: 12, border: "1px solid rgba(74, 124, 78, 0.15)" },
    table: { width: "100%", borderCollapse: "collapse", minWidth: 520 },
    th: {
      padding: "10px 12px",
      fontSize: 12,
      fontWeight: 900,
      background: "rgba(74, 124, 78, 0.04)",
      borderBottom: "1px solid rgba(74, 124, 78, 0.1)",
      textAlign: "left",
      whiteSpace: "nowrap",
    },
    td: {
      padding: "10px 12px",
      fontSize: 12,
      borderBottom: "1px solid rgba(74, 124, 78, 0.1)",
      textAlign: "left",
      whiteSpace: "nowrap",
    },

    pill: (type) => {
      const base = {
        display: "inline-flex",
        padding: "5px 10px",
        fontSize: 12,
        fontWeight: 800,
        borderRadius: 999,
        border: "1px solid rgba(74, 124, 78, 0.15)",
        background: "rgba(74, 124, 78, 0.05)",
      };
      if (type === "ok")
        return { ...base, background: "rgba(74, 124, 78, 0.15)", borderColor: "rgba(74, 124, 78, 0.3)", color: "#166534" };
      if (type === "info")
        return { ...base, background: "rgba(59,130,246,0.10)", borderColor: "rgba(59,130,246,0.25)", color: "#1e40af" };
      if (type === "error")
        return { ...base, background: "rgba(239,68,68,0.10)", borderColor: "rgba(239,68,68,0.25)", color: "#991b1b" };
      return { ...base, background: "rgba(245,158,11,0.10)", borderColor: "rgba(245,158,11,0.25)", color: "#92400e" };
    },

    profile: { display: "flex", flexDirection: "column", gap: 10 },
    infoRow: {
      display: "flex",
      justifyContent: "space-between",
      gap: 14,
      padding: "10px 12px",
      borderRadius: 12,
      border: "1px solid rgba(74, 124, 78, 0.15)",
      background: "rgba(74, 124, 78, 0.02)",
    },
    infoLabel: { fontSize: 12, fontWeight: 900, opacity: 0.75 },
    infoValue: { fontSize: 12, fontWeight: 800 },

    notiList: { display: "flex", flexDirection: "column", gap: 10 },
    noti: {
      display: "flex",
      gap: 10,
      padding: 10,
      borderRadius: 14,
      border: "1px solid rgba(74, 124, 78, 0.15)",
      background: "rgba(74, 124, 78, 0.02)",
    },
    dot: { width: 10, height: 10, marginTop: 6, borderRadius: "50%", background: "rgba(74, 124, 78, 0.4)" },
    notiBody: { flex: 1 },
    notiTitleRow: { display: "flex", justifyContent: "space-between", gap: 10 },
    notiTitle: { fontWeight: 900, fontSize: 13 },
    notiTime: { fontSize: 12, opacity: 0.7, fontWeight: 700 },
    notiDesc: { marginTop: 3, fontSize: 12, opacity: 0.78 },
  };

  const pillType = (status) => {
    const s = String(status || "").toUpperCase();
    if (s === "PRESENT") return "ok";
    if (s === "LATE" || s === "HALF_DAY") return "warn";
    if (s === "ABSENT") return "error";
    return "info";
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  const formatTimeAgo = (timeStr) => {
    if (!timeStr) return "—";
    try {
      const d = new Date(timeStr);
      const now = new Date();
      const diffMs = now - d;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHrs = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHrs / 24);

      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHrs < 24) return `${diffHrs}h ago`;
      return `${diffDays}d ago`;
    } catch {
      return timeStr;
    }
  };

  const navigate = useNavigate();

  if (loading) {
    return (
      <AppLayout>
        <div style={{ padding: 40, textAlign: "center", fontWeight: 800, color: "#4a7c4e" }}>
          Loading Dashboard Data...
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div style={styles.page}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Employee Dashboard</h1>
            <p style={styles.subtitle}>
              Welcome back, <b>{employee.name}</b> — here’s your overview.
            </p>
          </div>

          <div style={styles.chip}>
            <div style={styles.avatar}>{(employee.name || "E").charAt(0).toUpperCase()}</div>
            <div style={styles.chipText}>
              <div style={styles.chipName}>{employee.name}</div>
              <div style={styles.chipMeta}>
                {employee.department} • {employee.employeeId}
              </div>
            </div>
            <span style={styles.status(employee.status === "Active")}>{employee.status}</span>
          </div>
        </div>

        <div
          style={{
            ...styles.kpis,
            gridTemplateColumns: isCompact ? "repeat(3, minmax(0, 1fr))" : "repeat(6, minmax(0, 1fr))",
          }}
        >
          <Kpi styles={styles} label="Present Days" value={stats.presentDays} hint="This month" />
          <Kpi styles={styles} label="Absent Days" value={stats.absentDays} hint="This month" />
          <Kpi styles={styles} label="OT Hours" value={stats.otHours} hint="This month" />
          <Kpi
            styles={styles}
            label="Net Salary (Est.)"
            value={`Rs ${Number(stats.thisMonthNet || 0).toLocaleString()}`}
            hint="This month"
          />
          <Kpi styles={styles} label="Pending Issues" value={stats.pendingIssues} hint="Awaiting review" />
          <Kpi styles={styles} label="Approved Leaves" value={stats.approvedLeaves} hint="This month" />
        </div>

        <div style={{ ...styles.grid, gridTemplateColumns: isCompact ? "1fr" : "1.2fr 1.8fr" }}>
          <div style={styles.card}>
            <div style={styles.cardHead}>
              <h2 style={styles.cardTitle}>Quick Actions</h2>
              <span style={styles.tag}>Self Service</span>
            </div>

            <div style={styles.actions}>
              {quickActions.map((a) => (
                <Link
                  key={a.title}
                  to={a.path || "#"}
                  style={{ textDecoration: "none", width: "100%" }}
                >
                  <button
                    type="button"
                    style={styles.actionBtn}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(74, 124, 78, 0.08)";
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(74, 124, 78, 0.04)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <div style={styles.actionIcon}>{a.icon}</div>
                    <div style={styles.actionText}>
                      <div style={styles.actionTitle}>{a.title}</div>
                      <div style={styles.actionSub}>{a.subtitle}</div>
                    </div>
                    <div style={styles.actionArrow}>›</div>
                  </button>
                </Link>
              ))}
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardHead}>
              <h2 style={styles.cardTitle}>Recent Attendance</h2>
              <Link to="/employee/attendance" style={{ textDecoration: "none" }}>
                <button style={styles.linkBtn} type="button">
                  View all
                </button>
              </Link>
            </div>

            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>In</th>
                    <th style={styles.th}>Out</th>
                    <th style={styles.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAttendance.map((r, idx) => (
                    <tr key={r.date || idx}>
                      <td style={styles.td}>{formatDate(r.date)}</td>
                      <td style={styles.td}>{r.in || "—"}</td>
                      <td style={styles.td}>{r.out || "—"}</td>
                      <td style={styles.td}>
                        <span style={styles.pill(pillType(r.status))}>{r.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardHead}>
              <h2 style={styles.cardTitle}>My Profile</h2>
            </div>

            <div style={styles.profile}>
              <InfoRow styles={styles} label="Role" value="Employee" />
              <InfoRow styles={styles} label="Department" value={employee.department} />
              <InfoRow styles={styles} label="Employee ID" value={employee.employeeId} />
              <InfoRow styles={styles} label="Email" value={employee.email} />
              <InfoRow styles={styles} label="Phone" value={employee.phone} />
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardHead}>
              <h2 style={styles.cardTitle}>Notifications</h2>
              <button style={styles.linkBtn} type="button" onClick={() => alert("UI only: Mark all as read")}>
                Mark all read
              </button>
            </div>

            <div style={styles.notiList}>
              {notifications.length === 0 ? (
                <div style={{ fontSize: 13, opacity: 0.6, textAlign: "center", padding: 20 }}>No recent notifications</div>
              ) : notifications.map((n, idx) => (
                <div key={idx} style={styles.noti}>
                  <div style={styles.dot} />
                  <div style={styles.notiBody}>
                    <div style={styles.notiTitleRow}>
                      <div style={styles.notiTitle}>{n.title}</div>
                      <div style={styles.notiTime}>{formatTimeAgo(n.time)}</div>
                    </div>
                    <div style={styles.notiDesc}>{n.desc || n.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout >
  );
}

function Kpi({ styles, label, value, hint }) {
  return (
    <div style={styles.kpi}>
      <div style={styles.kpiLabel}>{label}</div>
      <div style={styles.kpiValue}>{value}</div>
      <div style={styles.kpiHint}>{hint}</div>
    </div>
  );
}

function InfoRow({ styles, label, value }) {
  return (
    <div style={styles.infoRow}>
      <div style={styles.infoLabel}>{label}</div>
      <div style={styles.infoValue}>{value}</div>
    </div>
  );
}
