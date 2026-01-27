import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../config/db.js";

export const login = async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      return res
        .status(400)
        .json({ message: "emailOrUsername and password required" });
    }

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

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      {
        user_id: user.user_id,
        role: String(user.role || "").toUpperCase(), // optional but good
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
        must_change_password: user.must_change_password, // ✅ NEW
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const me = async (req, res) => {
  return res.json({ user: req.user });
};
