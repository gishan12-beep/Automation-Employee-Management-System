import { Routes, Route, Navigate } from "react-router-dom";

// Auth pages
import Login from "../pages/auth/Login";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";

// Manager pages
import ManagerDashboard from "../pages/manager/Dashboard";
import EmployeeList from "../pages/manager/employees/EmployeeList";
import AttendanceList from "../pages/manager/attendance/AttendanceList";
import ProcessPayroll from "../pages/manager/payroll/ProcessPayroll";
import IssueList from "../pages/manager/issues/IssueList";
import IssueDetail from "../pages/manager/issues/IssueDetail";
import ManagerSettings from "../pages/manager/settings/ManagerSettings";
import SettlementCalculator from "../pages/manager/Settlement/SettlementCalculator";
import SettlementSummary from "../pages/manager/Settlement/SettlementSummary";
import ReportsDashboard from "../pages/manager/reports/ReportsDashboard";
import CashCoinDashboard from "../pages/manager/reports/CashCoinDashboard";
import CashSalaryPayoutReport from "../pages/manager/reports/CashSalaryPayoutReport";
import CashSummaryReport from "../pages/manager/reports/CashSummaryReport";
import PayrollReports from "../pages/manager/reports/PayrollReports";
import AttendanceReports from "../pages/manager/reports/AttendanceReports";
import EPFETFReports from "../pages/manager/reports/EPFETFReports";
import LeaveRequests from "../pages/manager/leave/LeaveRequests";

// Employee pages
import EmployeeDashboard from "../pages/employee/Dashboard";
import CheckInOut from "../pages/employee/attendance/CheckInOut";
import ApplyLeave from "../pages/employee/leave/ApplyLeave";
import SalaryHistory from "../pages/employee/payroll/SalaryHistory";
import SalarySlipView from "../pages/employee/payroll/SalarySlipView";
import RaiseIssue from "../pages/employee/issues/RaiseIssue";
import IssueStatus from "../pages/employee/issues/IssueStatus";
import FinalSettlement from "../pages/employee/settlement/FinalSettlement";
import ChangePassword from "../pages/employee/auth/ChangePassword";

// Accountant pages
import AccountantDashboard from "../pages/accountant/Dashboard";
import PayrollEditor from "../pages/accountant/payroll/PayrollEditor";
import PayrollSummary from "../pages/accountant/payroll/PayrollSummary";
import EPFETF from "../pages/accountant/reports/EPFETF";
import BankWithdrawals from "../pages/accountant/withdrawals/BankWithdrawals";

// Route guard
import PrivateRoute from "./PrivateRoute";

