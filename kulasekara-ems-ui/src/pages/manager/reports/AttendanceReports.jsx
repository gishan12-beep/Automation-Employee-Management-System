// src/pages/manager/reports/AttendanceReports.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../../components/layout/AppLayout";
import { 
  ArrowLeft, 
  Download, 
  Printer, 
  Search, 
  Calendar, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  TrendingUp, 
  BarChart3,
  UserCheck,
  UserX,
  History
} from "lucide-react";

export default function AttendanceReports() {
  const [month, setMonth] = useState(getMonthKey(new Date()));
  const [type, setType] = useState("ALL"); // ALL | Permanent | Daily Wage
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const data = useMemo(() => makeDummyAttendance(month), [month]);

  const rows = useMemo(() => {
    let list = [...data.rows];
    if (type !== "ALL") list = list.filter((r) => r.employeeType === type);
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      list = list.filter(
        (r) =>
          r.employeeId.toLowerCase().includes(s) ||
          r.employeeName.toLowerCase().includes(s)
      );
    }
    return list;
  }, [data, type, q]);

  const kpis = useMemo(() => {
    const totalEmp = rows.length;
    const totalPresent = rows.reduce((s, r) => s + r.presentDays, 0);
    const totalAbsent = rows.reduce((s, r) => s + r.absentDays, 0);
    const totalLate = rows.reduce((s, r) => s + r.lateDays, 0);
    const totalOT = rows.reduce((s, r) => s + r.overtimeHours, 0);
    const avgPresenceRate = totalEmp > 0 ? Math.round((totalPresent / (totalPresent + totalAbsent || 1)) * 100) : 0;
    return { totalEmp, totalPresent, totalAbsent, totalLate, totalOT, avgPresenceRate };
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
              <div style={styles.breadcrumb}>Manager / Operations Analysis</div>
              <h1 style={styles.pageTitle}>Attendance Reports</h1>
              <p style={styles.pageSubtitle}>Monitor workforce presence, lateness trends, and overtime hours</p>
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
              <label style={styles.label}>Staff Category</label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <Users size={16} style={{ position: "absolute", left: "12px", color: "#94a3b8" }} />
                <select 
                  value={type} 
                  onChange={(e) => setType(e.target.value)} 
                  style={{ ...styles.input, paddingLeft: "36px", width: "200px", cursor: "pointer" }}
                >
                  <option value="ALL">All Categories</option>
                  <option value="Permanent">Permanent</option>
                  <option value="Daily Wage">Daily Wage</option>
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
                  placeholder="Filter by name or employee ID..."
                  style={{ ...styles.input, paddingLeft: "36px", width: "100%" }}
                />
              </div>
            </div>
          </div>

          {/* KPI grid */}
          <div style={styles.kpiGrid} className="fade-in">
            <KpiCard icon={<Users size={18} />} title="Staff Count" value={kpis.totalEmp} hint="Active in filters" />
            <KpiCard icon={<UserCheck size={18} />} title="Present Days" value={kpis.totalPresent} hint="Total cumulative" />
            <KpiCard icon={<UserX size={18} />} title="Absent Days" value={kpis.totalAbsent} hint="Total cumulative" />
            <KpiCard icon={<Clock size={18} />} title="Late Logs" value={kpis.totalLate} hint="Lateness occurrences" />
            <KpiCard icon={<History size={18} />} title="OT Hours" value={kpis.totalOT} hint="Total extra hours" />
            <KpiCard icon={<BarChart3 size={18} />} title="Presence Rate" value={`${kpis.avgPresenceRate}%`} hint="Overall efficiency" />
          </div>

          {/* Table */}
          <div style={styles.listCard} className="fade-in">
            <div style={styles.listHeader}>
              <h3 style={styles.listTitle}>Workforce Attendance Listing</h3>
              <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 700 }}>{rows.length} employees</div>
            </div>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Employee</th>
                    <th style={styles.th}>Contract Type</th>
                    <th style={styles.thRight}>Present</th>
                    <th style={styles.thRight}>Absent</th>
                    <th style={styles.thRight}>Late</th>
                    <th style={styles.thRight}>Work Hrs</th>
                    <th style={styles.thRight}>OT Hrs</th>
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
                        <div style={{ fontWeight: 600 }}>{r.employeeType}</div>
                      </td>
                      <td style={styles.tdRight}>{r.presentDays}</td>
                      <td style={styles.tdRight}>
                        <span style={r.absentDays > 2 ? { color: "#dc2626", fontWeight: 800 } : {}}>{r.absentDays}</span>
                      </td>
                      <td style={styles.tdRight}>{r.lateDays}</td>
                      <td style={styles.tdRight}>{r.workHours}</td>
                      <td style={{ ...styles.tdRight, color: "#2c5530" }}>{r.overtimeHours}</td>
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

function makeDummyAttendance(monthKey) {
  const rows = [
    { id: "AT1", employeeId: "EMP001", employeeName: "Kamal Perera", employeeType: "Daily Wage", presentDays: 22, absentDays: 2, lateDays: 3, workHours: 176, overtimeHours: 8 },
    { id: "AT2", employeeId: "EMP002", employeeName: "Nimal Silva", employeeType: "Permanent", presentDays: 24, absentDays: 0, lateDays: 0, workHours: 192, overtimeHours: 0 },
    { id: "AT3", employeeId: "EMP003", employeeName: "Chamari Silva", employeeType: "Daily Wage", presentDays: 20, absentDays: 4, lateDays: 1, workHours: 160, overtimeHours: 6 },
  ];
  return { month: monthKey, rows };
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
  kpiGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px", marginBottom: "32px" },
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
};
