import express from "express";
import { markAttendance } from "../controllers/managerAttendanceController.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// Manager marks attendance
router.post("/attendance", requireAuth, requireRole("MANAGER"), markAttendance);

export default router;
