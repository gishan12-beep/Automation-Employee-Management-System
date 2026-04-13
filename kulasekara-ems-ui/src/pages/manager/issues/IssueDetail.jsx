import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppLayout from "../../../components/layout/AppLayout";

const STORAGE_KEY = "kulasekara_manager_issues_v3";

// initial seed (matches IssueList.jsx)
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
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedIssues));
    return seedIssues;
  }
}
function saveIssues(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function badgeStyle(type) {
  const base = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 1000,
    border: "1px solid rgba(0,0,0,0.08)",
    whiteSpace: "nowrap",
  };

  if (["ATTENDANCE", "OVERTIME", "PAYROLL", "OTHER"].includes(type)) {
    return { ...base, background: "#f8fafc", color: "#0f172a" };
  }
  if (type === "LEAVE_REQUEST") {
    return { ...base, background: "#fef3c7", color: "#92400e" };
  }
  if (type === "OPEN") return { ...base, background: "#fff1f2", color: "#9f1239" };
  if (type === "IN_PROGRESS") return { ...base, background: "#eff6ff", color: "#1d4ed8" };
  if (type === "RESOLVED") return { ...base, background: "#ecfdf5", color: "#047857" };
  if (type === "APPROVED") return { ...base, background: "#d1fae5", color: "#065f46" };
  if (type === "REJECTED") return { ...base, background: "#fee2e2", color: "#991b1b" };
  return { ...base, background: "#f1f5f9", color: "#0f172a" };
}

