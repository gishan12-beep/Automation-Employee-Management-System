import dotenv from 'dotenv';
dotenv.config();

import * as payrollService from './src/services/payrollService.js';

async function testProcess() {
    console.log("Starting Payroll Test Processing");
    try {
        const month = 2; // February
        const year = 2026;

        console.log(`Processing for ${month}/${year}`);
        const result = await payrollService.processMonthlyPayroll(month, year);
        console.log("PROCESS COMPLETED SUCCESSFULLY");
        console.dir(result, { depth: null });
    } catch (err) {
        console.error("FAIL:", err);
    } finally {
        process.exit(0);
    }
}

testProcess();
