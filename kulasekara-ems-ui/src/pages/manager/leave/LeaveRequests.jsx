import React, { useMemo, useState, useEffect } from "react";
import AppLayout from "../../../components/layout/AppLayout";
import { leaveService } from "../../../services/leaveService";
import { 
  Calendar, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileText, 
  ArrowRight,
  MoreVertical,
  X,
  FileSpreadsheet,
  RotateCcw
} from "lucide-react";

// Helpers
// Calculates the number of days between two dates, including both the start and end days
const daysBetweenInclusive = (from, to) => {
  const a = new Date(from);
  const b = new Date(to);
  const diff = Math.round((b - a) / (1000 * 60 * 60 * 24));
  return diff + 1;
};

// Formats a date string into a standardized ISO format (YYYY-MM-DD)
const fmtDate = (d) => {
  const x = new Date(d);
  if (Number.isNaN(x.getTime())) return d;
  return x.toISOString().slice(0, 10);
};

// UI component that renders a stylized badge representing the status of a leave request
const Badge = ({ status }) => {
  const s = (status || "PENDING").toUpperCase();
  const cfg = {
    PENDING: { bg: "#fff7ed", fg: "#c2410c", border: "#ffedd5", icon: <Clock size={12} /> },
    APPROVED: { bg: "#ecfdf5", fg: "#047857", border: "#d1fae5", icon: <CheckCircle2 size={12} /> },
    REJECTED: { bg: "#fef2f2", fg: "#b91c1c", border: "#fee2e2", icon: <XCircle size={12} /> },
  }[s] || { bg: "#f8fafc", fg: "#475569", border: "#e2e8f0", icon: <Clock size={12} /> };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "4px 10px",
        borderRadius: "8px",
        fontSize: "11px",
        fontWeight: 800,
        color: cfg.fg,
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        textTransform: "uppercase",
        letterSpacing: "0.02em",
      }}
    >
      {cfg.icon}
      {s}
    </span>
  );
};

// Simple card component for displaying Key Performance Indicators (KPIs) in the dashboard
const KpiCard = ({ title, value, hint, color }) => (
  <div style={styles.kpiCard}>
    <div style={styles.kpiLabel}>{title}</div>
    <div style={{ ...styles.kpiValue, color: color || "#1e293b" }}>{value}</div>
    {hint && <div style={styles.kpiHint}>{hint}</div>}
  </div>
);

// Sliding drawer component for viewing and managing detailed leave request information
const Drawer = ({ open, onClose, title, children }) => {
  if (!open) return null;

  return (
    <div style={styles.drawerOverlay} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div style={styles.drawerContent} className="drawer-anim">
        <div style={styles.drawerHeader}>
          <div>
            <h3 style={styles.drawerTitle}>{title}</h3>
            <p style={styles.drawerSubtitle}>Review leave request details and respond</p>
          </div>
          <button style={styles.iconBtn} onClick={onClose}><X size={20} /></button>
        </div>
        <div style={styles.drawerBody}>{children}</div>
      </div>
    </div>
  );
};

// Utility component for rendering a labeled data field within the UI
const Field = ({ label, value }) => (
  <div style={styles.fieldGroup}>
    <div style={styles.label}>{label}</div>
    <div style={styles.fieldValue}>{value}</div>
  </div>
);

