import React, { useState } from "react";

export default function WorkDetailsForm({ employee, onClose }) {
  const [checkIn, setCheckIn] = useState(employee.lastCheckIn || "");
  const [checkOut, setCheckOut] = useState(employee.lastCheckOut || "");
  const [dailyOutput, setDailyOutput] = useState("");

  const handleSave = () => {
    console.log("Saving attendance:", { employeeId: employee.id, checkIn, checkOut, dailyOutput });
    onClose();
  };

  return (
    <div style={styles.container}>
      <h3>{employee.name} - Attendance</h3>
      <label>Check-In:</label>
      <input type="time" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} style={styles.input} />
      <label>Check-Out:</label>
      <input type="time" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} style={styles.input} />
      <label>Daily Output:</label>
      <input type="number" value={dailyOutput} onChange={(e) => setDailyOutput(e.target.value)} style={styles.input} />
      <div style={styles.actions}>
        <button onClick={handleSave} style={styles.saveButton}>Save</button>
        <button onClick={onClose} style={styles.cancelButton}>Cancel</button>
      </div>
    </div>
  );
}

const styles = {
  container: { display:"flex", flexDirection:"column", gap:"10px", padding:"10px" },
  input: { padding:"8px", borderRadius:"5px", border:"1px solid #ccc" },
  actions: { display:"flex", gap:"10px", marginTop:"10px" },
  saveButton: { background:"#1e3a8a", color:"#fff", padding:"8px", border:"none", borderRadius:"5px", cursor:"pointer" },
  cancelButton: { background:"#ccc", color:"#000", padding:"8px", border:"none", borderRadius:"5px", cursor:"pointer" }
};
