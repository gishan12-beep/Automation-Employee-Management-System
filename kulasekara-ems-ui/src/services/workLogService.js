import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const getHeader = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
});

/**
 * Fetch all available task rates
 */
export const getTasksApi = async () => {
    const response = await axios.get(`${API_BASE_URL}/manager/work/tasks`, getHeader());
    return response.data;
};

/**
 * Create a new work log
 */
export const createWorkLogApi = async (payload) => {
    const response = await axios.post(`${API_BASE_URL}/manager/work/logs`, payload, getHeader());
    return response.data;
};

/**
 * Fetch work logs for an employee on a specific date
 */
export const getEmployeeWorkLogsApi = async (employeeId, date) => {
    const response = await axios.get(`${API_BASE_URL}/manager/work/logs/${employeeId}/${date}`, getHeader());
    return response.data;
};
