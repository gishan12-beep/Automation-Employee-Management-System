import * as issueRepo from "../repositories/issueRepository.js";

// Manager gets all issues
export const getIssues = async (req, res) => {
    try {
        const issues = await issueRepo.getAllIssues();
        res.json(issues);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch issues", error: err.message });
    }
};

// Manager resolves an issue
export const resolveIssue = async (req, res) => {
    const { id } = req.params;
    const { status, reply } = req.body;
    try {
        await issueRepo.updateIssue(id, { status, reply });
        res.json({ message: "Issue updated successfully" });
    } catch (err) {
        res.status(500).json({ message: "Failed to update issue", error: err.message });
    }
};

// Employee gets their issues
export const getMyIssues = async (req, res) => {
    const { employee_id } = req.user; // from auth middleware
    try {
        const issues = await issueRepo.getIssuesByEmployee(employee_id);
        res.json(issues);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch your issues", error: err.message });
    }
};

// Employee reports an issue
export const reportIssue = async (req, res) => {
    const { employee_id } = req.user;
    const { title, category, description, priority } = req.body;
    try {
        const id = await issueRepo.createIssue({ employee_id, title, category, description, priority });
        res.status(201).json({ message: "Issue reported successfully", id });
    } catch (err) {
        res.status(500).json({ message: "Failed to report issue", error: err.message });
    }
};
