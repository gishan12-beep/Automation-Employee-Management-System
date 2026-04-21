// src/services/managerEmployeeService.js
import api from "./api";

// Submits data to create a new employee profile and their associated system account
export const createEmployeeApi = async (payload) => {
  const res = await api.post("/manager/employees", payload);
  return res.data;
};

// Deactivates an employee's account effectively removing them from active payroll and dashboard
export const deactivateEmployeeApi = async (employee_id) => {
  const res = await api.patch(`/manager/employees/${employee_id}/deactivate`);
  return res.data;
};

// Returns a complete list of all employees in the organization
export const getEmployeesApi = async () => {
  const res = await api.get("/manager/employees");
  return res.data;
};

// Retrieves a list of all defined departments within the system
export const getDepartmentsApi = async () => {
  const res = await api.get("/manager/departments");
  return res.data;
};

// Updates an existing employee's details based on provided payload
export const updateEmployeeApi = async (employee_id, payload) => {
  const res = await api.put(`/manager/employees/${employee_id}`, payload);
  return res.data;
};

// Fetches overall organizational KPIs and summary stats for the manager dashboard
export const getDashboardStatsApi = async () => {
  const res = await api.get("/manager/stats");
  return res.data;
};

// Retrieves specific attendance metrics and status for a single employee
export const getEmployeeAttendanceStatsApi = async (employee_id) => {
  const res = await api.get(`/manager/attendance/${employee_id}/stats`);
  return res.data;
};

// Returns a list of employees who have resigned or terminated and are ready for final settlement
export const getSettlementReadyEmployeesApi = async () => {
  const res = await api.get("/manager/employees/settlement-ready");
  return res.data;
};
