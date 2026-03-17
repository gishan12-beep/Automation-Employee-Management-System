import dotenv from 'dotenv';
dotenv.config();

import * as payrollService from './src/services/payrollService.js';

async function testAdjust() {
    console.log("Starting Payroll Adjustment Test");
    try {
        // Find existing to patch (Assuming 1025 from previous logs)
        const check = await payrollService.getEmployeePayroll('1025', 2, 2026);
        if (check && check.length > 0) {
            const payrollIdToEdit = check[0].payroll_id;
            console.log("Editing Payroll ID:", payrollIdToEdit);
            console.log("Original Payroll Data:", check[0]);

            const adjustmentPatch = {
                adjustment_type: 'BONUS',
                amount: 1500,
                reason: 'Test Bonus Adjustment'
            };

            const userSimulation = { user_id: '1005', role: 'ACCOUNTANT' };

            const updated = await payrollService.editPayrollRun(payrollIdToEdit, adjustmentPatch, userSimulation);
            console.log("ADJUSTMENT COMPLETED SUCCESSFULLY");
            console.log("Updated Payroll Net Pay:", updated.net_pay);
        } else {
            console.log("No payroll run found for 1025 in 02/2026 to adjust.");
        }
    } catch (err) {
        console.error("FAIL:", err);
    } finally {
        process.exit(0);
    }
}

testAdjust();
