// src/middleware/mustChangePasswordMiddleware.js
import { pool } from "../config/db.js";

// This keeps regular employees out of the system until they have set their own password.
export const blockIfMustChangePassword = async (req, res, next) => {
  try {
    const role = (req.user?.role || "").toUpperCase();

    // Only regular EMPLOYEES are required to change their password on first login.
    if (role !== "EMPLOYEE") return next();

    const userId = req.user?.user_id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // Check our records to see if this employee has already set their own password.
    const [rows] = await pool.query(
      `SELECT must_change_password FROM user WHERE user_id = ? LIMIT 1`,
      [userId]
    );

    if (rows.length === 0) return res.status(401).json({ message: "Unauthorized" });

    // If they haven't set a password yet, send a message telling them to do so.
    if (Number(rows[0].must_change_password) === 1) {
      return res.status(403).json({
        message: "Password reset required before accessing employee dashboard",
        code: "MUST_CHANGE_PASSWORD",
      });
    }

    next();
  } catch (err) {
    console.error("MUST CHANGE PASSWORD MIDDLEWARE ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
