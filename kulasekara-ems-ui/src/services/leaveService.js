import axios from "axios";

// Helper function to get the auth headers
const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

const MANAGER_API_URL = "http://localhost:5000/api/manager/leaves"; // update port if needed
const EMPLOYEE_API_URL = "http://localhost:5000/api/employee/leaves";
export const leaveService = {
    // Fetch all leave requests
    fetchLeaveRequests: async () => {
        try {
            const response = await axios.get(MANAGER_API_URL, getAuthHeaders());
            return response.data;
        } catch (error) {
            console.error("Error fetching leave requests:", error);
            throw error;
        }
    },

    // Update a leave request status
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

    // Get my leave requests (employee)
    fetchMyLeaveRequests: async () => {
        try {
            const response = await axios.get(EMPLOYEE_API_URL, getAuthHeaders());
            return response.data;
        } catch (error) {
            console.error("Error fetching my leave requests:", error);
            throw error;
        }
    },

    // Submit a new leave request
    submitLeaveRequest: async (leaveData) => {
        try {
            const response = await axios.post(EMPLOYEE_API_URL, leaveData, getAuthHeaders());
            return response.data;
        } catch (error) {
            console.error("Error submitting leave request:", error);
            throw error;
        }
    },

    // Fetch leave types (employee or manager, endpoint differs slightly, using manager as default fallback or generic)
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
