import { pool } from "../config/db.js";

// Returns a list of all currently active employees
export const getActiveEmployees = async () => {
    const [rows] = await pool.query(
        "SELECT employee_id, first_name, last_name, email, department_id, status FROM employee WHERE status = 'ACTIVE'"
    );
    return rows;
};

// Retrieves the salary configuration for an employee that was effective during the specified month/year
export const getSalaryConfig = async (employeeId, month, year) => {
    const lastDay = new Date(year, month, 0).toISOString().slice(0, 10);
    const [rows] = await pool.query(
        `SELECT * FROM salary_configurations 
     WHERE employee_id = ? AND effective_date <= ? 
     ORDER BY effective_date DESC LIMIT 1`,
        [employeeId, lastDay]
    );
    return rows[0] || null;
};

// Calculates the number of days an employee was absent without an approved leave request
export const getUnapprovedAbsentDays = async (employeeId, month, year) => {
    const [rows] = await pool.query(
        `SELECT COUNT(*) as count 
         FROM attendance a
         WHERE a.employee_id = ? 
           AND MONTH(a.date) = ? 
           AND YEAR(a.date) = ? 
           AND a.status = 'ABSENT'
           AND NOT EXISTS (
               SELECT 1 FROM leave_requests lr 
               WHERE lr.employee_id = a.employee_id 
                 AND a.date BETWEEN lr.start_date AND lr.end_date 
                 AND lr.status = 'APPROVED'
           )`,
        [employeeId, month, year]
    );
    return rows[0].count;
};

// Counts the total number of days an employee was marked as LATE in a given month
export const getLateDaysCount = async (employeeId, month, year) => {
    const [rows] = await pool.query(
        `SELECT COUNT(*) as count 
         FROM attendance 
         WHERE employee_id = ? 
           AND MONTH(date) = ? 
           AND YEAR(date) = ? 
           AND status = 'LATE'`,
        [employeeId, month, year]
    );
    return rows[0].count;
};

// Checks if an employee had any attendance issues (Late, Absent, Half-Day) that disqualify them from a perfect attendance bonus
export const checkPerfectAttendanceDisqualifier = async (employeeId, month, year) => {
    const [rows] = await pool.query(
        `SELECT COUNT(*) as count 
         FROM attendance a
         WHERE a.employee_id = ? 
           AND MONTH(a.date) = ? 
           AND YEAR(a.date) = ? 
           AND (
               a.status IN ('LATE', 'HALF_DAY') 
               OR 
               (a.status = 'ABSENT' AND NOT EXISTS (
                   SELECT 1 FROM leave_requests lr 
                   WHERE lr.employee_id = a.employee_id 
                     AND a.date BETWEEN lr.start_date AND lr.end_date 
                     AND lr.status = 'APPROVED'
               ))
           )`,
        [employeeId, month, year]
    );
    return rows[0].count > 0;
};

// Calculates the total earnings from piece-rate work logs for a specific month
export const getWorkLogsTotalAmount = async (employeeId, month, year) => {
    const [rows] = await pool.query(
        `SELECT COALESCE(SUM(quantity * applied_rate), 0) as total 
         FROM work_logs 
         WHERE employee_id = ? AND MONTH(date) = ? AND YEAR(date) = ?`,
        [employeeId, month, year]
    );
    return rows[0].total;
};

// Sums the total overtime pay earned by an employee in a specific month
export const getOvertimeTotal = async (employeeId, month, year) => {
    const [rows] = await pool.query(
        `SELECT COALESCE(SUM(total_amount), 0) as total FROM overtime_records 
     WHERE employee_id = ? AND MONTH(date) = ? AND YEAR(date) = ?`,
        [employeeId, month, year]
    );
    return rows[0].total;
};

// Sums all monetary incentives awarded to an employee in a specific month
export const getIncentivesTotal = async (employeeId, month, year) => {
    const [rows] = await pool.query(
        `SELECT COALESCE(SUM(amount), 0) as total FROM incentives 
         WHERE employee_id = ? AND MONTH(date) = ? AND YEAR(date) = ?`,
        [employeeId, month, year]
    );
    return rows[0].total;
};

