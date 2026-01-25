import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../../components/layout/AppLayout";

const STORAGE_KEY = "kulasekara_manager_issues_v1";

// initial seed (only for first load; not shown as "demo" in UI)
const seedIssues = [
  {
    issue_id: "ISS20260121-8F3K2",
    employee_id: "EMP001",
    employeeName: "Kasun Perera",
    category: "ATTENDANCE",
    subject: "Attendance not counted for 2026-01-20",
    description: "I checked in at 08:05 but system shows absent. Please verify.",
    status: "OPEN",
    raised_date: "2026-01-21T09:12:00",
    manager_note: "",
  },
  {
    issue_id: "ISS20260119-1KZ9P",
    employee_id: "EMP014",
    employeeName: "Nimal Silva",
    category: "PAYROLL",
    subject: "Salary deduction unclear",
    description: "My salary slip shows deduction but I don't know the reason.",
    status: "IN_PROGRESS",
    raised_date: "2026-01-19T14:40:00",
    manager_note: "Checking overtime/attendance records with accountant.",
  },
  {
    issue_id: "ISS20260115-QQ2X7",
    employee_id: "EMP020",
    employeeName: "Sahan Jayasinghe",
    category: "OVERTIME",
    subject: "Overtime hours missing",
    description: "Overtime from 2026-01-12 (2h) not included in payroll.",
    status: "RESOLVED",
    raised_date: "2026-01-15T10:20:00",
    manager_note: "Verified OT sheet and updated payroll record.",
  },
  {
    issue_id: "ISS20260120-LV001",
    employee_id: "EMP005",
    employeeName: "Ruwan Fernando",
    category: "LEAVE_REQUEST",
    subject: "Annual Leave Request - Family Function",
    description: "Requesting 3 days leave from 2026-02-05 to 2026-02-07 for family wedding.",
    status: "OPEN",
    raised_date: "2026-01-20T11:30:00",
    manager_note: "",
    leaveType: "ANNUAL",
    leaveStartDate: "2026-02-05",
    leaveEndDate: "2026-02-07",
    leaveDays: 3,
  },
  {
    issue_id: "ISS20260118-LV002",
    employee_id: "EMP012",
    employeeName: "Dilini Rajapaksha",
    category: "LEAVE_REQUEST",
    subject: "Sick Leave - Medical Appointment",
    description: "Need 1 day sick leave on 2026-01-25 for medical checkup.",
    status: "IN_PROGRESS",
    raised_date: "2026-01-18T09:15:00",
    manager_note: "Waiting for medical certificate.",
    leaveType: "SICK",
    leaveStartDate: "2026-01-25",
    leaveEndDate: "2026-01-25",
    leaveDays: 1,
  },
];

function loadIssues() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seedIssues));
      return seedIssues;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error("Invalid store");
    return parsed;
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedIssues));
    return seedIssues;
  }
}

const STATUS = ["ALL", "OPEN", "IN_PROGRESS", "RESOLVED", "APPROVED", "REJECTED"];
const CATEGORY = ["ALL", "ATTENDANCE", "OVERTIME", "PAYROLL", "LEAVE_REQUEST", "OTHER"];

function badgeStyle(type) {
  const base = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 900,
    border: "1px solid rgba(0,0,0,0.08)",
    whiteSpace: "nowrap",
  };

  // category
  if (["ATTENDANCE", "OVERTIME", "PAYROLL", "OTHER"].includes(type)) {
    return { ...base, background: "#f8fafc", color: "#0f172a" };
  }
  if (type === "LEAVE_REQUEST") {
    return { ...base, background: "#fef3c7", color: "#92400e" };
  }

  // status
  if (type === "OPEN") return { ...base, background: "#fff1f2", color: "#9f1239" };
  if (type === "IN_PROGRESS") return { ...base, background: "#eff6ff", color: "#1d4ed8" };
  if (type === "RESOLVED") return { ...base, background: "#ecfdf5", color: "#047857" };
  if (type === "APPROVED") return { ...base, background: "#d1fae5", color: "#065f46" };
  if (type === "REJECTED") return { ...base, background: "#fee2e2", color: "#991b1b" };
  return { ...base, background: "#f1f5f9", color: "#0f172a" };
}

