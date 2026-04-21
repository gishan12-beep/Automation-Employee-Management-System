import React, { useEffect, useState } from "react";
import AppLayout from "../../../components/layout/AppLayout";
import { getMyIssuesApi, createIssueApi } from "../../../services/issueService";

// Main component for employees to view the status of their reported issues and raise new ones
export default function IssueStatus() {
  const [issues, setIssues] = useState([]);
  const [selected, setSelected] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  const [showModal, setShowModal] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    type: "PAYROLL",
    description: "",
  });

  // Initializes the component by fetching existing issues and setting up responsive UI listeners
  useEffect(() => {
    fetchIssues();
    const onResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Retrieves all issues reported by the logged-in employee from the backend service
  const fetchIssues = async () => {
    setLoading(true);
    try {
      const data = await getMyIssuesApi();
      setIssues(data || []);
    } catch (err) {
      console.error("Failed to fetch issues:", err);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to update a specific field in the issue reporting form state
  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  // Handles the submission of a new issue report to the management system
  const submit = async (e) => {
    e.preventDefault();
    if (!form.description.trim()) {
      setMsg({ text: "Description is required.", type: "error" });
      return;
    }

    try {
      setMsg({ text: "Submitting...", type: "info" });
      // Calls the issue service to persist the new issue details in the database
      await createIssueApi({
        type: form.type,
        description: form.description.trim(),
      });

      setMsg({ text: "Issue reported successfully.", type: "success" });
      fetchIssues(); // Refresh the list to show the newly added issue

      // Automatically closes the modal and resets the form after a successful submission
      setTimeout(() => {
        setShowModal(false);
        setForm({ type: "PAYROLL", description: "" });
        setMsg({ text: "", type: "" });
      }, 1500);
    } catch (err) {
      setMsg({ text: err.response?.data?.message || "Failed to report issue.", type: "error" });
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
        `}</style>

        <div className="floating-circle fc-1"></div>
        <div className="floating-circle fc-2"></div>
        <div className="floating-circle fc-3"></div>

        <div className="page-container">
          <div className="header-row">
            <div>
              <h2 className="title">My Issues</h2>
              <p className="sub">
                Track issues you raised and their status.
              </p>
            </div>

            <div className="btn-row">
              <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                + Raise New Issue
              </button>
            </div>
          </div>

          <div className="main-grid">
            {/* LEFT – Issue List */}
            <div className="card list-card">
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Issue ID</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Created At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="4" className="empty-state">
                          Loading issues...
                        </td>
                      </tr>
                    ) : issues.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="empty-state">
                          No issues found.
                        </td>
                      </tr>
                    ) : (
                      issues.map((issue) => (
                        <tr
                          key={issue.issue_id}
                          onClick={() => setSelected(issue)}
                          className={selected?.issue_id === issue.issue_id ? "selected-row" : ""}
                        >
                          <td className="id-cell">#{issue.issue_id}</td>
                          <td className="type-cell">{issue.type}</td>
                          <td>
                            <span className={`badge ${issue.status === "RESOLVED" ? "badge-resolved" : "badge-pending"}`}>
                              {issue.status}
                            </span>
                          </td>
                          <td className="date-cell">
                            {new Date(issue.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* RIGHT – Issue Details */}
            <div className="card detail-card">
              {!selected ? (
                <div className="empty-selection">
                  <div className="icon">📝</div>
                  <p>Select an issue to view details.</p>
                </div>
              ) : (
                <div className="details">
                  <h3 className="detail-title">Issue Details</h3>

                  <div className="kv-grid">
                    <div className="kv-item">
                      <span className="kv-label">ID</span>
                      <span className="kv-value">#{selected.issue_id}</span>
                    </div>
                    <div className="kv-item">
                      <span className="kv-label">Type</span>
                      <span className="kv-value">{selected.type}</span>
                    </div>
                    <div className="kv-item">
                      <span className="kv-label">Status</span>
                      <span className="kv-value">
                        <span className={`badge ${selected.status === "RESOLVED" ? "badge-resolved" : "badge-pending"}`}>
                          {selected.status}
                        </span>
                      </span>
                    </div>
                    <div className="kv-item">
                      <span className="kv-label">Submitted On</span>
                      <span className="kv-value">{new Date(selected.created_at).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="description-box">
                    <div className="kv-label" style={{ marginBottom: 12 }}>Description</div>
                    <p className="description-text">{selected.description}</p>
                  </div>

                  {selected.reply && (
                    <div className="reply-box">
                      <div className="kv-label" style={{ marginBottom: 12, color: "#166534" }}>Resolution Reply</div>
                      <p className="reply-text">{selected.reply}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <p className="footer-note">
            UI-only page. Data is stored in localStorage under <b>issues</b>.
          </p>
        </div>

        {/* RAISE ISSUE MODAL */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-card">
              <div className="modal-head">
                <h3 className="modal-title">Raise New Issue</h3>
                <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
              </div>
              <div className="modal-body">
                <form onSubmit={submit}>
                  <div className="grid">
                    <div style={{ gridColumn: "span 2" }}>
                      <label className="label">Issue Type</label>
                      <select
                        value={form.type}
                        onChange={(e) => setField("type", e.target.value)}
                        className="input"
                      >
                        <option value="PAYROLL">PAYROLL</option>
                        <option value="ATTENDANCE">ATTENDANCE</option>
                        <option value="OTHER">OTHER</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ marginTop: 20 }}>
                    <label className="label">Description</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setField("description", e.target.value)}
                      placeholder="Describe your issue clearly..."
                      className="textarea"
                    />
                  </div>

                  {msg.text && (
                    <div className={`alert alert-${msg.type}`} style={{ marginTop: 16 }}>
                      {msg.text}
                    </div>
                  )}

                  <div className="modal-foot">
                    <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Submit Issue</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        <style>{`
          .page-wrapper { position: relative; min-height: 100%; overflow: hidden; }
          .page-container { padding: 30px; position: relative; z-index: 1; max-width: 1200px; margin: 0 auto; }
          
          .header-row { display: flex; justify-content: space-between; gap: 12px; alignItems: flex-start; margin-bottom: 24px; flex-wrap: wrap; }
          .title { font-size: 28px; font-weight: 900; color: #2c5530; margin: 0 0 8px 0; }
          .sub { color: #4b5563; font-size: 15px; margin: 0; }
          
          .btn-row { display: flex; gap: 12px; flex-wrap: wrap; justify-content: flex-end; }
          .btn { padding: 10px 20px; border-radius: 12px; font-weight: 800; font-size: 13px; cursor: pointer; transition: all 0.2s; background: #fff; border: 1px solid #d1d5db; color: #374151; }
          .btn:hover:not(:disabled) { background: #f9fafb; transform: translateY(-1px); }
          .btn-primary { background: linear-gradient(135deg, #4a7c4e 0%, #5a8c5e 100%); color: #fff; border: none; box-shadow: 0 4px 15px rgba(74, 124, 78, 0.25); }
          .btn-primary:hover:not(:disabled) { box-shadow: 0 6px 20px rgba(74, 124, 78, 0.35); }

          .main-grid { display: grid; grid-template-columns: ${isMobile ? "1fr" : "1.5fr 1fr"}; gap: 24px; }
          
          .card {
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.5);
            border-radius: 20px;
            padding: 24px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.03);
          }

          .table-wrap { overflow: auto; border-radius: 12px; border: 1px solid rgba(0,0,0,0.05); background: #fff; }
          .table { width: 100%; border-collapse: separate; border-spacing: 0; }
          .table th { background: #f9fafb; padding: 14px 16px; text-align: left; font-size: 11px; font-weight: 800; color: #6b7280; text-transform: uppercase; border-bottom: 1px solid #f3f4f6; }
          .table td { padding: 14px 16px; font-size: 13px; color: #374151; border-bottom: 1px solid #f3f4f6; cursor: pointer; transition: background 0.2s; font-weight: 600; }
          .table tr:last-child td { border-bottom: none; }
          .table tr:hover td { background: #f9fafb; }
          .selected-row td { background: #f0fdf4 !important; color: #166534 !important; }

          .badge { padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 800; text-transform: uppercase; }
          .badge-pending { background: #fef9c3; color: #854d0e; border: 1px solid #fef08a; }
          .badge-resolved { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }

          .empty-selection { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 300px; color: #9ca3af; }
          .empty-selection .icon { font-size: 48px; margin-bottom: 16px; opacity: 0.5; }
          
          .detail-title { margin: 0 0 24px 0; font-size: 18px; font-weight: 900; color: #1f2937; border-bottom: 1px solid rgba(0,0,0,0.05); padding-bottom: 16px; }
          .kv-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
          .kv-label { font-size: 11px; font-weight: 800; color: #6b7280; text-transform: uppercase; display: block; }
          .kv-value { font-size: 15px; font-weight: 700; color: #1f2937; margin-top: 4px; display: block; }
          
          .description-box { padding: 16px; background: rgba(0,0,0,0.02); border-radius: 12px; border: 1px solid rgba(0,0,0,0.03); margin-bottom: 16px; }
          .description-text { font-size: 14px; line-height: 1.6; color: #4b5563; margin: 0; white-space: pre-wrap; font-weight: 500;}
          
          .reply-box { padding: 16px; background: #f0fdf4; border-radius: 12px; border: 1px solid #bbf7d0; }
          .reply-text { font-size: 14px; line-height: 1.6; color: #166534; margin: 0; font-weight: 600; }

          /* MODAL STYLES */
          .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
          .modal-card { background: #fff; width: min(500px, 100%); border-radius: 24px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); overflow: hidden; animation: modalIn 0.3s ease-out; }
          @keyframes modalIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          
          .modal-head { padding: 20px 24px; border-bottom: 1px solid #f3f4f6; display: flex; justify-content: space-between; align-items: center; }
          .modal-title { margin: 0; font-weight: 900; color: #1f2937; font-size: 18px; }
          .close-btn { background: none; border: none; font-size: 24px; color: #9ca3af; cursor: pointer; padding: 4px; }
          .modal-body { padding: 24px; }
          
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
          .label { display: block; margin-bottom: 8px; font-weight: 800; font-size: 11px; color: #6b7280; text-transform: uppercase; }
          .input, .textarea { width: 100%; padding: 12px 14px; border-radius: 12px; border: 1px solid #e5e7eb; font-size: 14px; font-weight: 600; outline: none; }
          .textarea { height: 120px; resize: none; margin-bottom: 4px; }
          .input:focus, .textarea:focus { border-color: #4a7c4e; box-shadow: 0 0 0 3px rgba(74, 124, 78, 0.1); }
          
          .modal-foot { margin-top: 24px; display: flex; justify-content: flex-end; gap: 12px; }
          
          .alert { padding: 12px 16px; border-radius: 12px; font-weight: 700; font-size: 13px; }
          .alert-error { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
          .alert-success { background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }

          .footer-note { margin-top: 24px; font-size: 12px; color: #9ca3af; font-style: italic; text-align: center; }

          @media (max-width: 600px) {
            .page-container { padding: 20px; }
            .card { padding: 16px; }
            .modal-card { border-radius: 20px; }
            .grid { grid-template-columns: 1fr; }
          }
        `}</style>
      </div>
    </AppLayout>
  );
}
