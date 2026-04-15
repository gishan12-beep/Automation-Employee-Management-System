import express from "express";
import {
    getIssues,
    resolveIssue,
    getMyIssues,
    reportIssue
} from "../controllers/issueController.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// Manager routes
router.get("/issues", requireAuth, requireRole("MANAGER"), getIssues);
router.patch("/issues/:id/resolve", requireAuth, requireRole("MANAGER"), resolveIssue);

// Employee routes
router.get("/my-issues", requireAuth, requireRole("EMPLOYEE"), getMyIssues);
router.post("/issues", requireAuth, requireRole("EMPLOYEE"), reportIssue);

export default router;
