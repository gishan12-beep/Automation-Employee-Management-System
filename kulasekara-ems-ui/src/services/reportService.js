import api from "./api";

// Attendance Report
export const getAttendanceReportApi = async (month, year) => {
  const res = await api.get(`/manager/reports/attendance?month=${month}&year=${year}`);
  return res.data;
};

// EPF/ETF Report (reusing payroll summary logic)
export const getEPFETFReportApi = async (month, year) => {
  const res = await api.get(`/payroll/summary/${month}/${year}`);
  // Returning the details array because the component expects an array for mapping
  return res.data?.details || [];
};

// Issue Report
export const getIssueReportApi = async () => {
  const res = await api.get("/manager/reports/issues");
  return res.data;
};

// Leave Report
export const getLeaveReportApi = async () => {
  const res = await api.get("/manager/reports/leaves");
  return res.data;
};

// Settlement Report
export const getSettlementReportApi = async () => {
  const res = await api.get("/manager/reports/settlements");
  return res.data;
};

// Cash Payout Report
export const getCashPayoutReportApi = async (month, year) => {
  const res = await api.get(`/manager/reports/cash-payout?month=${month}&year=${year}`);
  return res.data;
};
