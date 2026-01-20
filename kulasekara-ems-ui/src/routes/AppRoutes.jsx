import { Routes, Route, Navigate } from "react-router-dom";

// Pages
import Login from "../pages/auth/Login";
import ForgotPassword from "../pages/auth/ForgotPassword";

import ManagerDashboard from "../pages/manager/Dashboard";
import EmployeeList from "../pages/manager/employees/EmployeeList";
import AttendanceList from "../pages/manager/attendance/AttendanceList";
import ProcessPayroll from "../pages/manager/payroll/ProcessPayroll";
import PayrollReports from "../pages/manager/reports/PayrollReports";
import IssueList from "../pages/manager/issues/IssueList";
import SettlementSummary from "../pages/manager/Settlement/SettlementSummary";

import EmployeeDashboard from "../pages/employee/Dashboard";
import CheckInOut from "../pages/employee/attendance/CheckInOut";
import SalaryHistory from "../pages/employee/payroll/SalaryHistory";
import SalarySlipView from "../pages/employee/payroll/SalarySlipView";
import RaiseIssue from "../pages/employee/issues/RaiseIssue";
import IssueStatus from "../pages/employee/issues/IssueStatus";
import FinalSettlement from "../pages/employee/settlement/FinalSettlement";

import AccountantDashboard from "../pages/accountant/Dashboard";

import PrivateRoute from "./PrivateRoute";

function AppRoutes() {
  return (
    <Routes>
      {/* Auth */}
      <Route path="/" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Manager (Protected) */}
      <Route
        path="/manager/dashboard"
        element={
          <PrivateRoute allowedRoles={["MANAGER"]}>
            <ManagerDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/manager/employees"
        element={
          <PrivateRoute allowedRoles={["MANAGER"]}>
            <EmployeeList />
          </PrivateRoute>
        }
      />
      <Route
        path="/manager/attendance"
        element={
          <PrivateRoute allowedRoles={["MANAGER"]}>
            <AttendanceList />
          </PrivateRoute>
        }
      />
      <Route
        path="/manager/payroll"
        element={
          <PrivateRoute allowedRoles={["MANAGER"]}>
            <ProcessPayroll />
          </PrivateRoute>
        }
      />
      <Route
        path="/manager/reports"
        element={
          <PrivateRoute allowedRoles={["MANAGER"]}>
            <PayrollReports />
          </PrivateRoute>
        }
      />
      <Route
        path="/manager/issues"
        element={
          <PrivateRoute allowedRoles={["MANAGER"]}>
            <IssueList />
          </PrivateRoute>
        }
      />
      <Route
        path="/manager/settlement"
        element={
          <PrivateRoute allowedRoles={["MANAGER"]}>
            <SettlementSummary />
          </PrivateRoute>
        }
      />

      {/* Employee (Protected) */}
      <Route
        path="/employee/dashboard"
        element={
          <PrivateRoute allowedRoles={["EMPLOYEE"]}>
            <EmployeeDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/employee/attendance"
        element={
          <PrivateRoute allowedRoles={["EMPLOYEE"]}>
            <CheckInOut />
          </PrivateRoute>
        }
      />
      <Route
        path="/employee/payroll/salary-history"
        element={
          <PrivateRoute allowedRoles={["EMPLOYEE"]}>
            <SalaryHistory />
          </PrivateRoute>
        }
      />
      <Route
        path="/employee/payroll/salary-slip/:slipId"
        element={
          <PrivateRoute allowedRoles={["EMPLOYEE"]}>
            <SalarySlipView />
          </PrivateRoute>
        }
      />
      <Route
        path="/employee/issues/raise"
        element={
          <PrivateRoute allowedRoles={["EMPLOYEE"]}>
            <RaiseIssue />
          </PrivateRoute>
        }
      />
      <Route
        path="/employee/issues/status"
        element={
          <PrivateRoute allowedRoles={["EMPLOYEE"]}>
            <IssueStatus />
          </PrivateRoute>
        }
      />
      <Route
        path="/employee/settlement"
        element={
          <PrivateRoute allowedRoles={["EMPLOYEE"]}>
            <FinalSettlement />
          </PrivateRoute>
        }
      />

      {/* Accountant (Protected) */}
      <Route
        path="/accountant/dashboard"
        element={
          <PrivateRoute allowedRoles={["ACCOUNTANT"]}>
            <AccountantDashboard />
          </PrivateRoute>
        }
      />

      {/* Optional: redirect unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
