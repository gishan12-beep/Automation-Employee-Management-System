import React, { useState, useEffect } from "react";
import AppLayout from "../../../components/layout/AppLayout";
import { Modal } from "../../../components/common/Modal";
import WorkDetailsForm from "./WorkDetails";


// Dummy employee data
const employeesData = [
  { id: 1, name: "John Doe", role: "Permanent", lastCheckIn: "08:00", lastCheckOut: "16:00" },
  { id: 2, name: "Jane Smith", role: "Daily Wage", lastCheckIn: "08:15", lastCheckOut: "16:30" },
];

export default function AttendanceList() {
  const [employees, setEmployees] = useState([]); 
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { setEmployees(employeesData); }, []);

  const handleView = (employee) => {
    setSelectedEmployee(employee);
    setShowModal(true);
  };

  const handleClose = () => {
    setSelectedEmployee(null);
    setShowModal(false);
  };

  return (
    <AppLayout>
      <h2 style={{ marginBottom: "20px", color: "#1e3a8a" }}>Employee Attendance</h2>
      <table style={styles.table}>
        <thead>
          <tr>
            <th>Name</th><th>Role</th><th>Last Check-In</th><th>Last Check-Out</th><th>Action</th>
          </tr>
        </thead>
        <tbody>
          {employees.map(emp => (
            <tr key={emp.id}>
              <td>{emp.name}</td>
              <td>{emp.role}</td>
              <td>{emp.lastCheckIn}</td>
              <td>{emp.lastCheckOut}</td>
              <td><button style={styles.button} onClick={() => handleView(emp)}>View / Edit</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && selectedEmployee && (
        <Modal onClose={handleClose}>
          <WorkDetailsForm employee={selectedEmployee} onClose={handleClose} />
        </Modal>
      )}
    </AppLayout>
  );
}

const styles = {
  table: { width:"100%", borderCollapse:"collapse" },
  button: { padding:"5px 10px", background:"#f5b700", border:"none", borderRadius:"5px", cursor:"pointer" },
};