export default function IssueDetail() {
  const { issueId } = useParams();
  const navigate = useNavigate();

  const [issues, setIssues] = useState(() => loadIssues());
  const issue = useMemo(() => issues.find((i) => i.issue_id === issueId), [issues, issueId]);

  const [editStatus, setEditStatus] = useState("OPEN");
  const [remark, setRemark] = useState("");
  const [savedToast, setSavedToast] = useState(false);

  const isLeaveRequest = issue?.category === "LEAVE_REQUEST";

  useEffect(() => {
    if (!issue) return;
    setEditStatus(issue.status || "OPEN");
    setRemark(issue.manager_note || "");
  }, [issue]);

  function save() {
    if (!issue) return;

    const next = issues.map((it) =>
      it.issue_id === issue.issue_id
        ? { ...it, status: editStatus, manager_note: remark }
        : it
    );

    setIssues(next);
    saveIssues(next);

    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 1200);
  }

  function quickAction(action) {
    if (!issue) return;

    let newStatus = editStatus;
    let newRemark = remark;

    if (action === "APPROVE") {
      newStatus = "APPROVED";
      newRemark = remark || "Leave request approved.";
    } else if (action === "REJECT") {
      newStatus = "REJECTED";
      newRemark = remark || "Leave request rejected.";
    }

    const next = issues.map((it) =>
      it.issue_id === issue.issue_id
        ? { ...it, status: newStatus, manager_note: newRemark }
        : it
    );

    setIssues(next);
    saveIssues(next);
    setEditStatus(newStatus);
    setRemark(newRemark);

    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 1200);
  }

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
          <div style={styles.topRow}>
            <div>
              <div style={styles.title}>{isLeaveRequest ? "Leave Request Review" : "Issue Review"}</div>
              <div style={styles.subTitle}>
                {isLeaveRequest
                  ? "Review the leave request and approve or reject with remarks."
                  : "Review the issue and add a manager remark for tracking."}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button style={styles.secondaryBtn} onClick={() => navigate(-1)}>
                ← Back
              </button>
              <button style={styles.primaryBtn} onClick={save} disabled={!issue}>
                Save
              </button>
            </div>
          </div>

          {!issue ? (
            <div style={styles.card}>
              <div style={{ fontWeight: 1000, fontSize: 16 }}>Issue not found</div>
              <div style={{ marginTop: 6, color: "#64748b", fontSize: 13 }}>
                This issue ID does not exist.
              </div>
              <div style={{ marginTop: 14 }}>
                <button style={styles.primaryBtn} onClick={() => navigate("/manager/issues")}>
                  Go to Issues List
                </button>
              </div>
            </div>
          ) : (
            <>
              <div style={styles.grid}>
                <div style={styles.card}>
                  <div style={styles.sectionTitle}>{isLeaveRequest ? "Leave Request Details" : "Issue Summary"}</div>

                  <div style={styles.row}>
                    <div style={styles.label}>Issue ID</div>
                    <div style={styles.valueMono}>{issue.issue_id}</div>
                  </div>

                  <div style={styles.row}>
                    <div style={styles.label}>Employee</div>
                    <div style={styles.value}>
                      {issue.employeeName} <span style={{ color: "#94a3b8" }}>({issue.employee_id})</span>
                    </div>
                  </div>

                  <div style={styles.row}>
                    <div style={styles.label}>Category</div>
                    <div style={styles.value}>
                      <span style={badgeStyle(issue.category)}>{issue.category.replace("_", " ")}</span>
                    </div>
                  </div>

                  <div style={styles.row}>
                    <div style={styles.label}>Status</div>
                    <div style={styles.value}>
                      <span style={badgeStyle(issue.status)}>{issue.status.replace("_", " ")}</span>
                    </div>
                  </div>

                  <div style={styles.row}>
                    <div style={styles.label}>Raised</div>
                    <div style={styles.value}>
                      {issue.raised_date ? new Date(issue.raised_date).toLocaleString() : "-"}
                    </div>
                  </div>

                  {isLeaveRequest && (
                    <>
                      <div style={styles.row}>
                        <div style={styles.label}>Leave Type</div>
                        <div style={styles.value}>{issue.leaveType || "-"}</div>
                      </div>

                      <div style={styles.row}>
                        <div style={styles.label}>Start Date</div>
                        <div style={styles.value}>{issue.leaveStartDate || "-"}</div>
                      </div>

                      <div style={styles.row}>
                        <div style={styles.label}>End Date</div>
                        <div style={styles.value}>{issue.leaveEndDate || "-"}</div>
                      </div>

                      <div style={styles.row}>
                        <div style={styles.label}>Total Days</div>
                        <div style={styles.value}>
                          {issue.leaveDays || 0} day{issue.leaveDays > 1 ? "s" : ""}
                        </div>
                      </div>
                    </>
                  )}

                  <div style={styles.block}>
                    <div style={styles.label}>Subject</div>
                    <div style={styles.subject}>{issue.subject}</div>
                  </div>

                  <div style={styles.block}>
                    <div style={styles.label}>Description</div>
                    <div style={styles.text}>{issue.description || "—"}</div>
                  </div>
                </div>

                <div style={styles.card}>
                  <div style={styles.sectionTitle}>Manager Review</div>

                  {isLeaveRequest && (
                    <div style={styles.quickActions}>
                      <button
                        style={styles.approveBtn}
                        onClick={() => quickAction("APPROVE")}
                        disabled={issue.status === "APPROVED"}
                      >
                        ✓ Approve Leave
                      </button>
                      <button
                        style={styles.rejectBtn}
                        onClick={() => quickAction("REJECT")}
                        disabled={issue.status === "REJECTED"}
                      >
                        ✕ Reject Leave
                      </button>
                    </div>
                  )}

                  <div style={styles.block}>
                    <div style={styles.label}>Update Status</div>
                    <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} style={styles.select}>
                      <option value="OPEN">OPEN</option>
                      <option value="IN_PROGRESS">IN PROGRESS</option>
                      <option value="RESOLVED">RESOLVED</option>
                      {isLeaveRequest && (
                        <>
                          <option value="APPROVED">APPROVED</option>
                          <option value="REJECTED">REJECTED</option>
                        </>
                      )}
                    </select>
                    <div style={{ marginTop: 10 }}>
                      <span style={badgeStyle(editStatus)}>{editStatus.replace("_", " ")}</span>
                    </div>
                  </div>

                  <div style={styles.block}>
                    <div style={styles.label}>Manager Remark</div>
                    <textarea
                      value={remark}
                      onChange={(e) => setRemark(e.target.value)}
                      placeholder={isLeaveRequest
                        ? "Add approval/rejection reason or any notes..."
                        : "Add a remark (what you checked / what action you will take)..."}
                      rows={6}
                      style={styles.textarea}
                    />
                  </div>

                  <div style={styles.helpBox}>
                    <div style={{ fontWeight: 1000 }}>Note</div>
                    <div style={{ marginTop: 6 }}>
                      {isLeaveRequest
                        ? "Keep remarks clear. Specify approval/rejection reasons for the employee to understand."
                        : "Keep remarks short and clear for the accountant and the employee to understand."}
                    </div>
                  </div>
                </div>
              </div>

              {savedToast ? <div style={styles.toast}>Saved ✅</div> : null}
            </>
          )}
        </div>
      </div>
    </AppLayout >
  );
}

