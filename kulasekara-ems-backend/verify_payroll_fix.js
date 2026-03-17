import dotenv from 'dotenv';
dotenv.config();
import { pool } from './src/config/db.js';
import * as payrollRepo from './src/repositories/payrollRepository.js';
import * as workLogRepo from './src/repositories/workLogRepository.js';

async function verifyFix() {
    console.log("--- Daily Payroll Fix Verification ---");

    try {
        // 1. Find an active employee
        const [employees] = await pool.query("SELECT employee_id FROM employee WHERE status = 'ACTIVE' LIMIT 1");
        if (employees.length === 0) {
            console.error("No active employees found to test.");
            return;
        }
        const empId = employees[0].employee_id;
        const month = 2;
        const year = 2026;
        const date = '2026-02-15';

        console.log(`Testing with Employee ID: ${empId}`);

        // 2. Insert a work log WITHOUT total_amount (to simulate old data/manually inserted data)
        console.log("Inserting work log without total_amount (legacy simulation)...");
        await pool.query(
            "INSERT INTO work_logs (employee_id, task_id, date, quantity, applied_rate) VALUES (?, ?, ?, ?, ?)",
            [empId, 1, date, 10, 500] // 10 units * 500 rate = 5000 total
        );

        // 3. Check getWorkLogsTotalAmount (the FIX)
        const total = await payrollRepo.getWorkLogsTotalAmount(empId, month, year);
        console.log(`Calculated Total Amount: ${total}`);
        if (Number(total) >= 5000) {
            console.log("✅ SUCCESS: getWorkLogsTotalAmount calculated total correctly on the fly.");
        } else {
            console.error(`❌ FAILURE: Expected at least 5000, got ${total}`);
        }

        // 4. Test insertWorkLog (Verify Generated Column)
        console.log("Inserting new work log using original repository (testing generated column)...");
        const newLogId = await workLogRepo.insertWorkLog({
            employee_id: empId,
            task_id: 1,
            date: '2026-02-16',
            quantity: 5,
            applied_rate: 1000
        });

        const [newLog] = await pool.query("SELECT * FROM work_logs WHERE log_id = ?", [newLogId]);
        console.log("New Log Data:", newLog[0]);
        if (Number(newLog[0].total_amount) === 5000) {
            console.log("✅ SUCCESS: Database's generated column correctly populated total_amount.");
        } else {
            console.error(`❌ FAILURE: total_amount was ${newLog[0].total_amount}, expected 5000`);
            console.log("This confirms the column might be NULL in existing records but works for new ones.");
        }

        // Cleanup test data
        await pool.query("DELETE FROM work_logs WHERE employee_id = ? AND date IN ('2026-02-15', '2026-02-16')", [empId]);
        console.log("Test data cleaned up.");

    } catch (err) {
        console.error("Verification failed with error:", err);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

verifyFix();
