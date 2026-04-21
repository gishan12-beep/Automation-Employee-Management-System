// src/pages/manager/reports/CashCoinDashboard.jsx
import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../../components/layout/AppLayout";
import { getCashPayoutReportApi } from "../../../services/reportService";

const formatLKR = (n) =>
  new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR" }).format(Number(n || 0));

export default function CashCoinDashboard() {
  const navigate = useNavigate();

  const [month, setMonth] = useState(getMonthKey(new Date())); // "YYYY-MM"

  const [cashData, setCashData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCashData();
  }, [month]);

  const fetchCashData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [yearStr, monthStr] = month.split("-");
      const res = await getCashPayoutReportApi(parseInt(monthStr, 10), parseInt(yearStr, 10));
      setCashData(res);
    } catch (err) {
      console.error("Failed to fetch cash dashboard data:", err);
      setError("Failed to load cash data.");
      setCashData([]);
    } finally {
      setLoading(false);
    }
  };

  const kpis = useMemo(() => {
    // We don't have withdrawals table yet, so 0 for now or fetch if available
    const cashWithdrawn = 0; 
    
    const cashPaid = cashData
      .filter((p) => p.status === "PAID")
      .reduce((s, p) => s + Number(p.net_pay || 0), 0);

    const cashPending = cashData
      .filter((p) => p.status !== "PAID")
      .reduce((s, p) => s + Number(p.net_pay || 0), 0);

    const employeesPaidCash = new Set(
      cashData.filter((p) => p.status === "PAID").map((p) => p.employee_id)
    ).size;

    const diff = cashWithdrawn - cashPaid;
    const avgCash = employeesPaidCash > 0 ? cashPaid / employeesPaidCash : 0;

    return { cashWithdrawn, cashPaid, cashPending, diff, employeesPaidCash, avgCash };
  }, [cashData]);

  const risk = kpis.diff !== 0;

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
          .fc-1 { animation: float 20s ease-in-out infinite; background: radial-gradient(circle, rgba(74, 124, 78, 0.08) 0%, transparent 70%); width: 400px; height: 400px; top: -100px; left: -100px; }
          .fc-2 { animation: floatReverse 25s ease-in-out infinite; background: radial-gradient(circle, rgba(74, 124, 78, 0.06) 0%, transparent 70%); width: 350px; height: 350px; bottom: -80px; right: -80px; }
          .fc-3 { animation: float 18s ease-in-out infinite; background: radial-gradient(circle, rgba(74, 124, 78, 0.05) 0%, transparent 70%); width: 250px; height: 250px; top: 20%; right: 10%; }
        `}</style>

        {/* Animated background elements */}
        <div className="floating-circle fc-1"></div>
        <div className="floating-circle fc-2"></div>
        <div className="floating-circle fc-3"></div>

        <div style={styles.container}>
          <div style={styles.topRow}>
            <div>
              <div style={styles.breadcrumb}>Manager / Financial Analysis</div>
              <h2 style={styles.heading}>Cash & Coin Dashboard</h2>
              <p style={styles.subText}>
                Identify cash withdrawal needs and monitor payout disbursements.
              </p>
            </div>

            <div style={styles.filterRow}>
              <label style={styles.label}>Month</label>
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                style={styles.monthInput}
              />
            </div>
          </div>

          {/* KPI Cards */}
          <div style={styles.kpiGrid}>
            <KpiCard title="Cash Withdrawn" value={formatLKR(kpis.cashWithdrawn)} hint="For this month" />
            <KpiCard title="Cash Paid" value={formatLKR(kpis.cashPaid)} hint="Salaries paid in cash" />
            <KpiCard title="Cash Pending" value={formatLKR(kpis.cashPending)} hint="Unpaid cash salaries" />
            <KpiCard
              title="Difference"
              value={formatLKR(kpis.diff)}
              hint={risk ? "⚠️ Mismatch found" : "Books balanced"}
              danger={risk}
            />
            <KpiCard title="Employees Paid" value={kpis.employeesPaidCash} hint="Unique count" />
            <KpiCard title="Avg Cash Pay" value={formatLKR(kpis.avgCash)} hint="Per employee" />
          </div>

          {/* Quick actions */}
          <div style={styles.actionsRow}>
            <button style={styles.primaryBtn} onClick={() => navigate("/manager/reports/cash/payouts")}>
              View Payout List
            </button>
            <button style={styles.secondaryBtn} onClick={() => navigate("/manager/reports/cash/summary")}>
              Withdraw vs Paid Summary
            </button>
            <button
              style={styles.secondaryBtn}
              onClick={() => alert("Export will be added after backend integration")}
            >
              Export Report
            </button>
          </div>

          {/* Mini Preview tables */}
          <div style={styles.twoCol}>
            <div style={styles.panel}>
              <div style={styles.panelTitle}>Latest Withdrawals</div>
              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Date</th>
                      <th style={styles.th}>Ref</th>
                      <th style={styles.thRight}>Amount</th>
                      <th style={styles.th}>By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Withdrawals temporarily empty until table added */}
                    <tr>
                      <td style={styles.td} colSpan={4}>
                        No withdrawals recorded in system.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div style={styles.panel}>
              <div style={styles.panelTitle}>Pending Cash Payouts</div>
              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Employee</th>
                      <th style={styles.th}>Type</th>
                      <th style={styles.thRight}>Net Pay</th>
                      <th style={styles.th}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cashData
                      .filter((p) => p.status !== "PAID")
                      .slice(0, 5)
                      .map((p) => (
                        <tr key={p.payroll_id}>
                          <td style={styles.td}>{p.first_name} {p.last_name}</td>
                          <td style={styles.td}>{p.department || "N/A"}</td>
                          <td style={styles.tdRight}>{formatLKR(p.net_pay)}</td>
                          <td style={styles.td}>
                            <span style={{ ...styles.badge, ...styles.badgePending }}>Pending</span>
                          </td>
                        </tr>
                      ))}
                    {cashData.filter((p) => p.status !== "PAID").length === 0 && (
                      <tr>
                        <td style={styles.td} colSpan={4}>
                          {loading ? "Loading..." : "No pending cash payouts 🎉"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function KpiCard({ title, value, hint, danger, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        ...styles.kpiCard,
        ...(danger ? styles.kpiDanger : {}),
        textAlign: "left",
        cursor: onClick ? "pointer" : "default",
      }}
    >
      <div style={styles.kpiTitle}>{title}</div>
      <div style={styles.kpiValue}>{value}</div>
      <div style={styles.kpiHint}>{hint}</div>
    </button>
  );
}

function getMonthKey(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${yyyy}-${mm}`;
}

}

