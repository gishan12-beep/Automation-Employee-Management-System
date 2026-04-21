import { pool } from "../config/db.js";

// Marks or updates an attendance record for a specific employee on a given date (Manager access)
export const markAttendance = async (req, res) => {
    const { employee_id, date, check_in, check_out, status } = req.body;

    // Required field validation
    if (!employee_id || !date || !status) {
        return res.status(400).json({ message: "Missing required fields: employee_id, date, status" });
    }

    // Status enum validation
    const validStatuses = ['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'LEAVE'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
    }

    const conn = await pool.getConnection();
    try {
        // Find existing record to determine if this is an INSERT or UPDATE
        const [existing] = await conn.query(
            "SELECT attendance_id FROM attendance WHERE employee_id = ? AND date = ?",
            [employee_id, date]
        );

        if (existing.length > 0) {
            // Update the existing record for the same employee and date
            await conn.query(
                `UPDATE attendance 
             SET check_in = ?, check_out = ?, status = ? 
             WHERE attendance_id = ?`,
                [check_in || null, check_out || null, status, existing[0].attendance_id]
            );
            return res.json({ message: "Attendance updated successfully" });
        } else {
            // Insert a new attendance record
            await conn.query(
                `INSERT INTO attendance (employee_id, date, check_in, check_out, status)
             VALUES (?, ?, ?, ?, ?)`,
                [employee_id, date, check_in || null, check_out || null, status]
            );
            return res.status(201).json({ message: "Attendance marked successfully" });
        }

    } catch (err) {
        return res.status(500).json({ message: "Mark attendance failed", error: err.message });
    } finally {
        conn.release();
    }
};

// Retrieves the most recent attendance record for a specific employee
export const getEmployeeAttendanceStats = async (req, res) => {
    const { employee_id } = req.params;

    try {
        const [rows] = await pool.query(
            `SELECT * FROM attendance 
             WHERE employee_id = ? 
             ORDER BY date DESC, attendance_id DESC 
             LIMIT 1`,
            [employee_id]
        );

        if (rows.length === 0) {
            return res.json({ attendance: null });
        }

        return res.json({ attendance: rows[0] });
    } catch (err) {
        return res.status(500).json({ message: "Fetch stats failed", error: err.message });
    }
};
