import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../../components/layout/AppLayout";
import { getEpfEtfReportApi } from "../../../services/accountantPayrollService";

// Formats a numeric value into a localized LKR currency string with two decimal places
const fmt = (n) =>
  Number(n || 0).toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Generates a standardized YYYY-MM string representing the current or provided month
const monthValue = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
};

// Component for generating and viewing monthly EPF/ETF contribution reports
export default function EPFETF() {
  const navigate = useNavigate();

  const [month, setMonth] = useState(monthValue());
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  const [rows, setRows] = useState([]); // raw employee payroll data for contributions

  useEffect(() => {
    // Loads the statutory contribution data from the backend for the selected month
    const load = async () => {
      setLoading(true);
      setToast("");
      try {
        const res = await getEpfEtfReportApi({ month });
        setRows(res.rows || []);
      } catch (e) {
        console.error(e);
        setToast("Failed to load EPF/ETF report.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [month]);

  // Processes raw data to compute specific employee and employer contribution amounts
  const computedRows = useMemo(() => {
    const keyword = q.trim().toLowerCase();

    // Filters the list based on search criteria (ID, name, or department)
    const filtered = rows.filter((r) => {
      if (!keyword) return true;
      return (
        String(r.employeeId || "").toLowerCase().includes(keyword) ||
        String(r.name || "").toLowerCase().includes(keyword) ||
        String(r.department || "").toLowerCase().includes(keyword)
      );
    });

    return filtered.map((r) => {
      const base = Number(r.epfBase || 0);

      // Calculates contributions if eligible: 8% employee EPF, 12% employer EPF, 3% employer ETF
      const epfEmployee = r.isEligible ? base * 0.08 : 0;
      const epfEmployer = r.isEligible ? base * 0.12 : 0;
      const etfEmployer = r.isEligible ? base * 0.03 : 0;

      return {
        ...r,
        base,
        epfEmployee,
        epfEmployer,
        etfEmployer,
        total: epfEmployee + epfEmployer + etfEmployer,
      };
    });
  }, [rows, q]);

  // Aggregates the computed rows into high-level KPI summaries for the report header
  const kpis = useMemo(() => {
    const eligibleCount = computedRows.filter((r) => r.isEligible).length;

    const epfEmp = computedRows.reduce((s, r) => s + r.epfEmployee, 0);
    const epfEr = computedRows.reduce((s, r) => s + r.epfEmployer, 0);
    const etfEr = computedRows.reduce((s, r) => s + r.etfEmployer, 0);
    const total = epfEmp + epfEr + etfEr;

    return { eligibleCount, epfEmp, epfEr, etfEr, total };
  }, [computedRows]);

  // Triggers the browser's print dialog to allow saving the report as a PDF
  const printReport = () => window.print();

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
              <h1 className="title">EPF / ETF Report</h1>
              <p className="sub">Monthly statutory contribution summary (Employee + Employer).</p>
            </div>
            <div className="actions">
              <button className="btn" onClick={() => navigate("/accountant/dashboard")}>
                ← Back
              </button>
              <button className="btn btn-primary" onClick={printReport}>
                Print / Save PDF
              </button>
            </div>
          </div>

          {toast ? <div className="alert">{toast}</div> : null}

          {/* KPIs */}
          <div className="kpiGrid">
            <div className="kpi">
              <div className="kpiLabel">Eligible Employees</div>
              <div className="kpiValue">{kpis.eligibleCount}</div>
              <div className="kpiHint muted">For selected month</div>
            </div>

            <div className="kpi">
              <div className="kpiLabel">EPF (Employee 8%)</div>
              <div className="kpiValue">LKR {fmt(kpis.epfEmp)}</div>
              <div className="kpiHint muted">Total employee contribution</div>
            </div>

            <div className="kpi">
              <div className="kpiLabel">EPF (Employer 12%)</div>
              <div className="kpiValue">LKR {fmt(kpis.epfEr)}</div>
              <div className="kpiHint muted">Total employer contribution</div>
            </div>

            <div className="kpi">
              <div className="kpiLabel">ETF (Employer 3%)</div>
              <div className="kpiValue">LKR {fmt(kpis.etfEr)}</div>
              <div className="kpiHint muted">Total employer contribution</div>
            </div>
          </div>

          <div className="kpiTotal">
            <div className="kpiTotalLabel">Total Contribution</div>
            <div className="kpiTotalValue">LKR {fmt(kpis.total)}</div>
          </div>

          {/* Filters */}
          <div className="card">
            <div className="cardTitle">Filters</div>
            <div className="filters">
              <div className="field">
                <label>Month</label>
                <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
              </div>
              <div className="field">
                <label>Search</label>
                <input
                  placeholder="Search by name, employee ID, department..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>
            </div>
            <p className="note muted">
              Note: EPF is calculated on the EPF eligible base salary/earnings configured in the system.
            </p>
          </div>

          {/* Table */}
          <div className="card">
            <div className="cardTitle">Employee Contributions</div>

            {loading ? (
              <div className="muted">Loading EPF/ETF report...</div>
            ) : computedRows.length === 0 ? (
              <div className="muted">No records found for this month.</div>
            ) : (
              <div className="tableWrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Department</th>
                      <th className="right">EPF Base (LKR)</th>
                      <th className="right">EPF 8% (Emp)</th>
                      <th className="right">EPF 12% (Er)</th>
                      <th className="right">ETF 3% (Er)</th>
                      <th className="right">Total (LKR)</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {computedRows.map((r) => (
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
                        <td className="right">{fmt(r.base)}</td>
                        <td className="right">{fmt(r.epfEmployee)}</td>
                        <td className="right">{fmt(r.epfEmployer)}</td>
                        <td className="right">{fmt(r.etfEmployer)}</td>
                        <td className="right strong">{fmt(r.total)}</td>
                        <td>
                          <span className={`badge ${r.isEligible ? "ok" : "mutedBadge"}`}>
                            {r.isEligible ? "Eligible" : "Not Eligible"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <style>{`
          .page-wrapper{position:relative;min-height:100%;overflow:hidden}
          .page-container{padding:24px;position:relative;z-index:1}
          
          .header{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:24px}
          .title{font-size:28px;font-weight:900;color:#2c5530;margin:0}
          .sub{margin:6px 0 0;color:#4b5563;font-size:15px}
          .actions{display:flex;gap:10px;flex-wrap:wrap}

          .alert{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:12px;margin-bottom:20px;color:#166534;font-weight:600}

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

          .filters{display:grid;grid-template-columns:1.2fr 2fr;gap:16px}
          @media (max-width: 900px){.filters{grid-template-columns:1fr}}
          .field label{display:block;font-size:12px;color:#6b7280;margin-bottom:6px;font-weight:800;text-transform:uppercase}
          .field input{
            width:100%;
            padding:10px 14px;
            border-radius:12px;
            border:1px solid #e5e7eb;
            background:#fff;
            font-size:14px;
            font-weight:600;
            outline:none;
            transition:border 0.2s;
          }
          .field input:focus{border-color:#4a7c4e;box-shadow:0 0 0 3px rgba(74, 124, 78, 0.1)}
          .note{margin:12px 0 0 0;font-size:12px;color:#9ca3af;font-style:italic}

          .tableWrap{overflow:hidden;border-radius:12px;border:1px solid #e5e7eb}
          .table{width:100%;border-collapse:separate;border-spacing:0;min-width:1100px;background:#fff}
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
          .badge.mutedBadge{background:#f3f4f6;color:#6b7280;border:1px solid #e5e7eb}

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
          .btn:hover{background:#f9fafb;transform:translateY(-1px)}
          
          .btn-primary{
            background:linear-gradient(135deg, #4a7c4e 0%, #5a8c5e 100%);
            color:#fff;
            border:none;
            box-shadow:0 4px 12px rgba(74, 124, 78, 0.2);
          }
          .btn-primary:hover{transform:translateY(-1px);box-shadow:0 6px 16px rgba(74, 124, 78, 0.3)}

          /* print polish */
          @media print{
            .actions, .card:first-of-type .filters, .card:first-of-type .note { display:none !important; }
            .page-container{padding:0}
            .card, .kpi, .kpiTotal{border:none;box-shadow:none;background:#fff !important}
            .floating-circle{display:none}
            .page-wrapper{overflow:visible}
          }
        `}</style>
        </div>
      </div>
    </AppLayout>
  );
}
