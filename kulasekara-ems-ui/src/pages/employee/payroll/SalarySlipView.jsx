import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AppLayout from "../../../components/layout/AppLayout";

const money = (n) =>
  Number(n || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 });

export default function SalarySlipView() {
  const navigate = useNavigate();
  const location = useLocation();

  // If navigated from SalaryHistory, data comes via location.state
  const payrollFromState = location?.state?.payroll;

  // Real fallback (if user refreshes the page we should technically fetch it by slipId but for now just show a message)
  const payroll = payrollFromState;

  if (!payroll) {
    return (
      <AppLayout>
        <div style={{ padding: 40, textAlign: 'center' }}>
          <h2>Payslip Not Found</h2>
          <p>Please select a payslip from your Salary History.</p>
          <button onClick={() => navigate('/employee/payroll/salary-history')} style={{ padding: '10px 20px', cursor: 'pointer' }}>Go Back</button>
        </div>
      </AppLayout>
    );
  }

  const period = `${String(payroll.month).padStart(2, "0")}/${payroll.year}`;

  return (
    <AppLayout>
      <div style={styles.page}>
        <div style={styles.wrap}>
          <div style={styles.topRow}>
            <div>
              <h1 style={styles.title}>Salary Slip</h1>
              <p style={styles.sub}>Detailed payslip view for {period}.</p>
            </div>

            <div style={styles.btnRow}>
              <button style={styles.btnGhost} onClick={() => navigate(-1)}>
                ← Back
              </button>
              <button
                style={styles.btn}
                onClick={() => window.print()}
                title="Print / Save as PDF"
              >
                Print
              </button>
            </div>
          </div>

          {/* This wrapper is the print area */}
          <div id="printable-slip" style={styles.card}>
            <style>{`
                 @media print {
                     body * { visibility: hidden; }
                     #printable-slip, #printable-slip * { visibility: visible; }
                     #printable-slip { position: absolute; left: 0; top: 0; width: 100%; border: none; box-shadow: none; }
                     .btnRow { display: none !important; }
                 }
            `}</style>

            <div style={styles.cardHd}>
              <div style={{ fontWeight: 900, color: "#111827", fontSize: 18 }}>Kulasekara Oil Mills</div>
              <div style={{ fontSize: 13, color: '#6b7280' }}>Payslip Statement for {period}</div>
            </div>

            <div style={styles.cardBd}>
              <div style={styles.headerGrid}>
                <div style={styles.infoBox}>
                  <div style={styles.label}>Pay Period</div>
                  <div style={styles.value}>{period}</div>
                </div>
                <div style={styles.infoBox}>
                  <div style={styles.label}>Generated At</div>
                  <div style={styles.value}>
                    {payroll.generated_at ? new Date(payroll.generated_at).toLocaleString() : "—"}
                  </div>
                </div>
                <div style={styles.infoBox}>
                  <div style={styles.label}>Payroll Ref</div>
                  <div style={styles.value}>#{payroll.payroll_id}</div>
                </div>
              </div>

              <div style={styles.kpiRow}>
                <div style={styles.kpi}>
                  <div style={styles.kpiLbl}>Basic Earnings</div>
                  <div style={styles.kpiVal}>LKR {money(payroll.basic_earnings)}</div>
                </div>
                <div style={styles.kpi}>
                  <div style={styles.kpiLbl}>OT Pay</div>
                  <div style={styles.kpiVal}>LKR {money(payroll.total_ot_pay)}</div>
                </div>
                <div style={styles.kpi}>
                  <div style={styles.kpiLbl}>Net Pay</div>
                  <div style={styles.kpiVal}>LKR {money(payroll.net_pay)}</div>
                </div>
              </div>

              <div style={styles.split}>
                <div style={styles.infoBox}>
                  <div style={styles.sectionTitle}>Earnings</div>

                  <div style={styles.row}>
                    <div style={styles.left}>Basic Earnings</div>
                    <div style={styles.right}>LKR {money(payroll.basic_earnings)}</div>
                  </div>

                  <div style={styles.row}>
                    <div style={styles.left}>Overtime Pay</div>
                    <div style={styles.right}>LKR {money(payroll.total_ot_pay)}</div>
                  </div>

                  <div style={{ ...styles.row, borderBottom: "none" }}>
                    <div style={styles.left}>Gross Pay</div>
                    <div style={styles.right}>LKR {money(payroll.gross_pay)}</div>
                  </div>
                </div>

                <div style={styles.infoBox}>
                  <div style={styles.sectionTitle}>Deductions & Contributions</div>

                  <div style={styles.row}>
                    <div style={styles.left}>EPF (Employee)</div>
                    <div style={styles.right}>LKR {money(payroll.epf_employee)}</div>
                  </div>

                  <div style={styles.row}>
                    <div style={styles.left}>Other Deductions / Overrides</div>
                    {/* Infer deductions taken manually since this is just a single net patch now. Not ideal but functional if we don't have detail fields */}
                    <div style={styles.right}>
                      LKR {money(Number(payroll.gross_pay || 0) - Number(payroll.net_pay || 0) - Number(payroll.epf_employee || 0))}
                    </div>
                  </div>

                  <div style={{ ...styles.row, borderBottom: "none", marginTop: 12 }}>
                    <div style={styles.left}>EPF (Employer)</div>
                    <div style={styles.right}>LKR {money(payroll.epf_employer)}</div>
                  </div>

                  <div style={{ ...styles.row, borderBottom: "none" }}>
                    <div style={styles.left}>ETF (Employer)</div>
                    <div style={styles.right}>LKR {money(payroll.etf_employer)}</div>
                  </div>

                  <div style={styles.totalRow}>
                    <div style={styles.totalLeft}>Final Net Pay</div>
                    <div style={styles.totalRight}>LKR {money(payroll.net_pay)}</div>
                  </div>
                </div>
              </div>

              <div style={styles.note}>
                This slip was generated automatically by the payroll system.
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

const styles = {
  page: { background: "#f6f7fb", minHeight: "100vh" },
  wrap: { maxWidth: 900, margin: "0 auto", padding: "18px 16px" },

  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
    flexWrap: "wrap",
  },
  title: { margin: 0, fontSize: 20, fontWeight: 900, color: "#111827" },
  sub: { margin: "6px 0 0", fontSize: 13, color: "#6b7280" },

  btnRow: { display: "flex", gap: 10, flexWrap: "wrap" },
  btn: {
    padding: "10px 18px",
    borderRadius: 10,
    border: "none",
    background: "linear-gradient(135deg, #4a7c4e 0%, #5a8c5e 100%)",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 800,
  },
  btnGhost: {
    padding: "10px 18px",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    background: "#fff",
    color: "#111827",
    cursor: "pointer",
    fontWeight: 800,
  },

  card: {
    marginTop: 24,
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    boxShadow: "0 6px 18px rgba(17,24,39,0.06)",
    overflow: "hidden",
  },
  cardHd: { padding: "24px 24px 16px", borderBottom: "2px solid #4a7c4e" },
  cardBd: { padding: 24 },

  headerGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 16,
    marginBottom: 24
  },
  infoBox: { border: "1px solid #eef2f7", borderRadius: 12, padding: 16, background: "#fbfdff" },
  label: { fontSize: 12, color: "#6b7280", marginBottom: 6, fontWeight: 700, textTransform: 'uppercase' },
  value: { fontSize: 15, color: "#111827", fontWeight: 800 },

  kpiRow: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 12, marginBottom: 24 },
  kpi: { border: "1px solid #eef2f7", borderRadius: 12, padding: 16, background: '#f8fafc' },
  kpiLbl: { fontSize: 12, color: "#6b7280", marginBottom: 6, fontWeight: 700, textTransform: 'uppercase' },
  kpiVal: { fontSize: 20, fontWeight: 900, color: "#111827" },

  split: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 12 },

  sectionTitle: { margin: "2px 0 16px", fontSize: 14, fontWeight: 900, color: "#111827", borderBottom: '1px dashed #e2e8f0', paddingBottom: 8 },
  row: { display: "flex", justifyContent: "space-between", gap: 12, padding: "10px 0", borderBottom: "1px dashed #eef2f7" },
  left: { fontSize: 13, color: "#374151" },
  right: { fontSize: 14, fontWeight: 900, color: "#111827" },

  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    padding: "16px 0 4px",
    borderTop: "2px solid #e2e8f0",
    marginTop: 8,
  },
  totalLeft: { fontSize: 14, fontWeight: 900, color: "#111827" },
  totalRight: { fontSize: 18, fontWeight: 900, color: "#2c5530" },

  note: { marginTop: 32, fontSize: 12, color: "#9ca3af", fontStyle: 'italic', textAlign: 'center' },
};
