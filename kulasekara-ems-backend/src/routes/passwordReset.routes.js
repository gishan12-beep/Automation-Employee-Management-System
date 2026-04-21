import express from "express";
import crypto from "crypto";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { pool } from "../config/db.js";
import { sendResetPasswordEmail } from "../utils/mailer.js";

dotenv.config();
const router = express.Router();

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * ✅ 1) FORGOT PASSWORD (SMTP MODE)
 * - Generates secure token
 * - Stores hashed token
 * - Sends reset link via email
 */
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body || {};

    if (!email || !String(email).trim()) {
      return res.status(400).json({ message: "Email is required." });
    }

    const trimmedEmail = String(email).trim();

    const [rows] = await pool.query(
      "SELECT user_id, email FROM user WHERE email = ? LIMIT 1",
      [trimmedEmail]
    );

    // 🔐 Security: always return same response
    if (!rows.length) {
      return res.json({
        message: "If this email exists, a reset link has been sent.",
      });
    }

    const user = rows[0];

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Invalidate previous tokens
    await pool.query(
      "UPDATE password_reset_tokens SET used = 1 WHERE user_id = ? AND used = 0",
      [user.user_id]
    );

    // Save new token
    await pool.query(
      "INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)",
      [user.user_id, tokenHash, expiresAt]
    );

    const FRONTEND_URL = process.env.FRONTEND_URL;
    const resetLink = `${FRONTEND_URL}/reset-password?token=${rawToken}`;

    // 📧 SEND EMAIL
    await sendResetPasswordEmail(user.email, resetLink);

    return res.json({
      message: "If this email exists, a reset link has been sent.",
    });
  } catch (err) {
    console.error("forgot-password error:", err);
    return res.status(500).json({ message: "Server error." });
  }
});

/**
 * ✅ 2) RESET PASSWORD
 * - Validates token
 * - Checks expiry
 * - Updates user.password_hash
 */
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body || {};

    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token and new password are required." });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const tokenHash = hashToken(token);

    const [rows] = await pool.query(
      `SELECT id, user_id, expires_at, used
       FROM password_reset_tokens
       WHERE token_hash = ?
       LIMIT 1`,
      [tokenHash]
    );

    if (!rows.length) {
      return res.status(400).json({ message: "Invalid reset token." });
    }

    const t = rows[0];
    const expired = new Date(t.expires_at).getTime() < Date.now();

    if (t.used === 1 || expired) {
      return res.status(400).json({ message: "Reset link expired or already used." });
    }

    const hashedPassword = await bcrypt.hash(String(newPassword), 10);

    // ✅ Update user and RESET ALL FLAGS
    await pool.query(
      `UPDATE user 
       SET password_hash = ?, 
           must_change_password = 0, 
           temp_password_issued_at = NULL 
       WHERE user_id = ?`,
      [hashedPassword, t.user_id]
    );

    // Mark token as used
    await pool.query(
      "UPDATE password_reset_tokens SET used = 1 WHERE id = ?",
      [t.id]
    );


    return res.json({ message: "Password updated successfully." });
  } catch (err) {
    console.error("reset-password error:", err);
    return res.status(500).json({ message: "Server error." });
  }
});

export default router;
