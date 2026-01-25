// src/pages/manager/reports/ReportsDashboard.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../../components/layout/AppLayout";

export default function ReportsDashboard() {
  const navigate = useNavigate();
  const [active, setActive] = useState("cash"); // cash | payroll | attendance | epf

  const tabs = useMemo(
    () => [
      { key: "cash", label: "Cash / Coin Reports", path: "/manager/reports/cash" },
      { key: "payroll", label: "Payroll Reports", path: "/manager/reports/payroll" },
      { key: "attendance", label: "Attendance Reports", path: "/manager/reports/attendance" },
      { key: "epf", label: "EPF / ETF Reports", path: "/manager/reports/epf" },
    ],
    []
  );

  const go = (tab) => {
  setActive(tab.key);
  navigate(tab.path);
};

  return (
    <AppLayout>
      <div style={styles.container}>
        <div style={styles.headerRow}>
          <h2 style={styles.heading}>Reports</h2>
          <p style={styles.subText}>
            Choose a report category. (Cash/Coin section is ready now.)
          </p>
        </div>

        <div style={styles.tabRow}>
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => go(t)}
              style={{
                ...styles.tabBtn,
                ...(active === t.key ? styles.tabBtnActive : {}),
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div style={styles.grid}>
          <div style={styles.card} onClick={() => navigate("/manager/reports/cash")}>
            <div style={styles.cardTitle}>Cash / Coin Reports</div>
            <div style={styles.cardDesc}>
              Cash payouts, withdrawals vs paid summary, cash pending, audit trail.
            </div>
            <div style={styles.cardAction}>Open →</div>
          </div>

          <div style={{ ...styles.card, opacity: 0.6 }} onClick={() => alert("Coming soon")}>
            <div style={styles.cardTitle}>Payroll Reports</div>
            <div style={styles.cardDesc}>
              Monthly payroll summary, employee-wise salary, overtime & incentives.
            </div>
            <div style={styles.cardAction}>Coming soon</div>
          </div>

          <div style={{ ...styles.card, opacity: 0.6 }} onClick={() => alert("Coming soon")}>
            <div style={styles.cardTitle}>Attendance Reports</div>
            <div style={styles.cardDesc}>
              Monthly attendance, late/absent trends, daily wage work output.
            </div>
            <div style={styles.cardAction}>Coming soon</div>
          </div>

          <div style={{ ...styles.card, opacity: 0.6 }} onClick={() => alert("Coming soon")}>
            <div style={styles.cardTitle}>EPF / ETF Reports</div>
            <div style={styles.cardDesc}>
              Contribution totals, employee-wise contribution report, compliance exports.
            </div>
            <div style={styles.cardAction}>Coming soon</div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

const styles = {
  container: { padding: 18 },
  headerRow: { marginBottom: 14 },
  heading: { margin: 0, fontSize: 22, fontWeight: 800 },
  subText: { marginTop: 6, marginBottom: 0, opacity: 0.75 },

  tabRow: { display: "flex", gap: 10, flexWrap: "wrap", margin: "14px 0" },
  tabBtn: {
    border: "1px solid rgba(0,0,0,0.1)",
    background: "#fff",
    padding: "10px 12px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 700,
  },
  tabBtnActive: { background: "#111827", color: "#fff" },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 14,
  },
  card: {
    background: "#fff",
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: 16,
    padding: 16,
    cursor: "pointer",
    boxShadow: "0 10px 25px rgba(0,0,0,0.04)",
  },
  cardTitle: { fontSize: 16, fontWeight: 900, marginBottom: 6 },
  cardDesc: { opacity: 0.75, lineHeight: 1.4, minHeight: 44 },
  cardAction: { marginTop: 12, fontWeight: 900 },
};
