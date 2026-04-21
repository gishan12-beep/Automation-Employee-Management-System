import { pool } from "../config/db.js";

// Fetches all recorded issues joined with employee and department names
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

// Returns all issues reported by a specific employee
export const getIssuesByEmployee = async (employeeId) => {
    const [rows] = await pool.query(
        "SELECT * FROM issues WHERE employee_id = ? ORDER BY created_at DESC",
        [employeeId]
    );
    return rows;
};

// Records a new issue or complaint in the database
export const createIssue = async (issueData) => {
    const { employee_id, type, description } = issueData;
    const [result] = await pool.query(
        "INSERT INTO issues (employee_id, type, description, status) VALUES (?, ?, ?, 'OPEN')",
        [employee_id, type, description]
    );
    return result.insertId;
};

// Updates existing issue record with a new status (e.g. RESOLVED) and mandatory manager reply
export const updateIssue = async (id, updateData) => {
    const { status, reply } = updateData;
    await pool.query(
        "UPDATE issues SET status = ?, reply = ? WHERE issue_id = ?",
        [status, reply, id]
    );
};

// Retrieves a specific issue record by its primary key (issue_id)
export const getIssueById = async (id) => {
    const [rows] = await pool.query(
        `SELECT i.*, e.first_name, e.last_name 
         FROM issues i 
         JOIN employee e ON i.employee_id = e.employee_id 
         WHERE i.issue_id = ?`,
        [id]
    );
    return rows[0];
};

// Deletes a specific issue record from the database
export const deleteIssue = async (id) => {
    await pool.query("DELETE FROM issues WHERE issue_id = ?", [id]);
};
