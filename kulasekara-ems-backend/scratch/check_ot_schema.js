import { pool } from "../src/config/db.js";

async function checkSchema() {
    try {
        const [rows] = await pool.query("DESCRIBE overtime_records");
        console.table(rows);
    } catch (err) {
        console.error("Failed to describe table:", err);
    } finally {
        process.exit();
    }
}

checkSchema();
