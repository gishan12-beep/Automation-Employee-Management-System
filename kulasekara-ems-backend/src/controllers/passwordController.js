// src/controllers/passwordController.js
import bcrypt from "bcrypt";
import { pool } from "../config/db.js";

/**
 * ✅ First-login password change (NO current password)
 * POST /api/auth/change-password-first-login
 * Body: { newPassword }
 * Requires: JWT (requireAuth)
 */
export const changePasswordFirstLogin = async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ message: "newPassword is required" });
    }
    if (String(newPassword).length < 8) {
      return res.status(400).json({ message: "New password must be at least 8 characters" });
    }

    const userId = req.user?.user_id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // ✅ allow only if must_change_password = 1
    const [rows] = await pool.query(
      `SELECT must_change_password FROM user WHERE user_id = ? LIMIT 1`,
      [userId]
    );

    if (rows.length === 0) return res.status(404).json({ message: "User not found" });

    if (Number(rows[0].must_change_password) !== 1) {
      return res.status(403).json({ message: "Password reset not required" });
    }

    const newHash = await bcrypt.hash(String(newPassword), 10);

    await pool.query(
      `UPDATE user
       SET password_hash = ?, must_change_password = 0, temp_password_issued_at = NULL
       WHERE user_id = ?`,
      [newHash, userId]
    );

    return res.json({ message: "Password updated", must_change_password: 0 });
  } catch (err) {
    console.error("CHANGE PASSWORD FIRST LOGIN ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
