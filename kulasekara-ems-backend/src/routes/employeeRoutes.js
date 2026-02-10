import express from "express";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";
import { blockIfMustChangePassword } from "../middleware/mustChangePasswordMiddleware.js";

import {
  getTodayAttendance,
  markCheckIn,
  markCheckOut
} from "../controllers/employeeAttendanceController.js";

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

// Dashboard
router.get("/dashboard", (req, res) => {
  res.json({ message: "Employee dashboard access granted" });
});

// Attendance
router.get("/attendance/today", getTodayAttendance);
router.post("/attendance/check-in", markCheckIn);
router.put("/attendance/check-out", markCheckOut);

export default router;