// Main component for the manager to review, filter, and respond to employee leave applications
export default function LeaveRequests() {
  const [requests, setRequests] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetches initial data for leave requests and types upon component mount
  useEffect(() => {
    fetchLeaves();
    fetchTypes();
  }, []);

  // Retrieves the available leave categories allowed for management review
  const fetchTypes = async () => {
    try {
      const data = await leaveService.fetchLeaveTypes("MANAGER");
      setLeaveTypes(data);
    } catch (err) {
      console.error("Failed to load types:", err);
    }
  };

  // Retrieves the complete list of employee leave applications from the backend
  const fetchLeaves = async () => {
    try {
      const data = await leaveService.fetchLeaveRequests();
      setRequests(data);
    } catch (err) {
      console.error("Failed to load requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const [filters, setFilters] = useState({ q: "", status: "ALL", type: "ALL", from: "", to: "" });
  const [selected, setSelected] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [remark, setRemark] = useState("");

  // Filters the request pool based on search queries, status, type, and date range
  const filtered = useMemo(() => {
    const q = (filters.q || "").trim().toLowerCase();
    return requests.filter((r) => {
      const okQ = !q || String(r.employee_id).toLowerCase().includes(q) || String(r.leave_id).toLowerCase().includes(q);
      const okStatus = filters.status === "ALL" || r.status === filters.status;
      const okType = filters.type === "ALL" || r.leave_type === filters.type;
      const okFrom = !filters.from || new Date(r.start_date) >= new Date(filters.from);
      const okTo = !filters.to || new Date(r.end_date) <= new Date(filters.to);
      return okQ && okStatus && okType && okFrom && okTo;
    });
  }, [requests, filters]);

  // Aggregates counts for pending, approved, and rejected requests for the dashboard KPIs
  const kpis = useMemo(() => {
    const pending = requests.filter((r) => r.status === "PENDING").length;
    const approved = requests.filter((r) => r.status === "APPROVED").length;
    const rejected = requests.filter((r) => r.status === "REJECTED").length;
    return { pending, approved, rejected };
  }, [requests]);

  // Opens the review drawer and populates it with the selected application's details
  const openReview = (req) => {
    setSelected(req);
    setRemark(req.manager_remark || "");
    setDrawerOpen(true);
  };

  // Resets the selection state and closes the review drawer
  const closeReview = () => {
    setDrawerOpen(false);
    setSelected(null);
    setRemark("");
  };

  // Synchronizes the updated request status and manager remarks with the backend database
  const updateStatus = async (newStatus) => {
    if (!selected) return;
    // Enforces mandatory remarks for rejected applications
    if (newStatus === "REJECTED" && !(remark || "").trim()) {
      alert("Please add a remark before rejecting.");
      return;
    }

    try {
      // Calls the service to persist the new status and optional manager feedback
      await leaveService.updateLeaveRequestStatus(selected.leave_id, newStatus, remark);
      // Updates the local state to reflect the change immediately in the UI
      setRequests((p) => p.map((r) => (r.leave_id === selected.leave_id ? { ...r, status: newStatus, manager_remark: remark } : r)));
      setSelected((p) => (p ? { ...p, status: newStatus, manager_remark: remark } : p));
      closeReview();
    } catch (error) {
      alert("Failed to update status. Please try again.");
    }
  };

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
          .drawer-anim { animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
          .table-row { transition: all 0.2s; cursor: pointer; }
          .table-row:hover { background: rgba(248, 250, 252, 0.8) !important; }
        `}</style>
        
        <div className="floating-circle fc-1"></div>
        <div className="floating-circle fc-2"></div>
        <div className="floating-circle fc-3"></div>

        <div style={styles.container}>
          {/* Header */}
          <div style={styles.pageHeader}>
            <div>
              <div style={styles.breadcrumb}>Manager / Leave Management</div>
              <h1 style={styles.pageTitle}>Leave Requests</h1>
              <p style={styles.pageSubtitle}>Review and manage employee leave applications</p>
            </div>
            <div style={styles.headerActions}>
              <button style={styles.btnSecondary} onClick={() => alert("Coming soon...")}>
                <FileSpreadsheet size={16} /> Export
              </button>
              <button style={styles.btnSecondary} onClick={() => setFilters({ q: "", status: "ALL", type: "ALL", from: "", to: "" })}>
                <RotateCcw size={16} /> Reset
              </button>
            </div>
          </div>

          {/* KPIs */}
          <div style={styles.kpiGrid} className="fade-in">
            <KpiCard title="Pending" value={kpis.pending} hint="Needs your review" color="#c2410c" />
            <KpiCard title="Approved" value={kpis.approved} hint="Approved total" color="#166534" />
            <KpiCard title="Rejected" value={kpis.rejected} hint="Rejected total" color="#991b1b" />
          </div>

          {/* Filters */}
          <div style={styles.filterCard} className="fade-in">
            <div style={styles.filterGrid}>
              <div>
                <label style={styles.label}>Search</label>
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <Search size={16} style={{ position: "absolute", left: 12, color: "#94a3b8" }} />
                  <input
                    style={{ ...styles.input, paddingLeft: "36px" }}
                    value={filters.q}
                    onChange={(e) => setFilters((p) => ({ ...p, q: e.target.value }))}
                    placeholder="Emp ID or Leave ID"
                  />
                </div>
              </div>
              <div>
                <label style={styles.label}>Status</label>
                <select style={styles.select} value={filters.status} onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}>
                  <option value="ALL">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
              <div>
                <label style={styles.label}>Leave Type</label>
                <select style={styles.select} value={filters.type} onChange={(e) => setFilters((p) => ({ ...p, type: e.target.value }))}>
                  <option value="ALL">All Types</option>
                  {leaveTypes.map((t) => (
                    <option key={t.id || t.type_name} value={t.type_name}>{t.type_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={styles.label}>From Date</label>
                <input style={styles.input} type="date" value={filters.from} onChange={(e) => setFilters((p) => ({ ...p, from: e.target.value }))} />
              </div>
              <div>
                <label style={styles.label}>To Date</label>
                <input style={styles.input} type="date" value={filters.to} onChange={(e) => setFilters((p) => ({ ...p, to: e.target.value }))} />
              </div>
            </div>
          </div>

          {/* Table */}
          <div style={styles.listCard} className="fade-in">
            <div style={styles.listHeader}>
              <h3 style={styles.listTitle}>Recent Applications</h3>
              <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 700 }}>{filtered.length} Requests Found</div>
            </div>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>EMPLOYEE</th>
                    <th style={styles.th}>TYPE</th>
                    <th style={styles.th}>DURATION</th>
                    <th style={styles.th}>STATUS</th>
                    <th style={{ ...styles.th, textAlign: "right" }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} style={{ textAlign: "center", padding: 60, color: "#94a3b8", fontWeight: 600 }}>Loading requests...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign: "center", padding: 60, color: "#94a3b8", fontWeight: 600 }}>No requests found</td></tr>
                  ) : (
                    filtered.map((r) => (
                      <tr key={r.leave_id} className="table-row">
                        <td style={{ ...styles.td, ...styles.mono }}>#{r.leave_id}</td>
                        <td style={styles.td}>
                          <div style={{ fontWeight: 700, color: "#1e293b" }}>{r.employee_id}</div>
                        </td>
                        <td style={styles.td}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 600 }}>
                            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#4a7c4e" }}></div>
                            {r.leave_type}
                          </div>
                        </td>
                        <td style={styles.td}>
                          <div style={{ fontWeight: 600 }}>{daysBetweenInclusive(r.start_date, r.end_date)} Days</div>
                          <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>{fmtDate(r.start_date)} → {fmtDate(r.end_date)}</div>
                        </td>
                        <td style={styles.td}><Badge status={r.status} /></td>
                        <td style={{ ...styles.td, textAlign: "right" }}>
                          <button style={styles.btnAction} onClick={() => openReview(r)}>
                            Review <ArrowRight size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* REVIEW DRAWER */}
        <Drawer open={drawerOpen} onClose={closeReview} title={`Request Details`}>
          {selected && (
            <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
              <div style={styles.drawerSection}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                  <Field label="Employee ID" value={selected.employee_id} />
                  <Badge status={selected.status} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <Field label="Leave Type" value={selected.leave_type} />
                  <Field label="Total Days" value={`${daysBetweenInclusive(selected.start_date, selected.end_date)} Days`} />
                  <Field label="From Date" value={fmtDate(selected.start_date)} />
                  <Field label="To Date" value={fmtDate(selected.end_date)} />
                </div>
                <div style={{ marginTop: "12px" }}>
                  <label style={styles.label}>Application Reason</label>
                  <div style={styles.reasonBox}>{selected.reason}</div>
                </div>
              </div>

              <div style={{ ...styles.drawerSection, flex: 1, marginBottom: 0 }}>
                <label style={styles.label}>Manager's Response (Optional for Approval)</label>
                <textarea
                  style={{ ...styles.textarea, height: "120px" }}
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="Enter remarks or reason for rejection..."
                  disabled={selected.status !== "PENDING"}
                />
                
                {selected.status === "PENDING" ? (
                  <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                    <button style={styles.btnApprove} onClick={() => updateStatus("APPROVED")}>
                      Approve Request
                    </button>
                    <button style={styles.btnReject} onClick={() => updateStatus("REJECTED")}>
                      Reject
                    </button>
                  </div>
                ) : (
                  <div style={{ padding: "16px", background: "#f1f5f9", borderRadius: "12px", textAlign: "center" }}>
                    <div style={styles.label}>Status Finalized</div>
                    <div style={{ fontWeight: 700, color: "#475569", marginTop: "4px" }}>
                      This request has already been {selected.status.toLowerCase()}
                    </div>
                  </div>
                )}
              </div>
              
              <div style={{ padding: "24px", textAlign: "center" }}>
                <button style={{ ...styles.btnSecondary, width: "100%" }} onClick={closeReview}>
                  Cancel / Close
                </button>
              </div>
            </div>
          )}
        </Drawer>
      </div>
    </AppLayout>
  );
}

const styles = {
  page: { minHeight: "100%", position: "relative", overflow: "hidden" },
  container: { padding: "32px", maxWidth: "1600px", margin: "0 auto", position: "relative", zIndex: 1 },
  breadcrumb: { fontSize: "11px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" },
  pageHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px", gap: "24px", flexWrap: "wrap" },
  pageTitle: { margin: 0, fontSize: "32px", fontWeight: 900, color: "#2c5530", letterSpacing: "-0.02em" },
  pageSubtitle: { margin: "4px 0 0 0", fontSize: "15px", color: "#64748b", fontWeight: 500 },
  headerActions: { display: "flex", gap: "10px" },
  btnSecondary: { 
    display: "flex", 
    alignItems: "center", 
    gap: "8px", 
    background: "#fff", 
    color: "#475569", 
    border: "1px solid #e2e8f0", 
    padding: "10px 18px", 
    borderRadius: "12px", 
    cursor: "pointer", 
    fontWeight: 700, 
    fontSize: "13px",
    transition: "all 0.2s"
  },
  kpiGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "32px" },
  kpiCard: { 
    background: "rgba(255, 255, 255, 0.9)", 
    backdropFilter: "blur(12px)",
    borderRadius: "24px", 
    padding: "24px", 
    border: "1px solid rgba(255, 255, 255, 0.5)", 
    boxShadow: "0 8px 30px rgba(0,0,0,0.02)" 
  },
  kpiLabel: { fontSize: "11px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" },
  kpiValue: { fontSize: "32px", fontWeight: 900, color: "#1e293b", letterSpacing: "-0.03em" },
  kpiHint: { fontSize: "12px", color: "#94a3b8", marginTop: "4px", fontWeight: 500 },
  filterCard: { 
    background: "rgba(255, 255, 255, 0.8)", 
    backdropFilter: "blur(12px)", 
    borderRadius: "24px", 
    padding: "24px", 
    border: "1px solid rgba(255, 255, 255, 0.5)", 
    boxShadow: "0 4px 20px rgba(0,0,0,0.02)", 
    marginBottom: "32px" 
  },
  filterGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "20px", alignItems: "flex-end" },
  label: { display: "block", fontSize: "11px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" },
  fieldValue: { fontSize: "15px", fontWeight: 700, color: "#1e293b" },
  input: { 
    width: "100%", 
    padding: "12px 14px", 
    borderRadius: "12px", 
    border: "1px solid #e2e8f0", 
    outline: "none", 
    fontSize: "14px", 
    fontWeight: 600, 
    color: "#1e293b", 
    background: "#fff",
    transition: "border-color 0.2s"
  },
  select: { 
    width: "100%", 
    padding: "12px 14px", 
    borderRadius: "12px", 
    border: "1px solid #e2e8f0", 
    outline: "none", 
    fontSize: "14px", 
    fontWeight: 600, 
    color: "#1e293b", 
    background: "#fff", 
    cursor: "pointer",
    transition: "border-color 0.2s"
  },
  listCard: { 
    background: "rgba(255, 255, 255, 0.9)", 
    backdropFilter: "blur(12px)", 
    borderRadius: "24px", 
    overflow: "hidden", 
    boxShadow: "0 10px 30px rgba(0,0,0,0.03)", 
    border: "1px solid rgba(255, 255, 255, 0.5)" 
  },
  listHeader: { padding: "24px 32px", borderBottom: "1px solid rgba(0,0,0,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" },
  listTitle: { margin: 0, fontSize: "18px", fontWeight: 800, color: "#1e293b" },
  tableWrapper: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "separate", borderSpacing: 0 },
  th: { 
    padding: "16px 32px", 
    textAlign: "left", 
    fontSize: "11px", 
    fontWeight: 800, 
    color: "#94a3b8", 
    textTransform: "uppercase", 
    letterSpacing: "0.1em", 
    background: "rgba(248, 250, 252, 0.5)",
    borderBottom: "1px solid rgba(0,0,0,0.05)"
  },
  td: { padding: "20px 32px", fontSize: "14px", color: "#475569", borderBottom: "1px solid rgba(0,0,0,0.05)" },
  mono: { fontFamily: "monospace", fontWeight: 700, color: "#4a7c4e" },
  btnAction: { 
    display: "flex", 
    alignItems: "center", 
    gap: "8px", 
    padding: "8px 16px", 
    borderRadius: "10px", 
    border: "1px solid #e2e8f0", 
    background: "#fff", 
    color: "#4a7c4e", 
    fontWeight: 700, 
    fontSize: "13px", 
    cursor: "pointer", 
    transition: "all 0.2s" 
  },
  iconBtn: { width: "40px", height: "40px", borderRadius: "12px", border: "1px solid #e2e8f0", background: "rgba(248, 250, 252, 0.5)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#64748b" },
  drawerOverlay: { position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.3)", backdropFilter: "blur(8px)", display: "flex", justifyContent: "flex-end", zIndex: 1000 },
  drawerContent: { width: "min(560px, 100%)", background: "#fff", height: "100%", display: "flex", flexDirection: "column", boxShadow: "-10px 0 50px rgba(0,0,0,0.1)" },
  drawerHeader: { padding: "32px", borderBottom: "1px solid rgba(0,0,0,0.05)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  drawerTitle: { margin: 0, fontSize: "22px", fontWeight: 900, color: "#1e293b", letterSpacing: "-0.02em" },
  drawerSubtitle: { margin: "4px 0 0", fontSize: "14px", color: "#64748b", fontWeight: 500 },
  drawerBody: { padding: "32px", flex: 1, overflowY: "auto" },
  drawerSection: { background: "rgba(248, 250, 252, 0.5)", borderRadius: "20px", padding: "24px", border: "1px solid rgba(0,0,0,0.05)", marginBottom: "24px" },
  fieldGroup: { marginBottom: "12px" },
  reasonBox: { padding: "16px", background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "14px", color: "#475569", fontWeight: 500, lineHeight: "1.6" },
  textarea: { width: "100%", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0", outline: "none", fontSize: "14px", fontWeight: 600, color: "#1e293b", background: "#fff", resize: "none" },
  btnApprove: { flex: 1, height: "48px", background: "linear-gradient(135deg, #4a7c4e 0%, #5a8c5e 100%)", color: "#fff", border: "none", borderRadius: "12px", fontWeight: 700, fontSize: "14px", cursor: "pointer", boxShadow: "0 8px 20px rgba(74, 124, 78, 0.25)" },
  btnReject: { flex: 1, height: "48px", background: "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)", color: "#fff", border: "none", borderRadius: "12px", fontWeight: 700, fontSize: "14px", cursor: "pointer", boxShadow: "0 8px 20px rgba(220, 38, 38, 0.25)" },
};
