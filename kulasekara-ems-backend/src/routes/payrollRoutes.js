import express from "express";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";
import * as payrollController from "../controllers/payrollController.js";

const router = express.Router();

// Process Payroll (Accountant/Admin)
router.post(
    "/process/:month/:year",
    requireAuth,
    requireRole("ACCOUNTANT", "ADMIN"),
    payrollController.processPayroll
);

// Process Single Employee Payroll (Accountant/Admin)
router.post(
    "/process/:month/:year/:employeeId",
    requireAuth,
    requireRole("ACCOUNTANT", "ADMIN"),
    payrollController.processSingleEmployee
);

// Get My Payroll (Employee/User)
router.get(
    "/me/:month/:year",
    requireAuth,
    payrollController.getMyPayroll
);

// Get Payroll Summary (Accountant)
router.get(
    "/summary/:month/:year",
    requireAuth,
    requireRole("ACCOUNTANT", "MANAGER", "ADMIN"),
    payrollController.getSummary
);

// Get Detailed Payroll Run (Accountant)
router.get(
    "/details/:month/:year/:employeeId",
    requireAuth,
    requireRole("ACCOUNTANT", "MANAGER", "ADMIN"),
    payrollController.getPayrollDetails
);

// Update Payroll (Accountant)
router.patch(
    "/:payrollId",
    requireAuth,
    requireRole("ACCOUNTANT"),
    payrollController.updatePayrollRun
);

export default router;
