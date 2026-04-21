import api from "./api";

// Retrieves the current day's attendance record (check-in/out times) for the employee
export const getTodayAttendanceApi = async () => {
    const res = await api.get("/employee/attendance/today");
    return res.data;
};

// Sends a request to record the employee's check-in time for today
export const markCheckInApi = async () => {
    const res = await api.post("/employee/attendance/check-in");
    return res.data; // { message, check_in }
};

// Sends a request to record the employee's check-out time for today
export const markCheckOutApi = async () => {
    const res = await api.put("/employee/attendance/check-out");
    return res.data; // { message, check_out }
};
