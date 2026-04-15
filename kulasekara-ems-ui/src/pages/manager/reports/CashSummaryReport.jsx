// src/pages/manager/reports/CashSummaryReport.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../../components/layout/AppLayout";

const formatLKR = (n) =>
  new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR" }).format(Number(n || 0));

export default function CashSummaryReport() {
  const [month, setMonth] = useState(getMonthKey(new Date()));
  const [note, setNote] = useState("");

  const data = useMemo(() => makeDummyCashData(month), [month]);
  const navigate = useNavigate();

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
              <button onClick={() => navigate(-1)} style={styles.backBtn}>
                <ArrowLeft size={16} /> Back to Reports
              </button>
              <div style={styles.breadcrumb}>Manager / Financial Analysis</div>
              <h2 style={styles.heading}>Withdrawal vs Paid Summary</h2>
              <p style={styles.subText}>
                Monthly cash control: Withdrawals, salaries paid, and reconciliation.
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
            <div style={{ fontWeight: 800, marginBottom: 8, color: "#1f2937" }}>Difference Reason / Notes (for audit)</div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Example: Remaining cash kept for next week daily wage payouts..."
              style={styles.textarea}
            />
            <div style={{ opacity: 0.7, fontSize: 12, marginTop: 6, color: "#6b7280" }}>
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
  page: { position: "relative", minHeight: "100%", overflow: "hidden" },
  container: { padding: "32px", position: "relative", zIndex: 1, maxWidth: "1600px", margin: "0 auto" },
  breadcrumb: { fontSize: "11px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" },
  topRow: { display: "flex", justifyContent: "space-between", gap: 24, flexWrap: "wrap", alignItems: "flex-end", marginBottom: 32 },
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
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
  },
  kpiCard: {
    background: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    borderRadius: "24px",
    padding: "24px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.02)",
  },
  kpiDanger: { border: "1px solid rgba(220, 38, 38, 0.35)", background: "rgba(254, 242, 242, 0.8)" },
  kpiTitle: { fontSize: "11px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 },
  kpiValue: { fontSize: "22px", fontWeight: 900, color: "#1e293b", marginBottom: 6 },
  kpiHint: { fontSize: "12px", color: "#64748b", fontWeight: 600 },
  noteBox: {
    marginTop: 32,
    background: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    borderRadius: "24px",
    padding: 24,
    boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
  },
  textarea: {
    width: "100%",
    minHeight: 100,
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    padding: 16,
    resize: "vertical",
    outline: "none",
    fontSize: "14px",
    fontWeight: 500,
    color: "#1e293b",
    background: "#fff",
  },
  twoCol: { marginTop: 32, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 },
  panel: {
    background: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    borderRadius: "24px",
    padding: 24,
    boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
    minWidth: 0,
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
  badgePaid: { background: "#DCFCE7", color: "#166534" },
  badgePending: { background: "#FEF3C7", color: "#D97706" },
  actionsRow: { marginTop: 32, display: "flex", gap: 16, flexWrap: "wrap" },
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
};
