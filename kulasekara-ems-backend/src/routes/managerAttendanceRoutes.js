import express from "express";
import { markAttendance, getEmployeeAttendanceStats } from "../controllers/managerAttendanceController.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// Manager marks attendance
router.post("/attendance", requireAuth, requireRole("MANAGER"), markAttendance);

// Manager gets specific employee stats
router.get("/attendance/:employee_id/stats", requireAuth, requireRole("MANAGER"), getEmployeeAttendanceStats);

export default router;
