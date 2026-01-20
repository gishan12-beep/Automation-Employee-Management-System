import React from "react";
import AppLayout from "../../../components/layout/AppLayout";

function PayrollReports() {
  return (
    <AppLayout>
      <h2 style={styles.heading}>Payroll Reports</h2>

      {/* Summary Cards */}
      <div style={styles.summaryGrid}>
        <div style={styles.card}>
          <h4>Total Employees</h4>
          <p>30</p>
        </div>
        <div style={styles.card}>
          <h4>Total Gross Salary</h4>
          <p>Rs. 1,800,000</p>
        </div>
        <div style={styles.card}>
          <h4>Total Deductions</h4>
          <p>Rs. 320,000</p>
        </div>
        <div style={styles.card}>
          <h4>Net Payroll</h4>
          <p>Rs. 1,480,000</p>
        </div>
      </div>

      {/* Payroll Table */}
      <div style={styles.tableCard}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Month</th>
              <th>Employees</th>
              <th>Gross Salary (Rs.)</th>
              <th>Deductions (Rs.)</th>
              <th>Net Salary (Rs.)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>January 2026</td>
              <td>30</td>
              <td>1,800,000</td>
              <td>320,000</td>
              <td>1,480,000</td>
            </tr>
            <tr>
              <td>December 2025</td>
              <td>28</td>
              <td>1,650,000</td>
              <td>300,000</td>
              <td>1,350,000</td>
            </tr>
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
}

export default PayrollReports;

/* ---------- STYLES ---------- */

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
