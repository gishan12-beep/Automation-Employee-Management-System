import { pool } from './src/config/db.js';

async function updateSchema() {
    try {
        console.log('Attempting to update employee status ENUM...');
        await pool.query("ALTER TABLE employee MODIFY COLUMN status ENUM('ACTIVE', 'INACTIVE', 'RESIGNED', 'TERMINATED') DEFAULT 'ACTIVE'");
        console.log('TABLE ALTERED SUCCESSFULLY');
        
        const [rows] = await pool.query('DESCRIBE employee');
        console.log('--- Current Employee Schema ---');
        console.log(rows.find(r => r.Field === 'status'));
        
        process.exit(0);
    } catch (err) {
        console.error('ALTER TABLE FAILED:', err);
        process.exit(1);
    }
}

updateSchema();
