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
              placeholder="Search by ID, name, department, role, status..."
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
                        <tr key={w.workDetailID}>
                          <td style={ui.td}>{w.date}</td>
                          <td style={ui.td}>
                            <div style={{ fontWeight: 900 }}>{w.taskDescription}</div>
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
      <div style={{ ...ui.card, marginTop: 16 }}>
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
                    <tr key={emp.id} style={selected ? ui.selectedRow : undefined}>
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
                            style={selected ? ui.darkBtn : ui.lightBtn}
                            onClick={() => setSelectedEmployee(emp)}
                          >
                            {selected ? "Selected" : "Select"}
                          </button>

                          {isDayWorker(emp) ? (
                            <button style={ui.darkBtn} onClick={() => setSelectedEmployee(emp)}>
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
      <div style={ui.summaryLabel}>{label}</div>
      <div style={ui.summaryValue}>{value}</div>
    </div>
  );
}

const ui = {
  pageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    marginBottom: 18,
    flexWrap: "wrap",
  },
  pageTitle: { margin: 0, fontSize: 28, fontWeight: 900, letterSpacing: -0.3, color: "#0b1220" },
  pageSubTitle: { margin: "6px 0 0", color: "#64748b", fontSize: 13 },

  topActions: { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" },
  searchWrap: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#fff",
    border: "1px solid #e6edf6",
    borderRadius: 12,
    padding: "10px 12px",
    minWidth: 380,
    boxShadow: "0 1px 0 rgba(15, 23, 42, 0.02)",
  },
  searchIcon: { fontSize: 14, opacity: 0.6 },
  searchInput: { border: "none", outline: "none", width: "100%", fontSize: 14, color: "#0b1220" },

  grid2: { display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: 16 },
  card: {
    background: "#fff",
    borderRadius: 16,
    border: "1px solid #e6edf6",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
    overflow: "hidden",
  },
  cardHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "18px 18px 10px",
    gap: 12,
    flexWrap: "wrap",
  },
  cardTitle: { margin: 0, fontSize: 18, fontWeight: 900, color: "#0b1220" },
  countPill: {
    background: "#f1f5f9",
    border: "1px solid #e2e8f0",
    color: "#0b1220",
    padding: "8px 12px",
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 800,
  },

  badgeActive: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 12px",
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 900,
    background: "#dcfce7",
    color: "#14532d",
    border: "1px solid #bbf7d0",
  },
  badgeInactive: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 12px",
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 900,
    background: "#fee2e2",
    color: "#7f1d1d",
    border: "1px solid #fecaca",
  },

  profileWrap: { display: "flex", gap: 14, padding: 18 },
  profileAvatar: {
    width: 72,
    height: 72,
    borderRadius: 16,
    border: "1px solid #e6edf6",
    objectFit: "cover",
    background: "#f8fafc",
  },
  profileName: { fontSize: 18, fontWeight: 900, color: "#0b1220" },
  profileMeta: { marginTop: 4, fontSize: 13, color: "#64748b", fontWeight: 600 },
  profileGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 10,
    marginTop: 14,
  },
  infoBox: {
    background: "#f8fafc",
    border: "1px solid #e6edf6",
    borderRadius: 14,
    padding: 12,
  },
  infoLabel: { fontSize: 12, color: "#64748b", fontWeight: 900, letterSpacing: 0.7 },
  infoValue: { marginTop: 6, fontSize: 14, color: "#0b1220", fontWeight: 900 },

  dateInput: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #e6edf6",
    outline: "none",
    background: "#fff",
    fontWeight: 800,
  },
  primaryBtnSmall: {
    background: "#0b1220",
    color: "#fff",
    border: "1px solid #0b1220",
    padding: "10px 14px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 900,
  },
  disabledBtnSmall: {
    background: "#0b1220",
    color: "#fff",
    border: "1px solid #0b1220",
    padding: "10px 14px",
    borderRadius: 12,
    opacity: 0.35,
    cursor: "not-allowed",
    fontWeight: 900,
  },

  summaryRow: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, padding: "0 18px 16px" },
  summaryCard: {
    background: "#f8fafc",
    border: "1px solid #e6edf6",
    borderRadius: 16,
    padding: 14,
  },
  summaryLabel: { fontSize: 12, color: "#64748b", fontWeight: 900, letterSpacing: 0.7 },
  summaryValue: { marginTop: 8, fontSize: 20, fontWeight: 900, color: "#0b1220" },

  infoBoxBlue: {
    margin: 18,
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: 14,
    padding: 12,
    color: "#1e40af",
    fontWeight: 700,
  },

  tableWrap: { width: "100%", overflowX: "auto" },
  table: { width: "100%", borderCollapse: "separate", borderSpacing: 0 },
  th: {
    textAlign: "left",
    padding: "14px 18px",
    fontSize: 12,
    letterSpacing: 0.8,
    color: "#6b7280",
    background: "#f8fafc",
    borderTop: "1px solid #e6edf6",
    borderBottom: "1px solid #e6edf6",
  },
  td: { padding: "14px 18px", borderBottom: "1px solid #edf2f7", verticalAlign: "middle", color: "#0b1220" },
  emptyCell: { padding: 24, textAlign: "center", color: "#64748b" },

  actionRow: { display: "flex", justifyContent: "flex-end", gap: 10, flexWrap: "wrap" },
  darkBtn: {
    background: "#0b1220",
    color: "#fff",
    border: "1px solid #0b1220",
    padding: "10px 14px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 900,
    whiteSpace: "nowrap",
  },
  lightBtn: {
    background: "#fff",
    color: "#0b1220",
    border: "1px solid #e6edf6",
    padding: "10px 14px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 900,
    whiteSpace: "nowrap",
  },
  disabledBtn: {
    background: "#0b1220",
    color: "#fff",
    border: "1px solid #0b1220",
    padding: "10px 14px",
    borderRadius: 12,
    opacity: 0.35,
    cursor: "not-allowed",
    fontWeight: 900,
    whiteSpace: "nowrap",
  },
  dangerOutlineBtn: {
    background: "#fff",
    color: "#b91c1c",
    border: "1px solid #fecaca",
    padding: "10px 14px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 900,
    whiteSpace: "nowrap",
  },

  nameCell: { display: "flex", alignItems: "center", gap: 12, minWidth: 280 },
  avatar: { width: 44, height: 44, borderRadius: 12, border: "1px solid #e6edf6", objectFit: "cover", background: "#f8fafc" },
  nameText: { fontWeight: 900, fontSize: 15, color: "#0b1220" },
  subText: { fontSize: 13, color: "#64748b", marginTop: 2 },
  subTextSmall: { fontSize: 12, color: "#64748b", marginTop: 4 },
  miniMeta: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 },
  miniTag: { fontSize: 12, padding: "3px 8px", borderRadius: 999, background: "#f1f5f9", border: "1px solid #e2e8f0", color: "#334155", fontWeight: 700 },

  selectedRow: { background: "#f8fafc" },
  emptyBox: { padding: 18, color: "#64748b" },
};
