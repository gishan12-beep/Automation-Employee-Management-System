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
import { processPayrollApi, getPayrollSummaryApi, processSingleEmployeeApi, getPayrollDetailsApi } from "../../../services/payrollService";
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
  const [selectedId, setSelectedId] = useState(null);
  const [slipEmployee, setSlipEmployee] = useState(null);

  // Itemized breakdown caching
  const [detailsMap, setDetailsMap] = useState({});
  const [fetchingDetail, setFetchingDetail] = useState(false);

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
    async function fetchItemizedDetails() {
      if (!selectedId || !monthPeriod) return;
      if (detailsMap[selectedId]) return;

      setFetchingDetail(true);
      try {
        const [year, month] = monthPeriod.split("-");
        const details = await getPayrollDetailsApi(month, year, selectedId);
        setDetailsMap(prev => ({ ...prev, [selectedId]: details }));
      } catch (err) {
        console.error("Failed to fetch payroll details", err);
      } finally {
        setFetchingDetail(false);
      }
    }
    fetchItemizedDetails();
  }, [selectedId, monthPeriod, detailsMap]);

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
            const isReady = generatedRun.status === "READY";
            return {
              employeeID: generatedRun.employeeId,
              name: generatedRun.name,
              department: generatedRun.department || emp.department || "N/A",
              basicSalary: isReady ? (generatedRun.basic_earnings || 0) : "-",
              otPay: isReady ? (generatedRun.total_ot_pay || 0) : "-",
              incentives: isReady ? (generatedRun.total_incentives || 0) : "-",
              deductions: isReady ? (generatedRun.total_deductions || 0) : "-",
              gross: isReady ? (generatedRun.gross || 0) : "-",
              epfEmployee: isReady ? (generatedRun.epf_employee || 0) : "-",
              epfEmployer: isReady ? (generatedRun.epf_employer || 0) : "-",
              etfEmployer: isReady ? (generatedRun.etf_employer || 0) : "-",
              netPay: isReady ? Math.max(0, generatedRun.net || 0) : "-",
              status: generatedRun.status || "GENERATED",
              isFinalized: isReady,
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
      .filter((e) => e.isFinalized) // Only show approved payrolls
      .filter((e) => (department === "All" ? true : e.department === department))
      .filter((e) =>
        query.trim()
          ? (e.name + " " + e.employeeID).toLowerCase().includes(query.toLowerCase())
          : true
      );
  }, [employees, department, query]);

  const selectedData = useMemo(() => {
    return filtered.find(e => String(e.employeeID) === String(selectedId)) || null;
  }, [filtered, selectedId]);

  const totals = useMemo(() => {
    let gross = 0, net = 0, epf = 0;
    filtered.forEach((e) => {
      gross += Number(e.gross) || 0;
      net += Number(e.netPay) || 0;
      epf += Number(e.epfEmployee) || 0;
    });
    return { gross, net, epf };
  }, [filtered]);

  const openSlip = (emp) => setSlipEmployee(emp);
  const closeSlip = () => setSlipEmployee(null);

  return (
    <AppLayout>
      <div style={styles.page}>
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
          .fc-1 { animation: float 20s ease-in-out infinite; background: radial-gradient(circle, rgba(74, 124, 78, 0.08) 0%, transparent 70%); width: 400px; height: 400px; top: -100px; left: -100px; }
          .fc-2 { animation: floatReverse 25s ease-in-out infinite; background: radial-gradient(circle, rgba(74, 124, 78, 0.06) 0%, transparent 70%); width: 350px; height: 350px; bottom: -80px; right: -80px; }
          .fc-3 { animation: float 18s ease-in-out infinite; background: radial-gradient(circle, rgba(74, 124, 78, 0.05) 0%, transparent 70%); width: 250px; height: 250px; top: 20%; right: 10%; }
          
          .fade-in { animation: fadeIn 0.4s ease-out forwards; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          .table-row { transition: all 0.2s; cursor: pointer; }
          .table-row:hover { background: rgba(248, 250, 252, 0.8) !important; }
          .selected-row { background: rgba(240, 253, 244, 1) !important; border-left: 4px solid #4a7c4e !important; }
          .scroll-custom::-webkit-scrollbar { width: 6px; }
          .scroll-custom::-webkit-scrollbar-thumb { background: rgba(74, 124, 78, 0.2); border-radius: 10px; }
        `}</style>

        <div className="floating-circle fc-1"></div>
        <div className="floating-circle fc-2"></div>
        <div className="floating-circle fc-3"></div>

        {toast.message && (
          <div style={{ ...styles.toast, background: toast.type === "error" ? "#dc2626" : "#4a7c4e" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {toast.type === "error" ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
              {toast.message}
            </div>
          </div>
        )}

        <div style={styles.container}>
          <div style={styles.pageHeader}>
            <div>
              <div style={styles.breadcrumb}>Manager / Payroll Review</div>
              <h1 style={styles.pageTitle}>Payroll Overview</h1>
              <p style={styles.pageSubtitle}>Review approved salaries and generate payslips</p>
            </div>

            <div style={styles.summaryBar}>
              <div style={styles.summaryItem}>
                <div style={styles.summaryLabel}>Total Net Payout</div>
                <div style={{ ...styles.summaryValue, color: "#4a7c4e" }}>{LKR(totals.net)}</div>
              </div>
              <div style={styles.summaryDivider}></div>
              <div style={styles.summaryItem}>
                <div style={styles.summaryLabel}>Employees</div>
                <div style={styles.summaryValue}>{filtered.length}</div>
              </div>
            </div>
          </div>

          <div style={styles.mainGrid}>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={styles.filters} className="fade-in">
                <div style={{ ...styles.field, flex: 1 }}>
                  <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                    <Search size={18} style={{ position: "absolute", left: "14px", color: "#94a3b8" }} />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search approved payrolls..."
                      style={{ ...styles.input, paddingLeft: "42px", width: "100%" }}
                    />
                  </div>
                </div>
                <div style={{ position: "relative" }}>
                  <input
                    type="month"
                    value={monthPeriod}
                    onChange={(e) => setMonthPeriod(e.target.value)}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.listCard} className="fade-in">
                <div style={styles.tableWrapper} className="scroll-custom">
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Employee</th>
                        <th style={styles.th}>Net Pay</th>
                        <th style={{ ...styles.th, textAlign: "right" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={3} style={{ textAlign: "center", padding: "60px", color: "#94a3b8", fontWeight: 600 }}>
                            Fetching...
                          </td>
                        </tr>
                      ) : filtered.length === 0 ? (
                        <tr>
                          <td colSpan={3} style={{ textAlign: "center", padding: "60px", color: "#94a3b8", fontWeight: 600 }}>
                            No approved payrolls found.
                          </td>
                        </tr>
                      ) : (
                        filtered.map((emp) => (
                          <tr 
                            key={emp.employeeID} 
                            style={emp.employeeID === selectedId ? styles.trSelected : styles.tr}
                            className={`table-row ${emp.employeeID === selectedId ? 'selected-row' : ''}`}
                            onClick={() => setSelectedId(emp.employeeID)}
                          >
                            <td style={styles.td}>
                              <div style={styles.empCell}>
                                <div style={{ ...styles.empAvatar, background: emp.employeeID === selectedId ? "#4a7c4e" : "#ecfdf5", color: emp.employeeID === selectedId ? "#fff" : "#4a7c4e" }}>
                                  {emp.name?.[0] || "E"}
                                </div>
                                <div>
                                  <div style={styles.empName}>{emp.name}</div>
                                  <div style={styles.empMeta}>{emp.employeeID}</div>
                                </div>
                              </div>
                            </td>
                            <td style={styles.tdStrong}>{LKR(emp.netPay)}</td>
                            <td style={{ ...styles.td, textAlign: "right" }}>
                               <button style={styles.previewBtn} onClick={(e) => { e.stopPropagation(); setSelectedId(emp.employeeID); }}>
                                  View Detailed Review
                                </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="fade-in" style={styles.detailCard}>
              {selectedData ? (
                <div style={styles.previewArea}>
                  <div style={styles.previewHeader}>
                    <div>
                      <h3 style={styles.previewTitle}>Payroll Details</h3>
                      <p style={styles.previewSubtitle}>{selectedData.name} — {selectedData.employeeID}</p>
                    </div>
                    <button style={styles.printBtn} onClick={() => openSlip(selectedData)}>
                      <Printer size={16} /> Print Payslip
                    </button>
                  </div>

                  <div style={styles.statsGrid}>
                    <div style={styles.statBox}>
                      <span style={styles.statLabel}>Earnings</span>
                      <span style={styles.statValue}>{LKR(selectedData.gross)}</span>
                    </div>
                    <div style={styles.statBox}>
                      <span style={styles.statLabel}>Deductions</span>
                      <span style={styles.statValue}>{LKR(Number(selectedData.epfEmployee || 0) + Number(selectedData.deductions || 0))}</span>
                    </div>
                    <div style={{ ...styles.statBox, background: "#ecfdf5", borderColor: "#bbf7d0" }}>
                      <span style={{ ...styles.statLabel, color: "#059669" }}>Net Payout</span>
                      <span style={{ ...styles.statValue, color: "#047857" }}>{LKR(selectedData.netPay)}</span>
                    </div>
                  </div>

                  <div style={styles.breakdown}>
                    <h4 style={styles.breakdownTitle}>Itemized Breakdown</h4>
                    <div style={styles.breakdownList}>
                      <BreakdownRow label="Basic Salary" value={LKR(selectedData.basicSalary)} />
                      <BreakdownRow label="Fixed OT Pay" value={LKR(selectedData.otPay)} />
                      
                      {fetchingDetail ? (
                        <div style={{ padding: "20px 0", textAlign: "center", color: "#94a3b8", fontSize: "13px", fontWeight: 600 }}>
                          Retrieving itemized records...
                        </div>
                      ) : detailsMap[selectedId] ? (
                        <>
                          {(() => {
                            const iMap = detailsMap[selectedId];
                            const manualInc = iMap.incentives?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
                            const incDiff = Number(selectedData.incentives) - manualInc;
                            
                            const manualDed = iMap.deductions?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
                            const dedDiff = Number(selectedData.deductions) - manualDed;

                            return (
                              <>
                                {iMap.incentives?.map((inc, i) => (
                                  <BreakdownRow key={`inc-${i}`} label={inc.description || "Incentive"} value={LKR(inc.amount)} />
                                ))}
                                {incDiff > 1 && <BreakdownRow label="Other Incentives" value={LKR(incDiff)} />}
                                
                                <div style={styles.hr} />
                                
                                <BreakdownRow label="EPF (Employee Contribution)" value={LKR(selectedData.epfEmployee)} isDeduction />
                                {iMap.deductions?.map((ded, i) => (
                                  <BreakdownRow key={`ded-${i}`} label={ded.reason || "Other Deduction"} value={LKR(ded.amount)} isDeduction />
                                ))}
                                {dedDiff > 1 && <BreakdownRow label="Other Deductions" value={LKR(dedDiff)} isDeduction />}
                              </>
                            );
                          })()}
                        </>
                      ) : (
                        <>
                          <BreakdownRow label="Performance Incentives" value={LKR(selectedData.incentives)} />
                          <div style={styles.hr} />
                          <BreakdownRow label="EPF (Employee Contribution)" value={LKR(selectedData.epfEmployee)} isDeduction />
                          <BreakdownRow label="Other Deductions" value={LKR(selectedData.deductions)} isDeduction />
                        </>
                      )}
                    </div>
                  </div>

                  <div style={styles.employerNotes}>
                    <AlertCircle size={16} />
                    <span>Company contributions: EPF (12%) {LKR(selectedData.epfEmployer)} | ETF (3%) {LKR(selectedData.etfEmployer)}</span>
                  </div>
                </div>
              ) : (
                <div style={styles.emptyDetail}>
                  <FileText size={48} color="#e2e8f0" style={{ marginBottom: 16 }} />
                  <p>Select an employee from the list to view their detailed payroll breakdown</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {slipEmployee && (
          <SalarySlipGenerator
            employee={slipEmployee}
            input={{}}
            payroll={slipEmployee}
            details={detailsMap[slipEmployee.employeeID]}
            onClose={closeSlip}
          />
        )}
      </div>
    </AppLayout>
  );
}

function BreakdownRow({ label, value, isDeduction }) {
  return (
    <div style={styles.breakdownRow}>
      <span style={styles.brLabel}>{label}</span>
      <span style={{ ...styles.brValue, color: isDeduction ? "#dc2626" : "#1e293b" }}>
        {isDeduction ? `-${value}` : value}
      </span>
    </div>
  );
}

const styles = {
  page: { height: "calc(100vh - 64px)", overflow: "hidden", position: "relative" },
  container: { 
    padding: "32px", 
    maxWidth: "1600px", 
    margin: "0 auto", 
    position: "relative", 
    zIndex: 1, 
    height: "100%", 
    display: "flex", 
    flexDirection: "column" 
  },
  breadcrumb: { fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" },
  pageHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px", gap: "24px", flexWrap: "wrap" },
  pageTitle: { margin: 0, fontSize: "32px", fontWeight: 900, color: "#2c5530", letterSpacing: "-0.02em" },
  pageSubtitle: { margin: "4px 0 0 0", fontSize: "15px", color: "#64748b", fontWeight: 500 },
  
  summaryBar: { 
    display: "flex", 
    background: "rgba(255, 255, 255, 0.9)", 
    backdropFilter: "blur(12px)",
    borderRadius: "24px", 
    padding: "20px 28px", 
    boxShadow: "0 8px 30px rgba(0,0,0,0.02)", 
    border: "1px solid rgba(255, 255, 255, 0.5)", 
    alignItems: "center" 
  },
  summaryItem: { padding: "0 28px", textAlign: "center", minWidth: "150px" },
  summaryLabel: { fontSize: "11px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" },
  summaryValue: { fontSize: "22px", fontWeight: 900, color: "#1e293b" },
  summaryDivider: { width: "1px", height: "40px", background: "rgba(0,0,0,0.05)" },
  
  mainGrid: { 
    display: "grid", 
    gridTemplateColumns: "1fr 1.5fr", 
    gap: "32px", 
    alignItems: "start",
    flex: 1,
    overflow: "hidden",
    marginTop: "24px"
  },
  
  filters: { 
    display: "flex", 
    gap: "12px", 
    background: "rgba(255, 255, 255, 0.8)", 
    backdropFilter: "blur(10px)",
    borderRadius: "20px", 
    padding: "16px", 
    border: "1px solid rgba(255, 255, 255, 0.5)", 
    boxShadow: "0 4px 20px rgba(0,0,0,0.02)", 
    alignItems: "center" 
  },
  field: { display: "flex", flexDirection: "column" },
  input: { 
    height: "44px", 
    borderRadius: "14px", 
    border: "1px solid #e2e8f0", 
    padding: "0 16px", 
    fontSize: "14px", 
    fontWeight: 600, 
    color: "#1e293b", 
    background: "#fff", 
    outline: "none",
    transition: "border-color 0.2s"
  },
  
  listCard: { 
    background: "rgba(255, 255, 255, 0.9)", 
    backdropFilter: "blur(12px)",
    borderRadius: "24px", 
    overflow: "hidden", 
    boxShadow: "0 8px 30px rgba(0,0,0,0.02)", 
    border: "1px solid rgba(255, 255, 255, 0.5)",
    height: "100%",
    display: "flex",
    flexDirection: "column"
  },
  tableWrapper: { flex: 1, overflowY: "auto", overflowX: "auto" },
  table: { width: "100%", borderCollapse: "separate", borderSpacing: 0 },
  th: { 
    padding: "16px 24px", 
    textAlign: "left", 
    fontSize: "11px", 
    fontWeight: 800, 
    color: "#94a3b8", 
    textTransform: "uppercase", 
    letterSpacing: "0.1em", 
    background: "rgba(248, 250, 252, 0.5)",
    borderBottom: "1px solid rgba(0,0,0,0.05)"
  },
  tr: { borderBottom: "1px solid rgba(0,0,0,0.05)", cursor: "pointer", transition: "all 0.2s" },
  trSelected: { background: "rgba(240, 253, 244, 1)", borderBottom: "1px solid rgba(0,0,0,0.05)" },
  td: { padding: "18px 24px", fontSize: "14px", color: "#475569" },
  tdStrong: { padding: "18px 24px", fontSize: "15px", fontWeight: 800, color: "#2c5530" },
  empCell: { display: "flex", alignItems: "center", gap: "14px" },
  empAvatar: { 
    width: "42px", 
    height: "42px", 
    borderRadius: "14px", 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center", 
    fontWeight: 800, 
    fontSize: "16px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.03)"
  },
  empName: { fontWeight: 700, color: "#1e293b", fontSize: "15px" },
  empMeta: { fontSize: "12px", color: "#94a3b8", marginTop: "2px", fontWeight: 600 },
  
  previewBtn: { 
    padding: "8px 18px", 
    borderRadius: "12px", 
    border: "1px solid #e2e8f0", 
    background: "#fff", 
    color: "#4a7c4e", 
    fontWeight: 700, 
    fontSize: "13px", 
    cursor: "pointer", 
    transition: "all 0.2s",
    boxShadow: "0 2px 5px rgba(0,0,0,0.02)"
  },
  
  detailCard: { 
    background: "rgba(255, 255, 255, 0.95)", 
    backdropFilter: "blur(16px)",
    borderRadius: "28px", 
    padding: "36px", 
    boxShadow: "0 10px 40px rgba(0,0,0,0.04)", 
    border: "1px solid rgba(255, 255, 255, 0.6)", 
    height: "100%",
    overflowY: "auto"
  },
  emptyDetail: { height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", color: "#94a3b8", padding: "40px" },
  previewArea: { display: "flex", flexDirection: "column", gap: "28px" },
  previewHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: "24px", borderBottom: "1px solid rgba(0,0,0,0.05)" },
  previewTitle: { margin: 0, fontSize: "24px", fontWeight: 900, color: "#1e293b" },
  previewSubtitle: { margin: "4px 0 0 0", fontSize: "15px", color: "#64748b", fontWeight: 600 },
  printBtn: { 
    display: "flex", 
    alignItems: "center", 
    gap: "10px", 
    padding: "12px 24px", 
    borderRadius: "14px", 
    background: "linear-gradient(135deg, #4a7c4e 0%, #5a8c5e 100%)", 
    color: "#fff", 
    border: "none", 
    fontWeight: 700, 
    cursor: "pointer", 
    boxShadow: "0 8px 20px rgba(74, 124, 78, 0.25)",
    transition: "transform 0.2s"
  },
  
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "18px" },
  statBox: { 
    padding: "18px", 
    borderRadius: "18px", 
    background: "rgba(248, 250, 252, 0.5)", 
    border: "1px solid rgba(0,0,0,0.03)", 
    display: "flex", 
    flexDirection: "column", 
    gap: "6px" 
  },
  statLabel: { fontSize: "11px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" },
  statValue: { fontSize: "19px", fontWeight: 900, color: "#1e293b" },
  
  breakdown: { marginTop: "16px" },
  breakdownTitle: { fontSize: "14px", fontWeight: 800, color: "#1e293b", marginBottom: "20px", textTransform: "uppercase", letterSpacing: "0.1em" },
  breakdownList: { display: "flex", flexDirection: "column", gap: "4px" },
  breakdownRow: { display: "flex", justifyContent: "space-between", padding: "14px 0" },
  brLabel: { fontSize: "14px", fontWeight: 600, color: "#64748b" },
  brValue: { fontSize: "14px", fontWeight: 700 },
  hr: { border: "none", borderTop: "1px dashed rgba(0,0,0,0.1)", margin: "14px 0" },
  employerNotes: { 
    display: "flex", 
    alignItems: "center", 
    gap: "12px", 
    padding: "18px", 
    background: "#eff6ff", 
    borderRadius: "16px", 
    color: "#1e40af", 
    fontSize: "13px", 
    fontWeight: 600,
    border: "1px solid #dbeafe"
  },
  toast: { position: "fixed", bottom: "32px", right: "32px", padding: "18px 28px", borderRadius: "18px", fontWeight: 700, color: "#fff", zIndex: 2000, boxShadow: "0 20px 40px rgba(0,0,0,0.15)", animation: "slideUp 0.4s ease-out" },
};
