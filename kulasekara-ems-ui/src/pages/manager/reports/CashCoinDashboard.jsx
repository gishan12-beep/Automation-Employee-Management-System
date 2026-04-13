// src/pages/manager/reports/CashCoinDashboard.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../../components/layout/AppLayout";

const formatLKR = (n) =>
  new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR" }).format(Number(n || 0));

export default function CashCoinDashboard() {
  const navigate = useNavigate();

  const [month, setMonth] = useState(getMonthKey(new Date())); // "YYYY-MM"

  // Dummy data (replace later with API results)
  const data = useMemo(() => makeDummyCashData(month), [month]);

  const kpis = useMemo(() => {
    const cashWithdrawn = data.withdrawals.reduce((s, w) => s + w.amount, 0);
    const cashPaid = data.payouts
      .filter((p) => p.method === "CASH" && p.status === "PAID")
      .reduce((s, p) => s + p.netPay, 0);

    const cashPending = data.payouts
      .filter((p) => p.method === "CASH" && p.status !== "PAID")
      .reduce((s, p) => s + p.netPay, 0);

    const employeesPaidCash = new Set(
      data.payouts.filter((p) => p.method === "CASH" && p.status === "PAID").map((p) => p.employeeId)
    ).size;

    const diff = cashWithdrawn - cashPaid;
    const avgCash = employeesPaidCash > 0 ? cashPaid / employeesPaidCash : 0;

    return { cashWithdrawn, cashPaid, cashPending, diff, employeesPaidCash, avgCash };
  }, [data]);

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
          .fc-1 { animation: float 20s ease-in-out infinite; background: radial-gradient(circle, rgba(76, 175, 80, 0.08) 0%, transparent 70%); width: 400px; height: 400px; top: -100px; left: -100px; }
          .fc-2 { animation: floatReverse 25s ease-in-out infinite; background: radial-gradient(circle, rgba(56, 142, 60, 0.06) 0%, transparent 70%); width: 350px; height: 350px; bottom: -80px; right: -80px; }
          .fc-3 { animation: float 18s ease-in-out infinite; background: radial-gradient(circle, rgba(67, 160, 71, 0.05) 0%, transparent 70%); width: 250px; height: 250px; top: 20%; right: 10%; }
        `}</style>

        {/* Animated background elements */}
        <div className="floating-circle fc-1"></div>
        <div className="floating-circle fc-2"></div>
        <div className="floating-circle fc-3"></div>

        <div style={styles.container}>
          <div style={styles.topRow}>
            <div>
              <h2 style={styles.heading}>Cash / Coin Reports</h2>
              <p style={styles.subText}>
                Track cash withdrawals, cash salary payouts, pending cash, and monthly differences.
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
                    {data.withdrawals.slice(0, 5).map((w) => (
                      <tr key={w.id}>
                        <td style={styles.td}>{w.date}</td>
                        <td style={styles.td}>{w.bankRef}</td>
                        <td style={styles.tdRight}>{formatLKR(w.amount)}</td>
                        <td style={styles.td}>{w.withdrawnBy}</td>
                      </tr>
                    ))}
                    {data.withdrawals.length === 0 && (
                      <tr>
                        <td style={styles.td} colSpan={4}>
                          No withdrawals for this month.
                        </td>
                      </tr>
                    )}
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
                    {data.payouts
                      .filter((p) => p.method === "CASH")
                      .filter((p) => p.status !== "PAID")
                      .slice(0, 5)
                      .map((p) => (
                        <tr key={p.id}>
                          <td style={styles.td}>{p.employeeName}</td>
                          <td style={styles.td}>{p.salaryType}</td>
                          <td style={styles.tdRight}>{formatLKR(p.netPay)}</td>
                          <td style={styles.td}>
                            <span style={{ ...styles.badge, ...styles.badgePending }}>Pending</span>
                          </td>
                        </tr>
                      ))}
                    {data.payouts.filter((p) => p.method === "CASH" && p.status !== "PAID").length === 0 && (
                      <tr>
                        <td style={styles.td} colSpan={4}>
                          No pending cash payouts 🎉
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

function makeDummyCashData(monthKey) {
  // You can tweak data to match your factory
  const payouts = [
    {
      id: "P1",
      employeeId: "EMP001",
      employeeName: "Kamal Perera",
      salaryType: "Daily Wage",
      netPay: 28500,
      method: "CASH",
      status: "PENDING",
      paidOn: "",
      paidBy: "",
      voucherNo: "",
    },
    {
      id: "P2",
      employeeId: "EMP002",
      employeeName: "Nimal Silva",
      salaryType: "Monthly",
      netPay: 65000,
      method: "BANK",
      status: "PAID",
      paidOn: `${monthKey}-25`,
      paidBy: "Accountant",
      voucherNo: "BANK-TRF-221",
    },
    {
      id: "P3",
      employeeId: "EMP003",
      employeeName: "Saman Jay",
      salaryType: "Daily Wage",
      netPay: 31200,
      method: "CASH",
      status: "PAID",
      paidOn: `${monthKey}-28`,
      paidBy: "Bank Accountant",
      voucherNo: "VCH-0198",
    },
    {
      id: "P4",
      employeeId: "EMP004",
      employeeName: "Chamari Silva",
      salaryType: "Daily Wage",
      netPay: 29500,
      method: "CASH",
      status: "PAID",
      paidOn: `${monthKey}-28`,
      paidBy: "Bank Accountant",
      voucherNo: "VCH-0199",
    },
  ];

  const withdrawals = [
    { id: "W1", date: `${monthKey}-24`, bankRef: "BNK-REF-8123", amount: 100000, withdrawnBy: "Manager" },
    { id: "W2", date: `${monthKey}-28`, bankRef: "BNK-REF-8191", amount: 20000, withdrawnBy: "Manager" },
  ];

  return { payouts, withdrawals };
}

const styles = {
  page: { position: "relative", minHeight: "100%", overflow: "hidden" },
  container: { padding: 24, position: "relative", zIndex: 1 },
  topRow: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 24 },
  heading: { margin: 0, fontSize: 26, fontWeight: 800, color: "#2c5530" },
  subText: { marginTop: 6, marginBottom: 0, opacity: 0.8, color: "#4b5563" },
  backBtn: {
    background: "none",
    border: "none",
    padding: 0,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 700,
    color: "#6b7280",
    display: "flex",
    alignItems: "center",
  },
  backBtn: {
    background: "none",
    border: "none",
    padding: 0,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 700,
    color: "#6b7280",
    display: "flex",
    alignItems: "center",
  },

  filterRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "var(--glass-bg)",
    backdropFilter: "var(--glass-blur)",
    WebkitBackdropFilter: "var(--glass-blur)",
    border: "var(--glass-border)",
    borderRadius: 14,
    padding: "10px 16px",
    boxShadow: "var(--glass-shadow)",
  },
  label: { fontWeight: 700, color: "#374151", fontSize: 13, textTransform: "uppercase" },
  monthInput: { border: "1px solid #e5e7eb", borderRadius: 10, padding: "8px 12px", outline: "none", fontSize: 14, background: "#f9fafb" },

  kpiGrid: {
    marginTop: 20,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 16,
  },
  kpiCard: {
    background: "var(--glass-bg)",
    backdropFilter: "var(--glass-blur)",
    WebkitBackdropFilter: "var(--glass-blur)",
    border: "var(--glass-border)",
    borderRadius: 18,
    padding: 20,
    boxShadow: "var(--glass-shadow)",
    transition: "transform 0.2s",
  },
  kpiDanger: {
    border: "1px solid rgba(220, 38, 38, 0.3)",
    background: "rgba(254, 226, 226, 0.5)",
  },
  kpiTitle: { fontWeight: 700, color: "#6b7280", fontSize: 13, textTransform: "uppercase", marginBottom: 8 },
  kpiValue: { fontSize: "18px", fontWeight: 700, color: "#111827", marginBottom: 4 },
  kpiHint: { fontSize: 12, color: "#6b7280", fontWeight: 600 },

  actionsRow: { marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" },
  primaryBtn: {
    background: "linear-gradient(135deg, #4a7c4e 0%, #5a8c5e 100%)",
    color: "#fff",
    border: "none",
    padding: "12px 24px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 700,
    boxShadow: "0 4px 12px rgba(74, 124, 78, 0.25)",
    fontSize: 14,
  },
  secondaryBtn: {
    background: "white",
    border: "1px solid #d1d5db",
    padding: "12px 20px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 600,
    color: "#374151",
    fontSize: 14,
  },

  twoCol: { marginTop: 24, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: 20 },
  panel: {
    background: "var(--glass-bg)",
    backdropFilter: "var(--glass-blur)",
    WebkitBackdropFilter: "var(--glass-blur)",
    border: "var(--glass-border)",
    borderRadius: 18,
    padding: 20,
    boxShadow: "var(--glass-shadow)",
  },
  panelTitle: { fontWeight: 800, marginBottom: 16, fontSize: 16, color: "#1f2937" },
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "separate", borderSpacing: "0 4px" },
  th: { textAlign: "left", padding: "12px 16px", fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase" },
  thRight: { textAlign: "right", padding: "12px 16px", fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase" },
  td: { padding: "12px 16px", background: "#f9fafb", fontSize: 14, color: "#374151", firstOfType: { borderRadius: "8px 0 0 8px" }, lastOfType: { borderRadius: "0 8px 8px 0" } },
  tdRight: { padding: "12px 16px", textAlign: "right", background: "#f9fafb", fontSize: 14, fontWeight: 700, color: "#111827", lastOfType: { borderRadius: "0 8px 8px 0" } },
  badge: { padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700 },
  badgePending: { background: "#FEF3C7", color: "#D97706" },
};
