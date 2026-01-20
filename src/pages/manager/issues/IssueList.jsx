import React from "react";
import AppLayout from "../../../components/layout/AppLayout";

function IssueList() {
  return (
    <AppLayout>
      <h2 style={styles.heading}>Employee Issues</h2>

      {/* Summary */}
      <div style={styles.summaryGrid}>
        <div style={styles.card}>
          <h4>Total Issues</h4>
          <p>12</p>
        </div>
        <div style={styles.card}>
          <h4>Pending</h4>
          <p>5</p>
        </div>
        <div style={styles.card}>
          <h4>Resolved</h4>
          <p>7</p>
        </div>
      </div>

      {/* Issues Table */}
      <div style={styles.tableCard}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Issue ID</th>
              <th>Employee</th>
              <th>Category</th>
              <th>Status</th>
              <th>Submitted Date</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>#ISS-001</td>
              <td>Kamal Perera</td>
              <td>Salary</td>
              <td style={{ color: "orange" }}>Pending</td>
              <td>2026-01-10</td>
            </tr>
            <tr>
              <td>#ISS-002</td>
              <td>Nimal Silva</td>
              <td>Attendance</td>
              <td style={{ color: "green" }}>Resolved</td>
              <td>2026-01-08</td>
            </tr>
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
}

export default IssueList;

/* ---------- styles ---------- */

const styles = {
  heading: {
    marginBottom: "20px",
    color: "#1e40af",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "15px",
    marginBottom: "30px",
  },
  card: {
    background: "#ffffff",
    padding: "20px",
    borderRadius: "10px",
    textAlign: "center",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  },
  tableCard: {
    background: "#ffffff",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
};
