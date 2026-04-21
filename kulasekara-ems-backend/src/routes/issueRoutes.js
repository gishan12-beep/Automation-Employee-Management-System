import express from "express";
import {
    getIssues,
    resolveIssue,
    getMyIssues,
    reportIssue,
    getIssueById,
    deleteIssue
} from "../controllers/issueController.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// Manager routes
router.get("/issues", requireAuth, requireRole("MANAGER"), getIssues);
router.get("/issues/:id", requireAuth, requireRole("MANAGER"), getIssueById);
router.patch("/issues/:id/resolve", requireAuth, requireRole("MANAGER"), resolveIssue);
router.delete("/issues/:id", requireAuth, requireRole("MANAGER"), deleteIssue);

// Employee routes
router.get("/my-issues", requireAuth, requireRole("EMPLOYEE"), getMyIssues);
router.post("/issues", requireAuth, requireRole("EMPLOYEE"), reportIssue);

export default router;
