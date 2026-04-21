import api from "./api";

// Fetches consolidated KPI statistics (attendance, leave, etc.) for the logged-in employee
export const getEmployeeDashboardStats = async () => {
  try {
    const res = await api.get("/employee/dashboard/stats");
    return res.data;
  } catch (err) {
    console.error("Error fetching employee dashboard stats:", err);
    throw err;
  }
};

// Retrieves a list of recent events and notifications for the employee's dashboard
export const getRecentActivity = async () => {
  try {
    const res = await api.get("/employee/dashboard/recent-activity");
    return res.data;
  } catch (err) {
    console.error("Error fetching recent activity:", err);
    throw err;
  }
};
