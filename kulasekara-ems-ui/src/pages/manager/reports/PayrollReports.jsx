// src/pages/manager/reports/PayrollReports.jsx
import React, { useMemo, useState, useEffect } from "react";
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
  FileText,
  CheckCircle2
} from "lucide-react";

import { getPayrollSummaryApi } from "../../../services/payrollService";

// Formats numeric values into localized LKR currency strings for the payroll report
const formatLKR = (n) =>
  new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR", maximumFractionDigits: 0 }).format(Number(n || 0));

// Main component for generating monthly payroll summaries and detailed employee payout reports
export default function PayrollReports() {
  const [month, setMonth] = useState(getMonthKey(new Date()));
  const [department, setDepartment] = useState("ALL");
  const [q, setQ] = useState("");
  const [employeePayroll, setEmployeePayroll] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetches aggregated payroll data whenever the selected month period is changed
  useEffect(() => {
    fetchPayrollData();
  }, [month]);

  // Retrieves monthly payroll summary records from the backend payroll service
  const fetchPayrollData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [yearStr, monthStr] = month.split("-");
      // Calls the API to retrieve payroll data for the specific year and month
      const data = await getPayrollSummaryApi(parseInt(monthStr, 10), parseInt(yearStr, 10));
      setEmployeePayroll(data);
    } catch (err) {
      console.error("Failed to fetch payroll summary:", err);
      setError("Failed to load payroll data. Please ensure payroll is processed for this month.");
      setEmployeePayroll([]);
    } finally {
      setLoading(false);
    }
  };

  // Filters and searches through the retrieved payroll records based on department and keyword
  const rows = useMemo(() => {
    let list = [...employeePayroll];
    // Applies department-based filtering
    if (department !== "ALL") list = list.filter((r) => r.department === department);
    // Applies case-insensitive search against employee ID and name
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      list = list.filter(
        (r) =>
          r.employeeId.toLowerCase().includes(s) ||
          r.name.toLowerCase().includes(s)
      );
    }
    return list;
  }, [employeePayroll, department, q]);

  // Computes high-level payroll KPIs including gross/net totals and completion status
  const kpis = useMemo(() => {
    const gross = rows.reduce((s, r) => s + (Number(r.gross) || 0), 0);
    const net = rows.reduce((s, r) => s + (Number(r.net) || 0), 0);
    const ot = rows.reduce((s, r) => s + (Number(r.total_ot_pay) || 0), 0);
    const incentives = rows.reduce((s, r) => s + (Number(r.total_incentives) || 0), 0);
    const deductions = rows.reduce((s, r) => s + (Number(r.total_deductions) || 0), 0);
    // Counts the number of processed vs pending payment records
    const paidCount = rows.filter((r) => r.status === "PAID" || r.status === "READY").length;
    const pendingCount = rows.filter((r) => r.status === "PENDING").length;
    return { gross, net, ot, incentives, deductions, paidCount, pendingCount };
  }, [rows]);

  return (
    <AppLayout>
      <div style={styles.page}>
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
          
          .fade-in { animation: fadeIn 0.4s ease-out forwards; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          .table-row { transition: all 0.2s; cursor: pointer; }
          .table-row:hover { background: rgba(248, 250, 252, 0.8) !important; }
        `}</style>
        
        <div className="floating-circle fc-1"></div>
        <div className="floating-circle fc-2"></div>
        <div className="floating-circle fc-3"></div>

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
              <button style={styles.printBtn} onClick={() => window.print()}>
                <Printer size={16} /> Print Report
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
                  <option value="Accounts">Accounts</option>
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
                  placeholder="ID or Name..."
                  style={{ ...styles.input, paddingLeft: "36px", width: "100%" }}
                />
              </div>
            </div>
          </div>

          {error && (
            <div style={{ padding: "16px", background: "#fef2f2", color: "#b91c1c", borderRadius: "12px", marginBottom: "24px", fontSize: "14px", border: "1px solid #fee2e2" }}>
              {error}
            </div>
          )}

          {/* KPI grid */}
          <div style={styles.kpiGrid} className="fade-in">
            <KpiCard icon={<Wallet size={18} />} title="Total Gross" value={formatLKR(kpis.gross)} hint="Total before deductions" />
            <KpiCard icon={<TrendingUp size={18} />} title="Total Net" value={formatLKR(kpis.net)} hint="After all deductions" />
            <KpiCard icon={<Clock size={18} />} title="Overtime" value={formatLKR(kpis.ot)} hint="Accumulated OT costs" />
            <KpiCard icon={<Gift size={18} />} title="Incentives" value={formatLKR(kpis.incentives)} hint="Performance bonuses" />
            <KpiCard icon={<MinusCircle size={18} />} title="Deductions" value={formatLKR(kpis.deductions)} hint="Loans & adjustments" />
            <KpiCard icon={<CheckCircle2 size={18} />} title="Completion" value={`${kpis.paidCount} Ready`} hint={`${kpis.pendingCount} Pending`} />
          </div>

          {/* Table */}
          <div style={styles.listCard} className="fade-in">
            <div style={styles.listHeader}>
              <h3 style={styles.listTitle}>Employee Payout Listing</h3>
              <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 700 }}>{loading ? "Loading..." : `${rows.length} records`}</div>
            </div>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Employee</th>
                    <th style={styles.th}>Dept</th>
                    <th style={styles.thRight}>Gross</th>
                    <th style={styles.thRight}>Net Pay</th>
                    <th style={styles.th}>Status</th>
                    <th style={{ ...styles.th, textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>Fetching payroll data...</td></tr>
                  ) : rows.map((r) => (
                    <tr key={r.payrollId} className="table-row">
                      <td style={styles.td}>
                        <div style={{ fontSize: "14px", fontWeight: 700, color: "#1e293b" }}>{r.name}</div>
                        <div style={{ fontSize: "11px", color: "#94a3b8" }}>{r.employeeId}</div>
                      </td>
                      <td style={styles.td}>
                        <div style={{ fontWeight: 600 }}>{r.department}</div>
                      </td>
                      <td style={styles.tdRight}>{formatLKR(r.gross)}</td>
                      <td style={{ ...styles.tdRight, color: "#2c5530" }}>{formatLKR(r.net)}</td>
                      <td style={styles.td}>
                        {(r.status === "PAID" || r.status === "READY") ? (
                          <span style={styles.badgePaid}>{r.status}</span>
                        ) : (
                          <span style={styles.badgePending}>{r.status}</span>
                        )}
                      </td>
                      <td style={{ ...styles.td, textAlign: "right" }}>
                        <button style={styles.smallBtn} onClick={() => alert("Preview coming soon")}>
                          <Eye size={12} /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!loading && rows.length === 0 && (
                    <tr><td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>No data found for selected filters</td></tr>
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


const styles = {
  page: { minHeight: "100%", position: "relative" },
  container: { padding: "32px", maxWidth: "1600px", margin: "0 auto", position: "relative", zIndex: 1 },
  breadcrumb: { fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" },
  pageHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px", gap: "24px", flexWrap: "wrap" },
  pageTitle: { margin: 0, fontSize: "32px", fontWeight: 900, color: "#2c5530", letterSpacing: "-0.02em" },
  pageSubtitle: { margin: "4px 0 0 0", fontSize: "15px", color: "#64748b", fontWeight: 500 },
  btnBack: { background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: 700, color: "#64748b", marginBottom: "12px" },
  actions: { display: "flex", gap: "12px" },
  printBtn: { 
    display: "flex", 
    alignItems: "center", 
    gap: "10px", 
    padding: "12px 24px", 
    borderRadius: "14px", 
    background: "linear-gradient(135deg, #4a7c4e 0%, #5a8c5e 100%)", 
    color: "#fff", 
    border: "none", 
    fontWeight: 700, 
    cursor: "pointer", 
    boxShadow: "0 8px 20px rgba(74, 124, 78, 0.25)",
    transition: "transform 0.2s"
  },
  btnSecondary: { background: "#fff", color: "#475569", border: "1px solid #e2e8f0", padding: "10px 18px", borderRadius: "12px", cursor: "pointer", fontWeight: 700, fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" },
  
  filters: { 
    display: "flex", 
    gap: "16px", 
    background: "rgba(255, 255, 255, 0.8)", 
    backdropFilter: "blur(10px)",
    borderRadius: "20px", 
    padding: "20px", 
    marginBottom: "32px", 
    border: "1px solid rgba(255, 255, 255, 0.5)", 
    boxShadow: "0 4px 20px rgba(0,0,0,0.02)", 
    alignItems: "flex-end", 
    flexWrap: "wrap" 
  },
  filterItem: { display: "flex", flexDirection: "column", gap: "8px" },
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
  
  kpiGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "20px", marginBottom: "32px" },
  kpiCard: { 
    background: "rgba(255, 255, 255, 0.9)", 
    backdropFilter: "blur(12px)",
    borderRadius: "24px", 
    padding: "24px", 
    border: "1px solid rgba(255, 255, 255, 0.5)", 
    boxShadow: "0 8px 30px rgba(0,0,0,0.02)" 
  },
  kpiLabel: { fontSize: "11px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" },
  kpiValue: { fontSize: "22px", fontWeight: 900, color: "#1e293b" },
  kpiHint: { fontSize: "12px", color: "#64748b", marginTop: "6px", fontWeight: 500 },
  
  listCard: { 
    background: "rgba(255, 255, 255, 0.9)", 
    backdropFilter: "blur(12px)",
    borderRadius: "24px", 
    overflow: "hidden", 
    boxShadow: "0 8px 30px rgba(0,0,0,0.02)", 
    border: "1px solid rgba(255, 255, 255, 0.5)" 
  },
  listHeader: { 
    padding: "20px 24px", 
    borderBottom: "1px solid rgba(0,0,0,0.05)", 
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "center", 
    background: "rgba(248, 250, 252, 0.5)" 
  },
  listTitle: { margin: 0, fontSize: "16px", fontWeight: 800, color: "#1e293b" },
  tableWrapper: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "separate", borderSpacing: 0 },
  th: { 
    padding: "16px 24px", 
    textAlign: "left", 
    fontSize: "11px", 
    fontWeight: 800, 
    color: "#94a3b8", 
    textTransform: "uppercase", 
    letterSpacing: "0.1em", 
    background: "rgba(248, 250, 252, 0.5)", 
    borderBottom: "1px solid rgba(0,0,0,0.05)" 
  },
  thRight: { 
    textAlign: "right", 
    padding: "16px 24px", 
    fontSize: "11px", 
    fontWeight: 800, 
    color: "#94a3b8", 
    textTransform: "uppercase", 
    background: "rgba(248, 250, 252, 0.5)", 
    borderBottom: "1px solid rgba(0,0,0,0.05)" 
  },
  td: { padding: "18px 24px", fontSize: "14px", color: "#475569", borderBottom: "1px solid rgba(0,0,0,0.05)" },
  tdRight: { textAlign: "right", padding: "18px 24px", fontSize: "14px", fontWeight: 700, color: "#1e293b", borderBottom: "1px solid rgba(0,0,0,0.05)" },
  badgePaid: { padding: "4px 12px", borderRadius: "10px", fontSize: "11px", fontWeight: 800, background: "#ecfdf5", color: "#047857", textTransform: "uppercase" },
  badgePending: { padding: "4px 12px", borderRadius: "10px", fontSize: "11px", fontWeight: 800, background: "#fff7ed", color: "#c2410c", textTransform: "uppercase" },
  smallBtn: { display: "flex", alignItems: "center", gap: "8px", background: "#fff", border: "1px solid #e2e8f0", padding: "8px 14px", borderRadius: "10px", cursor: "pointer", fontWeight: 700, fontSize: "12px", color: "#4a7c4e", boxShadow: "0 2px 5px rgba(0,0,0,0.02)" },
};
