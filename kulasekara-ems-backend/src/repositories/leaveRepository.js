import { pool } from "../config/db.js";

// Get all leave requests
export const getAllLeaveRequests = async () => {
    const [rows] = await pool.query(`
        SELECT lr.*, lt.type_name as leave_type 
        FROM leave_requests lr
        JOIN leave_types lt ON lr.leave_type_id = lt.id
        ORDER BY lr.start_date DESC
    `);
    return rows;
};

// Update leave request status
export const updateLeaveStatus = async (leaveId, status, managerRemark) => {
    const [result] = await pool.query(
        "UPDATE leave_requests SET status = ?, manager_remark = ? WHERE leave_id = ?",
        [status, managerRemark, leaveId]
    );
    return result;
};

// Get leave requests by employee
export const getLeaveRequestsByEmployee = async (employeeId) => {
    const [rows] = await pool.query(`
        SELECT lr.*, lt.type_name as leave_type
        FROM leave_requests lr
        JOIN leave_types lt ON lr.leave_type_id = lt.id
        WHERE lr.employee_id = ? 
        ORDER BY lr.start_date DESC
    `, [employeeId]);
    return rows;
};

// Create a new leave request
export const createLeaveRequest = async (leaveData) => {
    const { employee_id, leave_type_id, start_date, end_date, reason } = leaveData;
    const [result] = await pool.query(
        `INSERT INTO leave_requests (employee_id, leave_type_id, start_date, end_date, reason, status) 
         VALUES (?, ?, ?, ?, ?, 'PENDING')`,
        [employee_id, leave_type_id, start_date, end_date, reason]
    );
    return result.insertId;
};

// Get leave types
export const getLeaveTypes = async () => {
    const [rows] = await pool.query("SELECT * FROM leave_types ORDER BY type_name ASC");
    return rows;
};
