import { pool } from "../config/db.js";
import * as payrollRepo from "../repositories/payrollRepository.js";
import * as issueRepo from "../repositories/issueRepository.js";
import * as leaveRepo from "../repositories/leaveRepository.js";

/**
 * GET /api/employee/dashboard/stats
 * returns consolidated stats for the logged in employee
 */
export const getEmployeeStats = async (req, res) => {
    try {
        const employeeId = req.user.employee_id;
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();
        const monthPadded = String(month).padStart(2, '0');
        const startOfMonth = `${year}-${monthPadded}-01`;

        // 0. Profile Info
        const [profileRows] = await pool.query(
            `SELECT e.*, d.name as department_name 
             FROM employee e 
             LEFT JOIN departments d ON e.department_id = d.id 
             WHERE e.employee_id = ?`,
            [employeeId]
        );
        const profile = profileRows[0] || null;

        // 1. Attendance Stats (Present/Absent/Late)
        const [attendanceRows] = await pool.query(
            `SELECT status, COUNT(*) as count 
             FROM attendance 
             WHERE employee_id = ? AND MONTH(date) = ? AND YEAR(date) = ? 
             GROUP BY status`,
            [employeeId, month, year]
        );

        let presentDays = 0;
        let absentDays = 0;
        let lateDays = 0;

        attendanceRows.forEach(row => {
            if (row.status === 'PRESENT') presentDays += row.count;
            if (row.status === 'LATE') {
                presentDays += row.count;
                lateDays += row.count;
            }
            if (row.status === 'ABSENT') absentDays += row.count;
        });

        // 2. OT Hours
        const [otRows] = await pool.query(
            `SELECT SUM(ot_hours) as total_hours FROM overtime_records 
             WHERE employee_id = ? AND MONTH(date) = ? AND YEAR(date) = ?`,
            [employeeId, month, year]
        );
        const otHours = otRows[0].total_hours || 0;

        // 3. Approved Leaves
        const [leaveRows] = await pool.query(
            `SELECT SUM(DATEDIFF(LEAST(end_date, LAST_DAY(STR_TO_DATE(?, '%Y-%m-%d'))), GREATEST(start_date, STR_TO_DATE(?, '%Y-%m-%d'))) + 1) as total_days
             FROM leave_requests
             WHERE employee_id = ? AND status = 'APPROVED'
               AND start_date <= LAST_DAY(STR_TO_DATE(?, '%Y-%m-%d'))
               AND end_date >= STR_TO_DATE(?, '%Y-%m-%d')`,
            [
                startOfMonth, startOfMonth, 
                employeeId, 
                startOfMonth, startOfMonth
            ]
        );
        const approvedLeaves = leaveRows[0].total_days || 0;

        // 4. Pending Issues
        const [issueRows] = await pool.query(
            "SELECT COUNT(*) as count FROM issues WHERE employee_id = ? AND status = 'PENDING'",
            [employeeId]
        );
        const pendingIssues = issueRows[0].count || 0;

        // 5. Estimated Net Salary (from processed payroll if available, else zero)
        const existingPayrollId = await payrollRepo.checkExistingPayroll(employeeId, month, year);
        let thisMonthNet = 0;
        if (existingPayrollId) {
            const payroll = await payrollRepo.getPayrollRunById(existingPayrollId);
            thisMonthNet = payroll.net_pay;
        }

        res.json({
            profile,
            presentDays,
            absentDays,
            otHours,
            approvedLeaves,
            pendingIssues,
            thisMonthNet
        });

    } catch (err) {
        console.error("GET EMPLOYEE DASHBOARD STATS ERROR:", err);
        res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
};

/**
 * GET /api/employee/dashboard/recent-activity
 */
export const getRecentActivity = async (req, res) => {
    try {
        const employeeId = req.user.employee_id;

        // 1. Recent Attendance
        const [attendance] = await pool.query(
            "SELECT date, check_in as `in`, check_out as `out`, status FROM attendance WHERE employee_id = ? ORDER BY date DESC LIMIT 5",
            [employeeId]
        );

        // 2. Recent Notifications (Leave/Issue updates)
        const [leaves] = await pool.query(
            "SELECT 'Leave Request' as title, CONCAT('Your leave request for ', DATE_FORMAT(start_date, '%b %d'), ' is ', status) as description, updated_at as time FROM leave_requests WHERE employee_id = ? ORDER BY updated_at DESC LIMIT 3",
            [employeeId]
        );

        const [issues] = await pool.query(
            "SELECT 'Issue Update' as title, CONCAT('Your issue \"', title, '\" is now ', status) as description, updated_at as time FROM issues WHERE employee_id = ? ORDER BY updated_at DESC LIMIT 3",
            [employeeId]
        );

        const notifications = [...leaves, ...issues].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);

        res.json({
            attendance,
            notifications
        });

    } catch (err) {
        console.error("GET RECENT ACTIVITY ERROR:", err);
        res.status(500).json({ error: "Failed to fetch recent activity" });
    }
};
