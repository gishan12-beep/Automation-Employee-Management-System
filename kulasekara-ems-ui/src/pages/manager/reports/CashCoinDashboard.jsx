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
          <KpiCard title="Cash Withdrawn (Month)" value={formatLKR(kpis.cashWithdrawn)} hint="From bank withdrawals" />
          <KpiCard title="Cash Salaries Paid (Month)" value={formatLKR(kpis.cashPaid)} hint="Paid by cash method" />
          <KpiCard title="Cash Pending to Pay" value={formatLKR(kpis.cashPending)} hint="Cash method unpaid items" />
          <KpiCard
            title="Cash Difference"
            value={formatLKR(kpis.diff)}
            hint={risk ? "⚠️ Investigate difference" : "Balanced"}
            danger={risk}
          />
          <KpiCard title="Employees Paid in Cash" value={kpis.employeesPaidCash} hint="Unique employees" />
          <KpiCard title="Avg Cash per Employee" value={formatLKR(kpis.avgCash)} hint="Paid cash / employees" />
        </div>

        {/* Quick actions */}
        <div style={styles.actionsRow}>
          <button style={styles.primaryBtn} onClick={() => navigate("/manager/reports/cash/payouts")}>
            View Cash Salary Payout List
          </button>
          <button style={styles.secondaryBtn} onClick={() => navigate("/manager/reports/cash/summary")}>
            View Withdraw vs Paid Summary
          </button>
          <button
            style={styles.secondaryBtn}
            onClick={() => alert("Export will be added after backend integration")}
          >
            Export Monthly Cash Report
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
                    <th style={styles.th}>Bank Ref</th>
                    <th style={styles.thRight}>Amount</th>
                    <th style={styles.th}>Withdrawn By</th>
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
            <div style={styles.panelTitle}>Cash Payouts (Pending)</div>
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
  container: { padding: 18 },
  topRow: { display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" },
  heading: { margin: 0, fontSize: 22, fontWeight: 900 },
  subText: { marginTop: 6, marginBottom: 0, opacity: 0.75 },

  filterRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "#fff",
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: 14,
    padding: "10px 12px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.04)",
  },
  label: { fontWeight: 800, opacity: 0.8 },
  monthInput: { border: "1px solid rgba(0,0,0,0.12)", borderRadius: 10, padding: "8px 10px" },

  kpiGrid: {
    marginTop: 14,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 12,
  },
  kpiCard: {
    background: "#fff",
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: 16,
    padding: 14,
    boxShadow: "0 10px 25px rgba(0,0,0,0.04)",
  },
  kpiDanger: {
    border: "1px solid rgba(220, 38, 38, 0.35)",
  },
  kpiTitle: { fontWeight: 900, opacity: 0.8, marginBottom: 8 },
  kpiValue: { fontSize: 22, fontWeight: 900, marginBottom: 6 },
  kpiHint: { opacity: 0.7, fontWeight: 700 },

  actionsRow: { marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" },
  primaryBtn: {
    background: "#111827",
    color: "#fff",
    border: "none",
    padding: "10px 12px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 900,
  },
  secondaryBtn: {
    background: "#fff",
    border: "1px solid rgba(0,0,0,0.12)",
    padding: "10px 12px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 900,
  },

  twoCol: { marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  panel: {
    background: "#fff",
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: 16,
    padding: 14,
    boxShadow: "0 10px 25px rgba(0,0,0,0.04)",
    minWidth: 0,
  },
  panelTitle: { fontWeight: 900, marginBottom: 10 },
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "10px 8px", fontSize: 12, opacity: 0.75, borderBottom: "1px solid rgba(0,0,0,0.08)" },
  thRight: { textAlign: "right", padding: "10px 8px", fontSize: 12, opacity: 0.75, borderBottom: "1px solid rgba(0,0,0,0.08)" },
  td: { padding: "10px 8px", borderBottom: "1px solid rgba(0,0,0,0.06)" },
  tdRight: { padding: "10px 8px", textAlign: "right", borderBottom: "1px solid rgba(0,0,0,0.06)" },
  badge: { padding: "6px 10px", borderRadius: 999, fontSize: 12, fontWeight: 900 },
  badgePending: { background: "rgba(245, 158, 11, 0.15)" },
};
