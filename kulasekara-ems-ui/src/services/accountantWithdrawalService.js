import api from "./api";

// Retrieves a list of cash withdrawals recorded for a specific month and year
export const listWithdrawalsApi = async ({ month, year }) => {
  const res = await api.get(`/cash-withdrawals?month=${month}&year=${year}`);
  return res.data;
};

// Records a new cash withdrawal event with details like amount, date, and reference
export const createWithdrawalApi = async (payload) => {
  const res = await api.post(`/cash-withdrawals`, payload);
  return res.data;
};

// Updates existing information for a specific cash withdrawal record
export const updateWithdrawalApi = async (id, payload) => {
  const res = await api.put(`/cash-withdrawals/${id}`, payload);
  return res.data;
};

// Permanently removes a cash withdrawal record from the system
export const deleteWithdrawalApi = async (id) => {
  const res = await api.delete(`/cash-withdrawals/${id}`);
  return res.data;
};
