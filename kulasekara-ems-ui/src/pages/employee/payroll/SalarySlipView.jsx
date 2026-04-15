import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AppLayout from "../../../components/layout/AppLayout";

const money = (n) =>
  Number(n || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 });

export default function SalarySlipView() {
  const navigate = useNavigate();
  const location = useLocation();

  const payrollFromState = location?.state?.payroll;
  const payroll = payrollFromState;

  if (!payroll) {
    return (
      <AppLayout>
        <div style={{ padding: 60, textAlign: 'center', color: '#6b7280' }}>
          <h2 style={{ color: '#2c5530', fontWeight: 900 }}>Payslip Not Found</h2>
          <p style={{ fontWeight: 600 }}>Please select a payslip from your Salary History.</p>
          <button 
            onClick={() => navigate('/employee/payroll/salary-history')} 
            style={{ 
              marginTop: 20,
              padding: '12px 24px', 
              borderRadius: 12, 
              background: '#4a7c4e', 
              color: '#fff', 
              border: 'none', 
              fontWeight: 800, 
              cursor: 'pointer',
              textTransform: 'uppercase'
            }}
          >
            Go Back
          </button>
        </div>
      </AppLayout>
    );
  }

  const period = `${String(payroll.month).padStart(2, "0")}/${payroll.year}`;

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
          .page-container { padding: 30px; position: relative; z-index: 1; max-width: 1000px; margin: 0 auto; }
          
          .header-row { display: flex; justify-content: space-between; gap: 20px; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; }
          .title-group .title { font-size: 28px; font-weight: 900; color: #2c5530; margin: 0 0 8px 0; }
          .title-group .sub { color: #4b5563; font-size: 15px; margin: 0; font-weight: 500;}

          .btn-group { display: flex; gap: 12px; }
          .btn { padding: 12px 24px; border-radius: 12px; font-weight: 800; font-size: 13px; cursor: pointer; transition: all 0.2s; border: 1px solid #e5e7eb; color: #374151; background: #fff; text-transform: uppercase; }
          .btn:hover { background: #f9fafb; transform: translateY(-1px); }
          .btn-primary { background: linear-gradient(135deg, #4a7c4e 0%, #5a8c5e 100%); color: #fff; border: none; box-shadow: 0 4px 15px rgba(74, 124, 78, 0.15); }
          
          .slip-card { background: var(--glass-bg); backdrop-filter: var(--glass-blur); -webkit-backdrop-filter: var(--glass-blur); border: var(--glass-border); border-radius: 20px; box-shadow: var(--glass-shadow); overflow: hidden; }
          .slip-header { padding: 30px; border-bottom: 2px solid #4a7c4e; background: rgba(255, 255, 255, 0.4); }
          .slip-body { padding: 30px; }
          
          .company-name { font-size: 20px; font-weight: 900; color: #111827; margin-bottom: 4px; }
          .slip-subtitle { font-size: 14px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }

          .info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
          .info-box { background: rgba(255, 255, 255, 0.5); border: 1px solid rgba(0,0,0,0.05); padding: 16px; border-radius: 16px; }
          .info-label { font-size: 11px; font-weight: 800; color: #6b7280; text-transform: uppercase; margin-bottom: 6px; }
          .info-value { font-size: 15px; font-weight: 800; color: #111827; }

          .kpi-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
          .kpi-box { padding: 20px; border-radius: 16px; background: rgba(255, 255, 255, 0.7); border: 1px solid rgba(0,0,0,0.03); }
          .kpi-box.highlight { background: rgba(74, 124, 78, 0.08); border-color: rgba(74, 124, 78, 0.2); }
          
          .details-split { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
          .section-title { font-size: 14px; font-weight: 900; color: #2c5530; margin-bottom: 16px; border-bottom: 2px dashed rgba(74, 124, 78, 0.1); padding-bottom: 8px; text-transform: uppercase; }
          
          .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid rgba(0,0,0,0.03); }
          .detail-label { font-size: 13px; font-weight: 600; color: #4b5563; }
          .detail-value { font-size: 14px; font-weight: 800; color: #111827; font-family: 'JetBrains Mono', monospace; }

          .summary-row { display: flex; justify-content: space-between; padding: 20px 0; border-top: 2px solid #111827; margin-top: 20px; align-items: center; }
          .summary-label { font-size: 16px; font-weight: 900; color: #111827; text-transform: uppercase; }
          .summary-value { font-size: 22px; font-weight: 900; color: #2c5530; }

          .note { margin-top: 40px; text-align: center; font-size: 12px; color: #9ca3af; font-weight: 600; font-style: italic; }

          @media print {
            body * { visibility: hidden; background: #fff !important; }
            .page-wrapper, .floating-circle { display: none !important; }
            #printable-slip, #printable-slip * { visibility: visible; }
            #printable-slip { position: absolute; left: 0; top: 0; width: 100%; border: none; box-shadow: none; background: #fff !important; backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }
            .slip-header { border-bottom: 2px solid #000; background: #fff !important; }
            .info-box, .kpi-box { background: #fff !important; border: 1px solid #ddd !important; }
          }
          
          @media (max-width: 700px) {
            .info-grid, .kpi-row, .details-split { grid-template-columns: 1fr; }
          }
        `}</style>

        <div className="floating-circle fc-1"></div>
        <div className="floating-circle fc-2"></div>
        <div className="floating-circle fc-3"></div>

        <div className="page-container">
          <div className="header-row">
            <div className="title-group">
              <h1 className="title">Salary Slip</h1>
              <p className="sub">Detailed breakdown of your earnings and deductions for {period}</p>
            </div>

            <div className="btn-group">
              <button className="btn" onClick={() => navigate(-1)}>← Back</button>
              <button className="btn btn-primary" onClick={() => window.print()}>Print Slip</button>
            </div>
          </div>

          <div id="printable-slip" className="slip-card">
            <div className="slip-header">
              <div className="company-name">Kulasekara Oil Mills (Pvt) Ltd</div>
              <div className="slip-subtitle">Employee Payslip Statement</div>
            </div>

            <div className="slip-body">
              <div className="info-grid">
                <div className="info-box">
                  <div className="info-label">Pay Period</div>
                  <div className="info-value">{period}</div>
                </div>
                <div className="info-box">
                  <div className="info-label">Payroll Reference</div>
                  <div className="info-value">#PAY-{payroll.payroll_id}</div>
                </div>
                <div className="info-box">
                  <div className="info-label">Generation Date</div>
                  <div className="info-value">
                    {payroll.generated_at ? new Date(payroll.generated_at).toLocaleString() : "—"}
                  </div>
                </div>
              </div>

              <div className="kpi-row">
                <div className="kpi-box">
                  <div className="info-label">Basic Earnings</div>
                  <div className="info-value">LKR {money(payroll.basic_earnings)}</div>
                </div>
                <div className="kpi-box">
                  <div className="info-label">OT Earnings</div>
                  <div className="info-value">LKR {money(payroll.total_ot_pay)}</div>
                </div>
                <div className="kpi-box highlight">
                  <div className="info-label" style={{ color: '#2c5530' }}>Net Take Home</div>
                  <div className="info-value" style={{ fontSize: 18, color: '#2c5530' }}>LKR {money(payroll.net_pay)}</div>
                </div>
              </div>

              <div className="details-split">
                <div>
                  <h4 className="section-title">Earnings Breakdown</h4>
                  <div className="detail-row">
                    <span className="detail-label">Basic Salary</span>
                    <span className="detail-value">LKR {money(payroll.basic_earnings)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Overtime Pay (OT)</span>
                    <span className="detail-value">LKR {money(payroll.total_ot_pay)}</span>
                  </div>
                  <div className="detail-row" style={{ borderBottom: 'none', marginTop: 8 }}>
                    <span className="detail-label" style={{ fontWeight: 900, color: '#111827' }}>Gross Earnings</span>
                    <span className="detail-value" style={{ fontWeight: 900, color: '#111827' }}>LKR {money(payroll.gross_pay)}</span>
                  </div>
                </div>

                <div>
                  <h4 className="section-title">Deductions & Benefits</h4>
                  <div className="detail-row">
                    <span className="detail-label">EPF (Employee 8%)</span>
                    <span className="detail-value" style={{ color: '#991b1b' }}>- LKR {money(payroll.epf_employee)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Other Deductions</span>
                    <span className="detail-value" style={{ color: '#991b1b' }}>
                      - LKR {money(Number(payroll.gross_pay || 0) - Number(payroll.net_pay || 0) - Number(payroll.epf_employee || 0))}
                    </span>
                  </div>
                  <div className="detail-row" style={{ borderBottom: 'none', paddingTop: 16 }}>
                    <span className="detail-label">Employer Contributions</span>
                  </div>
                  <div className="detail-row" style={{ borderBottom: 'none' }}>
                    <span className="detail-label" style={{ fontSize: 11 }}>EPF (Employer 12%)</span>
                    <span className="detail-value" style={{ fontSize: 12 }}>LKR {money(payroll.epf_employer)}</span>
                  </div>
                  <div className="detail-row" style={{ borderBottom: 'none' }}>
                    <span className="detail-label" style={{ fontSize: 11 }}>ETF (Employer 3%)</span>
                    <span className="detail-value" style={{ fontSize: 12 }}>LKR {money(payroll.etf_employer)}</span>
                  </div>
                </div>
              </div>

              <div className="summary-row">
                <span className="summary-label">Final Net Pay</span>
                <span className="summary-value">LKR {money(payroll.net_pay)}</span>
              </div>

              <div className="note">
                This payslip is a computer-generated document and does not require a physical signature.
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

