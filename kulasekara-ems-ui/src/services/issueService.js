import api from "./api";

// Fetch all issues (for manager)
export const getIssuesApi = async () => {
  const res = await api.get("/issues");
  return res.data;
};

// Fetch a single issue (for manager)
export const getIssueByIdApi = async (id) => {
  const res = await api.get(`/issues/${id}`);
  return res.data;
};

// Resolve an issue (for manager)
export const resolveIssueApi = async (id, data) => {
  const res = await api.patch(`/issues/${id}/resolve`, data);
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

