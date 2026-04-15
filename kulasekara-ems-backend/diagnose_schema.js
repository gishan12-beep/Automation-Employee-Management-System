import { pool } from './src/config/db.js';

async function diagnose() {
    try {
        const tables = ['payroll_runs', 'incentives', 'deductions', 'overtime_records'];
        
        for (const table of tables) {
            console.log(`--- ${table} schema ---`);
            const [cols] = await pool.query(`DESCRIBE ${table}`);
            cols.forEach(c => console.log(`${c.Field}: ${c.Type}`));
            
            const [rows] = await pool.query(`SELECT * FROM ${table} ORDER BY 1 DESC LIMIT 1`);
            console.log(`\n--- Most Recent Row in ${table} ---`);
            console.log(JSON.stringify(rows[0], null, 2));
            console.log("\n");
        }
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

diagnose();
