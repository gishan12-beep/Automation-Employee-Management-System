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

      {/* Minimal page styling matching your dashboard style pattern */}
      <style>{`
        .page-container{padding:18px}
        .page-header{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:14px}
        .page-title{font-size:22px;margin:0}
        .page-subtitle{margin:6px 0 0;color:#667085}
        .header-actions{display:flex;gap:10px;flex-wrap:wrap}
        .grid-2{display:grid;grid-template-columns:1.05fr .95fr;gap:14px}
        @media (max-width: 1100px){.grid-2{grid-template-columns:1fr}}
        .card{background:#fff;border:1px solid #eaecf0;border-radius:14px;padding:14px}
        .card-title{font-weight:700;margin-bottom:10px}
        .divider{height:1px;background:#eaecf0;margin:12px 0}
        .section-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
        .section-title{font-weight:700}
        .form-row{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:10px}
        .form-row .form-field textarea{resize:vertical}
        .form-row:has(textarea){grid-template-columns:1fr}
        @media (max-width: 720px){.form-row{grid-template-columns:1fr}}
        .form-field label{display:block;font-size:12px;color:#475467;margin-bottom:6px}
        .form-field input,.form-field textarea{width:100%;border:1px solid #d0d5dd;border-radius:10px;padding:10px;font-size:14px;outline:none}
        .hint{display:block;color:#667085;margin-top:6px}
        .muted{color:#667085}
        .alert{background:#f2f4f7;border:1px solid #eaecf0;border-radius:12px;padding:10px;margin-bottom:12px;color:#344054}
        .line-item{display:flex;gap:8px;align-items:center;margin-bottom:8px}
        .li-desc{flex:1}
        .li-amt{width:140px}
        .btn{border:1px solid #d0d5dd;background:#fff;border-radius:10px;padding:10px 12px;cursor:pointer}
        .btn:hover{filter:brightness(.98)}
        .btn-primary{background:#111827;color:#fff;border-color:#111827}
        .btn-secondary{background:#fff}
        .btn-danger{background:#fee4e2;border-color:#fda29b}
        .btn-small{padding:7px 10px;font-size:12px;border-radius:9px}
        .btn:disabled{opacity:.6;cursor:not-allowed}
      `}</style>
    </AppLayout>
  );
}
