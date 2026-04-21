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
      return res.status(403).json({ message: "Password reset not required handled here. Use normal change password instead." });
    }

    const newHash = await bcrypt.hash(String(newPassword), 10);

    // ✅ Update hash and RESET ALL FLAGS
    await pool.query(
      `UPDATE user
       SET password_hash = ?, 
           must_change_password = 0, 
           temp_password_issued_at = NULL
       WHERE user_id = ?`,
      [newHash, userId]
    );

    return res.json({ message: "Password updated successfully", must_change_password: 0 });
  } catch (err) {
    console.error("CHANGE PASSWORD FIRST LOGIN ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * ✅ 2) VOLUNTARY PASSWORD CHANGE (Requires current password)
 * POST /api/auth/change-password
 * Body: { currentPassword, newPassword }
 */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Both current and new passwords are required" });
    }
    if (String(newPassword).length < 8) {
      return res.status(400).json({ message: "New password must be at least 8 characters" });
    }

    const userId = req.user?.user_id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // 1) Fetch current user
    const [rows] = await pool.query(
      `SELECT password_hash FROM user WHERE user_id = ? LIMIT 1`,
      [userId]
    );
    if (rows.length === 0) return res.status(404).json({ message: "User not found" });

    // 2) Verify current password
    const ok = await bcrypt.compare(String(currentPassword), rows[0].password_hash);
    if (!ok) {
      return res.status(401).json({ message: "Incorrect current password" });
    }

    // 3) Hash and Update
    const newHash = await bcrypt.hash(String(newPassword), 10);
    await pool.query(
      `UPDATE user
       SET password_hash = ?, 
           must_change_password = 0, 
           temp_password_issued_at = NULL
       WHERE user_id = ?`,
      [newHash, userId]
    );

    return res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("CHANGE PASSWORD ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

