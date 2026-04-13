// src/pages/manager/reports/PayrollReports.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../../components/layout/AppLayout";
import { 
  ArrowLeft, 
  Download, 
  Printer, 
  Search, 
  Filter, 
  Calendar, 
  Package, 
  Wallet, 
  TrendingUp, 
  Clock, 
  Gift, 
  MinusCircle,
  Eye,
  FileText
} from "lucide-react";

const formatLKR = (n) =>
  new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR", maximumFractionDigits: 0 }).format(Number(n || 0));

export default function PayrollReports() {
  const [month, setMonth] = useState(getMonthKey(new Date()));
  const [department, setDepartment] = useState("ALL");
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const data = useMemo(() => makeDummyPayroll(month), [month]);

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
        <style>{`
          .fade-in { animation: fadeIn 0.4s ease-out forwards; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          .table-row:hover { background: #f8fafc !important; }
        `}</style>

        <div style={styles.container}>
          <button onClick={() => navigate(-1)} style={styles.btnBack}>
            <ArrowLeft size={16} /> Back to Reports
          </button>

          <div style={styles.pageHeader}>
            <div>
              <div style={styles.breadcrumb}>Manager / Financial Analysis</div>
              <h1 style={styles.pageTitle}>Payroll Reports</h1>
              <p style={styles.pageSubtitle}>Consolidated salary summaries and employee-wise payout data</p>
            </div>

            <div style={styles.actions}>
              <button style={styles.btnSecondary} onClick={() => alert("Coming soon...")}>
                <Download size={16} /> Export
              </button>
              <button style={styles.btnSecondary} onClick={() => window.print()}>
                <Printer size={16} /> Print
              </button>
            </div>
          </div>

          {/* Filters */}
          <div style={styles.filters} className="fade-in">
            <div style={styles.filterItem}>
              <label style={styles.label}>Select Month</label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <Calendar size={16} style={{ position: "absolute", left: "12px", color: "#94a3b8" }} />
                <input
                  type="month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  style={{ ...styles.input, paddingLeft: "36px" }}
                />
              </div>
            </div>

            <div style={styles.filterItem}>
              <label style={styles.label}>Department</label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <Package size={16} style={{ position: "absolute", left: "12px", color: "#94a3b8" }} />
                <select 
                  value={department} 
                  onChange={(e) => setDepartment(e.target.value)} 
                  style={{ ...styles.input, paddingLeft: "36px", width: "200px", cursor: "pointer" }}
                >
                  <option value="ALL">All Departments</option>
                  <option value="Production">Production</option>
                  <option value="Packing">Packing</option>
                  <option value="peeling">Accounts</option>
                </select>
              </div>
            </div>

            <div style={{ ...styles.filterItem, flex: 1 }}>
              <label style={styles.label}>Quick Search</label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <Search size={16} style={{ position: "absolute", left: "12px", color: "#94a3b8" }} />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="ID, Name, or Salary Type..."
                  style={{ ...styles.input, paddingLeft: "36px", width: "100%" }}
                />
              </div>
            </div>
          </div>

          {/* KPI grid */}
          <div style={styles.kpiGrid} className="fade-in">
            <KpiCard icon={<Wallet size={18} />} title="Total Gross" value={formatLKR(kpis.gross)} hint="Total before deductions" />
            <KpiCard icon={<TrendingUp size={18} />} title="Total Net" value={formatLKR(kpis.net)} hint="After all deductions" />
            <KpiCard icon={<Clock size={18} />} title="Overtime" value={formatLKR(kpis.ot)} hint="Accumulated OT costs" />
            <KpiCard icon={<Gift size={18} />} title="Incentives" value={formatLKR(kpis.incentives)} hint="Performance bonuses" />
            <KpiCard icon={<MinusCircle size={18} />} title="Deductions" value={formatLKR(kpis.deductions)} hint="Loans & adjustments" />
            <KpiCard icon={<CheckCircle2 size={18} />} title="Completion" value={`${kpis.paidCount} Paid`} hint={`${kpis.pendingCount} Pending`} />
          </div>

          {/* Table */}
          <div style={styles.listCard} className="fade-in">
            <div style={styles.listHeader}>
              <h3 style={styles.listTitle}>Employee Payout Listing</h3>
              <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 700 }}>{rows.length} records</div>
            </div>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Employee</th>
                    <th style={styles.th}>Dept / Type</th>
                    <th style={styles.thRight}>Gross</th>
                    <th style={styles.thRight}>Deductions</th>
                    <th style={styles.thRight}>Net Pay</th>
                    <th style={styles.th}>Status</th>
                    <th style={{ ...styles.th, textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="table-row">
                      <td style={styles.td}>
                        <div style={{ fontSize: "14px", fontWeight: 700, color: "#1e293b" }}>{r.employeeName}</div>
                        <div style={{ fontSize: "11px", color: "#94a3b8" }}>{r.employeeId}</div>
                      </td>
                      <td style={styles.td}>
                        <div style={{ fontWeight: 600 }}>{r.department}</div>
                        <div style={{ fontSize: "11px", color: "#94a3b8" }}>{r.salaryType}</div>
                      </td>
                      <td style={styles.tdRight}>{formatLKR(r.grossPay)}</td>
                      <td style={styles.tdRight}>{formatLKR(r.deductions)}</td>
                      <td style={{ ...styles.tdRight, color: "#2c5530" }}>{formatLKR(r.netPay)}</td>
                      <td style={styles.td}>
                        {r.status === "PAID" ? (
                          <span style={styles.badgePaid}>Paid</span>
                        ) : (
                          <span style={styles.badgePending}>Pending</span>
                        )}
                      </td>
                      <td style={{ ...styles.td, textAlign: "right" }}>
                        <button style={styles.smallBtn} onClick={() => alert("Preview coming soon")}>
                          <Eye size={12} /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                  {rows.length === 0 && (
                    <tr><td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>No data found for selected filters</td></tr>
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

function KpiCard({ icon, title, value, hint }) {
  return (
    <div style={styles.kpiCard}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", color: "#94a3b8" }}>
        {icon}
        <div style={styles.kpiLabel}>{title}</div>
      </div>
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
  const employeePayroll = [
    { id: "PR1", employeeId: "EMP001", employeeName: "Kamal Perera", department: "Production", salaryType: "Daily Wage", overtimePay: 3500, incentives: 1000, deductions: 500, grossPay: 32000, netPay: 31500, status: "PENDING" },
    { id: "PR2", employeeId: "EMP002", employeeName: "Nimal Silva", department: "Accounts", salaryType: "Monthly", overtimePay: 0, incentives: 2000, deductions: 1500, grossPay: 70000, netPay: 68500, status: "PAID" },
    { id: "PR3", employeeId: "EMP003", employeeName: "Chamari Silva", department: "Packing", salaryType: "Daily Wage", overtimePay: 2500, incentives: 0, deductions: 0, grossPay: 30000, netPay: 30000, status: "PAID" },
  ];
  return { month: monthKey, employeePayroll };
}

const styles = {
  page: { minHeight: "100%", background: "#f8fafc" },
  container: { padding: "32px", maxWidth: "1600px", margin: "0 auto" },
  breadcrumb: { fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" },
  pageHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px", gap: "24px", flexWrap: "wrap" },
  pageTitle: { margin: 0, fontSize: "32px", fontWeight: 900, color: "#1e293b", letterSpacing: "-0.02em" },
  pageSubtitle: { margin: "4px 0 0 0", fontSize: "15px", color: "#64748b", fontWeight: 500 },
  btnBack: { background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: 700, color: "#64748b", marginBottom: "12px" },
  actions: { display: "flex", gap: "12px" },
  btnSecondary: { background: "#fff", color: "#475569", border: "1px solid #e2e8f0", padding: "10px 18px", borderRadius: "12px", cursor: "pointer", fontWeight: 700, fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" },
  filters: { display: "flex", gap: "16px", background: "#fff", borderRadius: "20px", padding: "20px", marginBottom: "32px", border: "1px solid #f1f5f9", boxShadow: "0 4px 20px rgba(0,0,0,0.02)", alignItems: "flex-end", flexWrap: "wrap" },
  filterItem: { display: "flex", flexDirection: "column", gap: "8px" },
  label: { fontSize: "11px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" },
  input: { height: "42px", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "0 14px", fontSize: "14px", fontWeight: 600, color: "#1e293b", background: "#f8fafc", outline: "none" },
  kpiGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "32px" },
  kpiCard: { background: "#fff", borderRadius: "20px", padding: "20px", border: "1px solid #f1f5f9", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" },
  kpiLabel: { fontSize: "10px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" },
  kpiValue: { fontSize: "18px", fontWeight: 900, color: "#1e293b" },
  kpiHint: { fontSize: "11px", color: "#64748b", marginTop: "4px", fontWeight: 500 },
  listCard: { background: "#fff", borderRadius: "24px", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.03)", border: "1px solid #f1f5f9" },
  listHeader: { padding: "20px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc" },
  listTitle: { margin: 0, fontSize: "16px", fontWeight: 800, color: "#1e293b" },
  tableWrapper: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "14px 24px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", background: "#f8fafc", borderBottom: "1px solid #f1f5f9" },
  thRight: { textAlign: "right", padding: "14px 24px", fontSize: "11px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", background: "#f8fafc", borderBottom: "1px solid #f1f5f9" },
  td: { padding: "16px 24px", fontSize: "14px", color: "#475569", borderBottom: "1px solid #f1f5f9" },
  tdRight: { textAlign: "right", padding: "16px 24px", fontSize: "14px", fontWeight: 700, color: "#1e293b", borderBottom: "1px solid #f1f5f9" },
  badgePaid: { padding: "4px 12px", borderRadius: "8px", fontSize: "11px", fontWeight: 800, background: "#ecfdf5", color: "#047857", textTransform: "uppercase" },
  badgePending: { padding: "4px 12px", borderRadius: "8px", fontSize: "11px", fontWeight: 800, background: "#fff7ed", color: "#c2410c", textTransform: "uppercase" },
  smallBtn: { display: "flex", alignItems: "center", gap: "6px", background: "#fff", border: "1px solid #e2e8f0", padding: "6px 14px", borderRadius: "8px", cursor: "pointer", fontWeight: 700, fontSize: "12px", color: "#2c5530" },
};
