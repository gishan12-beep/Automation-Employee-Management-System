
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
    const [rows] = await pool.query("DESCRIBE employee");
    console.log("EMPLOYEE TABLE:");
    console.table(rows);

    const [salRows] = await pool.query("DESCRIBE salary_configurations");
    console.log("SALARY_CONFIGURATIONS TABLE:");
    console.table(salRows);

    const [userRows] = await pool.query("DESCRIBE user");
    console.log("USER TABLE:");
    console.table(userRows);

  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

check();
