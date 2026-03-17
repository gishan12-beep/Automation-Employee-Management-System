import { pool } from './src/config/db.js';

async function diagnose() {
    try {
        const [columns] = await pool.query('DESCRIBE payroll_runs');
        console.log('--- payroll_runs schema ---');
        columns.forEach(col => {
            console.log(`${col.Field}: ${col.Type}`);
        });

        const [recent] = await pool.query('SELECT * FROM payroll_runs ORDER BY payroll_id DESC LIMIT 1');
        console.log('\n--- Most Recent Row ---');
        console.log(JSON.stringify(recent[0], null, 2));

        process.exit(0);
    } catch (err) {
        console.error('Diagnosis failed:', err);
        process.exit(1);
    }
}

diagnose();
