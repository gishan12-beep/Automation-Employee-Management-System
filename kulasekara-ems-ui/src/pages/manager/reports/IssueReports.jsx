import React, { useState, useEffect } from "react";
import AppLayout from "../../../components/layout/AppLayout";
import { getIssueReportApi } from "../../../services/reportService";
import { 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2
} from "lucide-react";

// Component for generating a comprehensive report of all employee-raised issues and grievances
export default function IssueReports() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Fetches initial list of issues from the backend when the component mounts
  useEffect(() => {
    fetchIssues();
  }, []);

  // Retrieves all issues from the analytics report service
  const fetchIssues = async () => {
    setLoading(true);
    try {
      const data = await getIssueReportApi();
      // Ensures the received data is an array before updating the state
      setIssues(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch issues report:", err);
    } finally {
      setLoading(false);
    }
  };

  // Dynamically filters the issues list based on search keywords and resolution status
  const filteredIssues = issues.filter(issue => {
    if (!issue) return false;
    
    // Normalizes search terms and issue fields to lowercase for case-insensitive matching
    const searchLow = (searchTerm || "").toLowerCase();
    const title = (issue.title || "").toLowerCase();
    const empId = (issue.employee_id || "").toLowerCase();
    const fullName = `${issue.first_name || ""} ${issue.last_name || ""}`.toLowerCase();

    // Checks if the issue title, employee ID, or full name contains the search term
    const matchesSearch = 
      title.includes(searchLow) ||
      empId.includes(searchLow) ||
      fullName.includes(searchLow);
    
    // Checks if the issue matches the selected status filter (ALL, PENDING, RESOLVED)
    const matchesStatus = statusFilter === "ALL" || issue.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <AppLayout>
      <div style={styles.page}>
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) translateX(0px); }
            50% { transform: translateY(-20px) translateX(10px); }
          }
          @keyframes floatReverse {
            0%, 100% { transform: translateY(0px) translateX(0px); }
            50% { transform: translateY(20px) translateX(-10px); }
          }
          .floating-circle { position: absolute; border-radius: 50%; pointer-events: none; z-index: 0; }
          .fc-1 { animation: float 20s ease-in-out infinite; background: radial-gradient(circle, rgba(74, 124, 78, 0.08) 0%, transparent 70%); width: 400px; height: 400px; top: -100px; left: -100px; }
          .fc-2 { animation: floatReverse 25s ease-in-out infinite; background: radial-gradient(circle, rgba(74, 124, 78, 0.06) 0%, transparent 70%); width: 350px; height: 350px; bottom: -80px; right: -80px; }
          .fc-3 { animation: float 18s ease-in-out infinite; background: radial-gradient(circle, rgba(74, 124, 78, 0.05) 0%, transparent 70%); width: 250px; height: 250px; top: 20%; right: 10%; }
          
          .fade-in { animation: fadeIn 0.4s ease-out forwards; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          .table-row { transition: all 0.2s; cursor: pointer; }
          .table-row:hover { background: rgba(248, 250, 252, 0.8) !important; }
        `}</style>
        
        <div className="floating-circle fc-1"></div>
        <div className="floating-circle fc-2"></div>
        <div className="floating-circle fc-3"></div>

        <div style={styles.container}>
          <div style={styles.header}>
            <div>
              <h1 style={styles.title}>Issue Reports</h1>
              <p style={styles.subtitle}>List of all employee reported issues and concerns</p>
            </div>
          </div>

          <div style={styles.filtersWrapper} className="fade-in">
            <div style={styles.searchBox}>
              <Search size={18} color="#64748b" />
              <input 
                style={styles.input} 
                placeholder="Search by title, employee ID or name..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div style={styles.statusFilters}>
              <Filter size={18} color="#64748b" />
              <select 
                style={styles.select} 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>
          </div>

          <div style={styles.tableWrapper} className="fade-in">
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Issue</th>
                  <th style={styles.th}>Employee</th>
                  <th style={styles.th}>Category</th>
                  <th style={styles.th}>Priority</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" style={styles.emptyTd}>Loading issues...</td></tr>
                ) : filteredIssues.length === 0 ? (
                  <tr><td colSpan="6" style={styles.emptyTd}>No issues found.</td></tr>
                ) : (
                  filteredIssues.map((issue) => (
                    <tr key={issue.issue_id} className="table-row">
                      <td style={styles.td}>
                        <div style={styles.issueInfo}>
                          <span style={styles.issueTitle}>{issue.description?.substring(0, 30)}...</span>
                          <span style={styles.issueDesc}>{issue.description?.substring(0, 100)}...</span>
                        </div>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.empInfo}>
                          <span style={styles.empName}>{issue.first_name} {issue.last_name}</span>
                          <span style={styles.empId}>{issue.employee_id}</span>
                        </div>
                      </td>
                      <td style={styles.td}>{issue.type}</td>
                      <td style={styles.td}>
                        <PriorityBadge priority={issue.priority || "MEDIUM"} />
                      </td>
                      <td style={styles.td}>
                        <StatusBadge status={issue.status} />
                      </td>
                      <td style={styles.td}>
                        {new Date(issue.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function PriorityBadge({ priority }) {
  let color = "#64748b";
  let bg = "#f1f5f9";
  
  if (priority === "HIGH") { color = "#dc2626"; bg = "#fef2f2"; }
  if (priority === "MEDIUM") { color = "#d97706"; bg = "#fffbeb"; }
  
  return (
    <span style={{ 
      ...styles.badge, 
      color, 
      backgroundColor: bg,
      border: `1px solid ${color}20`
    }}>
      {priority}
    </span>
  );
}

function StatusBadge({ status }) {
  const isResolved = status === "RESOLVED";
  return (
    <span style={{ 
      ...styles.badge, 
      color: isResolved ? "#059669" : "#d97706",
      backgroundColor: isResolved ? "#ecfdf5" : "#fffbeb",
      border: `1px solid ${isResolved ? "#059669" : "#d97706"}20`
    }}>
      {isResolved ? <CheckCircle2 size={12} /> : <Clock size={12} />}
      {status}
    </span>
  );
}

const styles = {
  page: { minHeight: "100%", position: "relative" },
  container: { padding: "32px", maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 },
  header: { marginBottom: "32px" },
  title: { margin: 0, fontSize: "28px", fontWeight: 900, color: "#2c5530", letterSpacing: "-0.02em" },
  subtitle: { margin: "4px 0 0 0", fontSize: "15px", color: "#64748b", fontWeight: 500 },
  filtersWrapper: { display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap" },
  searchBox: { 
    flex: 1, 
    minWidth: "300px", 
    background: "rgba(255, 255, 255, 0.8)", 
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.5)", 
    borderRadius: "14px", 
    padding: "4px 16px", 
    display: "flex", 
    alignItems: "center", 
    gap: "12px", 
    boxShadow: "0 4px 15px rgba(0,0,0,0.02)" 
  },
  input: { flex: 1, border: "none", padding: "12px 0", outline: "none", fontSize: "14px", color: "#1e293b", fontWeight: 500, background: "transparent" },
  statusFilters: { 
    background: "rgba(255, 255, 255, 0.8)", 
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.5)", 
    borderRadius: "14px", 
    padding: "4px 16px", 
    display: "flex", 
    alignItems: "center", 
    gap: "12px", 
    boxShadow: "0 4px 15px rgba(0,0,0,0.02)" 
  },
  select: { border: "none", padding: "12px 0", outline: "none", fontSize: "14px", color: "#1e293b", fontWeight: 600, background: "transparent", cursor: "pointer" },
  tableWrapper: { 
    background: "rgba(255, 255, 255, 0.9)", 
    backdropFilter: "blur(12px)",
    borderRadius: "24px", 
    border: "1px solid rgba(255, 255, 255, 0.5)", 
    overflow: "hidden", 
    boxShadow: "0 10px 30px rgba(0,0,0,0.02)" 
  },
  table: { width: "100%", borderCollapse: "separate", borderSpacing: 0 },
  th: { 
    textAlign: "left", 
    padding: "18px 24px", 
    background: "rgba(248, 250, 252, 0.5)", 
    color: "#94a3b8", 
    fontSize: "11px", 
    fontWeight: 800, 
    textTransform: "uppercase", 
    letterSpacing: "0.05em", 
    borderBottom: "1px solid rgba(0,0,0,0.05)" 
  },
  tr: { borderBottom: "1px solid rgba(0,0,0,0.05)", transition: "background 0.2s" },
  td: { padding: "18px 24px", color: "#1e293b", fontSize: "14px", borderBottom: "1px solid rgba(0,0,0,0.05)" },
  emptyTd: { padding: "48px", textAlign: "center", color: "#94a3b8", fontWeight: 500 },
  issueInfo: { display: "flex", flexDirection: "column", gap: "2px" },
  issueTitle: { fontWeight: 700, color: "#1e293b" },
  issueDesc: { fontSize: "12px", color: "#64748b" },
  empInfo: { display: "flex", flexDirection: "column", gap: "2px" },
  empName: { fontWeight: 600, color: "#1e293b" },
  empId: { fontSize: "11px", color: "#94a3b8", fontWeight: 700 },
  badge: { display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 12px", borderRadius: "10px", fontSize: "11px", fontWeight: 800, textTransform: "uppercase" }
};