const styles = {
  page: { position: "relative", minHeight: "100%", overflow: "hidden" },
  container: { padding: "32px", position: "relative", zIndex: 1, maxWidth: "1600px", margin: "0 auto" },
  breadcrumb: { fontSize: "11px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" },
  topRow: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 32 },
  heading: { margin: 0, fontSize: "32px", fontWeight: 900, color: "#2c5530", letterSpacing: "-0.02em" },
  subText: { marginTop: 6, marginBottom: 0, fontSize: "15px", color: "#64748b", fontWeight: 500 },
  filterRow: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    background: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    borderRadius: "18px",
    padding: "12px 20px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
  },
  label: { fontSize: "11px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" },
  monthInput: { 
    height: "40px", 
    borderRadius: "12px", 
    border: "1px solid #e2e8f0", 
    padding: "0 14px", 
    fontSize: "14px", 
    fontWeight: 600, 
    color: "#1e293b", 
    background: "#fff", 
    outline: "none" 
  },
  kpiGrid: {
    marginTop: 20,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
  },
  kpiCard: {
    background: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    borderRadius: "24px",
    padding: "24px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.02)",
    transition: "transform 0.2s",
  },
  kpiDanger: {
    border: "1px solid rgba(220, 38, 38, 0.3)",
    background: "rgba(254, 226, 226, 0.5)",
  },
  kpiTitle: { fontSize: "11px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 },
  kpiValue: { fontSize: "22px", fontWeight: 900, color: "#1e293b", marginBottom: 6 },
  kpiHint: { fontSize: "12px", color: "#64748b", fontWeight: 600 },
  actionsRow: { marginTop: 32, display: "flex", gap: 16, flexWrap: "wrap" },
  primaryBtn: {
    padding: "12px 24px", 
    borderRadius: "14px", 
    background: "linear-gradient(135deg, #4a7c4e 0%, #5a8c5e 100%)", 
    color: "#fff", 
    border: "none", 
    fontWeight: 700, 
    cursor: "pointer", 
    boxShadow: "0 8px 20px rgba(74, 124, 78, 0.25)",
    fontSize: "14px",
    transition: "transform 0.2s"
  },
  secondaryBtn: {
    padding: "12px 24px", 
    borderRadius: "14px", 
    background: "#fff", 
    color: "#475569", 
    border: "1px solid #e2e8f0", 
    fontWeight: 700, 
    cursor: "pointer", 
    fontSize: "14px",
    transition: "all 0.2s"
  },
  twoCol: { marginTop: 32, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: 24 },
  panel: {
    background: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    borderRadius: "24px",
    padding: 24,
    boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
  },
  panelTitle: { fontWeight: 800, marginBottom: 20, fontSize: 18, color: "#1f2937" },
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "separate", borderSpacing: 0 },
  th: { 
    textAlign: "left", 
    padding: "16px 20px", 
    fontSize: "11px", 
    fontWeight: 800, 
    color: "#94a3b8", 
    textTransform: "uppercase",
    background: "rgba(248, 250, 252, 0.5)", 
    borderBottom: "1px solid rgba(0,0,0,0.05)" 
  },
  thRight: { 
    textAlign: "right", 
    padding: "16px 20px", 
    fontSize: "11px", 
    fontWeight: 800, 
    color: "#94a3b8", 
    textTransform: "uppercase",
    background: "rgba(248, 250, 252, 0.5)", 
    borderBottom: "1px solid rgba(0,0,0,0.05)" 
  },
  td: { padding: "16px 20px", fontSize: "14px", color: "#475569", borderBottom: "1px solid rgba(0,0,0,0.05)" },
  tdRight: { padding: "16px 20px", textAlign: "right", fontSize: "14px", fontWeight: 700, color: "#1e293b", borderBottom: "1px solid rgba(0,0,0,0.05)" },
  badge: { padding: "6px 12px", borderRadius: "10px", fontSize: "11px", fontWeight: 800, textTransform: "uppercase" },
  badgePending: { background: "#FEF3C7", color: "#D97706" },
};
