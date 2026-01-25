// src/pages/manager/settlement/SettlementCalculator.jsx
import React, { useMemo, useState } from "react";
import AppLayout from "../../../components/layout/AppLayout";

const dummyEmployees = [
  {
    employeeID: "EMP001",
    name: "Kamal Perera",
    nic: "931234567V",
    department: "Production",
    jobRole: "Machine Operator",
    salaryType: "Monthly",
    basicSalary: 75000,
    status: "Active",
  },
  {
    employeeID: "EMP002",
    name: "Nimal Silva",
    nic: "901111111V",
    department: "Production",
    jobRole: "Day Worker",
    salaryType: "Daily",
    basicSalary: 3500,
    status: "Active",
  },
  {
    employeeID: "EMP003",
    name: "Saman Jayasuriya",
    nic: "882222222V",
    department: "Stores",
    jobRole: "Store Keeper",
    salaryType: "Monthly",
    basicSalary: 68000,
    status: "Active",
  },
];

const emptyForm = {
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
};

export default function SettlementCalculator() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const [form, setForm] = useState(emptyForm);
  const [result, setResult] = useState({ gross: 0, deductions: 0, finalAmount: 0 });

  const filteredEmployees = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return dummyEmployees;
    return dummyEmployees.filter(
      (e) =>
        e.employeeID.toLowerCase().includes(q) ||
        e.name.toLowerCase().includes(q) ||
        e.nic.toLowerCase().includes(q)
    );
  }, [search]);

  const selectedEmployee = useMemo(() => {
    if (!selected) return null;
    return dummyEmployees.find((e) => e.employeeID === selected) || null;
  }, [selected]);

  function handlePickEmployee(emp) {
    setSelected(emp.employeeID);
    setForm((prev) => ({
      ...prev,
      employeeID: emp.employeeID,
    }));
  }

  function setNum(name, value) {
    const v = value === "" ? "" : Number(value);
    setForm((p) => ({ ...p, [name]: v }));
  }

  function calculate() {
    const gross =
      Number(form.unpaidSalary || 0) +
      Number(form.unpaidOT || 0) +
      Number(form.incentives || 0) +
      Number(form.allowances || 0) +
      Number(form.unusedLeavePay || 0) +
      Number(form.epfEtfAdjustment || 0);

    const deductions = Number(form.advances || 0) + Number(form.otherDeductions || 0);
    const finalAmount = Math.max(0, gross - deductions);

    setResult({ gross, deductions, finalAmount });
  }

  function resetAll() {
    setSelected(null);
    setForm(emptyForm);
    setResult({ gross: 0, deductions: 0, finalAmount: 0 });
    setSearch("");
  }

  function saveMock() {
    // UI only: just a fake “save”
    alert("Settlement saved");
  }

  return (
    <AppLayout>
      <div style={styles.page}>
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
                <label style={styles.label}>Employee ID</label>
                <input style={styles.input} value={form.employeeID} readOnly />

                <label style={styles.label}>Last Working Date</label>
                <input
                  style={styles.input}
                  type="date"
                  value={form.lastWorkingDate}
                  onChange={(e) => setForm((p) => ({ ...p, lastWorkingDate: e.target.value }))}
                  disabled={!selected}
                />

                <label style={styles.label}>Reason</label>
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

                <label style={styles.label}>Notes</label>
                <textarea
                  style={{ ...styles.input, minHeight: 88, resize: "vertical" }}
                  value={form.notes}
                  onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                  placeholder="Optional notes..."
                  disabled={!selected}
                />
              </div>

              <div style={styles.formCol}>
                <div style={styles.sectionTitle}>Earnings</div>

                <RowField
                  label="Unpaid Salary"
                  value={form.unpaidSalary}
                  onChange={(v) => setNum("unpaidSalary", v)}
                  disabled={!selected}
                />
                <RowField
                  label="Unpaid OT"
                  value={form.unpaidOT}
                  onChange={(v) => setNum("unpaidOT", v)}
                  disabled={!selected}
                />
                <RowField
                  label="Incentives"
                  value={form.incentives}
                  onChange={(v) => setNum("incentives", v)}
                  disabled={!selected}
                />
                <RowField
                  label="Allowances"
                  value={form.allowances}
                  onChange={(v) => setNum("allowances", v)}
                  disabled={!selected}
                />
                <RowField
                  label="Unused Leave Pay"
                  value={form.unusedLeavePay}
                  onChange={(v) => setNum("unusedLeavePay", v)}
                  disabled={!selected}
                />
                <RowField
                  label="EPF/ETF Adjustment"
                  value={form.epfEtfAdjustment}
                  onChange={(v) => setNum("epfEtfAdjustment", v)}
                  disabled={!selected}
                />

                <div style={styles.sectionTitle}>Deductions</div>
                <RowField
                  label="Advances"
                  value={form.advances}
                  onChange={(v) => setNum("advances", v)}
                  disabled={!selected}
                />
                <RowField
                  label="Other Deductions"
                  value={form.otherDeductions}
                  onChange={(v) => setNum("otherDeductions", v)}
                  disabled={!selected}
                />

                <div style={styles.calcRow}>
                  <button style={styles.primaryBtn} onClick={calculate} disabled={!selected}>
                    Calculate
                  </button>
                </div>

                {/* Result cards */}
                <div style={styles.resultGrid}>
                  <ResultCard label="Gross Earnings" value={result.gross} />
                  <ResultCard label="Total Deductions" value={result.deductions} />
                  <ResultCard
                    label="Final Settlement"
                    value={result.finalAmount}
                    highlight
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Small note */}
        
      </div>
    </AppLayout>
  );
}

