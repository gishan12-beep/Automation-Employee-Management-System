// src/controllers/managerEmployeeController.js
import { pool } from "../config/db.js";
import bcrypt from "bcrypt";
import { generateTempPassword } from "../utils/passwordUtils.js";
import { sendCredentialsEmail } from "../utils/mailer.js";

/**
 * This section collects numbers for the main dashboard.
 * It counts how many employees are active, how many leave requests are waiting for approval,
 * who is at work today, and if there are any reported issues.
 */
export const getDashboardStats = async (req, res) => {
  try {
    const todayDate = new Date().toISOString().slice(0, 10);
    
    const [employeeStats] = await pool.query(
      `SELECT COUNT(*) as activeCount FROM employee WHERE status = 'ACTIVE'`
    );
    const [leaveStats] = await pool.query(
      "SELECT COUNT(*) as pendingCount FROM leave_requests WHERE status = 'PENDING'"
    );
    const [attendanceStats] = await pool.query(
      "SELECT COUNT(*) as attCount FROM attendance WHERE date = ?",
      [todayDate]
    );
    const [issueStats] = await pool.query(
      "SELECT COUNT(*) as issueCount FROM issues WHERE status = 'PENDING'"
    );

    return res.json({
      activeCount: employeeStats[0].activeCount,
      pendingLeaveCount: leaveStats[0].pendingCount,
      todayAttendanceCount: attendanceStats[0].attCount,
      pendingIssueCount: issueStats[0].issueCount
    });
  } catch (err) {
    console.error("[MANAGER-STATS] Error fetching stats:", err);
    return res.status(500).json({ message: "Failed to fetch dashboard statistics." });
  }
};

/**
 * This section is used to add a new employee to the system.
 * 
 * What happens here:
 * 1. The system checks if all the basic information (like name and email) is provided.
 * 2. It saves the person's basic details and their salary information.
 * 3. It creates a login name for them and gives them a temporary password.
 * 4. Finally, it sends an email to the new employee with their login details.
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
    salary_configuration,
  } = req.body;

  // Validation
  if (!employee_id || !first_name || !last_name || !nic || !email || !phone) {
    return res.status(400).json({
      message: "Required employee details are missing.",
    });
  }

  if (
    !salary_configuration ||
    !salary_configuration.salary_type ||
    salary_configuration.basic_rate === undefined ||
    !salary_configuration.effective_date
  ) {
    return res.status(400).json({
      message: "Salary configuration details are incomplete.",
    });
  }

  const salaryType = String(salary_configuration.salary_type).toUpperCase();
  const basicRate = Number(salary_configuration.basic_rate);
  const isEpfEligible = Number(salary_configuration.is_epf_eligible) ? 1 : 0;
  const effectiveDate = String(salary_configuration.effective_date);

  if (salaryType === "MONTHLY" && (isNaN(basicRate) || basicRate <= 0)) {
    return res.status(400).json({ message: "A positive basic rate is required for monthly employees." });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1) Ensure employee_id uniqueness
    const [existingEmployees] = await connection.query(
      `SELECT employee_id FROM employee WHERE employee_id = ? LIMIT 1`,
      [employee_id]
    );
    if (existingEmployees.length > 0) {
      await connection.rollback();
      return res.status(409).json({ message: "This Employee ID is already assigned." });
    }

    // 2) Insert into employee table
    const depId = department_id ? Number(department_id) : null;
    await connection.query(
      `INSERT INTO employee (employee_id, department_id, first_name, last_name, nic, email, phone, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE')`,
      [employee_id, depId, first_name, last_name, nic, email, phone]
    );

    // 3) Insert salary configuration
    await connection.query(
      `INSERT INTO salary_configurations (employee_id, salary_type, basic_rate, is_epf_eligible, effective_date)
       VALUES (?, ?, ?, ?, ?)`,
      [employee_id, salaryType, basicRate, isEpfEligible, effectiveDate]
    );

    // 4) Create system login credentials
    const loginUsername = `EMP${employee_id}`;
    const temporaryPassword = generateTempPassword();
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    const [existingUsers] = await connection.query(
      `SELECT user_id FROM user WHERE username = ? OR email = ? LIMIT 1`,
      [loginUsername, email]
    );
    if (existingUsers.length > 0) {
      await connection.rollback();
      return res.status(409).json({ message: "Login username or email already exists in the system." });
    }

    await connection.query(
      `INSERT INTO user (
          employee_id, username, email, password_hash, role, is_active,
          must_change_password, temp_password_issued_at
       )
       VALUES (?, ?, ?, ?, 'EMPLOYEE', 1, 1, NOW())`,
      [employee_id, loginUsername, email, hashedPassword]
    );

    await connection.commit();

    // 5) Async Email notification
    try {
      await sendCredentialsEmail(email, loginUsername, temporaryPassword);
    } catch (emailErr) {
      console.error("[CREATE-EMPLOYEE] Failed to send email:", emailErr);
    }

    return res.status(201).json({
      message: "Employee and system user created successfully.",
      employee: { employee_id, first_name, last_name, email, status: "ACTIVE" },
      credentials: { username: loginUsername, tempPassword: temporaryPassword },
    });
  } catch (err) {
    await connection.rollback();
    console.error("[CREATE-EMPLOYEE] SQL Error:", err);
    return res.status(500).json({ message: "Database error during employee creation." });
  } finally {
    connection.release();
  }
};

/**
 * This section deactivates an employee who is no longer working.
 * It marks them as "inactive" and stops them from being able to log into the system.
 */
