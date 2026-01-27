// src/controllers/managerEmployeeController.js
import { pool } from "../config/db.js";
import bcrypt from "bcrypt";
import { generateTempPassword } from "../utils/passwordUtils.js";

/**
 * POST /api/manager/employees
 * - Creates employee row (manual employee_id)
 * - Creates salary_configurations row
 * - Creates user login with temp password (role EMPLOYEE)
 * - ✅ Forces password reset before employee can access dashboard
 */
export const createEmployee = async (req, res) => {
  const {
    employee_id,
    department_id,
    first_name,
    last_name,
    nic,
    email,
    phone,
    salary_configuration, // { salary_type, basic_rate, is_epf_eligible, effective_date }
  } = req.body;

  // ---- Validate employee fields ----
  if (!employee_id || !first_name || !last_name || !nic || !email || !phone) {
    return res.status(400).json({
      message: "Missing required fields",
      required: ["employee_id", "first_name", "last_name", "nic", "email", "phone"],
    });
  }

  // ---- Validate salary config fields ----
  if (
    !salary_configuration ||
    !salary_configuration.salary_type ||
    salary_configuration.basic_rate === undefined ||
    salary_configuration.basic_rate === null ||
    !salary_configuration.effective_date
  ) {
    return res.status(400).json({
      message: "Missing salary configuration fields",
      required: [
        "salary_configuration.salary_type",
        "salary_configuration.basic_rate",
        "salary_configuration.effective_date",
        "salary_configuration.is_epf_eligible (optional)",
      ],
    });
  }

  const salary_type = String(salary_configuration.salary_type).toUpperCase(); // MONTHLY/DAILY
  const basic_rate = Number(salary_configuration.basic_rate);
  const is_epf_eligible = Number(salary_configuration.is_epf_eligible) ? 1 : 0;
  const effective_date = String(salary_configuration.effective_date);

  if (!["MONTHLY", "DAILY"].includes(salary_type)) {
    return res.status(400).json({ message: "salary_type must be MONTHLY or DAILY" });
  }
  if (Number.isNaN(basic_rate) || basic_rate <= 0) {
    return res.status(400).json({ message: "basic_rate must be a number > 0" });
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

    // 2) Insert employee
    if (department_id !== undefined && department_id !== null && department_id !== "") {
      await conn.query(
        `INSERT INTO employee (employee_id, department_id, first_name, last_name, nic, email, phone, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE')`,
        [
          String(employee_id),
          Number(department_id),
          String(first_name),
          String(last_name),
          String(nic),
          String(email),
          String(phone),
        ]
      );
    } else {
      await conn.query(
        `INSERT INTO employee (employee_id, first_name, last_name, nic, email, phone, status)
         VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE')`,
        [
          String(employee_id),
          String(first_name),
          String(last_name),
          String(nic),
          String(email),
          String(phone),
        ]
      );
    }

    // 3) Insert salary configuration
    await conn.query(
      `INSERT INTO salary_configurations (employee_id, salary_type, basic_rate, is_epf_eligible, effective_date)
       VALUES (?, ?, ?, ?, ?)`,
      [String(employee_id), salary_type, basic_rate, is_epf_eligible, effective_date]
    );

    // 4) Auto-generate password + create user
    const username = `EMP${employee_id}`;
    const tempPassword = generateTempPassword();
    const password_hash = await bcrypt.hash(tempPassword, 10);

    // Ensure username/email not already used in user table
    const [existingUser] = await conn.query(
      `SELECT user_id FROM user WHERE username = ? OR email = ? LIMIT 1`,
      [username, email]
    );
    if (existingUser.length > 0) {
      await conn.rollback();
      return res.status(409).json({ message: "User username/email already exists" });
    }

    // ✅ NEW: must_change_password = 1, temp_password_issued_at = NOW()
    await conn.query(
      `INSERT INTO user (
          employee_id, username, email, password_hash, role, is_active,
          must_change_password, temp_password_issued_at
       )
       VALUES (?, ?, ?, ?, 'EMPLOYEE', 1, 1, NOW())`,
      [String(employee_id), String(username), String(email), String(password_hash)]
    );

    await conn.commit();

    // ✅ Return temp password ONCE to manager
    return res.status(201).json({
      message: "Employee created successfully",
      employee: {
        employee_id,
        department_id: department_id ?? null,
        first_name,
        last_name,
        nic,
        email,
        phone,
        status: "ACTIVE",
      },
      salary_configuration: {
        employee_id,
        salary_type,
        basic_rate,
        is_epf_eligible,
        effective_date,
      },
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

    const [empUpdate] = await conn.query(
      `UPDATE employee SET status='INACTIVE' WHERE employee_id = ?`,
      [employee_id]
    );

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
