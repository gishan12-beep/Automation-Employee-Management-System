import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { pool } from "../config/db.js";

dotenv.config();

async function upsertUser({ username, email, password, role }) {
  const password_hash = await bcrypt.hash(password, 10);

  const [rows] = await pool.query(
    "SELECT user_id FROM user WHERE username = ? OR email = ? LIMIT 1",
    [username, email]
  );

  if (rows.length > 0) {
    await pool.query(
      `UPDATE user
       SET password_hash = ?, role = ?, is_active = 1, employee_id = NULL
       WHERE user_id = ?`,
      [password_hash, role, rows[0].user_id]
    );
    console.log(`Updated: ${role} (${username})`);
  } else {
    await pool.query(
      `INSERT INTO user (employee_id, username, email, password_hash, role, is_active)
       VALUES (NULL, ?, ?, ?, ?, 1)`,
      [username, email, password_hash, role]
    );
    console.log(`Inserted: ${role} (${username})`);
  }
}

async function run() {
  try {
    await upsertUser({
      username: "manager",
      email: "manager@kulasekara.lk",
      password: "Manager@123",
      role: "MANAGER",
    });

    await upsertUser({
      username: "accountant",
      email: "accountant@kulasekara.lk",
      password: "Accountant@123",
      role: "ACCOUNTANT",
    });

    console.log("✅ Seed completed");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  }
}

run();
