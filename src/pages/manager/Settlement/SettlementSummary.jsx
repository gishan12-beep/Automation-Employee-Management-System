import React from "react";
import AppLayout from "../../../components/layout/AppLayout";

function SettlementSummary() {
  // Sample data
  const settlements = [
    {
      id: 1,
      employee: "Kamal Perera",
      basic: 50000,
      allowance: 5000,
      deduction: 2000,
      leaveEncash: 3000,
      netSettlement: 56000,
      status: "Pending",
    },
    {
      id: 2,
      employee: "Nimal Silva",
      basic: 60000,
      allowance: 6000,
      deduction: 3000,
      leaveEncash: 2000,
      netSettlement: 61000,
      status: "Processed",
    },
  ];

  return (
    <AppLayout>
      <h2 style={styles.heading}>Final Settlement Summary</h2>

      {/* Summary Cards */}
      <div style={styles.summaryGrid}>
        <div style={styles.card}>
          <h4>Total Employees</h4>
          <p>{settlements.length}</p>
        </div>
        <div style={styles.card}>
          <h4>Total Pending Settlements</h4>
          <p>{settlements.filter(s => s.status === "Pending").length}</p>
        </div>
        <div style={styles.card}>
          <h4>Total Processed Settlements</h4>
          <p>{settlements.filter(s => s.status === "Processed").length}</p>
        </div>
      </div>

      {/* Settlements Table */}
      <div style={styles.tableCard}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Basic</th>
              <th>Allowance</th>
              <th>Deductions</th>
              <th>Leave Encash</th>
              <th>Net Settlement</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {settlements.map(s => (
              <tr key={s.id}>
                <td>{s.employee}</td>
                <td>Rs. {s.basic}</td>
                <td>Rs. {s.allowance}</td>
                <td>Rs. {s.deduction}</td>
                <td>Rs. {s.leaveEncash}</td>
                <td>Rs. {s.netSettlement}</td>
                <td style={{ color: s.status === "Pending" ? "orange" : "green" }}>
                  {s.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
}

export default SettlementSummary;

/* ---------------- STYLES ---------------- */
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
