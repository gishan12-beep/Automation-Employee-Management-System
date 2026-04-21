import express from "express";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";
import * as reportController from "../controllers/reportController.js";

const router = express.Router();

// Manager Report Routes
router.get(
    "/reports/attendance",
    requireAuth,
    requireRole("MANAGER", "ADMIN"),
    reportController.getAttendanceSummaryReport
);

router.get(
    "/reports/issues",
    requireAuth,
    requireRole("MANAGER", "ADMIN"),
    reportController.getIssueSummaryReport
);

router.get(
    "/reports/leaves",
    requireAuth,
    requireRole("MANAGER", "ADMIN"),
    reportController.getLeaveSummaryReport
);

router.get(
    "/reports/settlements",
    requireAuth,
    requireRole("MANAGER", "ADMIN"),
    reportController.getSettlementSummaryReport
);

router.get(
    "/reports/cash-payout",
    requireAuth,
    requireRole("MANAGER", "ADMIN"),
    reportController.getCashPayoutReport
);

export default router;
