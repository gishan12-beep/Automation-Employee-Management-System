import { pool } from "../config/db.js";

/**
 * Fetch all available task rates
 */
export const getAllTaskRates = async () => {
    const [rows] = await pool.query("SELECT * FROM task_rates ORDER BY task_name");
    return rows;
};

/**
 * Insert a new work log record
 */
export const insertWorkLog = async (logData) => {
    const { employee_id, task_id, date, quantity, applied_rate } = logData;
    const [result] = await pool.query(
        "INSERT INTO work_logs (employee_id, task_id, date, quantity, applied_rate) VALUES (?, ?, ?, ?, ?)",
        [employee_id, task_id, date, quantity, applied_rate]
    );
    return result.insertId;
};

/**
 * Get work logs for an employee on a specific date
 */
export const getWorkLogsByEmployeeAndDate = async (employee_id, date) => {
    const [rows] = await pool.query(
        `SELECT wl.*, tr.task_name, tr.unit_measure 
         FROM work_logs wl
         JOIN task_rates tr ON wl.task_id = tr.task_id
         WHERE wl.employee_id = ? AND wl.date = ?
         ORDER BY wl.log_id DESC`,
        [employee_id, date]
    );
    return rows;
};