export const deactivateEmployee = async (req, res) => {
  const { employee_id } = req.params;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [updateResult] = await connection.query(
      `UPDATE employee SET status='INACTIVE' WHERE employee_id = ?`,
      [employee_id]
    );

    if (updateResult.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Employee record not found." });
    }

    await connection.query(
      `UPDATE user SET is_active=0 WHERE employee_id = ?`,
      [employee_id]
    );

    await connection.commit();
    return res.json({ message: "Employee deactivated and login access revoked." });
  } catch (err) {
    await connection.rollback();
    console.error("[DEACTIVATE-EMPLOYEE] Error:", err);
    return res.status(500).json({ message: "Failed to deactivate employee." });
  } finally {
    connection.release();
  }
};

/**
 * This section gets a full list of all employees and their current salary details.
 */
export const getEmployees = async (req, res) => {
  try {
    const [employeeRows] = await pool.query(
      `SELECT e.*, 
              s.salary_type, s.basic_rate, s.is_epf_eligible, s.effective_date
       FROM employee e
       LEFT JOIN salary_configurations s ON e.employee_id = s.employee_id
       ORDER BY e.employee_id ASC`
    );
    return res.json(employeeRows);
  } catch (err) {
    console.error("[GET-EMPLOYEES] Error:", err);
    return res.status(500).json({ message: "Failed to retrieve employee records." });
  }
};

/**
 * This section finds employees who have resigned or been terminated,
 * so the accountant can finish their final pay calculations.
 */
export const getSettlementReadyEmployees = async (req, res) => {
  try {
    const [readyEmployeeRows] = await pool.query(
      `SELECT e.*, 
              s.salary_type, s.basic_rate, s.is_epf_eligible, s.effective_date,
              d.name as department_name
       FROM employee e
       LEFT JOIN salary_configurations s ON e.employee_id = s.employee_id
       LEFT JOIN departments d ON e.department_id = d.id
       WHERE e.status IN ('RESIGNED', 'TERMINATED')
       ORDER BY e.employee_id ASC`
    );
    return res.json(readyEmployeeRows);
  } catch (err) {
    console.error("[SETTLEMENT-READY] Error:", err);
    return res.status(500).json({ message: "Failed to retrieve settlement-ready employees." });
  }
};

/**
 * This section simply lists all the different departments in the company.
 */
export const getDepartments = async (req, res) => {
  try {
    const [departmentRows] = await pool.query("SELECT * FROM departments ORDER BY id ASC");
    return res.json(departmentRows);
  } catch (err) {
    console.error("[GET-DEPARTMENTS] Error:", err);
    return res.status(500).json({ message: "Failed to retrieve departments." });
  }
};

/**
 * This section is used to change any information for an existing employee,
 * such as updating their phone number or changing their salary rate.
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

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1) Sync core employee attributes
    const depId = department_id ? Number(department_id) : null;
    await connection.query(
      `UPDATE employee 
       SET department_id=?, first_name=?, last_name=?, nic=?, email=?, phone=?, status=?
       WHERE employee_id=?`,
      [depId, first_name, last_name, nic, email, phone, status, employee_id]
    );

    // 2) Sync system user activity based on employee status
    const isLoginActive = status === 'ACTIVE' ? 1 : 0;
    await connection.query(
      `UPDATE user SET is_active = ? WHERE employee_id = ?`,
      [isLoginActive, employee_id]
    );

    // 3) Update Salary Config if provided
    if (salary_configuration) {
      const { salary_type, basic_rate, is_epf_eligible, effective_date } = salary_configuration;
      const bRate = Number(basic_rate) || 0;
      const sType = String(salary_type).toUpperCase() === 'DAILY' ? 'DAILY' : 'MONTHLY';
      const epfCheck = Number(is_epf_eligible) ? 1 : 0;
      const effDate = effective_date || new Date().toISOString().slice(0, 10);

      const [existingConfig] = await connection.query(
        "SELECT config_id FROM salary_configurations WHERE employee_id=?",
        [employee_id]
      );

      if (existingConfig.length > 0) {
        await connection.query(
          `UPDATE salary_configurations
           SET salary_type=?, basic_rate=?, is_epf_eligible=?, effective_date=?
           WHERE employee_id=?`,
          [sType, bRate, epfCheck, effDate, employee_id]
        );
      } else {
        await connection.query(
          `INSERT INTO salary_configurations (employee_id, salary_type, basic_rate, is_epf_eligible, effective_date)
           VALUES (?, ?, ?, ?, ?)`,
          [employee_id, sType, bRate, epfCheck, effDate]
        );
      }
    }

    await connection.commit();
    return res.json({ message: "Employee record modified successfully." });
  } catch (err) {
    await connection.rollback();
    console.error("[UPDATE-EMPLOYEE] SQL Error:", err);
    return res.status(500).json({ message: "Failed to update employee details." });
  } finally {
    connection.release();
  }
};
