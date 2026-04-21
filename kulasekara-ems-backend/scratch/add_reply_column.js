import { pool } from "../src/config/db.js";
import dotenv from "dotenv";
dotenv.config();

async function addReplyColumn() {
    try {
        console.log("Checking if reply column exists...");
        const [rows] = await pool.query("DESCRIBE issues");
        const hasReply = rows.some(row => row.Field === 'reply');
        
        if (hasReply) {
            console.log("Column 'reply' already exists.");
        } else {
            console.log("Adding 'reply' column to issues table...");
            await pool.query("ALTER TABLE issues ADD COLUMN reply TEXT AFTER status");
            console.log("✅ Column 'reply' added successfully.");
        }
        process.exit(0);
    } catch (err) {
        console.error("❌ Failed to alter issues table:", err.message);
        process.exit(1);
    }
}

addReplyColumn();
