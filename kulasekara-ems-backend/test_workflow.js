import dotenv from 'dotenv';
dotenv.config();
import { pool } from './src/config/db.js';
import * as payrollService from './src/services/payrollService.js';
import * as payrollRepo from './src/repositories/payrollRepository.js';

async function verifyWorkflow() {
    console.log("Starting Workflow Verification...");
    try {
        const month = 4;
        const year = 2026;
        const employeeId = "1025";

        console.log(`1. Generating payroll for ${employeeId}...`);
        const genRes = await payrollService.processSingleEmployeePayroll(employeeId, month, year);
        console.log("Result:", genRes.message, "Status:", genRes.details.status);

        if (genRes.details.status !== 'PENDING') {
            throw new Error("FAIL: Status should be PENDING after generation.");
        }

        console.log(`2. Approving payroll ID ${genRes.payrollId}...`);
        const appRes = await payrollService.approvePayrollRun(genRes.payrollId);
        console.log("Result:", appRes.message);

        const updatedRun = await payrollRepo.getPayrollRunById(genRes.payrollId);
        console.log("Final Status:", updatedRun.status);

        if (updatedRun.status !== 'READY') {
            throw new Error("FAIL: Status should be READY after approval.");
        }

        console.log("INTEGRATION TEST PASSED");

    } catch (err) {
        console.error("VERIFICATION FAILED:", err);
    } finally {
        process.exit(0);
    }
}

verifyWorkflow();
