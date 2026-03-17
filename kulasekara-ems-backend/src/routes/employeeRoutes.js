import express from "express";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";
import { blockIfMustChangePassword } from "../middleware/mustChangePasswordMiddleware.js";

import {
  getTodayAttendance,
  markCheckIn,
  markCheckOut
} from "../controllers/employeeAttendanceController.js";

import {
  getEmployeeLeaves,
  submitLeaveRequest,
  fetchLeaveTypes
} from "../controllers/leaveController.js";

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

// Leave Requests
router.get("/leaves", getEmployeeLeaves);
router.post("/leaves", submitLeaveRequest);
router.get("/leave-types", fetchLeaveTypes);

export default router;
