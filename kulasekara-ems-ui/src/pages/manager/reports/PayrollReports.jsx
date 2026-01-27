// src/pages/manager/reports/PayrollReports.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../../components/layout/AppLayout";

const formatLKR = (n) =>
  new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR" }).format(Number(n || 0));

export default function PayrollReports() {
  const [month, setMonth] = useState(getMonthKey(new Date()));
  const [department, setDepartment] = useState("ALL");
  const [q, setQ] = useState("");

  const data = useMemo(() => makeDummyPayroll(month), [month]);
  const navigate = useNavigate();

  const rows = useMemo(() => {
    let list = [...data.employeePayroll];

    if (department !== "ALL") list = list.filter((r) => r.department === department);

    if (q.trim()) {
      const s = q.trim().toLowerCase();
      list = list.filter(
        (r) =>
          r.employeeId.toLowerCase().includes(s) ||
          r.employeeName.toLowerCase().includes(s) ||
          r.salaryType.toLowerCase().includes(s)
      );
    }

    return list;
  }, [data, department, q]);

  const kpis = useMemo(() => {
    const gross = rows.reduce((s, r) => s + r.grossPay, 0);
    const net = rows.reduce((s, r) => s + r.netPay, 0);
    const ot = rows.reduce((s, r) => s + r.overtimePay, 0);
    const incentives = rows.reduce((s, r) => s + r.incentives, 0);
    const deductions = rows.reduce((s, r) => s + r.deductions, 0);

    const paidCount = rows.filter((r) => r.status === "PAID").length;
    const pendingCount = rows.filter((r) => r.status !== "PAID").length;

    return { gross, net, ot, incentives, deductions, paidCount, pendingCount };
  }, [rows]);

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
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <button onClick={() => navigate(-1)} style={styles.backBtn}>
                  ← Back
                </button>
                <h2 style={styles.heading}>Payroll Reports</h2>
              </div>
              <p style={styles.subText}>
                Monthly payroll summary + employee-wise payroll listing .
              </p>
            </div>

            <div style={styles.actions}>
              <button
                style={styles.secondaryBtn}
                onClick={() => alert("Export will be added ")}
              >
                Export (PDF/Excel)
              </button>
              <button style={styles.secondaryBtn} onClick={() => window.print()}>
                Print
              </button>
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
              <div style={styles.label}>Department</div>
              <select value={department} onChange={(e) => setDepartment(e.target.value)} style={styles.input}>
                <option value="ALL">All</option>
                <option value="Production">Production</option>
                <option value="Packing">Packing</option>
                <option value="peeling">Accounts</option>
              </select>
            </div>

            <div style={{ ...styles.filterItem, flex: 1 }}>
              <div style={styles.label}>Search</div>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by name, ID, salary type..."
                style={styles.input}
              />
            </div>
          </div>

          {/* KPI cards */}
          <div style={styles.kpiGrid}>
            <KpiCard title="Total Gross Payroll" value={formatLKR(kpis.gross)} hint={`Month: ${month}`} />
            <KpiCard title="Total Net Payroll" value={formatLKR(kpis.net)} hint="After deductions" />
            <KpiCard title="Overtime Cost" value={formatLKR(kpis.ot)} hint="Total OT pay" />
            <KpiCard title="Incentives" value={formatLKR(kpis.incentives)} hint="Bonuses/incentives" />
            <KpiCard title="Deductions" value={formatLKR(kpis.deductions)} hint="Loans/No-pay etc." />
            <KpiCard title="Payment Status" value={`${kpis.paidCount} Paid / ${kpis.pendingCount} Pending`} hint="Payroll state" />
          </div>

          {/* Table */}
          <div style={styles.panel}>
            <div style={styles.panelTitle}>Employee-wise Payroll</div>
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Employee</th>
                    <th style={styles.th}>Department</th>
                    <th style={styles.th}>Salary Type</th>
                    <th style={styles.thRight}>Gross</th>
                    <th style={styles.thRight}>Deductions</th>
                    <th style={styles.thRight}>Net</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id}>
                      <td style={styles.td}>
                        <div style={{ fontWeight: 900 }}>{r.employeeName}</div>
                        <div style={{ opacity: 0.7, fontSize: 12 }}>{r.employeeId}</div>
                      </td>
                      <td style={styles.td}>{r.department}</td>
                      <td style={styles.td}>{r.salaryType}</td>
                      <td style={styles.tdRight}>{formatLKR(r.grossPay)}</td>
                      <td style={styles.tdRight}>{formatLKR(r.deductions)}</td>
                      <td style={styles.tdRight}>{formatLKR(r.netPay)}</td>
                      <td style={styles.td}>
                        {r.status === "PAID" ? (
                          <span style={{ ...styles.badge, ...styles.badgePaid }}>Paid</span>
                        ) : (
                          <span style={{ ...styles.badge, ...styles.badgePending }}>Pending</span>
                        )}
                      </td>
                      <td style={styles.td}>
                        <button
                          style={styles.smallBtn}
                          onClick={() => alert("Hook this to Payroll Preview page later")}
                        >
                          View Slip
                        </button>
                      </td>
                    </tr>
                  ))}
                  {rows.length === 0 && (
                    <tr>
                      <td style={styles.td} colSpan={8}>
                        No payroll data for selected filters.
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

function KpiCard({ title, value, hint }) {
  return (
    <div style={styles.kpiCard}>
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

function makeDummyPayroll(monthKey) {
  // later replace with API calls
  const employeePayroll = [
    {
      id: "PR1",
      employeeId: "EMP001",
      employeeName: "Kamal Perera",
      department: "Production",
      salaryType: "Daily Wage",
      overtimePay: 3500,
      incentives: 1000,
      deductions: 500,
      grossPay: 32000,
      netPay: 31500,
      status: "PENDING",
    },
    {
      id: "PR2",
      employeeId: "EMP002",
      employeeName: "Nimal Silva",
      department: "Accounts",
      salaryType: "Monthly",
      overtimePay: 0,
      incentives: 2000,
      deductions: 1500,
      grossPay: 70000,
      netPay: 68500,
      status: "PAID",
    },
    {
      id: "PR3",
      employeeId: "EMP003",
      employeeName: "Chamari Silva",
      department: "Packing",
      salaryType: "Daily Wage",
      overtimePay: 2500,
      incentives: 0,
      deductions: 0,
      grossPay: 30000,
      netPay: 30000,
      status: "PAID",
    },
  ];

  return { month: monthKey, employeePayroll };
}

const styles = {
  page: { position: "relative", minHeight: "100%", overflow: "hidden" },
  container: { padding: 24, position: "relative", zIndex: 1 },
  headerRow: { display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 24 },
  heading: { margin: 0, fontSize: 26, fontWeight: 800, color: "#2c5530" },
  subText: { marginTop: 6, marginBottom: 0, opacity: 0.8, color: "#4b5563" },

  actions: { display: "flex", gap: 10, flexWrap: "wrap" },
  secondaryBtn: {
    background: "#fff",
    border: "1px solid rgba(0,0,0,0.12)",
    padding: "10px 16px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 700,
    color: "#374151",
  },

  filters: {
    marginTop: 20,
    display: "flex",
    gap: 16,
    flexWrap: "wrap",
    background: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    borderRadius: 18,
    padding: 16,
    boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
  },
  filterItem: { minWidth: 200, display: "flex", flexDirection: "column", gap: 8 },
  label: { fontWeight: 700, color: "#374151", fontSize: 13, textTransform: "uppercase" },
  input: { border: "1px solid #e5e7eb", borderRadius: 10, padding: "10px 12px", outline: "none", fontSize: 14, background: "#f9fafb" },

  kpiGrid: {
    marginTop: 20,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 16,
  },
  kpiCard: {
    background: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    borderRadius: 18,
    padding: 20,
    boxShadow: "0 8px 25px rgba(0,0,0,0.03)",
  },
  kpiTitle: { fontWeight: 700, color: "#6b7280", fontSize: 13, textTransform: "uppercase", marginBottom: 8 },
  kpiValue: { fontSize: "18px", fontWeight: 700, color: "#111827", marginBottom: 4 },
  kpiHint: { fontSize: 12, color: "#6b7280", fontWeight: 600 },

  panel: {
    marginTop: 24,
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    borderRadius: 18,
    padding: 24,
    boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
  },
  panelTitle: { fontWeight: 800, marginBottom: 16, fontSize: 18, color: "#1f2937" },
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "separate", borderSpacing: "0 4px" },
  th: { textAlign: "left", padding: "12px 16px", fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase" },
  thRight: { textAlign: "right", padding: "12px 16px", fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase" },
  td: { padding: "12px 16px", background: "#f9fafb", fontSize: 14, color: "#374151", firstOfType: { borderRadius: "8px 0 0 8px" }, lastOfType: { borderRadius: "0 8px 8px 0" }, verticalAlign: "top" },
  tdRight: { padding: "12px 16px", textAlign: "right", background: "#f9fafb", fontSize: 13, fontWeight: 600, color: "#111827", lastOfType: { borderRadius: "0 8px 8px 0" } },

  badge: { padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, display: "inline-block" },
  badgePaid: { background: "#DCFCE7", color: "#166534" },
  badgePending: { background: "#FEF3C7", color: "#D97706" },

  smallBtn: {
    background: "#fff",
    border: "1px solid #d1d5db",
    padding: "6px 12px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 12,
    color: "#374151",
  },
};
