import { pool } from './src/config/db.js';

async function verifyUpdate() {
    try {
        const [employees] = await pool.query('SELECT employee_id FROM employee LIMIT 1');
        if (employees.length === 0) {
            console.log('No employees found to test with.');
            process.exit(0);
        }
        
        const empId = employees[0].employee_id;
        console.log(`Setting employee ${empId} to RESIGNED...`);
        
        await pool.query('UPDATE employee SET status = ? WHERE employee_id = ?', ['RESIGNED', empId]);
        
        const [check] = await pool.query('SELECT status FROM employee WHERE employee_id = ?', [empId]);
        console.log(`Result: ${check[0].status}`);
        
        console.log(`Reverting employee ${empId} to ACTIVE...`);
        await pool.query('UPDATE employee SET status = ? WHERE employee_id = ?', ['ACTIVE', empId]);
        
        console.log('VERIFICATION SUCCESSFUL');
        process.exit(0);
    } catch (err) {
        console.error('VERIFICATION FAILED:', err);
        process.exit(1);
    }
}

verifyUpdate();
