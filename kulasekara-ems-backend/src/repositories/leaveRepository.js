import { pool } from "../config/db.js";

// Fetches all leave requests for all employees joined with their leave type names
export const getAllLeaveRequests = async () => {
    const [rows] = await pool.query(`
        SELECT lr.*, lt.type_name as leave_type 
        FROM leave_requests lr
        JOIN leave_types lt ON lr.leave_type_id = lt.id
        ORDER BY lr.start_date DESC
    `);
    return rows;
};

// Updates the status and manager's remark for a specific leave request
export const updateLeaveStatus = async (leaveId, status, managerRemark) => {
    const [result] = await pool.query(
        "UPDATE leave_requests SET status = ?, manager_remark = ? WHERE leave_id = ?",
        [status, managerRemark, leaveId]
    );
    return result;
};

// Returns all leave requests submitted by a specific employee
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

// Inserts a new leave request record into the database with a PENDING status
export const createLeaveRequest = async (leaveData) => {
    const { employee_id, leave_type_id, start_date, end_date, reason } = leaveData;
    const [result] = await pool.query(
        `INSERT INTO leave_requests (employee_id, leave_type_id, start_date, end_date, reason, status) 
         VALUES (?, ?, ?, ?, ?, 'PENDING')`,
        [employee_id, leave_type_id, start_date, end_date, reason]
    );
    return result.insertId;
};

// Retrieves a list of all predefined leave types (e.g., Casual, Sick, Annual)
export const getLeaveTypes = async () => {
    const [rows] = await pool.query("SELECT * FROM leave_types ORDER BY type_name ASC");
    return rows;
};

// Removes a specific leave request from the database
export const deleteLeaveRequest = async (id) => {
    await pool.query("DELETE FROM leave_requests WHERE leave_id = ?", [id]);
};
