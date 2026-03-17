import api from "./api";

// Re-use or re-implement summary fetch
export async function getPayrollSummaryApi({ month }) {
  // month is "YYYY-MM"
  const [y, m] = month.split("-");
  const res = await api.get(`/payroll/summary/${m}/${y}`);

  const runs = res.data?.details || [];
  const summary = res.data?.summary || {
    total_gross: 0,
    total_net: 0,
    total_epf_employee: 0,
    total_epf_employer: 0,
    total_etf: 0
  };

  return {
    summary: {
      totalGross: summary.total_gross,
      totalNet: summary.total_net,
      totalEpfEmployee: summary.total_epf_employee,
      totalEpfEmployer: summary.total_epf_employer,
      totalEtf: summary.total_etf,
      totalEpfEtf: summary.total_epf_employee + summary.total_epf_employer + summary.total_etf
    },
    rows: runs.map((r) => ({
      payrollId: r.payroll_id,
      employeeId: r.employee_id,
      name: `${r.first_name} ${r.last_name}`,
      department: r.department,
      basic_earnings: r.basic_earnings,
      gross: r.gross_pay,
      deductions: Number(r.total_deductions || 0) + Number(r.epf_employee || 0),
      net: r.net_pay,
      isFinalized: r.status === "GENERATED" || r.status === "FINALIZED",
      status: r.status,
      salaryType: r.salary_type || "MONTHLY"
    })),
  };
}

export async function getPayrollDraftApi({ employeeId, periodStart }) {
  // Fetch specific run
  const date = new Date(periodStart);
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();

  const res = await api.get(`/payroll/summary/${m}/${y}`);
  const runs = res.data?.details || [];
  const run = runs.find((r) => r.employee_id === employeeId);

  if (!run) throw new Error("Payroll run not found for this period");

  return {
    employee: {
      employee_id: run.employee_id,
      first_name: run.first_name,
      last_name: run.last_name,
      department: run.department,
      salaryType: run.salary_type || "MONTHLY",
    },
    draft: {
      payrollId: run.payroll_id,
      basic_earnings: run.basic_earnings,
      total_ot_pay: run.total_ot_pay,
      total_incentives: run.total_incentives,
      total_deductions: run.total_deductions,
      epf_employee: run.epf_employee,
      epf_employer: run.epf_employer,
      etf_employer: run.etf_employer,
      gross_pay: run.gross_pay,
      net_pay: run.net_pay,
    },
  };
}

export async function adjustPayrollApi(payrollId, payload) {
  // payload: { adjustment_type, amount, reason }
  const res = await api.patch(`/payroll/${payrollId}`, payload);
  return res.data;
}

export async function saveFinalPayslipApi(payload) {
  // Keeping this for backward compatibility if used elsewhere, but adjustPayrollApi is preferred now.
  const { overrides, payrollId } = payload;
  const updateData = {
    adjustment_type: "ADDITION", // Mocking to ADDITION if using the old UI, but the new UI will use adjustPayrollApi directly
    amount: overrides.incentives.reduce((s, i) => s + Number(i.amount), 0) - overrides.deductions.reduce((s, d) => s + Number(d.amount), 0),
    reason: overrides.notes || "Edited by Accountant",
  };

  // Convert negative amounts to deduction
  if (updateData.amount < 0) {
    updateData.adjustment_type = "DEDUCTION";
    updateData.amount = Math.abs(updateData.amount);
  } else if (updateData.amount === 0) {
    throw new Error("Adjustment amount must be greater than 0");
  }

  if (!payrollId) {
    throw new Error("Missing payrollId");
  }

  await api.patch(`/payroll/${payrollId}`, updateData);
  return { ok: true };
}

export async function getEpfEtfReportApi({ month }) {
  return {
    rows: [
      { employeeId: "EMP001", name: "Kamal Perera", department: "Production", epfBase: 75000, isEligible: true },
      { employeeId: "EMP002", name: "Nimali Silva", department: "Packing", epfBase: 65000, isEligible: true },
      { employeeId: "EMP003", name: "Sahan Fernando", department: "Stores", epfBase: 0, isEligible: false },
    ],
  };
}
