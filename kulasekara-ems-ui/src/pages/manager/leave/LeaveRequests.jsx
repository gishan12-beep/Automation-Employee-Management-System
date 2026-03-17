import React, { useMemo, useState, useEffect } from "react";
import AppLayout from "../../../components/layout/AppLayout";
import { leaveService } from "../../../services/leaveService";

// Helpers
const daysBetweenInclusive = (from, to) => {
  const a = new Date(from);
  const b = new Date(to);
  const diff = Math.round((b - a) / (1000 * 60 * 60 * 24));
  return diff + 1;
};

const fmtDate = (d) => {
  const x = new Date(d);
  if (Number.isNaN(x.getTime())) return d;
  return x.toISOString().slice(0, 10);
};

const Badge = ({ status }) => {
  const s = (status || "PENDING").toUpperCase();
  const cfg = {
    PENDING: { bg: "#fef9c3", fg: "#854d0e", border: "#fef08a", text: "PENDING" },
    APPROVED: { bg: "#dcfce7", fg: "#166534", border: "#bbf7d0", text: "APPROVED" },
    REJECTED: { bg: "#fef2f2", fg: "#991b1b", border: "#fecaca", text: "REJECTED" },
  }[s] || { bg: "#f3f4f6", fg: "#4b5563", border: "#e5e7eb", text: s };

  return (
    <span
      className="badge"
      style={{
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 800,
        color: cfg.fg,
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        textTransform: "uppercase",
      }}
    >
      {cfg.text}
    </span>
  );
};

const KpiCard = ({ title, value, hint }) => (
  <div className="card kpi-card">
    <div className="kpi-label">{title}</div>
    <div className="kpi-value">{value}</div>
    {hint && <div className="kpi-hint">{hint}</div>}
  </div>
);

const Drawer = ({ open, onClose, title, children }) => {
  if (!open) return null;

  return (
    <div className="drawer-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="drawer-content">
        <div className="drawer-header">
          <div>
            <h3 className="drawer-title">{title}</h3>
            <p className="drawer-subtitle">Review leave request details and respond</p>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="drawer-body">{children}</div>
      </div>
    </div>
  );
};

const Field = ({ label, value }) => (
  <div className="field-group">
    <div className="field-label">{label}</div>
    <div className="field-value">{value}</div>
  </div>
);

