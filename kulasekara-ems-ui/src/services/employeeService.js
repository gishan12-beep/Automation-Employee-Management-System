import api from "./api";

// Get today's attendance
export const getTodayAttendanceApi = async () => {
    const res = await api.get("/employee/attendance/today");
    return res.data;
};

// Check in
export const markCheckInApi = async () => {
    const res = await api.post("/employee/attendance/check-in");
    return res.data; // { message, check_in }
};

// Check out
export const markCheckOutApi = async () => {
    const res = await api.put("/employee/attendance/check-out");
    return res.data; // { message, check_out }
};
