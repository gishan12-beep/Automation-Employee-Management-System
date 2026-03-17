import { pool } from "./src/config/db.js";

async function check() {
    try {
        const [rows] = await pool.query("SHOW COLUMNS FROM salary_configurations");
        console.log("COLUMNS:", rows.map(r => r.Field));
    } catch (err) {
        console.error(err);
    }
    process.exit();
}

check();
