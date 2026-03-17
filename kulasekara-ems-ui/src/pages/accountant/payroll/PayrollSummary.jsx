import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../../components/layout/AppLayout";
import { getPayrollSummaryApi } from "../../../services/accountantPayrollService";
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
  const [toast, setToast] = useState("");

  const [rows, setRows] = useState([]); // payroll rows for the month

  useEffect(() => {
    const load = async () => {
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
              return generatedRun; // It already has the mapped structure from accountantPayrollService
            }
            // If not generated yet
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
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [month]);

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


  const openBuilder = (employeeId) => {
    // If you added /accountant/payroll/:employeeId route, you can go directly
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
          <div className="page-header">
            <div>
              <h1 className="page-title">Payroll Summary</h1>
              <p className="page-subtitle">Monthly overview of payroll totals and employee payouts.</p>
            </div>
            <div className="actions">
              <button className="btn" onClick={() => navigate("/accountant/dashboard")}>
                ← Back
              </button>
              <button className="btn btn-primary" onClick={() => navigate("/accountant/payroll")}>
                + Adjust Payroll
              </button>
            </div>
          </div>

          {toast ? (
            <div className="alert">
              {toast}
            </div>
          ) : null}


          <div className="card">
            <div className="card-title">🔍 Quick Filters</div>

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
            <div className="card-title" style={{ marginBottom: 16 }}>Payroll List</div>

            <div style={inlineStyles.tabContainer}>
              <button
                style={{ ...inlineStyles.tabBtn, ...(activeTab === "MONTHLY" ? inlineStyles.activeTab : {}) }}
                onClick={() => setActiveTab("MONTHLY")}
              >
                Monthly Employees
              </button>
              <button
                style={{ ...inlineStyles.tabBtn, ...(activeTab === "OTHER" ? inlineStyles.activeTab : {}) }}
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
                          <span className={`badge ${r.status === "GENERATED" || r.status === "FINALIZED" ? "ok" : "warn"}`}>
                            {r.status === "PENDING" ? "Pending" : r.status === "FINALIZED" ? "Finalized" : "Generated"}
                          </span>
                        </td>
                        <td className="right">
                          <button
                            className="btn btn-small"
                            onClick={() => openBuilder(r.employeeId)}
                            disabled={r.status === "PENDING"}
                            title={r.status === "PENDING" ? "Manager must generate payroll first" : ""}
                            style={{ opacity: r.status === "PENDING" ? 0.5 : 1 }}
                          >
                            {r.isFinalized ? "Edit / Rebuild" : "Adjust"}
                          </button>
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
        .page-wrapper{position:relative;min-height:100%;overflow:hidden;background:#f8fafc}
        .page-container{padding:24px;position:relative;z-index:1}
        
        .page-header{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:24px}
        .page-title{font-size:28px;font-weight:900;color:#2c5530;margin:0}
        .page-subtitle{margin:6px 0 0;color:#4b5563;font-size:15px}
        
        .actions{display:flex;gap:12px;flex-wrap:wrap}

        .alert{background:#fee2e2;border:1px solid #fecaca;border-radius:12px;padding:16px;margin-bottom:24px;color:#991b1b;font-weight:600}


        .card{
          background:rgba(255, 255, 255, 0.9);
          backdrop-filter:blur(12px);
          border:1px solid rgba(255, 255, 255, 0.5);
          border-radius:20px;
          padding:24px;
          margin-bottom:24px;
          box-shadow:0 10px 40px rgba(0,0,0,0.04);
        }
        
        .card-title{
          font-weight:800;
          margin-bottom:20px;
          color:#1e293b;
          text-transform:uppercase;
          font-size:15px;
          border-bottom:1px solid rgba(0,0,0,0.05);
          padding-bottom:12px;
        }

        .filters{display:grid;grid-template-columns:1fr 2fr 1fr;gap:20px}
        @media (max-width: 900px){.filters{grid-template-columns:1fr}}
        .field label{display:block;font-size:12px;color:#64748b;margin-bottom:8px;font-weight:800;text-transform:uppercase}
        .field input,.field select{
          width:100%;
          border:1px solid #e2e8f0;
          border-radius:12px;
          padding:12px 16px;
          font-size:14px;
          font-weight:600;
          outline:none;
          background:#fcfdfe;
          transition:all 0.2s;
        }
        .field input:focus, .field select:focus{border-color:#4a7c4e;box-shadow:0 0 0 4px rgba(74, 124, 78, 0.1)}

        .tableWrap{
          overflow:visible;
          border-radius:16px;
          border:1px solid #e2e8f0;
          background:#fff;
        }
        .table{width:100%;border-collapse:separate;border-spacing:0;min-width:1000px}
        thead th{
          background:#f8fafc;
          color:#64748b;
          text-align:left;
          font-size:12px;
          font-weight:800;
          padding:16px;
          border-bottom:2px solid #f1f5f9;
          text-transform:uppercase;
          letter-spacing:0.025em;
        }
        tbody tr:hover td{background:#f1f5f9}
        tbody td{padding:16px 20px;border-bottom:1px solid #f1f5f9;color:#334155;font-size:14px;transition:background 0.2s}
        .right{text-align:right}
        .strong{font-weight:900;color:#0f172a}
        .muted{color:#94a3b8}

        .empCell{display:flex;align-items:center;gap:14px}
        .avatar{
          width:42px;height:42px;border-radius:14px;
          background:linear-gradient(135deg, #4a7c4e 0%, #2c5530 100%);
          color:#fff;display:flex;align-items:center;justify-content:center;
          font-weight:900;font-size:18px;box-shadow:0 8px 20px rgba(44,85,48,0.2)
        }
        .empName{font-weight:800;color:#1e293b}
        .empId{font-size:11px;font-weight:700;margin-top:2px}

        .badge{
          display:inline-flex;align-items:center;gap:6px;
          font-size:11px;font-weight:900;padding:6px 14px;border-radius:99px;
          border:1px solid transparent;text-transform:uppercase;letter-spacing:0.05em;
        }
        .badge.ok{background:#dcfce7;border-color:#bbf7d0;color:#166534}
        .badge.warn{background:#fef9c3;border-color:#fef08a;color:#854d0e}

        .btn{
          padding:10px 20px;
          border-radius:12px;
          font-weight:800;
          font-size:13px;
          cursor:pointer;
          border:none;
          transition:all 0.2s;
          background:#f1f5f9;
          color:#475569;
        }
        .btn:hover:not(:disabled){transform:translateY(-1px);background:#e2e8f0;color:#1e293b}
        .btn:disabled{opacity:0.6;cursor:not-allowed}
        
        .btn-primary{
          background:linear-gradient(135deg, #4a7c4e 0%, #2c5530 100%);
          color:#fff;
          box-shadow:0 4px 12px rgba(44,85,48,0.2);
        }
        .btn-primary:hover:not(:disabled){box-shadow:0 8px 20px rgba(44,85,48,0.3)}
        
        .btn-small{padding:8px 14px;font-size:11px;text-transform:uppercase;letter-spacing:0.025em}
      `}</style>
    </AppLayout>
  );
}

const inlineStyles = {
  tabContainer: {
    display: "flex",
    gap: 10,
    marginBottom: 16,
    borderBottom: "2px solid #e5e7eb",
    paddingBottom: 4,
  },
  tabBtn: {
    background: "transparent",
    border: "none",
    padding: "8px 16px",
    fontSize: 14,
    fontWeight: 700,
    color: "#6b7280",
    cursor: "pointer",
    position: "relative",
    bottom: -1,
  },
  activeTab: {
    color: "#2c5530",
    borderBottom: "3px solid #2c5530",
  },
};
