import { pool } from "../config/db.js";
import * as payrollRepo from "../repositories/payrollRepository.js";

// ✅ Process Monthly Payroll
export const processMonthlyPayroll = async (month, year) => {
    const conn = await pool.getConnection();

    let processedCount = 0;
    let skippedCount = 0;
    const results = [];

    try {
        await conn.beginTransaction();

        const employees = await payrollRepo.getActiveEmployees();

        // Find total days in month for "derived from total working days" logic
        const totalDaysInMonth = new Date(year, month, 0).getDate();

        for (const emp of employees) {
            console.log(`[PAYROLL] Processing employee: ${emp.employee_id}`);

            // 1. Check if record exists
            const existingId = await payrollRepo.checkExistingPayroll(emp.employee_id, month, year);

            // 2. Fetch Salary Config
            const salaryConfig = await payrollRepo.getSalaryConfig(emp.employee_id, month, year);
            if (!salaryConfig) {
                console.warn(`No salary config for employee ${emp.employee_id}`);
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
                const unapprovedAbsences = await payrollRepo.getUnapprovedAbsentDays(emp.employee_id, month, year);
                const basicRate = Number(salaryConfig.basic_rate) || 0;
                basicEarnings = basicRate - (unapprovedAbsences * (basicRate / totalDaysInMonth));
            } else if (isDaily) {
                basicEarnings = await payrollRepo.getWorkLogsTotalAmount(emp.employee_id, month, year);
            }

            // 4. Perfect Attendance Bonus Logic
            const isDisqualifiedForBonus = await payrollRepo.checkPerfectAttendanceDisqualifier(emp.employee_id, month, year);
            if (!isDisqualifiedForBonus) {
                const perfAttRule = await payrollRepo.getIncentiveRule('PERFECT_ATTENDANCE');
                if (perfAttRule) {
                    dynamicIncentives += Number(perfAttRule.amount) || 0;
                }
            }

            // 5. Late Deduction Logic
            const lateCount = await payrollRepo.getLateDaysCount(emp.employee_id, month, year);
            if (lateCount > 0) {
                const lateFineRule = await payrollRepo.getDeductionRule('LATE_FINE');
                if (lateFineRule) {
                    dynamicDeductions += lateCount * (Number(lateFineRule.amount) || 0);
                }
            }

            // 6. Aggregate other components
            const otPay = Number(await payrollRepo.getOvertimeTotal(emp.employee_id, month, year)) || 0;
            const manualIncentives = Number(await payrollRepo.getIncentivesTotal(emp.employee_id, month, year)) || 0;
            const manualDeductions = Number(await payrollRepo.getDeductionsTotal(emp.employee_id, month, year)) || 0;

            const totalIncentives = dynamicIncentives + manualIncentives;
            const totalDeductions = dynamicDeductions + manualDeductions;

            // 7. Gross Pay
            const grossPay = (Number(basicEarnings) || 0) + otPay + totalIncentives;

            // 8. EPF/ETF Logic
            let epfEmployee = 0;
            let epfEmployer = 0;
            let etfEmployer = 0;

            if (salaryConfig.is_epf_eligible == 1) {
                epfEmployee = basicEarnings * 0.08;
                epfEmployer = basicEarnings * 0.12;
                etfEmployer = basicEarnings * 0.03;
            }

            // 9. Net Pay (Base)
            let netPay = grossPay - epfEmployee - totalDeductions;

            // 9b. Incorporate existing manual adjustments if re-generating
            if (existingId) {
                const adjustmentTotal = await payrollRepo.getAdjustmentsTotal(existingId);
                netPay += adjustmentTotal;
            }

            if (netPay < 0) netPay = 0;

            // 10. Snapshot Record
            const safeBasic = Number(basicEarnings) || 0;
            const payrollRecord = {
                employee_id: emp.employee_id,
                month,
                year,
                basic_earnings: parseFloat((safeBasic).toFixed(2)),
                total_ot_pay: parseFloat((otPay || 0).toFixed(2)),
                total_incentives: parseFloat((totalIncentives || 0).toFixed(2)),
                total_deductions: parseFloat((totalDeductions || 0).toFixed(2)),
                gross_pay: parseFloat((grossPay || 0).toFixed(2)),
                epf_employee: parseFloat((epfEmployee || 0).toFixed(2)),
                epf_employer: parseFloat((epfEmployer || 0).toFixed(2)),
                etf_employer: parseFloat((etfEmployer || 0).toFixed(2)),
                net_pay: parseFloat((netPay || 0).toFixed(2))
            };

            if (existingId) {
                await payrollRepo.updatePayrollRunFull({ ...payrollRecord, payroll_id: existingId }, conn);
            } else {
                await payrollRepo.insertPayrollRun(payrollRecord, conn);
            }

            results.push({
                ...payrollRecord,
                first_name: emp.first_name,
                last_name: emp.last_name
            });

            processedCount++;
        }

        await conn.commit();
        return { processedCount, skippedCount, details: results };

    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        conn.release();
    }
};

