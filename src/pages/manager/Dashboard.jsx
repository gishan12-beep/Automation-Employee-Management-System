import React from "react";
import AppLayout from "../../components/layout/AppLayout";

function Dashboard() {
  return (
    <AppLayout>
      <div style={styles.header}>
        <h1 style={styles.title}>Manager Dashboard</h1>
        <p style={styles.subtitle}>Overview of your team and operations</p>
      </div>

      {/* Dashboard Cards */}
      <div style={styles.cardContainer}>
        <div style={styles.card}>
          <div style={styles.cardIcon}>👥</div>
          <h3 style={styles.cardTitle}>Total Employees</h3>
          <p style={styles.cardValue}>25</p>
          <p style={styles.cardSubtext}>Active members</p>
        </div>
        <div style={styles.card}>
          <div style={styles.cardIcon}>✓</div>
          <h3 style={styles.cardTitle}>Attendance Today</h3>
          <p style={styles.cardValue}>20</p>
          <p style={styles.cardSubtext}>80% present</p>
        </div>
        <div style={styles.card}>
          <div style={styles.cardIcon}>💰</div>
          <h3 style={styles.cardTitle}>Payroll Pending</h3>
          <p style={styles.cardValue}>5</p>
          <p style={styles.cardSubtext}>Awaiting approval</p>
        </div>
        <div style={styles.card}>
          <div style={styles.cardIcon}>⚠️</div>
          <h3 style={styles.cardTitle}>Issues Reported</h3>
          <p style={styles.cardValue}>3</p>
          <p style={styles.cardSubtext}>Needs attention</p>
        </div>
      </div>

      {/* Charts Section */}
      <div style={styles.chartContainer}>
        <div style={styles.chartBox}>
          <h3 style={styles.chartTitle}>Payroll Summary</h3>
          <div style={styles.chartPlaceholder}>
            <p style={styles.chartText}>Chart visualization area</p>
          </div>
        </div>
        <div style={styles.chartBox}>
          <h3 style={styles.chartTitle}>Attendance Trends</h3>
          <div style={styles.chartPlaceholder}>
            <p style={styles.chartText}>Chart visualization area</p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default Dashboard;

const styles = {
  header: {
    marginBottom: "32px",
    background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
    border: "1px solid #334155",
  },
  title: {
    color: "#ffffff",
    fontSize: "32px",
    fontWeight: "700",
    margin: "0 0 8px 0",
    letterSpacing: "0.5px",
  },
  subtitle: {
    color: "#cbd5e1",
    fontSize: "14px",
    margin: 0,
    fontWeight: "500",
  },
  cardContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "24px",
    marginTop: "24px",
  },
  card: {
    background: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)",
    borderRadius: "12px",
    padding: "24px",
    textAlign: "center",
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
    border: "1px solid #334155",
    transition: "all 0.3s ease",
    cursor: "pointer",
  },
  cardIcon: {
    fontSize: "32px",
    marginBottom: "12px",
    background: "linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)",
    width: "56px",
    height: "56px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px",
    boxShadow: "0 8px 16px rgba(59, 130, 246, 0.3)",
  },
  cardTitle: {
    color: "#94a3b8",
    fontSize: "14px",
    fontWeight: "600",
    margin: "0 0 12px 0",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  cardValue: {
    color: "#ffffff",
    fontSize: "36px",
    fontWeight: "700",
    margin: "0 0 8px 0",
  },
  cardSubtext: {
    color: "#64748b",
    fontSize: "13px",
    margin: 0,
    fontWeight: "500",
  },
  chartContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
    gap: "24px",
    marginTop: "32px",
  },
  chartBox: {
    background: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)",
    borderRadius: "12px",
    padding: "24px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
    border: "1px solid #334155",
  },
  chartTitle: {
    color: "#ffffff",
    fontSize: "18px",
    fontWeight: "600",
    margin: "0 0 20px 0",
    paddingBottom: "16px",
    borderBottom: "2px solid #334155",
  },
  chartPlaceholder: {
    minHeight: "250px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0f172a",
    borderRadius: "8px",
    border: "2px dashed #475569",
  },
  chartText: {
    color: "#64748b",
    fontSize: "14px",
    fontWeight: "500",
    margin: 0,
  },
};