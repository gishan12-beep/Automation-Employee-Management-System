import { pool } from './src/config/db.js';

async function testEndpoint() {
    try {
        const [rows] = await pool.query(
            `SELECT e.*, 
                    s.salary_type, s.basic_rate, s.is_epf_eligible, s.effective_date,
                    d.name as department_name
             FROM employee e
             LEFT JOIN salary_configurations s ON e.employee_id = s.employee_id
             LEFT JOIN departments d ON e.department_id = d.id
             WHERE e.status IN ('RESIGNED', 'TERMINATED')
             ORDER BY e.employee_id ASC`
        );
        console.log('--- Settlement Ready Employees ---');
        console.log(JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (err) {
        console.error('Test failed:', err);
        process.exit(1);
    }
}

testEndpoint();
