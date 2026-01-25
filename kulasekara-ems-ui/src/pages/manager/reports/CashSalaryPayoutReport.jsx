// src/pages/manager/reports/CashSalaryPayoutReport.jsx
import React, { useMemo, useState } from "react";
import AppLayout from "../../../components/layout/AppLayout";

const formatLKR = (n) =>
  new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR" }).format(Number(n || 0));

export default function CashSalaryPayoutReport() {
  const [month, setMonth] = useState(getMonthKey(new Date()));
  const [status, setStatus] = useState("ALL"); // ALL | PAID | PENDING
  const [paidBy, setPaidBy] = useState("ALL"); // ALL | Manager | Bank Accountant
  const [q, setQ] = useState("");

  const data = useMemo(() => makeDummyCashData(month), [month]);

  const rows = useMemo(() => {
    let list = data.payouts.filter((p) => p.method === "CASH");

    if (status !== "ALL") list = list.filter((p) => p.status === status);
    if (paidBy !== "ALL") list = list.filter((p) => (p.paidBy || "") === paidBy);

    if (q.trim()) {
      const s = q.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.employeeId.toLowerCase().includes(s) ||
          p.employeeName.toLowerCase().includes(s) ||
          (p.voucherNo || "").toLowerCase().includes(s)
      );
    }

    return list;
  }, [data, status, paidBy, q]);

  const totals = useMemo(() => {
    const paid = rows.filter((r) => r.status === "PAID").reduce((s, r) => s + r.netPay, 0);
    const pending = rows.filter((r) => r.status !== "PAID").reduce((s, r) => s + r.netPay, 0);
    return { paid, pending, count: rows.length };
  }, [rows]);

  const onExport = () => alert("Export will be added after backend integration");
  const onPrint = () => window.print();

  return (
    <AppLayout>
      <div style={styles.container}>
        <div style={styles.headerRow}>
          <div>
            <h2 style={styles.heading}>Cash Salary Payout Report</h2>
            <p style={styles.subText}>
              List employees paid via cash, pending payments, and voucher/receipt tracking.
            </p>
          </div>

          <div style={styles.actions}>
            <button style={styles.secondaryBtn} onClick={onExport}>Export (PDF/Excel)</button>
            <button style={styles.secondaryBtn} onClick={onPrint}>Print</button>
          </div>
        </div>

        {/* Filters */}
        <div style={styles.filters}>
          <div style={styles.filterItem}>
            <div style={styles.label}>Month</div>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.filterItem}>
            <div style={styles.label}>Status</div>
            <select value={status} onChange={(e) => setStatus(e.target.value)} style={styles.input}>
              <option value="ALL">All</option>
              <option value="PAID">Paid</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>

          <div style={styles.filterItem}>
            <div style={styles.label}>Paid By</div>
            <select value={paidBy} onChange={(e) => setPaidBy(e.target.value)} style={styles.input}>
              <option value="ALL">All</option>
              <option value="Manager">Manager</option>
              <option value="Bank Accountant">Bank Accountant</option>
            </select>
          </div>

          <div style={{ ...styles.filterItem, flex: 1 }}>
            <div style={styles.label}>Search</div>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, ID, voucher..."
              style={styles.input}
            />
          </div>
        </div>

        {/* Summary strip */}
        <div style={styles.summaryStrip}>
          <div style={styles.summaryItem}>
            <div style={styles.summaryLabel}>Rows</div>
            <div style={styles.summaryValue}>{totals.count}</div>
          </div>
          <div style={styles.summaryItem}>
            <div style={styles.summaryLabel}>Paid Total</div>
            <div style={styles.summaryValue}>{formatLKR(totals.paid)}</div>
          </div>
          <div style={styles.summaryItem}>
            <div style={styles.summaryLabel}>Pending Total</div>
            <div style={styles.summaryValue}>{formatLKR(totals.pending)}</div>
          </div>
        </div>

        {/* Table */}
        <div style={styles.panel}>
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Employee</th>
                  <th style={styles.th}>Salary Type</th>
                  <th style={styles.thRight}>Net Pay</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Paid On</th>
                  <th style={styles.th}>Paid By</th>
                  <th style={styles.th}>Voucher No</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id}>
                    <td style={styles.td}>
                      <div style={{ fontWeight: 900 }}>{p.employeeName}</div>
                      <div style={{ opacity: 0.7, fontSize: 12 }}>{p.employeeId}</div>
                    </td>
                    <td style={styles.td}>{p.salaryType}</td>
                    <td style={styles.tdRight}>{formatLKR(p.netPay)}</td>
                    <td style={styles.td}>
                      {p.status === "PAID" ? (
                        <span style={{ ...styles.badge, ...styles.badgePaid }}>Paid</span>
                      ) : (
                        <span style={{ ...styles.badge, ...styles.badgePending }}>Pending</span>
                      )}
                    </td>
                    <td style={styles.td}>{p.paidOn || "-"}</td>
                    <td style={styles.td}>{p.paidBy || "-"}</td>
                    <td style={styles.td}>{p.voucherNo || "-"}</td>
                    <td style={styles.td}>
                      <button
                        style={styles.smallBtn}
                        onClick={() => alert("Hook this to payroll preview later")}
                      >
                        View Payroll
                      </button>
                      {p.status !== "PAID" && (
                        <button
                          style={{ ...styles.smallBtn, ...styles.smallBtnPrimary }}
                          onClick={() => alert("Mark as paid will be added after backend integration")}
                        >
                          Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td style={styles.td} colSpan={8}>
                      No cash payouts found for selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AppLayout>
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
      salaryType: "Daily Wage",
      netPay: 28500,
      method: "CASH",
      status: "PENDING",
      paidOn: "",
      paidBy: "",
      voucherNo: "",
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
    {
      id: "P5",
      employeeId: "EMP005",
      employeeName: "Sunil Fernando",
      salaryType: "Monthly",
      netPay: 55000,
      method: "CASH",
      status: "PAID",
      paidOn: `${monthKey}-26`,
      paidBy: "Manager",
      voucherNo: "VCH-0180",
    },
  ];

  return { payouts };
}

