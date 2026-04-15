import api from "./api"; // Assuming api wrapper exists

// Employee: Get My History/Payroll for a specific month
export const getMyPayrollApi = async (month, year) => {
  try {
    const res = await api.get(`/payroll/me/${month}/${year}`);
    return res.data?.history || [];
  } catch (err) {
    console.error(err);
    throw err;
  }
};

// Keeping this for SalaryHistory UI mapping if needed, but it should be replaced by getMyPayrollApi
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

export const getMySalarySlipById = async (slipId) => {
  const all = await getMySalaryHistory();
  return all.find((x) => x.slipId === slipId) || null;
};

// Manager: Process Entire Payroll
export const processPayrollApi = async (month, year) => {
  await api.post(`/payroll/process/${month}/${year}`);
};

// Manager: Process Single Employee Payroll
export const processSingleEmployeeApi = async (month, year, employeeId) => {
  const res = await api.post(`/payroll/process/${month}/${year}/${employeeId}`);
  return res.data;
};

// Shared/Manager: Get Summary
export const getPayrollSummaryApi = async (month, year) => {
  const res = await api.get(`/payroll/summary/${month}/${year}`);
  // Mapping backend format to frontend expected format
  // Backend returns: { summary: {...}, details: [ { payroll_id, ... } ] }
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

// Manager/Accountant: Get Itemized Details
export const getPayrollDetailsApi = async (month, year, employeeId) => {
  const res = await api.get(`/payroll/details/${month}/${year}/${employeeId}`);
  return res.data;
};

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