function AppRoutes() {
  return (
    <Routes>
      {/* ================= Auth ================= */}
      <Route path="/" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* ================= Manager ================= */}
      <Route path="/manager/dashboard" element={<PrivateRoute allowedRoles={["MANAGER"]}><ManagerDashboard /></PrivateRoute>} />
      <Route path="/manager/employees" element={<PrivateRoute allowedRoles={["MANAGER"]}><EmployeeList /></PrivateRoute>} />
      <Route path="/manager/attendance" element={<PrivateRoute allowedRoles={["MANAGER"]}><AttendanceList /></PrivateRoute>} />
      <Route path="/manager/payroll" element={<PrivateRoute allowedRoles={["MANAGER"]}><ProcessPayroll /></PrivateRoute>} />
      <Route path="/manager/settings" element={<PrivateRoute allowedRoles={["MANAGER"]}><ManagerSettings /></PrivateRoute>} />
      <Route path="/manager/reports" element={<PrivateRoute allowedRoles={["MANAGER"]}><ReportsDashboard /></PrivateRoute>} />
      <Route path="/manager/reports/cash" element={<PrivateRoute allowedRoles={["MANAGER"]}><CashCoinDashboard /></PrivateRoute>} />
      <Route path="/manager/reports/cash/payouts" element={<PrivateRoute allowedRoles={["MANAGER"]}><CashSalaryPayoutReport /></PrivateRoute>} />
      <Route path="/manager/reports/cash/summary" element={<PrivateRoute allowedRoles={["MANAGER"]}><CashSummaryReport /></PrivateRoute>} />
      <Route path="/manager/reports/payroll" element={<PrivateRoute allowedRoles={["MANAGER"]}><PayrollReports /></PrivateRoute>} />
      <Route path="/manager/reports/attendance" element={<PrivateRoute allowedRoles={["MANAGER"]}><AttendanceReports /></PrivateRoute>} />
      <Route path="/manager/reports/epf" element={<PrivateRoute allowedRoles={["MANAGER"]}><EPFETFReports /></PrivateRoute>} />
      <Route path="/manager/issues" element={<PrivateRoute allowedRoles={["MANAGER"]}><IssueList /></PrivateRoute>} />
      <Route path="/manager/issues/:issueId" element={<PrivateRoute allowedRoles={["MANAGER"]}><IssueDetail /></PrivateRoute>} />
      <Route path="/manager/leaves" element={<PrivateRoute allowedRoles={["MANAGER"]}><LeaveRequests /></PrivateRoute>} />
      <Route path="/manager/settlement" element={<PrivateRoute allowedRoles={["MANAGER"]}><SettlementCalculator /></PrivateRoute>} />
      <Route path="/manager/settlement/summary" element={<PrivateRoute allowedRoles={["MANAGER"]}><SettlementSummary /></PrivateRoute>} />

      {/* ================= Employee ================= */}
      <Route path="/employee/change-password" element={<PrivateRoute allowedRoles={["EMPLOYEE"]}><ChangePassword /></PrivateRoute>} />
      <Route path="/employee/dashboard" element={<PrivateRoute allowedRoles={["EMPLOYEE"]}><EmployeeDashboard /></PrivateRoute>} />
      <Route path="/employee/attendance" element={<PrivateRoute allowedRoles={["EMPLOYEE"]}><CheckInOut /></PrivateRoute>} />
      <Route path="/employee/leave" element={<PrivateRoute allowedRoles={["EMPLOYEE"]}><ApplyLeave /></PrivateRoute>} />
      <Route path="/employee/payroll/salary-history" element={<PrivateRoute allowedRoles={["EMPLOYEE"]}><SalaryHistory /></PrivateRoute>} />
      <Route path="/employee/payroll/salary-slip/:slipId" element={<PrivateRoute allowedRoles={["EMPLOYEE"]}><SalarySlipView /></PrivateRoute>} />
      <Route path="/employee/issues/raise" element={<PrivateRoute allowedRoles={["EMPLOYEE"]}><RaiseIssue /></PrivateRoute>} />
      <Route path="/employee/issues/status" element={<PrivateRoute allowedRoles={["EMPLOYEE"]}><IssueStatus /></PrivateRoute>} />
      <Route path="/employee/settlement" element={<PrivateRoute allowedRoles={["EMPLOYEE"]}><FinalSettlement /></PrivateRoute>} />

      {/* ================= Accountant ================= */}
      <Route path="/accountant/dashboard" element={<PrivateRoute allowedRoles={["ACCOUNTANT"]}><AccountantDashboard /></PrivateRoute>} />
      <Route path="/accountant/payroll" element={<PrivateRoute allowedRoles={["ACCOUNTANT"]}><PayrollEditor /></PrivateRoute>} />
      <Route path="/accountant/payroll-summary" element={<PrivateRoute allowedRoles={["ACCOUNTANT"]}><PayrollSummary /></PrivateRoute>} />
      <Route path="/accountant/epf-etf" element={<PrivateRoute allowedRoles={["ACCOUNTANT"]}><EPFETF /></PrivateRoute>} />
      <Route path="/accountant/withdrawals" element={<PrivateRoute allowedRoles={["ACCOUNTANT"]}><BankWithdrawals /></PrivateRoute>} />
      <Route path="/accountant/payroll/:employeeId" element={<PrivateRoute allowedRoles={["ACCOUNTANT"]}><PayrollEditor /></PrivateRoute>} />

      {/* ================= Fallback ================= */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