// ✅ Process Single Employee Payroll
export const processSingleEmployeePayroll = async (employeeId, month, year) => {
    const conn = await pool.getConnection();

    try {
        await conn.beginTransaction();

        // 1. Check if record exists
        const existingId = await payrollRepo.checkExistingPayroll(employeeId, month, year);

        // 2. Fetch Employee details
        const [empRows] = await conn.query(`SELECT first_name, last_name, employee_id FROM employee WHERE employee_id = ?`, [employeeId]);
        if (empRows.length === 0) {
            return { success: false, message: `Employee ${employeeId} not found` };
        }
        const emp = empRows[0];

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
        const otPay = Number(await payrollRepo.getOvertimeTotal(employeeId, month, year)) || 0;
        const manualIncentives = Number(await payrollRepo.getIncentivesTotal(employeeId, month, year)) || 0;
        const manualDeductions = Number(await payrollRepo.getDeductionsTotal(employeeId, month, year)) || 0;

        const totalIncentives = dynamicIncentives + manualIncentives;
        const totalDeductions = dynamicDeductions + manualDeductions;

        // 8. Gross Pay
        const grossPay = (Number(basicEarnings) || 0) + otPay + totalIncentives;

        // 9. EPF/ETF Logic
        let epfEmployee = 0;
        let epfEmployer = 0;
        let etfEmployer = 0;

        if (salaryConfig.is_epf_eligible == 1) {
            epfEmployee = basicEarnings * 0.08;
            epfEmployer = basicEarnings * 0.12;
            etfEmployer = basicEarnings * 0.03;
        }

        // 10. Net Pay (Base)
        let netPay = grossPay - epfEmployee - totalDeductions;

        // 10b. Incorporate existing manual adjustments if re-generating
        if (existingId) {
            const adjustmentTotal = await payrollRepo.getAdjustmentsTotal(existingId);
            netPay += adjustmentTotal;
        }

        if (netPay < 0) netPay = 0;

        // 11. Snapshot Record
        const safeBasic = Number(basicEarnings) || 0;
        const payrollRecord = {
            employee_id: employeeId,
            month,
            year,
            basic_earnings: parseFloat((safeBasic).toFixed(2)),
            total_ot_pay: parseFloat((otPay || 0).toFixed(2)),
            total_incentives: parseFloat((totalIncentives || 0).toFixed(2)),
            total_deductions: parseFloat((totalDeductions || 0).toFixed(2)),
            gross_pay: parseFloat((grossPay || 0).toFixed(2)),
            epf_employee: parseFloat((epfEmployee || 0).toFixed(2)),
            epf_employer: parseFloat((epfEmployer || 0).toFixed(2)),
            etf_employer: parseFloat((etfEmployer || 0).toFixed(2)),
            net_pay: parseFloat((netPay || 0).toFixed(2))
        };

        let resultId = existingId;
        if (existingId) {
            await payrollRepo.updatePayrollRunFull({ ...payrollRecord, payroll_id: existingId }, conn);
        } else {
            resultId = await payrollRepo.insertPayrollRun(payrollRecord, conn);
        }

        await conn.commit();
        return {
            success: true,
            message: existingId ? "Payroll updated successfully" : "Payroll processed successfully",
            payrollId: resultId,
            details: {
                ...payrollRecord,
                first_name: emp.first_name,
                last_name: emp.last_name
            }
        };

    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        conn.release();
    }
};

// ✅ Get Employee Payroll History
export const getEmployeePayroll = async (employeeId, month, year) => {
    return await payrollRepo.getPayrollByEmployee(employeeId, month, year);
};

