import React, { useMemo, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../../components/layout/AppLayout";
import { ListFilter } from "lucide-react";

const STORAGE_KEY = "kulasekara_manager_issues_v3";

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

  // Filter popup state
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const filterRef = useRef(null);

  // Close popup on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilterMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
              <div style={styles.title}>Employee Issues</div>
              <div style={styles.subTitle}>
                Review employee issues and add manager remarks for resolution tracking.
              </div>
            </div>

            {/* Controls moved to Header */}
            <div style={styles.headerControls}>
              <div style={styles.searchWrap}>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search..."
                  style={styles.searchInput}
                />
              </div>

              <div style={{ position: "relative" }} ref={filterRef}>
                <button
                  style={{
                    ...styles.secondaryBtn,
                    background: showFilterMenu ? "#e5e7eb" : "white"
                  }}
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                >
                  <ListFilter size={18} style={{ marginRight: 8 }} />
                  Filters
                </button>

                {showFilterMenu && (
                  <div style={styles.filterPopup}>
                    <div style={styles.filterGroup}>
                      <label style={styles.label}>Status</label>
                      <select value={status} onChange={(e) => setStatus(e.target.value)} style={styles.select}>
                        {STATUS.map((s) => (
                          <option key={s} value={s}>
                            {s.replace("_", " ")}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div style={styles.filterGroup}>
                      <label style={styles.label}>Category</label>
                      <select value={category} onChange={(e) => setCategory(e.target.value)} style={styles.select}>
                        {CATEGORY.map((c) => (
                          <option key={c} value={c}>
                            {c.replace("_", " ")}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <IssuesDashboard issues={issues} />

          {/* table */}
          <div style={styles.tableCard}>
            <div style={styles.tableHead}>
              <div style={{ fontWeight: 900 }}>Issues List</div>
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
      </div>
    </AppLayout>
  );
}

const styles = {
  page: { position: "relative", minHeight: "100%", overflow: "hidden" },
  container: { padding: 24, position: "relative", zIndex: 1 },

  headerRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
    flexWrap: "wrap",
    marginBottom: 20
  },

  title: { margin: 0, fontSize: 26, fontWeight: 800, color: "#2c5530" },
  subTitle: { marginTop: 6, marginBottom: 0, opacity: 0.8, color: "#4b5563" },

  // KPI
  kpiGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 },
  kpiCard: {
    background: "var(--glass-bg)",
    backdropFilter: "var(--glass-blur)",
    WebkitBackdropFilter: "var(--glass-blur)",
    border: "var(--glass-border)",
    borderRadius: 18,
    padding: 20,
    boxShadow: "var(--glass-shadow)",
  },
  kpiLabel: { fontWeight: 700, color: "#6b7280", fontSize: 13, textTransform: "uppercase", marginBottom: 8 },
  kpiValue: { fontSize: "clamp(20px, 2.5vw, 24px)", fontWeight: 800, color: "#111827", marginBottom: 4 },
  kpiHint: { fontSize: 12, color: "#6b7280", fontWeight: 600 },

  // filters
  filtersRow: {
    display: "flex",
    gap: 16,
    flexWrap: "wrap",
    alignItems: "flex-end",
    background: "var(--glass-bg)",
    backdropFilter: "var(--glass-blur)",
    WebkitBackdropFilter: "var(--glass-blur)",
    border: "var(--glass-border)",
    borderRadius: 18,
    padding: 16,
    boxShadow: "var(--glass-shadow)",
    marginBottom: 24
  },
  selectGroup: { minWidth: 180, display: "grid", gap: 8 },
  label: { fontWeight: 700, color: "#374151", fontSize: 13, textTransform: "uppercase" },
  select: {
    width: "100%",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    padding: "10px 12px",
    outline: "none",
    fontSize: 14,
    background: "#f9fafb",
    height: 42,
    fontWeight: 600
  },

  searchWrap: { display: "flex", gap: 10 },
  searchInput: {
    minWidth: 260,
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    padding: "0 12px",
    outline: "none",
    fontSize: 14,
    background: "#f9fafb",
    height: 36,
    fontWeight: 600
  },

  // buttons
  secondaryBtn: {
    height: 36,
    padding: "0 16px",
    borderRadius: 12,
    border: "1px solid #d1d5db",
    background: "#fff",
    color: "#374151",
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap",
    fontSize: 14
  },

  // table
  tableCard: {
    background: "var(--glass-bg)",
    backdropFilter: "var(--glass-blur)",
    WebkitBackdropFilter: "var(--glass-blur)",
    border: "var(--glass-border)",
    borderRadius: 18,
    boxShadow: "var(--glass-shadow)",
    overflow: "hidden",
    padding: 24
  },
  tableHead: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16
  },
  tableWrap: { width: "100%", overflowX: "auto" },
  table: { width: "100%", borderCollapse: "separate", borderSpacing: "0 4px" },
  th: {
    textAlign: "left",
    padding: "12px 16px",
    fontSize: 12,
    fontWeight: 700,
    color: "#6b7280",
    textTransform: "uppercase",
  },
  tr: { cursor: "pointer", transition: "transform 0.1s" },
  td: {
    padding: "12px 16px",
    background: "#f9fafb",
    fontSize: 14,
    color: "#374151",
    verticalAlign: "top",
    firstOfType: { borderRadius: "8px 0 0 8px" },
    lastOfType: { borderRadius: "0 8px 8px 0" }
  },
  tdMono: {
    padding: "12px 16px",
    background: "#f9fafb",
    fontSize: 13,
    color: "#374151",
    fontWeight: 600,
    verticalAlign: "top",
    firstOfType: { borderRadius: "8px 0 0 8px" }
  },

  // New styles
  headerControls: {
    display: "flex",
    gap: 12,
    alignItems: "center",
  },
  filterPopup: {
    position: "absolute",
    top: 50,
    right: 0,
    width: 260,
    background: "white",
    borderRadius: 16,
    boxShadow: "0 10px 40px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)",
    padding: 16,
    zIndex: 20, // ensure above other items
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  filterGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  }
};