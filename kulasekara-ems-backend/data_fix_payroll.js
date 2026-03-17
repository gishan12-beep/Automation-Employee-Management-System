import dotenv from 'dotenv';
dotenv.config();
import { pool } from './src/config/db.js';
import * as payrollService from './src/services/payrollService.js';

async function fixData() {
    console.log("--- Daily Payroll Data Fix (Final) ---");
    const month = 2;
    const year = 2026;

    try {
        // 1. Find all employees with 0 basic earnings in Feb 2026
        const [runs] = await pool.query(
            "SELECT employee_id FROM payroll_runs WHERE month = ? AND year = ? AND (basic_earnings IS NULL OR basic_earnings = 0)",
            [month, year]
        );

        console.log(`Found ${runs.length} records to fix.`);

        for (const run of runs) {
            console.log(`Triggering re-generation for employee ${run.employee_id}...`);
            const result = await payrollService.processSingleEmployeePayroll(run.employee_id, month, year);
            if (result.success) {
                console.log(`✅ Fixed ${run.employee_id}: [New Basic: ${result.details.basic_earnings}, New Net: ${result.details.net_pay}]`);
            } else {
                console.log(`❌ Failed ${run.employee_id}: ${result.message}`);
            }
        }

        console.log("--- Data Fix Completed ---");

    } catch (err) {
        console.error("Fix failed:", err);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

fixData();
