// src/pages/employee/EmployeeDashboard.jsx
import React, { useMemo, useState, useEffect } from "react";
import AppLayout from "../../components/layout/AppLayout";

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
  // ✅ live values (employee session)
  // should be EMPLOYEE
  const employeeIdLS = localStorage.getItem("employee_id") || localStorage.getItem("employeeId") || "";

  const [user, setUser] = useState(() => safeParse(localStorage.getItem("user") || "null"));

  // keep in sync after login
  useEffect(() => {
    const u = safeParse(localStorage.getItem("user") || "null");
    if (u) setUser(u);
  }, []);

  // ✅ Build employee object (NO MOCK NAME)
  const employee = useMemo(() => {
    const displayName = buildDisplayName(user);

    // If user data is wrong (example: still contains "manager"), force a safe fallback
    const finalName = displayName || "Employee";

    return {
      name: finalName,
      role: "Employee", // always employee label in employee dashboard
      department: user?.department || user?.departmentName || user?.department_name || "—",
      employeeId: user?.employeeId || user?.employee_id || user?.employeeID || employeeIdLS || "—",
      email: user?.email || "—",
      phone: user?.phone || user?.contactNo || user?.contact_no || "—",
      status: user?.status || "Active",
    };
  }, [user, employeeIdLS]);

  // UI-only stats (replace with API later)
  const stats = useMemo(
    () => ({
      presentDays: Number(user?.presentDays ?? 18),
      absentDays: Number(user?.absentDays ?? 2),
      otHours: Number(user?.otHours ?? 14.5),
      thisMonthNet: Number(user?.thisMonthNet ?? 86500),
      pendingIssues: Number(user?.pendingIssues ?? 1),
      approvedLeaves: Number(user?.approvedLeaves ?? 2),
    }),
    [user]
  );

  const [recentAttendance] = useState([
    { date: "2026-01-22", in: "08:05", out: "16:10", status: "Present" },
    { date: "2026-01-21", in: "08:11", out: "16:02", status: "Present" },
    { date: "2026-01-20", in: "—", out: "—", status: "Leave" },
    { date: "2026-01-19", in: "08:02", out: "16:25", status: "Present" },
  ]);

  const [notifications] = useState([
    { title: "Payslip Ready", desc: "Your January payslip is available to download.", time: "2h ago" },
    { title: "Attendance Updated", desc: "Your check-in/out has been confirmed.", time: "Yesterday" },
    { title: "Policy Update", desc: "New OT policy effective from next month.", time: "3 days ago" },
  ]);

  const quickActions = [
    { title: "View Attendance", subtitle: "Check daily in/out", icon: "🕒" },
    { title: "View Payslips", subtitle: "Download salary slips", icon: "📄" },
    { title: "Request Leave", subtitle: "Send leave request", icon: "📝" },
    { title: "Raise Issue", subtitle: "Report a concern", icon: "⚠️" },
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
      background: "#fff",
      border: "1px solid rgba(15,23,42,0.08)",
      boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
      minWidth: 280,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 12,
      background: "rgba(15,23,42,0.06)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 800,
      textTransform: "uppercase",
    },
    chipText: { flex: 1, lineHeight: 1.1 },
    chipName: { fontWeight: 800, fontSize: 14 },
    chipMeta: { fontSize: 12, opacity: 0.75, marginTop: 4 },
    status: (ok) => ({
      fontSize: 12,
      fontWeight: 800,
      padding: "6px 10px",
      borderRadius: 999,
      border: "1px solid rgba(15,23,42,0.08)",
      background: ok ? "rgba(34,197,94,0.10)" : "rgba(245,158,11,0.10)",
      borderColor: ok ? "rgba(34,197,94,0.25)" : "rgba(245,158,11,0.25)",
      whiteSpace: "nowrap",
    }),

    kpis: {
      display: "grid",
      gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
      gap: 12,
      margin: "14px 0",
    },
    kpi: {
      background: "#fff",
      border: "1px solid rgba(15,23,42,0.08)",
      borderRadius: 16,
      padding: 12,
      boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
      minHeight: 86,
    },
    kpiLabel: { fontSize: 12, opacity: 0.75, fontWeight: 700 },
    kpiValue: { marginTop: 8, fontSize: 18, fontWeight: 900 },
    kpiHint: { marginTop: 6, fontSize: 12, opacity: 0.7 },

    grid: { display: "grid", gridTemplateColumns: "1.2fr 1.8fr", gap: 12 },

    card: {
      background: "#fff",
      border: "1px solid rgba(15,23,42,0.08)",
      borderRadius: 16,
      padding: 14,
      boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
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
      background: "rgba(15,23,42,0.05)",
      border: "1px solid rgba(15,23,42,0.08)",
    },
    linkBtn: {
      border: "none",
      background: "transparent",
      fontWeight: 800,
      fontSize: 12,
      cursor: "pointer",
      opacity: 0.85,
      padding: 0,
    },

    actions: { display: "flex", flexDirection: "column", gap: 10 },
    actionBtn: {
      width: "100%",
      display: "flex",
      gap: 10,
      alignItems: "center",
      borderRadius: 14,
      padding: 12,
      border: "1px solid rgba(15,23,42,0.08)",
      background: "rgba(15,23,42,0.02)",
      cursor: "pointer",
      transition: "transform 0.08s ease, background 0.12s ease",
      textAlign: "left",
    },
    actionIcon: {
      width: 36,
      height: 36,
      borderRadius: 12,
      background: "rgba(15,23,42,0.06)",
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

    tableWrap: { overflow: "auto", borderRadius: 12, border: "1px solid rgba(15,23,42,0.08)" },
    table: { width: "100%", borderCollapse: "collapse", minWidth: 520 },
    th: {
      padding: "10px 12px",
      fontSize: 12,
      fontWeight: 900,
      background: "rgba(15,23,42,0.03)",
      borderBottom: "1px solid rgba(15,23,42,0.06)",
      textAlign: "left",
      whiteSpace: "nowrap",
    },
    td: {
      padding: "10px 12px",
      fontSize: 12,
      borderBottom: "1px solid rgba(15,23,42,0.06)",
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
        border: "1px solid rgba(15,23,42,0.10)",
        background: "rgba(15,23,42,0.03)",
      };
      if (type === "ok")
        return { ...base, background: "rgba(34,197,94,0.10)", borderColor: "rgba(34,197,94,0.25)" };
      if (type === "info")
        return { ...base, background: "rgba(59,130,246,0.10)", borderColor: "rgba(59,130,246,0.25)" };
      return { ...base, background: "rgba(245,158,11,0.10)", borderColor: "rgba(245,158,11,0.25)" };
    },

    profile: { display: "flex", flexDirection: "column", gap: 10 },
    infoRow: {
      display: "flex",
      justifyContent: "space-between",
      gap: 14,
      padding: "10px 12px",
      borderRadius: 12,
      border: "1px solid rgba(15,23,42,0.08)",
      background: "rgba(15,23,42,0.02)",
    },
    infoLabel: { fontSize: 12, fontWeight: 900, opacity: 0.75 },
    infoValue: { fontSize: 12, fontWeight: 800 },

    notiList: { display: "flex", flexDirection: "column", gap: 10 },
    noti: {
      display: "flex",
      gap: 10,
      padding: 10,
      borderRadius: 14,
      border: "1px solid rgba(15,23,42,0.08)",
      background: "rgba(15,23,42,0.02)",
    },
    dot: { width: 10, height: 10, marginTop: 6, borderRadius: "50%", background: "rgba(15,23,42,0.30)" },
    notiBody: { flex: 1 },
    notiTitleRow: { display: "flex", justifyContent: "space-between", gap: 10 },
    notiTitle: { fontWeight: 900, fontSize: 13 },
    notiTime: { fontSize: 12, opacity: 0.7, fontWeight: 700 },
    notiDesc: { marginTop: 3, fontSize: 12, opacity: 0.78 },
  };

  const pillType = (status) => {
    if (status === "Present") return "ok";
    if (status === "Leave") return "info";
    return "warn";
  };

  // ✅ (Optional) quick visible debug, remove later
  // console.log("role:", role, "user:", user);

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
                <button
                  key={a.title}
                  type="button"
                  style={styles.actionBtn}
                  onClick={() => alert(`UI only: ${a.title}`)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(15,23,42,0.04)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(15,23,42,0.02)";
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
              ))}
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardHead}>
              <h2 style={styles.cardTitle}>Recent Attendance</h2>
              <button style={styles.linkBtn} type="button" onClick={() => alert("UI only: View all attendance")}>
                View all
              </button>
            </div>

            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Check In</th>
                    <th style={styles.th}>Check Out</th>
                    <th style={styles.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAttendance.map((r) => (
                    <tr key={r.date}>
                      <td style={styles.td}>{r.date}</td>
                      <td style={styles.td}>{r.in}</td>
                      <td style={styles.td}>{r.out}</td>
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
              {notifications.map((n) => (
                <div key={n.title} style={styles.noti}>
                  <div style={styles.dot} />
                  <div style={styles.notiBody}>
                    <div style={styles.notiTitleRow}>
                      <div style={styles.notiTitle}>{n.title}</div>
                      <div style={styles.notiTime}>{n.time}</div>
                    </div>
                    <div style={styles.notiDesc}>{n.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
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
