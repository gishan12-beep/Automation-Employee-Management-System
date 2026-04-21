import { pool } from "../config/db.js";

// Retrieves current day's attendance record (if any) for the logged-in employee
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

// Records the check-in time for the employee for the current day
export const markCheckIn = async (req, res) => {
    const employee_id = req.user.employee_id;
    const today = new Date().toISOString().slice(0, 10);
    const now = new Date();
    const timeString = now.toTimeString().slice(0, 8); // HH:MM:SS

    const conn = await pool.getConnection();
    try {
        // Prevent duplicate check-ins for the same day
        const [existing] = await conn.query(
            "SELECT attendance_id FROM attendance WHERE employee_id = ? AND date = ?",
            [employee_id, today]
        );

        if (existing.length > 0) {
            conn.release();
            return res.status(400).json({ message: "Attendance record already exists for today" });
        }

        // Insert new record with status PRESENT
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

// Records the check-out time for the employee for the current day
export const markCheckOut = async (req, res) => {
    const employee_id = req.user.employee_id;
    const today = new Date().toISOString().slice(0, 10);
    const now = new Date();
    const timeString = now.toTimeString().slice(0, 8); // HH:MM:SS

    const conn = await pool.getConnection();
    try {
        // Ensure an attendance record exists before allowing check-out
        const [existing] = await conn.query(
            "SELECT attendance_id, check_out FROM attendance WHERE employee_id = ? AND date = ?",
            [employee_id, today]
        );

        if (existing.length === 0) {
            conn.release();
            return res.status(400).json({ message: "No attendance record found for today. Please check in first." });
        }

        // Prevent multiple check-outs
        if (existing[0].check_out) {
            conn.release();
            return res.status(400).json({ message: "Already checked out for today" });
        }

        // Update existing record with check-out time
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
