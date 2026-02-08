import api from "./api";

export const markAttendanceApi = async (payload) => {
    const res = await api.post("/manager/attendance", payload);
    return res.data;
};
