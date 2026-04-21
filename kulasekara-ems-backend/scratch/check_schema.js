import { pool } from "../src/config/db.js";
import dotenv from "dotenv";
dotenv.config();

async function checkSchema() {
    try {
        console.log("Checking issues table...");
        const [rows] = await pool.query("DESCRIBE issues");
        console.table(rows);
        process.exit(0);
    } catch (err) {
        console.error("Failed to describe issues table:", err.message);
        process.exit(1);
    }
}

checkSchema();
