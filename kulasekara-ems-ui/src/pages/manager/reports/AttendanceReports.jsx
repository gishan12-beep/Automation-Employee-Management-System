// src/pages/manager/reports/AttendanceReports.jsx
import React, { useMemo, useState } from "react";
import AppLayout from "../../../components/layout/AppLayout";

export default function AttendanceReports() {
  const [month, setMonth] = useState(getMonthKey(new Date()));
  const [type, setType] = useState("ALL"); // ALL | Permanent | Daily Wage
  const [q, setQ] = useState("");

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
    const avgPresenceRate = totalEmp > 0 ? Math.round((totalPresent / (totalPresent + totalAbsent)) * 100) : 0;

    return { totalEmp, totalPresent, totalAbsent, totalLate, totalOT, avgPresenceRate };
  }, [rows]);

  return (
    <AppLayout>
      <div style={styles.container}>
        <div style={styles.headerRow}>
          <div>
            <h2 style={styles.heading}>Attendance Reports</h2>
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

  kpiGrid: {
    marginTop: 12,
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
  kpiTitle: { fontWeight: 900, opacity: 0.8, marginBottom: 8 },
  kpiValue: { fontSize: 20, fontWeight: 900, marginBottom: 6 },
  kpiHint: { opacity: 0.7, fontWeight: 700 },

  panel: {
    marginTop: 12,
    background: "#fff",
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: 16,
    padding: 12,
    boxShadow: "0 10px 25px rgba(0,0,0,0.04)",
  },
  panelTitle: { fontWeight: 900, marginBottom: 10 },
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "10px 8px", fontSize: 12, opacity: 0.75, borderBottom: "1px solid rgba(0,0,0,0.08)" },
  thRight: { textAlign: "right", padding: "10px 8px", fontSize: 12, opacity: 0.75, borderBottom: "1px solid rgba(0,0,0,0.08)" },
  td: { padding: "10px 8px", borderBottom: "1px solid rgba(0,0,0,0.06)", verticalAlign: "top" },
  tdRight: { padding: "10px 8px", textAlign: "right", borderBottom: "1px solid rgba(0,0,0,0.06)" },
};
