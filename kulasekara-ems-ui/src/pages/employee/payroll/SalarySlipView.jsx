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

  // ✅ Dummy fallback (if user refreshes the page)
  const payroll = useMemo(() => {
    return (
      payrollFromState || {
        payroll_id: 12,
        employee_id: "EMP001",
        month: 12,
        year: 2025,
        basic_earnings: 85000,
        total_ot_pay: 6500,
        gross_pay: 91500,
        epf_employee: 7320,
        epf_employer: 10980,
        etf_employer: 2745,
        net_pay: 84180,
        generated_at: "2026-01-05 10:15:00",
      }
    );
  }, [payrollFromState]);

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
      padding: "10px 12px",
      borderRadius: 10,
      border: "1px solid #111827",
      background: "#111827",
      color: "#fff",
      cursor: "pointer",
      fontWeight: 800,
    },
    btnGhost: {
      padding: "10px 12px",
      borderRadius: 10,
      border: "1px solid #e5e7eb",
      background: "#fff",
      color: "#111827",
      cursor: "pointer",
      fontWeight: 800,
    },

    card: {
      marginTop: 14,
      background: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: 14,
      boxShadow: "0 6px 18px rgba(17,24,39,0.06)",
      overflow: "hidden",
    },
    cardHd: { padding: "14px 14px 10px", borderBottom: "1px solid #eef2f7" },
    cardBd: { padding: 14 },

    headerGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 12,
    },
    infoBox: { border: "1px solid #eef2f7", borderRadius: 12, padding: 12, background: "#fbfdff" },
    label: { fontSize: 12, color: "#6b7280", marginBottom: 6 },
    value: { fontSize: 13, color: "#111827", fontWeight: 800 },

    kpiRow: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: 12 },
    kpi: { border: "1px solid #eef2f7", borderRadius: 12, padding: 12 },
    kpiLbl: { fontSize: 12, color: "#6b7280", marginBottom: 6 },
    kpiVal: { fontSize: 18, fontWeight: 900, color: "#111827" },

    split: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 },

    sectionTitle: { margin: "2px 0 10px", fontSize: 13, fontWeight: 900, color: "#111827" },
    row: { display: "flex", justifyContent: "space-between", gap: 12, padding: "10px 0", borderBottom: "1px dashed #eef2f7" },
    left: { fontSize: 13, color: "#374151" },
    right: { fontSize: 13, fontWeight: 900, color: "#111827" },

    totalRow: {
      display: "flex",
      justifyContent: "space-between",
      gap: 12,
      padding: "12px 0",
      borderTop: "1px solid #eef2f7",
      marginTop: 4,
    },
    totalLeft: { fontSize: 13, fontWeight: 900, color: "#111827" },
    totalRight: { fontSize: 14, fontWeight: 900, color: "#111827" },

    note: { marginTop: 10, fontSize: 12, color: "#6b7280" },
  };

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

          <div style={styles.card}>
            <div style={styles.cardHd}>
              <div style={{ fontWeight: 900, color: "#111827" }}>Payslip Summary</div>
            </div>

            <div style={styles.cardBd}>
              <div style={styles.headerGrid}>
                <div style={styles.infoBox}>
                  <div style={styles.label}>Employee ID</div>
                  <div style={styles.value}>{payroll.employee_id || "—"}</div>
                </div>
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
                Note: This is a UI-only slip preview. Once backend is connected, values will be loaded from payroll_runs.
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
