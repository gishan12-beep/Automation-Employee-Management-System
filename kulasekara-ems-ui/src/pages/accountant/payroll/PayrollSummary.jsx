import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../../components/layout/AppLayout";
import { 
  getPayrollSummaryApi, 
  processPayrollApi,
  approvePayrollApi
} from "../../../services/accountantPayrollService";
import { getEmployeesApi } from "../../../services/managerEmployeeService";

const fmt = (n) =>
  Number(n || 0).toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const monthValue = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
};

export default function PayrollSummary() {
  const navigate = useNavigate();

  const [month, setMonth] = useState(monthValue());
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("ALL"); // ALL | SAVED | PENDING
  const [activeTab, setActiveTab] = useState("MONTHLY"); // "MONTHLY" | "OTHER"
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState("");
  const [toastType, setToastType] = useState("error"); // "error" | "success"

  const [rows, setRows] = useState([]); // payroll rows for the month

  useEffect(() => {
    loadSummary();
  }, [month]);

  const loadSummary = async () => {
    setLoading(true);
    setToast("");
    try {
      const [res, allEmployees] = await Promise.all([
        getPayrollSummaryApi({ month }),
        getEmployeesApi()
      ]);

      const summaryData = res.rows || [];
      const summaryMap = new Map();
      summaryData.forEach(e => summaryMap.set(String(e.employeeId), e));

      const mappedEmps = allEmployees
        .filter(emp => emp.status === "ACTIVE")
        .map(emp => {
          const generatedRun = summaryMap.get(String(emp.employee_id));
          if (generatedRun) {
            return generatedRun;
          }
          return {
            payrollId: null,
            employeeId: emp.employee_id,
            name: `${emp.first_name || ""} ${emp.last_name || ""}`.trim(),
            department: emp.department || "N/A",
            basic_earnings: "-",
            gross: "-",
            deductions: "-",
            net: "-",
            isFinalized: false,
            status: "PENDING",
            salaryType: emp.salary_type || "MONTHLY"
          };
        });

      setRows(mappedEmps);
    } catch (e) {
      console.error(e);
      setToast("Failed to load payroll summary.");
      setToastType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAll = async () => {
    if (!window.confirm(`Generate payroll for all employees for ${month}?`)) return;
    setProcessing(true);
    setToast("");
    try {
      const res = await processPayrollApi({ month });
      setToast(res.message || "Payroll generated successfully.");
      setToastType("success");
      await loadSummary();
    } catch (err) {
      setToast(err.response?.data?.message || "Generation failed.");
      setToastType("error");
    } finally {
      setProcessing(false);
    }
  };

  const handleApprove = async (payrollId) => {
    if (!window.confirm("Approve this payroll run? This will make it visible to the Manager.")) return;
    setProcessing(true);
    setToast("");
    try {
      const res = await approvePayrollApi(payrollId);
      setToast(res.message || "Payroll approved.");
      setToastType("success");
      await loadSummary();
    } catch (err) {
      setToast(err.response?.data?.message || "Approval failed.");
      setToastType("error");
    } finally {
      setProcessing(false);
    }
  };

  const filteredRows = useMemo(() => {
    const keyword = q.trim().toLowerCase();

    return rows
      .filter((r) => {
        if (activeTab === "MONTHLY") return r.salaryType === "MONTHLY";
        return r.salaryType !== "MONTHLY";
      })
      .filter((r) => {
        if (status === "SAVED") return r.isFinalized === true;
        if (status === "PENDING") return r.isFinalized === false;
        return true;
      })
      .filter((r) => {
        if (!keyword) return true;
        return (
          String(r.employeeId || "").toLowerCase().includes(keyword) ||
          String(r.name || "").toLowerCase().includes(keyword) ||
          String(r.department || "").toLowerCase().includes(keyword)
        );
      });
  }, [rows, q, status, activeTab]);

  const kpis = useMemo(() => {
    // Only count rows that actually have payroll data (gross is not "-")
    const activeRows = rows.filter(r => r.payrollId && r.gross !== "-");
    const count = rows.length;
    const gross = activeRows.reduce((s, r) => s + Number(r.gross || 0), 0);
    const deductions = activeRows.reduce((s, r) => s + Number(r.deductions || 0), 0);
    const net = activeRows.reduce((s, r) => s + Number(r.net || 0), 0);
    return { count, gross, deductions, net };
  }, [rows]);

  const openBuilder = (employeeId) => {
    navigate(`/accountant/payroll/${employeeId}?month=${month}`);
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
          <div className="header">
            <div>
              <h1 className="title">Payroll Summary</h1>
              <p className="sub">Monthly overview of payroll totals and employee payouts.</p>
            </div>
            <div className="actions">
              <button className="btn" onClick={() => navigate("/accountant/dashboard")}>
                ← Back
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleGenerateAll}
                disabled={processing || loading}
              >
                {processing ? "⏳ Generating..." : "⚡ Generate for All"}
              </button>
              <button className="btn" onClick={() => navigate("/accountant/payroll")}>
                + Adjust Payroll
              </button>
            </div>
          </div>

          {toast ? (
            <div className={`alert ${toastType === "success" ? "" : "alert-error"}`}>
              {toastType === "success" ? "✅ " : "❌ "}
              {toast}
            </div>
          ) : null}

          {/* KPIs */}
          <div className="kpiGrid">
            <div className="kpi">
              <div className="kpiLabel">Total Employees</div>
              <div className="kpiValue">{kpis.count}</div>
              <div className="kpiHint muted">Active in system</div>
            </div>

            <div className="kpi">
              <div className="kpiLabel">Total Gross</div>
              <div className="kpiValue">LKR {fmt(kpis.gross)}</div>
              <div className="kpiHint muted">Before deductions</div>
            </div>

            <div className="kpi">
              <div className="kpiLabel">Total Deductions</div>
              <div className="kpiValue">LKR {fmt(kpis.deductions)}</div>
              <div className="kpiHint muted">Taxes, EPF, etc.</div>
            </div>

            <div className="kpi">
              <div className="kpiLabel">Total Net Pay</div>
              <div className="kpiValue">LKR {fmt(kpis.net)}</div>
              <div className="kpiHint muted">Final payout amount</div>
            </div>
          </div>

          <div className="kpiTotal">
            <div className="kpiTotalLabel">Total Payroll Liability</div>
            <div className="kpiTotalValue">LKR {fmt(kpis.net)}</div>
          </div>

          <div className="card">
            <div className="cardTitle">🔍 Quick Filters</div>

            <div className="filters">
              <div className="field">
                <label>Month</label>
                <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
              </div>

              <div className="field">
                <label>Search Payouts</label>
                <input
                  placeholder="Search by name, employee ID, department..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>

              <div className="field">
                <label>Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="ALL">All Statuses</option>
                  <option value="SAVED">Finalized</option>
                  <option value="PENDING">Pending</option>
                </select>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="cardTitle">Payroll List</div>

            <div className="tabContainer">
              <button
                className={`tabBtn ${activeTab === "MONTHLY" ? "active" : ""}`}
                onClick={() => setActiveTab("MONTHLY")}
              >
                Monthly Employees
              </button>
              <button
                className={`tabBtn ${activeTab === "OTHER" ? "active" : ""}`}
                onClick={() => setActiveTab("OTHER")}
              >
                Daily / Other Employees
              </button>
            </div>

            {loading ? (
              <div className="muted">Loading payroll summary...</div>
            ) : filteredRows.length === 0 ? (
              <div className="muted">No active employees found in the system.</div>
            ) : (
              <div className="tableWrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Department</th>
                      <th className="right">Gross (LKR)</th>
                      <th className="right">Deductions (LKR)</th>
                      <th className="right">Net (LKR)</th>
                      <th>Status</th>
                      <th className="right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map((r) => (
                      <tr key={r.employeeId}>
                        <td>
                          <div className="empCell">
                            <div className="avatar">{String(r.name || "E").charAt(0).toUpperCase()}</div>
                            <div>
                              <div className="empName">{r.name}</div>
                              <div className="muted empId">{r.employeeId}</div>
                            </div>
                          </div>
                        </td>
                        <td>{r.department || "-"}</td>
                        <td className="right">{fmt(r.gross)}</td>
                        <td className="right">{fmt(r.deductions)}</td>
                        <td className="right strong">{fmt(r.net)}</td>
                        <td>
                          <span className={`badge ${r.status === "READY" ? "ok" : r.status === "PENDING" ? "warn" : "info"}`}>
                            {r.status === "PENDING" ? "Pending Approval" : r.status === "READY" ? "Ready" : r.status}
                          </span>
                        </td>
                        <td className="right">
                          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                            {r.status === "PENDING" && (
                              <button
                                className="btn btn-small btn-primary"
                                onClick={() => handleApprove(r.payrollId)}
                                disabled={processing}
                              >
                                {processing ? "..." : "Approve"}
                              </button>
                            )}
                            <button
                              className="btn btn-small"
                              onClick={() => openBuilder(r.employeeId)}
                              disabled={r.status === "NO_RECORD" || r.status === "NOT_READY"} // Adjusted for potential missing records
                              title={r.payrollId ? "" : "Generate payroll first"}
                              style={{ opacity: r.payrollId ? 1 : 0.5 }}
                            >
                              {r.isFinalized ? "Edit / Rebuild" : "Adjust"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>

      <style>{`
        .page-wrapper{position:relative;min-height:100%;overflow:hidden}
        .page-container{padding:24px;position:relative;z-index:1}
        
        .header{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:24px}
        .title{font-size:28px;font-weight:900;color:#2c5530;margin:0}
        .sub{margin:6px 0 0;color:#4b5563;font-size:15px}
        .actions{display:flex;gap:10px;flex-wrap:wrap}

        .alert{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:12px;margin-bottom:20px;color:#166534;font-weight:600}
        .alert-error{background:#fef2f2;border-color:#fecaca;color:#991b1b}

        .kpiGrid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:16px}
        @media (max-width: 1100px){.kpiGrid{grid-template-columns:repeat(2,1fr)}}
        @media (max-width: 600px){.kpiGrid{grid-template-columns:1fr}}
        
        .kpi{
          background:rgba(255, 255, 255, 0.9);
          backdrop-filter:blur(12px);
          border:1px solid rgba(255, 255, 255, 0.5);
          border-radius:18px;
          padding:20px;
          box-shadow:0 8px 25px rgba(0,0,0,0.03);
        }
        .kpiLabel{color:#6b7280;font-size:12px;font-weight:800;text-transform:uppercase}
        .kpiValue{margin-top:8px;font-weight:900;font-size:20px;color:#1f2937}
        .kpiHint{margin-top:6px;font-size:12px;color:#9ca3af;font-style:italic}
        
        .kpiTotal{
          background:linear-gradient(135deg, #4a7c4e 0%, #5a8c5e 100%);
          color:#fff;
          border-radius:18px;
          padding:20px;
          display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;
          box-shadow:0 8px 25px rgba(74, 124, 78, 0.25);
        }
        .kpiTotalLabel{font-weight:800;opacity:0.95;text-transform:uppercase;font-size:14px}
        .kpiTotalValue{font-weight:900;font-size:24px}

        .card{
          background:rgba(255, 255, 255, 0.9);
          backdrop-filter:blur(12px);
          border:1px solid rgba(255, 255, 255, 0.5);
          border-radius:18px;
          padding:24px;
          margin-bottom:20px;
          box-shadow:0 8px 25px rgba(0,0,0,0.03);
        }
        .cardTitle{font-size:16px;font-weight:800;margin:0 0 20px 0;color:#1f2937;text-transform:uppercase;border-bottom:1px solid rgba(0,0,0,0.05);padding-bottom:12px}

        .filters{display:grid;grid-template-columns:1fr 2fr 1fr;gap:16px}
        @media (max-width: 900px){.filters{grid-template-columns:1fr}}
        .field label{display:block;font-size:12px;color:#6b7280;margin-bottom:6px;font-weight:800;text-transform:uppercase}
        .field input, .field select{
          width:100%;
          padding:10px 14px;
          border-radius:12px;
          border:1px solid #e5e7eb;
          background:#fff;
          font-size:14px;
          font-weight:600;
          outline:none;
          transition:all 0.2s;
        }
        .field input:focus, .field select:focus{border-color:#4a7c4e;box-shadow:0 0 0 3px rgba(74, 124, 78, 0.1)}

        .tabContainer{display:flex;gap:10px;margin-bottom:20px;border-bottom:1px solid rgba(0,0,0,0.05);padding-bottom:10px}
        .tabBtn{background:none;border:none;padding:8px 16px;font-size:14px;font-weight:700;color:#9ca3af;cursor:pointer;transition:all 0.2s;border-radius:8px}
        .tabBtn:hover{background:rgba(74, 124, 78, 0.05);color:#4a7c4e}
        .tabBtn.active{background:#ecfdf5;color:#047857;border:1px solid #a7f3d0}

        .tableWrap{overflow:hidden;border-radius:12px;border:1px solid #e5e7eb}
        .table{width:100%;border-collapse:separate;border-spacing:0;min-width:1000px;background:#fff}
        thead th{background:#f9fafb;color:#6b7280;text-align:left;font-size:12px;font-weight:800;padding:14px 16px;border-bottom:1px solid #e5e7eb;text-transform:uppercase}
        tbody td{padding:14px 16px;border-bottom:1px solid #f3f4f6;color:#374151;font-size:14px;font-weight:500}
        tbody tr:last-child td{border-bottom:none}
        
        .right{text-align:right}
        .strong{font-weight:800;color:#111827}
        .muted{color:#9ca3af}

        .empCell{display:flex;align-items:center;gap:12px}
        .avatar{
          width:38px;height:38px;border-radius:50%;
          background:linear-gradient(135deg, #4a7c4e 0%, #5a8c5e 100%);
          color:#fff;display:flex;align-items:center;justify-content:center;
          font-weight:800;font-size:14px;
          box-shadow:0 4px 10px rgba(74, 124, 78, 0.2)
        }
        .empName{font-weight:700;color:#1f2937}
        .empId{font-size:12px;color:#6b7280}

        .badge{
          display:inline-flex;align-items:center;gap:6px;
          font-size:11px;font-weight:800;padding:4px 10px;border-radius:999px;
          text-transform:uppercase;letter-spacing:0.5px;
        }
        .badge.ok{background:#ecfdf5;color:#047857;border:1px solid #a7f3d0}
        .badge.warn{background:#fffbeb;color:#b45309;border:1px solid #fde68a}
        .badge.info{background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe}

        .btn{
          padding:10px 20px;
          border-radius:12px;
          font-weight:700;
          font-size:14px;
          cursor:pointer;
          border:none;
          transition:all 0.2s;
          background:#fff;
          border:1px solid #d1d5db;
          color:#374151;
        }
        .btn:hover:not(:disabled){background:#f9fafb;transform:translateY(-1px)}
        .btn:disabled{opacity:0.6;cursor:not-allowed}
        
        .btn-primary{
          background:linear-gradient(135deg, #4a7c4e 0%, #5a8c5e 100%);
          color:#fff;
          border:none;
          box-shadow:0 4px 12px rgba(74, 124, 78, 0.2);
        }
        .btn-primary:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 6px 16px rgba(74, 124, 78, 0.3)}

        .btn-small{padding:8px 14px;font-size:12px}
      `}</style>
    </AppLayout>
  );
}


