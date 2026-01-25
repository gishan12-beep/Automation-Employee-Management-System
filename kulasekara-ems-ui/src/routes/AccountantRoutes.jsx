// AccountantRoutes.jsx (example)
import { Routes, Route } from "react-router-dom";

import AccountantDashboard from "../pages/accountant/Dashboard";
import PayrollManagementAccountant from "../pages/accountant/payroll/PayrollManagementAccountant";
import PayrollAudit from "../pages/accountant/payroll/PayrollAudit";
import Reports from "../pages/accountant/reports/Reports";
import PayrollSummary from "../pages/accountant/reports/PayrollSummary";

import EPFETFManagement from "../pages/accountant/epf-etf/EPFETFManagement";
import ContributionReports from "../pages/accountant/epf-etf/ContributionReports";

export default function AccountantRoutes() {
  return (
    <Routes>
      <Route path="/accountant/dashboard" element={<AccountantDashboard />} />
      <Route path="/accountant/payroll/management" element={<PayrollManagementAccountant />} />
      <Route path="/accountant/payroll/audit" element={<PayrollAudit />} />

      <Route path="/accountant/reports" element={<Reports />} />
      <Route path="/accountant/reports/payroll-summary" element={<PayrollSummary />} />

      <Route path="/accountant/epf-etf/management" element={<EPFETFManagement />} />
      <Route path="/accountant/epf-etf/contribution-reports" element={<ContributionReports />} />
    </Routes>
  );
}
