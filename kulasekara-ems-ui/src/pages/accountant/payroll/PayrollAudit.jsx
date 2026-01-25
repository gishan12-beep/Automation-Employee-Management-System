import React from "react";
import AppLayout from "../../../components/layout/AppLayout";
import { useNavigate } from "react-router-dom";

export default function Reports() {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div style={styles.page}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>Reports</h2>
            <p style={styles.subtitle}>Generate payroll and EPF/ETF related reports.</p>
          </div>
        </div>

        <div style={styles.grid}>
          <ReportCard
            title="Payroll Summary"
            desc="Monthly payroll totals and employee breakdown."
            onClick={() => navigate("/accountant/reports/payroll-summary")}
          />
          <ReportCard
            title="Contribution Reports"
            desc="EPF/ETF reports for selected period."
            onClick={() => navigate("/accountant/epf-etf/contribution-reports")}
          />
          <ReportCard
            title="Payroll Audit Log"
            desc="Review payroll actions and approvals."
            onClick={() => navigate("/accountant/payroll/audit")}
          />
        </div>
      </div>
    </AppLayout>
  );
}

function ReportCard({ title, desc, onClick }) {
  return (
    <div style={styles.card} onClick={onClick} role="button" tabIndex={0}>
      <div style={styles.cardTitle}>{title}</div>
      <div style={styles.cardDesc}>{desc}</div>
      <div style={styles.cardHint}>Open →</div>
    </div>
  );
}

const styles = {
  page: { padding: 18, maxWidth: 1200, margin: "0 auto" },
  header: { display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 14 },
  title: { margin: 0, fontSize: 22, fontWeight: 900 },
  subtitle: { margin: "6px 0 0", opacity: 0.75, fontSize: 13 },

  grid: { display: "grid", gridTemplateColumns: "repeat(3, minmax(240px, 1fr))", gap: 12, marginTop: 10 },
  card: {
    background: "#fff",
    border: "1px solid #eef0f4",
    borderRadius: 16,
    padding: 16,
    cursor: "pointer",
    boxShadow: "0 6px 18px rgba(16,24,40,0.06)",
  },
  cardTitle: { fontSize: 16, fontWeight: 900 },
  cardDesc: { marginTop: 6, opacity: 0.75, fontSize: 13, lineHeight: 1.4 },
  cardHint: { marginTop: 10, fontWeight: 900, opacity: 0.7, fontSize: 13 },
};
