import api from "./api"; // Assuming api wrapper exists

// Fetches the payroll history/payslip for the logged-in employee for a specific month and year
export const getMyPayrollApi = async (month, year) => {
  try {
    const res = await api.get(`/payroll/me/${month}/${year}`);
    return res.data?.history || [];
  } catch (err) {
    console.error(err);
    throw err;
  }
};

// Retrieves entire salary history for the employee and maps it to the frontend model
export const getMySalaryHistory = async () => {
  try {
    const res = await api.get("/payroll/me");
    return res.data.history.map((run) => ({
      slipId: `SLIP-${run.year}-${String(run.month).padStart(2, "0")}-${run.employee_id}`,
      employeeId: run.employee_id,
      month: run.month,
      year: run.year,
      basic: run.basic_earnings,
      gross: run.gross_pay,
      net: run.net_pay,
      epf: run.epf_employee,
      status: run.status,
    }));
  } catch (err) {
    console.error(err);
    return [];
  }
};

// Finds a specific salary slip from the history by its unique generated slip ID
export const getMySalarySlipById = async (slipId) => {
  const all = await getMySalaryHistory();
  return all.find((x) => x.slipId === slipId) || null;
};

// Requests the backend to process monthly payroll for all active employees
export const processPayrollApi = async (month, year) => {
  await api.post(`/payroll/process/${month}/${year}`);
};

// Requests the backend to process monthly payroll for a single specific employee
export const processSingleEmployeeApi = async (month, year, employeeId) => {
  const res = await api.post(`/payroll/process/${month}/${year}/${employeeId}`);
  return res.data;
};

// Fetches a summary of all payroll runs for a specific month and year (Manager/Accountant access)
export const getPayrollSummaryApi = async (month, year) => {
  const res = await api.get(`/payroll/summary/${month}/${year}`);
  const runs = res.data?.details || [];
  return runs.map((r) => ({
    payrollId: r.payroll_id,
    employeeId: r.employee_id,
    name: `${r.first_name} ${r.last_name}`,
    department: r.department,
    basic_earnings: r.basic_earnings,
    total_ot_pay: r.total_ot_pay,
    total_incentives: r.total_incentives,
    total_deductions: r.total_deductions,
    gross: r.gross_pay,
    epf_employee: r.epf_employee,
    epf_employer: r.epf_employer,
    etf_employer: r.etf_employer,
    net: r.net_pay,
    status: r.status,
  }));
};

// Retrieves the detailed calculation breakdown (OT, incentives, EPF) for a specific payroll run
export const getPayrollDetailsApi = async (month, year, employeeId) => {
  const res = await api.get(`/payroll/details/${month}/${year}/${employeeId}`);
  return res.data;
};

// Fetches the final settlement preview for an employee who has resigned or terminated
export const getMyFinalSettlementPreview = async () => {
  try {
    const res = await api.get("/employee/settlement/preview");
    return res.data;
  } catch (err) {
    if (err.response?.status === 404) return null;
    console.error("Error fetching settlement preview:", err);
    throw err;
  }
};
