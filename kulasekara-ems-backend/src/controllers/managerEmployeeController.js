// src/controllers/managerEmployeeController.js
import { pool } from "../config/db.js";
import bcrypt from "bcrypt";
import { generateTempPassword } from "../utils/passwordUtils.js";


/**
 * GET /api/manager/stats
 * - Returns dashboard statistics
 */
export const getDashboardStats = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT COUNT(*) as activeCount FROM employee WHERE status = 'ACTIVE'`
    );
    return res.json({ activeCount: rows[0].activeCount });
  } catch (err) {
    return res.status(500).json({ message: "Fetch stats failed", error: err.message });
  }
};

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

/**
 * GET /api/manager/employees
 * - Fetch all employees + salary config
 */
export const getEmployees = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT e.*, 
              s.salary_type, s.basic_rate, s.is_epf_eligible, s.effective_date
       FROM employee e
       LEFT JOIN salary_configurations s ON e.employee_id = s.employee_id
       ORDER BY e.created_at DESC`
    );
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ message: "Fetch employees failed", error: err.message });
  }
};

/**
 * GET /api/manager/departments
 * - Fetch all departments
 */
export const getDepartments = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM departments ORDER BY id ASC");
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ message: "Fetch departments failed", error: err.message });
  }
};

/**
 * PUT /api/manager/employees/:employee_id
 * - Updates employee details
 * - Updates salary config (if provided)
 */
export const updateEmployee = async (req, res) => {
  const { employee_id } = req.params;
  const {
    department_id,
    first_name,
    last_name,
    nic,
    email,
    phone,
    status,
    salary_configuration,
  } = req.body;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1) Update Employee Table
    await conn.query(
      `UPDATE employee 
       SET department_id=?, first_name=?, last_name=?, nic=?, email=?, phone=?, status=?
       WHERE employee_id=?`,
      [
        Number(department_id),
        String(first_name),
        String(last_name),
        String(nic),
        String(email),
        String(phone),
        String(status),
        employee_id,
      ]
    );

    // 1.5) Sync User Active Status
    // If status is ACTIVE -> is_active=1, else (INACTIVE/RESIGNED/TERMINATED) -> is_active=0
    const isActive = status === 'ACTIVE' ? 1 : 0;
    await conn.query(
      `UPDATE user SET is_active = ? WHERE employee_id = ?`,
      [isActive, employee_id]
    );

    // 2) Update Salary Config (if present)
    if (salary_configuration) {
      const { salary_type, basic_rate, is_epf_eligible, effective_date } = salary_configuration;

      const [existingConfig] = await conn.query(
        "SELECT config_id FROM salary_configurations WHERE employee_id=?",
        [employee_id]
      );

      if (existingConfig.length > 0) {
        await conn.query(
          `UPDATE salary_configurations
           SET salary_type=?, basic_rate=?, is_epf_eligible=?, effective_date=?
           WHERE employee_id=?`,
          [
            String(salary_type),
            Number(basic_rate),
            Number(is_epf_eligible) ? 1 : 0,
            String(effective_date),
            employee_id,
          ]
        );
      } else {
        await conn.query(
          `INSERT INTO salary_configurations (employee_id, salary_type, basic_rate, is_epf_eligible, effective_date)
           VALUES (?, ?, ?, ?, ?)`,
          [
            employee_id,
            String(salary_type),
            Number(basic_rate),
            Number(is_epf_eligible) ? 1 : 0,
            String(effective_date),
          ]
        );
      }
    }

    await conn.commit();

    return res.json({
      message: "Employee updated successfully",
      employee: {
        employee_id,
        department_id,
        first_name,
        last_name,
        nic,
        email,
        phone,
        status,
      },
    });
  } catch (err) {
    await conn.rollback();
    return res.status(500).json({ message: "Update failed", error: err.message });
  } finally {
    conn.release();
  }
};