// ✅ Get Payroll Summary
export const getPayrollSummary = async (month, year) => {
    const runs = await payrollRepo.getPayrollSummary(month, year);

    // Calculate totals safely
    const totals = runs.reduce((acc, run) => {
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

    return { summary: totals, details: runs };
};

// ✅ Get Full Details for a Payroll Run (including itemized incentives/deductions)
export const getPayrollRunDetails = async (employeeId, month, year) => {
    const run = await payrollRepo.checkExistingPayroll(employeeId, month, year);
    if (!run) return null;

    const payrollRun = await payrollRepo.getPayrollRunById(run);
    const [empRows] = await pool.query(`SELECT first_name, last_name, employee_id FROM employee WHERE employee_id = ?`, [employeeId]);
    
    const incentives = await payrollRepo.getIncentivesByEmployee(employeeId, month, year);
    const deductions = await payrollRepo.getDeductionsByEmployee(employeeId, month, year);

    return {
        payroll: payrollRun,
        employee: empRows[0],
        incentives,
        deductions
    };
};

// ✅ Edit Payroll Run (Accountant via Full Edit or Adjustments)
export const editPayrollRun = async (payrollId, patch, editedByUser) => {
    const conn = await pool.getConnection();

    try {
        await conn.beginTransaction();

        const existingRun = await payrollRepo.getPayrollRunById(payrollId);
        if (!existingRun) {
            throw new Error("Payroll run not found");
        }

        let newRecord = { ...existingRun };

        // If it's a legacy simple adjustment (BONUS/DEDUCTION)
        if (patch.adjustment_type === 'BONUS' || patch.adjustment_type === 'DEDUCTION') {
            const adjustmentAmount = Number(patch.amount);

            // Audit Record
            await payrollRepo.insertPayrollAdjustment({
                payroll_id: payrollId,
                adjusted_by_user_id: editedByUser.user_id,
                adjustment_type: patch.adjustment_type,
                amount: adjustmentAmount,
                reason: patch.reason
            }, conn);

            // Sync with Incentives/Deductions tables
            const adjustmentDate = new Date(existingRun.year, existingRun.month - 1, 1); // Use 1st of the payroll month

            if (patch.adjustment_type === 'BONUS') {
                await payrollRepo.insertIncentive({
                    employee_id: existingRun.employee_id,
                    date: adjustmentDate,
                    amount: adjustmentAmount,
                    description: patch.reason || "Accountant Adjustment"
                }, conn);
                newRecord.total_incentives = (Number(newRecord.total_incentives) || 0) + adjustmentAmount;
            } else if (patch.adjustment_type === 'DEDUCTION') {
                await payrollRepo.insertDeduction({
                    employee_id: existingRun.employee_id,
                    date: adjustmentDate,
                    amount: adjustmentAmount,
                    reason: patch.reason || "Accountant Adjustment"
                }, conn);
                newRecord.total_deductions = (Number(newRecord.total_deductions) || 0) + adjustmentAmount;
            }

            // Recalculate Totals
            newRecord.gross_pay = (Number(newRecord.basic_earnings) || 0) + (Number(newRecord.total_ot_pay) || 0) + (Number(newRecord.total_incentives) || 0);
            newRecord.net_pay = Number(newRecord.gross_pay) - Number(newRecord.total_deductions) - Number(newRecord.epf_employee);
            if (newRecord.net_pay < 0) newRecord.net_pay = 0;

            await payrollRepo.updatePayrollRunFull(newRecord, conn);
        }
        // Else it's a full payslip edit
        else {
            // Update snapshot fields (Basic remains untouched)
            if (patch.total_ot_pay !== undefined) newRecord.total_ot_pay = Number(patch.total_ot_pay);
            if (patch.total_incentives !== undefined) newRecord.total_incentives = Number(patch.total_incentives);
            if (patch.total_deductions !== undefined) newRecord.total_deductions = Number(patch.total_deductions);
            if (patch.epf_employee !== undefined) newRecord.epf_employee = Number(patch.epf_employee);
            if (patch.epf_employer !== undefined) newRecord.epf_employer = Number(patch.epf_employer);
            if (patch.etf_employer !== undefined) newRecord.etf_employer = Number(patch.etf_employer);

            // Recalculate Totals
            newRecord.gross_pay = Number(newRecord.basic_earnings) + Number(newRecord.total_ot_pay) + Number(newRecord.total_incentives);
            newRecord.net_pay = Number(newRecord.gross_pay) - Number(newRecord.total_deductions) - Number(newRecord.epf_employee);

            // Adjust for any existing manual adjustments in the adjustments table? 
            // Usually, if they are doing a "full edit", we might want to preserve the previous adjustments 
            // or just let them overwrite everything. 
            // Given "edit the whole payslip", we'll just recalculate from these fields.
            if (newRecord.net_pay < 0) newRecord.net_pay = 0;

            // Audit Record (Full Edit)
            await payrollRepo.insertPayrollAdjustment({
                payroll_id: payrollId,
                adjusted_by_user_id: editedByUser.user_id,
                adjustment_type: 'CORRECTION',
                amount: 0, // Not a single amount change
                reason: patch.reason || "Full payslip modification by accountant"
            }, conn);

            await payrollRepo.updatePayrollRunFull(newRecord, conn);
        }

        await conn.commit();
        return newRecord;

    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
};
