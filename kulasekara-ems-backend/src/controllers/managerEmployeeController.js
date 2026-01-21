import { pool } from "../config/db.js";
import bcrypt from "bcrypt";
import { generateTempPassword } from "../utils/passwordUtils.js";

/**
 * POST /api/manager/employees
 * Body must include employee_id (NO AUTO INCREMENT)
 */
export const createEmployee = async (req, res) => {
  const { employee_id, first_name, last_name, nic, email, phone } = req.body;

  if (!employee_id || !first_name || !last_name || !nic || !email || !phone) {
    return res.status(400).json({
      message: "Missing required fields",
      required: ["employee_id", "first_name", "last_name", "nic", "email", "phone"],
    });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1) Ensure employee_id not already used
    const [existingEmp] = await conn.query(
      `SELECT employee_id FROM employee WHERE employee_id = ? LIMIT 1`,
      [employee_id]
    );
    if (existingEmp.length > 0) {
      await conn.rollback();
      return res.status(409).json({ message: "Employee ID already exists" });
    }

    // 2) Insert employee (manual ID)
    await conn.query(
      `INSERT INTO employee (employee_id, first_name, last_name, nic, email, phone, status)
       VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE')`,
      [employee_id, first_name, last_name, nic, email, phone]
    );

    // 3) Auto-generate password + create user
    const username = `EMP${employee_id}`; // You can change rule if you want
    const tempPassword = generateTempPassword();
    const password_hash = await bcrypt.hash(tempPassword, 10);

    // Make sure username/email not already used in user table
    const [existingUser] = await conn.query(
      `SELECT user_id FROM user WHERE username = ? OR email = ? LIMIT 1`,
      [username, email]
    );
    if (existingUser.length > 0) {
      await conn.rollback();
      return res.status(409).json({ message: "User username/email already exists" });
    }

    await conn.query(
      `INSERT INTO user (employee_id, username, email, password_hash, role, is_active)
       VALUES (?, ?, ?, ?, 'EMPLOYEE', 1)`,
      [employee_id, username, email, password_hash]
    );

    await conn.commit();

    // ✅ Return password ONCE to manager
    return res.status(201).json({
      message: "Employee created successfully",
      employee: { employee_id, first_name, last_name, nic, email, phone, status: "ACTIVE" },
      credentials: { username, tempPassword },
    });
  } catch (err) {
    await conn.rollback();
    return res.status(500).json({ message: "Create employee failed", error: err.message });
  } finally {
    conn.release();
  }
};

/**
 * PATCH /api/manager/employees/:employee_id/deactivate
 * Soft remove: keep employee row, disable login
 */
export const deactivateEmployee = async (req, res) => {
  const { employee_id } = req.params;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Update employee status (keep record)
    const [empUpdate] = await conn.query(
      `UPDATE employee SET status='INACTIVE' WHERE employee_id = ?`,
      [employee_id]
    );

    // Disable login (if user exists)
    await conn.query(
      `UPDATE user SET is_active=0 WHERE employee_id = ?`,
      [employee_id]
    );

    await conn.commit();

    if (empUpdate.affectedRows === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }

    return res.json({ message: "Employee deactivated. Login disabled, record kept." });
  } catch (err) {
    await conn.rollback();
    return res.status(500).json({ message: "Deactivate failed", error: err.message });
  } finally {
    conn.release();
  }
};
