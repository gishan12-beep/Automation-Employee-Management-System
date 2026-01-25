import React, { useMemo, useState } from "react";
import AppLayout from "../../../components/layout/AppLayout";
import PayrollPreview from "./PayrollPreview";
import SalarySlipGenerator from "./SalarySlipGenerator";

const LKR = (n) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(Number(n || 0));

const salaryTypes = ["Daily", "Weekly", "Monthly"];

// -------------------- Helpers for Period --------------------
function pad2(x) {
  return String(x).padStart(2, "0");
}

function formatDate(d) {
  if (!(d instanceof Date) || isNaN(d)) return "";
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function prettyDate(d) {
  if (!(d instanceof Date) || isNaN(d)) return "";
  return d.toLocaleDateString("en-LK", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

/**
 * Convert ISO week string "YYYY-Www" -> { start: Date(Mon), end: Date(Sun) }
 */
function isoWeekToRange(weekStr) {
  if (!weekStr || !weekStr.includes("-W")) return { start: null, end: null };
  const [yStr, wStr] = weekStr.split("-W");
  const year = Number(yStr);
  const week = Number(wStr);
  if (!year || !week) return { start: null, end: null };

  // ISO week: week 1 has Jan 4th
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const day = jan4.getUTCDay() || 7; // 1..7 (Mon..Sun)
  const mondayWeek1 = new Date(jan4);
  mondayWeek1.setUTCDate(jan4.getUTCDate() - (day - 1));

  const start = new Date(mondayWeek1);
  start.setUTCDate(mondayWeek1.getUTCDate() + (week - 1) * 7);

  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);

  const startLocal = new Date(
    start.getUTCFullYear(),
    start.getUTCMonth(),
    start.getUTCDate()
  );
  const endLocal = new Date(
    end.getUTCFullYear(),
    end.getUTCMonth(),
    end.getUTCDate()
  );

  return { start: startLocal, end: endLocal };
}

function monthToRange(monthStr) {
  if (!monthStr || monthStr.length < 7) return { start: null, end: null };
  const [y, m] = monthStr.split("-").map(Number);
  if (!y || !m) return { start: null, end: null };
  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 0);
  return { start, end };
}

function dayToRange(dayStr) {
  if (!dayStr) return { start: null, end: null };
  const [y, m, d] = dayStr.split("-").map(Number);
  if (!y || !m || !d) return { start: null, end: null };
  const start = new Date(y, m - 1, d);
  const end = new Date(y, m - 1, d);
  return { start, end };
}

// -------------------- Mock employees --------------------
const mockEmployees = [
  {
    employeeID: "EMP001",
    name: "Kavindu Perera",
    department: "Production",
    salaryType: "Monthly",
    basicSalary: 65000,
    epfEtfEligible: true,
    status: "Active",
  },
  {
    employeeID: "EMP002",
    name: "Sachini Silva",
    department: "Packing",
    salaryType: "Daily",
    basicSalary: 2500,
    epfEtfEligible: false,
    status: "Active",
  },
  {
    employeeID: "EMP003",
    name: "Nimal Fernando",
    department: "Production",
    salaryType: "Weekly",
    basicSalary: 18000,
    epfEtfEligible: false,
    status: "Active",
  },
];

// Mock payroll inputs
const mockPayrollInputs = {
  EMP001: {
    attendance: {
      presentDays: 23,
      halfDays: 1,
      absentDays: 2,
      totalHours: 184,
      logs: [
        { date: "2026-01-02", in: "08:01", out: "17:05", status: "Present" },
      ],
    },
    workDetails: [],
    overtime: [{ date: "2026-01-08", hours: 2, rate: 450, amount: 900 }],
    incentives: [{ date: "2026-01-10", desc: "Attendance bonus", amount: 3000 }],
    allowances: [{ date: "2026-01-21", desc: "Fuel allowance", amount: 2000 }],
    deductions: [{ date: "2026-01-25", desc: "Advance", amount: 0 }],
    paidOn: null,
  },

  EMP002: {
    attendance: {
      presentDays: 1,
      halfDays: 0,
      absentDays: 0,
      totalHours: 8,
      logs: [{ date: "2026-01-21", in: "08:10", out: "17:00", status: "Present" }],
    },
    workDetails: [{ date: "2026-01-21", task: "Packing", qty: 80, hours: 8, amount: 2500 }],
    overtime: [{ date: "2026-01-21", hours: 1, rate: 300, amount: 300 }], // ignored
    incentives: [{ date: "2026-01-21", desc: "Performance incentive", amount: 200 }],
    allowances: [{ date: "2026-01-21", desc: "Transport allowance", amount: 150 }],
    deductions: [{ date: "2026-01-21", desc: "Advance", amount: 100 }],
    paidOn: null,
  },

  EMP003: {
    attendance: {
      presentDays: 6,
      halfDays: 0,
      absentDays: 1,
      totalHours: 48,
      logs: [{ date: "2026-01-20", in: "08:00", out: "17:00", status: "Present" }],
    },
    workDetails: [
      { date: "2026-01-20", task: "Crushing support", qty: 70, hours: 6, amount: 3500 },
      { date: "2026-01-21", task: "Oil filtering", qty: 95, hours: 8, amount: 5200 },
    ],
    overtime: [{ date: "2026-01-23", hours: 2, rate: 400, amount: 800 }],
    incentives: [{ date: "2026-01-22", desc: "Meal incentive", amount: 500 }],
    allowances: [{ date: "2026-01-21", desc: "Phone allowance", amount: 200 }],
    deductions: [{ date: "2026-01-23", desc: "Loan deduction", amount: 500 }],
    paidOn: null,
  },
};

// Config
const EPF_EMPLOYEE_RATE = 0.08;
const EPF_EMPLOYER_RATE = 0.12;
const ETF_EMPLOYER_RATE = 0.03;

export default function ProcessPayroll() {
  const [department, setDepartment] = useState("All");
  const [salaryType, setSalaryType] = useState("All");
  const [query, setQuery] = useState("");

  // Period inputs
  const [monthPeriod, setMonthPeriod] = useState("2026-01");
  const [weekPeriod, setWeekPeriod] = useState("2026-W04");
  const [dayPeriod, setDayPeriod] = useState("2026-01-21");

  const [generated, setGenerated] = useState({});
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [slipEmployee, setSlipEmployee] = useState(null);

  const departments = useMemo(() => {
    const uniq = Array.from(new Set(mockEmployees.map((e) => e.department)));
    return ["All", ...uniq];
  }, []);

  const filtered = useMemo(() => {
    return mockEmployees
      .filter((e) => e.status === "Active")
      .filter((e) => (department === "All" ? true : e.department === department))
      .filter((e) => (salaryType === "All" ? true : e.salaryType === salaryType))
      .filter((e) =>
        query.trim()
          ? (e.name + " " + e.employeeID).toLowerCase().includes(query.toLowerCase())
          : true
      );
  }, [department, salaryType, query]);

  const periodMode = useMemo(() => {
    if (salaryType === "Daily") return "Daily";
    if (salaryType === "Weekly") return "Weekly";
    if (salaryType === "Monthly") return "Monthly";
    return "Monthly";
  }, [salaryType]);

  function getPeriodForEmployee(emp) {
    if (emp.salaryType === "Daily") return { mode: "Daily", value: dayPeriod };
    if (emp.salaryType === "Weekly") return { mode: "Weekly", value: weekPeriod };
    return { mode: "Monthly", value: monthPeriod };
  }

  function getRangeFor(mode, value) {
    if (mode === "Daily") return dayToRange(value);
    if (mode === "Weekly") return isoWeekToRange(value);
    return monthToRange(value);
  }

  function getPeriodLabel(mode, value) {
    const { start, end } = getRangeFor(mode, value);
    if (!start || !end) return value;
    if (mode === "Daily") return `${prettyDate(start)}`;
    return `${prettyDate(start)} — ${prettyDate(end)}`;
  }

  const computePayroll = (emp) => {
    const input = mockPayrollInputs[emp.employeeID] || {};
    const att = input.attendance || {};

    const isMonthly = emp.salaryType === "Monthly";
    const isDaily = emp.salaryType === "Daily";
    const isWeekly = emp.salaryType === "Weekly";

    const taskEarnings = (input.workDetails || []).reduce(
      (s, x) => s + Number(x.amount || 0),
      0
    );

    // ✅ OT removed for Daily
    const overtimeTotal = isDaily
      ? 0
      : (input.overtime || []).reduce((s, x) => s + Number(x.amount || 0), 0);

    const incentiveTotal = (input.incentives || []).reduce(
      (s, x) => s + Number(x.amount || 0),
      0
    );
    const allowanceTotal = (input.allowances || []).reduce(
      (s, x) => s + Number(x.amount || 0),
      0
    );
    const otherDeductions = (input.deductions || []).reduce(
      (s, x) => s + Number(x.amount || 0),
      0
    );

    let basePay = 0;
    if (isMonthly) basePay = Number(emp.basicSalary || 0);
    if (isDaily || isWeekly) basePay = taskEarnings;

    const gross = basePay + overtimeTotal + incentiveTotal + allowanceTotal;

    const epfEmployee = isMonthly && emp.epfEtfEligible ? gross * EPF_EMPLOYEE_RATE : 0;
    const totalDeductions = epfEmployee + otherDeductions;
    const net = gross - totalDeductions;

    const p = getPeriodForEmployee(emp);
    const range = getRangeFor(p.mode, p.value);

    return {
      isMonthly,
      isWeekly,
      isDaily,
      basePay,
      taskEarnings,
      overtimeTotal,
      incentiveTotal,
      allowanceTotal,
      gross,
      epfEmployee,
      employerEPF: isMonthly && emp.epfEtfEligible ? gross * EPF_EMPLOYER_RATE : 0,
      employerETF: isMonthly && emp.epfEtfEligible ? gross * ETF_EMPLOYER_RATE : 0,
      otherDeductions,
      totalDeductions,
      net,
      paidOn: input.paidOn || null,
      attendance: {
        presentDays: att.presentDays ?? 0,
        halfDays: att.halfDays ?? 0,
        absentDays: att.absentDays ?? 0,
        totalHours: att.totalHours ?? 0,
      },
      period: {
        mode: p.mode,
        value: p.value,
        label: getPeriodLabel(p.mode, p.value),
        start: range.start ? formatDate(range.start) : "",
        end: range.end ? formatDate(range.end) : "",
      },
    };
  };

  const totals = useMemo(() => {
    let gross = 0,
      net = 0,
      epf = 0;
    filtered.forEach((e) => {
      const p = computePayroll(e);
      gross += p.gross;
      net += p.net;
      epf += p.epfEmployee;
    });
    return { gross, net, epf };
  }, [filtered]); // eslint-disable-line

  const openPreview = (emp) => setSelectedEmployee(emp);
  const closePreview = () => setSelectedEmployee(null);

  const openSlip = (emp) => setSlipEmployee(emp);
  const closeSlip = () => setSlipEmployee(null);

  const generatePayroll = (emp) => {
    setGenerated((prev) => ({ ...prev, [emp.employeeID]: true }));
  };

  const markPaid = (emp) => {
    alert(`(Mock) Marked paid for ${emp.employeeID}`);
  };

  const generateAll = () => {
    const next = {};
    filtered.forEach((e) => (next[e.employeeID] = true));
    setGenerated((prev) => ({ ...prev, ...next }));
  };

  const renderPeriodPicker = () => {
    if (periodMode === "Daily") {
      const { start } = dayToRange(dayPeriod);
      return (
        <Field label="Select Day">
          <input
            type="date"
            value={dayPeriod}
            onChange={(e) => setDayPeriod(e.target.value)}
            style={styles.input}
          />
          <div style={styles.miniHint}>Selected: {start ? prettyDate(start) : "-"}</div>
        </Field>
      );
    }

    if (periodMode === "Weekly") {
      const { start, end } = isoWeekToRange(weekPeriod);
      return (
        <Field label="Select Week">
          <input
            type="week"
            value={weekPeriod}
            onChange={(e) => setWeekPeriod(e.target.value)}
            style={styles.input}
          />
          <div style={styles.miniHint}>
            Range: {start ? prettyDate(start) : "-"} — {end ? prettyDate(end) : "-"}
          </div>
        </Field>
      );
    }

    const { start, end } = monthToRange(monthPeriod);
    return (
      <Field label="Select Month">
        <input
          type="month"
          value={monthPeriod}
          onChange={(e) => setMonthPeriod(e.target.value)}
          style={styles.input}
        />
        <div style={styles.miniHint}>
          Range: {start ? prettyDate(start) : "-"} — {end ? prettyDate(end) : "-"}
        </div>
      </Field>
    );
  };

  return (
    <AppLayout>
      <div style={styles.page}>
        <div style={styles.headerRow}>
          <div>
            <h2 style={styles.title}>Payroll</h2>
            <p style={styles.subTitle}>
              Monthly: fixed salary + EPF + OT • Weekly: task-based + OT • Daily: task-based (NO OT)
            </p>
          </div>

          <div style={styles.summaryBar}>
            <Summary label="Total Gross" value={LKR(totals.gross)} />
            <Summary label="Total EPF (Monthly Only)" value={LKR(totals.epf)} />
            <Summary label="Total Net" value={LKR(totals.net)} />
          </div>
        </div>

        <div style={styles.filters}>
          {renderPeriodPicker()}

          <Field label="Department">
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              style={styles.input}
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Salary Type">
            <select
              value={salaryType}
              onChange={(e) => setSalaryType(e.target.value)}
              style={styles.input}
            >
              <option value="All">All</option>
              {salaryTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Search" grow>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name or employee ID..."
              style={styles.input}
            />
          </Field>

          <button style={styles.primaryBtn} onClick={generateAll}>
            Generate All
          </button>
        </div>

        {/* ✅ Simplified Table */}
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Employee</th>
                <th style={styles.th}>Dept</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Period</th>
                <th style={styles.th}>Allowances</th>
                <th style={styles.th}>Net</th>
                <th style={styles.th}>State</th>
                <th style={{ ...styles.th, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={styles.empty}>
                    No employees found.
                  </td>
                </tr>
              ) : (
                filtered.map((emp) => {
                  const p = computePayroll(emp);
                  const isGenerated = !!generated[emp.employeeID];
                  const paid = !!p.paidOn;

                  return (
                    <tr key={emp.employeeID} style={styles.tr}>
                      <td style={styles.td}>
                        <div style={styles.empCell}>
                          <div style={styles.empAvatar}>{emp.name?.[0] || "E"}</div>
                          <div>
                            <div style={styles.empName}>{emp.name}</div>
                            <div style={styles.empMeta}>{emp.employeeID}</div>
                          </div>
                        </div>
                      </td>

                      <td style={styles.td}>{emp.department}</td>

                      <td style={styles.td}>
                        <span style={styles.badge}>{emp.salaryType}</span>
                      </td>

                      <td style={styles.td}>
                        <div style={{ fontWeight: 800 }}>{p.period.label}</div>
                        <div style={styles.empMeta}>{p.period.mode}</div>
                      </td>

                      <td style={styles.td}>{LKR(p.allowanceTotal)}</td>

                      <td style={styles.tdStrong}>{LKR(p.net)}</td>

                      <td style={styles.td}>
                        {paid ? (
                          <span style={{ ...styles.pill, ...styles.pillPaid }}>Paid</span>
                        ) : isGenerated ? (
                          <span style={{ ...styles.pill, ...styles.pillReady }}>Generated</span>
                        ) : (
                          <span style={{ ...styles.pill, ...styles.pillPending }}>Pending</span>
                        )}
                        {p.paidOn && <div style={styles.empMeta}>Paid on {p.paidOn}</div>}
                      </td>

                      <td style={{ ...styles.td, textAlign: "right" }}>
                        <button style={styles.smallBtn} onClick={() => openPreview(emp)}>
                          Preview
                        </button>
                        <button
                          style={{ ...styles.smallBtn, ...(isGenerated ? styles.btnDisabled : {}) }}
                          disabled={isGenerated}
                          onClick={() => generatePayroll(emp)}
                        >
                          Generate
                        </button>
                        <button
                          style={{ ...styles.smallBtn, ...(isGenerated ? {} : styles.btnDisabled) }}
                          disabled={!isGenerated}
                          onClick={() => openSlip(emp)}
                        >
                          Slip
                        </button>
                        <button
                          style={{ ...styles.smallBtn, ...(paid ? styles.btnDisabled : {}) }}
                          disabled={paid}
                          onClick={() => markPaid(emp)}
                        >
                          Paid
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {selectedEmployee && (
          <PayrollPreview
            employee={selectedEmployee}
            input={mockPayrollInputs[selectedEmployee.employeeID]}
            payroll={computePayroll(selectedEmployee)}
            onClose={closePreview}
          />
        )}

        {slipEmployee && (
          <SalarySlipGenerator
            employee={slipEmployee}
            input={mockPayrollInputs[slipEmployee.employeeID]}
            payroll={computePayroll(slipEmployee)}
            onClose={closeSlip}
          />
        )}
      </div>
    </AppLayout>
  );
}

function Field({ label, children, grow }) {
  return (
    <div style={{ ...styles.field, ...(grow ? { flex: 1 } : {}) }}>
      <label style={styles.label}>{label}</label>
      {children}
    </div>
  );
}

function Summary({ label, value }) {
  return (
    <div style={styles.summaryItem}>
      <div style={styles.summaryLabel}>{label}</div>
      <div style={styles.summaryValue}>{value}</div>
    </div>
  );
}

const styles = {
  page: { padding: 16 },
  headerRow: {
    display: "flex",
    gap: 16,
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  title: { margin: 0, fontSize: 22, fontWeight: 800 },
  subTitle: { margin: "6px 0 0", opacity: 0.8 },

  summaryBar: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    background: "#111827",
    color: "white",
    borderRadius: 14,
    padding: 12,
    boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
  },
  summaryItem: { minWidth: 170, padding: "6px 10px" },
  summaryLabel: { fontSize: 12, opacity: 0.85 },
  summaryValue: { fontSize: 16, fontWeight: 800, marginTop: 2 },

  filters: {
    marginTop: 14,
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    alignItems: "end",
    background: "white",
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: 14,
    padding: 12,
  },
  field: { display: "flex", flexDirection: "column", gap: 6, minWidth: 180 },
  label: { fontSize: 12, fontWeight: 700, opacity: 0.85 },
  input: {
    height: 40,
    borderRadius: 10,
    border: "1px solid rgba(0,0,0,0.14)",
    padding: "0 12px",
    outline: "none",
  },
  miniHint: { fontSize: 12, opacity: 0.7, marginTop: 4 },

  primaryBtn: {
    height: 40,
    borderRadius: 10,
    border: "none",
    padding: "0 14px",
    fontWeight: 800,
    cursor: "pointer",
    background: "#18d49c",
  },

  tableWrap: {
    marginTop: 14,
    background: "white",
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: 14,
    overflow: "hidden",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    textAlign: "left",
    padding: 12,
    fontSize: 12,
    opacity: 0.8,
    background: "rgba(0,0,0,0.03)",
  },
  tr: { borderTop: "1px solid rgba(0,0,0,0.06)" },
  td: { padding: 12, verticalAlign: "middle" },
  tdStrong: { padding: 12, fontWeight: 900 },
  empty: { padding: 18, textAlign: "center", opacity: 0.7 },

  empCell: { display: "flex", alignItems: "center", gap: 10 },
  empAvatar: {
    width: 34,
    height: 34,
    borderRadius: 10,
    background: "rgba(251,191,36,0.25)",
    display: "grid",
    placeItems: "center",
    fontWeight: 900,
  },
  empName: { fontWeight: 900 },
  empMeta: { fontSize: 12, opacity: 0.7, marginTop: 2 },

  badge: {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: 999,
    border: "1px solid rgba(0,0,0,0.12)",
    fontSize: 12,
    fontWeight: 800,
    background: "rgba(0,0,0,0.02)",
  },

  pill: {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 900,
  },
  pillPaid: { background: "rgba(34,197,94,0.18)", color: "#166534" },
  pillReady: { background: "rgba(59,130,246,0.15)", color: "#1d4ed8" },
  pillPending: { background: "rgba(255, 217, 0, 0.18)", color: "#92400e" },

  smallBtn: {
    height: 34,
    borderRadius: 10,
    border: "1px solid rgba(0,0,0,0.14)",
    background: "white",
    padding: "0 10px",
    fontWeight: 800,
    cursor: "pointer",
    marginLeft: 6,
  },
  btnDisabled: { opacity: 0.5, cursor: "not-allowed" },
};