// Fetches an incentive rule definition by its unique code
export const getIncentiveRule = async (ruleCode) => {
    const [rows] = await pool.query(
        `SELECT * FROM incentive_rules WHERE rule_code = ? AND is_active = 1 LIMIT 1`,
        [ruleCode]
    );
    return rows[0] || null;
};

// Fetches a deduction rule definition by its unique code
export const getDeductionRule = async (ruleCode) => {
    const [rows] = await pool.query(
        `SELECT * FROM deduction_rules WHERE rule_code = ? AND is_active = 1 LIMIT 1`,
        [ruleCode]
    );
    return rows[0] || null;
};

// Sums all deductions applied to an employee in a specific month
export const getDeductionsTotal = async (employeeId, month, year) => {
    const [rows] = await pool.query(
        `SELECT COALESCE(SUM(amount), 0) as total FROM deductions 
     WHERE employee_id = ? AND MONTH(date) = ? AND YEAR(date) = ?`,
        [employeeId, month, year]
    );
    return rows[0].total;
};

// Retrieves all individual incentive records for an employee in a specific month
export const getIncentivesByEmployee = async (employeeId, month, year) => {
    const [rows] = await pool.query(
        `SELECT * FROM incentives 
         WHERE employee_id = ? AND MONTH(date) = ? AND YEAR(date) = ? 
         ORDER BY date DESC`,
        [employeeId, month, year]
    );
    return rows;
};

// Retrieves all individual deduction records for an employee in a specific month
export const getDeductionsByEmployee = async (employeeId, month, year) => {
    const [rows] = await pool.query(
        `SELECT * FROM deductions 
         WHERE employee_id = ? AND MONTH(date) = ? AND YEAR(date) = ? 
         ORDER BY date DESC`,
        [employeeId, month, year]
    );
    return rows;
};

// Checks if a payroll record already exists for an employee in a given month/year
export const checkExistingPayroll = async (employeeId, month, year) => {
    const [rows] = await pool.query(
        `SELECT payroll_id FROM payroll_runs 
     WHERE employee_id = ? AND month = ? AND year = ?`,
        [employeeId, month, year]
    );
    return rows.length > 0 ? rows[0].payroll_id : null;
};

// Updates an entire payroll run record with new calculated values
export const updatePayrollRunFull = async (payrollData, conn) => {
    const db = conn || pool;
    await db.query(
        `UPDATE payroll_runs SET 
          basic_earnings = ?, total_ot_pay = ?, total_incentives = ?, total_deductions = ?,
          gross_pay = ?, epf_employee = ?, epf_employer = ?, etf_employer = ?, net_pay = ?,
          status = ?, generated_at = NOW()
         WHERE payroll_id = ?`,
        [
            payrollData.basic_earnings, payrollData.total_ot_pay, payrollData.total_incentives, payrollData.total_deductions,
            payrollData.gross_pay, payrollData.epf_employee, payrollData.epf_employer, payrollData.etf_employer, payrollData.net_pay,
            payrollData.status || 'PENDING',
            payrollData.payroll_id
        ]
    );
};

// Calculates the net sum of all accountant adjustments (Bonuses vs Deductions) for a payroll run
export const getAdjustmentsTotal = async (payrollId) => {
    const [rows] = await pool.query(
        `SELECT SUM(CASE WHEN adjustment_type = 'BONUS' THEN amount ELSE -amount END) as total 
         FROM payroll_adjustments 
         WHERE payroll_id = ?`,
        [payrollId]
    );
    return Number(rows[0].total) || 0;
};

