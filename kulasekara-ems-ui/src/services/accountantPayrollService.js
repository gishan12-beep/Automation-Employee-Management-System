// Replace these with your real api.js wrapper (axios/fetch) later.

export async function getPayrollDraftApi({ employeeId, periodStart, periodEnd }) {
  // TODO: call backend
  // return await api.get(`/accountant/payroll/draft?employeeId=...`)
  // Dummy data:
  return {
    employee: {
      employeeID: employeeId,
      firstName: "Kamal",
      lastName: "Perera",
      name: "Kamal Perera",
      salaryType: "Monthly",
      epfEtfEligible: true,
    },
    draft: {
      salaryType: "Monthly",
      basicSalary: 75000,
      overtime: { hours: 10, rate: 600 },
      incentives: [{ description: "Safety bonus", amount: 5000 }],
      deductions: [{ description: "Loan deduction", amount: 3000 }],
      allowancesTotal: 0,
      epfEtfDeductions: 9000,
      periodStart,
      periodEnd,
    },
  };
}

export async function saveFinalPayslipApi(payload) {
  // TODO: POST to backend and store to payroll/salaryslip tables
  // return await api.post(`/accountant/payslips/finalize`, payload)

  console.log("Saving payslip payload:", payload);
  return { ok: true };
}

export async function getPayrollSummaryApi({ month }) {
  // TODO: replace with backend call
  // return await api.get(`/accountant/payroll/summary?month=${month}`)

  return {
    rows: [
      {
        employeeId: "EMP001",
        name: "Kamal Perera",
        department: "Production",
        gross: 92000,
        deductions: 12000,
        net: 80000,
        isFinalized: true,
      },
      {
        employeeId: "EMP002",
        name: "Nimali Silva",
        department: "Packing",
        gross: 78000,
        deductions: 9000,
        net: 69000,
        isFinalized: false,
      },
      {
        employeeId: "EMP003",
        name: "Sahan Fernando",
        department: "Stores",
        gross: 65000,
        deductions: 7500,
        net: 57500,
        isFinalized: false,
      },
    ],
  };
}


export async function getEpfEtfReportApi({ month }) {
  // TODO: replace with backend call
  // return await api.get(`/accountant/reports/epf-etf?month=${month}`)

  return {
    rows: [
      { employeeId: "EMP001", name: "Kamal Perera", department: "Production", epfBase: 75000, isEligible: true },
      { employeeId: "EMP002", name: "Nimali Silva", department: "Packing", epfBase: 65000, isEligible: true },
      { employeeId: "EMP003", name: "Sahan Fernando", department: "Stores", epfBase: 0, isEligible: false },
    ],
  };
}
