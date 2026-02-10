import "dotenv/config";
import { pool } from "./src/config/db.js";

async function run() {
    try {
        console.log("Checking DB...");
        const [empCount] = await pool.query("SELECT COUNT(*) as count FROM employee");
        console.log("Employee count:", empCount[0].count);

        const [users] = await pool.query("SELECT username, role, is_active FROM user");
        console.log("Users:", users);

    } catch (e) {
        console.error("Error:", e);
    } finally {
        process.exit();
    }
}

run();
