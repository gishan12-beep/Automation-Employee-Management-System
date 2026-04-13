import { pool } from "../config/db.js";

// ✅ Get active employees
export const getActiveEmployees = async () => {
    const [rows] = await pool.query(
        "SELECT employee_id, first_name, last_name, email, department_id, status FROM employee WHERE status = 'ACTIVE'"
    );
    return rows;
};

// ✅ Get latest salary config effectively for the month
export const getSalaryConfig = async (employeeId, month, year) => {
    // Construct the last day of the given month to ensure we pick the config active by then
    // Format: 'YYYY-MM-DD'
    const lastDay = new Date(year, month, 0).toISOString().slice(0, 10);
    console.log(`[REPO] Fetching salary config for ${employeeId} effective by ${lastDay}`);

    const [rows] = await pool.query(
        `SELECT * FROM salary_configurations 
     WHERE employee_id = ? AND effective_date <= ? 
     ORDER BY effective_date DESC LIMIT 1`,
        [employeeId, lastDay]
    );
    const config = rows[0] || null;
    console.log(`[REPO] Config retrieved for ${employeeId}:`, config);
    return config;
};

// ✅ Get unapproved absent days for a specific month/year
// Defines "Unapproved Absence" as any day where:
// 1. Status is 'ABSENT' in attendance table
// 2. AND there is no 'APPROVED' leave request covering that date
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

// ✅ Count Late Days for a specific month/year
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

// ✅ Check for ANY attendance issues that disqualify for Perfect Attendance
export const checkPerfectAttendanceDisqualifier = async (employeeId, month, year) => {
    // Disqualified if ANY of these exist:
    // 1. Attendance status in ('ABSENT', 'LATE', 'HALF_DAY')
    // 2. OR unapproved leaves? User said: "ABSENT, LATE, HALF_DAY, or unapproved leave"
    // Technically ABSENT covers unapproved leave if they didn't show up. If they took an APPROVED leave, they might or might not be disqualified based on company policy.
    // The prompt says: "if no ABSENT, LATE, HALF_DAY, or unapproved leave". 
    // This strictly means they CAN have an APPROVED leave and still get the perfect attendance if they weren't late.

    // We check attendance specifically for the disqualifying statuses.
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
    return rows[0].count > 0; // True if disqualified
};

// ✅ Sum work logs total_amount for daily workers
export const getWorkLogsTotalAmount = async (employeeId, month, year) => {
    const [rows] = await pool.query(
        `SELECT COALESCE(SUM(quantity * applied_rate), 0) as total 
         FROM work_logs 
         WHERE employee_id = ? AND MONTH(date) = ? AND YEAR(date) = ?`,
        [employeeId, month, year]
    );
    return rows[0].total;
};

// ✅ Sum overtime amount
export const getOvertimeTotal = async (employeeId, month, year) => {
    const [rows] = await pool.query(
        `SELECT COALESCE(SUM(total_amount), 0) as total FROM overtime_records 
     WHERE employee_id = ? AND MONTH(date) = ? AND YEAR(date) = ?`,
        [employeeId, month, year]
    );
    return rows[0].total;
};

// ✅ Sum incentives amount (excluding automatic attendance bonus if we want to avoid double counting during re-runs)
export const getIncentivesTotal = async (employeeId, month, year) => {
    const [rows] = await pool.query(
        `SELECT COALESCE(SUM(amount), 0) as total FROM incentives 
         WHERE employee_id = ? AND MONTH(date) = ? AND YEAR(date) = ?`,
        [employeeId, month, year]
    );
    return rows[0].total;
};

// ✅ Get Incentive Rule
export const getIncentiveRule = async (ruleCode) => {
    const [rows] = await pool.query(
        `SELECT * FROM incentive_rules WHERE rule_code = ? AND is_active = 1 LIMIT 1`,
        [ruleCode]
    );
    return rows[0] || null;
};

// ✅ Get Deduction Rule
export const getDeductionRule = async (ruleCode) => {
    const [rows] = await pool.query(
        `SELECT * FROM deduction_rules WHERE rule_code = ? AND is_active = 1 LIMIT 1`,
        [ruleCode]
    );
    return rows[0] || null;
};

// ✅ Sum deductions amount
export const getDeductionsTotal = async (employeeId, month, year) => {
    const [rows] = await pool.query(
        `SELECT COALESCE(SUM(amount), 0) as total FROM deductions 
     WHERE employee_id = ? AND MONTH(date) = ? AND YEAR(date) = ?`,
        [employeeId, month, year]
    );
    return rows[0].total;
};