// Inserts a new payroll run record into the database
export const insertPayrollRun = async (payrollData, conn) => {
    const db = conn || pool;
    const [result] = await db.query(
        `INSERT INTO payroll_runs (
          employee_id, month, year, 
          basic_earnings, total_ot_pay, total_incentives, total_deductions,
          gross_pay, epf_employee, epf_employer, etf_employer, net_pay,
          status, generated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
            payrollData.employee_id, payrollData.month, payrollData.year,
            payrollData.basic_earnings, payrollData.total_ot_pay, payrollData.total_incentives, payrollData.total_deductions,
            payrollData.gross_pay, payrollData.epf_employee, payrollData.epf_employer, payrollData.etf_employer, payrollData.net_pay,
            payrollData.status || 'PENDING'
        ]
    );
    return result.insertId;
};

// Fetches payroll records for a specific employee, optionally filtered by month and year
export const getPayrollByEmployee = async (employeeId, month, year) => {
    let query = `SELECT * FROM payroll_runs WHERE employee_id = ?`;
    let params = [employeeId];

    if (month && year) {
        query += ` AND month = ? AND year = ?`;
        params.push(month, year);
    }
    query += ` ORDER BY year DESC, month DESC`;

    const [rows] = await pool.query(query, params);
    return rows;
};

// Retrieves a summary of all payroll runs for a month, including employee and department details
export const getPayrollSummary = async (month, year) => {
    const [rows] = await pool.query(
        `SELECT pr.*, e.first_name, e.last_name, d.name as department, s.salary_type
     FROM payroll_runs pr
     JOIN employee e ON pr.employee_id = e.employee_id
     LEFT JOIN departments d ON e.department_id = d.id
     LEFT JOIN salary_configurations s ON s.employee_id = e.employee_id
       AND s.effective_date = (
         SELECT MAX(s2.effective_date)
         FROM salary_configurations s2
         WHERE s2.employee_id = e.employee_id
           AND s2.effective_date <= LAST_DAY(STR_TO_DATE(CONCAT(?, '-', ?, '-01'), '%Y-%m-%d'))
       )
     WHERE pr.month = ? AND pr.year = ?
     ORDER BY d.name, e.last_name`,
        [year, month, month, year]
    );
    return rows;
};

// Fetches a single payroll run record by its ID
export const getPayrollRunById = async (payrollId) => {
    const [rows] = await pool.query(
        `SELECT * FROM payroll_runs WHERE payroll_id = ?`,
        [payrollId]
    );
    return rows[0] || null;
};

// Updates only the net pay field of a specific payroll run
export const updatePayrollRunNetPay = async (payrollId, newNetPay, conn) => {
    const db = conn || pool;
    await db.query(
        `UPDATE payroll_runs SET 
      net_pay = ?
     WHERE payroll_id = ?`,
        [
            newNetPay,
            payrollId
        ]
    );
};

// Records a manual adjustment made by an accountant to a specific payroll run
export const insertPayrollAdjustment = async (adjustmentData, conn) => {
    const db = conn || pool;
    await db.query(
        `INSERT INTO payroll_adjustments (
            payroll_id, created_by, adjustment_type, amount, reason, created_at
        ) VALUES (?, ?, ?, ?, ?, NOW())`,
        [
            adjustmentData.payroll_id,
            adjustmentData.adjusted_by_user_id,
            adjustmentData.adjustment_type,
            adjustmentData.amount,
            adjustmentData.reason
        ]
    );
};

// Inserts a record into the incentives table for an employee
export const insertIncentive = async (incentiveData, conn) => {
    const db = conn || pool;
    await db.query(
        `INSERT INTO incentives (employee_id, date, amount, description) 
         VALUES (?, ?, ?, ?)`,
        [
            incentiveData.employee_id,
            incentiveData.date,
            incentiveData.amount,
            incentiveData.description
        ]
    );
};

// Inserts a record into the deductions table for an employee
export const insertDeduction = async (deductionData, conn) => {
    const db = conn || pool;
    await db.query(
        `INSERT INTO deductions (employee_id, date, amount, reason) 
         VALUES (?, ?, ?, ?)`,
        [
            deductionData.employee_id,
            deductionData.date,
            deductionData.amount,
            deductionData.reason
        ]
    );
};

// Updates the status (e.g., PENDING, READY, PAID) of a specific payroll run
export async function updatePayrollStatus(payrollId, status, conn) {
    const db = conn || pool;
    await db.query(
        `UPDATE payroll_runs SET status = ? WHERE payroll_id = ?`,
        [status, payrollId]
    );
}
