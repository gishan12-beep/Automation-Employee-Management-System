import React, { useEffect, useMemo, useState } from "react";
import AppLayout from "../../../components/layout/AppLayout";
import PayslipPreview from "./PayslipPreview";
import { getPayrollDraftApi, saveFinalPayslipApi } from "../../../services/accountantPayrollService";

// Helpers
const money = (n) => Number(n || 0);
const uid = () => Math.random().toString(16).slice(2) + Date.now().toString(16);

export default function PayrollEditor() {
  // You can replace this with a route param later
  const [employeeId, setEmployeeId] = useState("EMP001");
  const [periodStart, setPeriodStart] = useState("2025-10-01");
  const [periodEnd, setPeriodEnd] = useState("2025-10-31");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Base data (from system payroll calculation)
  const [employee, setEmployee] = useState(null);
  const [draft, setDraft] = useState(null);

  // Accountant overrides (editable)
  const [basicSalaryOverride, setBasicSalaryOverride] = useState("");
  const [otHours, setOtHours] = useState("");
  const [otRate, setOtRate] = useState("");
  const [incentives, setIncentives] = useState([]);
  const [deductions, setDeductions] = useState([]);

  const [notes, setNotes] = useState("");
  const [showPreview, setShowPreview] = useState(true);
  const [toast, setToast] = useState("");

  // Load payroll draft
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setToast("");
      try {
        const res = await getPayrollDraftApi({ employeeId, periodStart, periodEnd });
        // Expected shape shown in service stub
        setEmployee(res.employee);
        setDraft(res.draft);

        // Pre-fill editable fields with defaults from draft
        setBasicSalaryOverride(res.draft.basicSalary ?? "");
        setOtHours(res.draft.overtime?.hours ?? 0);
        setOtRate(res.draft.overtime?.rate ?? 0);

        setIncentives(
          (res.draft.incentives || []).map((x) => ({
            id: uid(),
            description: x.description || "Incentive",
            amount: money(x.amount),
          }))
        );
        setDeductions(
          (res.draft.deductions || []).map((x) => ({
            id: uid(),
            description: x.description || "Deduction",
            amount: money(x.amount),
          }))
        );
      } catch (e) {
        console.error(e);
        setToast("Failed to load payroll draft.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [employeeId, periodStart, periodEnd]);

  const computed = useMemo(() => {
    const basicSalary = basicSalaryOverride === "" ? money(draft?.basicSalary) : money(basicSalaryOverride);

    const overtimeAmount = money(otHours) * money(otRate);

    const incentiveTotal = incentives.reduce((sum, i) => sum + money(i.amount), 0);
    const deductionTotal = deductions.reduce((sum, d) => sum + money(d.amount), 0);

    // If EPF/ETF is auto-calculated by backend, keep it from draft unless you want editable too
    const epfEtf = money(draft?.epfEtfDeductions);

    const gross = basicSalary + overtimeAmount + incentiveTotal + money(draft?.allowancesTotal);
    const totalDeductions = deductionTotal + epfEtf;

    const net = Math.max(0, gross - totalDeductions);

    return {
      basicSalary,
      overtimeAmount,
      incentiveTotal,
      deductionTotal,
      epfEtf,
      allowancesTotal: money(draft?.allowancesTotal),
      gross,
      totalDeductions,
      net,
    };
  }, [basicSalaryOverride, draft, incentives, deductions, otHours, otRate]);

  const addIncentive = () => {
    setIncentives((prev) => [
      ...prev,
      { id: uid(), description: "New incentive", amount: 0 },
    ]);
  };

  const addDeduction = () => {
    setDeductions((prev) => [
      ...prev,
      { id: uid(), description: "New deduction", amount: 0 },
    ]);
  };

  const updateIncentive = (id, patch) => {
    setIncentives((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  };

  const updateDeduction = (id, patch) => {
    setDeductions((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  };

  const removeIncentive = (id) => setIncentives((prev) => prev.filter((x) => x.id !== id));
  const removeDeduction = (id) => setDeductions((prev) => prev.filter((x) => x.id !== id));

  const saveFinal = async () => {
    setSaving(true);
    setToast("");
    try {
      const payload = {
        employeeId,
        periodStart,
        periodEnd,
        overrides: {
          basicSalary: computed.basicSalary,
          overtime: { hours: money(otHours), rate: money(otRate), amount: computed.overtimeAmount },
          incentives: incentives.map((i) => ({ description: i.description, amount: money(i.amount) })),
          deductions: deductions.map((d) => ({ description: d.description, amount: money(d.amount) })),
          notes,
        },
        totals: computed,
      };

      await saveFinalPayslipApi(payload);
      setToast("Payslip saved successfully.");
    } catch (e) {
      console.error(e);
      setToast("Failed to save payslip.");
    } finally {
      setSaving(false);
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
          <div className="page-header">
            <div>
              <h1 className="page-title">Payroll (Accountant)</h1>
              <p className="page-subtitle">Finalize payslip by adjusting salary components.</p>
            </div>

            <div className="header-actions">
              <button className="btn btn-secondary" onClick={() => setShowPreview((s) => !s)}>
                {showPreview ? "Hide Preview" : "Show Preview"}
              </button>
              <button className="btn btn-primary" disabled={saving || loading || !draft} onClick={saveFinal}>
                {saving ? "Saving..." : "Save Payslip"}
              </button>
            </div>
          </div>

          {toast ? <div className="alert">{toast}</div> : null}

          <div className="grid-2">
            {/* LEFT: Controls */}
            <div className="card">
              <div className="card-title">Payroll Setup</div>

              <div className="form-row">
                <div className="form-field">
                  <label>Employee ID</label>
                  <input value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} />
                </div>
                <div className="form-field">
                  <label>Period Start</label>
                  <input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} />
                </div>
                <div className="form-field">
                  <label>Period End</label>
                  <input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} />
                </div>
              </div>

              {loading ? (
                <div className="muted">Loading draft...</div>
              ) : !draft ? (
                <div className="muted">No draft found.</div>
              ) : (
                <>
                  <div className="divider" />

                  <div className="section-title">Editable Components</div>

                  <div className="form-row">
                    <div className="form-field">
                      <label>Basic Salary</label>
                      <input
                        type="number"
                        value={basicSalaryOverride}
                        onChange={(e) => setBasicSalaryOverride(e.target.value)}
                        min="0"
                      />
                      <small className="hint">You can override the system basic salary.</small>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-field">
                      <label>Overtime Hours</label>
                      <input type="number" value={otHours} onChange={(e) => setOtHours(e.target.value)} min="0" step="0.5" />
                    </div>
                    <div className="form-field">
                      <label>Overtime Rate</label>
                      <input type="number" value={otRate} onChange={(e) => setOtRate(e.target.value)} min="0" step="1" />
                    </div>
                  </div>

                  <div className="divider" />

                  <div className="section-header">
                    <div className="section-title">Incentives</div>
                    <button className="btn btn-small" onClick={addIncentive}>+ Add</button>
                  </div>

                  {incentives.length === 0 ? (
                    <div className="muted">No incentives added.</div>
                  ) : (
                    incentives.map((i) => (
                      <div className="line-item" key={i.id}>
                        <input
                          className="li-desc"
                          value={i.description}
                          onChange={(e) => updateIncentive(i.id, { description: e.target.value })}
                        />
                        <input
                          className="li-amt"
                          type="number"
                          min="0"
                          value={i.amount}
                          onChange={(e) => updateIncentive(i.id, { amount: e.target.value })}
                        />
                        <button className="btn btn-danger btn-small" onClick={() => removeIncentive(i.id)}>✕</button>
                      </div>
                    ))
                  )}

                  <div className="divider" />

                  <div className="section-header">
                    <div className="section-title">Deductions</div>
                    <button className="btn btn-small" onClick={addDeduction}>+ Add</button>
                  </div>

                  {deductions.length === 0 ? (
                    <div className="muted">No deductions added.</div>
                  ) : (
                    deductions.map((d) => (
                      <div className="line-item" key={d.id}>
                        <input
                          className="li-desc"
                          value={d.description}
                          onChange={(e) => updateDeduction(d.id, { description: e.target.value })}
                        />
                        <input
                          className="li-amt"
                          type="number"
                          min="0"
                          value={d.amount}
                          onChange={(e) => updateDeduction(d.id, { amount: e.target.value })}
                        />
                        <button className="btn btn-danger btn-small" onClick={() => removeDeduction(d.id)}>✕</button>
                      </div>
                    ))
                  )}

                  <div className="divider" />

                  <div className="form-row">
                    <div className="form-field">
                      <label>Notes (optional)</label>
                      <textarea rows="3" value={notes} onChange={(e) => setNotes(e.target.value)} />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* RIGHT: Preview */}
            <div className="card">
              <div className="card-title">Payslip Preview</div>

              {!draft ? (
                <div className="muted">Load a payroll draft to preview.</div>
              ) : showPreview ? (
                <PayslipPreview
                  employee={employee}
                  period={{ start: periodStart, end: periodEnd }}
                  base={draft}
                  overrides={{
                    basicSalary: computed.basicSalary,
                    overtime: { hours: money(otHours), rate: money(otRate), amount: computed.overtimeAmount },
                    incentives,
                    deductions,
                    notes,
                  }}
                  totals={computed}
                />
              ) : (
                <div className="muted">Preview hidden.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Minimal page styling matching your dashboard style pattern */}
      <style>{`
        .page-wrapper{position:relative;min-height:100%;overflow:hidden}
        .page-container{padding:24px;position:relative;z-index:1}
        
        .page-header{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:24px}
        .page-title{font-size:28px;font-weight:900;color:#2c5530;margin:0}
        .page-subtitle{margin:6px 0 0;color:#4b5563;font-size:15px}
        
        .header-actions{display:flex;gap:12px;flex-wrap:wrap}
        
        .grid-2{display:grid;grid-template-columns:1fr 1.2fr;gap:24px;max-width:1200px;margin:0 auto}
        @media (max-width: 1100px){.grid-2{grid-template-columns:1fr}}
        
        .card{
          background:rgba(255, 255, 255, 0.9);
          backdrop-filter:blur(12px);
          border:1px solid rgba(255, 255, 255, 0.5);
          border-radius:18px;
          padding:24px;
          box-shadow:0 8px 25px rgba(0,0,0,0.03);
        }
        
        .card-title{
          margin:0 0 20px 0;
          font-size:16px;
          font-weight:800;
          color:#1f2937;
          text-transform:uppercase;
          border-bottom:1px solid rgba(0,0,0,0.05);
          padding-bottom:12px;
        }
        
        .divider{height:1px;background:#e5e7eb;margin:20px 0}
        
        .section-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
        .section-title{font-size:14px;font-weight:800;color:#374151;text-transform:uppercase}
        
        .form-row{display:grid;grid-template-columns:repeat(auto-fit, minmax(140px, 1fr));gap:16px;margin-bottom:16px}
        .form-field label{display:block;font-size:12px;font-weight:700;color:#6b7280;margin-bottom:6px;text-transform:uppercase}
        
        .form-field input, .form-field textarea{
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
        .form-field input:focus, .form-field textarea:focus{border-color:#4a7c4e;box-shadow:0 0 0 3px rgba(74, 124, 78, 0.1)}
        
        .hint{display:block;color:#9ca3af;margin-top:6px;font-size:12px;font-style:italic}
        .muted{color:#9ca3af;font-style:italic;padding:20px;text-align:center}
        
        .alert{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:12px;margin-bottom:20px;color:#166534;font-weight:600}
        
        .line-item{display:flex;gap:10px;align-items:center;margin-bottom:10px}
        .li-desc{flex:1}
        .li-amt{width:120px;text-align:right}
        
        .btn{
          padding:10px 20px;
          border-radius:12px;
          font-weight:700;
          font-size:14px;
          cursor:pointer;
          border:none;
          transition:all 0.2s;
        }
        .btn:disabled{opacity:0.6;cursor:not-allowed}
        
        .btn-primary{
          background:linear-gradient(135deg, #4a7c4e 0%, #5a8c5e 100%);
          color:#fff;
          box-shadow:0 4px 12px rgba(74, 124, 78, 0.2);
        }
        .btn-primary:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 6px 16px rgba(74, 124, 78, 0.3)}
        
        .btn-secondary{
          background:#fff;
          border:1px solid #d1d5db;
          color:#374151;
        }
        .btn-secondary:hover:not(:disabled){background:#f9fafb}
        
        .btn-danger{
          background:#fee2e2;
          color:#991b1b;
          border:1px solid #fca5a5;
        }
        .btn-small{padding:6px 12px;font-size:12px;border-radius:8px}
      `}</style>
    </AppLayout>
  );
}
