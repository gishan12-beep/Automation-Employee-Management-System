import React, { useEffect, useMemo, useState } from "react";
import AppLayout from "../../components/layout/AppLayout";
import { useNavigate } from "react-router-dom";
import { formatLKR } from "../../utils/salaryUtils";

export default function Dashboard() {
  const navigate = useNavigate();

  // ✅ role protection (optional)
  const role = (localStorage.getItem("role") || "ACCOUNTANT").toUpperCase();
  useEffect(() => {
    if (role !== "ACCOUNTANT") navigate("/");
  }, [role, navigate]);

  // ✅ mock summary (replace with API)
  const [summary] = useState({
    month: "Jan",
    year: 2026,
    totals: {
      employees: 18,
      totalPayrollNet: 785000,
      totalEPF: 52000,
      totalETF: 12000,
      pendingAudits: 3,
    },
  });

  const cards = useMemo(() => {
    const t = summary.totals;
    return [
      { label: "Employees", value: t.employees, hint: "Active employees" },
      { label: "Total Payroll (Net)", value: formatLKR(t.totalPayrollNet), hint: `${summary.month} ${summary.year}` },
      { label: "EPF Total", value: formatLKR(t.totalEPF), hint: "Employee + Employer" },
      { label: "ETF Total", value: formatLKR(t.totalETF), hint: "ETF contribution" },
      { label: "Pending Audits", value: t.pendingAudits, hint: "Need review" },
    ];
  }, [summary]);

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
            <button style={styles.btnSecondary} onClick={() => navigate("/accountant/payroll/management")}>
              Payroll Management
            </button>
            <button style={styles.btnPrimary} onClick={() => navigate("/accountant/reports")}>
              Reports
            </button>
          </div>
        </div>

        <div style={styles.cardGrid}>
          {cards.map((c) => (
            <div key={c.label} style={styles.card}>
              <div style={styles.cardLabel}>{c.label}</div>
              <div style={styles.cardValue}>{c.value}</div>
              <div style={styles.cardHint}>{c.hint}</div>
            </div>
          ))}
        </div>

        <div style={styles.panelGrid}>
          <div style={styles.panel}>
            <div style={styles.panelHeader}>
              <h3 style={styles.panelTitle}>Quick Actions</h3>
            </div>
            <div style={styles.actionGrid}>
              <ActionCard
                title="Payroll Summary"
                desc="View monthly payroll totals & breakdown."
                onClick={() => navigate("/accountant/reports/payroll-summary")}
              />
              <ActionCard
                title="Payroll Audit"
                desc="Review payroll changes and approvals."
                onClick={() => navigate("/accountant/payroll/audit")}
              />
              <ActionCard
                title="EPF/ETF"
                desc="Manage contributions and generate reports."
                onClick={() => navigate("/accountant/epf-etf/management")}
              />
            </div>
          </div>

          <div style={styles.panel}>
            <div style={styles.panelHeader}>
              <h3 style={styles.panelTitle}>Recent Activity</h3>
            </div>

            <div style={styles.list}>
              {[
                { t: "Payroll processed for Production Dept", d: "Today • 10:20 AM" },
                { t: "EPF report generated", d: "Yesterday • 4:05 PM" },
                { t: "Audit pending for 3 employees", d: "Yesterday • 2:30 PM" },
              ].map((x, i) => (
                <div key={i} style={styles.listItem}>
                  <div style={styles.listTitle}>{x.t}</div>
                  <div style={styles.listMeta}>{x.d}</div>
                </div>
              ))}
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
    background: "#111827",
    color: "#fff",
    padding: "10px 14px",
    borderRadius: 12,
    fontWeight: 800,
    cursor: "pointer",
  },
  btnSecondary: {
    border: "1px solid #e5e7eb",
    background: "#fff",
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
    background: "#fff",
    border: "1px solid #eef0f4",
    borderRadius: 16,
    padding: 14,
    boxShadow: "0 6px 18px rgba(16,24,40,0.06)",
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
    background: "#fff",
    border: "1px solid #eef0f4",
    borderRadius: 16,
    overflow: "hidden",
    boxShadow: "0 6px 18px rgba(16,24,40,0.06)",
  },
  panelHeader: { padding: 14, borderBottom: "1px solid #f0f2f6" },
  panelTitle: { margin: 0, fontSize: 16, fontWeight: 900 },

  actionGrid: {
    padding: 14,
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(160px, 1fr))",
    gap: 12,
  },
  actionCard: {
    border: "1px solid #eef0f4",
    borderRadius: 14,
    padding: 14,
    cursor: "pointer",
    background: "#fff",
  },
  actionTitle: { fontWeight: 900, marginBottom: 6 },
  actionDesc: { opacity: 0.75, fontSize: 13 },

  list: { padding: 14, display: "flex", flexDirection: "column", gap: 10 },
  listItem: { border: "1px solid #eef0f4", borderRadius: 14, padding: 12 },
  listTitle: { fontWeight: 900 },
  listMeta: { opacity: 0.65, fontSize: 12, marginTop: 4 },
};
