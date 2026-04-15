import api from "./api";

// Fetch all issues (for manager)
export const getIssuesApi = async () => {
  const res = await api.get("/manager/issues");
  return res.data;
};

// Resolve an issue (for manager)
export const resolveIssueApi = async (id, payload) => {
  const res = await api.patch(`/manager/issues/${id}/resolve`, payload);
  return res.data;
};

// Get my issues (for employee)
export const getMyIssuesApi = async () => {
  const res = await api.get("/my-issues");
  return res.data;
};

// Create an issue (for employee)
export const createIssueApi = async (payload) => {
  const res = await api.post("/issues", payload);
  return res.data;
};

