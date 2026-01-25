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
    background: "rgba(0,0,0,0.45)",
    display: "grid",
    placeItems: "center",
    padding: 14,
    zIndex: 50,
  },
  modal: {
    width: "min(1020px, 96vw)",
    maxHeight: "90vh",
    overflow: "auto",
    background: "white",
    borderRadius: 16,
    boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
    border: "1px solid rgba(0,0,0,0.08)",
  },
  header: {
    padding: 14,
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    borderBottom: "1px solid rgba(0,0,0,0.08)",
  },
  title: { fontWeight: 900, fontSize: 16 },
  sub: { marginTop: 4, fontSize: 12, opacity: 0.75 },
  close: {
    width: 36,
    height: 36,
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.14)",
    background: "white",
    cursor: "pointer",
    fontWeight: 900,
  },
  tabs: {
    display: "flex",
    gap: 8,
    padding: 12,
    flexWrap: "wrap",
    borderBottom: "1px solid rgba(0,0,0,0.08)",
    background: "rgba(0,0,0,0.02)",
  },
  tab: {
    height: 34,
    padding: "0 12px",
    borderRadius: 999,
    border: "1px solid rgba(0,0,0,0.14)",
    background: "white",
    cursor: "pointer",
    fontWeight: 800,
    fontSize: 12,
  },
  tabActive: { background: "rgba(251,191,36,0.35)", borderColor: "rgba(251,191,36,0.8)" },
  body: { padding: 12 },
  grid2: { display: "grid", gap: 12, gridTemplateColumns: "repeat(2, minmax(0, 1fr))" },

  panel: { border: "1px solid rgba(0,0,0,0.08)", borderRadius: 14, padding: 12, background: "white" },
  panelTitle: { fontWeight: 900, marginBottom: 10 },

  row: { display: "flex", justifyContent: "space-between", gap: 12, padding: "6px 0" },
  rowLabel: { opacity: 0.75, fontWeight: 700 },
  rowValue: { fontWeight: 800 },
  hr: { border: "none", borderTop: "1px solid rgba(0,0,0,0.08)", margin: "10px 0" },
  note: { marginTop: 8, fontSize: 12, opacity: 0.7 },

  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: 10, fontSize: 12, opacity: 0.8, background: "rgba(0,0,0,0.03)" },
  td: { padding: 10, borderTop: "1px solid rgba(0,0,0,0.06)" },
  empty: { padding: 14, textAlign: "center", opacity: 0.75 },

  footer: { padding: 12, display: "flex", justifyContent: "flex-end", borderTop: "1px solid rgba(0,0,0,0.08)" },
  secondary: {
    height: 38,
    borderRadius: 10,
    border: "1px solid rgba(0,0,0,0.14)",
    background: "white",
    padding: "0 12px",
    fontWeight: 900,
    cursor: "pointer",
  },
};
