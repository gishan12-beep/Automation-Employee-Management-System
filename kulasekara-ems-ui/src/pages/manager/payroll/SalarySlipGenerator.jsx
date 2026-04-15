import React, { useMemo } from "react";

const LKR = (n) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(Number(n || 0));

export default function SalarySlipGenerator({ employee, payroll, details, onClose }) {
  // Now payroll is the exact mapped object from ProcessPayroll's summary API
  // details is { incentives: [], deductions: [] } (optional)

  const slipNo = useMemo(() => {
    return `SLIP-${employee.employeeID}-${Date.now().toString().slice(-6)}`;
  }, [employee.employeeID]);

  const onPrint = () => window.print();

  const incentives = details?.incentives || [];
  const deductions = details?.deductions || [];

  return (
    <div style={styles.overlay} onMouseDown={onClose}>
      <div style={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <div>
            <div style={styles.title}>Salary Slip</div>
            <div style={styles.sub}>
              Kulasekara Oil Mills
            </div>
          </div>
          <div style={styles.actions}>
            <button style={styles.btn} onClick={onPrint}>Print</button>
            <button style={styles.btnSecondary} onClick={onClose}>Close</button>
          </div>
        </div>

        {/* Print Area */}
        <div id="slip-print-area" style={styles.sheet}>
          <div style={styles.sheetHeader}>
            <div>
              <div style={styles.company}>Kulasekara Oil Mills</div>
              <div style={styles.sheetMeta}>Salary Slip</div>
            </div>
            <div style={styles.rightMeta}>
              <div><b>Slip No:</b> {slipNo}</div>
              <div><b>Date:</b> {new Date().toISOString().slice(0, 10)}</div>
            </div>
          </div>

          <div style={styles.infoGrid}>
            <Info label="Employee ID" value={employee.employeeID} />
            <Info label="Employee Name" value={employee.name} />
            <Info label="Department" value={employee.department} />
            <Info label="Status" value={employee.status} />
          </div>

          <div style={styles.breakdownGrid}>
            <div style={styles.card}>
              <div style={styles.cardTitle}>Earnings</div>

              <Line label="Basic Earnings" value={LKR(payroll.basicSalary)} />
              <Line label="Overtime Pay" value={LKR(payroll.otPay)} />
              
              {incentives.length > 0 ? (
                <>
                  {incentives.map((inc, i) => (
                    <Line key={`inc-${i}`} label={inc.description || "Incentive"} value={LKR(inc.amount)} />
                  ))}
                  {(() => {
                    const manualSum = incentives.reduce((sum, item) => sum + Number(item.amount), 0);
                    const diff = Number(payroll.incentives) - manualSum;
                    return diff > 1 ? <Line label="Other Incentives" value={LKR(diff)} /> : null;
                  })()}
                </>
              ) : (
                <Line label="Incentives" value={LKR(payroll.incentives)} />
              )}

              <hr style={styles.hr} />
              <Line label="Gross Pay" value={LKR(payroll.gross)} strong />
            </div>

            <div style={styles.card}>
              <div style={styles.cardTitle}>Deductions</div>

              <Line label="EPF (Employee)" value={LKR(payroll.epfEmployee)} />
              <div style={styles.note}>
                Employer side: EPF {LKR(payroll.epfEmployer)} • ETF {LKR(payroll.etfEmployer)}
              </div>
              
              {deductions.length > 0 ? (
                <>
                  {deductions.map((ded, i) => (
                    <Line key={`ded-${i}`} label={ded.reason || "Other Deduction"} value={LKR(ded.amount)} />
                  ))}
                  {(() => {
                    const manualSum = deductions.reduce((sum, item) => sum + Number(item.amount), 0);
                    const diff = Number(payroll.deductions) - manualSum;
                    return diff > 1 ? <Line label="Other Deductions" value={LKR(diff)} /> : null;
                  })()}
                </>
              ) : (
                <Line label="Other Deductions" value={LKR(payroll.deductions)} />
              )}

              <hr style={styles.hr} />
              <Line label="Total Deductions" value={LKR(Number(payroll.epfEmployee || 0) + Number(payroll.deductions || 0))} />
              <Line label="Net Pay" value={LKR(payroll.netPay)} strong />
            </div>
          </div>

          <div style={styles.footerRow}>
            <div style={styles.signatureBox}>
              <div style={styles.sigLine} />
              <div style={styles.sigLabel}>Employee Signature</div>
            </div>

            <div style={styles.signatureBox}>
              <div style={styles.sigLine} />
              <div style={styles.sigLabel}>Authorized Signature</div>
            </div>
          </div>

          <div style={styles.smallNote}>
            Generated by Payroll System • Keep this slip for your records.
          </div>
        </div>
      </div>

      {/* Print CSS */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #slip-print-area, #slip-print-area * { visibility: visible !important; }
          #slip-print-area { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div style={styles.info}>
      <div style={styles.infoLabel}>{label}</div>
      <div style={styles.infoValue}>{value}</div>
    </div>
  );
}

function Line({ label, value, strong }) {
  return (
    <div style={styles.line}>
      <div style={styles.lineLabel}>{label}</div>
      <div style={{ ...styles.lineValue, ...(strong ? { fontWeight: 900 } : {}) }}>{value}</div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(31, 41, 55, 0.4)", // Darker for focus
    backdropFilter: "blur(4px)",
    display: "grid",
    placeItems: "center",
    padding: 14,
    zIndex: 1001,
    animation: "fadeIn 0.2s ease-out",
  },
  modal: {
    width: "min(980px, 96vw)",
    maxHeight: "90vh",
    overflow: "hidden", // Flex col
    display: "flex",
    flexDirection: "column",
    background: "white", // Print friendly - keep white
    borderRadius: 24,
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0,0,0,0.1)",
    border: "1px solid rgba(0,0,0,0.05)",
  },
  header: {
    padding: "20px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    borderBottom: "1px solid rgba(0,0,0,0.06)",
    background: "linear-gradient(to right, rgba(74, 124, 78, 0.05), transparent)",
  },
  title: { fontWeight: 800, fontSize: 18, color: "#1f2937" },
  sub: { marginTop: 4, fontSize: 13, color: "#4b5563" },
  actions: { display: "flex", gap: 10, alignItems: "center" },
  btn: {
    height: 40,
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(135deg, #4a7c4e 0%, #5a8c5e 100%)", // Theme Green
    padding: "0 20px",
    fontWeight: 700,
    cursor: "pointer",
    color: "white",
    boxShadow: "0 4px 6px -1px rgba(74, 124, 78, 0.3)",
    fontSize: 14,
    transition: "all 0.2s",
  },
  btnSecondary: {
    height: 40,
    borderRadius: 12,
    border: "1px solid #d1d5db",
    background: "white",
    padding: "0 20px",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 14,
    color: "#374151",
    transition: "all 0.2s",
  },

  sheet: { padding: 32, overflowY: "auto", flex: 1, background: "white" },
  sheetHeader: { display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 24, borderBottom: "2px solid #4a7c4e", paddingBottom: 20 },
  company: { fontSize: 22, fontWeight: 900, color: "#2c5530" },
  sheetMeta: { opacity: 0.8, marginTop: 4, fontSize: 14, fontWeight: 500, color: "#4b5563" },
  rightMeta: { textAlign: "right", fontSize: 13, color: "#1f2937", lineHeight: 1.5 },

  infoGrid: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 16, marginBottom: 24 },
  info: { border: "1px solid #e5e7eb", borderRadius: 12, padding: 12, background: "#f9fafb" },
  infoLabel: { fontSize: 11, color: "#6b7280", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" },
  infoValue: { marginTop: 4, fontWeight: 800, color: "#111827", fontSize: 14 },

  breakdownGrid: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 20 },
  card: { border: "1px solid #e5e7eb", borderRadius: 16, padding: 20, background: "white", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" },
  cardTitle: { fontWeight: 800, marginBottom: 16, fontSize: 15, color: "#111827", borderBottom: "1px dashed #e5e7eb", paddingBottom: 10 },
  line: { display: "flex", justifyContent: "space-between", gap: 12, padding: "8px 0", fontSize: 14 },
  lineLabel: { color: "#4b5563", fontWeight: 600 },
  lineValue: { fontWeight: 700, color: "#1f2937" },
  hr: { border: "none", borderTop: "2px solid #e5e7eb", margin: "14px 0" },
  note: { marginTop: 10, fontSize: 12, color: "#6b7280", fontStyle: "italic" },

  footerRow: { marginTop: 40, display: "flex", justifyContent: "space-between", gap: 40 },
  signatureBox: { flex: 1, textAlign: "center" },
  sigLine: { height: 1, background: "#9ca3af", margin: "40px 20px 10px" },
  sigLabel: { fontSize: 12, color: "#4b5563", fontWeight: 700, textTransform: "uppercase" },

  smallNote: { marginTop: 40, fontSize: 11, color: "#9ca3af", textAlign: "center" },
};
