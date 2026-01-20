// src/pages/employee/Dashboard.jsx
import React, { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../components/layout/AppLayout";

function Dashboard() {
  const navigate = useNavigate();

  // ✅ make role check safe (handles "Employee", "EMPLOYEE", etc.)
  const role = (localStorage.getItem("role") || "").toLowerCase();

  // ✅ IMPORTANT: employeeId must be stored at login time
  // e.g. localStorage.setItem("employeeId", "1");
  const employeeId = localStorage.getItem("employeeId");

  // ✅ read removed reason map created by manager remove action
  const removedInfo = useMemo(() => {
    if (!employeeId) return null;
    const removedMap = JSON.parse(localStorage.getItem("kulasekara_removed_employees") || "{}");
    return removedMap[String(employeeId)] || null;
  }, [employeeId]);

  useEffect(() => {
    if (role !== "employee") {
      navigate("/"); // back to login
      return;
    }

    // ✅ If removed, block dashboard usage and show reason
    // (you can change this behavior: allow view only, or force logout)
    if (removedInfo) {
      // Optional: force logout after showing message
      // Keep as-is now (shows banner + blocks actions)
    }
  }, [role, navigate, removedInfo]);

  // Sample data (later replace with API)
  const attendanceToday = { present: 1, absent: 0 };
  const salaryThisMonth = 65000;
  const issues = 2;
  const finalSettlement = 0;

  // ✅ block navigation when removed
  const safeNavigate = (path) => {
    if (removedInfo) return;
    navigate(path);
  };

  return (
    <AppLayout>
      <div style={styles.container}>
        <h2 style={styles.heading}>Employee Dashboard</h2>

        {/* ✅ Removed reason banner */}
        {removedInfo && (
          <div style={styles.removedBanner}>
            <div style={styles.removedTitle}>Account Removed</div>
            <div style={styles.removedText}>
              Your account has been removed by the manager.
            </div>
            <div style={styles.removedReason}>
              <span style={{ fontWeight: 900 }}>Reason:</span> {removedInfo.reason}
            </div>
            {removedInfo.removedAt && (
              <div style={styles.removedDate}>
                Removed at: {new Date(removedInfo.removedAt).toLocaleString()}
              </div>
            )}

            <button
              style={styles.logoutBtn}
              onClick={() => {
                localStorage.removeItem("role");
                localStorage.removeItem("employeeId");
                navigate("/");
              }}
            >
              Logout
            </button>
          </div>
        )}

        {/* Summary Cards */}
        <div style={styles.cardGrid}>
          {/* Attendance */}
          <div
            style={{
              ...styles.card,
              cursor: removedInfo ? "not-allowed" : "pointer",
              opacity: removedInfo ? 0.55 : 1,
            }}
            onClick={() => safeNavigate("/employee/attendance")}
            title={removedInfo ? "Account removed" : "Go to Attendance"}
          >
            <h4 style={styles.cardTitle}>Attendance Today</h4>
            <p style={styles.cardValue}>
              {attendanceToday.present} Present / {attendanceToday.absent} Absent
            </p>
            <small style={styles.cardHint}>
              {removedInfo ? "Disabled" : "Click to open"}
            </small>
          </div>

          {/* Salary Slip */}
          <div
            style={{
              ...styles.card,
              cursor: removedInfo ? "not-allowed" : "pointer",
              opacity: removedInfo ? 0.55 : 1,
            }}
            onClick={() => safeNavigate("/employee/salary-slip")}
            title={removedInfo ? "Account removed" : "Go to Salary Slip"}
          >
            <h4 style={styles.cardTitle}>Salary This Month</h4>
            <p style={styles.cardValue}>Rs. {salaryThisMonth.toLocaleString()}</p>
            <small style={styles.cardHint}>
              {removedInfo ? "Disabled" : "Click to view slip"}
            </small>
          </div>

          {/* Issues */}
          <div
            style={{
              ...styles.card,
              cursor: removedInfo ? "not-allowed" : "pointer",
              opacity: removedInfo ? 0.55 : 1,
            }}
            onClick={() => safeNavigate("/employee/issues")}
            title={removedInfo ? "Account removed" : "Go to Issues"}
          >
            <h4 style={styles.cardTitle}>Open Issues</h4>
            <p style={styles.cardValue}>{issues}</p>
            <small style={styles.cardHint}>
              {removedInfo ? "Disabled" : "Click to open"}
            </small>
          </div>

          {/* Final Settlement */}
          <div
            style={{
              ...styles.card,
              cursor: removedInfo ? "not-allowed" : "pointer",
              opacity: removedInfo ? 0.55 : 1,
            }}
            onClick={() => safeNavigate("/employee/settlement")}
            title={removedInfo ? "Account removed" : "Go to Final Settlement"}
          >
            <h4 style={styles.cardTitle}>Final Settlement</h4>
            <p style={styles.cardValue}>Rs. {finalSettlement}</p>
            <small style={styles.cardHint}>
              {removedInfo ? "Disabled" : "Click to open"}
            </small>
          </div>
        </div>

        {/* Recent Activities */}
        <div style={{ ...styles.section, opacity: removedInfo ? 0.7 : 1 }}>
          <div style={styles.sectionHeader}>
            <h3 style={{ margin: 0 }}>Recent Activities</h3>
            <button
              style={{
                ...styles.refreshBtn,
                cursor: removedInfo ? "not-allowed" : "pointer",
                opacity: removedInfo ? 0.6 : 1,
              }}
              onClick={() => {
                if (removedInfo) return;
                window.location.reload();
              }}
              title={removedInfo ? "Disabled" : "Refresh"}
            >
              Refresh
            </button>
          </div>

          <ul style={styles.list}>
            <li>Checked in at 08:30 AM</li>
            <li>Salary processed for January 2026</li>
            <li>Issue #ISS-005 is Pending</li>
          </ul>
        </div>
      </div>
    </AppLayout>
  );
}

export default Dashboard;

/* --------- STYLES --------- */
const styles = {
  container: {
    padding: "10px",
  },
  heading: {
    color: "#0f172a",
    marginBottom: "16px",
    fontWeight: 900,
  },

  removedBanner: {
    background: "#fffbeb",
    border: "1px solid #fde68a",
    borderRadius: "12px",
    padding: "14px 16px",
    marginBottom: "18px",
    color: "#92400e",
  },
  removedTitle: {
    fontWeight: 1000,
    fontSize: "14px",
    textTransform: "uppercase",
    letterSpacing: "0.6px",
  },
  removedText: {
    marginTop: "6px",
    fontWeight: 700,
  },
  removedReason: {
    marginTop: "10px",
    background: "#fff",
    border: "1px solid #fde68a",
    borderRadius: "10px",
    padding: "10px 12px",
    fontWeight: 700,
    color: "#92400e",
  },
  removedDate: {
    marginTop: "8px",
    fontSize: "12px",
    color: "#92400e",
    opacity: 0.9,
    fontWeight: 700,
  },
  logoutBtn: {
    marginTop: "12px",
    background: "#0f172a",
    color: "#fff",
    border: "1px solid #0f172a",
    padding: "10px 12px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: 900,
  },

  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "18px",
    marginBottom: "30px",
  },
  card: {
    backgroundColor: "#ffffff",
    padding: "18px",
    borderRadius: "12px",
    boxShadow: "0 1px 2px rgba(15,23,42,0.06)",
    textAlign: "left",
    border: "1px solid #e2e8f0",
  },
  cardTitle: {
    margin: 0,
    color: "#0f172a",
    fontWeight: 900,
  },
  cardValue: {
    marginTop: "10px",
    marginBottom: "6px",
    fontWeight: 900,
    color: "#0f172a",
    fontSize: "18px",
  },
  cardHint: {
    color: "#64748b",
    fontWeight: 600,
  },
  section: {
    backgroundColor: "#ffffff",
    padding: "18px",
    borderRadius: "12px",
    boxShadow: "0 1px 2px rgba(15,23,42,0.06)",
    border: "1px solid #e2e8f0",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "12px",
  },
  refreshBtn: {
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    padding: "8px 12px",
    borderRadius: "10px",
    cursor: "pointer",
    color: "#0f172a",
    fontWeight: 900,
  },
  list: {
    margin: 0,
    paddingLeft: "18px",
    color: "#0f172a",
    lineHeight: 1.7,
    fontWeight: 600,
  },
};
