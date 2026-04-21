import axios from "axios";

// Helper function to generate standardized authentication headers containing the JWT token
const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

const MANAGER_API_URL = "http://localhost:5000/api/manager/leaves"; 
const EMPLOYEE_API_URL = "http://localhost:5000/api/employee/leaves";

export const leaveService = {
    // Retrieves all leave requests submitted by any employee (Manager access)
    fetchLeaveRequests: async () => {
        try {
            const response = await axios.get(MANAGER_API_URL, getAuthHeaders());
            return response.data;
        } catch (error) {
            console.error("Error fetching leave requests:", error);
            throw error;
        }
    },

    // Approves or rejects a specific leave request and adds an optional manager's remark
    updateLeaveRequestStatus: async (leaveId, status, remark) => {
        try {
            const response = await axios.patch(
                `${MANAGER_API_URL}/${leaveId}/status`,
                { status, remark },
                getAuthHeaders()
            );
            return response.data;
        } catch (error) {
            console.error(`Error updating leave request ${leaveId} status:`, error);
            throw error;
        }
    },

    // Fetches the leave request history for the currently logged-in employee
    fetchMyLeaveRequests: async () => {
        try {
            const response = await axios.get(EMPLOYEE_API_URL, getAuthHeaders());
            return response.data;
        } catch (error) {
            console.error("Error fetching my leave requests:", error);
            throw error;
        }
    },

    // Submits a new leave request including type, dates, and reason
    submitLeaveRequest: async (leaveData) => {
        try {
            const response = await axios.post(EMPLOYEE_API_URL, leaveData, getAuthHeaders());
            return response.data;
        } catch (error) {
            console.error("Error submitting leave request:", error);
            throw error;
        }
    },

    // Retrieves the available types of leave from the server based on the user's role
    fetchLeaveTypes: async (role = "MANAGER") => {
        try {
            const URL = role === "EMPLOYEE"
                ? "http://localhost:5000/api/employee/leave-types"
                : "http://localhost:5000/api/manager/leave-types";
            const response = await axios.get(URL, getAuthHeaders());
            return response.data;
        } catch (error) {
            console.error("Error fetching leave types:", error);
            throw error;
        }
    },
};
