import React, { useState, useEffect } from "react";
import AppLayout from "../../../components/layout/AppLayout"; // correct relative path

function CheckInOut() {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [checkedIn, setCheckedIn] = useState(false);

  // Mock data for history
  useEffect(() => {
    setAttendanceRecords([
      { date: "2026-01-10", checkIn: "08:45", checkOut: "17:15" },
      { date: "2026-01-11", checkIn: "08:50", checkOut: "17:10" },
      { date: "2026-01-12", checkIn: "08:40", checkOut: "17:05" },
    ]);
  }, []);

  const handleCheckInOut = () => {
    if (!checkedIn) {
      // Check-in
      const now = new Date();
      setAttendanceRecords([
        { date: now.toLocaleDateString(), checkIn: now.toLocaleTimeString(), checkOut: "-" },
        ...attendanceRecords,
      ]);
    } else {
      // Check-out
      const now = new Date();
      setAttendanceRecords((prev) =>
        prev.map((rec, index) =>
          index === 0 ? { ...rec, checkOut: now.toLocaleTimeString() } : rec
        )
      );
    }
    setCheckedIn(!checkedIn);
  };

  return (
    <AppLayout>
      <h2 style={styles.heading}>Employee Attendance</h2>

      <button style={styles.button} onClick={handleCheckInOut}>
        {checkedIn ? "Check Out" : "Check In"}
      </button>

      <h3 style={{ marginTop: "30px" }}>Attendance History</h3>
      <table style={styles.table}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Check-In</th>
            <th>Check-Out</th>
          </tr>
        </thead>
        <tbody>
          {attendanceRecords.map((rec, idx) => (
            <tr key={idx}>
              <td>{rec.date}</td>
              <td>{rec.checkIn}</td>
              <td>{rec.checkOut}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </AppLayout>
  );
}

export default CheckInOut;

/* --------- STYLES --------- */
const styles = {
  heading: { color: "#1e3a8a", marginBottom: "20px" },
  button: {
    backgroundColor: "#add8e6",
    color: "#1e3a8a",
    padding: "12px 20px",
    fontSize: "16px",
    fontWeight: "bold",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "20px",
  },
  th: {
    borderBottom: "2px solid #1e3a8a",
    textAlign: "left",
    padding: "8px",
  },
  td: {
    borderBottom: "1px solid #ccc",
    padding: "8px",
  },
};
