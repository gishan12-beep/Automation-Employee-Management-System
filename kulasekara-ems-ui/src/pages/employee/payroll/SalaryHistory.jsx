import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../../components/layout/AppLayout";
import { getMyPayrollApi } from "../../../services/payrollService";

const money = (n) =>
  Number(n || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 });

const pad2 = (n) => String(n).padStart(2, "0");

export default function SalaryHistory() {
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // 1-12

  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);

  const years = useMemo(() => {
    const arr = [];
    for (let y = currentYear + 1; y >= currentYear - 5; y--) arr.push(y);
    return arr;
  }, [currentYear]);

  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyPayrollApi(pad2(month), year);
      const dataArray = Array.isArray(data) ? data : (data ? [data] : []);
      setHistory(dataArray);
    } catch (err) {
      console.error(err);
      setError("Failed to load payroll history. " + (err.response?.data?.message || err.message));
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [month, year]);

  const totals = useMemo(() => {
    const netTotal = history.reduce((s, r) => s + Number(r.net_pay || 0), 0);
    const grossTotal = history.reduce((s, r) => s + Number(r.gross_pay || 0), 0);
    const otTotal = history.reduce((s, r) => s + Number(r.total_ot_pay || 0), 0);
    return { netTotal, grossTotal, otTotal };
  }, [history]);

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

          .controls { display: flex; gap: 12px; align-items: flex-end; }
          .ctrl-group { display: flex; flex-direction: column; gap: 6px; }
          .label { font-weight: 800; font-size: 11px; color: #6b7280; text-transform: uppercase; }
          .select { padding: 10px 16px; border-radius: 12px; border: 1px solid #e5e7eb; font-size: 14px; font-weight: 700; outline: none; background: #fff; transition: all 0.2s; min-width: 120px; }
          .select:focus { border-color: #4a7c4e; box-shadow: 0 0 0 3px rgba(74, 124, 78, 0.1); }
          
          .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-bottom: 24px; }
          .card { background: var(--glass-bg); backdrop-filter: var(--glass-blur); -webkit-backdrop-filter: var(--glass-blur); border: var(--glass-border); border-radius: 20px; padding: 24px; box-shadow: var(--glass-shadow); position: relative; overflow: hidden; }
          .kpi-label { font-size: 11px; font-weight: 800; color: #6b7280; text-transform: uppercase; margin-bottom: 8px; }
          .kpi-value { font-size: 28px; font-weight: 900; color: #1f2937; margin-bottom: 4px; }
          .kpi-hint { font-size: 13px; color: #2c5530; font-weight: 700; }

          .table-card { padding: 0; overflow: hidden; margin-top: 24px; }
          .table-header { padding: 20px 24px; border-bottom: 1px solid rgba(0,0,0,0.05); display: flex; justify-content: space-between; align-items: center; }
          .table-title { font-size: 16px; font-weight: 900; color: #1f2937; text-transform: uppercase; }
          .table-wrap { overflow-x: auto; }
          .table { width: 100%; border-collapse: collapse; }
          .table th { background: #f9fafb; padding: 14px 20px; text-align: left; font-size: 11px; font-weight: 800; color: #6b7280; text-transform: uppercase; border-bottom: 1px solid #f3f4f6; }
          .table td { padding: 16px 20px; font-size: 14px; color: #374151; border-bottom: 1px solid #f3f4f6; font-weight: 600; transition: background 0.2s; }
          .table tr:hover td { background: rgba(74, 124, 78, 0.03); cursor: pointer; }
          
          .pill { display: inline-block; padding: 4px 10px; border-radius: 999px; background: #dcfce7; color: #166534; font-size: 11px; font-weight: 800; text-transform: uppercase; border: 1px solid #bbf7d0; }
          .amount { font-family: 'JetBrains Mono', monospace; font-weight: 700; color: #111827; }
          .net-amount { color: #2c5530; font-weight: 900; }

          .error-alert { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; padding: 14px; border-radius: 12px; font-weight: 800; font-size: 13px; margin-bottom: 20px; }
          .hint { margin-top: 16px; font-size: 13px; color: #6b7280; font-weight: 600; font-style: italic; }
          
          @media (max-width: 800px) {
            .header-row { flex-direction: column; align-items: flex-start; }
            .controls { width: 100%; }
          }
        `}</style>

        <div className="floating-circle fc-1"></div>
        <div className="floating-circle fc-2"></div>
        <div className="floating-circle fc-3"></div>

        <div className="page-container">
          <div className="header-row">
            <div className="title-group">
              <h1 className="title">Salary History</h1>
              <p className="sub">Access your monthly payroll records and detailed payslips</p>
            </div>

            <div className="controls">
              <div className="ctrl-group">
                <span className="label">Month</span>
                <select className="select" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                  {months.map((m) => (
                    <option key={m} value={m}>{pad2(m)}</option>
                  ))}
                </select>
              </div>

              <div className="ctrl-group">
                <span className="label">Year</span>
                <select className="select" value={year} onChange={(e) => setYear(Number(e.target.value))}>
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {error && <div className="error-alert">⚠️ {error}</div>}

          <div className="kpi-grid">
            <div className="card">
              <div className="kpi-label">Total Gross</div>
              <div className="kpi-value">LKR {money(totals.grossTotal)}</div>
              <div className="kpi-hint">Earnings before deductions</div>
            </div>
            <div className="card">
              <div className="kpi-label">Overtime Pay</div>
              <div className="kpi-value">LKR {money(totals.otTotal)}</div>
              <div className="kpi-hint">Additional hours worked</div>
            </div>
            <div className="card">
              <div className="kpi-label">Total Net Pay</div>
              <div className="kpi-value" style={{ color: '#2c5530' }}>LKR {money(totals.netTotal)}</div>
              <div className="kpi-hint">Take-home amount</div>
            </div>
          </div>

          <div className="card table-card">
            <div className="table-header">
              <h3 className="table-title">Payroll Records</h3>
              <div style={{ fontSize: 13, color: "#6b7280", fontWeight: 800 }}>
                {history.length} Records Found
              </div>
            </div>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Period</th>
                    <th>Basic</th>
                    <th>OT</th>
                    <th>Gross</th>
                    <th>Net</th>
                    <th>Generated Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={7} style={{ textAlign: "center", padding: 60, color: "#9ca3af", fontWeight: 700 }}>Loading records...</td></tr>
                  ) : history.length === 0 ? (
                    <tr><td colSpan={7} style={{ textAlign: "center", padding: 60, color: "#9ca3af", fontWeight: 700 }}>No payroll history found for {pad2(month)}/{year}.</td></tr>
                  ) : (
                    history.map((r) => (
                      <tr key={r.payroll_id} onClick={() => navigate(`/employee/salary-slip/${r.payroll_id}`, { state: { payroll: r } })}>
                        <td><span className="pill">{pad2(r.month)}/{r.year}</span></td>
                        <td className="amount">LKR {money(r.basic_earnings)}</td>
                        <td className="amount">LKR {money(r.total_ot_pay)}</td>
                        <td className="amount">LKR {money(r.gross_pay)}</td>
                        <td className="amount net-amount">LKR {money(r.net_pay)}</td>
                        <td style={{ fontSize: 13, color: '#6b7280' }}>
                          {r.generated_at ? new Date(r.generated_at).toLocaleDateString(undefined, { dateStyle: 'medium' }) : "—"}
                        </td>
                        <td>
                          <button style={{ background: 'none', border: 'none', color: '#2c5530', fontWeight: 800, fontSize: 12, textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                            View Slip <span>→</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <p className="hint">
            * Click on any row to view and print your detailed salary slip.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}

