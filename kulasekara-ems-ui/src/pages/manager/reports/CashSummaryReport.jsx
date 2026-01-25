// src/pages/manager/reports/CashSummaryReport.jsx
import React, { useMemo, useState } from "react";
import AppLayout from "../../../components/layout/AppLayout";

const formatLKR = (n) =>
  new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR" }).format(Number(n || 0));

export default function CashSummaryReport() {
  const [month, setMonth] = useState(getMonthKey(new Date()));
  const [note, setNote] = useState("");

  const data = useMemo(() => makeDummyCashData(month), [month]);

  const kpis = useMemo(() => {
    const cashWithdrawn = data.withdrawals.reduce((s, w) => s + w.amount, 0);
    const cashPaid = data.payouts
      .filter((p) => p.method === "CASH" && p.status === "PAID")
      .reduce((s, p) => s + p.netPay, 0);
    const cashPending = data.payouts
      .filter((p) => p.method === "CASH" && p.status !== "PAID")
      .reduce((s, p) => s + p.netPay, 0);

    const diff = cashWithdrawn - cashPaid;
    return { cashWithdrawn, cashPaid, cashPending, diff };
  }, [data]);

  const risk = kpis.diff !== 0;

  return (
    <AppLayout>
      <div style={styles.container}>
        <div style={styles.topRow}>
          <div>
            <h2 style={styles.heading}>Withdraw vs Paid Summary</h2>
            <p style={styles.subText}>
              Monthly cash control: Withdrawals, cash salaries paid, pending cash, and difference.
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
          <KpiCard title="Cash Withdrawn" value={formatLKR(kpis.cashWithdrawn)} hint="Total withdrawals for month" />
          <KpiCard title="Cash Paid" value={formatLKR(kpis.cashPaid)} hint="Total paid salaries (cash)" />
          <KpiCard title="Cash Pending" value={formatLKR(kpis.cashPending)} hint="Pending cash payouts" />
          <KpiCard
            title="Difference"
            value={formatLKR(kpis.diff)}
            hint={risk ? "⚠️ Must explain difference" : "Balanced"}
            danger={risk}
          />
        </div>

        <div style={styles.noteBox}>
          <div style={{ fontWeight: 900, marginBottom: 8 }}>Difference Reason / Notes (for audit)</div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Example: Remaining cash kept for next week daily wage payouts..."
            style={styles.textarea}
          />
          <div style={{ opacity: 0.7, fontSize: 12, marginTop: 6 }}>
            (This will be saved to DB later. For now it’s UI only.)
          </div>
        </div>

        <div style={styles.twoCol}>
          <div style={styles.panel}>
            <div style={styles.panelTitle}>Withdrawals</div>
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
                  {data.withdrawals.map((w) => (
                    <tr key={w.id}>
                      <td style={styles.td}>{w.date}</td>
                      <td style={styles.td}>{w.bankRef}</td>
                      <td style={styles.tdRight}>{formatLKR(w.amount)}</td>
                      <td style={styles.td}>{w.withdrawnBy}</td>
                    </tr>
                  ))}
                  {data.withdrawals.length === 0 && (
                    <tr>
                      <td style={styles.td} colSpan={4}>No withdrawals for this month.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div style={styles.panel}>
            <div style={styles.panelTitle}>Cash Salary Payments</div>
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Employee</th>
                    <th style={styles.thRight}>Net Pay</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Voucher</th>
                  </tr>
                </thead>
                <tbody>
                  {data.payouts
                    .filter((p) => p.method === "CASH")
                    .map((p) => (
                      <tr key={p.id}>
                        <td style={styles.td}>
                          <div style={{ fontWeight: 900 }}>{p.employeeName}</div>
                          <div style={{ opacity: 0.7, fontSize: 12 }}>{p.employeeId}</div>
                        </td>
                        <td style={styles.tdRight}>{formatLKR(p.netPay)}</td>
                        <td style={styles.td}>
                          {p.status === "PAID" ? (
                            <span style={{ ...styles.badge, ...styles.badgePaid }}>Paid</span>
                          ) : (
                            <span style={{ ...styles.badge, ...styles.badgePending }}>Pending</span>
                          )}
                        </td>
                        <td style={styles.td}>{p.voucherNo || "-"}</td>
                      </tr>
                    ))}
                  {data.payouts.filter((p) => p.method === "CASH").length === 0 && (
                    <tr>
                      <td style={styles.td} colSpan={4}>No cash payments found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div style={styles.actionsRow}>
          <button style={styles.secondaryBtn} onClick={() => window.print()}>Print</button>
          <button style={styles.secondaryBtn} onClick={() => alert("Export will be added after backend integration")}>
            Export (PDF/Excel)
          </button>
        </div>
      </div>
    </AppLayout>
  );
}

function KpiCard({ title, value, hint, danger }) {
  return (
    <div style={{ ...styles.kpiCard, ...(danger ? styles.kpiDanger : {}) }}>
      <div style={styles.kpiTitle}>{title}</div>
      <div style={styles.kpiValue}>{value}</div>
      <div style={styles.kpiHint}>{hint}</div>
    </div>
  );
}

function getMonthKey(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${yyyy}-${mm}`;
}

function makeDummyCashData(monthKey) {
  const payouts = [
    {
      id: "P1",
      employeeId: "EMP001",
      employeeName: "Kamal Perera",
      netPay: 28500,
      method: "CASH",
      status: "PENDING",
      voucherNo: "",
    },
    {
      id: "P3",
      employeeId: "EMP003",
      employeeName: "Saman Jay",
      netPay: 31200,
      method: "CASH",
      status: "PAID",
      voucherNo: "VCH-0198",
    },
    {
      id: "P4",
      employeeId: "EMP004",
      employeeName: "Chamari Silva",
      netPay: 29500,
      method: "CASH",
      status: "PAID",
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
  kpiDanger: { border: "1px solid rgba(220, 38, 38, 0.35)" },
  kpiTitle: { fontWeight: 900, opacity: 0.8, marginBottom: 8 },
  kpiValue: { fontSize: 22, fontWeight: 900, marginBottom: 6 },
  kpiHint: { opacity: 0.7, fontWeight: 700 },

  noteBox: {
    marginTop: 12,
    background: "#fff",
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: 16,
    padding: 14,
    boxShadow: "0 10px 25px rgba(0,0,0,0.04)",
  },
  textarea: {
    width: "100%",
    minHeight: 90,
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.12)",
    padding: 12,
    resize: "vertical",
  },

  twoCol: { marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
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
  td: { padding: "10px 8px", borderBottom: "1px solid rgba(0,0,0,0.06)", verticalAlign: "top" },
  tdRight: { padding: "10px 8px", textAlign: "right", borderBottom: "1px solid rgba(0,0,0,0.06)" },

  badge: { padding: "6px 10px", borderRadius: 999, fontSize: 12, fontWeight: 900, display: "inline-block" },
  badgePaid: { background: "rgba(34,197,94,0.15)" },
  badgePending: { background: "rgba(245,158,11,0.15)" },

  actionsRow: { marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" },
  secondaryBtn: {
    background: "#fff",
    border: "1px solid rgba(0,0,0,0.12)",
    padding: "10px 12px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 900,
  },
};
