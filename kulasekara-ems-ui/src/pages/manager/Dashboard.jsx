import React from "react";
import AppLayout from "../../components/layout/AppLayout";

function Dashboard() {
  return (
    <AppLayout>
      {/* Page Header */}
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>Manager Dashboard</h1>
          <p style={styles.pageSubtitle}>Overview of your team and operations</p>
        </div>

        <div style={styles.headerActions}>
         
        </div>
      </div>

      {/* Summary Cards */}
      <div style={styles.cardGrid}>
        <div style={styles.summaryCard}>
          <div style={styles.iconBox}>👥</div>
          <div style={styles.cardText}>
            <p style={styles.cardLabel}>Total Employees</p>
            <p style={styles.cardValue}>55</p>
            <p style={styles.cardHint}>Active members</p>
          </div>
        </div>

        <div style={styles.summaryCard}>
          <div style={styles.iconBox}>✓</div>
          <div style={styles.cardText}>
            <p style={styles.cardLabel}>Attendance Today</p>
            <p style={styles.cardValue}>40</p>
            <p style={styles.cardHint}>72% present</p>
          </div>
        </div>

        <div style={styles.summaryCard}>
          <div style={styles.iconBox}>💰</div>
          <div style={styles.cardText}>
            <p style={styles.cardLabel}>Payroll Pending</p>
            <p style={styles.cardValue}>5</p>
            <p style={styles.cardHint}>Awaiting approval</p>
          </div>
        </div>

        <div style={styles.summaryCard}>
          <div style={styles.iconBox}>⚠️</div>
          <div style={styles.cardText}>
            <p style={styles.cardLabel}>Issues Reported</p>
            <p style={styles.cardValue}>3</p>
            <p style={styles.cardHint}>Needs attention</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div style={styles.sectionGrid}>
        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <h3 style={styles.panelTitle}>Payroll Summary</h3>
            <span style={styles.pill}>This Month</span>
          </div>

          <div style={styles.chartArea}>
            <p style={styles.chartText}>Chart visualization area</p>
          </div>
        </div>

        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <h3 style={styles.panelTitle}>Attendance Trends</h3>
            <span style={styles.pill}>Last 30 Days</span>
          </div>

          <div style={styles.chartArea}>
            <p style={styles.chartText}>Chart visualization area</p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default Dashboard;

const styles = {
  // Matches the screenshot: soft light page background, white cards, subtle borders
  pageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    marginBottom: 20,
    padding: "22px 22px",
    background: "#ffffff",
    border: "1px solid #e6edf5",
    borderRadius: 16,
    boxShadow: "0 8px 22px rgba(15, 23, 42, 0.06)",
  },
  pageTitle: {
    margin: 0,
    fontSize: 28,
    fontWeight: 800,
    color: "#0f172a",
    letterSpacing: "-0.2px",
  },
  pageSubtitle: {
    margin: "6px 0 0 0",
    fontSize: 13,
    fontWeight: 500,
    color: "#64748b",
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  primaryBtn: {
    border: "none",
    background: "#0f172a", // dark navy like your buttons (Add Employee / Selected)
    color: "#fff",
    padding: "12px 16px",
    borderRadius: 12,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 10px 22px rgba(15, 23, 42, 0.14)",
  },

  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 18,
    marginTop: 18,
  },
  summaryCard: {
    background: "#ffffff",
    border: "1px solid #e6edf5",
    borderRadius: 16,
    padding: 18,
    boxShadow: "0 8px 22px rgba(15, 23, 42, 0.06)",
    display: "flex",
    alignItems: "center",
    gap: 14,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 22,
    background: "#f1f5f9", // soft gray tile like screenshot
    border: "1px solid #e6edf5",
    color: "#0f172a",
    flexShrink: 0,
  },
  cardText: {
    display: "flex",
    flexDirection: "column",
    lineHeight: 1.1,
  },
  cardLabel: {
    margin: 0,
    fontSize: 12,
    fontWeight: 800,
    color: "#64748b",
    letterSpacing: "0.6px",
    textTransform: "uppercase",
  },
  cardValue: {
    margin: "8px 0 6px",
    fontSize: 30,
    fontWeight: 900,
    color: "#0f172a",
  },
  cardHint: {
    margin: 0,
    fontSize: 13,
    fontWeight: 600,
    color: "#94a3b8",
  },

  sectionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
    gap: 18,
    marginTop: 22,
  },
  panel: {
    background: "#ffffff",
    border: "1px solid #e6edf5",
    borderRadius: 16,
    padding: 18,
    boxShadow: "0 8px 22px rgba(15, 23, 42, 0.06)",
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 12,
    borderBottom: "1px solid #eef2f7",
    marginBottom: 14,
  },
  panelTitle: {
    margin: 0,
    fontSize: 16,
    fontWeight: 900,
    color: "#0f172a",
  },
  pill: {
    padding: "8px 12px",
    borderRadius: 999,
    background: "#ecfdf3", // like green Active badge
    border: "1px solid #c7f0d3",
    color: "#166534",
    fontSize: 12,
    fontWeight: 800,
  },
  chartArea: {
    minHeight: 260,
    borderRadius: 14,
    border: "1px dashed #d6dee8",
    background: "#f8fafc",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  chartText: {
    margin: 0,
    color: "#64748b",
    fontSize: 13,
    fontWeight: 700,
  },
};
