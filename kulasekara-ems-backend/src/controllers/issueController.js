import * as issueRepo from "../repositories/issueRepository.js";

// Fetches all issues/complaints reported by any employee (Manager access)
export const getIssues = async (req, res) => {
    try {
        const issues = await issueRepo.getAllIssues();
        res.json(issues);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch issues", error: err.message });
    }
};

// Updates an issue status (e.g., to RESOLVED) and adds a manager reply
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

// Returns a list of issues reported by the currently logged-in employee
export const getMyIssues = async (req, res) => {
    const { employee_id } = req.user;
    try {
        const issues = await issueRepo.getIssuesByEmployee(employee_id);
        res.json(issues);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch your issues", error: err.message });
    }
};

// Allows an employee to submit a new issue or complaint
export const reportIssue = async (req, res) => {
    const { employee_id } = req.user;
    const { type, description } = req.body;
    try {
        const id = await issueRepo.createIssue({ employee_id, type, description });
        res.status(201).json({ message: "Issue reported successfully", id });
    } catch (err) {
        res.status(500).json({ message: "Failed to report issue", error: err.message });
    }
};

// Retrieves a specific issue record by its ID
export const getIssueById = async (req, res) => {
    const { id } = req.params;

    try {
        const issue = await issueRepo.getIssueById(id);
        if (!issue) return res.status(404).json({ message: "Issue not found" });
        res.status(200).json(issue);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch issue", error: err.message });
    }
};

// Permanently deletes an issue record (Manager access)
export const deleteIssue = async (req, res) => {
    const { id } = req.params;
    try {
        await issueRepo.deleteIssue(id);
        res.json({ message: "Issue deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Failed to delete issue", error: err.message });
    }
};
