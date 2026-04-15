import { pool } from "../config/db.js";

/**
 * GET /api/employee/settlement-preview
 * - Returns the final settlement record for the logged-in employee if it exists.
 */
export const getMySettlementPreview = async (req, res) => {
    const employeeId = req.user.employee_id;

    if (!employeeId) {
        return res.status(400).json({ message: "Employee ID not found in session" });
    }

    try {
        const [rows] = await pool.query(
            `SELECT fs.*, e.first_name, e.last_name, d.name as department_name
             FROM final_settlements fs
             JOIN employee e ON fs.employee_id = e.employee_id
             LEFT JOIN departments d ON e.department_id = d.id
             WHERE fs.employee_id = ?
             ORDER BY fs.settlement_id DESC LIMIT 1`,
            [employeeId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "No final settlement record found for this employee." });
        }

        const s = rows[0];

        // Format for the frontend FinalSettlement UI
        const responseData = {
            employeeId: s.employee_id,
            employeeName: `${s.first_name} ${s.last_name}`,
            designation: s.department_name || "Employee",
            lastWorkingDate: s.last_working_date,
            settlementDate: s.settled_date || s.last_working_date, // Fallback if not yet settled
            status: s.status,
            earnings: {
                unpaidSalary: Number(s.basic_payable) || 0,
                overtime: 0, // Not explicitly in final_settlements table fields but could be aggregated
                leaveEncashment: Number(s.leave_encashment) || 0,
                bonus: Number(s.gratuity_amount) || 0, // Using gratuity as primary bonus component
                other: Number(s.other_dues) || 0,
            },
            deductions: {
                advances: 0,
                loans: 0,
                epfEtfAdjustments: 0,
                other: Number(s.total_deductions) || 0,
            },
            notes: s.status === 'PENDING' 
                ? "This is a preview. Final values will be confirmed by Manager/Accountant."
                : "This settlement has been confirmed and paid.",
            netSettlement: Number(s.net_settlement_amount) || 0
        };

        return res.json(responseData);
    } catch (err) {
        console.error("Fetch settlement preview failed:", err);
        return res.status(500).json({ message: "Internal server error fetching settlement preview" });
    }
};
