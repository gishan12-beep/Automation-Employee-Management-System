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
      <div style={styles.page}>
        {/* Inline CSS Animations */}
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) translateX(0px); }
            50% { transform: translateY(-20px) translateX(10px); }
          }
          @keyframes floatReverse {
            0%, 100% { transform: translateY(0px) translateX(0px); }
            50% { transform: translateY(20px) translateX(-10px); }
          }
          .floating-circle { position: absolute; border-radius: 50%; pointer-events: none; z-index: 0; }
          .fc-1 { animation: float 20s ease-in-out infinite; background: radial-gradient(circle, rgba(76, 175, 80, 0.08) 0%, transparent 70%); width: 400px; height: 400px; top: -100px; left: -100px; }
          .fc-2 { animation: floatReverse 25s ease-in-out infinite; background: radial-gradient(circle, rgba(56, 142, 60, 0.06) 0%, transparent 70%); width: 350px; height: 350px; bottom: -80px; right: -80px; }
          .fc-3 { animation: float 18s ease-in-out infinite; background: radial-gradient(circle, rgba(67, 160, 71, 0.05) 0%, transparent 70%); width: 250px; height: 250px; top: 20%; right: 10%; }
        `}</style>

        {/* Animated background elements */}
        <div className="floating-circle fc-1"></div>
        <div className="floating-circle fc-2"></div>
        <div className="floating-circle fc-3"></div>

        <div style={styles.container}>
          <div style={styles.headerRow}>
            <div>
              <h2 style={styles.heading}>Reports</h2>
              <p style={styles.subText}>
                Choose a report category.
              </p>
            </div>
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

            <div style={styles.card} onClick={() => navigate("/manager/reports/payroll")}>
              <div style={styles.cardTitle}>Payroll Reports</div>
              <div style={styles.cardDesc}>
                Monthly payroll summary, employee-wise salary, overtime & incentives.
              </div>
              <div style={styles.cardAction}>Open →</div>
            </div>

            <div style={styles.card} onClick={() => navigate("/manager/reports/attendance")}>
              <div style={styles.cardTitle}>Attendance Reports</div>
              <div style={styles.cardDesc}>
                Monthly attendance, late/absent trends, daily wage work output.
              </div>
              <div style={styles.cardAction}>Open →</div>
            </div>

            <div style={styles.card} onClick={() => navigate("/manager/reports/epf")}>
              <div style={styles.cardTitle}>EPF / ETF Reports</div>
              <div style={styles.cardDesc}>
                Contribution totals, employee-wise contribution report, compliance exports.
              </div>
              <div style={styles.cardAction}>Open →</div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

const styles = {
  page: { position: "relative", minHeight: "100%", overflow: "hidden" },
  container: { padding: 24, position: "relative", zIndex: 1 },
  headerRow: { marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" },
  heading: { margin: 0, fontSize: 26, fontWeight: 800, color: "#2c5530" },
  subText: { marginTop: 6, marginBottom: 0, opacity: 0.8, color: "#4b5563" },

  tabRow: { display: "flex", gap: 10, flexWrap: "wrap", margin: "20px 0" },
  tabBtn: {
    border: "1px solid rgba(74, 124, 78, 0.2)",
    background: "rgba(255, 255, 255, 0.6)",
    padding: "10px 16px",
    borderRadius: 20,
    cursor: "pointer",
    fontWeight: 700,
    color: "#374151",
    transition: "all 0.2s",
    backdropFilter: "blur(4px)",
  },
  tabBtnActive: {
    background: "linear-gradient(135deg, #4a7c4e 0%, #5a8c5e 100%)",
    color: "#fff",
    border: "none",
    boxShadow: "0 4px 6px -1px rgba(74, 124, 78, 0.3)",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 20,
  },
  card: {
    background: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    borderRadius: 18,
    padding: 24,
    cursor: "pointer",
    boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  cardTitle: { fontSize: 18, fontWeight: 800, marginBottom: 8, color: "#111827" },
  cardDesc: { opacity: 0.75, lineHeight: 1.5, minHeight: 48, color: "#4b5563", fontSize: 14 },
  cardAction: { marginTop: 16, fontWeight: 800, color: "#2c5530", fontSize: 14 },
};
