import React, { useState } from "react";

const LKR = (n) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(Number(n || 0));

export default function PayrollPreview({ employee, payroll, onClose }) {
  const [tab, setTab] = useState("Breakdown");

  return (
    <div style={styles.overlay} onMouseDown={onClose}>
      <div style={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <div>
            <div style={styles.title}>
              Payroll Preview — {employee.name} ({employee.employeeID})
            </div>
            <div style={styles.sub}>
              {employee.department} • {employee.status}
            </div>
          </div>
          <button style={styles.close} onClick={onClose}>✕</button>
        </div>

        <div style={styles.tabs}>
            <button
              style={{ ...styles.tab, ...styles.tabActive }}
            >
              Breakdown
            </button>
        </div>

        <div style={styles.body}>
          {tab === "Breakdown" && (
            <div style={styles.grid2}>
              <Panel title="Salary Breakdown">

                <Row label="Basic Earnings" value={LKR(payroll.basicSalary)} />
                <Row label="Overtime Total" value={LKR(payroll.otPay)} />
                <Row label="Incentives" value={LKR(payroll.incentives)} />

                <hr style={styles.hr} />
                <Row label="Gross Pay" value={LKR(payroll.gross)} strong />
              </Panel>

              <Panel title="Deductions & Net Pay">

                <Row label="EPF (Employee)" value={LKR(payroll.epfEmployee)} />
                <div style={styles.note}>
                  Employer side: EPF = {LKR(payroll.epfEmployer)} • ETF = {LKR(payroll.etfEmployer)}
                </div>

                <Row label="Other Deductions" value={LKR(payroll.deductions)} />
                <hr style={styles.hr} />
                <Row label="Total Deductions" value={LKR((payroll.epfEmployee || 0) + (payroll.deductions || 0))} />
                <Row label="Net Pay" value={LKR(payroll.netPay)} strong />
              </Panel>

            </div>
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
    background: "var(--glass-bg)",
    backdropFilter: "var(--glass-blur)",
    WebkitBackdropFilter: "var(--glass-blur)",
    borderRadius: 24,
    boxShadow: "var(--glass-shadow)",
    border: "var(--glass-border)",
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
    background: "#4a7c4e",
    color: "#fff",
    fontWeight: 700,
    boxShadow: "0 4px 10px rgba(74, 124, 78, 0.2)",
  },
  body: { padding: 24, overflowY: "auto" },
  grid2: { display: "grid", gap: 20, gridTemplateColumns: "repeat(2, minmax(0, 1fr))" },

  panel: {
    border: "var(--glass-border)",
    borderRadius: 16,
    padding: 20,
    background: "rgba(255, 255, 255, 0.3)",
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
