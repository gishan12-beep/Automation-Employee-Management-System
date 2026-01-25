import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../../components/layout/AppLayout";
import { getPayrollSummaryApi } from "../../../services/accountantPayrollService";

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
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  const [rows, setRows] = useState([]); // payroll rows for the month

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setToast("");
      try {
        const res = await getPayrollSummaryApi({ month });
        setRows(res.rows || []);
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
  }, [rows, q, status]);

  const kpis = useMemo(() => {
    const totalEmployees = filteredRows.length;
    const totalGross = filteredRows.reduce((s, r) => s + Number(r.gross || 0), 0);
    const totalDeductions = filteredRows.reduce((s, r) => s + Number(r.deductions || 0), 0);
    const totalNet = filteredRows.reduce((s, r) => s + Number(r.net || 0), 0);
    const finalized = filteredRows.filter((r) => r.isFinalized).length;
    return { totalEmployees, totalGross, totalDeductions, totalNet, finalized };
  }, [filteredRows]);

  const openBuilder = (employeeId) => {
    // If you added /accountant/payroll/:employeeId route, you can go directly
    navigate(`/accountant/payroll/${employeeId}`);
    // Otherwise use: navigate("/accountant/payroll");
  };

  return (
    <AppLayout>
      <div className="page">
        <div className="header">
          <div>
            <h1 className="title">Payroll Summary</h1>
            <p className="sub">Monthly overview of payroll totals and employee payouts.</p>
          </div>
          <div className="actions">
            <button className="btn" onClick={() => navigate("/accountant/dashboard")}>
              ← Back
            </button>
            <button className="btn btn-primary" onClick={() => navigate("/accountant/payroll")}>
              + Build Payslip
            </button>
          </div>
        </div>

        {toast ? <div className="alert">{toast}</div> : null}

        {/* KPI cards */}
        <div className="kpiGrid">
          <div className="kpi">
            <div className="kpiLabel">Employees</div>
            <div className="kpiValue">{kpis.totalEmployees}</div>
            <div className="kpiHint muted">Finalized: {kpis.finalized}</div>
          </div>

          <div className="kpi">
            <div className="kpiLabel">Total Gross</div>
            <div className="kpiValue">LKR {fmt(kpis.totalGross)}</div>
            <div className="kpiHint muted">For selected month</div>
          </div>

          <div className="kpi">
            <div className="kpiLabel">Total Deductions</div>
            <div className="kpiValue">LKR {fmt(kpis.totalDeductions)}</div>
            <div className="kpiHint muted">EPF/ETF + other</div>
          </div>

          <div className="kpi">
            <div className="kpiLabel">Total Net Pay</div>
            <div className="kpiValue">LKR {fmt(kpis.totalNet)}</div>
            <div className="kpiHint muted">Amount to pay</div>
          </div>
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

            <div className="field">
              <label>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="ALL">All</option>
                <option value="SAVED">Finalized</option>
                <option value="PENDING">Pending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="card">
          <div className="cardTitle">Payroll List</div>

          {loading ? (
            <div className="muted">Loading payroll summary...</div>
          ) : filteredRows.length === 0 ? (
            <div className="muted">No payroll records found for this month.</div>
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
                        <span className={`badge ${r.isFinalized ? "ok" : "warn"}`}>
                          {r.isFinalized ? "Finalized" : "Pending"}
                        </span>
                      </td>
                      <td className="right">
                        <button className="btn btn-small" onClick={() => openBuilder(r.employeeId)}>
                          {r.isFinalized ? "Edit / Rebuild" : "Build Payslip"}
                        </button>
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
          .kpiLabel{color:#475467;font-size:12px;font-weight:700}
          .kpiValue{margin-top:6px;font-weight:900;font-size:18px;color:#0F172A}
          .kpiHint{margin-top:6px;font-size:12px}

          .card{background:#fff;border:1px solid #eaecf0;border-radius:14px;padding:14px;margin-bottom:12px}
          .cardTitle{font-weight:800;margin-bottom:10px;color:#0F172A}

          .filters{display:grid;grid-template-columns:1.2fr 2fr 1fr;gap:10px}
          @media (max-width: 900px){.filters{grid-template-columns:1fr}}
          .field label{display:block;font-size:12px;color:#475467;margin-bottom:6px;font-weight:700}
          .field input,.field select{width:100%;border:1px solid #d0d5dd;border-radius:10px;padding:10px;font-size:14px;outline:none;background:#fff}

          .tableWrap{overflow:auto;border-radius:12px;border:1px solid #eaecf0}
          .table{width:100%;border-collapse:collapse;min-width:900px;background:#fff}
          thead th{background:#f8fafc;color:#475467;text-align:left;font-size:12px;font-weight:800;padding:12px;border-bottom:1px solid #eaecf0}
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
          .empName{font-weight:800}
          .empId{font-size:12px}

          .badge{
            display:inline-flex;align-items:center;gap:6px;
            font-size:12px;font-weight:800;padding:6px 10px;border-radius:999px;
            border:1px solid transparent
          }
          .badge.ok{background:#ECFDF3;border-color:#ABEFC6;color:#067647}
          .badge.warn{background:#FFFAEB;border-color:#FEDF89;color:#B54708}

          .btn{border:1px solid #d0d5dd;background:#fff;border-radius:10px;padding:10px 12px;cursor:pointer;font-weight:800}
          .btn:hover{filter:brightness(.98)}
          .btn-primary{background:#111827;color:#fff;border-color:#111827}
          .btn-small{padding:8px 10px;font-size:12px;border-radius:9px}
        `}</style>
      </div>
    </AppLayout>
  );
}
