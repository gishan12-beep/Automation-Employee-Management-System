import React from "react";
import { Modal } from "kulasekara-ems-ui\src\components\common\Modal.jsx";

export default function PayrollPreview({ employees, month, onClose }) {
  return (
    <Modal onClose={onClose}>
      <h3>Payroll Preview - {month}</h3>
      <table style={{ width:"100%", borderCollapse:"collapse" }}>
        <thead>
          <tr><th>Name</th><th>Net Salary</th></tr>
        </thead>
        <tbody>
          {employees.map(emp => (
            <tr key={emp.id}>
              <td>{emp.name}</td>
              <td>Rs. {emp.basic + emp.allowance - emp.deduction}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop:"10px", textAlign:"right" }}>
        <button onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}
