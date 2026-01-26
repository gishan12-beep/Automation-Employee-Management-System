import api from "./api";

export const listWithdrawalsApi = async ({ month, year }) => {
  const res = await api.get(`/cash-withdrawals?month=${month}&year=${year}`);
  return res.data;
};

export const createWithdrawalApi = async (payload) => {
  const res = await api.post(`/cash-withdrawals`, payload);
  return res.data;
};

export const updateWithdrawalApi = async (id, payload) => {
  const res = await api.put(`/cash-withdrawals/${id}`, payload);
  return res.data;
};

export const deleteWithdrawalApi = async (id) => {
  const res = await api.delete(`/cash-withdrawals/${id}`);
  return res.data;
};
