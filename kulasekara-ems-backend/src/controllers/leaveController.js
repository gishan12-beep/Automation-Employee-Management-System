import {
    getAllLeaveRequests,
    updateLeaveStatus,
    getLeaveRequestsByEmployee,
    createLeaveRequest,
    getLeaveTypes,
    deleteLeaveRequest,
} from "../repositories/leaveRepository.js";

// Retrieves all available leave types from the database
export const fetchLeaveTypes = async (req, res) => {
    try {
        const types = await getLeaveTypes();
        res.json(types);
    } catch (err) {
        console.error("Error fetching leave types:", err);
        res.status(500).json({ error: "Failed to fetch leave types" });
    }
};

// Permanently removes a leave request (Manager access)
export const deleteLeave = async (req, res) => {
    const { id } = req.params;
    try {
        await deleteLeaveRequest(id);
        res.json({ message: "Leave request deleted successfully" });
    } catch (err) {
        console.error("Error deleting leave request:", err);
        res.status(500).json({ error: "Failed to delete leave request" });
    }
};

// Fetches all leave requests for all employees (Manager access)
export const getLeaveRequests = async (req, res) => {
    try {
        const leaves = await getAllLeaveRequests();
        res.json(leaves);
    } catch (err) {
        console.error("Error fetching leave requests:", err);
        res.status(500).json({ error: "Failed to fetch leave requests" });
    }
};

// Updates a leave request status (APPROVED/REJECTED) and adds an optional remark
export const updateLeaveRequestStatus = async (req, res) => {
    try {
        const leaveId = req.params.id;
        const { status, remark } = req.body;

        if (!["PENDING", "APPROVED", "REJECTED"].includes(status)) {
            return res.status(400).json({ error: "Invalid status" });
        }

        const result = await updateLeaveStatus(leaveId, status, remark || null);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Leave request not found" });
        }

        res.json({ message: `Leave request ${status} successfully` });
    } catch (err) {
        console.error("Error updating leave status:", err);
        res.status(500).json({ error: "Failed to update leave status" });
    }
};

// Returns a list of leave requests for the currently logged-in employee
export const getEmployeeLeaves = async (req, res) => {
    try {
        const employeeId = req.user.employee_id;
        const leaves = await getLeaveRequestsByEmployee(employeeId);
        res.json(leaves);
    } catch (err) {
        console.error("Error fetching employee leaves:", err);
        res.status(500).json({ error: "Failed to fetch leave requests" });
    }
};

// Creates and submits a new leave request for an employee
export const submitLeaveRequest = async (req, res) => {
    try {
        const employeeId = req.user.employee_id;
        const { leave_type_id, start_date, end_date, reason } = req.body;

        if (!leave_type_id || !start_date || !end_date) {
            return res.status(400).json({ error: "Leave type ID, start date, and end date are required." });
        }

        const leaveId = await createLeaveRequest({
            employee_id: employeeId,
            leave_type_id,
            start_date,
            end_date,
            reason,
        });

        res.status(201).json({ message: "Leave request submitted successfully", leave_id: leaveId });
    } catch (err) {
        console.error("Error submitting leave request:", err);
        res.status(500).json({ error: "Failed to submit leave request" });
    }
};
