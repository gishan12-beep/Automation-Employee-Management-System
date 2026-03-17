import dotenv from 'dotenv';
dotenv.config();
import { pool } from './src/config/db.js';

async function debugData() {
    console.log("--- Daily Payroll Debugging ---");
    const month = 2;
    const year = 2026;

    try {
        console.log(`\n1. Checking Payroll Runs for ${month}/${year}:`);
        const [runs] = await pool.query(
            "SELECT pr.*, e.first_name, e.last_name FROM payroll_runs pr JOIN employee e ON pr.employee_id = e.employee_id WHERE pr.month = ? AND pr.year = ?",
            [month, year]
        );
        console.table(runs.map(r => ({
            id: r.employee_id,
            name: `${r.first_name} ${r.last_name}`,
            basic: r.basic_earnings,
            net: r.net_pay
        })));

        console.log("\n2. Checking Daily Workers Salary Configs:");
        const [configs] = await pool.query(
            "SELECT sc.*, e.first_name, e.last_name FROM salary_configurations sc JOIN employee e ON sc.employee_id = e.employee_id WHERE sc.salary_type = 'DAILY' AND sc.effective_date <= '2026-02-28' ORDER BY sc.employee_id, sc.effective_date DESC"
        );
        console.table(configs.map(c => ({
            id: c.employee_id,
            name: `${c.first_name} ${c.last_name}`,
            type: c.salary_type,
            effective: c.effective_date
        })));

        console.log("\n3. Checking Work Logs for Feb 2026:");
        const [logs] = await pool.query(
            "SELECT wl.*, e.first_name, e.last_name FROM work_logs wl JOIN employee e ON wl.employee_id = e.employee_id WHERE MONTH(wl.date) = ? AND YEAR(wl.date) = ?",
            [month, year]
        );
        console.table(logs.map(l => ({
            id: l.employee_id,
            name: `${l.first_name} ${l.last_name}`,
            date: l.date,
            qty: l.quantity,
            rate: l.applied_rate,
            total: l.total_amount
        })));

    } catch (err) {
        console.error("Debug failed:", err);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

debugData();
