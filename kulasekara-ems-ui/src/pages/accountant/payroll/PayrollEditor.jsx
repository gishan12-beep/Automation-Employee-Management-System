import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import AppLayout from "../../../components/layout/AppLayout";
import { getPayrollDraftApi, adjustPayrollApi } from "../../../services/accountantPayrollService";

const LKR = (n) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(Number(n || 0));

export default function PayrollEditor() {
  const { employeeId: paramEmployeeId } = useParams();
  const [searchParams] = useSearchParams();
  const queryMonth = searchParams.get("month");

  const today = new Date();
  const defaultMonth = queryMonth || `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;

  const [y, m] = defaultMonth.split("-");
  const startD = new Date(Number(y), Number(m) - 1, 1);

  const fmtDate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const [employeeId, setEmployeeId] = useState(paramEmployeeId || "EMP001");
  const [periodStart, setPeriodStart] = useState(fmtDate(startD));

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [employee, setEmployee] = useState(null);
  const [draft, setDraft] = useState(null);
  const [reason, setReason] = useState("");

  // Full Edit Fields
  const [fields, setFields] = useState({
    total_ot_pay: 0,
    total_incentives: 0,
    total_deductions: 0,
    epf_employee: 0,
    epf_employer: 0,
    etf_employer: 0
  });

  const [toast, setToast] = useState({ message: "", type: "" });
  const [validationErrors, setValidationErrors] = useState({});

  // Add Item States
  const [showAddIncentive, setShowAddIncentive] = useState(false);
  const [showAddDeduction, setShowAddDeduction] = useState(false);
  const [newItem, setNewItem] = useState({ amount: "", reason: "" });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 5000);
  };

  const loadDraft = async () => {
    setLoading(true);
    setValidationErrors({});
    try {
      const res = await getPayrollDraftApi({ employeeId, periodStart });
      setEmployee(res.employee);
      setDraft(res.draft);
      // Initialize fields from draft
      setFields({
        total_ot_pay: res.draft.total_ot_pay || 0,
        total_incentives: res.draft.total_incentives || 0,
        total_deductions: res.draft.total_deductions || 0,
        epf_employee: res.draft.epf_employee || 0,
        epf_employer: res.draft.epf_employer || 0,
        etf_employer: res.draft.etf_employer || 0
      });
      setReason(""); // Reset reason on load
    } catch (e) {
      console.error(e);
      showToast("Failed to load payroll draft. Does it exist?", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employeeId && periodStart) {
      loadDraft();
    }
  }, [employeeId, periodStart]);

  // Derived Values
  const liveGross = Number(draft?.basic_earnings || 0) + Number(fields.total_ot_pay) + Number(fields.total_incentives);
  const liveNet = liveGross - Number(fields.total_deductions) - Number(fields.epf_employee);

  const handleAddItem = async (type) => {
    if (!newItem.amount || Number(newItem.amount) <= 0 || !newItem.reason) {
      alert("Please provide valid amount and reason.");
      return;
    }

    setSaving(true);
    try {
      await adjustPayrollApi(draft.payrollId, {
        adjustment_type: type,
        amount: Number(newItem.amount),
        reason: newItem.reason.trim()
      });

      showToast(`${type === 'BONUS' ? 'Incentive' : 'Deduction'} added successfully!`);
      setNewItem({ amount: "", reason: "" });
      setShowAddIncentive(false);
      setShowAddDeduction(false);
      loadDraft(); // Refresh to get new items and totals
    } catch (e) {
      console.error(e);
      showToast(e.response?.data?.message || "Failed to add item.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    setValidationErrors({});

    if (!draft?.payrollId) {
      showToast("No active payroll record to save.", "error");
      return;
    }

    if (!reason || reason.trim().length < 5) {
      setValidationErrors({ reason: "Note/Reason is required (min 5 characters) for auditing." });
      return;
    }

    setSaving(true);
    try {
      const res = await adjustPayrollApi(draft.payrollId, {
        ...fields,
        reason: reason.trim()
      });

      showToast("Payroll totals updated successfully!");
      setDraft(res.payroll);
      setReason(""); // Clear reason after success
      loadDraft(); // Refresh itemized view too
    } catch (e) {
      console.error(e);
      showToast(e.response?.data?.message || "Failed to save changes.", "error");
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
              <h1 className="page-title">Adjust Payroll</h1>
              <p className="page-subtitle">Apply an adjustment to an existing generated payroll.</p>
            </div>
          </div>

          {toast.message && (
            <div className="alert" style={{
              backgroundColor: toast.type === "error" ? "#fee2e2" : "#dcfce7",
              color: toast.type === "error" ? "#991b1b" : "#166534",
              borderColor: toast.type === "error" ? "#fecaca" : "#bbf7d0"
            }}>
              {toast.message}
            </div>
          )}

          <div className="grid-2">

            {/* LEFT: Controls */}
            <div className="card" style={{ zIndex: 10 }}>
              <div className="card-title">Select Payroll Record</div>

              <div className="form-row">
                <div className="form-field">
                  <label>Employee ID</label>
                  <input value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} />
                </div>
                <div className="form-field">
                  <label>Period Start Date</label>
                  <input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} />
                </div>
              </div>

              {loading ? (
                <div className="muted">Loading record...</div>
              ) : !draft ? (
                <div className="muted">No generated payroll found for this employee and period.</div>
              ) : (
                <>
                  <div className="divider" />
                  <div className="section-title">Edit Payslip Components</div>
                  <small className="hint" style={{ display: 'block', marginBottom: '16px' }}>
                    Modify overtime, EPF/ETF. Basic salary remains locked. Add incentives and deductions as individual items.
                  </small>

                  <div className="form-row">
                    <div className="form-field">
                      <label>Overtime Pay (LKR)</label>
                      <input
                        type="number"
                        value={fields.total_ot_pay}
                        onChange={(e) => setFields({ ...fields, total_ot_pay: Number(e.target.value) })}
                        min="0"
                      />
                    </div>
                    <div className="form-field">
                        <label>EPF Employee (8%) (LKR)</label>
                        <input
                            type="number"
                            value={fields.epf_employee}
                            onChange={(e) => setFields({ ...fields, epf_employee: Number(e.target.value) })}
                            min="0"
                        />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-field">
                      <label>EPF Employer (12%) (LKR)</label>
                      <input
                        type="number"
                        value={fields.epf_employer}
                        onChange={(e) => setFields({ ...fields, epf_employer: Number(e.target.value) })}
                        min="0"
                      />
                    </div>
                    <div className="form-field">
                      <label>ETF Employer (3%) (LKR)</label>
                      <input
                        type="number"
                        value={fields.etf_employer}
                        onChange={(e) => setFields({ ...fields, etf_employer: Number(e.target.value) })}
                        min="0"
                      />
                    </div>
                  </div>

                  {/* Itemized Incentives */}
                  <div className="divider" style={{ margin: '16px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div className="section-title">Incentives / Bonuses</div>
                    <button className="btn btn-sm" onClick={() => setShowAddIncentive(true)} style={{ padding: '4px 12px', fontSize: 12, background: '#dcfce7', color: '#166534' }}>+ Add Bonus</button>
                  </div>
                  
                  <div className="items-list">
                    {(draft.incentives || []).map((item, idx) => (
                      <div key={idx} className="item-row">
                        <span className="item-desc">{item.description}</span>
                        <span className="item-amt">{LKR(item.amount)}</span>
                      </div>
                    ))}
                    {(draft.incentives || []).length > 0 && (
                      <div className="item-row" style={{ background: '#f0fdf4', border: '1px dashed #10b981' }}>
                        <span className="item-desc" style={{ fontWeight: 800 }}>Total Incentives</span>
                        <span className="item-amt" style={{ color: '#10b981' }}>{LKR(fields.total_incentives)}</span>
                      </div>
                    )}
                    {(draft.incentives || []).length === 0 && <div className="muted" style={{ padding: '8px', fontSize: 13 }}>No manual incentives added.</div>}
                  </div>

                  {/* Itemized Deductions */}
                  <div className="divider" style={{ margin: '16px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div className="section-title">Deductions (Fines/Loans)</div>
                    <button className="btn btn-sm" onClick={() => setShowAddDeduction(true)} style={{ padding: '4px 12px', fontSize: 12, background: '#fee2e2', color: '#991b1b' }}>+ Add Deduction</button>
                  </div>

                  <div className="items-list">
                    {(draft.deductions || []).map((item, idx) => (
                      <div key={idx} className="item-row">
                        <span className="item-desc">{item.reason}</span>
                        <span className="item-amt" style={{ color: '#ef4444' }}>- {LKR(item.amount)}</span>
                      </div>
                    ))}
                    {(draft.deductions || []).length > 0 && (
                      <div className="item-row" style={{ background: '#fef2f2', border: '1px dashed #ef4444' }}>
                        <span className="item-desc" style={{ fontWeight: 800 }}>Total Deductions</span>
                        <span className="item-amt" style={{ color: '#ef4444' }}>{LKR(fields.total_deductions)}</span>
                      </div>
                    )}
                    {(draft.deductions || []).length === 0 && <div className="muted" style={{ padding: '8px', fontSize: 13 }}>No manual deductions added.</div>}
                  </div>

                  <div className="divider" />

                  <div className="form-row" style={{ gridTemplateColumns: '1fr' }}>
                    <div className="form-field">
                      <label>Reason for changes (Notes)</label>
                      <input
                        type="text"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Why are you making these changes? (min 5 characters)"
                        style={{ borderColor: validationErrors.reason ? "#ef4444" : "#e5e7eb" }}
                      />
                      {validationErrors.reason && <small style={{ color: "#ef4444", fontSize: 12, marginTop: 4, display: 'block' }}>{validationErrors.reason}</small>}
                    </div>
                  </div>

                  <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                      {saving ? "Saving Changes..." : "Update Payslip Totals"}
                    </button>
                  </div>

                </>
              )}
            </div>

            {/* RIGHT: Preview */}
            <div className="card" style={{ zIndex: 10 }}>
              <div className="card-title">Live Payout Preview</div>

              {!draft ? (
                <div className="muted">Record not loaded</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                    <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Employee Info</div>
                    <div style={{ fontWeight: 800, color: '#111827', fontSize: 15 }}>{employee?.first_name} {employee?.last_name} ({employee?.employee_id})</div>
                    <div style={{ fontSize: 13, color: '#4b5563', marginTop: 2 }}>Department: {employee?.department || 'N/A'}</div>
                  </div>

                  <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: 12 }}>Live Calculations</div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
                      <span style={{ color: '#475569', fontWeight: 600 }}>Basic Earnings:</span>
                      <span style={{ fontWeight: 700, color: '#64748b' }}>{LKR(draft.basic_earnings)}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
                      <span style={{ color: '#475569', fontWeight: 600 }}>Adjusted OT + Incentives:</span>
                      <span style={{ fontWeight: 700, color: '#10b981' }}>+ {LKR(Number(fields.total_ot_pay) + Number(fields.total_incentives))}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
                      <span style={{ color: '#475569', fontWeight: 600 }}>Gross Pay:</span>
                      <span style={{ fontWeight: 800, color: '#0f172a' }}>{LKR(liveGross)}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontSize: 14 }}>
                      <span style={{ color: '#475569', fontWeight: 600 }}>Total Deductions (incl. EPF):</span>
                      <span style={{ fontWeight: 700, color: '#ef4444' }}>- {LKR(Number(fields.total_deductions) + Number(fields.epf_employee))}</span>
                    </div>

                    <div style={{ height: 1, background: '#cbd5e1', marginBottom: 16 }}></div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#2c5530', fontWeight: 800, fontSize: 16 }}>Projected Net Pay:</span>
                      <span style={{ fontWeight: 900, color: '#166534', fontSize: 24, transition: 'all 0.3s ease' }}>{LKR(liveNet)}</span>
                    </div>

                    <div style={{ fontSize: 11, color: '#94a3b8', fontStyle: 'italic', marginTop: 12, textAlign: 'center' }}>
                      Calculations update as you type. Clicking save will update the official snapshot.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add Item Modal (Generic) */}
        {(showAddIncentive || showAddDeduction) && (
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)'
            }}>
                <div className="card" style={{ width: '400px', padding: '32px' }}>
                    <h3 className="section-title" style={{ marginBottom: 20 }}>
                        {showAddIncentive ? 'Add Incentive / Bonus' : 'Add Deduction'}
                    </h3>
                    <div className="form-field" style={{ marginBottom: 16 }}>
                        <label>Amount (LKR)</label>
                        <input type="number" value={newItem.amount} onChange={(e) => setNewItem({ ...newItem, amount: e.target.value })} autoFocus />
                    </div>
                    <div className="form-field" style={{ marginBottom: 24 }}>
                        <label>Reason / Description</label>
                        <input type="text" value={newItem.reason} onChange={(e) => setNewItem({ ...newItem, reason: e.target.value })} placeholder="e.g. Monthly Commission" />
                    </div>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                        <button className="btn" onClick={() => { setShowAddIncentive(false); setShowAddDeduction(false); setNewItem({ amount: "", reason: "" }); }}>Cancel</button>
                        <button className="btn btn-primary" onClick={() => handleAddItem(showAddIncentive ? 'BONUS' : 'DEDUCTION')} disabled={saving}>
                            {saving ? 'Processing...' : 'Confirm Addition'}
                        </button>
                    </div>
                </div>
            </div>
        )}
      </div>

      <style>{`
        .page-wrapper{position:relative;min-height:100%;overflow:hidden}
        .page-container{padding:24px;position:relative;z-index:1}
        
        .page-header{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:24px}
        .page-title{font-size:28px;font-weight:900;color:#2c5530;margin:0}
        .page-subtitle{margin:6px 0 0;color:#4b5563;font-size:15px}
        
        .grid-2{display:grid;grid-template-columns:1fr 1fr;gap:24px;max-width:1200px;margin:0 auto}
        @media (max-width: 900px){.grid-2{grid-template-columns:1fr}}
        
        .card{
          background:rgba(255, 255, 255, 0.9);
          backdrop-filter:blur(12px);
          border:1px solid rgba(255, 255, 255, 0.5);
          border-radius:18px;
          padding:24px;
          box-shadow:0 8px 25px rgba(0,0,0,0.03);
          display: flex;
          flex-direction: column;
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
        
        .divider{height:1px;background:#e5e7eb;margin:24px 0}
        
        .section-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
        .section-title{font-size:15px;font-weight:800;color:#374151;text-transform:uppercase}
        
        .form-row{display:grid;grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));gap:16px;margin-bottom:20px}
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
        
        .items-list {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-bottom: 12px;
        }
        .item-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 12px;
            background: #f8fafc;
            border-radius: 8px;
            border: 1px solid #f1f5f9;
        }
        .item-desc { font-size: 13px; font-weight: 600; color: #334155; }
        .item-amt { font-size: 13px; font-weight: 800; color: #1e293b; }

        .hint{display:block;color:#9ca3af;margin-top:6px;font-size:12px;font-style:italic}
        .muted{color:#9ca3af;font-style:italic;padding:20px;text-align:center}
        
        .alert{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px;margin-bottom:24px;color:#166534;font-weight:600}
        
        .btn{
          padding:10px 24px;
          border-radius:12px;
          font-weight:800;
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
      `}</style>
    </AppLayout>
  );
}
