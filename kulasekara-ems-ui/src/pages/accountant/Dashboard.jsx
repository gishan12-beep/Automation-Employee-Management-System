import React, { useEffect, useMemo, useState } from "react";
import AppLayout from "../../components/layout/AppLayout";
import { useNavigate } from "react-router-dom";
import { formatLKR } from "../../utils/salaryUtils";
import { getPayrollSummaryApi } from "../../services/accountantPayrollService";

// Main dashboard component for the accountant role, providing a high-level overview of payroll stats
export default function Dashboard() {
  const navigate = useNavigate();

  // Protects the route by verifying that the logged-in user has the 'ACCOUNTANT' role
  const role = (localStorage.getItem("role") || "ACCOUNTANT").toUpperCase();
  useEffect(() => {
    if (role !== "ACCOUNTANT") navigate("/");
  }, [role, navigate]);

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    employees: 0,
    monthly: 0,
    daily: 0,
    totalNet: 0,
    month: "",
    year: ""
  });

  // Fetches current payroll summary data and updates the dashboard state
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const now = new Date();
        const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
        // Api call specifically designed for accountant's summary view
        const res = await getPayrollSummaryApi({ month: monthStr });

        const summary = res.summary || {};
        const rows = res.rows || [];
        const monthly = rows.filter(r => r.salaryType === "MONTHLY").length;
        const daily = rows.filter(r => r.salaryType === "DAILY").length;

        setData({
          employees: rows.length,
          monthly,
          daily,
          totalNet: summary.totalNet || 0,
          month: now.toLocaleString('default', { month: 'short' }),
          year: now.getFullYear()
        });
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Prepares the display-ready card data based on the fetched statistics
  const cards = useMemo(() => {
    return [
      { label: "Employees", value: `${data.monthly}M | ${data.daily}D`, hint: `Total: ${data.employees}` },
      { label: "Total Payroll (Net)", value: formatLKR(data.totalNet), hint: `${data.month} ${data.year}` },
      { label: "Pending Actions", value: "—", hint: "Awaiting review" },
    ];
  }, [data]);

  return (
    <AppLayout>
      <div style={styles.page}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>Accountant Dashboard</h2>
            <p style={styles.subtitle}>
              Overview of payroll and audit status.
            </p>
          </div>

          <div style={styles.quickRow}>
            <button style={styles.btnPrimary} onClick={() => navigate("/accountant/process-payroll")}>
              Generate Payroll
            </button>
            <button style={styles.btnSecondary} onClick={() => navigate("/accountant/payroll-summary")}>
              Payroll Management
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 20, textAlign: 'center', opacity: 0.7 }}>Loading overview...</div>
        ) : (
          <div style={styles.cardGrid}>
            {cards.map((c) => (
              <div key={c.label} style={styles.card}>
                <div style={styles.cardLabel}>{c.label}</div>
                <div style={styles.cardValue}>{c.value}</div>
                <div style={styles.cardHint}>{c.hint}</div>
              </div>
            ))}
          </div>
        )}

        <div style={styles.panelGrid}>
          <div style={styles.panel}>
            <div style={styles.panelHeader}>
              <h3 style={styles.panelTitle}>Quick Actions</h3>
            </div>
            <div style={styles.actionGrid}>
              <ActionCard
                title="Process Payroll"
                desc="Generate monthly payroll records for all employees."
                onClick={() => navigate("/accountant/process-payroll")}
              />
              <ActionCard
                title="Payroll Summary"
                desc="View monthly payroll totals & breakdown."
                onClick={() => navigate("/accountant/payroll-summary")}
              />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

// Reusable card for dashboard actions with a title and description
function ActionCard({ title, desc, onClick }) {
  return (
    <div style={styles.actionCard} onClick={onClick} role="button" tabIndex={0}>
      <div style={styles.actionTitle}>{title}</div>
      <div style={styles.actionDesc}>{desc}</div>
    </div>
  );
}

const styles = {
  page: { padding: 18, maxWidth: 1200, margin: "0 auto" },
  header: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
    marginBottom: 14,
  },
  title: { margin: 0, fontSize: 22, fontWeight: 900 },
  subtitle: { margin: "6px 0 0", opacity: 0.75, fontSize: 13 },

  quickRow: { display: "flex", gap: 10 },
  btnPrimary: {
    border: "none",
    background: "linear-gradient(135deg, #4a7c4e 0%, #5a8c5e 100%)",
    color: "#fff",
    padding: "10px 14px",
    borderRadius: 12,
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(74, 124, 78, 0.2)",
  },
  btnSecondary: {
    border: "1px solid rgba(74, 124, 78, 0.2)",
    background: "#fff",
    color: "#1f2937",
    padding: "10px 14px",
    borderRadius: 12,
    fontWeight: 800,
    cursor: "pointer",
  },

  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(160px, 1fr))",
    gap: 12,
    marginTop: 10,
    marginBottom: 14,
  },
  card: {
    background: "var(--glass-bg)",
    backdropFilter: "var(--glass-blur)",
    WebkitBackdropFilter: "var(--glass-blur)",
    border: "var(--glass-border)",
    borderRadius: 16,
    padding: 14,
    boxShadow: "var(--glass-shadow)",
  },
  cardLabel: { fontSize: 12, opacity: 0.7, marginBottom: 8 },
  cardValue: { fontSize: 18, fontWeight: 900 },
  cardHint: { fontSize: 12, opacity: 0.6, marginTop: 6 },

  panelGrid: {
    display: "grid",
    gridTemplateColumns: "1.2fr 0.8fr",
    gap: 12,
  },
  panel: {
    background: "var(--glass-bg)",
    backdropFilter: "var(--glass-blur)",
    WebkitBackdropFilter: "var(--glass-blur)",
    border: "var(--glass-border)",
    borderRadius: 16,
    overflow: "hidden",
    boxShadow: "var(--glass-shadow)",
  },
  panelHeader: { padding: 14, borderBottom: "1px solid rgba(74, 124, 78, 0.1)" },
  panelTitle: { margin: 0, fontSize: 16, fontWeight: 900 },

  actionGrid: {
    padding: 14,
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(160px, 1fr))",
    gap: 12,
  },
  actionCard: {
    border: "1px solid rgba(74, 124, 78, 0.15)",
    borderRadius: 14,
    padding: 14,
    cursor: "pointer",
    background: "rgba(74, 124, 78, 0.03)",
  },
  actionTitle: { fontWeight: 900, marginBottom: 6 },
  actionDesc: { opacity: 0.75, fontSize: 13 },

  list: { padding: 14, display: "flex", flexDirection: "column", gap: 10 },
  listItem: { border: "1px solid rgba(74, 124, 78, 0.15)", borderRadius: 14, padding: 12 },
  listTitle: { fontWeight: 900 },
  listMeta: { opacity: 0.65, fontSize: 12, marginTop: 4 },
};
