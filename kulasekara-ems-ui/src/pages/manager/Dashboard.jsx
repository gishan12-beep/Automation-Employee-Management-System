import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import AppLayout from "../../components/layout/AppLayout";
import { getEmployeesApi, getDashboardStatsApi } from "../../services/managerEmployeeService";
import { markAttendanceApi } from "../../services/managerAttendanceService";
import { 
  Users, 
  Clock, 
  ClipboardList, 
  AlertCircle, 
  Calendar, 
  TrendingUp, 
  BarChart3, 
  Zap, 
  UserPlus, 
  BadgeCheck, 
  Wallet, 
  FileText,
  X,
  Info,
  ChevronRight
} from "lucide-react";

// Main dashboard component for the Manager role, providing an overview of team operations and quick actions
function Dashboard() {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);

  // Attendance Modal State
  const [isAttModalOpen, setIsAttModalOpen] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState(null);

  const [attForm, setAttForm] = useState({
    employee_id: "",
    date: new Date().toISOString().slice(0, 10),
    status: "PRESENT",
    check_in: "09:00",
    check_out: "",
  });

  // Fetches core dashboard metrics (employee count, attendance, etc.) upon component mount
  useEffect(() => {
    (async () => {
      try {
        const data = await getDashboardStatsApi();
        setStats(data);
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
      }
    })();
  }, []);

  // Retrieves the full employee list for the attendance marking modal when it is opened
  useEffect(() => {
    if (isAttModalOpen && employees.length === 0) {
      (async () => {
        try {
          const res = await getEmployeesApi();
          setEmployees(Array.isArray(res) ? res : res.employees || []);
        } catch (err) {
          console.error("Failed to load employees for attendance", err);
        }
      })();
    }
  }, [isAttModalOpen, employees]);

  // Updates the attendance form state when input fields are modified
  const handleAttChange = (e) => {
    const { name, value } = e.target;
    setAttForm((p) => ({ ...p, [name]: value }));
  };

  // Submits the attendance record to the backend and resets the form upon success
  const submitAttendance = async () => {
    if (!attForm.employee_id) return alert("Please select an employee");
    if (!attForm.date) return alert("Please select a date");

    try {
      // Calls the attendance service to store the record in the database
      await markAttendanceApi(attForm);
      alert("Attendance marked successfully!");
      setIsAttModalOpen(false); // Close the modal
      
      // Reset form to default values for the next entry
      setAttForm({
        employee_id: "",
        date: new Date().toISOString().slice(0, 10),
        status: "PRESENT",
        check_in: "09:00",
        check_out: "",
      });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to mark attendance");
    }
  };

  return (
    <>
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
            .fc-2 { animation: floatReverse 25s ease-in-out infinite; background: radial-gradient(circle, rgba(56, 142, 60, 0.06) 0%, transparent 70%); width: 350px; height: 350px; bottom: -80px; right: -80px; }
            .fc-3 { animation: float 18s ease-in-out infinite; background: radial-gradient(circle, rgba(67, 160, 71, 0.05) 0%, transparent 70%); width: 250px; height: 250px; top: 20%; right: 10%; }
            .fade-in { animation: fadeIn 0.5s ease-out forwards; }
            @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          `}</style>

          <div className="floating-circle fc-1"></div>
          <div className="floating-circle fc-2"></div>
          <div className="floating-circle fc-3"></div>

          <div style={styles.container}>
            {/* Page Header */}
            <div style={styles.pageHeader}>
              <div>
                <h1 style={styles.pageTitle}>Manager Dashboard</h1>
                <p style={styles.pageSubtitle}>Real-time overview of team operations & performance</p>
              </div>

              <div style={styles.headerActions}>
                <div style={styles.dateBadge}>
                  <Calendar size={16} />
                  <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div style={styles.cardGrid}>
              <SummaryCard
                title="Total Employees"
                value={stats?.activeCount || 0}
                hint="Active members"
                icon={<Users size={24} />}
                color="#059669"
                bg="#ecfdf5"
                onClick={() => navigate("/manager/employees")}
              />
              <SummaryCard
                title="Attendance Today"
                value={stats?.todayAttendanceCount || 0}
                hint="Employees clocked in"
                icon={<Clock size={24} />}
                color="#2563eb"
                bg="#eff6ff"
                onClick={() => navigate("/manager/attendance")}
              />
              <SummaryCard
                title="Leave Requests"
                value={stats?.pendingLeaveCount || 0}
                hint="Pending approval"
                icon={<ClipboardList size={24} />}
                color="#d97706"
                bg="#fffbeb"
                onClick={() => navigate("/manager/leaves")}
              />
              <SummaryCard
                title="Issues Reported"
                value={stats?.pendingIssueCount || 0}
                hint="Awaiting resolution"
                icon={<AlertCircle size={24} />}
                color="#dc2626"
                bg="#fef2f2"
                onClick={() => navigate("/manager/issues")}
              />
            </div>

            {/* Main Content Grid */}
            <div style={styles.sectionGrid}>
              {/* Payroll Summary Panel */}
              <div className="fade-in" style={styles.panel}>
                <div style={styles.panelHeader}>
                  <div style={styles.panelTitleSection}>
                    <div style={{ ...styles.sectionIcon, background: "#f3f4f6", color: "#4b5563" }}>
                      <TrendingUp size={18} />
                    </div>
                    <h3 style={styles.panelTitle}>Payroll Summary</h3>
                  </div>
                  <span style={styles.pill}>This Month</span>
                </div>

                <div style={styles.chartArea}>
                  <div style={{ ...styles.chartPlaceholder, background: "linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)", border: "1px dashed #d1d5db" }}>
                    <BarChart3 size={40} color="#9ca3af" strokeWidth={1.5} />
                    <span style={{ color: "#9ca3af", fontWeight: 600, fontSize: 13, marginTop: 12 }}>Detailed Payroll Analytics</span>
                  </div>
                  <p style={styles.chartLabel}>Distribution across departments</p>
                </div>
              </div>

              {/* Attendance Trends Panel */}
              <div className="fade-in" style={styles.panel}>
                <div style={styles.panelHeader}>
                  <div style={styles.panelTitleSection}>
                    <div style={{ ...styles.sectionIcon, background: "#eff6ff", color: "#2563eb" }}>
                      <Zap size={18} />
                    </div>
                    <h3 style={styles.panelTitle}>Attendance Trends</h3>
                  </div>
                  <span style={styles.pillBlue}>Last 30 Days</span>
                </div>

                <div style={styles.chartArea}>
                  <div style={{ ...styles.chartPlaceholder, background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)", border: "1px dashed #bae6fd" }}>
                    <BarChart3 size={40} color="#3b82f6" strokeWidth={1.5} />
                    <span style={{ color: "#3b82f6", fontWeight: 600, fontSize: 13, marginTop: 12 }}>Daily Attendance Trends</span>
                  </div>
                  <p style={styles.chartLabel}>Peak activity and gap analysis</p>
                </div>
              </div>
            </div>

            {/* Quick Actions Section */}
            <div className="fade-in" style={styles.quickActionsPanel}>
              <div style={styles.panelHeader}>
                <div style={styles.panelTitleSection}>
                  <div style={{ ...styles.sectionIcon, background: "#ecfdf5", color: "#059669" }}>
                    <BadgeCheck size={18} />
                  </div>
                  <h3 style={styles.panelTitle}>Quick Actions</h3>
                </div>
              </div>

              <div style={styles.quickActionsGrid}>
                <ActionButton
                  label="Add Employee"
                  icon={<UserPlus size={20} />}
                  path="/manager/employees"
                />
                <ActionButton
                  label="Mark Attendance"
                  icon={<Clock size={20} />}
                  onClick={() => setIsAttModalOpen(true)}
                />
                <ActionButton
                  label="View Payroll Summary"
                  icon={<Wallet size={20} />}
                  path="/manager/payroll"
                />
                <ActionButton
                  label="Generate Report"
                  icon={<FileText size={20} />}
                  path="/manager/reports"
                />
              </div>
            </div>
          </div>

          {/* ATTENDANCE MODAL */}
          {isAttModalOpen && (
            <div style={styles.modalOverlay} onClick={() => setIsAttModalOpen(false)}>
              <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div style={styles.modalHeader}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ ...styles.sectionIcon, background: "#ecfdf5", color: "#059669", width: 32, height: 32 }}>
                      <Clock size={16} />
                    </div>
                    <h3 style={styles.modalTitle}>Mark Attendance</h3>
                  </div>
                  <button style={styles.iconBtn} onClick={() => setIsAttModalOpen(false)}>
                    <X size={20} />
                  </button>
                </div>
                
                <div style={styles.modalBody}>
                  <div style={styles.inputWrapper}>
                    <label style={styles.inputLabel}>Employee</label>
                    <div style={styles.inputFieldContainer}>
                      <Users size={16} style={styles.inputIcon} />
                      <select
                        name="employee_id"
                        value={attForm.employee_id}
                        onChange={handleAttChange}
                        style={styles.styledSelect}
                      >
                        <option value="">-- Select Employee --</option>
                        {employees.map((emp) => (
                          <option key={emp.employee_id} value={emp.employee_id}>
                            {emp.first_name} {emp.last_name} ({emp.employee_id})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={styles.inputWrapper}>
                    <label style={styles.inputLabel}>Date</label>
                    <div style={styles.inputFieldContainer}>
                      <Calendar size={16} style={styles.inputIcon} />
                      <input
                        type="date"
                        name="date"
                        value={attForm.date}
                        onChange={handleAttChange}
                        style={styles.styledInput}
                      />
                    </div>
                  </div>

                  <div style={styles.inputWrapper}>
                    <label style={styles.inputLabel}>Attendance Status</label>
                    <div style={styles.inputFieldContainer}>
                      <BadgeCheck size={16} style={styles.inputIcon} />
                      <select
                        name="status"
                        value={attForm.status}
                        onChange={handleAttChange}
                        style={styles.styledSelect}
                      >
                        <option value="PRESENT">PRESENT</option>
                        <option value="ABSENT">ABSENT</option>
                        <option value="LATE">LATE</option>
                        <option value="HALF_DAY">HALF_DAY</option>
                        <option value="LEAVE">LEAVE</option>
                      </select>
                    </div>
                  </div>

                  <div style={styles.row}>
                    <div style={styles.inputWrapper}>
                      <label style={styles.inputLabel}>Check In Time</label>
                      <div style={styles.inputFieldContainer}>
                        <Clock size={16} style={styles.inputIcon} />
                        <input
                          type="time"
                          name="check_in"
                          value={attForm.check_in}
                          onChange={handleAttChange}
                          style={styles.styledInput}
                        />
                      </div>
                    </div>
                    <div style={styles.inputWrapper}>
                      <label style={styles.inputLabel}>Check Out Time</label>
                      <div style={styles.inputFieldContainer}>
                        <Clock size={16} style={styles.inputIcon} />
                        <input
                          type="time"
                          name="check_out"
                          value={attForm.check_out}
                          onChange={handleAttChange}
                          style={styles.styledInput}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ background: "#fef2f2", padding: "12px 16px", borderRadius: 12, border: "1px solid #fee2e2", display: "flex", gap: 10, marginTop: 8 }}>
                    <Info size={18} color="#dc2626" style={{ flexShrink: 0 }} />
                    <p style={{ margin: 0, fontSize: 12, color: "#991b1b", lineHeight: 1.5 }}>
                      Ensure the check-out time is recorded for accurate payroll calculation.
                    </p>
                  </div>
                </div>

                <div style={styles.modalFooter}>
                  <button style={styles.btnSecondary} onClick={() => setIsAttModalOpen(false)}>Cancel</button>
                  <button style={styles.btnPrimary} onClick={submitAttendance}>Save Attendance</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </AppLayout>

      {/* Inline Styles for Modal */}
      <style>{`
         /* ... existing styles ... */
      `}</style>
    </>
  );
}

export default Dashboard;

const styles = {
  page: { position: "relative", minHeight: "100%", overflow: "hidden" },
  container: { padding: 32, position: "relative", zIndex: 1 },

  pageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    marginBottom: 32,
    maxWidth: 1200,
    margin: "0 auto 32px auto"
  },
  pageTitle: {
    margin: 0,
    fontSize: 32,
    fontWeight: 900,
    color: "#2c5530",
    letterSpacing: "-0.02em"
  },
  pageSubtitle: {
    margin: "8px 0 0 0",
    fontSize: 15,
    color: "#6b7280",
    fontWeight: 500
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  dateBadge: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 20px",
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 999,
    color: "#4b5563",
    fontSize: 13,
    fontWeight: 700,
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
  },

  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 24,
    maxWidth: 1200,
    margin: "0 auto",
  },
  summaryCard: {
    background: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    borderRadius: 24,
    padding: "24px",
    display: "flex",
    alignItems: "center",
    gap: 20,
    boxShadow: "0 8px 30px rgba(0,0,0,0.02)",
    transition: "all 0.3s ease",
    cursor: "pointer",
    position: "relative",
    overflow: "hidden"
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "transform 0.3s ease",
  },
  cardText: {
    display: "flex",
    flexDirection: "column",
    gap: 2
  },
  cardLabel: {
    margin: 0,
    fontSize: 13,
    fontWeight: 700,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.05em"
  },
  cardValue: {
    margin: 0,
    fontSize: 32,
    fontWeight: 900,
    color: "#111827",
  },
  cardHint: {
    margin: 0,
    fontSize: 12,
    fontWeight: 600,
    color: "#9ca3af",
  },

  sectionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
    gap: 24,
    maxWidth: 1200,
    margin: "24px auto 0 auto",
  },
  panel: {
    background: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    borderRadius: 24,
    padding: 28,
    boxShadow: "0 8px 30px rgba(0,0,0,0.02)",
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  panelTitleSection: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  sectionIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 38,
    height: 38,
    borderRadius: 10,
  },
  panelTitle: {
    margin: 0,
    fontSize: 18,
    fontWeight: 800,
    color: "#111827",
  },
  pill: {
    padding: "6px 14px",
    borderRadius: 20,
    background: "#f3f4f6",
    color: "#4b5563",
    fontSize: 11,
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.05em"
  },
  pillBlue: {
    padding: "6px 14px",
    borderRadius: 20,
    background: "#eff6ff",
    color: "#2563eb",
    fontSize: 11,
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.05em"
  },
  chartArea: {
    display: "flex",
    flexDirection: "column",
    gap: 16
  },
  chartPlaceholder: {
    width: "100%",
    height: 180,
    borderRadius: 18,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  chartLabel: {
    margin: 0,
    color: "#9ca3af",
    fontSize: 13,
    fontWeight: 500,
    textAlign: "center",
  },

  quickActionsPanel: {
    maxWidth: 1200,
    margin: "24px auto 0 auto",
    background: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    borderRadius: 24,
    padding: 28,
    boxShadow: "0 8px 30px rgba(0,0,0,0.02)",
  },
  quickActionsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 20,
  },
  actionButton: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: "20px 24px",
    background: "#fff",
    border: "1px solid #f3f4f6",
    borderRadius: 20,
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
  },
  actionText: {
    fontSize: 15,
    fontWeight: 700,
    color: "#374151",
  },

  // Modal Styles
  modalOverlay: {
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    background: "rgba(15, 23, 42, 0.3)",
    backdropFilter: "blur(8px)",
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20
  },
  modal: {
    background: "#fff",
    borderRadius: 28,
    width: "100%",
    maxWidth: 520,
    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
    overflow: "hidden",
  },
  modalHeader: {
    padding: "24px 32px",
    borderBottom: "1px solid #f3f4f6",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#fff"
  },
  modalTitle: { margin: 0, fontSize: 20, fontWeight: 800, color: "#111827" },
  iconBtn: { 
    background: "#f3f4f6", 
    border: "none", 
    width: 32, 
    height: 32, 
    borderRadius: 10, 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center", 
    cursor: "pointer", 
    color: "#6b7280",
    transition: "all 0.2s"
  },
  modalBody: { 
    padding: "32px", 
    display: "flex", 
    flexDirection: "column", 
    gap: 20,
    maxHeight: "70vh",
    overflowY: "auto"
  },
  inputWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: 8
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: 700,
    color: "#4b5563",
    marginLeft: 4
  },
  inputFieldContainer: {
    display: "flex",
    alignItems: "center",
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: "4px 16px",
    transition: "all 0.2s",
  },
  inputIcon: {
    color: "#9ca3af",
    marginRight: 12
  },
  styledInput: {
    flex: 1,
    border: "none",
    padding: "12px 0",
    fontSize: 14,
    fontWeight: 600,
    color: "#111827",
    outline: "none",
    background: "transparent"
  },
  styledSelect: {
    flex: 1,
    border: "none",
    padding: "12px 0",
    fontSize: 14,
    fontWeight: 600,
    color: "#111827",
    outline: "none",
    background: "transparent",
    cursor: "pointer"
  },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 },
  modalFooter: { 
    padding: "24px 32px", 
    borderTop: "1px solid #f3f4f6", 
    display: "flex", 
    justifyContent: "flex-end", 
    gap: 12,
    background: "#f9fafb"
  },
  btnSecondary: { 
    padding: "12px 24px", 
    borderRadius: 12, 
    border: "1px solid #e5e7eb", 
    background: "#fff", 
    cursor: "pointer", 
    fontWeight: 700, 
    color: "#4b5563",
    fontSize: 14
  },
  btnPrimary: { 
    padding: "12px 24px", 
    borderRadius: 12, 
    border: "none", 
    background: "#2c5530", 
    color: "#fff", 
    cursor: "pointer", 
    fontWeight: 700,
    fontSize: 14,
    boxShadow: "0 4px 12px rgba(44, 85, 48, 0.2)"
  },
};

// --- Helper Components ---

function SummaryCard({ title, value, hint, icon, color, bg, onClick }) {
  const [hovered, setHovered] = useState(false);
  
  return (
    <div 
      style={{
        ...styles.summaryCard,
        transform: hovered ? "translateY(-6px)" : "none",
        boxShadow: hovered ? "0 20px 40px rgba(0,0,0,0.06)" : styles.summaryCard.boxShadow,
        borderColor: hovered ? "rgba(44, 85, 48, 0.2)" : styles.summaryCard.border
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      <div style={{ ...styles.iconBox, background: bg, color: color, transform: hovered ? "scale(1.1)" : "none" }}>
        {icon}
      </div>
      <div style={styles.cardText}>
        <p style={styles.cardLabel}>{title}</p>
        <p style={styles.cardValue}>{value}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <p style={styles.cardHint}>{hint}</p>
          {hovered && <ChevronRight size={14} color="#9ca3af" />}
        </div>
      </div>
    </div>
  );
}

function ActionButton({ label, icon, onClick, path }) {
  const [hovered, setHovered] = useState(false);
  
  const content = (
    <button 
      style={{
        ...styles.actionButton,
        width: "100%",
        transform: hovered ? "translateY(-4px)" : "none",
        border: hovered ? "1px solid rgba(44, 85, 48, 0.2)" : styles.actionButton.border,
        boxShadow: hovered ? "0 10px 20px rgba(0,0,0,0.04)" : styles.actionButton.boxShadow,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      <div style={{ color: "#2c5530", opacity: hovered ? 1 : 0.7, transition: "all 0.2s" }}>
        {icon}
      </div>
      <span style={styles.actionText}>{label}</span>
    </button>
  );

  if (path) {
    return (
      <Link to={path} style={{ textDecoration: "none" }}>
        {content}
      </Link>
    );
  }

  return content;
}
