// src/pages/manager/attendance/AttendanceList.jsx
import React, { useEffect, useMemo, useState } from "react";
import AppLayout from "../../../components/layout/AppLayout";
import { Modal } from "../../../components/common/Modal";
import WorkDetailsForm from "./WorkDetailsForm";
import { getEmployeesApi, getDepartmentsApi, getEmployeeAttendanceStatsApi } from "../../../services/managerEmployeeService";

// Dummy employees (replace with DB)
// Dummy employees (replaced with DB)
// const employeesData = ...

// Dummy work details (WORKDETAIL table shape)
const workDetailsDummy = [
  {
    workDetailID: "WD20251010-EMP002-001",
    employeeID: "EMP002",
    date: "2025-10-10",
    taskDescription: "Peeled coconuts",
    quantity: 120,
    hoursWorked: 7.5,
  },
  {
    workDetailID: "WD20251010-EMP002-002",
    employeeID: "EMP003",
    date: "2025-10-10",
    taskDescription: "Packed bottles",
    quantity: 55,
    hoursWorked: 2.0,
  },
  {
    workDetailID: "WD20251011-EMP002-001",
    employeeID: "EMP004",
    date: "2025-10-11",
    taskDescription: "Cleaning area",
    quantity: 1,
    hoursWorked: 1.5,
  },
];

