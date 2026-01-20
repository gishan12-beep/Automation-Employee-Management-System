import React, { useState } from "react";
import AppLayout from "../../../components/layout/AppLayout";

function ProcessPayroll() {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editedAllowance, setEditedAllowance] = useState(0);
  const [editedDeduction, setEditedDeduction] = useState(0);

  const employees = [
    {
      id: 1,
      name: "John Doe",
      position: "Machine Operator",
      basic: 50000,
      allowance: 5000,
      deduction: 2000,
    },
    {
      id: 2,
      name: "Jane Smith",
      position: "Supervisor",
      basic: 60000,
      allowance: 6000,
      deduction: 3000,
    },
  ];

  const openSlip = (emp) => {
    setSelectedEmployee(emp);
    setEditedAllowance(emp.allowance);
    setEditedDeduction(emp.deduction);
  };

  const netSalary =
    selectedEmployee &&
    selectedEmployee.basic + editedAllowance - editedDeduction;

  return (
    <AppLayout>
      <h2 style={styles.heading}>Payroll Management</h2>

      {/* Employee Table */}
      <table style={styles.table}>
        <thead>
          <tr>
            <th>Employee</th>
            <th>Basic</th>
            <th>Allowance</th>
            <th>Deduction</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp.id}>
              <td>{emp.name}</td>
              <td>Rs. {emp.basic}</td>
              <td>Rs. {emp.allowance}</td>
              <td>Rs. {emp.deduction}</td>
              <td>
                <button style={styles.btn} onClick={() => openSlip(emp)}>
                  Generate Slip
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Salary Slip */}
      {selectedEmployee && (
        <div style={styles.slip}>
          <h3 style={styles.slipTitle}>Salary Slip</h3>

          <p><b>Name:</b> {selectedEmployee.name}</p>
          <p><b>Position:</b> {selectedEmployee.position}</p>

          <label style={styles.label}>
            Basic Salary (Read Only)
            <input
              type="number"
              value={selectedEmployee.basic}
              disabled
              style={styles.inputDisabled}
            />
          </label>

          <label style={styles.label}>
            Allowance
            <input
              type="number"
              value={editedAllowance}
              onChange={(e) => setEditedAllowance(Number(e.target.value))}
              style={styles.input}
            />
          </label>

          <label style={styles.label}>
            Deduction
            <input
              type="number"
              value={editedDeduction}
              onChange={(e) => setEditedDeduction(Number(e.target.value))}
              style={styles.input}
            />
          </label>

          <h4 style={styles.netSalary}>
            Net Salary: Rs. {netSalary}
          </h4>

          <button
            style={styles.closeBtn}
            onClick={() => setSelectedEmployee(null)}
          >
            Close Slip
          </button>
        </div>
      )}
    </AppLayout>
  );
}

export default ProcessPayroll;

/* ---------------- STYLES ---------------- */

const styles = {
  heading: {
    color: "#1e3a8a",
    marginBottom: "20px",
  },
  table: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderCollapse: "collapse",
  },
  btn: {
    backgroundColor: "#add8e6",
    border: "none",
    padding: "8px 12px",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  slip: {
    marginTop: "30px",
    backgroundColor: "#ffffff",
    padding: "20px",
    borderRadius: "10px",
    maxWidth: "420px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  },
  slipTitle: {
    color: "#1e3a8a",
    marginBottom: "15px",
  },
  label: {
    display: "block",
    marginTop: "10px",
    fontWeight: "bold",
  },
  input: {
    width: "100%",
    padding: "8px",
    marginTop: "5px",
  },
  inputDisabled: {
    width: "100%",
    padding: "8px",
    marginTop: "5px",
    backgroundColor: "#f0f0f0",
    border: "1px solid #ccc",
  },
  netSalary: {
    marginTop: "15px",
    color: "#1e3a8a",
  },
  closeBtn: {
    marginTop: "15px",
    width: "100%",
    padding: "10px",
    backgroundColor: "#1e3a8a",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};
