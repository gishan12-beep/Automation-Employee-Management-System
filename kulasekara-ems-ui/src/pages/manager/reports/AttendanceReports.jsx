// src/pages/manager/reports/AttendanceReports.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../../components/layout/AppLayout";

export default function AttendanceReports() {
  const [month, setMonth] = useState(getMonthKey(new Date()));
  const [type, setType] = useState("ALL"); // ALL | Permanent | Daily Wage
  const [q, setQ] = useState("");

  const data = useMemo(() => makeDummyAttendance(month), [month]);
  const navigate = useNavigate();

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
    const avgPresenceRate = totalEmp > 0 ? Math.round((totalPresent / (totalPresent + totalAbsent)) * 100) : 0;

    return { totalEmp, totalPresent, totalAbsent, totalLate, totalOT, avgPresenceRate };
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
                <h2 style={styles.heading}>Attendance Reports</h2>
              </div>
              <p style={styles.subText}>
                Monthly attendance summary + employee-wise attendance listing.
              </p>
            </div>

            <div style={styles.actions}>
              <button
                style={styles.secondaryBtn}
                onClick={() => alert("Export will be added after backend integration")}
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
              <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} style={styles.input} />
            </div>

            <div style={styles.filterItem}>
              <div style={styles.label}>Employee Type</div>
              <select value={type} onChange={(e) => setType(e.target.value)} style={styles.input}>
                <option value="ALL">All</option>
                <option value="Permanent">Permanent</option>
                <option value="Daily Wage">Daily Wage</option>
              </select>
            </div>

            <div style={{ ...styles.filterItem, flex: 1 }}>
              <div style={styles.label}>Search</div>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by name or ID..."
                style={styles.input}
              />
            </div>
          </div>

          {/* KPI cards */}
          <div style={styles.kpiGrid}>
            <KpiCard title="Employees (Filtered)" value={kpis.totalEmp} hint={`Month: ${month}`} />
            <KpiCard title="Total Present Days" value={kpis.totalPresent} hint="Sum of present days" />
            <KpiCard title="Total Absent Days" value={kpis.totalAbsent} hint="Sum of absent days" />
            <KpiCard title="Late Days" value={kpis.totalLate} hint="Late arrivals count" />
            <KpiCard title="Overtime Hours" value={kpis.totalOT} hint="Total OT hours" />
            <KpiCard title="Avg Presence Rate" value={`${kpis.avgPresenceRate}%`} hint="Present / (Present+Absent)" />
          </div>

          {/* Table */}
          <div style={styles.panel}>
            <div style={styles.panelTitle}>Employee-wise Attendance</div>
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Employee</th>
                    <th style={styles.th}>Type</th>
                    <th style={styles.thRight}>Present</th>
                    <th style={styles.thRight}>Absent</th>
                    <th style={styles.thRight}>Late</th>
                    <th style={styles.thRight}>Work Hours</th>
                    <th style={styles.thRight}>OT Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id}>
                      <td style={styles.td}>
                        <div style={{ fontWeight: 900 }}>{r.employeeName}</div>
                        <div style={{ opacity: 0.7, fontSize: 12 }}>{r.employeeId}</div>
                      </td>
                      <td style={styles.td}>{r.employeeType}</td>
                      <td style={styles.tdRight}>{r.presentDays}</td>
                      <td style={styles.tdRight}>{r.absentDays}</td>
                      <td style={styles.tdRight}>{r.lateDays}</td>
                      <td style={styles.tdRight}>{r.workHours}</td>
                      <td style={styles.tdRight}>{r.overtimeHours}</td>
                    </tr>
                  ))}
                  {rows.length === 0 && (
                    <tr>
                      <td style={styles.td} colSpan={7}>
                        No attendance rows for selected filters.
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

function makeDummyAttendance(monthKey) {
  const rows = [
    {
      id: "AT1",
      employeeId: "EMP001",
      employeeName: "Kamal Perera",
      employeeType: "Daily Wage",
      presentDays: 22,
      absentDays: 2,
      lateDays: 3,
      workHours: 176,
      overtimeHours: 8,
    },
    {
      id: "AT2",
      employeeId: "EMP002",
      employeeName: "Nimal Silva",
      employeeType: "Permanent",
      presentDays: 24,
      absentDays: 0,
      lateDays: 0,
      workHours: 192,
      overtimeHours: 0,
    },
    {
      id: "AT3",
      employeeId: "EMP003",
      employeeName: "Chamari Silva",
      employeeType: "Daily Wage",
      presentDays: 20,
      absentDays: 4,
      lateDays: 1,
      workHours: 160,
      overtimeHours: 6,
    },
  ];

  return { month: monthKey, rows };
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
  backBtn: {
    background: "none",
    border: "none",
    padding: 0,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 700,
    color: "#6b7280",
    display: "flex",
    alignItems: "center",
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
  tdRight: { padding: "12px 16px", textAlign: "right", background: "#f9fafb", fontSize: 14, fontWeight: 700, color: "#111827", lastOfType: { borderRadius: "0 8px 8px 0" } },
};