export default function AttendanceList() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");

  // selected employee (for work dashboard)
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // formatted attendance for selected employee
  const [attendanceStats, setAttendanceStats] = useState({ checkIn: "-", checkOut: "-" });

  // date filter for work details dashboard
  const [workDate, setWorkDate] = useState(() => new Date().toISOString().slice(0, 10));

  // work details data
  const [workDetails, setWorkDetails] = useState([]);

  // modal for add work
  const [showModal, setShowModal] = useState(false);

  // Fetch attendance stats when selectedEmployee changes is handled separately
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
    (async () => {
      try {
        // Fetch departments for mapping
        let depts = [];
        try {
          const dRes = await getDepartmentsApi();
          depts = Array.isArray(dRes) ? dRes : dRes.departments || [];
        } catch (e) {
          console.error("Failed departments", e);
        }
        const deptMap = {};
        depts.forEach((d) => {
          deptMap[d.id] = d.name;
        });

        // Fetch employees
        const res = await getEmployeesApi();
        const rawEmps = Array.isArray(res) ? res : res.employees || [];

        // Map to UI
        const mapped = rawEmps.map((e) => ({
          id: e.employee_id, // use employee_id as unique key
          employeeID: e.employee_id,
          name: `${e.first_name} ${e.last_name}`,
          role: "Employee", // default role
          department: deptMap[e.department_id] || "Unknown",
          email: e.email,
          status: e.status === "ACTIVE" ? "Active" : "Inactive",
          salaryType: e.salary_type || "Monthly", // from join
          lastCheckIn: "-", // Not yet fetched/linked
          lastCheckOut: "-",
          image: "https://via.placeholder.com/64",
        }));

        setEmployees(mapped);

        // Auto-select first if available
        if (mapped.length > 0) setSelectedEmployee(mapped[0]);

      } catch (err) {
        console.error("Failed to load employees", err);
      }
    })();

    setWorkDetails(workDetailsDummy);
  }, []);

  const isDayWorker = (emp) => (emp?.salaryType || "").toLowerCase().includes("daily");

  const filteredEmployees = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter((e) => {
      const hay = `${e.employeeID} ${e.name} ${e.role} ${e.department} ${e.status} ${e.email} ${e.salaryType}`.toLowerCase();
      return hay.includes(q);
    });
  }, [employees, search]);

  // work details filtered by selected employee + date
  const selectedWorkDetails = useMemo(() => {
    if (!selectedEmployee) return [];
    return workDetails.filter(
      (w) => w.employeeID === selectedEmployee.employeeID && (!workDate || w.date === workDate)
    );
  }, [workDetails, selectedEmployee, workDate]);

  // summary cards
  const workSummary = useMemo(() => {
    const totalHours = selectedWorkDetails.reduce((sum, r) => sum + Number(r.hoursWorked || 0), 0);
    const totalQty = selectedWorkDetails.reduce((sum, r) => sum + Number(r.quantity || 0), 0);
    const tasks = selectedWorkDetails.length;

    return { totalHours, totalQty, tasks };
  }, [selectedWorkDetails]);

  const openAddWork = () => {
    if (!selectedEmployee || !isDayWorker(selectedEmployee)) return;
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  // demo: add new work detail to local state (later replace with API)
  const handleSaveWorkDetail = (payload) => {
    setWorkDetails((prev) => [payload, ...prev]);
  };

  return (
    <AppLayout>
      <style>{animations}</style>

      {/* Header */}
      <div style={ui.pageHeader}>
        <div>
          <h1 style={ui.pageTitle}>Attendance Management</h1>
          <p style={ui.pageSubTitle}>
            Select a daily wage worker to view and manage daily work details.
          </p>
        </div>

        <div style={ui.topActions}>
          <div style={ui.searchWrap}>
            <span style={ui.searchIcon}>⌕</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID, name, department..."
              style={ui.searchInput}
            />
          </div>
        </div>
      </div>

      {/* Selected Employee Card + Work Details Dashboard */}
      <div style={ui.grid2}>
        {/* Selected Employee */}
        <div style={ui.card}>
          <div style={ui.cardHeaderRow}>
            <h2 style={ui.cardTitle}>Selected Employee</h2>
            {selectedEmployee ? (
              <span style={selectedEmployee.status === "Active" ? ui.badgeActive : ui.badgeInactive}>
                {selectedEmployee.status}
              </span>
            ) : null}
          </div>

          {!selectedEmployee ? (
            <div style={ui.emptyBox}>Select an employee from the list below.</div>
          ) : (
            <div style={ui.profileWrap}>
              <img src={selectedEmployee.image} alt="" style={ui.profileAvatar} />
              <div style={{ flex: 1 }}>
                <div style={ui.profileName}>{selectedEmployee.name}</div>
                <div style={ui.profileMeta}>
                  {selectedEmployee.role} • {selectedEmployee.department}
                </div>

                <div style={ui.profileGrid}>
                  <InfoBox label="EMPLOYEE ID" value={selectedEmployee.employeeID} />
                  <InfoBox label="SALARY TYPE" value={selectedEmployee.salaryType} />
                  <InfoBox label="EMAIL" value={selectedEmployee.email} />
                  <InfoBox label="LAST CHECK-IN" value={attendanceStats.checkIn} />
                  <InfoBox label="LAST CHECK-OUT" value={attendanceStats.checkOut} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Work Details Dashboard (only daily workers) */}
        <div style={ui.card}>
          <div style={ui.cardHeaderRow}>
            <h2 style={ui.cardTitle}>Work Details</h2>

            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <input
                type="date"
                value={workDate}
                onChange={(e) => setWorkDate(e.target.value)}
                style={ui.dateInput}
              />

              <button
                style={
                  selectedEmployee && isDayWorker(selectedEmployee)
                    ? ui.primaryBtnSmall
                    : ui.disabledBtnSmall
                }
                disabled={!selectedEmployee || !isDayWorker(selectedEmployee)}
                onClick={openAddWork}
                title={!selectedEmployee ? "Select an employee" : "Only for Daily Wage workers"}
              >
                + Add Work
              </button>
            </div>
          </div>

          {!selectedEmployee ? (
            <div style={ui.emptyBox}>Select an employee to view work details.</div>
          ) : !isDayWorker(selectedEmployee) ? (
            <div style={ui.infoBoxBlue}>
              Work Details are available only for <b>Daily Wage</b> employees.
            </div>
          ) : (
            <>
              {/* Summary cards */}
              <div style={ui.summaryRow}>
                <SummaryCard label="Total Hours" value={workSummary.totalHours.toFixed(2)} />
                <SummaryCard label="Total Quantity" value={workSummary.totalQty} />
                <SummaryCard label="Tasks" value={workSummary.tasks} />
              </div>

              {/* Work details table */}
              <div style={ui.tableWrap}>
                <table style={ui.table}>
                  <thead>
                    <tr>
                      <th style={ui.th}>DATE</th>
                      <th style={ui.th}>TASK</th>
                      <th style={ui.th}>QUANTITY</th>
                      <th style={ui.th}>HOURS</th>
                      <th style={{ ...ui.th, textAlign: "right" }}>ACTIONS</th>
                    </tr>
                  </thead>

                  <tbody>
                    {selectedWorkDetails.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={ui.emptyCell}>
                          No work details found for this date.
                        </td>
                      </tr>
                    ) : (
                      selectedWorkDetails.map((w) => (
                        <tr key={w.workDetailID} style={ui.tr}>
                          <td style={ui.td}>{w.date}</td>
                          <td style={ui.td}>
                            <div style={{ fontWeight: 800, color: "#1e293b" }}>{w.taskDescription}</div>
                            <div style={ui.subTextSmall}>{w.workDetailID}</div>
                          </td>
                          <td style={ui.td}>{w.quantity}</td>
                          <td style={ui.td}>{w.hoursWorked}</td>
                          <td style={{ ...ui.td, textAlign: "right" }}>
                            <div style={ui.actionRow}>
                              <button
                                style={ui.lightBtn}
                                onClick={() => alert("Edit (later)")}
                              >
                                Edit
                              </button>
                              <button
                                style={ui.dangerOutlineBtn}
                                onClick={() => alert("Delete (later)")}
                              >
                                Delete
                              </button>
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

      {/* Employee List */}
      <div style={{ ...ui.card, marginTop: 24 }}>
        <div style={ui.cardHeaderRow}>
          <h2 style={ui.cardTitle}>Employee List</h2>
          <div style={ui.countPill}>{filteredEmployees.length} employees</div>
        </div>

        <div style={ui.tableWrap}>
          <table style={ui.table}>
            <thead>
              <tr>
                <th style={ui.th}>ID</th>
                <th style={ui.th}>NAME</th>
                <th style={ui.th}>ROLE</th>
                <th style={ui.th}>DEPARTMENT</th>
                <th style={ui.th}>STATUS</th>
                <th style={ui.th}>SALARY TYPE</th>
                <th style={{ ...ui.th, textAlign: "right" }}>ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={7} style={ui.emptyCell}>
                    No employees found.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => {
                  const selected = selectedEmployee?.id === emp.id;
                  return (
                    <tr
                      key={emp.id}
                      style={selected ? ui.selectedRow : ui.tr}
                      onClick={() => setSelectedEmployee(emp)}
                    >
                      <td style={ui.td}>{emp.id}</td>
                      <td style={ui.td}>
                        <div style={ui.nameCell}>
                          <img src={emp.image} alt="" style={ui.avatar} />
                          <div>
                            <div style={ui.nameText}>{emp.name}</div>
                            <div style={ui.subText}>{emp.email}</div>
                            <div style={ui.miniMeta}>
                              <span style={ui.miniTag}>{emp.employeeID}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={ui.td}>{emp.role}</td>
                      <td style={ui.td}>{emp.department}</td>
                      <td style={ui.td}>
                        <span style={emp.status === "Active" ? ui.badgeActive : ui.badgeInactive}>
                          {emp.status}
                        </span>
                      </td>
                      <td style={ui.td}>{emp.salaryType}</td>
                      <td style={{ ...ui.td, textAlign: "right" }}>
                        <div style={ui.actionRow}>
                          <button
                            style={selected ? ui.primaryBtnSmall : ui.lightBtn}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEmployee(emp);
                            }}
                          >
                            {selected ? "Selected" : "Select"}
                          </button>

                          {isDayWorker(emp) ? (
                            <button
                              style={ui.darkBtn}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEmployee(emp);
                              }}
                            >
                              Work
                            </button>
                          ) : (
                            <button style={ui.disabledBtn} disabled>
                              Work
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Work Modal */}
      {showModal && selectedEmployee && (
        <Modal onClose={closeModal}>
          <WorkDetailsForm
            employeeID={selectedEmployee.employeeID}
            employeeName={selectedEmployee.name}
            defaultDate={workDate}
            onClose={closeModal}
            onSave={handleSaveWorkDetail}
          />
        </Modal>
      )}
    </AppLayout>
  );
}

function InfoBox({ label, value }) {
  return (
    <div style={ui.infoBox}>
      <div style={ui.infoLabel}>{label}</div>
      <div style={ui.infoValue}>{value}</div>
    </div>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div style={ui.summaryCard}>
      <div style={ui.summaryValue}>{value}</div>
      <div style={ui.summaryLabel}>{label}</div>
    </div>
  );
}

// -- STYLES --
const animations = `
  @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
`;

const ui = {
  // Page Header with Green Gradient
  pageHeader: {
    background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.98) 100%)",
    padding: "24px 32px",
    borderRadius: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    border: "1px solid rgba(74, 124, 78, 0.1)",
    boxShadow: "0 8px 24px rgba(74, 124, 78, 0.08)",
    backdropFilter: "blur(10px)",
    animation: "fadeIn 0.4s ease-out",
    flexWrap: "wrap",
    gap: "16px",
  },
  pageTitle: { margin: 0, fontSize: "28px", fontWeight: 700, color: "#2c5530", letterSpacing: "-0.5px" },
  pageSubTitle: { margin: "4px 0 0", color: "#6b7280", fontSize: "14px", fontWeight: 500 },

  topActions: { display: "flex", alignItems: "center", gap: 12 },
  searchWrap: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "#f9fafb",
    border: "2px solid rgba(229, 231, 235, 0.5)",
    borderRadius: "12px",
    padding: "10px 16px",
    minWidth: "280px",
    transition: "all 0.2s ease",
  },
  searchIcon: { fontSize: 16, color: "#6b7280" },
  searchInput: {
    border: "none",
    outline: "none",
    background: "transparent",
    width: "100%",
    fontSize: "14px",
    color: "#1f2937",
    fontWeight: "500",
  },

  // Layout Grid
  grid2: { display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: 24 },

  // Cards (Glass/White style)
  card: {
    background: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(10px)",
    borderRadius: "18px",
    border: "1px solid rgba(74, 124, 78, 0.1)",
    boxShadow: "0 8px 24px rgba(74, 124, 78, 0.08)",
    overflow: "hidden",
    animation: "fadeIn 0.5s ease-out",
  },
  cardHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "18px 24px",
    borderBottom: "1px solid rgba(74, 124, 78, 0.1)",
    background: "rgba(74, 124, 78, 0.04)",
    gap: 12,
  },
  cardTitle: { margin: 0, fontSize: "16px", fontWeight: 700, color: "#2c5530" },
  countPill: {
    background: "#f1f5f9",
    color: "#64748b",
    padding: "6px 14px",
    borderRadius: 999,
    fontSize: "12px",
    fontWeight: 800,
  },

  // Badges
  badgeActive: {
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: "11px",
    fontWeight: 800,
    background: "rgba(74, 124, 78, 0.15)",
    color: "#166534",
    border: "1px solid rgba(74, 124, 78, 0.2)",
  },
  badgeInactive: {
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: "11px",
    fontWeight: 800,
    background: "#fee2e2",
    color: "#991b1b",
    border: "1px solid #fecaca",
  },

  // Profile Section
  profileWrap: { display: "flex", gap: 20, padding: "24px" },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: "20px",
    border: "1px solid rgba(74, 124, 78, 0.1)",
    objectFit: "cover",
    background: "rgba(74, 124, 78, 0.05)",
  },
  profileName: { fontSize: "20px", fontWeight: 900, color: "#1e293b" },
  profileMeta: { marginTop: 4, fontSize: "13px", color: "#64748b", fontWeight: 600 },
  profileGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    marginTop: 16,
  },

  // Info Box
  infoBox: {
    background: "rgba(74, 124, 78, 0.04)",
    border: "1px solid rgba(74, 124, 78, 0.1)",
    borderRadius: "12px",
    padding: "10px 14px",
  },
  infoLabel: { fontSize: "10px", color: "#94a3b8", fontWeight: 800, letterSpacing: 0.5, textTransform: "uppercase" },
  infoValue: { marginTop: 4, fontSize: "13px", color: "#334155", fontWeight: 700 },

  // Inputs & Buttons
  dateInput: {
    padding: "8px 12px",
    borderRadius: "10px",
    border: "1px solid rgba(74, 124, 78, 0.2)",
    outline: "none",
    background: "#fff",
    fontWeight: 600,
    fontSize: "13px",
    color: "#2c5530",
  },
  primaryBtnSmall: {
    background: "linear-gradient(135deg, #4a7c4e 0%, #5a8c5e 100%)",
    color: "#fff",
    border: "none",
    padding: "8px 16px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "13px",
    boxShadow: "0 4px 12px rgba(74, 124, 78, 0.2)",
    transition: "all 0.2s",
  },
  disabledBtnSmall: {
    background: "#e2e8f0",
    color: "#94a3b8",
    border: "none",
    padding: "8px 16px",
    borderRadius: "10px",
    cursor: "not-allowed",
    fontWeight: 700,
    fontSize: "13px",
  },

  // Summary Cards
  summaryRow: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, padding: "24px" },
  summaryCard: {
    background: "rgba(74, 124, 78, 0.05)",
    border: "1px solid rgba(74, 124, 78, 0.15)",
    borderRadius: "16px",
    padding: "16px",
    textAlign: "center",
  },
  summaryLabel: { fontSize: "11px", color: "#4a7c4e", fontWeight: 700, marginTop: 4, textTransform: "uppercase" },
  summaryValue: { fontSize: "22px", fontWeight: 900, color: "#166534" },

  infoBoxBlue: {
    margin: 24,
    background: "rgba(74, 124, 78, 0.05)",
    border: "1px dashed rgba(74, 124, 78, 0.2)",
    borderRadius: "12px",
    padding: "16px",
    color: "#2c5530",
    fontWeight: 500,
    fontSize: "13px",
    textAlign: "center",
  },

  // Table
  tableWrap: { width: "100%", overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    textAlign: "left",
    padding: "14px 24px",
    fontSize: "11px",
    fontWeight: 700,
    color: "#4a7c4e",
    background: "rgba(74, 124, 78, 0.04)",
    textTransform: "uppercase",
    borderBottom: "1px solid rgba(74, 124, 78, 0.1)",
    letterSpacing: "0.5px",
  },
  td: {
    padding: "16px 24px",
    borderBottom: "1px solid rgba(74, 124, 78, 0.1)",
    verticalAlign: "middle",
    color: "#1f2937",
    fontSize: "14px",
    fontWeight: 500,
  },
  tr: { transition: "background 0.2s", cursor: "pointer" },
  selectedRow: {
    background: "rgba(74, 124, 78, 0.08)",
  },
  emptyCell: { padding: 40, textAlign: "center", color: "#94a3b8", fontSize: "13px" },

  // Actions
  actionRow: { display: "flex", justifyContent: "flex-end", gap: 8, flexWrap: "wrap" },
  darkBtn: {
    background: "linear-gradient(135deg, #4a7c4e 0%, #5a8c5e 100%)",
    color: "#fff",
    border: "none",
    padding: "6px 14px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "12px",
    boxShadow: "0 2px 8px rgba(74, 124, 78, 0.2)",
  },
  lightBtn: {
    background: "#fff",
    color: "#2c5530",
    border: "1px solid rgba(74, 124, 78, 0.2)",
    padding: "6px 14px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "12px",
  },
  disabledBtn: {
    background: "#f1f5f9",
    color: "#cbd5e1",
    border: "1px solid #f1f5f9",
    padding: "6px 12px",
    borderRadius: "8px",
    cursor: "not-allowed",
    fontWeight: 700,
    fontSize: "12px",
  },
  dangerOutlineBtn: {
    background: "#fff",
    color: "#b91c1c",
    border: "1px solid #fecaca",
    padding: "6px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "12px",
  },

  // Inner Components
  nameCell: { display: "flex", alignItems: "center", gap: 14, minWidth: 240 },
  avatar: { width: 40, height: 40, borderRadius: "10px", objectFit: "cover", background: "#e2e8f0" },
  nameText: { fontWeight: 800, fontSize: "14px", color: "#1e293b" },
  subText: { fontSize: "12px", color: "#64748b", marginTop: 2 },
  subTextSmall: { fontSize: "11px", color: "#94a3b8", marginTop: 2 },
  miniMeta: { display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 },
  miniTag: { fontSize: "10px", padding: "2px 6px", borderRadius: 4, background: "#f1f5f9", color: "#64748b", fontWeight: 700 },

  emptyBox: { padding: 40, textAlign: "center", color: "#94a3b8", fontWeight: 600, fontSize: "14px" },
};