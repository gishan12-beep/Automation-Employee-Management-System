import api from "./api";

/**
 * Fetch consolidated dashboard stats for the logged-in employee
 */
export const getEmployeeDashboardStats = async () => {
  try {
    const res = await api.get("/employee/dashboard/stats");
    return res.data;
  } catch (err) {
    console.error("Error fetching employee dashboard stats:", err);
    throw err;
  }
};

/**
 * Fetch recent attendance and notifications for the logged-in employee
 */
export const getRecentActivity = async () => {
  try {
    const res = await api.get("/employee/dashboard/recent-activity");
    return res.data;
  } catch (err) {
    console.error("Error fetching recent activity:", err);
    throw err;
  }
};
