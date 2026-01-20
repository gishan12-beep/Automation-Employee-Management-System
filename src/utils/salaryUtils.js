export const formatLKR = (value) => {
  const n = Number(value || 0);
  return `Rs. ${n.toLocaleString("en-LK")}`;
};

export const calcTotals = (slip) => {
  const e = slip?.earnings || {};
  const d = slip?.deductions || {};

  const totalEarnings =
    (e.basic || 0) + (e.overtime || 0) + (e.incentives || 0) + (e.allowances || 0);

  const totalDeductions =
    (d.epf || 0) + (d.etf || 0) + (d.other || 0);

  return {
    totalEarnings,
    totalDeductions,
    netPay: totalEarnings - totalDeductions,
  };
};
