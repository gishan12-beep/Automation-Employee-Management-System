
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function verify() {
  try {
    const [rows] = await pool.query('SELECT * FROM employee WHERE employee_id = "1001"');
    console.log("EMPLOYEE 1001:");
    console.log(JSON.stringify(rows[0], null, 2));

    const [sal] = await pool.query('SELECT * FROM salary_configurations WHERE employee_id = "1001"');
    console.log("SALARY CONFIG 1001:");
    console.log(JSON.stringify(sal[0], null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

verify();