function IssuesDashboard({ issues }) {
  const stats = useMemo(() => {
    const openCount = issues.filter((i) => i.status === "OPEN").length;
    const progCount = issues.filter((i) => i.status === "IN_PROGRESS").length;
    const resCount = issues.filter((i) => i.status === "RESOLVED").length;
    const leaveCount = issues.filter((i) => i.category === "LEAVE_REQUEST").length;
    const pendingLeave = issues.filter((i) => i.category === "LEAVE_REQUEST" && (i.status === "OPEN" || i.status === "IN_PROGRESS")).length;
    return { openCount, progCount, resCount, leaveCount, pendingLeave, total: issues.length };
  }, [issues]);

  return (
    <div style={styles.kpiGrid}>
      <div style={styles.kpiCard}>
        <div style={styles.kpiLabel}>Open</div>
        <div style={styles.kpiValue}>{stats.openCount}</div>
        <div style={styles.kpiHint}>Need attention</div>
      </div>

      <div style={styles.kpiCard}>
        <div style={styles.kpiLabel}>In Progress</div>
        <div style={styles.kpiValue}>{stats.progCount}</div>
        <div style={styles.kpiHint}>Under review</div>
      </div>

      <div style={styles.kpiCard}>
        <div style={styles.kpiLabel}>Leave Requests</div>
        <div style={styles.kpiValue}>{stats.pendingLeave}</div>
        <div style={styles.kpiHint}>Pending approval</div>
      </div>

      <div style={styles.kpiCard}>
        <div style={styles.kpiLabel}>Total</div>
        <div style={styles.kpiValue}>{stats.total}</div>
        <div style={styles.kpiHint}>All issues</div>
      </div>
    </div>
  );
}

