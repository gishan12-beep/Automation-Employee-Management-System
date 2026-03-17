import express from "express";
import { getTasks, getEmployeeWorkLogs, createLog } from "../controllers/workLogController.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected Manager routes
router.get("/work/tasks", requireAuth, requireRole("MANAGER"), getTasks);
router.get("/work/logs/:employee_id/:date", requireAuth, requireRole("MANAGER"), getEmployeeWorkLogs);
router.post("/work/logs", requireAuth, requireRole("MANAGER"), createLog);

export default router;
