import React, { useMemo, useState, useEffect, useRef } from "react";
import AppLayout from "../../../components/layout/AppLayout";
import { 
  MoreVertical, 
  ListFilter, 
  Search, 
  Calendar, 
  Layers, 
  DollarSign, 
  TrendingUp, 
  FileText, 
  Printer, 
  Eye, 
  CheckCircle2, 
  AlertCircle,
  ChevronDown,
  RefreshCcw,
  Plus
} from "lucide-react";
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

  // Role detection
  const userRole = (localStorage.getItem("role") || "MANAGER").toUpperCase();
  const isAccountant = userRole === "ACCOUNTANT" || userRole === "ADMIN";

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

  const departmentsList = useMemo(() => {
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
      <div style={styles.page}>
        <style>{`
          .fade-in { animation: fadeIn 0.4s ease-out forwards; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          .table-row:hover { background: #f8fafc !important; }
        `}</style>

        {toast.message && (
          <div style={{ ...styles.toast, background: toast.type === "error" ? "#dc2626" : "#166534" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {toast.type === "error" ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
              {toast.message}
            </div>
          </div>
        )}

        <div style={styles.container}>
          {/* Header */}
          <div style={styles.pageHeader}>
            <div>
              <div style={styles.breadcrumb}>Manager / Payroll Management</div>
              <h1 style={styles.pageTitle}>Process Payroll</h1>
              <p style={styles.pageSubtitle}>Calculate employee salaries and generate payroll summaries</p>
            </div>

            <div style={styles.summaryBar}>
              <div style={styles.summaryItem}>
                <div style={styles.summaryLabel}>Total Gross</div>
                <div style={styles.summaryValue}>{LKR(totals.gross)}</div>
              </div>
              <div style={styles.summaryDivider}></div>
              <div style={styles.summaryItem}>
                <div style={styles.summaryLabel}>EPF (Employee)</div>
                <div style={styles.summaryValue}>{LKR(totals.epf)}</div>
              </div>
              <div style={styles.summaryDivider}></div>
              <div style={styles.summaryItem}>
                <div style={styles.summaryLabel}>Total Net</div>
                <div style={{ ...styles.summaryValue, color: "#166534" }}>{LKR(totals.net)}</div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div style={styles.filters} className="fade-in">
            <div style={{ ...styles.field, flex: 1 }}>
              <label style={styles.label}>Search Employees</label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <Search size={18} style={{ position: "absolute", left: "14px", color: "#94a3b8" }} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="ID or Name..."
                  style={{ ...styles.input, paddingLeft: "42px", width: "100%" }}
                />
              </div>
            </div>

            <div style={{ position: "relative" }} ref={filterRef}>
              <button
                style={{ ...styles.secondaryBtn, background: showFilterMenu ? "#f1f5f9" : "#fff" }}
                onClick={() => setShowFilterMenu(!showFilterMenu)}
              >
                <ListFilter size={18} />
                <span>Filters</span>
                <ChevronDown size={14} style={{ marginLeft: "4px" }} />
              </button>

              {showFilterMenu && (
                <div style={styles.filterPopup}>
                  <div style={styles.field}>
                    <label style={styles.label}>Select Month</label>
                    <input
                      type="month"
                      value={monthPeriod}
                      onChange={(e) => setMonthPeriod(e.target.value)}
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Department</label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      style={styles.input}
                    >
                      {departmentsList.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {isAccountant && (
              <button style={{ ...styles.primaryBtn, opacity: processing ? 0.7 : 1 }} onClick={generateAll} disabled={processing}>
                {processing ? <RefreshCcw size={18} className="spin" /> : <TrendingUp size={18} />}
                <span>{processing ? "Processing..." : "Generate Entire Payroll"}</span>
              </button>
            )}
          </div>

          {/* Tabs */}
          <div style={styles.tabContainer} className="fade-in">
            <button
              style={{ ...styles.tabBtn, ...(activeTab === "MONTHLY" ? styles.activeTab : {}) }}
              onClick={() => setActiveTab("MONTHLY")}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Calendar size={16} /> Monthly Employees
              </div>
              {activeTab === "MONTHLY" && <div style={styles.activeTabIndicator}></div>}
            </button>
            <button
              style={{ ...styles.tabBtn, ...(activeTab === "OTHER" ? styles.activeTab : {}) }}
              onClick={() => setActiveTab("OTHER")}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Layers size={16} /> Daily / Other Employees
              </div>
              {activeTab === "OTHER" && <div style={styles.activeTabIndicator}></div>}
            </button>
          </div>

          {/* List */}
          <div style={styles.listCard} className="fade-in">
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Employee</th>
                    {activeTab === "MONTHLY" ? (
                      <>
                        <th style={styles.th}>Basic (LKR)</th>
                        <th style={styles.th}>OT Pay</th>
                        <th style={styles.th}>Incentives</th>
                        <th style={styles.th}>Deductions</th>
                        <th style={styles.th}>Gross</th>
                        <th style={styles.th}>EPF (Emp)</th>
                      </>
                    ) : (
                      <>
                        <th style={styles.th}>Work Pay</th>
                        <th style={styles.th}>Incentives</th>
                        <th style={styles.th}>Deductions</th>
                        <th style={styles.th}>Gross</th>
                      </>
                    )}
                    <th style={styles.th}>Net Pay</th>
                    <th style={{ ...styles.th, textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={activeTab === "MONTHLY" ? 9 : 7} style={{ textAlign: "center", padding: "60px", color: "#94a3b8", fontWeight: 600 }}>
                        Fetching payroll data...
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={activeTab === "MONTHLY" ? 9 : 7} style={{ textAlign: "center", padding: "60px", color: "#94a3b8", fontWeight: 600 }}>
                        No active employees found in this category.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((emp) => (
                      <tr key={emp.employeeID} style={styles.tr} className="table-row">
                        <td style={styles.td}>
                          <div style={styles.empCell}>
                            <div style={styles.empAvatar}>{emp.name?.[0] || "E"}</div>
                            <div>
                              <div style={styles.empName}>{emp.name}</div>
                              <div style={styles.empMeta}>{emp.employeeID} • {emp.department}</div>
                            </div>
                          </div>
                        </td>

                        {activeTab === "MONTHLY" ? (
                          <>
                            <td style={styles.td}>{emp.basicSalary === "-" ? "-" : LKR(emp.basicSalary)}</td>
                            <td style={styles.td}>{emp.otPay === "-" ? "-" : LKR(emp.otPay)}</td>
                            <td style={styles.td}>{emp.incentives === "-" ? "-" : LKR(emp.incentives)}</td>
                            <td style={styles.td}>{emp.deductions === "-" ? "-" : LKR(emp.deductions)}</td>
                            <td style={styles.td}>{emp.gross === "-" ? "-" : LKR(emp.gross)}</td>
                            <td style={styles.td}>{emp.epfEmployee === "-" ? "-" : LKR(emp.epfEmployee)}</td>
                          </>
                        ) : (
                          <>
                            <td style={styles.td}>{emp.basicSalary === "-" ? "-" : LKR(emp.basicSalary)}</td>
                            <td style={styles.td}>{emp.incentives === "-" ? "-" : LKR(emp.incentives)}</td>
                            <td style={styles.td}>{emp.deductions === "-" ? "-" : LKR(emp.deductions)}</td>
                            <td style={styles.td}>{emp.gross === "-" ? "-" : LKR(emp.gross)}</td>
                          </>
                        )}

                        <td style={styles.tdStrong}>{emp.netPay === "-" ? "-" : LKR(emp.netPay)}</td>

                        <td style={{ ...styles.td, textAlign: "right", position: "relative" }}>
                          <button
                            style={styles.ghostBtn}
                            onClick={(e) => toggleDropdown(emp.employeeID, e)}
                          >
                            <MoreVertical size={18} color="#94a3b8" />
                          </button>

                          {activeDropdown === emp.employeeID && (
                            <div style={styles.dropdownMenu} ref={dropdownRef}>
                              {emp.isFinalized ? (
                                <>
                                  <button style={styles.dropdownItem} onClick={(e) => { e.stopPropagation(); openPreview(emp); setActiveDropdown(null); }}>
                                    <Eye size={14} /> Preview Summary
                                  </button>
                                  <button style={styles.dropdownItem} onClick={(e) => { e.stopPropagation(); openSlip(emp); setActiveDropdown(null); }}>
                                    <Printer size={14} /> View Pay Slip
                                  </button>
                                </>
                              ) : (
                                isAccountant && (
                                  <button style={{ ...styles.dropdownItem, color: "#166534" }} onClick={(e) => { e.stopPropagation(); generateSingle(emp.employeeID); }}>
                                    <Plus size={14} /> Generate Payroll
                                  </button>
                                )
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
          </div>
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
            payroll={slipEmployee}
            onClose={closeSlip}
          />
        )}
      </div>
    </AppLayout>
  );
}

const styles = {
  page: { minHeight: "100%", background: "#f8fafc" },
  container: { padding: "32px", maxWidth: "1600px", margin: "0 auto" },
  breadcrumb: { fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" },
  pageHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px", gap: "24px", flexWrap: "wrap" },
  pageTitle: { margin: 0, fontSize: "32px", fontWeight: 900, color: "#1e293b", letterSpacing: "-0.02em" },
  pageSubtitle: { margin: "4px 0 0 0", fontSize: "15px", color: "#64748b", fontWeight: 500 },
  summaryBar: { display: "flex", background: "#fff", borderRadius: "20px", padding: "16px 24px", boxShadow: "0 4px 20px rgba(0,0,0,0.03)", border: "1px solid #f1f5f9", alignItems: "center" },
  summaryItem: { padding: "0 24px", textAlign: "center", minWidth: "160px" },
  summaryLabel: { fontSize: "10px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" },
  summaryValue: { fontSize: "20px", fontWeight: 900, color: "#1e293b" },
  summaryDivider: { width: "1px", height: "32px", background: "#f1f5f9" },
  filters: { display: "flex", gap: "12px", background: "#fff", borderRadius: "20px", padding: "20px", marginBottom: "24px", border: "1px solid #f1f5f9", boxShadow: "0 4px 20px rgba(0,0,0,0.02)", alignItems: "flex-end", position: "relative", zIndex: 10 },
  filterPopup: { position: "absolute", top: "calc(100% + 8px)", right: "200px", background: "#fff", border: "1px solid #e2e8f0", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", borderRadius: "16px", padding: "20px", width: "280px", display: "flex", flexDirection: "column", gap: "16px", zIndex: 30 },
  field: { display: "flex", flexDirection: "column", gap: "8px" },
  label: { fontSize: "11px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" },
  input: { height: "42px", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "0 14px", fontSize: "14px", fontWeight: 600, color: "#1e293b", background: "#f8fafc", outline: "none" },
  primaryBtn: { height: "42px", padding: "0 20px", display: "flex", alignItems: "center", gap: "8px", borderRadius: "12px", border: "none", background: "#2c5530", color: "#fff", fontWeight: 700, fontSize: "14px", cursor: "pointer", boxShadow: "0 4px 12px rgba(44, 85, 48, 0.2)" },
  secondaryBtn: { height: "42px", padding: "0 16px", display: "flex", alignItems: "center", gap: "8px", borderRadius: "12px", border: "1px solid #e2e8f0", background: "#fff", color: "#475569", fontWeight: 700, fontSize: "14px", cursor: "pointer" },
  tabContainer: { display: "flex", gap: "24px", marginBottom: "20px", borderBottom: "1px solid #e2e8f0", paddingLeft: "12px" },
  tabBtn: { background: "none", border: "none", paddingBottom: "12px", fontSize: "14px", fontWeight: 700, color: "#94a3b8", cursor: "pointer", position: "relative" },
  activeTab: { color: "#2c5530" },
  activeTabIndicator: { position: "absolute", bottom: "-1px", left: 0, right: 0, height: "3px", background: "#2c5530", borderRadius: "3px 3px 0 0" },
  listCard: { background: "#fff", borderRadius: "24px", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.03)", border: "1px solid #f1f5f9" },
  tableWrapper: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "16px 24px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", background: "#f8fafc" },
  tr: { borderBottom: "1px solid #f1f5f9", transition: "all 0.2s" },
  td: { padding: "16px 24px", fontSize: "14px", color: "#475569" },
  tdStrong: { padding: "16px 24px", fontSize: "15px", fontWeight: 800, color: "#2c5530" },
  empCell: { display: "flex", alignItems: "center", gap: "12px" },
  empAvatar: { width: "36px", height: "36px", borderRadius: "10px", background: "#ecfdf5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "14px" },
  empName: { fontWeight: 700, color: "#1e293b" },
  empMeta: { fontSize: "12px", color: "#94a3b8", marginTop: "2px" },
  ghostBtn: { background: "transparent", border: "none", padding: "8px", cursor: "pointer", borderRadius: "8px" },
  dropdownMenu: { position: "absolute", right: "40px", top: "20px", background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "6px", minWidth: "180px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", zIndex: 100 },
  dropdownItem: { display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "8px", border: "none", background: "none", width: "100%", textAlign: "left", fontSize: "13px", fontWeight: 600, color: "#475569", cursor: "pointer" },
  toast: { position: "fixed", bottom: "32px", right: "32px", padding: "16px 24px", borderRadius: "16px", fontWeight: 700, color: "#fff", zIndex: 2000, boxShadow: "0 10px 30px rgba(0,0,0,0.1)", animation: "slideUp 0.4s ease-out" },
};
