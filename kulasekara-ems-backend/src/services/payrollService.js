import { pool } from "../config/db.js";
import * as payrollRepo from "../repositories/payrollRepository.js";

/**
 * Processes the monthly payroll for all active employees.
 * Calculates basic earnings, incentives (perfect attendance), deductions (late fines),
 * OT pay, and statutory contributions (EPF/ETF).
 * 
 * @param {number} month - The month of the payroll (1-12)
 * @param {number} year - The year of the payroll
 * @returns {Promise<Object>} - Processing summary { processedCount, skippedCount, details }
 */
export const processMonthlyPayroll = async (month, year) => {
    const connection = await pool.getConnection();

    let processedCount = 0;
    let skippedCount = 0;
    const processingResults = [];

    try {
        await connection.beginTransaction();

        const activeEmployees = await payrollRepo.getActiveEmployees();

        // Find total days in month for "pro-rata deduction" logic
        const totalDaysInMonth = new Date(year, month, 0).getDate();

        for (const employee of activeEmployees) {
            console.log(`[PAYROLL] Processing employee: ${employee.employee_id}`);

            // 1. Check if record exists
            const existingPayrollId = await payrollRepo.checkExistingPayroll(employee.employee_id, month, year);

            // 2. Fetch Salary Configuration
            const salaryConfig = await payrollRepo.getSalaryConfig(employee.employee_id, month, year);
            if (!salaryConfig) {
                console.warn(`No salary config found for employee ${employee.employee_id}`);
                skippedCount++;
                continue;
            }

            const isMonthly = salaryConfig.salary_type === 'MONTHLY';
            const isDaily = salaryConfig.salary_type === 'DAILY';

            let basicEarnings = 0;
            let dynamicIncentives = 0;
            let dynamicDeductions = 0;

            // 3. Compute Basic Earnings and dynamic rules
            if (isMonthly) {
                const unapprovedAbsences = await payrollRepo.getUnapprovedAbsentDays(employee.employee_id, month, year);
                const basicRate = Number(salaryConfig.basic_rate) || 0;
                // Calculate monthly earnings minus unapproved absent days
                basicEarnings = basicRate - (unapprovedAbsences * (basicRate / totalDaysInMonth));
            } else if (isDaily) {
                // For daily workers, basic earnings is the sum of approved work logs
                basicEarnings = await payrollRepo.getWorkLogsTotalAmount(employee.employee_id, month, year);
            }

            // 4. Perfect Attendance Bonus Logic
            const isDisqualifiedForBonus = await payrollRepo.checkPerfectAttendanceDisqualifier(employee.employee_id, month, year);
            if (!isDisqualifiedForBonus) {
                const perfAttRule = await payrollRepo.getIncentiveRule('PERFECT_ATTENDANCE');
                if (perfAttRule) {
                    dynamicIncentives += Number(perfAttRule.amount) || 0;
                }
            }

            // 5. Late Deduction Logic (Late Fines)
            const lateCount = await payrollRepo.getLateDaysCount(employee.employee_id, month, year);
            if (lateCount > 0) {
                const lateFineRule = await payrollRepo.getDeductionRule('LATE_FINE');
                if (lateFineRule) {
                    dynamicDeductions += lateCount * (Number(lateFineRule.amount) || 0);
                }
            }

            // 6. Aggregate other components (OT, Manual Incentives/Deductions)
            const overtimePay = Number(await payrollRepo.getOvertimeTotal(employee.employee_id, month, year)) || 0;
            const manualIncentives = Number(await payrollRepo.getIncentivesTotal(employee.employee_id, month, year)) || 0;
            const manualDeductions = Number(await payrollRepo.getDeductionsTotal(employee.employee_id, month, year)) || 0;

            const totalIncentives = dynamicIncentives + manualIncentives;
            const totalDeductions = dynamicDeductions + manualDeductions;

            // 7. Gross Pay Calculation
            const grossPay = (Number(basicEarnings) || 0) + overtimePay + totalIncentives;

            // 8. Statutory Contributions (EPF/ETF)
            let epfEmployee = 0;
            let epfEmployer = 0;
            let etfEmployer = 0;

            if (salaryConfig.is_epf_eligible == 1) {
                epfEmployee = basicEarnings * 0.08;
                epfEmployer = basicEarnings * 0.12;
                etfEmployer = basicEarnings * 0.03;
            }

            // 9. Net Pay Calculation
            let netPay = grossPay - epfEmployee - totalDeductions;

            // 9b. Incorporate existing manual adjustments if re-generating
            if (existingPayrollId) {
                const adjustmentTotal = await payrollRepo.getAdjustmentsTotal(existingPayrollId);
                netPay += adjustmentTotal;
            }

            if (netPay < 0) netPay = 0;

            // 10. Prepare Snapshot Record
            const safeBasic = Number(basicEarnings) || 0;
            const payrollRecord = {
                employee_id: employee.employee_id,
                month,
                year,
                basic_earnings: parseFloat((safeBasic).toFixed(2)),
                total_ot_pay: parseFloat((overtimePay || 0).toFixed(2)),
                total_incentives: parseFloat((totalIncentives || 0).toFixed(2)),
                total_deductions: parseFloat((totalDeductions || 0).toFixed(2)),
                gross_pay: parseFloat((grossPay || 0).toFixed(2)),
                epf_employee: parseFloat((epfEmployee || 0).toFixed(2)),
                epf_employer: parseFloat((epfEmployer || 0).toFixed(2)),
                etf_employer: parseFloat((etfEmployer || 0).toFixed(2)),
                net_pay: parseFloat((netPay || 0).toFixed(2)),
                status: 'PENDING'
            };

            // 11. Save to Database
            if (existingPayrollId) {
                await payrollRepo.updatePayrollRunFull({ ...payrollRecord, payroll_id: existingPayrollId }, connection);
            } else {
                await payrollRepo.insertPayrollRun(payrollRecord, connection);
            }

            processingResults.push({
                ...payrollRecord,
                first_name: employee.first_name,
                last_name: employee.last_name
            });

            processedCount++;
        }

        await connection.commit();
        return { processedCount, skippedCount, details: processingResults };

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

/**
 * Processes payroll for a specific individual employee.
 * 
 * @param {string} employeeId - The unique ID of the employee
 * @param {number} month - The payroll month
 * @param {number} year - The payroll year
 * @returns {Promise<Object>} - Status and details of the processed payroll
 */
export const processSingleEmployeePayroll = async (employeeId, month, year) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Check if record exists
        const existingPayrollId = await payrollRepo.checkExistingPayroll(employeeId, month, year);

        // 2. Fetch Employee details
        const [employeeRows] = await connection.query(`SELECT first_name, last_name, employee_id FROM employee WHERE employee_id = ?`, [employeeId]);
        if (employeeRows.length === 0) {
            return { success: false, message: `Employee ${employeeId} not found` };
        }
        const employee = employeeRows[0];

        // 3. Fetch Salary Config
        const salaryConfig = await payrollRepo.getSalaryConfig(employeeId, month, year);
        if (!salaryConfig) {
            return { success: false, message: `No salary configuration found for ${employeeId}` };
        }

        const totalDaysInMonth = new Date(year, month, 0).getDate();
        const isMonthly = salaryConfig.salary_type === 'MONTHLY';
        const isDaily = salaryConfig.salary_type === 'DAILY';

        let basicEarnings = 0;
        let dynamicIncentives = 0;
        let dynamicDeductions = 0;

        // 4. Compute Basic Earnings and dynamic rules
        if (isMonthly) {
            const unapprovedAbsences = await payrollRepo.getUnapprovedAbsentDays(employeeId, month, year);
            const basicRate = Number(salaryConfig.basic_rate) || 0;
            basicEarnings = basicRate - (unapprovedAbsences * (basicRate / totalDaysInMonth));
        } else if (isDaily) {
            basicEarnings = await payrollRepo.getWorkLogsTotalAmount(employeeId, month, year);
        }

        // 5. Perfect Attendance Bonus Logic
        const isDisqualifiedForBonus = await payrollRepo.checkPerfectAttendanceDisqualifier(employeeId, month, year);
        if (!isDisqualifiedForBonus) {
            const perfAttRule = await payrollRepo.getIncentiveRule('PERFECT_ATTENDANCE');
            if (perfAttRule) {
                dynamicIncentives += Number(perfAttRule.amount) || 0;
            }
        }

        // 6. Late Deduction Logic
        const lateCount = await payrollRepo.getLateDaysCount(employeeId, month, year);
        if (lateCount > 0) {
            const lateFineRule = await payrollRepo.getDeductionRule('LATE_FINE');
            if (lateFineRule) {
                dynamicDeductions += lateCount * (Number(lateFineRule.amount) || 0);
            }
        }

        // 7. Aggregate other components
        const overtimePay = Number(await payrollRepo.getOvertimeTotal(employeeId, month, year)) || 0;
        const manualIncentives = Number(await payrollRepo.getIncentivesTotal(employeeId, month, year)) || 0;
        const manualDeductions = Number(await payrollRepo.getDeductionsTotal(employeeId, month, year)) || 0;

        const totalIncentives = dynamicIncentives + manualIncentives;
        const totalDeductions = dynamicDeductions + manualDeductions;

        // 8. Gross Pay
        const grossPay = (Number(basicEarnings) || 0) + overtimePay + totalIncentives;

        // 9. EPF/ETF Logic
        let epfEmployee = 0;
        let epfEmployer = 0;
        let etfEmployer = 0;

        if (salaryConfig.is_epf_eligible == 1) {
            epfEmployee = basicEarnings * 0.08;
            epfEmployer = basicEarnings * 0.12;
            etfEmployer = basicEarnings * 0.03;
        }

        // 10. Net Pay
        let netPay = grossPay - epfEmployee - totalDeductions;

        // 10b. Incorporate existing manual adjustments if re-generating
        if (existingPayrollId) {
            const adjustmentTotal = await payrollRepo.getAdjustmentsTotal(existingPayrollId);
            netPay += adjustmentTotal;
        }

        if (netPay < 0) netPay = 0;

        // 11. Prepare Snapshot Record
        const safeBasic = Number(basicEarnings) || 0;
        const payrollRecord = {
            employee_id: employeeId,
            month,
            year,
            basic_earnings: parseFloat((safeBasic).toFixed(2)),
            total_ot_pay: parseFloat((overtimePay || 0).toFixed(2)),
            total_incentives: parseFloat((totalIncentives || 0).toFixed(2)),
            total_deductions: parseFloat((totalDeductions || 0).toFixed(2)),
            gross_pay: parseFloat((grossPay || 0).toFixed(2)),
            epf_employee: parseFloat((epfEmployee || 0).toFixed(2)),
            epf_employer: parseFloat((epfEmployer || 0).toFixed(2)),
            etf_employer: parseFloat((etfEmployer || 0).toFixed(2)),
            net_pay: parseFloat((netPay || 0).toFixed(2)),
            status: 'PENDING'
        };

        let finalPayrollId = existingPayrollId;
        if (existingPayrollId) {
            await payrollRepo.updatePayrollRunFull({ ...payrollRecord, payroll_id: existingPayrollId }, connection);
        } else {
            finalPayrollId = await payrollRepo.insertPayrollRun(payrollRecord, connection);
        }

        await connection.commit();
        return {
            success: true,
            message: existingPayrollId ? "Payroll updated successfully" : "Payroll processed successfully",
            payrollId: finalPayrollId,
            details: {
                ...payrollRecord,
                first_name: employee.first_name,
                last_name: employee.last_name
            }
        };

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

/**
 * Retrieves the payroll record for a specific employee.
 * 
 * @param {string} employeeId 
 * @param {number} month 
 * @param {number} year 
 * @returns {Promise<Object>}
 */
export const getEmployeePayroll = async (employeeId, month, year) => {
    return await payrollRepo.getPayrollByEmployee(employeeId, month, year);
};

/**
 * Generates a summary of all payroll runs for a given month/year.
 * 
 * @param {number} month 
 * @param {number} year 
 * @returns {Promise<Object>}
 */
export const getPayrollSummary = async (month, year) => {
    const payrollRuns = await payrollRepo.getPayrollSummary(month, year);

    // Calculate accumulation totals
    const accumulation = payrollRuns.reduce((acc, run) => {
        acc.total_gross += Number(run.gross_pay) || 0;
        acc.total_net += Number(run.net_pay) || 0;
        acc.total_epf_employee += Number(run.epf_employee) || 0;
        acc.total_epf_employer += Number(run.epf_employer) || 0;
        acc.total_etf += Number(run.etf_employer) || 0;
        return acc;
    }, {
        total_gross: 0,
        total_net: 0,
        total_epf_employee: 0,
        total_epf_employer: 0,
        total_etf: 0
    });

    return { summary: accumulation, details: payrollRuns };
};

/**
 * Fetches detailed itemized information for a specific payroll run.
 * 
 * @param {string} employeeId 
 * @param {number} month 
 * @param {number} year 
 * @returns {Promise<Object|null>}
 */
export const getPayrollRunDetails = async (employeeId, month, year) => {
    const payrollId = await payrollRepo.checkExistingPayroll(employeeId, month, year);
    if (!payrollId) return null;

    const payrollRun = await payrollRepo.getPayrollRunById(payrollId);
    const [employeeRows] = await pool.query(`SELECT first_name, last_name, employee_id FROM employee WHERE employee_id = ?`, [employeeId]);
    
    const incentives = await payrollRepo.getIncentivesByEmployee(employeeId, month, year);
    const deductions = await payrollRepo.getDeductionsByEmployee(employeeId, month, year);

    return {
        payroll: payrollRun,
        employee: employeeRows[0],
        incentives,
        deductions
    };
};

/**
 * Allows an Accountant to manually edit or adjust a payroll run.
 * Supports single adjustments (Bonus/Deduction) or full payslip modification.
 * 
 * @param {number} payrollId 
 * @param {Object} patch - The data to update
 * @param {Object} editedByUser - The user performing the edit
 * @returns {Promise<Object>}
 */
export const editPayrollRun = async (payrollId, patch, editedByUser) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const existingRun = await payrollRepo.getPayrollRunById(payrollId);
        if (!existingRun) {
            throw new Error("Payroll run not found");
        }

        let updatedRecord = { ...existingRun };

        // Handle simple adjustments (BONUS or DEDUCTION)
        if (patch.adjustment_type === 'BONUS' || patch.adjustment_type === 'DEDUCTION') {
            const adjustmentAmount = Number(patch.amount);

            // Create Audit/Trace Record
            await payrollRepo.insertPayrollAdjustment({
                payroll_id: payrollId,
                adjusted_by_user_id: editedByUser.user_id,
                adjustment_type: patch.adjustment_type,
                amount: adjustmentAmount,
                reason: patch.reason
            }, connection);

            // Sync with dedicated Incentives/Deductions tables
            const transactionDate = new Date(existingRun.year, existingRun.month - 1, 1);

            if (patch.adjustment_type === 'BONUS') {
                await payrollRepo.insertIncentive({
                    employee_id: existingRun.employee_id,
                    date: transactionDate,
                    amount: adjustmentAmount,
                    description: patch.reason || "Manual Adjustment"
                }, connection);
                updatedRecord.total_incentives = (Number(updatedRecord.total_incentives) || 0) + adjustmentAmount;
            } else if (patch.adjustment_type === 'DEDUCTION') {
                await payrollRepo.insertDeduction({
                    employee_id: existingRun.employee_id,
                    date: transactionDate,
                    amount: adjustmentAmount,
                    reason: patch.reason || "Manual Adjustment"
                }, connection);
                updatedRecord.total_deductions = (Number(updatedRecord.total_deductions) || 0) + adjustmentAmount;
            }

            // Recalculate Totals
            updatedRecord.gross_pay = (Number(updatedRecord.basic_earnings) || 0) + (Number(updatedRecord.total_ot_pay) || 0) + (Number(updatedRecord.total_incentives) || 0);
            updatedRecord.net_pay = Number(updatedRecord.gross_pay) - Number(updatedRecord.total_deductions) - Number(updatedRecord.epf_employee);
            if (updatedRecord.net_pay < 0) updatedRecord.net_pay = 0;

            await payrollRepo.updatePayrollRunFull(updatedRecord, connection);
        }
        // Handle full payslip field modification
        else {
            if (patch.total_ot_pay !== undefined) updatedRecord.total_ot_pay = Number(patch.total_ot_pay);
            if (patch.total_incentives !== undefined) updatedRecord.total_incentives = Number(patch.total_incentives);
            if (patch.total_deductions !== undefined) updatedRecord.total_deductions = Number(patch.total_deductions);
            if (patch.epf_employee !== undefined) updatedRecord.epf_employee = Number(patch.epf_employee);
            if (patch.epf_employer !== undefined) updatedRecord.epf_employer = Number(patch.epf_employer);
            if (patch.etf_employer !== undefined) updatedRecord.etf_employer = Number(patch.etf_employer);

            // Recalculate Totals
            updatedRecord.gross_pay = Number(updatedRecord.basic_earnings) + Number(updatedRecord.total_ot_pay) + Number(updatedRecord.total_incentives);
            updatedRecord.net_pay = Number(updatedRecord.gross_pay) - Number(updatedRecord.total_deductions) - Number(updatedRecord.epf_employee);

            if (updatedRecord.net_pay < 0) updatedRecord.net_pay = 0;

            // Log Audit Record for Full Edit
            await payrollRepo.insertPayrollAdjustment({
                payroll_id: payrollId,
                adjusted_by_user_id: editedByUser.user_id,
                adjustment_type: 'CORRECTION',
                amount: 0,
                reason: patch.reason || "Full payslip modification"
            }, connection);

            await payrollRepo.updatePayrollRunFull(updatedRecord, connection);
        }

        await connection.commit();
        return updatedRecord;

    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
};

/**
 * Approves a payroll run, marking it as 'READY' for payment.
 * 
 * @param {number} payrollId 
 * @returns {Promise<Object>}
 */
export const approvePayrollRun = async (payrollId) => {
    const payrollRun = await payrollRepo.getPayrollRunById(payrollId);
    if (!payrollRun) throw new Error("Payroll run not found");
    
    await payrollRepo.updatePayrollStatus(payrollId, 'READY');
    return { success: true, message: "Payroll approved and marked as READY" };
};
