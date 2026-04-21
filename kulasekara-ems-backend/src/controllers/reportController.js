import { pool } from "../config/db.js";

/**
 * Generates a monthly attendance summary report for all employees.
 * Aggregates present/absent/late days and total OT hours.
 * 
 * @param {Object} req - request object with query { month, year }
 * @param {Object} res - Response object
 */
export const getAttendanceSummaryReport = async (req, res) => {
    try {
        const { month, year } = req.query;
        if (!month || !year) {
            return res.status(400).json({ message: "Month and Year are required parameters." });
        }

        // Fetch aggregated attendance data joined with salary config for employee type
        const [reportRows] = await pool.query(`
            SELECT 
                e.employee_id, 
                e.first_name, 
                e.last_name, 
                MAX(sc.salary_type) as employee_type,
                COUNT(CASE WHEN a.status = 'PRESENT' THEN 1 END) as present_days,
                COUNT(CASE WHEN a.status = 'ABSENT' THEN 1 END) as absent_days,
                COUNT(CASE WHEN a.status = 'LATE' THEN 1 END) as late_days,
                SUM(COALESCE(ot.ot_hours, 0)) as total_ot_hours
            FROM employee e
            LEFT JOIN salary_configurations sc ON e.employee_id = sc.employee_id 
                AND sc.effective_date <= LAST_DAY(STR_TO_DATE(CONCAT(?, '-', ?, '-01'), '%Y-%m-%d'))
            LEFT JOIN attendance a ON e.employee_id = a.employee_id 
                AND MONTH(a.date) = ? AND YEAR(a.date) = ?
            LEFT JOIN overtime_records ot ON e.employee_id = ot.employee_id 
                AND MONTH(ot.date) = ? AND YEAR(ot.date) = ?
            GROUP BY e.employee_id, e.first_name, e.last_name
            ORDER BY e.first_name ASC
        `, [year, month, month, year, month, year]);

        return res.json(reportRows);
    } catch (err) {
        console.error("[REPORT] Attendance Report Error:", err);
        return res.status(500).json({ message: "Failed to generate attendance report." });
    }
};

/**
 * Generates a report of all employee issues/complaints.
 * 
 * @param {Object} req 
 * @param {Object} res 
 */
export const getIssueSummaryReport = async (req, res) => {
    try {
        const [issueRows] = await pool.query(`
            SELECT i.*, e.first_name, e.last_name, d.name as department
            FROM issues i
            JOIN employee e ON i.employee_id = e.employee_id
            LEFT JOIN departments d ON e.department_id = d.id
            ORDER BY i.created_at DESC
        `);
        return res.json(issueRows);
    } catch (err) {
        console.error("[REPORT] Issue Report Error:", err);
        return res.status(500).json({ message: "Failed to fetch issues report." });
    }
};

/**
 * Generates a report of all leave requests.
 * 
 * @param {Object} req 
 * @param {Object} res 
 */
export const getLeaveSummaryReport = async (req, res) => {
    try {
        const [leaveRows] = await pool.query(`
            SELECT lr.*, e.first_name, e.last_name, lt.type_name as leave_type
            FROM leave_requests lr
            JOIN employee e ON lr.employee_id = e.employee_id
            JOIN leave_types lt ON lr.leave_type_id = lt.id
            ORDER BY lr.start_date DESC
        `);
        return res.json(leaveRows);
    } catch (err) {
        console.error("[REPORT] Leave Report Error:", err);
        return res.status(500).json({ message: "Failed to fetch leaves report." });
    }
};

/**
 * Generates a report of employees ready for final settlement (Resigned/Terminated).
 * 
 * @param {Object} req 
 * @param {Object} res 
 */
export const getSettlementSummaryReport = async (req, res) => {
    try {
        const [settlementRows] = await pool.query(`
            SELECT e.employee_id, e.first_name, e.last_name, e.status as emp_status,
                   fs.settlement_id, fs.status as settlement_status, fs.net_settlement_amount, fs.last_working_date
            FROM employee e
            LEFT JOIN final_settlements fs ON e.employee_id = fs.employee_id
            WHERE e.status IN ('RESIGNED', 'TERMINATED', 'INACTIVE')
            ORDER BY e.employee_id DESC
        `);
        return res.json(settlementRows);
    } catch (err) {
        console.error("[REPORT] Settlement Report Error:", err);
        return res.status(500).json({ message: "Failed to fetch settlement report." });
    }
};

/**
 * Generates a cash payout report including currency denomination breakdown.
 * Used for physical cash payment distribution.
 * 
 * @param {Object} req 
 * @param {Object} res 
 */
export const getCashPayoutReport = async (req, res) => {
    try {
        const { month, year } = req.query;
        if (!month || !year) {
            return res.status(400).json({ message: "Month and Year are required." });
        }

        const [payrollRows] = await pool.query(`
            SELECT pr.*, e.first_name, e.last_name, d.name as department
            FROM payroll_runs pr
            JOIN employee e ON pr.employee_id = e.employee_id
            LEFT JOIN departments d ON e.department_id = d.id
            WHERE pr.month = ? AND pr.year = ? AND pr.status IN ('READY', 'PAID')
        `, [month, year]);

        // Currency denominations used in Sri Lanka (LKR)
        const denominations = [5000, 1000, 500, 100, 50, 20, 10, 5, 2, 1];
        
        const reportWithBreakdown = payrollRows.map(row => {
            let remainingAmount = Math.floor(row.net_pay);
            const breakdown = {};
            denominations.forEach(denom => {
                breakdown[denom] = Math.floor(remainingAmount / denom);
                remainingAmount %= denom;
            });
            return { ...row, denominations: breakdown };
        });

        return res.json(reportWithBreakdown);
    } catch (err) {
        console.error("[REPORT] Cash Payout Error:", err);
        return res.status(500).json({ message: "Failed to calculate cash payout denominations." });
    }
};

/**
 * Deletes a final settlement record.
 * 
 * @param {Object} req 
 * @param {Object} res 
 */
export const deleteSettlement = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM final_settlements WHERE settlement_id = ?", [id]);
        return res.json({ message: "Settlement record deleted successfully." });
    } catch (err) {
        console.error("[REPORT] Delete Settlement Error:", err);
        return res.status(500).json({ message: "Internal server error." });
    }
};
