import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Returns a config object with the Authorization header for axios requests
const getHeader = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
});

// Retrieves a list of available tasks and their corresponding rates
export const getTasksApi = async () => {
    const response = await axios.get(`${API_BASE_URL}/manager/work/tasks`, getHeader());
    return response.data;
};

// Submits a new work log entry recording completed units for a specific task
export const createWorkLogApi = async (payload) => {
    const response = await axios.post(`${API_BASE_URL}/manager/work/logs`, payload, getHeader());
    return response.data;
};

// Fetches all work log entries for a specific employee on a given date
export const getEmployeeWorkLogsApi = async (employeeId, date) => {
    const response = await axios.get(`${API_BASE_URL}/manager/work/logs/${employeeId}/${date}`, getHeader());
    return response.data;
};
