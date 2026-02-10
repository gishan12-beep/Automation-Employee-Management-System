import { pool } from "../config/db.js";

/**
 * GET /api/employee/attendance/today
 * - Get today's attendance record for the logged-in employee
 */
export const getTodayAttendance = async (req, res) => {
    const employee_id = req.user.employee_id;
    const today = new Date().toISOString().slice(0, 10);

    try {
        const [rows] = await pool.query(
            "SELECT * FROM attendance WHERE employee_id = ? AND date = ?",
            [employee_id, today]
        );

        if (rows.length === 0) {
            return res.json({ attendance: null });
        }

        return res.json({ attendance: rows[0] });
    } catch (err) {
        return res.status(500).json({ message: "Fetch attendance failed", error: err.message });
    }
};

/**
 * POST /api/employee/attendance/check-in
 * - Create a new attendance record for today with check_in time
 */
export const markCheckIn = async (req, res) => {
    const employee_id = req.user.employee_id;
    const today = new Date().toISOString().slice(0, 10);
    const now = new Date();
    const timeString = now.toTimeString().slice(0, 8); // HH:MM:SS

    const conn = await pool.getConnection();
    try {
        // Check if already checked in
        const [existing] = await conn.query(
            "SELECT attendance_id FROM attendance WHERE employee_id = ? AND date = ?",
            [employee_id, today]
        );

        if (existing.length > 0) {
            conn.release();
            return res.status(400).json({ message: "Attendance record already exists for today" });
        }

        await conn.query(
            `INSERT INTO attendance (employee_id, date, check_in, status)
       VALUES (?, ?, ?, 'PRESENT')`,
            [employee_id, today, timeString]
        );

        conn.release();
        return res.status(201).json({ message: "Checked in successfully", check_in: timeString });
    } catch (err) {
        conn.release();
        return res.status(500).json({ message: "Check-in failed", error: err.message });
    }
};

/**
 * PUT /api/employee/attendance/check-out
 * - Update today's attendance record with check_out time
 */
export const markCheckOut = async (req, res) => {
    const employee_id = req.user.employee_id;
    const today = new Date().toISOString().slice(0, 10);
    const now = new Date();
    const timeString = now.toTimeString().slice(0, 8); // HH:MM:SS

    const conn = await pool.getConnection();
    try {
        // Check if record exists
        const [existing] = await conn.query(
            "SELECT attendance_id, check_out FROM attendance WHERE employee_id = ? AND date = ?",
            [employee_id, today]
        );

        if (existing.length === 0) {
            conn.release();
            return res.status(400).json({ message: "No attendance record found for today. Please check in first." });
        }

        if (existing[0].check_out) {
            conn.release();
            return res.status(400).json({ message: "Already checked out for today" });
        }

        await conn.query(
            "UPDATE attendance SET check_out = ? WHERE attendance_id = ?",
            [timeString, existing[0].attendance_id]
        );

        conn.release();
        return res.json({ message: "Checked out successfully", check_out: timeString });
    } catch (err) {
        conn.release();
        return res.status(500).json({ message: "Check-out failed", error: err.message });
    }
};
