// src/pages/manager/attendance/AttendanceList.jsx
import React, { useEffect, useMemo, useState } from "react";
import AppLayout from "../../../components/layout/AppLayout";
import { Modal } from "../../../components/common/Modal";
import WorkDetailsForm from "./WorkDetailsForm";

// Dummy employees (replace with DB)
const employeesData = [
  {
    id: 1,
    employeeID: "EMP001",
    name: "Pasindu Suranga",
    role: "Employee",
    department: "Production",
    email: "Pasindusuranga@gmail.com",
    status: "Active",
    salaryType: "Monthly",
    lastCheckIn: "08:00",
    lastCheckOut: "16:00",
    image: "https://via.placeholder.com/64",
  },
  {
    id: 2,
    employeeID: "EMP002",
    name: "Janith wickramasinghe",
    role: "Employee",
    department: "Production",
    email: "janith@gmail.com",
    status: "Active",
    salaryType: "Daily Wage",
    lastCheckIn: "08:15",
    lastCheckOut: "16:30",
    image: "https://via.placeholder.com/64",
  },
];

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

  // date filter for work details dashboard
  const [workDate, setWorkDate] = useState(() => new Date().toISOString().slice(0, 10));

  // work details data
  const [workDetails, setWorkDetails] = useState([]);

  // modal for add work
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setEmployees(employeesData);
    setWorkDetails(workDetailsDummy);

    // auto-select first employee (optional)
    setSelectedEmployee(employeesData[0] || null);
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
                  <InfoBox label="LAST CHECK-IN" value={selectedEmployee.lastCheckIn || "—"} />
                  <InfoBox label="LAST CHECK-OUT" value={selectedEmployee.lastCheckOut || "—"} />
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
    background: "linear-gradient(135deg, #4a7c4e 0%, #3d6641 100%)",
    padding: "24px 30px",
    borderRadius: "16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    color: "#fff",
    boxShadow: "0 8px 20px rgba(74, 124, 78, 0.15)",
    animation: "fadeIn 0.4s ease-out",
    flexWrap: "wrap",
    gap: "16px",
  },
  pageTitle: { margin: 0, fontSize: "24px", fontWeight: 900, letterSpacing: "-0.5px" },
  pageSubTitle: { margin: "4px 0 0", opacity: 0.9, fontSize: "14px", fontWeight: 500 },

  topActions: { display: "flex", alignItems: "center", gap: 12 },
  searchWrap: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "rgba(255, 255, 255, 0.15)",
    backdropFilter: "blur(8px)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "12px",
    padding: "10px 16px",
    minWidth: "280px",
  },
  searchIcon: { fontSize: 16, opacity: 0.8 },
  searchInput: {
    border: "none",
    outline: "none",
    background: "transparent",
    width: "100%",
    fontSize: "14px",
    color: "#fff",
    fontWeight: "600",
    placeholderColor: "rgba(255,255,255,0.7)",
  },

  // Layout Grid
  grid2: { display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: 24 },

  // Cards (Glass/White style)
  card: {
    background: "#fff",
    borderRadius: "20px",
    border: "1px solid #eef2f6",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.02)",
    overflow: "hidden",
    animation: "fadeIn 0.5s ease-out",
  },
  cardHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 24px",
    borderBottom: "1px solid #f8fafc",
    gap: 12,
  },
  cardTitle: { margin: 0, fontSize: "17px", fontWeight: 800, color: "#1e293b" },
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
    padding: "5px 12px",
    borderRadius: 999,
    fontSize: "11px",
    fontWeight: 800,
    background: "#dcfce7",
    color: "#166534",
    border: "1px solid #bbf7d0",
  },
  badgeInactive: {
    display: "inline-flex",
    alignItems: "center",
    padding: "5px 12px",
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
    border: "4px solid #f0f7f1",
    objectFit: "cover",
    background: "#f8fafc",
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
    background: "#f8fafc",
    border: "1px solid #f1f5f9",
    borderRadius: "12px",
    padding: "10px 14px",
  },
  infoLabel: { fontSize: "10px", color: "#94a3b8", fontWeight: 800, letterSpacing: 0.5, textTransform: "uppercase" },
  infoValue: { marginTop: 4, fontSize: "13px", color: "#334155", fontWeight: 700 },

  // Inputs & Buttons
  dateInput: {
    padding: "8px 12px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    outline: "none",
    background: "#fff",
    fontWeight: 700,
    fontSize: "13px",
    color: "#334155",
  },
  primaryBtnSmall: {
    background: "#4a7c4e", // Theme Green
    color: "#fff",
    border: "none",
    padding: "8px 16px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: 800,
    fontSize: "13px",
    transition: "background 0.2s",
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
    background: "#f0f7f1", // Light green bg
    border: "1px solid #dcfce7",
    borderRadius: "16px",
    padding: "16px",
    textAlign: "center",
  },
  summaryLabel: { fontSize: "11px", color: "#4a7c4e", fontWeight: 700, marginTop: 4, textTransform: "uppercase" },
  summaryValue: { fontSize: "22px", fontWeight: 900, color: "#166534" },

  infoBoxBlue: {
    margin: 24,
    background: "#eff6ff",
    border: "1px solid #dbeafe",
    borderRadius: "12px",
    padding: "16px",
    color: "#1e40af",
    fontWeight: 600,
    fontSize: "13px",
  },

  // Table
  tableWrap: { width: "100%", overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    textAlign: "left",
    padding: "14px 24px",
    fontSize: "11px",
    fontWeight: 800,
    color: "#94a3b8",
    background: "#f8fafc",
    textTransform: "uppercase",
    borderBottom: "1px solid #f1f5f9",
  },
  td: {
    padding: "16px 24px",
    borderBottom: "1px solid #f1f5f9",
    verticalAlign: "middle",
    color: "#334155",
    fontSize: "14px",
  },
  tr: { transition: "background 0.2s", cursor: "pointer" },
  selectedRow: {
    background: "#f0f7f1",
    borderLeft: "4px solid #4a7c4e",
  },
  emptyCell: { padding: 40, textAlign: "center", color: "#94a3b8", fontSize: "13px" },

  // Actions
  actionRow: { display: "flex", justifyContent: "flex-end", gap: 8, flexWrap: "wrap" },
  darkBtn: {
    background: "#1e293b",
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "12px",
  },
  lightBtn: {
    background: "#fff",
    color: "#475569",
    border: "1px solid #e2e8f0",
    padding: "6px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 700,
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