const styles = {
  container: { padding: 18 },
  headerRow: { display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "flex-start" },
  heading: { margin: 0, fontSize: 22, fontWeight: 900 },
  subText: { marginTop: 6, marginBottom: 0, opacity: 0.75 },
  actions: { display: "flex", gap: 10, flexWrap: "wrap" },
  secondaryBtn: {
    background: "#fff",
    border: "1px solid rgba(0,0,0,0.12)",
    padding: "10px 12px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 900,
  },

  filters: {
    marginTop: 14,
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    background: "#fff",
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: 16,
    padding: 12,
    boxShadow: "0 10px 25px rgba(0,0,0,0.04)",
  },
  filterItem: { minWidth: 180, display: "flex", flexDirection: "column", gap: 6 },
  label: { fontWeight: 900, opacity: 0.8, fontSize: 12 },
  input: { border: "1px solid rgba(0,0,0,0.12)", borderRadius: 12, padding: "10px 12px" },

  summaryStrip: {
    marginTop: 12,
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
  },
  summaryItem: {
    background: "#fff",
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: 16,
    padding: "10px 12px",
    minWidth: 160,
    boxShadow: "0 10px 25px rgba(0,0,0,0.04)",
  },
  summaryLabel: { fontWeight: 900, opacity: 0.7, fontSize: 12 },
  summaryValue: { fontWeight: 900, fontSize: 16, marginTop: 4 },

  panel: {
    marginTop: 12,
    background: "#fff",
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: 16,
    padding: 12,
    boxShadow: "0 10px 25px rgba(0,0,0,0.04)",
  },
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "10px 8px", fontSize: 12, opacity: 0.75, borderBottom: "1px solid rgba(0,0,0,0.08)" },
  thRight: { textAlign: "right", padding: "10px 8px", fontSize: 12, opacity: 0.75, borderBottom: "1px solid rgba(0,0,0,0.08)" },
  td: { padding: "10px 8px", borderBottom: "1px solid rgba(0,0,0,0.06)", verticalAlign: "top" },
  tdRight: { padding: "10px 8px", textAlign: "right", borderBottom: "1px solid rgba(0,0,0,0.06)" },

  badge: { padding: "6px 10px", borderRadius: 999, fontSize: 12, fontWeight: 900, display: "inline-block" },
  badgePaid: { background: "rgba(34,197,94,0.15)" },
  badgePending: { background: "rgba(245,158,11,0.15)" },

  smallBtn: {
    background: "#fff",
    border: "1px solid rgba(0,0,0,0.12)",
    padding: "8px 10px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 900,
    marginRight: 8,
    marginBottom: 6,
  },
  smallBtnPrimary: {
    background: "#111827",
    color: "#fff",
    border: "none",
  },
};
