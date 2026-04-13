import express from "express";
import {
  createEmployee,
  deactivateEmployee,
  getEmployees,
  getSettlementReadyEmployees,
  getDepartments,
  updateEmployee,
  getDashboardStats,
} from "../controllers/managerEmployeeController.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// Manager adds employee
router.post("/employees", requireAuth, requireRole("MANAGER"), createEmployee);

// Manager updates employee
router.put("/employees/:employee_id", requireAuth, requireRole("MANAGER"), updateEmployee);

// Manager gets employees
router.get("/employees", requireAuth, requireRole("MANAGER", "ACCOUNTANT"), getEmployees);

// Manager gets settlement-ready employees (RESIGNED/TERMINATED)
router.get("/employees/settlement-ready", requireAuth, requireRole("MANAGER", "ACCOUNTANT"), getSettlementReadyEmployees);

// Manager gets departments
router.get("/departments", requireAuth, requireRole("MANAGER", "ACCOUNTANT"), getDepartments);

// Manager gets dashboard stats
router.get("/stats", requireAuth, requireRole("MANAGER"), getDashboardStats);

// Manager removes (soft) employee
router.patch(
  "/employees/:employee_id/deactivate",
  requireAuth,
  requireRole("MANAGER"),
  deactivateEmployee
);

export default router;
