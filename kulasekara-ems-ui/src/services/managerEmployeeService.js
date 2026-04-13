// src/services/managerEmployeeService.js
import api from "./api";

export const createEmployeeApi = async (payload) => {
  const res = await api.post("/manager/employees", payload);
  return res.data;
};

export const deactivateEmployeeApi = async (employee_id) => {
  const res = await api.patch(`/manager/employees/${employee_id}/deactivate`);
  return res.data;
};

export const getEmployeesApi = async () => {
  const res = await api.get("/manager/employees");
  return res.data;
};

export const getDepartmentsApi = async () => {
  const res = await api.get("/manager/departments");
  return res.data;
};

export const updateEmployeeApi = async (employee_id, payload) => {
  const res = await api.put(`/manager/employees/${employee_id}`, payload);
  return res.data;
};

export const getDashboardStatsApi = async () => {
  const res = await api.get("/manager/stats");
  return res.data;
};

export const getEmployeeAttendanceStatsApi = async (employee_id) => {
  const res = await api.get(`/manager/attendance/${employee_id}/stats`);
  return res.data;
};

export const getSettlementReadyEmployeesApi = async () => {
  const res = await api.get("/manager/employees/settlement-ready");
  return res.data;
};
