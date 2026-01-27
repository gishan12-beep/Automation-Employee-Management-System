// src/pages/manager/settlement/SettlementCalculator.jsx
import React, { useState, useMemo } from "react";
import AppLayout from "../../../components/layout/AppLayout";

const mockEmployees = [
  { employeeID: "EMP001", name: "Kamal Perera", department: "Production", jobRole: "Worker", salaryType: "Daily", basicSalary: 45000 },
  { employeeID: "EMP002", name: "Sunil Silva", department: "Logistics", jobRole: "Driver", salaryType: "Monthly", basicSalary: 60000 },
  { employeeID: "EMP003", name: "Saman Jayasuriya", department: "Stores", jobRole: "Helper", salaryType: "Daily", basicSalary: 42000 },
  { employeeID: "EMP004", name: "Nimali Fernando", department: "Production", jobRole: "Supervisor", salaryType: "Monthly", basicSalary: 75000 },
];

export default function SettlementCalculator() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null); // employeeID
  const [form, setForm] = useState({
    employeeID: "",
    lastWorkingDate: "",
    reason: "Resigned",
    notes: "",
    unpaidSalary: 0,
    unpaidOT: 0,
    incentives: 0,
    allowances: 0,
    unusedLeavePay: 0,
    epfEtfAdjustment: 0,
    advances: 0,
    otherDeductions: 0,
  });

  const [result, setResult] = useState({ gross: 0, deductions: 0, finalAmount: 0 });

  const filteredEmployees = useMemo(() => {
    const s = search.toLowerCase();
    if (!s) return mockEmployees;
    return mockEmployees.filter(
      (e) =>
        e.employeeID.toLowerCase().includes(s) ||
        e.name.toLowerCase().includes(s) ||
        e.department.toLowerCase().includes(s)
    );
  }, [search]);

  const selectedEmployee = useMemo(
    () => mockEmployees.find((e) => e.employeeID === selected),
    [selected]
  );

  const handlePickEmployee = (e) => {
    setSelected(e.employeeID);
    setForm((prev) => ({
      ...prev,
      employeeID: e.employeeID,
      lastWorkingDate: new Date().toISOString().split("T")[0],
      unpaidSalary: 0,
      unpaidOT: 0,
      incentives: 0,
      allowances: 0,
      unusedLeavePay: 0,
      epfEtfAdjustment: 0,
      advances: 0,
      otherDeductions: 0,
    }));
    setResult({ gross: 0, deductions: 0, finalAmount: 0 });
  };

  const setNum = (field, val) => {
    const v = parseFloat(val) || 0;
    setForm((p) => ({ ...p, [field]: v }));
  };

  const calculate = () => {
    const gross =
      form.unpaidSalary +
      form.unpaidOT +
      form.incentives +
      form.allowances +
      form.unusedLeavePay +
      form.epfEtfAdjustment;
    const deductions = form.advances + form.otherDeductions;
    const final = gross - deductions;
    setResult({ gross, deductions, finalAmount: final });
  };

  const resetAll = () => {
    setSelected(null);
    setSearch("");
    setForm({
      employeeID: "",
      lastWorkingDate: "",
      reason: "Resigned",
      notes: "",
      unpaidSalary: 0,
      unpaidOT: 0,
      incentives: 0,
      allowances: 0,
      unusedLeavePay: 0,
      epfEtfAdjustment: 0,
      advances: 0,
      otherDeductions: 0,
    });
    setResult({ gross: 0, deductions: 0, finalAmount: 0 });
  };

  const saveMock = () => {
    alert("Settlement saved (UI Mock)!");
  };

  // --- Styles ---
  const styles = useMemo(() => ({
    page: { position: "relative", minHeight: "100%", overflow: "hidden" },
    container: { padding: 32, position: "relative", zIndex: 1 },
    headerRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 12,
      marginBottom: 32,
      maxWidth: 1200,
      margin: "0 auto 32px auto"
    },
    title: { margin: 0, fontSize: 28, fontWeight: 900, color: "#2c5530" },
    sub: { margin: "6px 0 0", color: "#4b5563", fontSize: 15 },
    headerActions: { display: "flex", gap: 12 },

    grid: {
      display: "grid",
      gridTemplateColumns: "0.9fr 1.3fr",
      gap: 24,
      maxWidth: 1200,
      margin: "0 auto"
    },

    card: {
      background: "rgba(255, 255, 255, 0.9)",
      backdropFilter: "blur(12px)",
      borderRadius: 18,
      border: "1px solid rgba(255, 255, 255, 0.5)",
      boxShadow: "0 8px 25px rgba(0,0,0,0.03)",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      maxHeight: "800px" // prevent infinite grow
    },
    cardTop: {
      padding: "20px 24px 16px",
      borderBottom: "1px solid rgba(0,0,0,0.05)",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 10,
    },
    cardTitle: { margin: 0, fontSize: 16, fontWeight: 800, color: "#1f2937", textTransform: "uppercase" },
    badge: {
      fontSize: 12,
      padding: "4px 10px",
      borderRadius: 999,
      background: "#f3f4f6",
      color: "#4b5563",
      fontWeight: 700,
    },
    hint: { fontSize: 13, color: "#9ca3af", fontStyle: "italic" },

    searchWrap: { padding: "16px 24px 12px" },
    input: {
      width: "100%",
      padding: "12px 16px",
      borderRadius: 12,
      border: "1px solid #e5e7eb",
      outline: "none",
      fontSize: 14,
      background: "#fff",
      transition: "border 0.2s"
    },

    tableWrap: { padding: "0 24px 24px", overflow: "auto", flex: 1 },
    table: { width: "100%", borderCollapse: "separate", borderSpacing: "0 4px", fontSize: 13 },
    th: {
      textAlign: "left",
      padding: "10px 12px",
      color: "#6b7280",
      fontWeight: 700,
      textTransform: "uppercase",
      fontSize: 11
    },
    thRight: { textAlign: "right", padding: "10px 12px", color: "#6b7280", fontWeight: 700, textTransform: "uppercase", fontSize: 11 },
    thCenter: { textAlign: "center", padding: "10px 12px", color: "#6b7280", fontWeight: 700, textTransform: "uppercase", fontSize: 11 },

    tr: { transition: "background 0.2s" },
    trActive: { background: "#f0fdf4" },

    td: { padding: "12px 12px", color: "#111827", background: "rgba(255,255,255,0.4)", borderRadius: 8 },
    tdMono: { padding: "12px 12px", fontSize: 12, fontFamily: "monospace", color: "#374151", background: "rgba(255,255,255,0.4)", borderRadius: 8 },
    tdRight: { padding: "12px 12px", textAlign: "right", color: "#111827", background: "rgba(255,255,255,0.4)", borderRadius: 8 },
    tdCenter: { padding: "12px 12px", textAlign: "center", background: "rgba(255,255,255,0.4)", borderRadius: 8 },
    emptyTd: { padding: 24, textAlign: "center", color: "#9ca3af", fontStyle: "italic" },

    smallBtn: {
      padding: "6px 12px",
      borderRadius: 8,
      border: "1px solid #d1d5db",
      background: "#fff",
      cursor: "pointer",
      fontSize: 12,
      fontWeight: 600,
    },
    smallBtnActive: {
      padding: "6px 12px",
      borderRadius: 8,
      border: "1px solid #166534",
      background: "#166534",
      color: "#fff",
      cursor: "pointer",
      fontSize: 12,
      fontWeight: 600,
    },

    selectedBox: { padding: 16, borderTop: "1px solid #f3f4f6", background: "rgba(249,250,251,0.5)" },
    selectedRow: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 },
    selectedName: { fontWeight: 800, color: "#111827", fontSize: 15 },
    selectedMeta: { marginTop: 4, fontSize: 12, color: "#6b7280" },
    pill: { fontSize: 11, padding: "4px 10px", borderRadius: 999, background: "#e0e7ff", color: "#3730a3", fontWeight: 800 },

    formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, padding: 24 },
    formCol: { display: "flex", flexDirection: "column", gap: 16 },

    label: { fontSize: 12, color: "#6b7280", fontWeight: 700, textTransform: "uppercase", marginBottom: 6 },
    sectionTitle: { marginTop: 8, fontSize: 14, color: "#374151", fontWeight: 800, borderBottom: "1px solid #e5e7eb", paddingBottom: 6, marginBottom: 12 },

    rowField: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      padding: "10px 14px",
      border: "1px solid #e5e7eb",
      borderRadius: 12,
      background: "#fff",
    },
    rowLabel: { fontSize: 13, fontWeight: 700, color: "#374151" },
    rowInput: {
      width: 140,
      padding: "8px 10px",
      borderRadius: 8,
      border: "1px solid #d1d5db",
      outline: "none",
      fontSize: 13,
      textAlign: "right",
      fontWeight: 600
    },

    calcRow: { display: "flex", justifyContent: "flex-end", marginTop: 8 },

    resultGrid: {
      marginTop: 20,
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 12,
    },
    resultCard: {
      padding: 16,
      borderRadius: 14,
      border: "1px solid #e5e7eb",
      background: "#f9fafb",
    },
    resultCardHighlight: {
      padding: 16,
      borderRadius: 14,
      border: "1px solid #86efac",
      background: "#f0fdf4",
      gridColumn: "span 2"
    },
    resultLabel: { fontSize: 12, color: "#6b7280", fontWeight: 800, textTransform: "uppercase" },
    resultValue: { marginTop: 8, fontSize: 18, fontWeight: 900, color: "#111827" },
    resultValueHighlight: { marginTop: 8, fontSize: 22, fontWeight: 900, color: "#166534" },

    primaryBtn: {
      padding: "10px 20px",
      borderRadius: 12,
      border: "none",
      background: "linear-gradient(135deg, #4a7c4e 0%, #5a8c5e 100%)",
      color: "#fff",
      cursor: "pointer",
      fontWeight: 700,
      fontSize: 14,
      boxShadow: "0 4px 12px rgba(74, 124, 78, 0.2)"
    },
    secondaryBtn: {
      padding: "10px 20px",
      borderRadius: 12,
      border: "1px solid #d1d5db",
      background: "#fff",
      cursor: "pointer",
      fontWeight: 700,
      fontSize: 14,
      color: "#374151",
    },

    footerNote: { marginTop: 12, color: "#9ca3af", fontSize: 12 },
  }), []);

  return (
    <AppLayout>
      <div style={styles.page}>
        {/* Animation Styles Inline */}
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

        <div style={styles.container}>
          <div style={styles.headerRow}>
            <div>
              <h2 style={styles.title}>Final Settlement Calculator</h2>
              <p style={styles.sub}>
                Select an employee, enter settlement components, calculate final amount.
              </p>
            </div>
            <div style={styles.headerActions}>
              <button style={styles.secondaryBtn} onClick={resetAll}>
                Reset
              </button>
              <button style={styles.primaryBtn} onClick={saveMock} disabled={!selected}>
                Save Settlement
              </button>
            </div>
          </div>

          <div style={styles.grid}>
            {/* LEFT: Employee picker */}
            <div style={styles.card}>
              <div style={styles.cardTop}>
                <h3 style={styles.cardTitle}>Select Employee</h3>
                <span style={styles.badge}>{filteredEmployees.length} results</span>
              </div>

              <div style={styles.searchWrap}>
                <input
                  style={styles.input}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by ID / Name / NIC"
                />
              </div>

              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>ID</th>
                      <th style={styles.th}>Name</th>
                      <th style={styles.th}>Type</th>
                      <th style={styles.thRight}>Salary</th>
                      <th style={styles.thCenter}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.map((e) => {
                      const active = e.employeeID === selected;
                      return (
                        <tr key={e.employeeID} style={active ? styles.trActive : styles.tr}>
                          <td style={styles.tdMono}>{e.employeeID}</td>
                          <td style={styles.td}>{e.name}</td>
                          <td style={styles.td}>{e.salaryType}</td>
                          <td style={styles.tdRight}>
                            {Number(e.basicSalary).toLocaleString("en-LK")}
                          </td>
                          <td style={styles.tdCenter}>
                            <button
                              style={active ? styles.smallBtnActive : styles.smallBtn}
                              onClick={() => handlePickEmployee(e)}
                            >
                              {active ? "Selected" : "Select"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredEmployees.length === 0 && (
                      <tr>
                        <td style={styles.emptyTd} colSpan={5}>
                          No employees found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {selectedEmployee && (
                <div style={styles.selectedBox}>
                  <div style={styles.selectedRow}>
                    <div>
                      <div style={styles.selectedName}>{selectedEmployee.name}</div>
                      <div style={styles.selectedMeta}>
                        {selectedEmployee.employeeID} • {selectedEmployee.department} •{" "}
                        {selectedEmployee.jobRole}
                      </div>
                    </div>
                    <span style={styles.pill}>{selectedEmployee.salaryType}</span>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT: Calculator form */}
            <div style={styles.card}>
              <div style={styles.cardTop}>
                <h3 style={styles.cardTitle}>Settlement Details</h3>
                <span style={styles.hint}>
                  {selected ? "Employee selected" : "Select an employee first"}
                </span>
              </div>

              <div style={styles.formGrid}>
                <div style={styles.formCol}>
                  <div>
                    <div style={styles.label}>Employee ID</div>
                    <input style={styles.input} value={form.employeeID} readOnly />
                  </div>

                  <div>
                    <div style={styles.label}>Last Working Date</div>
                    <input
                      style={styles.input}
                      type="date"
                      value={form.lastWorkingDate}
                      onChange={(e) => setForm((p) => ({ ...p, lastWorkingDate: e.target.value }))}
                      disabled={!selected}
                    />
                  </div>

                  <div>
                    <div style={styles.label}>Reason</div>
                    <select
                      style={styles.input}
                      value={form.reason}
                      onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))}
                      disabled={!selected}
                    >
                      <option>Resigned</option>
                      <option>Terminated</option>
                      <option>Contract End</option>
                      <option>Retired</option>
                    </select>
                  </div>

                  <div>
                    <div style={styles.label}>Notes</div>
                    <textarea
                      style={{ ...styles.input, minHeight: 88, resize: "vertical" }}
                      value={form.notes}
                      onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                      placeholder="Optional notes..."
                      disabled={!selected}
                    />
                  </div>
                </div>

                <div style={styles.formCol}>
                  <div style={styles.sectionTitle}>Earnings</div>

                  <RowField
                    label="Unpaid Salary"
                    value={form.unpaidSalary}
                    onChange={(v) => setNum("unpaidSalary", v)}
                    disabled={!selected}
                    styles={styles}
                  />
                  <RowField
                    label="Unpaid OT"
                    value={form.unpaidOT}
                    onChange={(v) => setNum("unpaidOT", v)}
                    disabled={!selected}
                    styles={styles}
                  />
                  <RowField
                    label="Incentives"
                    value={form.incentives}
                    onChange={(v) => setNum("incentives", v)}
                    disabled={!selected}
                    styles={styles}
                  />
                  <RowField
                    label="Allowances"
                    value={form.allowances}
                    onChange={(v) => setNum("allowances", v)}
                    disabled={!selected}
                    styles={styles}
                  />
                  <RowField
                    label="Unused Leave Pay"
                    value={form.unusedLeavePay}
                    onChange={(v) => setNum("unusedLeavePay", v)}
                    disabled={!selected}
                    styles={styles}
                  />
                  <RowField
                    label="EPF/ETF Adjustment"
                    value={form.epfEtfAdjustment}
                    onChange={(v) => setNum("epfEtfAdjustment", v)}
                    disabled={!selected}
                    styles={styles}
                  />

                  <div style={styles.sectionTitle}>Deductions</div>
                  <RowField
                    label="Advances"
                    value={form.advances}
                    onChange={(v) => setNum("advances", v)}
                    disabled={!selected}
                    styles={styles}
                  />
                  <RowField
                    label="Other Deductions"
                    value={form.otherDeductions}
                    onChange={(v) => setNum("otherDeductions", v)}
                    disabled={!selected}
                    styles={styles}
                  />

                  <div style={styles.calcRow}>
                    <button style={styles.primaryBtn} onClick={calculate} disabled={!selected}>
                      Calculate
                    </button>
                  </div>

                  {/* Result cards */}
                  <div style={styles.resultGrid}>
                    <ResultCard label="Gross Earnings" value={result.gross} styles={styles} />
                    <ResultCard label="Total Deductions" value={result.deductions} styles={styles} />
                    <ResultCard
                      label="Final Settlement"
                      value={result.finalAmount}
                      highlight
                      styles={styles}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function RowField({ label, value, onChange, disabled, styles }) {
  return (
    <div style={styles.rowField}>
      <div style={styles.rowLabel}>{label}</div>
      <input
        style={styles.rowInput}
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        min="0"
      />
    </div>
  );
}

function ResultCard({ label, value, highlight, styles }) {
  return (
    <div style={highlight ? styles.resultCardHighlight : styles.resultCard}>
      <div style={styles.resultLabel}>{label}</div>
      <div style={highlight ? styles.resultValueHighlight : styles.resultValue}>
        LKR {Number(value || 0).toLocaleString("en-LK")}
      </div>
    </div>
  );
}
