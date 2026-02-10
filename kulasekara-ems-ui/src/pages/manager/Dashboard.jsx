import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../components/layout/AppLayout";
import { getEmployeesApi, getDashboardStatsApi } from "../../services/managerEmployeeService";
import { markAttendanceApi } from "../../services/managerAttendanceService";

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

  // Fetch stats on mount
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

  // Fetch employees when modal opens
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

  const handleAttChange = (e) => {
    const { name, value } = e.target;
    setAttForm((p) => ({ ...p, [name]: value }));
  };

  const submitAttendance = async () => {
    if (!attForm.employee_id) return alert("Please select an employee");
    if (!attForm.date) return alert("Please select a date");

    try {
      await markAttendanceApi(attForm);
      alert("Attendance marked successfully!");
      setIsAttModalOpen(false);
      // Reset form
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
          <div className="floating-circle fc-1"></div>
          <div className="floating-circle fc-2"></div>
          <div className="floating-circle fc-3"></div>

          <div style={styles.container}>
            {/* Page Header */}
            <div style={styles.pageHeader}>
              <div>
                <h1 style={styles.pageTitle}>Manager Dashboard</h1>
                <p style={styles.pageSubtitle}>Overview of your team and operations</p>
              </div>

              <div style={styles.headerActions}>
                <div style={styles.dateBadge}>
                  <svg style={styles.dateIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="16" y1="2" x2="16" y2="6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="8" y1="2" x2="8" y2="6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="3" y1="10" x2="21" y2="10" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div style={styles.cardGrid}>
              <div
                className="card-1"
                style={{
                  ...styles.summaryCard,
                  ...(hoveredCard === 1 ? styles.summaryCardHover : {}),
                }}
                onMouseEnter={() => setHoveredCard(1)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div style={{ ...styles.iconBox, background: "linear-gradient(135deg, #4a7c4e 0%, #5a8c5e 100%)" }}>
                  <svg style={styles.cardIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div style={styles.cardText}>
                  <p style={styles.cardLabel}>Total Employees</p>
                  <p style={styles.cardValue}>{stats?.activeCount || 0}</p>
                  <p style={styles.cardHint}>Active members</p>
                </div>
              </div>

              <div
                className="card-2"
                style={{
                  ...styles.summaryCard,
                  ...(hoveredCard === 2 ? styles.summaryCardHover : {}),
                }}
                onMouseEnter={() => setHoveredCard(2)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div style={{ ...styles.iconBox, background: "linear-gradient(135deg, #5a8c5e 0%, #81c784 100%)" }}>
                  <svg style={styles.cardIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div style={styles.cardText}>
                  <p style={styles.cardLabel}>Attendance Today</p>
                  <p style={styles.cardValue}>40</p>
                  <p style={styles.cardHint}>72% present</p>
                </div>
              </div>

              <div
                className="card-3"
                style={{
                  ...styles.summaryCard,
                  ...(hoveredCard === 3 ? styles.summaryCardHover : {}),
                }}
                onMouseEnter={() => setHoveredCard(3)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div style={{ ...styles.iconBox, background: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)" }}>
                  <svg style={styles.cardIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div style={styles.cardText}>
                  <p style={styles.cardLabel}>Payroll Pending</p>
                  <p style={styles.cardValue}>5</p>
                  <p style={styles.cardHint}>Awaiting approval</p>
                </div>
              </div>

              <div
                className="card-4"
                style={{
                  ...styles.summaryCard,
                  ...(hoveredCard === 4 ? styles.summaryCardHover : {}),
                }}
                onMouseEnter={() => setHoveredCard(4)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div style={{ ...styles.iconBox, background: "linear-gradient(135deg, #ef4444 0%, #f87171 100%)" }}>
                  <svg style={styles.cardIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div style={styles.cardText}>
                  <p style={styles.cardLabel}>Issues Reported</p>
                  <p style={styles.cardValue}>3</p>
                  <p style={styles.cardHint}>Needs attention</p>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div style={styles.sectionGrid}>
              <div className="fade-in" style={styles.panel}>
                <div style={styles.panelHeader}>
                  <div style={styles.panelTitleSection}>
                    <svg style={styles.panelIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <h3 style={styles.panelTitle}>Payroll Summary</h3>
                  </div>
                  <span style={styles.pill}>This Month</span>
                </div>

                <div style={styles.chartArea}>
                  <div style={{ ...styles.chartPlaceholder, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.02)", borderRadius: 12 }}>
                    <span style={{ color: "#9ca3af", fontWeight: 600, fontSize: 14 }}>[ Payroll Summary Chart ]</span>
                  </div>
                  <p style={styles.chartLabel}>Monthly payroll distribution</p>
                </div>
              </div>

              <div className="fade-in" style={styles.panel}>
                <div style={styles.panelHeader}>
                  <div style={styles.panelTitleSection}>
                    <svg style={styles.panelIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                    <h3 style={styles.panelTitle}>Attendance Trends</h3>
                  </div>
                  <span style={styles.pillBlue}>Last 30 Days</span>
                </div>

                <div style={styles.chartArea}>
                  <div style={{ ...styles.chartPlaceholder, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.02)", borderRadius: 12 }}>
                    <span style={{ color: "#9ca3af", fontWeight: 600, fontSize: 14 }}>[ Attendance Trends Chart ]</span>
                  </div>
                  <p style={styles.chartLabel}>Daily attendance percentage</p>
                </div>
              </div>
            </div>

            {/* Quick Actions Section */}
            <div className="fade-in" style={styles.quickActionsPanel}>
              <div style={styles.panelHeader}>
                <div style={styles.panelTitleSection}>
                  <svg style={styles.panelIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <h3 style={styles.panelTitle}>Quick Actions</h3>
                </div>
              </div>

              <div style={styles.quickActionsGrid}>
                {/* 1) Add Employee */}
                <button style={styles.actionButton} onClick={() => navigate("/manager/employees")}>
                  <svg style={styles.actionIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  <span style={styles.actionText}>Add Employee</span>
                </button>

                {/* 2) Mark Attendance */}
                <button style={styles.actionButton} onClick={() => setIsAttModalOpen(true)}>
                  <svg style={styles.actionIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  <span style={styles.actionText}>Mark Attendance</span>
                </button>

                {/* 3) Process Payroll */}
                <button style={styles.actionButton} onClick={() => navigate("/manager/payroll")}>
                  <svg style={styles.actionIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span style={styles.actionText}>Process Payroll</span>
                </button>

                {/* 4) Generate Report */}
                <button style={styles.actionButton} onClick={() => navigate("/manager/reports")}>
                  <svg style={styles.actionIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span style={styles.actionText}>Generate Report</span>
                </button>
              </div>
            </div>
          </div>

          {/* ATTENDANCE MODAL */}
          {isAttModalOpen && (
            <div style={styles.modalOverlay} onClick={() => setIsAttModalOpen(false)}>
              <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div style={styles.modalHeader}>
                  <h3 style={styles.modalTitle}>Mark Attendance</h3>
                  <button style={styles.iconBtn} onClick={() => setIsAttModalOpen(false)}>✕</button>
                </div>
                <div style={styles.modalBody}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Employee</label>
                    <select
                      name="employee_id"
                      value={attForm.employee_id}
                      onChange={handleAttChange}
                      style={styles.select}
                    >
                      <option value="">-- Select Employee --</option>
                      {employees.map((emp) => (
                        <option key={emp.employee_id} value={emp.employee_id}>
                          {emp.first_name} {emp.last_name} ({emp.employee_id})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Date</label>
                    <input
                      type="date"
                      name="date"
                      value={attForm.date}
                      onChange={handleAttChange}
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Status</label>
                    <select
                      name="status"
                      value={attForm.status}
                      onChange={handleAttChange}
                      style={styles.select}
                    >
                      <option value="PRESENT">PRESENT</option>
                      <option value="ABSENT">ABSENT</option>
                      <option value="LATE">LATE</option>
                      <option value="HALF_DAY">HALF_DAY</option>
                      <option value="LEAVE">LEAVE</option>
                    </select>
                  </div>
                  <div style={styles.row}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Check In</label>
                      <input
                        type="time"
                        name="check_in"
                        value={attForm.check_in}
                        onChange={handleAttChange}
                        style={styles.input}
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Check Out</label>
                      <input
                        type="time"
                        name="check_out"
                        value={attForm.check_out}
                        onChange={handleAttChange}
                        style={styles.input}
                      />
                    </div>
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
  // ... Keep existing styles ...
  page: { position: "relative", minHeight: "100%", overflow: "hidden" },
  container: { padding: 24, position: "relative", zIndex: 1 },

  pageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    marginBottom: 24,
  },
  pageTitle: {
    margin: 0,
    fontSize: 28,
    fontWeight: 800,
    color: "#2c5530",
  },
  pageSubtitle: {
    margin: "4px 0 0 0",
    fontSize: 14,
    color: "#4b5563",
    opacity: 0.8
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
    padding: "8px 16px",
    background: "rgba(255, 255, 255, 0.6)",
    backdropFilter: "blur(4px)",
    border: "1px solid rgba(74, 124, 78, 0.2)",
    borderRadius: 20,
    color: "#2c5530",
    fontSize: 13,
    fontWeight: 700,
  },
  dateIcon: {
    width: 16,
    height: 16,
    color: "#4a7c4e"
  },

  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 20,
    marginTop: 20,
  },
  summaryCard: {
    background: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    borderRadius: 18,
    padding: 24,
    boxShadow: "0 8px 25px rgba(0,0,0,0.03)",
    display: "flex",
    alignItems: "center",
    gap: 18,
    transition: "transform 0.2s, box-shadow 0.2s",
    cursor: "pointer",
  },
  summaryCardHover: {
    transform: "translateY(-4px)",
    boxShadow: "0 12px 32px rgba(0,0,0,0.08)",
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
    color: "#fff"
  },
  cardIcon: {
    width: 28,
    height: 28,
    color: "inherit"
  },
  cardText: {
    display: "flex",
    flexDirection: "column",
  },
  cardLabel: {
    margin: 0,
    fontSize: 12,
    fontWeight: 700,
    color: "#6b7280",
    textTransform: "uppercase",
  },
  cardValue: {
    margin: "6px 0 4px",
    fontSize: 28,
    fontWeight: 800,
    color: "#111827",
  },
  cardHint: {
    margin: 0,
    fontSize: 13,
    fontWeight: 500,
    color: "#6b7280",
  },

  sectionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
    gap: 20,
    marginTop: 24,
  },
  panel: {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    borderRadius: 18,
    padding: 24,
    boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 16,
    borderBottom: "1px solid rgba(0,0,0,0.05)",
    marginBottom: 20,
  },
  panelTitleSection: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  panelIcon: {
    width: 20,
    height: 20,
    color: "#4a7c4e",
    opacity: 0.8
  },
  panelTitle: {
    margin: 0,
    fontSize: 16,
    fontWeight: 800,
    color: "#111827",
  },
  pill: {
    padding: "6px 12px",
    borderRadius: 20,
    background: "rgba(74, 124, 78, 0.1)",
    color: "#2c5530",
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase"
  },
  pillBlue: {
    padding: "6px 12px",
    borderRadius: 20,
    background: "rgba(37, 99, 235, 0.1)",
    color: "#1d4ed8",
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase"
  },
  chartArea: {
    minHeight: 200,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  chartPlaceholder: {
    width: "100%",
    maxWidth: "280px",
    height: "auto",
    marginBottom: 16,
    opacity: 0.9
  },
  chartLabel: {
    margin: 0,
    color: "#9ca3af",
    fontSize: 13,
    fontWeight: 500,
    textAlign: "center",
  },

  quickActionsPanel: {
    marginTop: 24,
    background: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    borderRadius: 18,
    padding: 24,
    boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
  },
  quickActionsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: 16,
  },
  actionButton: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
    padding: "20px",
    background: "#fff",
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: 16,
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 4px 6px rgba(0,0,0,0.01)",
  },
  actionIcon: {
    width: 28,
    height: 28,
    color: "#4a7c4e",
    marginBottom: 4
  },
  actionText: {
    fontSize: 13,
    fontWeight: 700,
    color: "#374151",
  },

  // Modal Styles
  modalOverlay: {
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    background: "rgba(0,0,0,0.4)",
    backdropFilter: "blur(4px)",
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modal: {
    background: "#fff",
    borderRadius: 20,
    width: "90%",
    maxWidth: 500,
    boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
    animation: "fadeIn 0.2s ease-out",
  },
  modalHeader: {
    padding: "20px 24px",
    borderBottom: "1px solid #f3f4f6",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: { margin: 0, fontSize: 18, fontWeight: 700, color: "#111827" },
  iconBtn: { background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#6b7280" },
  modalBody: { padding: 24, display: "flex", flexDirection: "column", gap: 16 },
  formGroup: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 12, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em" },
  select: { padding: "10px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14, outline: "none" },
  input: { padding: "10px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14, outline: "none" },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  modalFooter: { padding: "20px 24px", borderTop: "1px solid #f3f4f6", display: "flex", justifyContent: "flex-end", gap: 12 },
  btnSecondary: { padding: "10px 20px", borderRadius: 10, border: "1px solid #d1d5db", background: "#fff", cursor: "pointer", fontWeight: 600, color: "#374151" },
  btnPrimary: { padding: "10px 20px", borderRadius: 10, border: "none", background: "#4a7c4e", color: "#fff", cursor: "pointer", fontWeight: 600 },
};
