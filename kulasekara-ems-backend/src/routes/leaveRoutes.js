import express from "express";
import {
    getLeaveRequests,
    updateLeaveRequestStatus,
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

export default router;
