import { pool } from "../src/config/db.js";

async function testDashboardStats() {
    try {
        const employeeId = "1012"; // Sample ID
        const month = 4;
        const year = 2026;
        
        console.log(`Testing dashboard stats for employee ${employeeId}, ${year}-${month}...`);
        
        const [rows] = await pool.query(
            `SELECT SUM(ot_hours) as total_hours FROM overtime_records 
             WHERE employee_id = ? AND MONTH(date) = ? AND YEAR(date) = ?`,
            [employeeId, month, year]
        );
        
        console.log("Success! Total hours:", rows[0].total_hours);
    } catch (err) {
        console.error("Dashboard Query Failed:", err);
    } finally {
        process.exit();
    }
}

testDashboardStats();
