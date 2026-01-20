// UI mock (later connect backend)
const STORAGE_KEY = "employee_issues_mock";

const seed = [
  {
    id: "ISS-001",
    title: "OT hours not included",
    category: "Payroll",
    description: "My overtime for September is missing in the salary slip.",
    priority: "High",
    status: "Pending",
    createdAt: "2025-10-06",
    reply: "",
  },
  {
    id: "ISS-002",
    title: "Attendance correction needed",
    category: "Attendance",
    description: "I forgot to check out on 2025-10-02.",
    priority: "Medium",
    status: "Resolved",
    createdAt: "2025-10-03",
    reply: "Attendance updated. Please verify in your attendance history.",
  },
];

const readAll = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }
  try {
    return JSON.parse(raw);
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }
};

const writeAll = (items) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export const getMyIssues = async () => {
  return readAll();
};

export const createIssue = async (payload) => {
  const all = readAll();
  const newIssue = {
    id: `ISS-${String(all.length + 1).padStart(3, "0")}`,
    status: "Pending",
    createdAt: new Date().toISOString().slice(0, 10),
    reply: "",
    ...payload,
  };
  const updated = [newIssue, ...all];
  writeAll(updated);
  return newIssue;
};
