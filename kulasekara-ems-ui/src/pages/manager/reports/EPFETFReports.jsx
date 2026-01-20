import React from "react";
import AppLayout from "../../../components/layout/AppLayout";

function EPFETFContributionReports() {
  return (
    <AppLayout>
      <h2 style={styles.title}>EPF / ETF Contribution Reports</h2>

      <div style={styles.card}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Month</th>
              <th>Total EPF (Employee)</th>
              <th>Total EPF (Employer)</th>
              <th>Total ETF</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>January 2026</td>
              <td>Rs. 120,000</td>
              <td>Rs. 180,000</td>
              <td>Rs. 75,000</td>
            </tr>
            <tr>
              <td>December 2025</td>
              <td>Rs. 115,000</td>
              <td>Rs. 170,000</td>
              <td>Rs. 70,000</td>
            </tr>
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
}

export default EPFETFContributionReports;

/* -------- STYLES -------- */

const styles = {
  title: {
    marginBottom: "20px",
    color: "#1e3a8a",
  },
  card: {
    backgroundColor: "#ffffff",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
};
