// src/pages/manager/attendance/AttendanceList.jsx
import React, { useEffect, useMemo, useState } from "react";
import AppLayout from "../../../components/layout/AppLayout";
import { Modal } from "../../../components/common/Modal";
import WorkDetailsForm from "./WorkDetailsForm";
import { 
  getEmployeesApi, 
  getDepartmentsApi, 
  getEmployeeAttendanceStatsApi 
} from "../../../services/managerEmployeeService";
import { getEmployeeWorkLogsApi } from "../../../services/workLogService";
import { 
  Search, 
  User, 
  Calendar, 
  Briefcase, 
  Clock, 
  Plus, 
  ChevronRight, 
  Info, 
  LayoutDashboard,
  CheckCircle2,
  AlertCircle,
  Mail,
  Fingerprint,
  TrendingUp,
  FileText,
  Trash2,
  Edit3
} from "lucide-react";

export default function AttendanceList() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [attendanceStats, setAttendanceStats] = useState({ checkIn: "-", checkOut: "-" });
  const [workDate, setWorkDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [workDetails, setWorkDetails] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedEmployee) {
      setAttendanceStats({ checkIn: "-", checkOut: "-" });
      return;
    }

    (async () => {
      try {
        const res = await getEmployeeAttendanceStatsApi(selectedEmployee.employeeID);
        const record = res.attendance;
        if (record) {
          setAttendanceStats({
            checkIn: record.check_in ? record.check_in.slice(0, 5) : "-",
            checkOut: record.check_out ? record.check_out.slice(0, 5) : "-",
          });
        } else {
          setAttendanceStats({ checkIn: "-", checkOut: "-" });
        }
      } catch (err) {
        console.error("Failed to fetch attendance stats", err);
        setAttendanceStats({ checkIn: "-", checkOut: "-" });
      }
    })();
  }, [selectedEmployee]);

  useEffect(() => {
    if (!selectedEmployee) {
      setWorkDetails([]);
      return;
    }

    (async () => {
      try {
        const res = await getEmployeeWorkLogsApi(selectedEmployee.employeeID, workDate);
        setWorkDetails(res.logs || []);
      } catch (err) {
        console.error("Failed to fetch work logs", err);
        setWorkDetails([]);
      }
    })();
  }, [selectedEmployee, workDate]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        let depts = [];
        try {
          const dRes = await getDepartmentsApi();
          depts = Array.isArray(dRes) ? dRes : dRes.departments || [];
        } catch (e) {
          console.error("Failed departments", e);
        }
        const deptMap = {};
        depts.forEach((d) => { deptMap[d.id] = d.name; });

        const res = await getEmployeesApi();
        const rawEmps = Array.isArray(res) ? res : res.employees || [];

        const mapped = rawEmps.map((e) => ({
          id: e.employee_id,
          employeeID: e.employee_id,
          name: `${e.first_name || ""} ${e.last_name || ""}`.trim(),
          role: "Employee",
          department: deptMap[e.department_id] || "Unknown",
          email: e.email,
          status: e.status === "ACTIVE" ? "Active" : "Inactive",
          salaryType: e.salary_type || "Monthly",
          lastCheckIn: "-",
          lastCheckOut: "-",
        }));

        setEmployees(mapped);
        if (mapped.length > 0) setSelectedEmployee(mapped[0]);
      } catch (err) {
        console.error("Failed to load employees", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const isDayWorker = (emp) => (emp?.salaryType || "").toLowerCase().includes("daily");

  const filteredEmployees = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter((e) => {
      const hay = `${e.employeeID} ${e.name} ${e.department} ${e.status} ${e.salaryType}`.toLowerCase();
      return hay.includes(q);
    });
  }, [employees, search]);

  const workSummary = useMemo(() => {
    const totalQty = workDetails.reduce((sum, r) => sum + Number(r.quantity || 0), 0);
    const totalValue = workDetails.reduce((sum, r) => sum + Number(r.total_amount || 0), 0);
    const tasks = workDetails.length;
    return { totalQty, totalValue, tasks };
  }, [workDetails]);

  const openAddWork = () => {
    if (!selectedEmployee || !isDayWorker(selectedEmployee)) return;
    setShowModal(true);
  };

  const handleSaveWorkDetail = async () => {
    try {
      const res = await getEmployeeWorkLogsApi(selectedEmployee.employeeID, workDate);
      setWorkDetails(res.logs || []);
    } catch (err) {
      console.error("Failed to refresh logs", err);
    }
  };

  return (
    <AppLayout>
      <div style={styles.page}>
        <style>{`
          .fade-in { animation: fadeIn 0.4s ease-out forwards; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          .table-row:hover { background: #f8fafc !important; }
          .scroll-custom::-webkit-scrollbar { width: 6px; }
          .scroll-custom::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        `}</style>

        <div style={styles.container}>
          {/* Header */}
          <div style={styles.pageHeader}>
            <div>
              <div style={styles.breadcrumb}>Manager / Attendance & Work Management</div>
              <h1 style={styles.pageTitle}>Log & Monitor Output</h1>
              <p style={styles.pageSubtitle}>Manage daily work logs for workers and track attendance stats</p>
            </div>
            <div style={styles.searchWrap}>
              <Search size={18} style={styles.searchIcon} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search employees..."
                style={styles.searchInput}
              />
            </div>
          </div>

          <div style={styles.grid2}>
            {/* LEFT: Selected Employee Details */}
            <div style={styles.card} className="fade-in">
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>Personnel Profile</h3>
                {selectedEmployee && (
                  <span style={selectedEmployee.status === "Active" ? styles.badgeActive : styles.badgeInactive}>
                    {selectedEmployee.status}
                  </span>
                )}
              </div>

              {!selectedEmployee ? (
                <div style={styles.emptyState}>
                  <User size={48} style={{ color: "#e2e8f0", marginBottom: "12px" }} />
                  <p>Select an employee to view details</p>
                </div>
              ) : (
                <>
                  <div style={styles.profileSection}>
                    <div style={styles.profileAvatar}>
                      {selectedEmployee.name?.[0] || <User size={32} />}
                    </div>
                    <div style={styles.profileInfo}>
                      <h2 style={styles.profileName}>{selectedEmployee.name}</h2>
                      <p style={styles.profileMeta}>{selectedEmployee.department} • {selectedEmployee.role}</p>
                    </div>
                  </div>

                  <div style={{ padding: "0 24px 24px" }}>
                    <div style={styles.infoGrid}>
                      <InfoItem icon={<Fingerprint size={14} />} label="EMP ID" value={selectedEmployee.employeeID} />
                      <InfoItem icon={<Briefcase size={14} />} label="CONTRACT" value={selectedEmployee.salaryType} />
                      <InfoItem icon={<Clock size={14} />} label="CHECK-IN" value={attendanceStats.checkIn} />
                      <InfoItem icon={<Clock size={14} />} label="CHECK-OUT" value={attendanceStats.checkOut} />
                      <div style={{ gridColumn: "span 2" }}>
                        <InfoItem icon={<Mail size={14} />} label="EMAIL ADDRESS" value={selectedEmployee.email} />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* LIST BELOW PROFILE (INTERNAL) */}
              <div style={{ borderTop: "1px solid #f1f5f9", flex: 1, display: "flex", flexDirection: "column" }}>
                <div style={{ padding: "16px 24px", background: "#f8fafc", fontSize: "12px", fontWeight: 800, color: "#94a3b8", display: "flex", justifyContent: "space-between" }}>
                  MATCHING EMPLOYEES <span>{filteredEmployees.length}</span>
                </div>
                <div style={{ flex: 1, overflowY: "auto", maxHeight: "400px" }} className="scroll-custom">
                  {loading ? (
                    <div style={{ padding: "20px", textAlign: "center", color: "#94a3b8" }}>Loading...</div>
                  ) : filteredEmployees.map(emp => (
                    <div 
                      key={emp.id} 
                      onClick={() => setSelectedEmployee(emp)}
                      style={{
                        padding: "12px 24px",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        cursor: "pointer",
                        borderBottom: "1px solid #f1f5f9",
                        background: selectedEmployee?.id === emp.id ? "#ecfdf5" : "transparent",
                        transition: "all 0.2s"
                      }}
                      className="table-row"
                    >
                      <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 800, color: "#475569" }}>
                        {emp.name[0]}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "#1e293b" }}>{emp.name}</div>
                        <div style={{ fontSize: "11px", color: "#94a3b8" }}>{emp.employeeID} • {emp.salaryType}</div>
                      </div>
                      <ChevronRight size={16} color={selectedEmployee?.id === emp.id ? "#059669" : "#e2e8f0"} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT: Work Dashboard */}
            <div style={styles.card} className="fade-in">
              <div style={styles.cardHeader}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <LayoutDashboard size={20} color="#2c5530" />
                  <h3 style={styles.cardTitle}>Daily Work Dashboard</h3>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                   <input
                    type="date"
                    value={workDate}
                    onChange={(e) => setWorkDate(e.target.value)}
                    style={styles.dateInput}
                  />
                  <button
                    onClick={openAddWork}
                    style={selectedEmployee && isDayWorker(selectedEmployee) ? styles.btnPrimary : styles.btnDisabled}
                    disabled={!selectedEmployee || !isDayWorker(selectedEmployee)}
                  >
                    <Plus size={16} /> Log Work
                  </button>
                </div>
              </div>

              {!selectedEmployee ? (
                <div style={styles.emptyState}>
                  <LayoutDashboard size={48} style={{ color: "#e2e8f0", marginBottom: "12px" }} />
                  <p>Select an employee to see work logs</p>
                </div>
              ) : !isDayWorker(selectedEmployee) ? (
                <div style={{ padding: "40px", textAlign: "center" }}>
                   <Info size={40} style={{ color: "#3b82f6", marginBottom: "16px" }} />
                   <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#1e293b", marginBottom: "8px" }}>Monthly Staff Member</h3>
                   <p style={{ color: "#64748b", fontSize: "14px", maxWidth: "300px", margin: "0 auto" }}>
                     Work logging is only available for Daily Wage workers. For monthly staff, track via regular attendance.
                   </p>
                </div>
              ) : (
                <>
                  <div style={styles.summaryRow}>
                    <div style={styles.summaryCard}>
                      <div style={styles.summaryValue}>Rs {workSummary.totalValue.toFixed(0)}</div>
                      <div style={styles.summaryLabel}>Total Output</div>
                    </div>
                    <div style={styles.summaryCard}>
                      <div style={styles.summaryValue}>{workSummary.totalQty}</div>
                      <div style={styles.summaryLabel}>Total Items</div>
                    </div>
                    <div style={styles.summaryCard}>
                      <div style={styles.summaryValue}>{workSummary.tasks}</div>
                      <div style={styles.summaryLabel}>Total Tasks</div>
                    </div>
                  </div>

                  <div style={styles.tableWrapper}>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th style={styles.th}>Task Detail</th>
                          <th style={styles.th}>Quantity</th>
                          <th style={styles.th}>Rate (LKR)</th>
                          <th style={styles.th}>Total</th>
                          <th style={{ ...styles.th, textAlign: "right" }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {workDetails.length === 0 ? (
                          <tr><td colSpan={5} style={{ textAlign: "center", padding: "60px", color: "#94a3b8", fontSize: "14px", fontWeight: 600 }}>No work logged for this date</td></tr>
                        ) : (
                          workDetails.map(w => (
                            <tr key={w.log_id} className="table-row">
                              <td style={styles.td}>
                                <div style={{ fontSize: "14px", fontWeight: 700, color: "#1e293b" }}>{w.task_name}</div>
                                <div style={{ fontSize: "11px", color: "#94a3b8" }}>Log ID: #{w.log_id}</div>
                              </td>
                              <td style={styles.td}>
                                <div style={{ fontWeight: 600 }}>{w.quantity} {w.unit_measure}</div>
                              </td>
                              <td style={styles.td}>{Number(w.applied_rate).toFixed(2)}</td>
                              <td style={{ ...styles.td, fontWeight: 800, color: "#2c5530" }}>Rs {Number(w.total_amount).toFixed(2)}</td>
                              <td style={{ ...styles.td, textAlign: "right" }}>
                               <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                                  <button style={styles.iconBtnSmall} onClick={() => alert("Edit under construction")}><Edit3 size={14} /></button>
                                  <button style={{ ...styles.iconBtnSmall, color: "#dc2626" }} onClick={() => alert("Delete under construction")}><Trash2 size={14} /></button>
                               </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {showModal && selectedEmployee && (
          <Modal onClose={() => setShowModal(false)}>
            <WorkDetailsForm
              employeeID={selectedEmployee.employeeID}
              employeeName={selectedEmployee.name}
              defaultDate={workDate}
              onClose={() => setShowModal(false)}
              onSave={handleSaveWorkDetail}
            />
          </Modal>
        )}
      </div>
    </AppLayout>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <div style={styles.infoItem}>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
        <span style={{ color: "#94a3b8" }}>{icon}</span>
        <div style={styles.infoLabel}>{label}</div>
      </div>
      <div style={styles.infoValue}>{value || "-"}</div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100%", background: "#f8fafc" },
  container: { padding: "32px", maxWidth: "1600px", margin: "0 auto" },
  breadcrumb: { fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" },
  pageHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px", gap: "24px", flexWrap: "wrap" },
  pageTitle: { margin: 0, fontSize: "32px", fontWeight: 900, color: "#1e293b", letterSpacing: "-0.02em" },
  pageSubtitle: { margin: "4px 0 0 0", fontSize: "15px", color: "#64748b", fontWeight: 500 },
  searchWrap: { position: "relative", display: "flex", alignItems: "center", width: "320px" },
  searchIcon: { position: "absolute", left: "14px", color: "#94a3b8" },
  searchInput: { height: "42px", width: "100%", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "0 14px 0 42px", fontSize: "14px", fontWeight: 600, color: "#1e293b", background: "#fff", outline: "none" },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "24px", marginBottom: "32px" },
  card: { background: "#fff", borderRadius: "24px", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.03)", border: "1px solid #f1f5f9", display: "flex", flexDirection: "column", height: "calc(100vh - 200px)", minHeight: "600px" },
  cardHeader: { padding: "20px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff" },
  cardTitle: { margin: 0, fontSize: "16px", fontWeight: 800, color: "#1e293b" },
  badgeActive: { padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: 800, background: "#ecfdf5", color: "#047857", textTransform: "uppercase" },
  badgeInactive: { padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: 800, background: "#fef2f2", color: "#b91c1c", textTransform: "uppercase" },
  profileSection: { padding: "24px", display: "flex", gap: "20px", alignItems: "center" },
  profileAvatar: { width: "70px", height: "70px", borderRadius: "18px", background: "linear-gradient(135deg, #2c5530 0%, #3a703f 100%)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", fontWeight: 900 },
  profileInfo: { flex: 1 },
  profileName: { fontSize: "20px", fontWeight: 900, color: "#1e293b", letterSpacing: "-0.01em", margin: 0 },
  profileMeta: { fontSize: "13px", color: "#64748b", fontWeight: 500, marginTop: "2px" },
  infoGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "4px" },
  infoItem: { background: "#f8fafc", borderRadius: "12px", padding: "12px 14px", border: "1px solid #f1f5f9" },
  infoLabel: { fontSize: "9px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" },
  infoValue: { fontSize: "13px", fontWeight: 700, color: "#1e293b", marginTop: "2px" },
  emptyState: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px", color: "#94a3b8", textAlign: "center" },
  dateInput: { padding: "8px 12px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "13px", fontWeight: 600, color: "#1e293b", background: "#f8fafc", outline: "none" },
  btnPrimary: { display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px", borderRadius: "10px", background: "#2c5530", color: "#fff", border: "none", fontWeight: 700, fontSize: "13px", cursor: "pointer", boxShadow: "0 4px 12px rgba(44, 85, 48, 0.2)" },
  btnDisabled: { display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px", borderRadius: "10px", background: "#f1f5f9", color: "#94a3b8", border: "none", fontWeight: 700, fontSize: "13px", cursor: "not-allowed" },
  summaryRow: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", padding: "24px" },
  summaryCard: { background: "#fff", borderRadius: "16px", padding: "16px", textAlign: "center", border: "1px solid #f1f5f9", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" },
  summaryValue: { fontSize: "18px", fontWeight: 900, color: "#1e293b" },
  summaryLabel: { fontSize: "10px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", marginTop: "4px" },
  tableWrapper: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "14px 24px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", background: "#f8fafc" },
  td: { padding: "16px 24px", fontSize: "14px", color: "#475569", borderBottom: "1px solid #f1f5f9" },
  iconBtnSmall: { width: "30px", height: "30px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#64748b" },
};