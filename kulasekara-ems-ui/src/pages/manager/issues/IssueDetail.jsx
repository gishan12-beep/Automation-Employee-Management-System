import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppLayout from "../../../components/layout/AppLayout";
import { getIssueByIdApi, resolveIssueApi } from "../../../services/issueService";

// Generates a style object for status and category badges in the detailed issue view
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

  if (["ATTENDANCE", "PAYROLL", "OTHER"].includes(type)) {
    return { ...base, background: "#f8fafc", color: "#0f172a" };
  }
  if (type === "OPEN") return { ...base, background: "#fff1f2", color: "#9f1239" };
  if (type === "RESOLVED") return { ...base, background: "#ecfdf5", color: "#047857" };
  if (type === "APPROVED") return { ...base, background: "#d1fae5", color: "#065f46" };
  if (type === "REJECTED") return { ...base, background: "#fee2e2", color: "#991b1b" };
  return { ...base, background: "#f1f5f9", color: "#0f172a" };
}

// Component for viewing full issue details and submitting manager responses/resolutions
export default function IssueDetail() {
  const { issueId } = useParams();
  const navigate = useNavigate();

  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editStatus, setEditStatus] = useState("OPEN");
  const [reply, setReply] = useState("");
  const [savedToast, setSavedToast] = useState(false);

  // Fetches core issue data upon component mount or when the issueId parameter changes
  useEffect(() => {
    fetchIssue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [issueId]);

  // Retrieves specific issue data and populates the local state with details and existing replies
  const fetchIssue = async () => {
    setLoading(true);
    try {
      const data = await getIssueByIdApi(issueId);
      setIssue(data);
      setEditStatus(data?.status || "OPEN");
      setReply(data?.reply || "");
    } catch (err) {
      console.error("Failed to fetch issue:", err);
    } finally {
      setLoading(false);
    }
  };

  // Submits the manager's review, including the updated status and final resolution reply
  async function save() {
    if (!issue) return;

    try {
      // Calls the issue service to persist resolution details in the database
      await resolveIssueApi(issueId, { status: editStatus, reply });
      setSavedToast(true);
      fetchIssue(); // Refresh local data to reflect saved changes
      setTimeout(() => setSavedToast(false), 1200); // Auto-hide success toast
    } catch (err) {
      console.error("Failed to save issue:", err);
      alert("Failed to update status.");
    }
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
              <div style={styles.title}>Issue Review</div>
              <div style={styles.subTitle}>
                Review the issue and update the status for tracking.
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button style={styles.secondaryBtn} onClick={() => navigate(-1)}>
                ← Back
              </button>
              <button style={styles.primaryBtn} onClick={save} disabled={!issue || loading}>
                Save
              </button>
            </div>
          </div>

          {loading ? (
            <div style={styles.card}>
              <div style={{ fontWeight: 1000, fontSize: 16 }}>Loading issue details...</div>
            </div>
          ) : !issue ? (
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
                  <div style={styles.sectionTitle}>Issue Summary</div>

                  <div style={styles.row}>
                    <div style={styles.label}>ID</div>
                    <div style={styles.valueMono}>#{issue.issue_id}</div>
                  </div>

                  <div style={styles.row}>
                    <div style={styles.label}>Employee</div>
                    <div style={styles.value}>
                      {issue.first_name} {issue.last_name} <span style={{ color: "#94a3b8" }}>({issue.employee_id})</span>
                    </div>
                  </div>

                  <div style={styles.row}>
                    <div style={styles.label}>Type</div>
                    <div style={styles.value}>
                      <span style={badgeStyle(issue.type)}>{String(issue.type || "").replace("_", " ")}</span>
                    </div>
                  </div>

                  <div style={styles.row}>
                    <div style={styles.label}>Status</div>
                    <div style={styles.value}>
                      <span style={badgeStyle(issue.status)}>{String(issue.status || "").replace("_", " ")}</span>
                    </div>
                  </div>

                  <div style={styles.row}>
                    <div style={styles.label}>Raised</div>
                    <div style={styles.value}>
                      {issue.created_at ? new Date(issue.created_at).toLocaleString() : "-"}
                    </div>
                  </div>

                  <div style={styles.block}>
                    <div style={styles.label}>Description</div>
                    <div style={styles.text}>{issue.description || "—"}</div>
                  </div>
                </div>

                <div style={styles.card}>
                  <div style={styles.sectionTitle}>Manager Review</div>

                  <div style={styles.block}>
                    <div style={styles.label}>Update Status</div>
                    <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} style={styles.select}>
                      <option value="OPEN">OPEN</option>
                      <option value="IN_PROGRESS">IN PROGRESS</option>
                      <option value="RESOLVED">RESOLVED</option>
                      <option value="APPROVED">APPROVED</option>
                      <option value="REJECTED">REJECTED</option>
                    </select>
                    <div style={{ marginTop: 10 }}>
                      <span style={badgeStyle(editStatus)}>{editStatus.replace("_", " ")}</span>
                    </div>
                  </div>

                  <div style={styles.block}>
                    <div style={styles.label}>Manager Remarks / Review</div>
                    <textarea
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      placeholder="Enter resolution details or notes..."
                      style={styles.textarea}
                    />
                  </div>

                  <div style={styles.helpBox}>
                    <div style={{ fontWeight: 1000 }}>Note</div>
                    <div style={{ marginTop: 6 }}>
                      Keep status updates accurate for the accountant and the employee to understand.
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