export default function LeaveRequests() {
  const [requests, setRequests] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaves();
    fetchTypes();
  }, []);

  const fetchTypes = async () => {
    try {
      const data = await leaveService.fetchLeaveTypes("MANAGER");
      setLeaveTypes(data);
    } catch (err) {
      console.error("Failed to load types:", err);
    }
  };

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

  const kpis = useMemo(() => {
    const pending = requests.filter((r) => r.status === "PENDING").length;
    const approved = requests.filter((r) => r.status === "APPROVED").length;
    const rejected = requests.filter((r) => r.status === "REJECTED").length;
    return { pending, approved, rejected };
  }, [requests]);

  const openReview = (req) => {
    setSelected(req);
    setRemark(req.manager_remark || "");
    setDrawerOpen(true);
  };

  const closeReview = () => {
    setDrawerOpen(false);
    setSelected(null);
    setRemark("");
  };

  const updateStatus = async (newStatus) => {
    if (!selected) return;
    if (newStatus === "REJECTED" && !(remark || "").trim()) {
      alert("Please add a remark before rejecting.");
      return;
    }

    try {
      await leaveService.updateLeaveRequestStatus(selected.leave_id, newStatus, remark);
      // Update local state
      setRequests((p) => p.map((r) => (r.leave_id === selected.leave_id ? { ...r, status: newStatus, manager_remark: remark } : r)));
      setSelected((p) => (p ? { ...p, status: newStatus, manager_remark: remark } : p));
      closeReview();
    } catch (error) {
      alert("Failed to update status. Please try again.");
    }
  };

  return (
    <AppLayout>
      <div className="page-wrapper">
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

          .page-wrapper { position: relative; min-height: 100%; overflow: hidden; }
          .page-container { padding: 30px; position: relative; z-index: 1; max-width: 1300px; margin: 0 auto; }
          
          .header-row { display: flex; justify-content: space-between; gap: 20px; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; }
          .title-group .title { font-size: 28px; font-weight: 900; color: #2c5530; margin: 0 0 8px 0; }
          .title-group .sub { color: #4b5563; font-size: 15px; margin: 0; font-weight: 500;}
          
          .btn-group { display: flex; gap: 12px; }
          .btn { padding: 10px 20px; border-radius: 12px; font-weight: 800; font-size: 13px; cursor: pointer; transition: all 0.2s; border: 1px solid #d1d5db; color: #374151; background: #fff; }
          .btn:hover { background: #f9fafb; transform: translateY(-1px); }
          .btn-primary { background: linear-gradient(135deg, #4a7c4e 0%, #5a8c5e 100%); color: #fff; border: none; box-shadow: 0 4px 15px rgba(74, 124, 78, 0.15); }

          .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 24px; }
          .card { background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.5); border-radius: 20px; padding: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.03); }
          .kpi-label { font-size: 11px; font-weight: 800; color: #6b7280; text-transform: uppercase; margin-bottom: 8px; }
          .kpi-value { font-size: 32px; font-weight: 900; color: #1f2937; margin-bottom: 4px; }
          .kpi-hint { font-size: 13px; color: #9ca3af; font-weight: 600; }

          .filter-card { margin-bottom: 24px; padding: 20px; }
          .filter-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px; align-items: flex-end; }
          .label { display: block; margin-bottom: 8px; font-weight: 800; font-size: 11px; color: #6b7280; text-transform: uppercase; }
          .input, .select { width: 100%; padding: 10px 14px; border-radius: 12px; border: 1px solid #e5e7eb; font-size: 13px; font-weight: 700; outline: none; background: #fff; }
          .input:focus, .select:focus { border-color: #4a7c4e; box-shadow: 0 0 0 3px rgba(74, 124, 78, 0.1); }

          .table-card { padding: 0; overflow: hidden; }
          .table-header { padding: 20px 24px; border-bottom: 1px solid rgba(0,0,0,0.05); display: flex; justify-content: space-between; align-items: center; }
          .table-title { font-size: 16px; font-weight: 900; color: #1f2937; }
          .table-wrap { overflow-x: auto; }
          .table { width: 100%; border-collapse: collapse; }
          .table th { background: #f9fafb; padding: 14px 20px; text-align: left; font-size: 11px; font-weight: 800; color: #6b7280; text-transform: uppercase; border-bottom: 1px solid #f3f4f6; }
          .table td { padding: 14px 20px; font-size: 13px; color: #374151; border-bottom: 1px solid #f3f4f6; font-weight: 600; transition: background 0.2s; }
          .table tr:hover td { background: #f9fafb; }
          .mono { font-family: monospace; font-size: 12px; color: #111827; }

          /* DRAWER */
          .drawer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); z-index: 1000; display: flex; justify-content: flex-end; }
          .drawer-content { width: min(560px, 100%); background: #fff; height: 100%; display: flex; flex-direction: column; animation: slideIn 0.3s ease-out; }
          @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
          .drawer-header { padding: 24px; border-bottom: 1px solid #f3f4f6; display: flex; justify-content: space-between; align-items: flex-start; }
          .drawer-title { margin: 0; font-size: 18px; font-weight: 900; color: #1f2937; }
          .drawer-subtitle { margin: 4px 0 0; font-size: 13px; color: #6b7280; font-weight: 600; }
          .close-btn { background: none; border: none; font-size: 28px; color: #9ca3af; cursor: pointer; }
          .drawer-body { padding: 24px; flex: 1; overflow-y: auto; }
          
          .drawer-card { background: #f9fafb; border: 1px solid #f3f4f6; border-radius: 16px; padding: 20px; margin-bottom: 20px; }
          .field-group { margin-bottom: 16px; }
          .field-label { font-size: 11px; font-weight: 800; color: #9ca3af; text-transform: uppercase; margin-bottom: 4px; }
          .field-value { font-size: 15px; font-weight: 700; color: #1f2937; }
          .reason-box { padding: 16px; background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; font-size: 14px; line-height: 1.6; color: #4b5563; font-weight: 500; }
          
          .textarea { width: 100%; padding: 14px; border-radius: 12px; border: 1px solid #e5e7eb; font-size: 14px; font-weight: 600; outline: none; resize: vertical; margin-bottom: 20px; }
          .textarea:focus { border-color: #4a7c4e; box-shadow: 0 0 0 3px rgba(74, 124, 78, 0.1); }
          
          .drawer-foot { display: flex; gap: 12px; margin-top: auto; }
          .btn-approve { background: #166534; color: #fff; border: none; border-radius: 12px; font-weight: 800; cursor: pointer;}
          .btn-reject { background: #991b1b; color: #fff; border: none; border-radius: 12px; font-weight: 800; cursor: pointer;}
          .btn-approve:disabled, .btn-reject:disabled { opacity: 0.5; cursor: not-allowed; }

          @media (max-width: 600px) {
            .page-container { padding: 20px; }
            .header-row { flex-direction: column; align-items: stretch; }
            .btn-group { justify-content: stretch; }
            .btn-group .btn { flex: 1; }
          }
        `}</style>

        <div className="floating-circle fc-1"></div>
        <div className="floating-circle fc-2"></div>
        <div className="floating-circle fc-3"></div>

        <div className="page-container">
          <div className="header-row">
            <div className="title-group">
              <h2 className="title">Leave Requests</h2>
              <p className="sub">Review and respond to employee leave applications</p>
            </div>
            <div className="btn-group">
              <button className="btn" onClick={() => alert("Coming soon...")}>Export</button>
              <button className="btn" onClick={() => setFilters({ q: "", status: "ALL", type: "ALL", from: "", to: "" })}>Reset Filters</button>
            </div>
          </div>

          <div className="kpi-grid">
            <KpiCard title="Pending" value={kpis.pending} hint="Needs your review" />
            <KpiCard title="Approved" value={kpis.approved} hint="All time total" />
            <KpiCard title="Rejected" value={kpis.rejected} hint="All time total" />
          </div>

          <div className="card filter-card">
            <div className="filter-grid">
              <div>
                <label className="label">Search</label>
                <input
                  className="input"
                  value={filters.q}
                  onChange={(e) => setFilters((p) => ({ ...p, q: e.target.value }))}
                  placeholder="Employee / Leave ID"
                />
              </div>
              <div>
                <label className="label">Status</label>
                <select className="select" value={filters.status} onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}>
                  <option value="ALL">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
              <div>
                <label className="label">Leave Type</label>
                <select className="select" value={filters.type} onChange={(e) => setFilters((p) => ({ ...p, type: e.target.value }))}>
                  <option value="ALL">All Types</option>
                  {leaveTypes.map((t) => (
                    <option key={t.id || t.type_name} value={t.type_name}>
                      {t.type_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">From</label>
                <input className="input" type="date" value={filters.from} onChange={(e) => setFilters((p) => ({ ...p, from: e.target.value }))} />
              </div>
              <div>
                <label className="label">To</label>
                <input className="input" type="date" value={filters.to} onChange={(e) => setFilters((p) => ({ ...p, to: e.target.value }))} />
              </div>
            </div>
          </div>

          <div className="card table-card">
            <div className="table-header">
              <div className="table-title">Recent Requests</div>
              <div style={{ fontSize: 13, color: "#6b7280", fontWeight: 700 }}>{filtered.length} Requests Found</div>
            </div>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Leave ID</th>
                    <th>Employee</th>
                    <th>Type</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Days</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={9} style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>Loading...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={9} style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>No requests matching filters.</td></tr>
                  ) : (
                    filtered.map((r) => (
                      <tr key={r.leave_id}>
                        <td className="mono">#{r.leave_id}</td>
                        <td className="mono">{r.employee_id}</td>
                        <td>{r.leave_type}</td>
                        <td>{fmtDate(r.start_date)}</td>
                        <td>{fmtDate(r.end_date)}</td>
                        <td>{daysBetweenInclusive(r.start_date, r.end_date)}</td>
                        <td>
                          <div style={{ maxWidth: 200, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={r.reason}>
                            {r.reason}
                          </div>
                        </td>
                        <td><Badge status={r.status} /></td>
                        <td>
                          <button className="btn" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => openReview(r)}>View</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <Drawer open={drawerOpen} onClose={closeReview} title={`Review Leave #${selected?.leave_id}`}>
          {selected && (
            <>
              <div className="drawer-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                  <Field label="Employee ID" value={selected.employee_id} />
                  <Badge status={selected.status} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <Field label="Leave Type" value={selected.leave_type} />
                  <Field label="Duration" value={`${daysBetweenInclusive(selected.start_date, selected.end_date)} Days`} />
                  <Field label="Start Date" value={fmtDate(selected.start_date)} />
                  <Field label="End Date" value={fmtDate(selected.end_date)} />
                </div>
                <div style={{ marginTop: 10 }}>
                  <div className="field-label">Reason</div>
                  <div className="reason-box">{selected.reason}</div>
                </div>
              </div>

              <div className="drawer-card">
                <div className="field-label" style={{ marginBottom: 12 }}>Manager Remark</div>
                <textarea
                  className="textarea"
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="Add a remark for the employee..."
                  rows={4}
                  disabled={selected.status !== "PENDING"}
                />
                <div className="drawer-foot">
                  <button
                    className="btn btn-approve"
                    style={{ flex: 1, padding: "12px" }}
                    onClick={() => updateStatus("APPROVED")}
                    disabled={selected.status !== "PENDING"}
                  >
                    Approve Request
                  </button>
                  <button
                    className="btn btn-reject"
                    style={{ flex: 1, padding: "12px" }}
                    onClick={() => updateStatus("REJECTED")}
                    disabled={selected.status !== "PENDING"}
                  >
                    Reject Request
                  </button>
                </div>
              </div>
            </>
          )}
        </Drawer>
      </div>
    </AppLayout>
  );
}
