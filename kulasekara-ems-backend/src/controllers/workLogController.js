import * as workLogRepo from "../repositories/workLogRepository.js";

/**
 * Controller to fetch all task rates
 */
export const getTasks = async (req, res) => {
    try {
        const tasks = await workLogRepo.getAllTaskRates();
        res.json({ tasks });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch tasks", error: err.message });
    }
};

/**
 * Controller to fetch work logs for an employee on a specific date
 */
export const getEmployeeWorkLogs = async (req, res) => {
    const { employee_id, date } = req.params;
    if (!employee_id || !date) {
        return res.status(400).json({ message: "Missing employee_id or date" });
    }

    try {
        const logs = await workLogRepo.getWorkLogsByEmployeeAndDate(employee_id, date);
        res.json({ logs });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch work logs", error: err.message });
    }
};

/**
 * Controller to create a new work log
 */
export const createLog = async (req, res) => {
    const { employee_id, task_id, date, quantity, applied_rate } = req.body;

    if (!employee_id || !task_id || !date || !quantity || applied_rate === undefined) {
        return res.status(400).json({ message: "Missing required fields for work log" });
    }

    try {
        const logId = await workLogRepo.insertWorkLog({
            employee_id,
            task_id,
            date,
            quantity: Number(quantity),
            applied_rate: Number(applied_rate)
        });
        res.status(201).json({ message: "Work log created successfully", log_id: logId });
    } catch (err) {
        res.status(500).json({ message: "Failed to create work log", error: err.message });
    }
};
