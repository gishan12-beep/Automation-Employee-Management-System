import express from "express";
import {
    getLeaveRequests,
    updateLeaveRequestStatus,
    fetchLeaveTypes,
    deleteLeave
} from "../controllers/leaveController.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// Manager gets all leaf requests
router.get("/leaves", requireAuth, requireRole("MANAGER"), getLeaveRequests);

// Manager processes (approves/rejects) a leave request
router.patch(
    "/leaves/:id/status",
    requireAuth,
    requireRole("MANAGER"),
    updateLeaveRequestStatus
);

// Manager gets leave types
router.get("/leave-types", requireAuth, requireRole("MANAGER"), fetchLeaveTypes);

// Manager deletes a leave request
router.delete("/leaves/:id", requireAuth, requireRole("MANAGER"), deleteLeave);

export default router;
