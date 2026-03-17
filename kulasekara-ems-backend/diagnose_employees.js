import { pool } from './src/config/db.js';

async function diagnose() {
    try {
        const [rows] = await pool.query('SELECT e.employee_id, e.status, s.salary_type FROM employee e LEFT JOIN salary_configurations s ON e.employee_id = s.employee_id');
        console.log('--- Employee Data ---');
        console.log(JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (err) {
        console.error('Diagnosis failed:', err);
        process.exit(1);
    }
}

diagnose();
