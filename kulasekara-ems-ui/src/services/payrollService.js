export const getMySalaryHistory = async () => {
  return [
    {
      slipId: "SLIP-2025-09-EMP001",
      employeeId: "EMP001",
      employeeName: "Kamal Perera",
      role: "Machine Operator",
      periodStart: "2025-09-01",
      periodEnd: "2025-09-30",
      paidOn: "2025-10-05",
      earnings: { basic: 75000, overtime: 5000, incentives: 3000, allowances: 2000 },
      deductions: { epf: 7500, etf: 1500, other: 1000 },
    },
    {
      slipId: "SLIP-2025-08-EMP001",
      employeeId: "EMP001",
      employeeName: "Kamal Perera",
      role: "Machine Operator",
      periodStart: "2025-08-01",
      periodEnd: "2025-08-31",
      paidOn: "2025-09-05",
      earnings: { basic: 75000, overtime: 2500, incentives: 2500, allowances: 2000 },
      deductions: { epf: 7500, etf: 1500, other: 500 },
    },
  ];
};

export const getMySalarySlipById = async (slipId) => {
  const all = await getMySalaryHistory();
  return all.find((x) => x.slipId === slipId) || null;
};




export const getMyFinalSettlementPreview = async () => {
  // UI mock. Later calculate using attendance + payroll + deductions
  return {
    employeeId: "EMP001",
    employeeName: "Kamal Perera",
    designation: "Machine Operator",
    lastWorkingDate: "2025-10-31",
    settlementDate: "2025-11-05",

    earnings: {
      unpaidSalary: 25000,
      overtime: 4500,
      leaveEncashment: 12000,
      bonus: 5000,
      other: 0,
    },

    deductions: {
      advances: 6000,
      loans: 0,
      epfEtfAdjustments: 1500,
      other: 0,
    },

    notes: "This is a preview. Final values will be confirmed by Manager/Accountant.",
  };
};
