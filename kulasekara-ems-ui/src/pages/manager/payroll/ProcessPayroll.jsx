import React, { useMemo, useState, useEffect, useRef } from "react";
import AppLayout from "../../../components/layout/AppLayout";
import { MoreVertical, ListFilter } from "lucide-react";
import PayrollPreview from "./PayrollPreview";
import SalarySlipGenerator from "./SalarySlipGenerator";
import { processPayrollApi, getPayrollSummaryApi, processSingleEmployeeApi } from "../../../services/payrollService";
import { getEmployeesApi } from "../../../services/managerEmployeeService";

const LKR = (n) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(Number(n || 0));

function pad2(x) {
  return String(x).padStart(2, "0");
}

export default function ProcessPayroll() {
  const [activeTab, setActiveTab] = useState("MONTHLY"); // "MONTHLY" | "OTHER"
  const [department, setDepartment] = useState("All");
  const [query, setQuery] = useState("");

  const today = new Date();
  const defaultMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  const [monthPeriod, setMonthPeriod] = useState(defaultMonth);

  const [employees, setEmployees] = useState([]);
  const [depts, setDepts] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [slipEmployee, setSlipEmployee] = useState(null);

  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "" });

  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);
  const filterRef = useRef(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilterMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = (id, e) => {
    e.stopPropagation();
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 5000);
  };

  const loadPayrollSummary = async () => {
    setLoading(true);
    try {
      if (!monthPeriod) return;
      const [y, m] = monthPeriod.split("-");

      const [allEmployees, summaryData] = await Promise.all([
        getEmployeesApi(),
        getPayrollSummaryApi(m, y)
      ]);

      const summaryMap = new Map();
      summaryData.forEach(e => summaryMap.set(String(e.employeeId), e));

      const mappedEmps = allEmployees
        .filter(emp => emp.status === "ACTIVE")
        .map(emp => {
          const generatedRun = summaryMap.get(String(emp.employee_id));
          if (generatedRun) {
            return {
              employeeID: generatedRun.employeeId,
              name: generatedRun.name,
              department: generatedRun.department || emp.department || "N/A",
              basicSalary: generatedRun.basic_earnings || 0,
              otPay: generatedRun.total_ot_pay || 0,
              incentives: generatedRun.total_incentives || 0,
              deductions: generatedRun.total_deductions || 0,
              gross: generatedRun.gross || 0,
              epfEmployee: generatedRun.epf_employee || 0,
              epfEmployer: generatedRun.epf_employer || 0,
              etfEmployer: generatedRun.etf_employer || 0,
              netPay: Math.max(0, generatedRun.net || 0),
              status: "GENERATED",
              isFinalized: true,
              salaryType: emp.salary_type || "MONTHLY"
            };
          }

          return {
            employeeID: emp.employee_id,
            name: `${emp.first_name || ""} ${emp.last_name || ""}`.trim(),
            department: emp.department || "N/A",
            basicSalary: "-",
            otPay: "-",
            incentives: "-",
            deductions: "-",
            gross: "-",
            epfEmployee: "-",
            epfEmployer: "-",
            etfEmployer: "-",
            netPay: "-",
            status: "PENDING",
            isFinalized: false,
            salaryType: emp.salary_type || "MONTHLY"
          };
        });

      setEmployees(mappedEmps);

      const uniqueDepts = [...new Set(mappedEmps.map(e => e.department))].sort();
      setDepts(uniqueDepts);
    } catch (err) {
      console.error("Failed to load payroll summary", err);
      showToast("Failed to load payroll summary.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayrollSummary();
  }, [monthPeriod]);

  const departments = useMemo(() => {
    return ["All", ...depts];
  }, [depts]);

  const filtered = useMemo(() => {
    return employees
      .filter((e) => {
        if (activeTab === "MONTHLY") return e.salaryType === "MONTHLY";
        return e.salaryType !== "MONTHLY";
      })
      .filter((e) => (department === "All" ? true : e.department === department))
      .filter((e) =>
        query.trim()
          ? (e.name + " " + e.employeeID).toLowerCase().includes(query.toLowerCase())
          : true
      );
  }, [employees, department, query, activeTab]);

  const totals = useMemo(() => {
    let gross = 0,
      net = 0,
      epf = 0;
    filtered.forEach((e) => {
      gross += Number(e.gross) || 0;
      net += Number(e.netPay) || 0;
      epf += Number(e.epfEmployee) || 0;
    });
    return { gross, net, epf };
  }, [filtered]);

  const openPreview = (emp) => setSelectedEmployee(emp);
  const closePreview = () => setSelectedEmployee(null);

  const openSlip = (emp) => setSlipEmployee(emp);
  const closeSlip = () => setSlipEmployee(null);

  const generateSingle = async (employeeId) => {
    if (!monthPeriod) {
      showToast("Please select a valid month.", "error");
      return;
    }

    setProcessing(true);
    const [y, m] = monthPeriod.split("-");
    try {
      await processSingleEmployeeApi(parseInt(m, 10), parseInt(y, 10), employeeId);
      showToast(`Payroll processed for ${employeeId} successfully!`);
      loadPayrollSummary(); // Refresh data
    } catch (e) {
      console.error(e);
      const msg = e.response?.data?.message || e.message || "Unknown error";
      showToast(`Failed to process payroll: ${msg}`, "error");
    } finally {
      setProcessing(false);
      setActiveDropdown(null);
    }
  };

  const generateAll = async () => {
    if (!monthPeriod) {
      showToast("Please select a valid month.", "error");
      return;
    }

    setProcessing(true);
    const [y, m] = monthPeriod.split("-");
    try {
      await processPayrollApi(parseInt(m, 10), parseInt(y, 10));
      showToast("Payroll processed successfully!");
      loadPayrollSummary(); // Refresh data
    } catch (e) {
      console.error(e);
      const msg = e.response?.data?.message || e.message || "Unknown error";
      showToast(`Failed to process payroll: ${msg}`, "error");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <AppLayout>
      {toast.message && (
        <div style={{
          ...styles.toast,
          backgroundColor: toast.type === "error" ? "#fee2e2" : "#dcfce7",
          color: toast.type === "error" ? "#991b1b" : "#166534"
        }}>
          {toast.message}
        </div>
      )}

      <div style={styles.headerRow}>
        <div>
          <h2 style={styles.title}>Payroll Management</h2>
          <p style={styles.subTitle}>
            Generate monthly payrolls and view summaries. (Accountant must use Adjust tool)
          </p>
        </div>

        <div style={styles.summaryBar}>
          <Summary label="Total Gross" value={LKR(totals.gross)} />
          <div style={styles.summaryDivider}></div>
          <Summary label="Total EPF (Employee)" value={LKR(totals.epf)} />
          <div style={styles.summaryDivider}></div>
          <Summary label="Total Net" value={LKR(totals.net)} />
        </div>
      </div>

      <div style={styles.filters}>
        <Field label="Search" grow>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or employee ID..."
            style={styles.input}
          />
        </Field>

        <div style={{ position: "relative" }} ref={filterRef}>
          <button
            style={{
              ...styles.secondaryBtn,
              background: showFilterMenu ? "#e5e7eb" : "white"
            }}
            onClick={() => setShowFilterMenu(!showFilterMenu)}
          >
            <ListFilter size={18} style={{ marginRight: 8 }} />
            Filters
          </button>

          {showFilterMenu && (
            <div style={styles.filterPopup}>
              <div style={styles.filterGroup}>
                <Field label="Select Month">
                  <input
                    type="month"
                    value={monthPeriod}
                    onChange={(e) => setMonthPeriod(e.target.value)}
                    style={styles.input}
                  />
                </Field>
              </div>

              <div style={styles.filterGroup}>
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
              </div>
            </div>
          )}
        </div>

        <button style={{ ...styles.primaryBtn, opacity: processing ? 0.7 : 1 }} onClick={generateAll} disabled={processing}>
          {processing ? "Processing..." : "Generate Entire Payroll"}
        </button>
      </div>

      <div style={styles.tabContainer}>
        <button
          style={{ ...styles.tabBtn, ...(activeTab === "MONTHLY" ? styles.activeTab : {}) }}
          onClick={() => setActiveTab("MONTHLY")}
        >
          Monthly Employees
        </button>
        <button
          style={{ ...styles.tabBtn, ...(activeTab === "OTHER" ? styles.activeTab : {}) }}
          onClick={() => setActiveTab("OTHER")}
        >
          Daily / Other Employees
        </button>
      </div>

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Employee</th>
              {activeTab === "MONTHLY" ? (
                <>
                  <th style={styles.th}>Basic (LKR)</th>
                  <th style={styles.th}>OT Pay (LKR)</th>
                  <th style={styles.th}>Incentives (LKR)</th>
                  <th style={styles.th}>Deductions (LKR)</th>
                  <th style={styles.th}>Gross (LKR)</th>
                  <th style={styles.th}>EPF (Emp)</th>
                </>
              ) : (
                <>
                  <th style={styles.th}>Task/Work Pay (LKR)</th>
                  <th style={styles.th}>Incentives (LKR)</th>
                  <th style={styles.th}>Deductions (LKR)</th>
                  <th style={styles.th}>Gross (LKR)</th>
                </>
              )}
              <th style={styles.th}>Net (LKR)</th>
              <th style={{ ...styles.th, textAlign: "right" }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={activeTab === "MONTHLY" ? 9 : 7} style={styles.empty}>
                  Loading...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={activeTab === "MONTHLY" ? 9 : 7} style={styles.empty}>
                  No active employees found in this category.
                </td>
              </tr>
            ) : (
              filtered.map((emp) => (
                <tr key={emp.employeeID} style={styles.tr}>
                  <td style={styles.td}>
                    <div style={styles.empCell}>
                      <div style={styles.empAvatar}>{emp.name?.[0] || "E"}</div>
                      <div>
                        <div style={styles.empName}>{emp.name}</div>
                        <div style={styles.empMeta}>{emp.employeeID} | {emp.department}</div>
                      </div>
                    </div>
                  </td>

                  {activeTab === "MONTHLY" ? (
                    <>
                      <td style={styles.td}>{emp.basicSalary}</td>
                      <td style={styles.td}>{emp.otPay}</td>
                      <td style={styles.td}>{emp.incentives}</td>
                      <td style={styles.td}>{emp.deductions}</td>
                      <td style={styles.td}>{emp.gross}</td>
                      <td style={styles.td}>{emp.epfEmployee}</td>
                    </>
                  ) : (
                    <>
                      <td style={styles.td}>{emp.basicSalary}</td>
                      <td style={styles.td}>{emp.incentives}</td>
                      <td style={styles.td}>{emp.deductions}</td>
                      <td style={styles.td}>{emp.gross}</td>
                    </>
                  )}

                  <td style={styles.tdStrong}>{emp.netPay}</td>

                  <td style={{ ...styles.td, textAlign: "right", position: "relative" }}>
                    <button
                      style={styles.ghostBtn}
                      onClick={(e) => toggleDropdown(emp.employeeID, e)}
                    >
                      <MoreVertical size={16} color="#374151" />
                    </button>

                    {activeDropdown === emp.employeeID && (
                      <div style={styles.dropdownMenu} ref={dropdownRef}>
                        {emp.isFinalized ? (
                          <>
                            <button
                              style={styles.dropdownItem}
                              onClick={(e) => {
                                e.stopPropagation();
                                openPreview(emp);
                                setActiveDropdown(null);
                              }}
                            >
                              Preview Summary
                            </button>
                            <button
                              style={styles.dropdownItem}
                              onClick={(e) => {
                                e.stopPropagation();
                                openSlip(emp);
                                setActiveDropdown(null);
                              }}
                            >
                              View Slip
                            </button>
                          </>
                        ) : (
                          <button
                            style={{ ...styles.dropdownItem, color: "#2c5530", fontWeight: 700 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              generateSingle(emp.employeeID);
                            }}
                          >
                            Generate
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedEmployee && (
        <PayrollPreview
          employee={selectedEmployee}
          input={{}}
          payroll={selectedEmployee}
          onClose={closePreview}
        />
      )}

      {slipEmployee && (
        <SalarySlipGenerator
          employee={slipEmployee}
          input={{}}
          payroll={slipEmployee} // Now the data will be coming right off the summary, pass it directly
          onClose={closeSlip}
        />
      )}
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
  toast: {
    padding: "16px",
    borderRadius: "12px",
    marginBottom: "20px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerRow: {
    display: "flex",
    gap: 16,
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 24,
  },
  title: {
    margin: 0,
    fontSize: 26,
    fontWeight: 700,
    color: "#2c5530",
    letterSpacing: "-0.5px",
  },
  subTitle: {
    margin: "6px 0 0",
    opacity: 0.8,
    color: "#4b5563",
    fontSize: 14,
  },

  summaryBar: {
    display: "flex",
    gap: 0,
    alignItems: "center",
    background: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderRadius: 16,
    padding: "10px 16px",
    boxShadow: "0 10px 30px rgba(74, 124, 78, 0.1), 0 0 0 1px rgba(74, 124, 78, 0.05)",
    border: "2px solid rgba(255, 255, 255, 0.5)",
  },
  summaryItem: {
    minWidth: 140,
    padding: "6px 16px",
    textAlign: "center",
  },
  summaryLabel: {
    fontSize: 11,
    color: "#4b5563",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    opacity: 0.8,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 800,
    marginTop: 2,
    color: "#2c5530",
  },
  summaryDivider: {
    width: 1,
    height: 30,
    background: "rgba(74, 124, 78, 0.15)",
  },

  filters: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    alignItems: "end",
    background: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.6)",
    boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    zIndex: 20,
    position: "relative",
  },
  field: { display: "flex", flexDirection: "column", gap: 8, minWidth: 180 },
  label: { fontSize: 12, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.3px" },
  input: {
    height: 42,
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    padding: "0 14px",
    fontSize: 15,
    outline: "none",
    fontWeight: 600,
    color: "#111827",
  },
  primaryBtn: {
    height: 42,
    padding: "0 20px",
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(135deg, #2c5530 0%, #3a703f 100%)",
    color: "white",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(44, 85, 48, 0.3)",
  },
  secondaryBtn: {
    height: 42,
    padding: "0 16px",
    borderRadius: 12,
    border: "1px solid #d1d5db",
    background: "white",
    color: "#374151",
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
  },

  filterPopup: {
    position: "absolute",
    top: 50,
    right: 0,
    background: "white",
    border: "1px solid #e5e7eb",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    borderRadius: 16,
    padding: 20,
    width: 260,
    display: "flex",
    flexDirection: "column",
    gap: 16,
    zIndex: 30,
  },
  filterGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },

  tableWrap: {
    background: "white",
    borderRadius: 16,
    border: "1px solid #e5e7eb",
    overflowX: "auto",
    overflowY: "auto",
    maxHeight: "500px",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 1000,
  },
  th: {
    background: "#f9fafb",
    padding: "16px",
    textAlign: "left",
    fontSize: 12,
    fontWeight: 800,
    color: "#4b5563",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    borderBottom: "1px solid #e5e7eb",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  tr: {
    borderBottom: "1px solid #f3f4f6",
    transition: "background 0.2s",
  },
  td: {
    padding: "16px",
    fontSize: 14,
    color: "#1f2937",
    verticalAlign: "middle",
  },
  tdStrong: {
    padding: "16px",
    fontSize: 15,
    fontWeight: 800,
    color: "#2c5530",
    verticalAlign: "middle",
  },
  empty: {
    padding: 40,
    textAlign: "center",
    color: "#6b7280",
    fontSize: 15,
    fontStyle: "italic",
  },

  tabContainer: {
    display: "flex",
    gap: 10,
    marginBottom: 16,
    borderBottom: "2px solid #e5e7eb",
    paddingBottom: 4,
  },
  tabBtn: {
    background: "transparent",
    border: "none",
    padding: "8px 16px",
    fontSize: 14,
    fontWeight: 700,
    color: "#6b7280",
    cursor: "pointer",
    position: "relative",
    bottom: -6, // Overlap the border
  },
  activeTab: {
    color: "#2c5530",
    borderBottom: "3px solid #2c5530",
  },

  empCell: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  empAvatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: "#eef2ff",
    color: "#4f46e5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: 15,
  },
  empName: {
    fontWeight: 700,
    color: "#111827",
  },
  empMeta: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },

  ghostBtn: {
    background: "transparent",
    border: "none",
    padding: 8,
    cursor: "pointer",
    borderRadius: 8,
  },
  dropdownMenu: {
    position: "absolute",
    right: 40,
    top: 20,
    background: "white",
    border: "1px solid #e5e7eb",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    borderRadius: 12,
    padding: 6,
    zIndex: 10,
    minWidth: 140,
  },
  dropdownItem: {
    display: "block",
    width: "100%",
    textAlign: "left",
    background: "transparent",
    border: "none",
    padding: "8px 12px",
    fontSize: 13,
    fontWeight: 600,
    color: "#374151",
    cursor: "pointer",
    borderRadius: 6,
  },
};