export default function IssueList() {
  const navigate = useNavigate();
  const [issues] = useState(() => loadIssues());

  const [status, setStatus] = useState("OPEN");
  const [category, setCategory] = useState("ALL");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase();
    return issues.filter((i) => {
      const okStatus = status === "ALL" ? true : i.status === status;
      const okCat = category === "ALL" ? true : i.category === category;

      const okSearch =
        !text ||
        i.issue_id.toLowerCase().includes(text) ||
        i.employee_id.toLowerCase().includes(text) ||
        (i.employeeName || "").toLowerCase().includes(text) ||
        (i.subject || "").toLowerCase().includes(text) ||
        (i.description || "").toLowerCase().includes(text);

      return okStatus && okCat && okSearch;
    });
  }, [issues, status, category, q]);

  return (
    <AppLayout>
      <div style={styles.wrap}>
        <div style={styles.headerRow}>
          <div>
            <div style={styles.title}>Employee Issues & Leave Requests</div>
            <div style={styles.subTitle}>
              Review employee issues, leave requests, and add manager remarks for resolution tracking.
            </div>
          </div>
        </div>

        <IssuesDashboard issues={issues} />

        {/* filters */}
        <div style={styles.filtersRow}>
          <div style={styles.selectGroup}>
            <label style={styles.label}>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} style={styles.select}>
              {STATUS.map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.selectGroup}>
            <label style={styles.label}>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} style={styles.select}>
              {CATEGORY.map((c) => (
                <option key={c} value={c}>
                  {c.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>

          <div style={{ flex: 1 }}>
            <label style={styles.label}>Search</label>
            <div style={styles.searchWrap}>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by issue id, employee, subject..."
                style={styles.searchInput}
              />
              <button style={styles.secondaryBtn} onClick={() => setQ("")}>
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* table */}
        <div style={styles.tableCard}>
          <div style={styles.tableHead}>
            <div style={{ fontWeight: 900 }}>Issues & Leave Requests List</div>
            <div style={{ color: "#64748b", fontSize: 13 }}>
              Showing <b>{filtered.length}</b> of <b>{issues.length}</b>
            </div>
          </div>

          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Issue ID</th>
                  <th style={styles.th}>Employee</th>
                  <th style={styles.th}>Category</th>
                  <th style={styles.th}>Subject</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Raised</th>
                </tr>
              </thead>

              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td style={styles.td} colSpan={6}>
                      No issues found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((row) => (
                    <tr
                      key={row.issue_id}
                      style={styles.tr}
                      onClick={() => navigate(`/manager/issues/${row.issue_id}`)}
                      title="Open issue"
                    >
                      <td style={styles.tdMono}>{row.issue_id}</td>

                      <td style={styles.td}>
                        <div style={{ fontWeight: 900 }}>{row.employeeName}</div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>{row.employee_id}</div>
                      </td>

                      <td style={styles.td}>
                        <span style={badgeStyle(row.category)}>{row.category.replace("_", " ")}</span>
                      </td>

                      <td style={styles.td}>
                        <div style={{ fontWeight: 900 }}>{row.subject}</div>
                        {row.category === "LEAVE_REQUEST" && row.leaveDays ? (
                          <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                            {row.leaveType} • {row.leaveDays} day{row.leaveDays > 1 ? "s" : ""} • {row.leaveStartDate} to {row.leaveEndDate}
                          </div>
                        ) : row.description ? (
                          <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                            {String(row.description).slice(0, 80)}
                            {String(row.description).length > 80 ? "..." : ""}
                          </div>
                        ) : null}
                      </td>

                      <td style={styles.td}>
                        <span style={badgeStyle(row.status)}>{row.status.replace("_", " ")}</span>
                      </td>

                      <td style={styles.td}>
                        {row.raised_date ? new Date(row.raised_date).toLocaleString() : "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

const styles = {
  wrap: { padding: 20, display: "grid", gap: 16 },

  headerRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
    flexWrap: "wrap",
  },

  title: { fontSize: 22, fontWeight: 1000, color: "#0f172a" },
  subTitle: { marginTop: 6, fontSize: 13, color: "#64748b" },

  // KPI
  kpiGrid: { display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12 },
  kpiCard: {
    background: "#fff",
    border: "1px solid rgba(15,23,42,0.08)",
    borderRadius: 14,
    padding: 14,
    boxShadow: "0 8px 18px rgba(2,6,23,0.04)",
  },
  kpiLabel: { fontSize: 12, color: "#64748b", fontWeight: 900 },
  kpiValue: { fontSize: 26, fontWeight: 1000, color: "#0f172a", marginTop: 6 },
  kpiHint: { fontSize: 12, color: "#94a3b8", marginTop: 4 },

  // filters
  filtersRow: { display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" },
  selectGroup: { minWidth: 180, display: "grid", gap: 6 },
  label: { fontSize: 12, color: "#64748b", fontWeight: 900 },
  select: {
    width: "100%",
    height: 40,
    borderRadius: 12,
    border: "1px solid rgba(15,23,42,0.12)",
    padding: "0 12px",
    outline: "none",
    background: "#fff",
    fontWeight: 800,
  },

  searchWrap: { display: "flex", gap: 10 },
  searchInput: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    border: "1px solid rgba(15,23,42,0.12)",
    padding: "0 12px",
    outline: "none",
    background: "#fff",
    fontWeight: 800,
  },

  // buttons
  secondaryBtn: {
    height: 40,
    padding: "0 14px",
    borderRadius: 12,
    border: "1px solid rgba(15,23,42,0.12)",
    background: "#fff",
    color: "#0f172a",
    fontWeight: 1000,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  // table
  tableCard: {
    background: "#fff",
    border: "1px solid rgba(15,23,42,0.08)",
    borderRadius: 14,
    boxShadow: "0 8px 18px rgba(2,6,23,0.04)",
    overflow: "hidden",
  },
  tableHead: {
    padding: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid rgba(15,23,42,0.06)",
  },
  tableWrap: { width: "100%", overflowX: "auto" },
  table: { width: "100%", borderCollapse: "separate", borderSpacing: 0 },
  th: {
    textAlign: "left",
    fontSize: 12,
    color: "#64748b",
    fontWeight: 1000,
    padding: "12px 14px",
    borderBottom: "1px solid rgba(15,23,42,0.06)",
    background: "#f8fafc",
  },
  tr: { cursor: "pointer" },
  td: {
    padding: "12px 14px",
    borderBottom: "1px solid rgba(15,23,42,0.06)",
    verticalAlign: "top",
    fontSize: 13,
    color: "#0f172a",
  },
  tdMono: {
    padding: "12px 14px",
    borderBottom: "1px solid rgba(15,23,42,0.06)",
    verticalAlign: "top",
    fontSize: 12,
    color: "#0f172a",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    fontWeight: 1000,
  },
};