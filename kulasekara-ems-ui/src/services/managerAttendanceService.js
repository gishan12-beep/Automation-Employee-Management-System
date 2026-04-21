import api from "./api";

// Submits attendance records (check-in/out, status) for an employee on behalf of a manager
export const markAttendanceApi = async (payload) => {
    const res = await api.post("/manager/attendance", payload);
    return res.data;
};
