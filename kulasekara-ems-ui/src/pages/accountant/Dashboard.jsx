import React, { useEffect, useMemo, useState } from "react";
import AppLayout from "../../components/layout/AppLayout";
import { useNavigate } from "react-router-dom";
import { formatLKR } from "../../utils/salaryUtils";
import { getPayrollSummaryApi } from "../../services/accountantPayrollService";

export default function Dashboard() {
  const navigate = useNavigate();

  // ✅ role protection
  const role = (localStorage.getItem("role") || "ACCOUNTANT").toUpperCase();
  useEffect(() => {
    if (role !== "ACCOUNTANT") navigate("/");
  }, [role, navigate]);

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    employees: 0,
    totalNet: 0,
    totalEpfEtf: 0,
    month: "",
    year: ""
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const now = new Date();
        const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
        const res = await getPayrollSummaryApi({ month: monthStr });

        const summary = res.summary || {};

        setData({
          employees: (res.rows || []).length,
          totalNet: summary.totalNet || 0,
          totalEpfEtf: summary.totalEpfEtf || 0,
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

  const cards = useMemo(() => {
    return [
      { label: "Employees", value: data.employees, hint: "Active employees" },
      { label: "Total Payroll (Net)", value: formatLKR(data.totalNet), hint: `${data.month} ${data.year}` },
      { label: "EPF/ETF Total", value: formatLKR(data.totalEpfEtf), hint: "Emp + Er contrib." },
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
              Overview of payroll, EPF/ETF, and audit status.
            </p>
          </div>

          <div style={styles.quickRow}>
            <button style={styles.btnSecondary} onClick={() => navigate("/accountant/payroll-summary")}>
              Payroll Management
            </button>
            <button style={styles.btnPrimary} onClick={() => navigate("/accountant/epf-etf")}>
              EPF/ETF Reports
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
                title="Payroll Summary"
                desc="View monthly payroll totals & breakdown."
                onClick={() => navigate("/accountant/payroll-summary")}
              />
              <ActionCard
                title="EPF / ETF"
                desc="Manage contributions and generate reports."
                onClick={() => navigate("/accountant/epf-etf")}
              />
              <ActionCard
                title="Bank Withdrawals"
                desc="Track and manage bank salary transfers."
                onClick={() => navigate("/accountant/withdrawals")}
              />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

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
    gridTemplateColumns: "repeat(5, minmax(160px, 1fr))",
    gap: 12,
    marginTop: 10,
    marginBottom: 14,
  },
  card: {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(8px)",
    border: "1px solid rgba(74, 124, 78, 0.15)",
    borderRadius: 16,
    padding: 14,
    boxShadow: "0 6px 18px rgba(74, 124, 78, 0.06)",
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
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(8px)",
    border: "1px solid rgba(74, 124, 78, 0.15)",
    borderRadius: 16,
    overflow: "hidden",
    boxShadow: "0 6px 18px rgba(74, 124, 78, 0.06)",
  },
  panelHeader: { padding: 14, borderBottom: "1px solid rgba(74, 124, 78, 0.1)" },
  panelTitle: { margin: 0, fontSize: 16, fontWeight: 900 },

  actionGrid: {
    padding: 14,
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(160px, 1fr))",
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
