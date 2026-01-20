export const getAccountantDashboardSummary = async () => {
  // UI mock (later replace with API call)
  return {
    month: "2025-10",
    totals: {
      employees: 42,
      totalPayroll: 3850000,
      totalEPF: 289000,
      totalETF: 96500,
      pendingAudits: 3,
    },
    recentPayroll: [
      { id: "PAY-2025-10-01", period: "2025-10", processedBy: "Manager", status: "Completed", total: 3850000 },
      { id: "PAY-2025-09-01", period: "2025-09", processedBy: "Manager", status: "Completed", total: 3725000 },
      { id: "PAY-2025-08-01", period: "2025-08", processedBy: "Manager", status: "Completed", total: 3610000 },
    ],
    epfEtfDue: [
      { ref: "EPF-2025-10", period: "2025-10", epf: 289000, etf: 96500, dueDate: "2025-11-15", status: "Pending" },
      { ref: "EPF-2025-09", period: "2025-09", epf: 279500, etf: 93000, dueDate: "2025-10-15", status: "Paid" },
    ],
  };
};
