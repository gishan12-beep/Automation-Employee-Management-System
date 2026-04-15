// src/pages/manager/reports/CashSalaryPayoutReport.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../../components/layout/AppLayout";

const formatLKR = (n) =>
  new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR" }).format(Number(n || 0));

export default function CashSalaryPayoutReport() {
  const [month, setMonth] = useState(getMonthKey(new Date()));
  const [status, setStatus] = useState("ALL"); // ALL | PAID | PENDING
  const [paidBy, setPaidBy] = useState("ALL"); // ALL | Manager | Bank Accountant
  const [q, setQ] = useState("");

  const data = useMemo(() => makeDummyCashData(month), [month]);
  const navigate = useNavigate();

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
          <div style={styles.headerRow}>
            <div>
              <button onClick={() => navigate(-1)} style={styles.backBtn}>
                <ArrowLeft size={16} /> Back to Reports
              </button>
              <div style={styles.breadcrumb}>Manager / Financial Analysis</div>
              <h2 style={styles.heading}>Cash Salary Payouts</h2>
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
  page: { position: "relative", minHeight: "100%", overflow: "hidden" },
  container: { padding: "32px", position: "relative", zIndex: 1, maxWidth: "1600px", margin: "0 auto" },
  breadcrumb: { fontSize: "11px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" },
  headerRow: { display: "flex", justifyContent: "space-between", gap: 24, flexWrap: "wrap", alignItems: "flex-end", marginBottom: 32 },
  heading: { margin: 0, fontSize: "32px", fontWeight: 900, color: "#2c5530", letterSpacing: "-0.02em" },
  subText: { marginTop: 4, marginBottom: 0, fontSize: "15px", color: "#64748b", fontWeight: 500 },
  backBtn: {
    background: "none",
    border: "none",
    padding: 0,
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 700,
    color: "#64748b",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "12px"
  },
  actions: { display: "flex", gap: 12 },
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
  filters: {
    marginTop: 20,
    display: "flex",
    gap: 16,
    flexWrap: "wrap",
    background: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    borderRadius: "20px",
    padding: "20px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
    alignItems: "flex-end"
  },
  filterItem: { minWidth: 200, display: "flex", flexDirection: "column", gap: 8 },
  label: { fontSize: "11px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" },
  input: { 
    height: "44px", 
    borderRadius: "14px", 
    border: "1px solid #e2e8f0", 
    padding: "0 16px", 
    fontSize: "14px", 
    fontWeight: 600, 
    color: "#1e293b", 
    background: "#fff", 
    outline: "none" 
  },
  summaryStrip: {
    marginTop: 24,
    display: "flex",
    gap: 16,
    flexWrap: "wrap",
  },
  summaryItem: {
    background: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    borderRadius: "24px",
    padding: "20px 24px",
    minWidth: 180,
    boxShadow: "0 8px 30px rgba(0,0,0,0.02)",
  },
  summaryLabel: { fontSize: "11px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" },
  summaryValue: { fontSize: "20px", fontWeight: 900, color: "#1e293b", marginTop: 8 },
  panel: {
    marginTop: 32,
    background: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    borderRadius: "24px",
    overflow: "hidden",
    boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
  },
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
  badgePaid: { background: "#DCFCE7", color: "#166534" },
  badgePending: { background: "#FEF3C7", color: "#D97706" },
  smallBtn: {
    padding: "8px 16px", 
    borderRadius: "10px", 
    background: "#fff", 
    color: "#475569", 
    border: "1px solid #e2e8f0", 
    fontWeight: 700, 
    cursor: "pointer", 
    fontSize: "12px",
    marginRight: 8,
    marginBottom: 4,
    transition: "all 0.2s"
  },
  smallBtnPrimary: {
    background: "linear-gradient(135deg, #4a7c4e 0%, #5a8c5e 100%)", 
    color: "#fff", 
    border: "none",
  },
};
