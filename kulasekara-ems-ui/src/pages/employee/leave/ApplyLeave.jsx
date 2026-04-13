import React, { useMemo, useState, useEffect } from "react";
import AppLayout from "../../../components/layout/AppLayout";
import { leaveService } from "../../../services/leaveService";

// helpers
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

const daysBetweenInclusive = (from, to) => {
  const a = new Date(from);
  const b = new Date(to);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return 0;
  const diff = Math.round((b - a) / (1000 * 60 * 60 * 24));
  return diff + 1;
};

const fmtDate = (d) => {
  const x = new Date(d);
  if (Number.isNaN(x.getTime())) return d;
  return x.toISOString().slice(0, 10);
};

const KpiCard = ({ title, value, hint }) => (
  <div className="card kpi-card">
    <div className="kpi-label">{title}</div>
    <div className="kpi-value">{value}</div>
    {hint && <div className="kpi-hint">{hint}</div>}
  </div>
);

export default function ApplyLeave() {
  const employee_id = localStorage.getItem("employee_id") || "EMP001";

  const [myRequests, setMyRequests] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyLeaves();
    fetchTypes();
  }, []);

  const fetchTypes = async () => {
    try {
      const data = await leaveService.fetchLeaveTypes("EMPLOYEE");
      setLeaveTypes(data);
      if (data && data.length > 0) {
        setForm((p) => ({ ...p, leave_type_id: data[0].id }));
      }
    } catch (err) {
      console.error("Failed to fetch leave types:", err);
    }
  };

  const fetchMyLeaves = async () => {
    try {
      const data = await leaveService.fetchMyLeaveRequests();
      setMyRequests(data);
    } catch (err) {
      console.error("Failed to load requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const [form, setForm] = useState({
    leave_type_id: "",
    start_date: "",
    end_date: "",
    reason: "",
  });

  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");

  const kpis = useMemo(() => {
    const pending = myRequests.filter((r) => r.status === "PENDING").length;
    const approved = myRequests.filter((r) => r.status === "APPROVED").length;
    const rejected = myRequests.filter((r) => r.status === "REJECTED").length;
    return { pending, approved, rejected };
  }, [myRequests]);

  const validate = () => {
    const e = {};
    if (!form.leave_type_id) e.leave_type_id = "Leave type is required.";
    if (!form.start_date) e.start_date = "Start date is required.";
    if (!form.end_date) e.end_date = "End date is required.";

    if (form.start_date && form.end_date) {
      const a = new Date(form.start_date);
      const b = new Date(form.end_date);
      if (b < a) e.end_date = "End date must be same or after start date.";
    }

    if ((form.reason || "").length > 255) e.reason = "Reason must be within 255 characters.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    setSuccessMsg("");
    if (!validate()) return;

    try {
      await leaveService.submitLeaveRequest({
        leave_type_id: form.leave_type_id,
        start_date: form.start_date,
        end_date: form.end_date,
        reason: form.reason?.trim() || null,
      });

      // Refresh list
      await fetchMyLeaves();

      setForm({ leave_type_id: leaveTypes.length > 0 ? leaveTypes[0].id : "", start_date: "", end_date: "", reason: "" });
      setErrors({});
      setSuccessMsg("Leave request submitted successfully.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      alert("Failed to submit request.");
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
          
          .emp-badge { padding: 10px 16px; border-radius: 12px; background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(8px); border: 1px solid rgba(255, 255, 255, 0.5); font-weight: 800; color: #2c5530; font-size: 13px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); }

          .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 24px; }
          .card { background: var(--glass-bg); backdrop-filter: var(--glass-blur); -webkit-backdrop-filter: var(--glass-blur); border: var(--glass-border); border-radius: 20px; padding: 24px; box-shadow: var(--glass-shadow); }
          .kpi-label { font-size: 11px; font-weight: 800; color: #6b7280; text-transform: uppercase; margin-bottom: 8px; }
          .kpi-value { font-size: 32px; font-weight: 900; color: #1f2937; margin-bottom: 4px; }
          .kpi-hint { font-size: 13px; color: #9ca3af; font-weight: 600; }

          .form-card { margin-bottom: 24px; }
          .form-title { font-size: 16px; font-weight: 900; color: #1f2937; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 0.5px; }

          .label { display: block; margin-bottom: 8px; font-weight: 800; font-size: 11px; color: #6b7280; text-transform: uppercase; }
          .input, .select, .textarea { width: 100%; padding: 12px 16px; border-radius: 12px; border: 1px solid #e5e7eb; font-size: 14px; font-weight: 700; outline: none; background: #fff; transition: all 0.2s; }
          .input:focus, .select:focus, .textarea:focus { border-color: #4a7c4e; box-shadow: 0 0 0 3px rgba(74, 124, 78, 0.1); }
          .input-error { border-color: #ef4444 !important; }
          .error-text { font-size: 11px; color: #ef4444; font-weight: 700; margin-top: 4px; display: block; text-transform: uppercase;}

          .btn-group { display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px; }
          .btn { padding: 12px 24px; border-radius: 12px; font-weight: 800; font-size: 14px; cursor: pointer; transition: all 0.2s; border: 1px solid #d1d5db; color: #374151; background: #fff; text-transform: uppercase; }
          .btn:hover { background: #f9fafb; transform: translateY(-1px); }
          .btn-primary { background: linear-gradient(135deg, #4a7c4e 0%, #5a8c5e 100%); color: #fff; border: none; box-shadow: 0 4px 15px rgba(74, 124, 78, 0.15); }
          .btn-ghost { background: transparent; border: 1px solid #e5e7eb; }

          .table-card { padding: 0; overflow: hidden; }
          .table-header { padding: 20px 24px; border-bottom: 1px solid rgba(0,0,0,0.05); display: flex; justify-content: space-between; align-items: center; }
          .table-title { font-size: 16px; font-weight: 900; color: #1f2937; text-transform: uppercase; }
          .table-wrap { overflow-x: auto; }
          .table { width: 100%; border-collapse: collapse; }
          .table th { background: #f9fafb; padding: 14px 20px; text-align: left; font-size: 11px; font-weight: 800; color: #6b7280; text-transform: uppercase; border-bottom: 1px solid #f3f4f6; }
          .table td { padding: 14px 20px; font-size: 13px; color: #374151; border-bottom: 1px solid #f3f4f6; font-weight: 600; transition: background 0.2s; }
          .table tr:hover td { background: #f9fafb; }
          .mono { font-family: monospace; font-size: 12px; color: #111827; }

          .alert-success { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; padding: 14px; border-radius: 12px; font-weight: 800; font-size: 13px; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }

          @media (max-width: 800px) {
            .grid-cols-4 { grid-template-columns: repeat(2, 1fr) !important; }
          }
          @media (max-width: 600px) {
            .page-container { padding: 20px; }
            .header-row { flex-direction: column; align-items: stretch; }
            .grid-cols-4 { grid-template-columns: 1fr !important; }
          }
        `}</style>

        <div className="floating-circle fc-1"></div>
        <div className="floating-circle fc-2"></div>
        <div className="floating-circle fc-3"></div>

        <div className="page-container">
          <div className="header-row">
            <div className="title-group">
              <h2 className="title">Apply Leave</h2>
              <p className="sub">Submit a leave request and track your request status</p>
            </div>
            <div className="emp-badge">
              Employee ID: {employee_id}
            </div>
          </div>

          <div className="kpi-grid">
            <KpiCard title="Pending" value={kpis.pending} hint="Waiting for review" />
            <KpiCard title="Approved" value={kpis.approved} hint="Leave confirmed" />
            <KpiCard title="Rejected" value={kpis.rejected} hint="Not approved" />
          </div>

          <div className="card form-card">
            <h3 className="form-title">New Leave Request</h3>

            {successMsg && (
              <div className="alert-success">
                <span>check_circle</span> {successMsg}
              </div>
            )}

            <form onSubmit={onSubmit}>
              <div className="grid-cols-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px" }}>
                <div>
                  <label className="label">Leave Type</label>
                  <select
                    className="select"
                    value={form.leave_type_id}
                    onChange={(e) => setForm((p) => ({ ...p, leave_type_id: e.target.value }))}
                  >
                    {leaveTypes.map((type) => (
                      <option key={type.id || type.type_name} value={type.id}>
                        {type.type_name}
                      </option>
                    ))}
                  </select>
                  {errors.leave_type_id && <span className="error-text">{errors.leave_type_id}</span>}
                </div>

                <div>
                  <label className="label">Start Date</label>
                  <input
                    type="date"
                    className={`input ${errors.start_date ? 'input-error' : ''}`}
                    value={form.start_date}
                    onChange={(e) => setForm((p) => ({ ...p, start_date: e.target.value }))}
                  />
                  {errors.start_date && <span className="error-text">{errors.start_date}</span>}
                </div>

                <div>
                  <label className="label">End Date</label>
                  <input
                    type="date"
                    className={`input ${errors.end_date ? 'input-error' : ''}`}
                    value={form.end_date}
                    onChange={(e) => setForm((p) => ({ ...p, end_date: e.target.value }))}
                  />
                  {errors.end_date && <span className="error-text">{errors.end_date}</span>}
                </div>

                <div>
                  <label className="label">Days</label>
                  <div className="input" style={{ background: "rgba(0,0,0,0.02)", display: "flex", alignItems: "center" }}>
                    {form.start_date && form.end_date ? daysBetweenInclusive(form.start_date, form.end_date) : "—"}
                  </div>
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label className="label">Reason (Optional)</label>
                  <textarea
                    className="textarea"
                    rows={3}
                    placeholder="Provide a reason for your leave..."
                    value={form.reason}
                    onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                    {errors.reason ? <span className="error-text">{errors.reason}</span> : <span />}
                    <span style={{ fontSize: 11, fontWeight: 800, color: "#9ca3af" }}>
                      {(form.reason || "").length}/255
                    </span>
                  </div>
                </div>
              </div>

              <div className="btn-group">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setForm({ leave_type_id: leaveTypes.length > 0 ? leaveTypes[0].id : "", start_date: "", end_date: "", reason: "" });
                    setErrors({});
                  }}
                >
                  Clear
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Request
                </button>
              </div>
            </form>
          </div>

          <div className="card table-card">
            <div className="table-header">
              <h3 className="table-title">My Leave Requests</h3>
              <div style={{ fontSize: 13, color: "#6b7280", fontWeight: 800 }}>
                {myRequests.length} Total Requests
              </div>
            </div>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Leave ID</th>
                    <th>Type</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Days</th>
                    <th>Reason</th>
                    <th>Remark</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={7} style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>Loading...</td></tr>
                  ) : myRequests.length === 0 ? (
                    <tr><td colSpan={7} style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>No leave requests found.</td></tr>
                  ) : (
                    myRequests.map((r) => (
                      <tr key={r.leave_id}>
                        <td className="mono">#{r.leave_id}</td>
                        <td>{r.leave_type}</td>
                        <td>{fmtDate(r.start_date)}</td>
                        <td>{fmtDate(r.end_date)}</td>
                        <td>{daysBetweenInclusive(r.start_date, r.end_date)}</td>
                        <td>
                          <div style={{ maxWidth: 200, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={r.reason}>
                            {r.reason || "—"}
                          </div>
                        </td>
                        <td>
                          <div style={{ maxWidth: 200, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "#6b7280" }} title={r.manager_remark}>
                            {r.manager_remark || "—"}
                          </div>
                        </td>
                        <td><Badge status={r.status} /></td>
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
