import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppLayout from "../../../components/layout/AppLayout";

const STORAGE_KEY = "kulasekara_manager_issues_v1";

function loadIssues() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
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
      <div style={styles.wrap}>
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
    </AppLayout>
  );
}

const styles = {
  wrap: { padding: 20, display: "grid", gap: 16 },

  topRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
    flexWrap: "wrap",
  },

  title: { fontSize: 22, fontWeight: 1000, color: "#0f172a" },
  subTitle: { marginTop: 6, fontSize: 13, color: "#64748b" },

  grid: { display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 14 },

  card: {
    background: "#fff",
    border: "1px solid rgba(15,23,42,0.08)",
    borderRadius: 14,
    padding: 14,
    boxShadow: "0 8px 18px rgba(2,6,23,0.04)",
  },

  sectionTitle: { fontWeight: 1000, marginBottom: 12, color: "#0f172a" },

  row: {
    display: "grid",
    gridTemplateColumns: "140px 1fr",
    gap: 10,
    alignItems: "center",
    padding: "10px 0",
    borderBottom: "1px solid rgba(15,23,42,0.06)",
  },

  label: { fontSize: 12, color: "#64748b", fontWeight: 1000 },
  value: { fontSize: 13, color: "#0f172a", fontWeight: 900 },
  valueMono: {
    fontSize: 12,
    color: "#0f172a",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    fontWeight: 1000,
  },

  block: { display: "grid", gap: 6, paddingTop: 12 },
  subject: { fontSize: 15, fontWeight: 1000, color: "#0f172a" },
  text: { fontSize: 13, color: "#334155", lineHeight: 1.5 },

  quickActions: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    marginBottom: 16,
  },

  approveBtn: {
    height: 42,
    borderRadius: 12,
    border: "1px solid rgba(4,120,87,0.3)",
    background: "#d1fae5",
    color: "#065f46",
    fontWeight: 1000,
    cursor: "pointer",
    fontSize: 13,
  },

  rejectBtn: {
    height: 42,
    borderRadius: 12,
    border: "1px solid rgba(153,27,27,0.3)",
    background: "#fee2e2",
    color: "#991b1b",
    fontWeight: 1000,
    cursor: "pointer",
    fontSize: 13,
  },

  select: {
    width: "100%",
    height: 40,
    borderRadius: 12,
    border: "1px solid rgba(15,23,42,0.12)",
    padding: "0 12px",
    outline: "none",
    background: "#fff",
    fontWeight: 900,
  },

  textarea: {
    width: "100%",
    borderRadius: 12,
    border: "1px solid rgba(15,23,42,0.12)",
    padding: 12,
    outline: "none",
    background: "#fff",
    fontWeight: 800,
    resize: "vertical",
  },

  helpBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    border: "1px dashed rgba(15,23,42,0.18)",
    background: "#f8fafc",
    color: "#334155",
    fontSize: 13,
    lineHeight: 1.5,
  },

  primaryBtn: {
    height: 40,
    padding: "0 14px",
    borderRadius: 12,
    border: "1px solid rgba(15,23,42,0.12)",
    background: "#0f172a",
    color: "#fff",
    fontWeight: 1000,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
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

  toast: {
    position: "fixed",
    right: 20,
    bottom: 20,
    background: "#0f172a",
    color: "#fff",
    padding: "10px 14px",
    borderRadius: 12,
    fontWeight: 1000,
    boxShadow: "0 10px 24px rgba(2,6,23,0.22)",
  },
};