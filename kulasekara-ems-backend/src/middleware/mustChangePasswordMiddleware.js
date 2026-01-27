// src/middleware/mustChangePasswordMiddleware.js
import { pool } from "../config/db.js";

/**
 * Blocks EMPLOYEE routes if password reset is required
 */
export const blockIfMustChangePassword = async (req, res, next) => {
  try {
    const role = (req.user?.role || "").toUpperCase();

    // Only enforce for EMPLOYEE
    if (role !== "EMPLOYEE") return next();

    const userId = req.user?.user_id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const [rows] = await pool.query(
      `SELECT must_change_password FROM user WHERE user_id = ? LIMIT 1`,
      [userId]
    );

    if (rows.length === 0) return res.status(401).json({ message: "Unauthorized" });

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
