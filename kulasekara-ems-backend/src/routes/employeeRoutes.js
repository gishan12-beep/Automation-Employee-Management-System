import express from "express";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";
import { blockIfMustChangePassword } from "../middleware/mustChangePasswordMiddleware.js";

const router = express.Router();

/**
 * 🔐 Employee protected routes
 * - Must be logged in
 * - Must be EMPLOYEE
 * - Must have changed temp password
 */
router.use(
  requireAuth,
  requireRole("EMPLOYEE"),
  blockIfMustChangePassword
);

// Example employee dashboard API
router.get("/dashboard", (req, res) => {
  res.json({ message: "Employee dashboard access granted" });
});

export default router;
