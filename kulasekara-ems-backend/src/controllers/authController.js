import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../config/db.js";

// This section checks the user's name and password when they try to log in.
export const login = async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      return res
        .status(400)
        .json({ message: "emailOrUsername and password required" });
    }

    // Look for the user in our database using the name or email they provided.
    const [rows] = await pool.query(
      `SELECT user_id, employee_id, username, email, password_hash, role, is_active, must_change_password
       FROM user
       WHERE username = ? OR email = ?
       LIMIT 1`,
      [emailOrUsername, emailOrUsername]
    );

    if (rows.length === 0)
      return res.status(401).json({ message: "Invalid credentials" });

    const user = rows[0];
    if (user.is_active !== 1)
      return res.status(403).json({ message: "Account inactive" });

    // Check if the password they typed matches the one we have on file.
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    // Create a secure digital "key" (token) so the system remembers who is logged in.
    const token = jwt.sign(
      {
        user_id: user.user_id,
        role: String(user.role || "").toUpperCase(),
        employee_id: user.employee_id,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

    return res.json({
      token,
      user: {
        user_id: user.user_id,
        employee_id: user.employee_id,
        username: user.username,
        email: user.email,
        role: user.role,
        must_change_password: user.must_change_password,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// This helps the system double-check that the user is still correctly logged in.
export const me = async (req, res) => {
  return res.json({ user: req.user });
};
