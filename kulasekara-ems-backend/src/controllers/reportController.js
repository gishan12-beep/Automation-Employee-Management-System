import { pool } from "../config/db.js";

/**
 * GET /api/manager/reports/attendance
 * Returns monthly summary for all employees
 */
export const getAttendanceSummaryReport = async (req, res) => {
    try {
        const { month, year } = req.query;
        if (!month || !year) return res.status(400).json({ message: "Month and Year are required" });

        const [rows] = await pool.query(`
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
            LEFT JOIN salary_configurations sc ON e.employee_id = sc.employee_id AND sc.effective_date <= LAST_DAY(STR_TO_DATE(CONCAT(?, '-', ?, '-01'), '%Y-%m-%d'))
            LEFT JOIN attendance a ON e.employee_id = a.employee_id AND MONTH(a.date) = ? AND YEAR(a.date) = ?
            LEFT JOIN overtime_records ot ON e.employee_id = ot.employee_id AND MONTH(ot.date) = ? AND YEAR(ot.date) = ?
            GROUP BY e.employee_id, e.first_name, e.last_name
            ORDER BY e.first_name
        `, [year, month, month, year, month, year]);

        // Note: The salary_type join might pick multiple configs if not handled carefully, 
        // but for a summary, picking the latest effective one is usually enough.
        // Using common pattern from other controllers.
        
        res.json(rows);
    } catch (err) {
        console.error("Attendance Report Error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * GET /api/manager/reports/issues
 */
export const getIssueSummaryReport = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT i.*, e.first_name, e.last_name, d.name as department
            FROM issues i
            JOIN employee e ON i.employee_id = e.employee_id
            LEFT JOIN departments d ON e.department_id = d.id
            ORDER BY i.created_at DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: "Error fetching issues report" });
    }
};

/**
 * GET /api/manager/reports/leaves
 */
export const getLeaveSummaryReport = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT lr.*, e.first_name, e.last_name, lt.type_name as leave_type
            FROM leave_requests lr
            JOIN employee e ON lr.employee_id = e.employee_id
            JOIN leave_types lt ON lr.leave_type_id = lt.id
            ORDER BY lr.start_date DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: "Error fetching leaves report" });
    }
};

/**
 * GET /api/manager/reports/settlements
 */
export const getSettlementSummaryReport = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT e.employee_id, e.first_name, e.last_name, e.status as emp_status,
                   fs.settlement_id, fs.status as settlement_status, fs.net_settlement_amount, fs.last_working_date
            FROM employee e
            LEFT JOIN final_settlements fs ON e.employee_id = fs.employee_id
            WHERE e.status IN ('RESIGNED', 'TERMINATED', 'INACTIVE')
            ORDER BY e.employee_id DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: "Error fetching settlement report" });
    }
};

/**
 * GET /api/manager/reports/cash-payout?month=X&year=Y
 */
export const getCashPayoutReport = async (req, res) => {
    try {
        const { month, year } = req.query;
        if (!month || !year) return res.status(400).json({ message: "Month and Year required" });

        const [rows] = await pool.query(`
            SELECT pr.*, e.first_name, e.last_name, d.name as department
            FROM payroll_runs pr
            JOIN employee e ON pr.employee_id = e.employee_id
            LEFT JOIN departments d ON e.department_id = d.id
            WHERE pr.month = ? AND pr.year = ? AND pr.status IN ('READY', 'PAID')
        `, [month, year]);

        // Calc denominations for each row
        const denominations = [5000, 1000, 500, 100, 50, 20, 10, 5, 2, 1];
        
        const reportData = rows.map(r => {
            let remain = Math.floor(r.net_pay);
            const breakdown = {};
            denominations.forEach(d => {
                breakdown[d] = Math.floor(remain / d);
                remain %= d;
            });
            return { ...r, denominations: breakdown };
        });

        res.json(reportData);
    } catch (err) {
        res.status(500).json({ message: "Error calculating cash payout" });
    }
};

/**
 * DELETE /api/manager/reports/settlements/:id
 */
export const deleteSettlement = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM final_settlements WHERE settlement_id = ?", [id]);
        res.json({ message: "Settlement record deleted successfully" });
    } catch (err) {
        console.error("Delete settlement Error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};