const styles = {
  page: { position: "relative", minHeight: "100%", overflow: "hidden" },
  container: { padding: 24, position: "relative", zIndex: 1, display: "grid", gap: 16 },

  topRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
    flexWrap: "wrap",
    marginBottom: 20
  },

  title: { margin: 0, fontSize: 26, fontWeight: 800, color: "#2c5530" },
  subTitle: { marginTop: 6, marginBottom: 0, opacity: 0.8, color: "#4b5563" },

  grid: { display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 },

  card: {
    padding: 24,
    background: "var(--glass-bg)",
    backdropFilter: "var(--glass-blur)",
    WebkitBackdropFilter: "var(--glass-blur)",
    border: "var(--glass-border)",
    borderRadius: 18,
    boxShadow: "var(--glass-shadow)",
  },

  sectionTitle: { fontWeight: 800, marginBottom: 16, color: "#111827", fontSize: 16, borderBottom: "1px solid rgba(0,0,0,0.06)", paddingBottom: 12 },

  row: {
    display: "grid",
    gridTemplateColumns: "140px 1fr",
    gap: 12,
    alignItems: "center",
    padding: "10px 0",
    borderBottom: "1px solid rgba(15,23,42,0.06)",
  },

  label: { fontSize: 13, color: "#64748b", fontWeight: 700, textTransform: "uppercase" },
  value: { fontSize: 14, color: "#0f172a", fontWeight: 600 },
  valueMono: {
    fontSize: 13,
    color: "#0f172a",
    fontWeight: 700,
    fontFamily: "monospace"
  },

  block: { display: "grid", gap: 8, paddingTop: 16 },
  subject: { fontSize: 16, fontWeight: 800, color: "#111827" },
  text: { fontSize: 14, color: "#374151", lineHeight: 1.6 },

  quickActions: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
    marginBottom: 20,
  },

  approveBtn: {
    height: 44,
    borderRadius: 12,
    border: "1px solid rgba(4,120,87,0.3)",
    background: "#d1fae5",
    color: "#065f46",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 14,
    transition: "background 0.2s"
  },

  rejectBtn: {
    height: 44,
    borderRadius: 12,
    border: "1px solid rgba(153,27,27,0.3)",
    background: "#fee2e2",
    color: "#991b1b",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 14,
    transition: "background 0.2s"
  },

  select: {
    width: "100%",
    height: 42,
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    padding: "0 12px",
    outline: "none",
    background: "#fff",
    fontWeight: 600,
    fontSize: 14
  },

  textarea: {
    width: "100%",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    padding: 12,
    outline: "none",
    background: "#fff",
    fontWeight: 500,
    resize: "vertical",
    fontSize: 14,
    lineHeight: 1.5
  },

  helpBox: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    border: "1px dashed rgba(15,23,42,0.18)",
    background: "rgba(248, 250, 252, 0.5)",
    color: "#475569",
    fontSize: 13,
    lineHeight: 1.5,
  },

  primaryBtn: {
    height: 42,
    padding: "0 20px",
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(135deg, #4a7c4e 0%, #5a8c5e 100%)",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
    whiteSpace: "nowrap",
    boxShadow: "0 4px 12px rgba(74, 124, 78, 0.25)",
    fontSize: 14
  },
  secondaryBtn: {
    height: 42,
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

  toast: {
    position: "fixed",
    right: 24,
    bottom: 24,
    background: "#111827",
    color: "#fff",
    padding: "12px 20px",
    borderRadius: 12,
    fontWeight: 700,
    boxShadow: "0 10px 24px rgba(0,0,0,0.2)",
    zIndex: 100
  },
};