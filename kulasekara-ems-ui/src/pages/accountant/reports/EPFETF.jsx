import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../../components/layout/AppLayout";
import { getEpfEtfReportApi } from "../../../services/accountantPayrollService";

const fmt = (n) =>
  Number(n || 0).toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const monthValue = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
};

export default function EPFETF() {
  const navigate = useNavigate();

  const [month, setMonth] = useState(monthValue());
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  const [rows, setRows] = useState([]); // employee EPF base salary + flags

  useEffect(() => {
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

  const computedRows = useMemo(() => {
    // Filter & compute EPF/ETF amounts
    const keyword = q.trim().toLowerCase();

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

      // EPF employee 8%, employer 12%, ETF employer 3%
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

  const kpis = useMemo(() => {
    const eligibleCount = computedRows.filter((r) => r.isEligible).length;

    const epfEmp = computedRows.reduce((s, r) => s + r.epfEmployee, 0);
    const epfEr = computedRows.reduce((s, r) => s + r.epfEmployer, 0);
    const etfEr = computedRows.reduce((s, r) => s + r.etfEmployer, 0);
    const total = epfEmp + epfEr + etfEr;

    return { eligibleCount, epfEmp, epfEr, etfEr, total };
  }, [computedRows]);

  const printReport = () => window.print();

  return (
    <AppLayout>
      <div className="page">
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
          .page{padding:18px}
          .header{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:14px}
          .title{font-size:22px;margin:0;color:#0F172A}
          .sub{margin:6px 0 0;color:#667085}
          .actions{display:flex;gap:10px;flex-wrap:wrap}

          .alert{background:#f2f4f7;border:1px solid #eaecf0;border-radius:12px;padding:10px;margin-bottom:12px;color:#344054}

          .kpiGrid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:12px}
          @media (max-width: 1100px){.kpiGrid{grid-template-columns:repeat(2,1fr)}}
          @media (max-width: 600px){.kpiGrid{grid-template-columns:1fr}}
          .kpi{background:#fff;border:1px solid #eaecf0;border-radius:14px;padding:14px}
          .kpiLabel{color:#475467;font-size:12px;font-weight:800}
          .kpiValue{margin-top:6px;font-weight:900;font-size:18px;color:#0F172A}
          .kpiHint{margin-top:6px;font-size:12px}
          .kpiTotal{
            background:#111827;color:#fff;border-radius:14px;padding:14px;
            display:flex;justify-content:space-between;align-items:center;margin-bottom:12px
          }
          .kpiTotalLabel{font-weight:800;opacity:.9}
          .kpiTotalValue{font-weight:900;font-size:18px}

          .card{background:#fff;border:1px solid #eaecf0;border-radius:14px;padding:14px;margin-bottom:12px}
          .cardTitle{font-weight:900;margin-bottom:10px;color:#0F172A}

          .filters{display:grid;grid-template-columns:1.2fr 2fr;gap:10px}
          @media (max-width: 900px){.filters{grid-template-columns:1fr}}
          .field label{display:block;font-size:12px;color:#475467;margin-bottom:6px;font-weight:800}
          .field input{width:100%;border:1px solid #d0d5dd;border-radius:10px;padding:10px;font-size:14px;outline:none;background:#fff}
          .note{margin:10px 0 0 0;font-size:12px}

          .tableWrap{overflow:auto;border-radius:12px;border:1px solid #eaecf0}
          .table{width:100%;border-collapse:collapse;min-width:1100px;background:#fff}
          thead th{background:#f8fafc;color:#475467;text-align:left;font-size:12px;font-weight:900;padding:12px;border-bottom:1px solid #eaecf0}
          tbody td{padding:12px;border-bottom:1px solid #f1f5f9;color:#0F172A;font-size:14px}
          .right{text-align:right}
          .strong{font-weight:900}
          .muted{color:#667085}

          .empCell{display:flex;align-items:center;gap:10px}
          .avatar{
            width:36px;height:36px;border-radius:999px;
            background:#2563EB;color:#fff;display:flex;align-items:center;justify-content:center;
            font-weight:900;box-shadow:0 10px 18px rgba(37,99,235,0.18)
          }
          .empName{font-weight:900}
          .empId{font-size:12px}

          .badge{
            display:inline-flex;align-items:center;gap:6px;
            font-size:12px;font-weight:900;padding:6px 10px;border-radius:999px;
            border:1px solid transparent
          }
          .badge.ok{background:#ECFDF3;border-color:#ABEFC6;color:#067647}
          .badge.mutedBadge{background:#F2F4F7;border-color:#EAECF0;color:#475467}

          .btn{border:1px solid #d0d5dd;background:#fff;border-radius:10px;padding:10px 12px;cursor:pointer;font-weight:900}
          .btn:hover{filter:brightness(.98)}
          .btn-primary{background:#111827;color:#fff;border-color:#111827}

          /* print polish */
          @media print{
            .actions, .card:first-of-type .filters, .card:first-of-type .note { display:none !important; }
            .page{padding:0}
            .card{border:none}
            .kpiTotal{border-radius:10px}
          }
        `}</style>
      </div>
    </AppLayout>
  );
}
