import { pool } from "../config/db.js";

// Get all issues with employee details
export const getAllIssues = async () => {
    const [rows] = await pool.query(`
        SELECT i.*, e.first_name, e.last_name, d.name as department
        FROM issues i
        JOIN employee e ON i.employee_id = e.employee_id
        LEFT JOIN departments d ON e.department_id = d.id
        ORDER BY i.created_at DESC
    `);
    return rows;
};

// Update issue status and reply
export const updateIssue = async (id, { status, reply }) => {
    const [result] = await pool.query(
        "UPDATE issues SET status = ?, reply = ? WHERE id = ?",
        [status, reply, id]
    );
    return result;
};

// Get issues by employee
export const getIssuesByEmployee = async (employeeId) => {
    const [rows] = await pool.query(
        "SELECT * FROM issues WHERE employee_id = ? ORDER BY created_at DESC",
        [employeeId]
    );
    return rows;
};

// Create an issue
export const createIssue = async (issueData) => {
    const { employee_id, title, category, description, priority } = issueData;
    const [result] = await pool.query(
        "INSERT INTO issues (employee_id, title, category, description, priority, status) VALUES (?, ?, ?, ?, ?, 'PENDING')",
        [employee_id, title, category, description, priority]
    );
    return result.insertId;
};