// ✅ Get individual incentives for an employee/month/year
export const getIncentivesByEmployee = async (employeeId, month, year) => {
    const [rows] = await pool.query(
        `SELECT * FROM incentives 
         WHERE employee_id = ? AND MONTH(date) = ? AND YEAR(date) = ? 
         ORDER BY date DESC`,
        [employeeId, month, year]
    );
    return rows;
};

// ✅ Get individual deductions for an employee/month/year
export const getDeductionsByEmployee = async (employeeId, month, year) => {
    const [rows] = await pool.query(
        `SELECT * FROM deductions 
         WHERE employee_id = ? AND MONTH(date) = ? AND YEAR(date) = ? 
         ORDER BY date DESC`,
        [employeeId, month, year]
    );
    return rows;
};

// ✅ Check existing payroll run - now returns the payroll_id
export const checkExistingPayroll = async (employeeId, month, year) => {
    const [rows] = await pool.query(
        `SELECT payroll_id FROM payroll_runs 
     WHERE employee_id = ? AND month = ? AND year = ?`,
        [employeeId, month, year]
    );
    return rows.length > 0 ? rows[0].payroll_id : null;
};

// ✅ Update a full payroll record
export const updatePayrollRunFull = async (payrollData, conn) => {
    const db = conn || pool;
    await db.query(
        `UPDATE payroll_runs SET 
          basic_earnings = ?, total_ot_pay = ?, total_incentives = ?, total_deductions = ?,
          gross_pay = ?, epf_employee = ?, epf_employer = ?, etf_employer = ?, net_pay = ?,
          generated_at = NOW()
         WHERE payroll_id = ?`,
        [
            payrollData.basic_earnings, payrollData.total_ot_pay, payrollData.total_incentives, payrollData.total_deductions,
            payrollData.gross_pay, payrollData.epf_employee, payrollData.epf_employer, payrollData.etf_employer, payrollData.net_pay,
            payrollData.payroll_id
        ]
    );
};

// ✅ Sum all adjustments for a payroll_id
export const getAdjustmentsTotal = async (payrollId) => {
    const [rows] = await pool.query(
        `SELECT SUM(CASE WHEN adjustment_type = 'BONUS' THEN amount ELSE -amount END) as total 
         FROM payroll_adjustments 
         WHERE payroll_id = ?`,
        [payrollId]
    );
    return Number(rows[0].total) || 0;
};

// ✅ Insert payroll run
export const insertPayrollRun = async (payrollData, conn) => {
    const db = conn || pool;

    // TRACE LOG
    console.log(`[REPO] SQL INSERT for ${payrollData.employee_id}:`, {
        basic: payrollData.basic_earnings,
        gross: payrollData.gross_pay,
        net: payrollData.net_pay
    });

    const [result] = await db.query(
        `INSERT INTO payroll_runs (
          employee_id, month, year, 
          basic_earnings, total_ot_pay, total_incentives, total_deductions,
          gross_pay, epf_employee, epf_employer, etf_employer, net_pay,
          generated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
            payrollData.employee_id, payrollData.month, payrollData.year,
            payrollData.basic_earnings, payrollData.total_ot_pay, payrollData.total_incentives, payrollData.total_deductions,
            payrollData.gross_pay, payrollData.epf_employee, payrollData.epf_employer, payrollData.etf_employer, payrollData.net_pay
        ]
    );
    return result.insertId;
};

// ✅ Get payroll history for employee
export const getPayrollByEmployee = async (employeeId, month, year) => {
    // If month/year provided, filter by it, else all
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

// ✅ Get payroll summary for month/year
export const getPayrollSummary = async (month, year) => {
    const [rows] = await pool.query(
        `SELECT pr.*, e.first_name, e.last_name, d.name as department
     FROM payroll_runs pr
     JOIN employee e ON pr.employee_id = e.employee_id
     LEFT JOIN departments d ON e.department_id = d.id
     WHERE pr.month = ? AND pr.year = ?
     ORDER BY d.name, e.last_name`,
        [month, year]
    );
    return rows;
};

// ✅ Get single payroll run
export const getPayrollRunById = async (payrollId) => {
    const [rows] = await pool.query(
        `SELECT * FROM payroll_runs WHERE payroll_id = ?`,
        [payrollId]
    );
    return rows[0] || null;
};

// ✅ Update payroll run (ONLY Net Pay via Patches)
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

// ✅ Insert Accountant Adjustment to payroll_adjustments
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

// ✅ Insert into incentives table
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

// ✅ Insert into deductions table
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