function RowField({ label, value, onChange, disabled }) {
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

function ResultCard({ label, value, highlight }) {
  return (
    <div style={highlight ? styles.resultCardHighlight : styles.resultCard}>
      <div style={styles.resultLabel}>{label}</div>
      <div style={highlight ? styles.resultValueHighlight : styles.resultValue}>
        LKR {Number(value || 0).toLocaleString("en-LK")}
      </div>
    </div>
  );
}

const styles = {
  page: { padding: 18 },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 14,
  },
  title: { margin: 0, fontSize: 22, fontWeight: 800 },
  sub: { margin: "6px 0 0", color: "#667085", fontSize: 13 },
  headerActions: { display: "flex", gap: 10 },

  grid: {
    display: "grid",
    gridTemplateColumns: "1.05fr 1.35fr",
    gap: 14,
  },

  card: {
    background: "#fff",
    borderRadius: 14,
    border: "1px solid #eaecf0",
    boxShadow: "0 1px 2px rgba(16,24,40,0.06)",
    overflow: "hidden",
  },
  cardTop: {
    padding: "14px 14px 10px",
    borderBottom: "1px solid #f2f4f7",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  cardTitle: { margin: 0, fontSize: 15, fontWeight: 800 },
  badge: {
    fontSize: 12,
    padding: "4px 10px",
    borderRadius: 999,
    background: "#f2f4f7",
    color: "#344054",
    fontWeight: 700,
  },
  hint: { fontSize: 12, color: "#667085" },

  searchWrap: { padding: 14, paddingBottom: 10 },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #d0d5dd",
    outline: "none",
    fontSize: 13,
  },

  tableWrap: { padding: "0 14px 14px", overflow: "auto" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: {
    textAlign: "left",
    padding: "10px 8px",
    borderBottom: "1px solid #eaecf0",
    color: "#475467",
    fontWeight: 800,
    whiteSpace: "nowrap",
  },
  thRight: { textAlign: "right", padding: "10px 8px", borderBottom: "1px solid #eaecf0", color: "#475467", fontWeight: 800 },
  thCenter: { textAlign: "center", padding: "10px 8px", borderBottom: "1px solid #eaecf0", color: "#475467", fontWeight: 800 },

  tr: { borderBottom: "1px solid #f2f4f7" },
  trActive: { borderBottom: "1px solid #f2f4f7", background: "#f8fafc" },

  td: { padding: "10px 8px", color: "#101828" },
  tdMono: { padding: "10px 8px", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 12 },
  tdRight: { padding: "10px 8px", textAlign: "right" },
  tdCenter: { padding: "10px 8px", textAlign: "center" },
  emptyTd: { padding: 14, textAlign: "center", color: "#667085" },

  smallBtn: {
    padding: "6px 10px",
    borderRadius: 10,
    border: "1px solid #d0d5dd",
    background: "#fff",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 700,
  },
  smallBtnActive: {
    padding: "6px 10px",
    borderRadius: 10,
    border: "1px solid #d0d5dd",
    background: "#101828",
    color: "#fff",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 700,
  },

  selectedBox: { padding: 14, borderTop: "1px solid #f2f4f7", background: "#fcfcfd" },
  selectedRow: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 },
  selectedName: { fontWeight: 900, color: "#101828" },
  selectedMeta: { marginTop: 2, fontSize: 12, color: "#667085" },
  pill: { fontSize: 12, padding: "4px 10px", borderRadius: 999, background: "#eef4ff", color: "#3538cd", fontWeight: 800 },

  formGrid: { display: "grid", gridTemplateColumns: "0.9fr 1.1fr", gap: 14, padding: 14 },
  formCol: { display: "flex", flexDirection: "column", gap: 10 },

  label: { fontSize: 12, color: "#475467", fontWeight: 800, marginTop: 6 },
  sectionTitle: { marginTop: 8, fontSize: 12, color: "#344054", fontWeight: 900 },

  rowField: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    padding: "10px 12px",
    border: "1px solid #eaecf0",
    borderRadius: 12,
    background: "#fff",
  },
  rowLabel: { fontSize: 13, fontWeight: 800, color: "#101828" },
  rowInput: {
    width: 160,
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid #d0d5dd",
    outline: "none",
    fontSize: 13,
    textAlign: "right",
  },

  calcRow: { display: "flex", justifyContent: "flex-end", marginTop: 6 },

  resultGrid: {
    marginTop: 10,
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 10,
  },
  resultCard: {
    padding: 12,
    borderRadius: 14,
    border: "1px solid #eaecf0",
    background: "#fcfcfd",
  },
  resultCardHighlight: {
    padding: 12,
    borderRadius: 14,
    border: "1px solid #d0d5dd",
    background: "#101828",
  },
  resultLabel: { fontSize: 12, color: "#667085", fontWeight: 800 },
  resultValue: { marginTop: 6, fontSize: 16, fontWeight: 900, color: "#101828" },
  resultValueHighlight: { marginTop: 6, fontSize: 16, fontWeight: 900, color: "#fff" },

  primaryBtn: {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid #101828",
    background: "#101828",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 900,
    fontSize: 13,
  },
  secondaryBtn: {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid #d0d5dd",
    background: "#fff",
    cursor: "pointer",
    fontWeight: 900,
    fontSize: 13,
    color: "#101828",
  },

  footerNote: { marginTop: 12, color: "#667085", fontSize: 12 },
};
