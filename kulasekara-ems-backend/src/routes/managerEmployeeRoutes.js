import express from "express";
import { createEmployee, deactivateEmployee } from "../controllers/managerEmployeeController.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// Manager adds employee
router.post("/employees", requireAuth, requireRole("MANAGER"), createEmployee);

// Manager removes (soft) employee
router.patch(
  "/employees/:employee_id/deactivate",
  requireAuth,
  requireRole("MANAGER"),
  deactivateEmployee
);

export default router;
