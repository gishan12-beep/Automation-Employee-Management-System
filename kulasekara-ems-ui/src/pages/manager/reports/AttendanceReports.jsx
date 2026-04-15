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
              <div style={styles.breadcrumb}>Manager / Operations Analysis</div>
              <h1 style={styles.pageTitle}>Attendance Reports</h1>
              <p style={styles.pageSubtitle}>Monitor workforce presence, lateness trends, and overtime hours</p>
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
  page: { minHeight: "100%", position: "relative", overflow: "hidden" },
  container: { padding: "32px", maxWidth: "1600px", margin: "0 auto", position: "relative", zIndex: 1 },
  breadcrumb: { fontSize: "11px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" },
  pageHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px", gap: "24px", flexWrap: "wrap" },
  pageTitle: { margin: 0, fontSize: "32px", fontWeight: 900, color: "#2c5530", letterSpacing: "-0.02em" },
  pageSubtitle: { margin: "4px 0 0 0", fontSize: "15px", color: "#64748b", fontWeight: 500 },
  btnBack: { background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: 700, color: "#64748b", marginBottom: "12px" },
  actions: { display: "flex", gap: "12px" },
  printBtn: {
    padding: "12px 24px", 
    borderRadius: "14px", 
    background: "linear-gradient(135deg, #4a7c4e 0%, #5a8c5e 100%)", 
    color: "#fff", 
    border: "none", 
    fontWeight: 700, 
    cursor: "pointer", 
    display: "flex", 
    alignItems: "center", 
    gap: "8px",
    boxShadow: "0 8px 20px rgba(74, 124, 78, 0.25)",
    transition: "transform 0.2s"
  },
  filters: { 
    display: "flex", 
    gap: "16px", 
    background: "rgba(255, 255, 255, 0.8)", 
    backdropFilter: "blur(12px)",
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
  kpiGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "20px", marginBottom: "32px" },
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
  kpiHint: { fontSize: "12px", color: "#64748b", marginTop: "4px", fontWeight: 600 },
  listCard: { 
    background: "rgba(255, 255, 255, 0.9)", 
    backdropFilter: "blur(12px)",
    borderRadius: "24px", 
    overflow: "hidden", 
    boxShadow: "0 10px 30px rgba(0,0,0,0.03)", 
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
  listTitle: { margin: 0, fontSize: "16px", fontWeight: 800, color: "#1f2937" },
  tableWrapper: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "separate", borderSpacing: 0 },
  th: { 
    padding: "16px 24px", 
    textAlign: "left", 
    fontSize: "11px", 
    fontWeight: 800, 
    color: "#94a3b8", 
    textTransform: "uppercase", 
    letterSpacing: "0.05em", 
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
};
