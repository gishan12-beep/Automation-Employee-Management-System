import React, { useMemo, useState } from "react";

const LKR = (n) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(Number(n || 0));

export default function PayrollPreview({ employee, input, payroll, onClose }) {
  const [tab, setTab] = useState("Breakdown");

  const att = input?.attendance || {};
  const work = input?.workDetails || [];
  const ot = input?.overtime || [];
  const inc = input?.incentives || [];
  const allowances = input?.allowances || [];
  const deductions = input?.deductions || [];

  const isMonthly = payroll.isMonthly;
  const isDaily = payroll.isDaily;

  // ✅ Hide Overtime tab for Daily
  const tabs = useMemo(() => {
    const base = ["Breakdown", "Attendance", "Work Details", "Incentives", "Allowances", "Deductions"];
    if (!isDaily) base.splice(3, 0, "Overtime"); // insert after Work Details
    return base;
  }, [isDaily]);

  // safety: if tab becomes invalid (daily), fallback
  React.useEffect(() => {
    if (!tabs.includes(tab)) setTab("Breakdown");
  }, [tabs, tab]);

  return (
    <div style={styles.overlay} onMouseDown={onClose}>
      <div style={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <div>
            <div style={styles.title}>
              Payroll Preview — {employee.name} ({employee.employeeID})
            </div>
            <div style={styles.sub}>
              Period: <b>{payroll.period.label}</b> • {employee.department} • {employee.salaryType}
              {isMonthly ? ` • EPF/ETF: ${employee.epfEtfEligible ? "Eligible" : "Not eligible"}` : ""}
            </div>
          </div>
          <button style={styles.close} onClick={onClose}>✕</button>
        </div>

        <div style={styles.tabs}>
          {tabs.map((t) => (
            <button
              key={t}
              style={{ ...styles.tab, ...(tab === t ? styles.tabActive : {}) }}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>

        <div style={styles.body}>
          {tab === "Breakdown" && (
            <div style={styles.grid2}>
              <Panel title="Salary Breakdown">
                {isMonthly ? (
                  <Row label="Base Salary (Monthly)" value={LKR(payroll.basePay)} />
                ) : (
                  <>
                    <Row label="Task Earnings (Period)" value={LKR(payroll.taskEarnings)} />
                    <div style={styles.note}>
                      {isDaily ? "Daily wage: task-based (NO overtime)." : "Weekly wage: task-based + overtime (if any)."}
                    </div>
                  </>
                )}

                {!isDaily && <Row label="Overtime Total" value={LKR(payroll.overtimeTotal)} />}

                <Row label="Incentives" value={LKR(payroll.incentiveTotal)} />
                <Row label="Allowances" value={LKR(payroll.allowanceTotal)} />

                <hr style={styles.hr} />
                <Row label="Gross Pay" value={LKR(payroll.gross)} strong />
              </Panel>

              <Panel title="Deductions & Net Pay">
                {isMonthly ? (
                  <>
                    <Row label="EPF (Employee)" value={LKR(payroll.epfEmployee)} />
                    <div style={styles.note}>
                      Employer side: EPF = {LKR(payroll.employerEPF)} • ETF = {LKR(payroll.employerETF)}
                    </div>
                  </>
                ) : (
                  <div style={styles.note}>EPF/ETF deductions apply only for monthly employees.</div>
                )}

                <Row label="Other Deductions" value={LKR(payroll.otherDeductions)} />
                <hr style={styles.hr} />
                <Row label="Total Deductions" value={LKR(payroll.totalDeductions)} />
                <Row label="Net Pay" value={LKR(payroll.net)} strong />
              </Panel>

              <Panel title="Attendance Summary">
                <Row label="Present Days" value={att.presentDays ?? payroll.attendance.presentDays ?? 0} />
                <Row label="Half Days" value={att.halfDays ?? payroll.attendance.halfDays ?? 0} />
                <Row label="Absent Days" value={att.absentDays ?? payroll.attendance.absentDays ?? 0} />
                <Row label="Total Hours" value={att.totalHours ?? payroll.attendance.totalHours ?? 0} />
              </Panel>
            </div>
          )}

          {tab === "Attendance" && (
            <Panel title="Attendance Logs">
              {att.logs?.length ? (
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Date</th>
                      <th style={styles.th}>Check In</th>
                      <th style={styles.th}>Check Out</th>
                      <th style={styles.th}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {att.logs.map((x, idx) => (
                      <tr key={idx}>
                        <td style={styles.td}>{x.date}</td>
                        <td style={styles.td}>{x.in}</td>
                        <td style={styles.td}>{x.out}</td>
                        <td style={styles.td}>{x.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={styles.empty}>No attendance logs available.</div>
              )}
            </Panel>
          )}

          {tab === "Work Details" && (
            <Panel title="Work Details (Task Earnings)">
              {work.length ? (
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Date</th>
                      <th style={styles.th}>Task</th>
                      <th style={styles.th}>Qty</th>
                      <th style={styles.th}>Hours</th>
                      <th style={styles.th}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {work.map((x, idx) => (
                      <tr key={idx}>
                        <td style={styles.td}>{x.date}</td>
                        <td style={styles.td}>{x.task}</td>
                        <td style={styles.td}>{x.qty}</td>
                        <td style={styles.td}>{x.hours}</td>
                        <td style={styles.td}>{LKR(x.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={styles.empty}>No work details.</div>
              )}
            </Panel>
          )}

          {!isDaily && tab === "Overtime" && (
            <Panel title="Overtime">
              {ot.length ? (
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Date</th>
                      <th style={styles.th}>Hours</th>
                      <th style={styles.th}>Rate</th>
                      <th style={styles.th}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ot.map((x, idx) => (
                      <tr key={idx}>
                        <td style={styles.td}>{x.date}</td>
                        <td style={styles.td}>{x.hours}</td>
                        <td style={styles.td}>{LKR(x.rate)}</td>
                        <td style={styles.td}>{LKR(x.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={styles.empty}>No overtime records.</div>
              )}
            </Panel>
          )}

          {tab === "Incentives" && (
            <Panel title="Incentives">
              {inc.length ? (
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Date</th>
                      <th style={styles.th}>Description</th>
                      <th style={styles.th}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inc.map((x, idx) => (
                      <tr key={idx}>
                        <td style={styles.td}>{x.date}</td>
                        <td style={styles.td}>{x.desc}</td>
                        <td style={styles.td}>{LKR(x.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={styles.empty}>No incentives.</div>
              )}
            </Panel>
          )}

          {tab === "Allowances" && (
            <Panel title="Allowances">
              {allowances.length ? (
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Date</th>
                      <th style={styles.th}>Description</th>
                      <th style={styles.th}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allowances.map((x, idx) => (
                      <tr key={idx}>
                        <td style={styles.td}>{x.date}</td>
                        <td style={styles.td}>{x.desc}</td>
                        <td style={styles.td}>{LKR(x.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={styles.empty}>No allowances.</div>
              )}
            </Panel>
          )}

          {tab === "Deductions" && (
            <Panel title="Other Deductions (Advance / Loan / Penalty)">
              {deductions.length ? (
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Date</th>
                      <th style={styles.th}>Description</th>
                      <th style={styles.th}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deductions.map((x, idx) => (
                      <tr key={idx}>
                        <td style={styles.td}>{x.date}</td>
                        <td style={styles.td}>{x.desc}</td>
                        <td style={styles.td}>{LKR(x.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={styles.empty}>No deductions.</div>
              )}
            </Panel>
          )}
        </div>

        <div style={styles.footer}>
          <button style={styles.secondary} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <div style={styles.panel}>
      <div style={styles.panelTitle}>{title}</div>
      {children}
    </div>
  );
}

function Row({ label, value, strong }) {
  return (
    <div style={styles.row}>
      <div style={styles.rowLabel}>{label}</div>
      <div style={{ ...styles.rowValue, ...(strong ? { fontWeight: 900 } : {}) }}>{value}</div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(31, 41, 55, 0.4)", // Darker overlay for focus
    backdropFilter: "blur(4px)",
    display: "grid",
    placeItems: "center",
    padding: 14,
    zIndex: 1000,
    animation: "fadeIn 0.2s ease-out",
  },
  modal: {
    width: "min(1020px, 96vw)",
    maxHeight: "90vh",
    overflow: "hidden", // Use flex col for better scrolling
    display: "flex",
    flexDirection: "column",
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(20px)",
    borderRadius: 24,
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.5)",
    border: "1px solid rgba(255, 255, 255, 0.8)",
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
  close: {
    width: 32,
    height: 32,
    borderRadius: 10,
    border: "1px solid rgba(0,0,0,0.1)",
    background: "white",
    cursor: "pointer",
    fontWeight: 700,
    color: "#6b7280",
    display: "grid",
    placeItems: "center",
    transition: "all 0.2s",
  },
  tabs: {
    display: "flex",
    gap: 8,
    padding: "12px 24px",
    flexWrap: "wrap",
    borderBottom: "1px solid rgba(0,0,0,0.06)",
    background: "rgba(249, 250, 251, 0.5)",
  },
  tab: {
    height: 36,
    padding: "0 16px",
    borderRadius: 20,
    border: "1px solid transparent",
    background: "transparent",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 13,
    color: "#6b7280",
    transition: "all 0.2s",
  },
  tabActive: {
    background: "#e8f5e9", // Light green
    color: "#2c5530", // Dark green
    fontWeight: 700,
  },
  body: { padding: 24, overflowY: "auto" },
  grid2: { display: "grid", gap: 20, gridTemplateColumns: "repeat(2, minmax(0, 1fr))" },

  panel: {
    border: "1px solid rgba(0,0,0,0.06)",
    borderRadius: 16,
    padding: 20,
    background: "white",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
  },
  panelTitle: { fontWeight: 700, marginBottom: 16, fontSize: 15, color: "#111827", display: "flex", alignItems: "center", gap: 8 },

  row: { display: "flex", justifyContent: "space-between", gap: 12, padding: "8px 0", fontSize: 14 },
  rowLabel: { color: "#4b5563", fontWeight: 500 },
  rowValue: { fontWeight: 700, color: "#1f2937" },
  hr: { border: "none", borderTop: "1px dashed rgba(0,0,0,0.1)", margin: "16px 0" },
  note: { marginTop: 12, fontSize: 12, color: "#6b7280", padding: "8px 12px", background: "#f9fafb", borderRadius: 8 },

  table: { width: "100%", borderCollapse: "separate", borderSpacing: "0 4px" },
  th: {
    textAlign: "left",
    padding: "12px 16px",
    fontSize: 12,
    fontWeight: 600,
    color: "#4b5563",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    borderBottom: "1px solid #e5e7eb",
  },
  td: {
    padding: "12px 16px",
    background: "#f9fafb",
    fontSize: 13,
    color: "#1f2937",
    firstOfType: { borderRadius: "8px 0 0 8px" },
    lastOfType: { borderRadius: "0 8px 8px 0" },
  },
  empty: { padding: 24, textAlign: "center", color: "#9ca3af", fontStyle: "italic" },

  footer: {
    padding: "20px 24px",
    display: "flex",
    justifyContent: "flex-end",
    borderTop: "1px solid rgba(0,0,0,0.06)",
    background: "rgba(249, 250, 251, 0.8)",
  },
  secondary: {
    height: 40,
    borderRadius: 12,
    border: "1px solid #d1d5db",
    background: "white",
    padding: "0 20px",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 14,
    color: "#374151",
    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    transition: "all 0.2s",
  },
};
