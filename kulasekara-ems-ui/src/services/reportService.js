import api from "./api";

// Retrieves a consolidated attendance report for all employees for a specific month
export const getAttendanceReportApi = async (month, year) => {
  const res = await api.get(`/manager/reports/attendance?month=${month}&year=${year}`);
  return res.data;
};

// Generates an EPF/ETF contribution report by fetching payroll summary data for the month
export const getEPFETFReportApi = async (month, year) => {
  const res = await api.get(`/payroll/summary/${month}/${year}`);
  // Return the details array containing individual employee contribution data
  return res.data?.details || [];
};

// Fetches a report summarizing all employee-reported issues and their current statuses
export const getIssueReportApi = async () => {
  const res = await api.get("/manager/reports/issues");
  return res.data;
};

// Retrieves a summary report of all individual leave applications and approvals
export const getLeaveReportApi = async () => {
  const res = await api.get("/manager/reports/leaves");
  return res.data;
};

// Fetches a report of finalized and pending settlements for resigned/terminated employees
export const getSettlementReportApi = async () => {
  const res = await api.get("/manager/reports/settlements");
  return res.data;
};

// Generates a report specifically for employees receiving their wages via cash payout
export const getCashPayoutReportApi = async (month, year) => {
  const res = await api.get(`/manager/reports/cash-payout?month=${month}&year=${year}`);
  return res.data;
};
