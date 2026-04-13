import React, { useState, useMemo, useEffect } from "react";
import AppLayout from "../../../components/layout/AppLayout";
import { getSettlementReadyEmployeesApi } from "../../../services/managerEmployeeService";
import { 
  User, 
  Calendar, 
  DollarSign, 
  PlusCircle, 
  MinusCircle, 
  FileOutput, 
  Info,
  TrendingDown,
  TrendingUp,
  Receipt
} from "lucide-react";

export default function SettlementCalculator() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null); // employeeID
  const [form, setForm] = useState({
    employeeID: "",
    resignationDate: "", // Schema: resignation_date
    lastWorkingDate: "", // Schema: last_working_date

    basicPayable: 0,      // Schema: basic_payable
    leaveEncashment: 0,   // Schema: leave_encashment
    gratuityAmount: 0,    // Schema: gratuity_amount
    otherDues: 0,         // Schema: other_dues

    totalDeductions: 0,   // Schema: total_deductions
  });

  const [result, setResult] = useState({ gross: 0, deductions: 0, finalAmount: 0 }); // finalAmount -> net_settlement_amount

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const data = await getSettlementReadyEmployeesApi();
      // Map backend fields to frontend component expectations
      const mapped = data.map(emp => ({
        employeeID: emp.employee_id,
        name: `${emp.first_name} ${emp.last_name}`,
        department: emp.department_name || "N/A",
        jobRole: "Employee", // Default if not in return
        salaryType: emp.salary_type,
        basicSalary: emp.basic_rate
      }));
      setEmployees(mapped);
    } catch (err) {
      console.error("Failed to fetch settlement employees:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = useMemo(() => {
    const s = search.toLowerCase();
    if (!s) return employees;
    return employees.filter(
      (e) =>
        String(e.employeeID).toLowerCase().includes(s) ||
        e.name.toLowerCase().includes(s) ||
        String(e.department).toLowerCase().includes(s)
    );
  }, [search, employees]);

  const selectedEmployee = useMemo(
    () => employees.find((e) => e.employeeID === selected),
    [selected, employees]
  );

  const handlePickEmployee = (e) => {
    setSelected(e.employeeID);
    setForm((prev) => ({
      ...prev,
      employeeID: e.employeeID,
      resignationDate: "",
      lastWorkingDate: new Date().toISOString().split("T")[0],
      basicPayable: 0,
      leaveEncashment: 0,
      gratuityAmount: 0,
      otherDues: 0,
      totalDeductions: 0,
    }));
    setResult({ gross: 0, deductions: 0, finalAmount: 0 });
  };

  const setNum = (field, val) => {
    const v = parseFloat(val) || 0;
    setForm((p) => ({ ...p, [field]: v }));
  };

  const calculate = () => {

    const val = (v) => parseFloat(v) || 0;
    const earnings = val(form.basicPayable) + val(form.leaveEncashment) + val(form.gratuityAmount) + val(form.otherDues);
    const ded = val(form.totalDeductions);
    const final = earnings - ded;
    setResult({ gross: earnings, deductions: ded, finalAmount: final });
  };

  useEffect(() => {
    if (selected) calculate();
  }, [form, selected]);

  const resetAll = () => {
    setSelected(null);
    setSearch("");
    setForm({
      employeeID: "",
      resignationDate: "",
      lastWorkingDate: "",
      basicPayable: 0,
      leaveEncashment: 0,
      gratuityAmount: 0,
      otherDues: 0,
      totalDeductions: 0,
    });
    setResult({ gross: 0, deductions: 0, finalAmount: 0 });
  };

  const saveMock = () => {
    alert("Settlement saved (UI Mock)!");
  };

  // --- Styles ---
  const styles = useMemo(() => ({
    page: { position: "relative", minHeight: "100%", overflow: "hidden" },
    container: { padding: "10px 32px 32px", position: "relative", zIndex: 1 },
    headerRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 12,
      marginBottom: 16,
      maxWidth: 1200,
      margin: "0 auto 16px auto"
    },
    title: { margin: 0, fontSize: 28, fontWeight: 900, color: "#2c5530" },
    sub: { margin: "6px 0 0", color: "#4b5563", fontSize: 15 },
    headerActions: { display: "flex", gap: 12 },

    grid: {
      display: "grid",
      gridTemplateColumns: "1fr 1.5fr",
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
    trActive: { background: "rgba(240, 253, 244, 0.5)" },

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
    formCol: { display: "flex", flexDirection: "column", gap: 10 },

    label: { fontSize: 12, color: "#6b7280", fontWeight: 700, textTransform: "uppercase", marginBottom: 6 },
    sectionTitle: { marginTop: 4, fontSize: 14, color: "#374151", fontWeight: 800, borderBottom: "1px solid #e5e7eb", paddingBottom: 6, marginBottom: 8 },

    rowField: {
      display: "grid",
      gridTemplateColumns: "1fr 140px",
      alignItems: "center",
      gap: 12,
      padding: "10px 14px",
      border: "1px solid #e5e7eb",
      borderRadius: 12,
      background: "#fff",
      marginBottom: 0,
    },
    rowLabel: { fontSize: 13, fontWeight: 700, color: "#374151", lineHeight: 1.3 },
    rowInput: {
      width: "100%",
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
      marginTop: 12,
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

    // Enhanced Settlement Styles
    sectionHeader: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      marginBottom: 16,
      paddingBottom: 8,
      borderBottom: "2px solid #f3f4f6"
    },
    sectionIcon: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: 32,
      height: 32,
      borderRadius: 8,
    },
    sectionTitleText: {
      margin: 0,
      fontSize: 15,
      fontWeight: 800,
      color: "#1f2937",
      letterSpacing: "0.02em"
    },
    formGroup: {
      display: "flex",
      flexDirection: "column",
      gap: 16,
      marginBottom: 24
    },
    inputWrapper: {
      position: "relative",
      display: "flex",
      flexDirection: "column",
      gap: 6
    },
    inputLabel: {
      fontSize: 12,
      fontWeight: 700,
      color: "#6b7280",
      marginLeft: 4,
      display: "flex",
      alignItems: "center",
      gap: 4
    },
    inputFieldContainer: {
      display: "flex",
      alignItems: "center",
      background: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: 12,
      padding: "2px 12px",
      transition: "all 0.2s",
      boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
    },
    inputIcon: {
      color: "#9ca3af",
      marginRight: 8
    },
    styledInput: {
      flex: 1,
      border: "none",
      padding: "10px 0",
      fontSize: 14,
      fontWeight: 600,
      color: "#111827",
      outline: "none",
      background: "transparent"
    },
    inputPrefix: {
      fontSize: 13,
      fontWeight: 700,
      color: "#9ca3af",
      marginRight: 4
    },
    summaryCard: {
      background: "linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)",
      borderRadius: 16,
      padding: 20,
      marginTop: 8,
      border: "1px solid #e5e7eb"
    },
    summaryRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
      paddingBottom: 12,
      borderBottom: "1px dashed #d1d5db"
    },
    summaryLabel: {
      fontSize: 13,
      fontWeight: 600,
      color: "#4b5563",
      display: "flex",
      alignItems: "center",
      gap: 8
    },
    summaryValue: {
      fontSize: 15,
      fontWeight: 700,
      color: "#111827"
    },
    finalSettlementAmount: {
      background: "linear-gradient(135deg, #166534 0%, #15803d 100%)",
      borderRadius: 14,
      padding: "20px",
      color: "#fff",
      boxShadow: "0 10px 20px rgba(22, 101, 52, 0.15)",
      marginTop: 8
    },
    finalLabel: {
      fontSize: 12,
      fontWeight: 800,
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      opacity: 0.9,
      marginBottom: 8,
      display: "flex",
      alignItems: "center",
      gap: 8
    },
    finalValue: {
      fontSize: 28,
      fontWeight: 900,
      margin: 0,
      textShadow: "0 2px 4px rgba(0,0,0,0.1)"
    }
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
                  {!selected && "Select an employee to start calculation"}
                </span>
              </div>

              <div style={{ padding: 24, overflowY: "auto" }}>
                {!selected ? (
                  <div style={{ textAlign: "center", padding: "60px 20px", color: "#9ca3af" }}>
                    <Info size={48} strokeWidth={1.5} style={{ marginBottom: 16, opacity: 0.5 }} />
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 500 }}>
                      No active selection.
                    </p>
                    <p style={{ margin: "4px 0 0", fontSize: 13 }}>
                      Please choose an employee from the list to calculate their final settlement.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* SECTION: BASIC INFO */}
                    <div style={styles.sectionHeader}>
                      <div style={{ ...styles.sectionIcon, background: "#ecfdf5", color: "#059669" }}>
                        <User size={18} />
                      </div>
                      <h4 style={styles.sectionTitleText}>Basic Information</h4>
                    </div>

                    <div style={styles.formGroup}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                        <InputField
                          label="Employee ID"
                          value={form.employeeID}
                          icon={<Receipt size={16} />}
                          readOnly
                          styles={styles}
                        />
                        <InputField
                          label="Resignation Date"
                          value={form.resignationDate}
                          onChange={(v) => setForm((p) => ({ ...p, resignationDate: v }))}
                          icon={<Calendar size={16} />}
                          type="date"
                          styles={styles}
                        />
                        <InputField
                          label="Last Working Date"
                          value={form.lastWorkingDate}
                          onChange={(v) => setForm((p) => ({ ...p, lastWorkingDate: v }))}
                          icon={<Calendar size={16} />}
                          type="date"
                          styles={styles}
                        />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
                      {/* SECTION: EARNINGS */}
                      <div>
                        <div style={styles.sectionHeader}>
                          <div style={{ ...styles.sectionIcon, background: "#eff6ff", color: "#2563eb" }}>
                            <TrendingUp size={18} />
                          </div>
                          <h4 style={styles.sectionTitleText}>Earnings & Payments</h4>
                        </div>
                        <div style={styles.formGroup}>
                          <InputField
                            label="Basic Payable (Partial Month)"
                            value={form.basicPayable}
                            onChange={(v) => setNum("basicPayable", v)}
                            prefix="LKR"
                            styles={styles}
                          />
                          <InputField
                            label="Leave Encashment"
                            value={form.leaveEncashment}
                            onChange={(v) => setNum("leaveEncashment", v)}
                            prefix="LKR"
                            styles={styles}
                          />
                          <InputField
                            label="Gratuity Amount"
                            value={form.gratuityAmount}
                            onChange={(v) => setNum("gratuityAmount", v)}
                            prefix="LKR"
                            styles={styles}
                          />
                          <InputField
                            label="Other Dues"
                            value={form.otherDues}
                            onChange={(v) => setNum("otherDues", v)}
                            prefix="LKR"
                            styles={styles}
                          />
                        </div>
                      </div>

                      {/* SECTION: DEDUCTIONS */}
                      <div>
                        <div style={styles.sectionHeader}>
                          <div style={{ ...styles.sectionIcon, background: "#fef2f2", color: "#dc2626" }}>
                            <TrendingDown size={18} />
                          </div>
                          <h4 style={styles.sectionTitleText}>Deductions & Adjustments</h4>
                        </div>
                        <div style={styles.formGroup}>
                          <InputField
                            label="Total Deductions (Loans/Fines)"
                            value={form.totalDeductions}
                            onChange={(v) => setNum("totalDeductions", v)}
                            prefix="LKR"
                            styles={styles}
                          />
                        </div>

                        {/* Summary Block */}
                        <div style={styles.summaryCard}>
                          <div style={styles.summaryRow}>
                            <span style={styles.summaryLabel}>
                              <PlusCircle size={14} color="#2563eb" /> Gross Earnings
                            </span>
                            <span style={styles.summaryValue}>
                              {Number(result.gross).toLocaleString("en-LK")}
                            </span>
                          </div>
                          <div style={{ ...styles.summaryRow, borderBottom: "none", marginBottom: 0 }}>
                            <span style={styles.summaryLabel}>
                              <MinusCircle size={14} color="#dc2626" /> Total Deductions
                            </span>
                            <span style={styles.summaryValue}>
                              {Number(result.deductions).toLocaleString("en-LK")}
                            </span>
                          </div>
                        </div>

                        {/* Final Settlement Result */}
                        <div style={styles.finalSettlementAmount}>
                          <div style={styles.finalLabel}>
                            <DollarSign size={16} /> Final Settlement Amount
                          </div>
                          <h2 style={styles.finalValue}>
                            LKR {Number(result.finalAmount).toLocaleString("en-LK")}
                          </h2>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

// --- Helper Components ---

function InputField({ label, value, onChange, disabled, type = "number", readOnly, styles, icon, prefix }) {
  return (
    <div style={styles.inputWrapper}>
      <label style={styles.inputLabel}>{label}</label>
      <div style={styles.inputFieldContainer}>
        {icon && <span style={styles.inputIcon}>{icon}</span>}
        {prefix && <span style={styles.inputPrefix}>{prefix}</span>}
        <input
          style={styles.styledInput}
          type={type}
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
          onFocus={(e) => e.target.select()}
          disabled={disabled}
          readOnly={readOnly}
          min="0"
          placeholder={type === "number" ? "0.00" : ""}
        />
      </div>
    </div>
  );
}

// Keeping legacy components for reference or external use if needed, 
// though we've replaced their usage in this page's main render.
function RowField({ label, value, onChange, disabled, type = "number", readOnly, styles }) {
  return (
    <div style={styles.rowField}>
      <div style={styles.rowLabel}>{label}</div>
      <input
        style={styles.rowInput}
        type={type}
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        onFocus={(e) => e.target.select()}
        disabled={disabled}
        readOnly={readOnly}
        min="0"
        placeholder={type === "number" ? "0.00" : ""}
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
