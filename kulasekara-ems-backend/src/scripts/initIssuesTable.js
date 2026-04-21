import { pool } from "../config/db.js";
import dotenv from "dotenv";
dotenv.config();

const createTableSQL = `
CREATE TABLE IF NOT EXISTS issues (
  issue_id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id VARCHAR(50) NOT NULL,
  type ENUM('PAYROLL', 'ATTENDANCE', 'OTHER') NOT NULL,
  description TEXT NOT NULL,
  status ENUM('OPEN', 'RESOLVED') DEFAULT 'OPEN',
  reply TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (employee_id),
  FOREIGN KEY (employee_id) REFERENCES employee(employee_id)
);

`;

async function init() {
  try {
    console.log("[DB] Initializing issues table...");
    await pool.query(createTableSQL);
    console.log("[DB] ✅ issues table is ready.");
    process.exit(0);
  } catch (err) {
    console.error("[DB] ❌ initIssuesTable failed:", err);
    process.exit(1);
  }
}

init();
