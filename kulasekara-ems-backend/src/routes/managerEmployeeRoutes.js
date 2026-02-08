import express from "express";
import {
  createEmployee,
  deactivateEmployee,
  getEmployees,
  getDepartments,
  updateEmployee,
} from "../controllers/managerEmployeeController.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// Manager adds employee
router.post("/employees", requireAuth, requireRole("MANAGER"), createEmployee);

// Manager updates employee
router.put("/employees/:employee_id", requireAuth, requireRole("MANAGER"), updateEmployee);

// Manager gets employees
router.get("/employees", requireAuth, requireRole("MANAGER"), getEmployees);

// Manager gets departments
router.get("/departments", requireAuth, requireRole("MANAGER"), getDepartments);

// Manager removes (soft) employee
router.patch(
  "/employees/:employee_id/deactivate",
  requireAuth,
  requireRole("MANAGER"),
  deactivateEmployee
);

export default router;
