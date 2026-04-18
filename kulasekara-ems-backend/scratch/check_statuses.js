
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function check() {
  try {
    const [rows] = await pool.query("SELECT employee_id, status FROM employee");
    console.table(rows);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

check();
