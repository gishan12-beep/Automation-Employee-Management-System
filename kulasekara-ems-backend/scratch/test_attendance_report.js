import { pool } from "../src/config/db.js";

async function testQuery() {
    try {
        const month = "04";
        const year = "2026";
        console.log(`Testing attendance report for ${year}-${month}...`);
        
        const [rows] = await pool.query(`
            SELECT 
                e.employee_id, 
                e.first_name, 
                e.last_name, 
                MAX(sc.salary_type) as employee_type,
                COUNT(CASE WHEN a.status = 'PRESENT' THEN 1 END) as present_days,
                COUNT(CASE WHEN a.status = 'ABSENT' THEN 1 END) as absent_days,
                COUNT(CASE WHEN a.status = 'LATE' THEN 1 END) as late_days,
                SUM(COALESCE(ot.ot_hours, 0)) as total_ot_hours
            FROM employee e
            LEFT JOIN salary_configurations sc ON e.employee_id = sc.employee_id AND sc.effective_date <= LAST_DAY(STR_TO_DATE(CONCAT(?, '-', ?, '-01'), '%Y-%m-%d'))
            LEFT JOIN attendance a ON e.employee_id = a.employee_id AND MONTH(a.date) = ? AND YEAR(a.date) = ?
            LEFT JOIN overtime_records ot ON e.employee_id = ot.employee_id AND MONTH(ot.date) = ? AND YEAR(ot.date) = ?
            GROUP BY e.employee_id, e.first_name, e.last_name
            ORDER BY e.first_name
        `, [year, month, month, year, month, year]);

        console.log("Success! Rows returned:", rows.length);
        if (rows.length > 0) {
            console.log("First row sample:", rows[0]);
        }
    } catch (err) {
        console.error("Query Failed:", err);
    } finally {
        process.exit();
    }
}

testQuery();
