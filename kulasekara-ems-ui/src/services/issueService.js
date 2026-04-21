import api from "./api";

// Fetches a complete list of all issues reported by employees (Manager access)
export const getIssuesApi = async () => {
  const res = await api.get("/issues");
  return res.data;
};

// Retrieves detailed information for a specific issue by its ID
export const getIssueByIdApi = async (id) => {
  const res = await api.get(`/issues/${id}`);
  return res.data;
};

// Updates an issue with a resolution status and manager's remarks
export const resolveIssueApi = async (id, data) => {
  const res = await api.patch(`/issues/${id}/resolve`, data);
  return res.data;
};

// Retrieves a list of issues reported by the currently logged-in employee
export const getMyIssuesApi = async () => {
  const res = await api.get("/my-issues");
  return res.data;
};

// Submits a new issue or complaint on behalf of the logged-in employee
export const createIssueApi = async (payload) => {
  const res = await api.post("/issues", payload);
  return res.data;
};

