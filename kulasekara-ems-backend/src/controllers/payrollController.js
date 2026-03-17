import * as payrollService from "../services/payrollService.js";

// ✅ POST /api/payroll/process/:month/:year (Manager)
export const processPayroll = async (req, res) => {
    try {
        const { month: mInput, year: yInput } = req.params;
        const month = parseInt(mInput, 10);
        const year = parseInt(yInput, 10);

        if (!month || month < 1 || month > 12) {
            return res.status(400).json({ message: "Invalid month (1-12)" });
        }
        if (!year || year < 2020) {
            return res.status(400).json({ message: "Invalid year (>= 2020)" });
        }

        const results = await payrollService.processMonthlyPayroll(month, year);
        return res.json({
            message: "Payroll processing completed",
            processed: results.processedCount,
            skipped: results.skippedCount,
            details: results.details || []
        });

    } catch (err) {
        console.error("PROCESS PAYROLL ERROR:", err);
        return res.status(500).json({ message: err.message || "Payroll processing failed" });
    }
};

// ✅ POST /api/payroll/process/:month/:year/:employeeId (Manager)
export const processSingleEmployee = async (req, res) => {
    try {
        const { month: mInput, year: yInput, employeeId } = req.params;
        const month = parseInt(mInput, 10);
        const year = parseInt(yInput, 10);

        if (!month || month < 1 || month > 12) {
            return res.status(400).json({ message: "Invalid month (1-12)" });
        }
        if (!year || year < 2020) {
            return res.status(400).json({ message: "Invalid year (>= 2020)" });
        }

        const result = await payrollService.processSingleEmployeePayroll(employeeId, month, year);
        if (!result.success) {
            return res.status(400).json({ message: result.message });
        }
        return res.json({
            message: result.message,
            details: result.details
        });

    } catch (err) {
        console.error("PROCESS SINGLE PAYROLL ERROR:", err);
        return res.status(500).json({ message: err.message || "Payroll processing failed" });
    }
};

// ✅ GET /api/payroll/me/:month/:year (Employee)
export const getMyPayroll = async (req, res) => {
    try {
        const employeeId = req.user.employee_id;
        const { month: mInput, year: yInput } = req.params;
        const month = parseInt(mInput, 10);
        const year = parseInt(yInput, 10);

        if (!month || month < 1 || month > 12) return res.status(400).json({ message: "Invalid month (1-12)" });
        if (!year || year < 2020) return res.status(400).json({ message: "Invalid year" });

        const history = await payrollService.getEmployeePayroll(employeeId, month, year);
        return res.json({ history });
    } catch (err) {
        console.error("GET MY PAYROLL ERROR:", err);
        return res.status(500).json({ message: "Failed to fetch payroll history" });
    }
};

// ✅ GET /api/payroll/summary/:month/:year (Accountant)
export const getSummary = async (req, res) => {
    try {
        const { month, year } = req.params;

        // Basic validation
        if (isNaN(month) || isNaN(year)) {
            return res.status(400).json({ message: "Invalid month or year" });
        }

        const data = await payrollService.getPayrollSummary(month, year);
        return res.json(data);

    } catch (err) {
        console.error("GET SUMMARY ERROR:", err);
        return res.status(500).json({ message: "Failed to fetch summary" });
    }
};

// ✅ PATCH /api/payroll/:payrollId (Accountant)
export const updatePayrollRun = async (req, res) => {
    try {
        const { payrollId } = req.params;
        const { adjustment_type, amount, reason, ...others } = req.body;

        if (!reason || reason.trim().length < 5) {
            return res.status(400).json({ message: "Note/Reason is required (min 5 chars) for auditing." });
        }

        // Simple Adjustment Case
        if (adjustment_type === 'BONUS' || adjustment_type === 'DEDUCTION') {
            if (!amount || Number(amount) <= 0) {
                return res.status(400).json({ message: "Amount must be greater than 0 for adjustments." });
            }
        }
        // Full Edit Case
        else {
            // Check if we have at least one field to edit
            const editFields = ['total_ot_pay', 'total_incentives', 'total_deductions', 'epf_employee', 'epf_employer', 'etf_employer'];
            const hasEdit = editFields.some(f => others[f] !== undefined);
            if (!hasEdit) {
                return res.status(400).json({ message: "No editable fields provided for full payslip update." });
            }
        }

        const updated = await payrollService.editPayrollRun(
            payrollId,
            req.body,
            req.user
        );

        return res.json({ message: "Payroll updated successfully", payroll: updated });

    } catch (err) {
        console.error("UPDATE PAYROLL ERROR:", err);
        return res.status(500).json({ message: err.message || "Failed to update payroll" });
    }
};
