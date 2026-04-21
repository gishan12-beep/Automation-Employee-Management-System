import { pool } from '../src/config/db.js';

async function checkUserSchema() {
    try {
        console.log(`--- user table schema ---`);
        const [cols] = await pool.query(`DESCRIBE user`);
        cols.forEach(c => console.log(`${c.Field}: ${c.Type}`));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

checkUserSchema();
