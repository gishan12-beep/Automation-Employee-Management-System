import React, { useState, useEffect } from "react";
import AppLayout from "../../../components/layout/AppLayout";
import { getLeaveReportApi } from "../../../services/reportService";
import { 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  XCircle
} from "lucide-react";

// Component for generating a detailed summary of all employee leave applications
export default function LeaveReports() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Fetches the complete leave history from the backend when the component is initially loaded
  useEffect(() => {
    fetchLeaves();
  }, []);

  // Retrieves leave request records using the report analytics service
  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const data = await getLeaveReportApi();
      // Updates state with the retrieved data array
      setLeaves(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch leaves report:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filters the list of leave applications based on keyword matching and status selection
  const filteredLeaves = leaves.filter(leave => {
    // Searches against the reason for leave, employee ID, and specific leave type
    const matchesSearch = 
      leave.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leave.employee_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leave.leave_type?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Checks if the leave matches the current status filter (ALL, PENDING, APPROVED, REJECTED)
    const matchesStatus = statusFilter === "ALL" || leave.status === statusFilter;
    
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
              <h1 style={styles.title}>Leave Reports</h1>
              <p style={styles.subtitle}>Consolidated view of all leave applications and statuses</p>
            </div>
          </div>

          <div style={styles.filtersWrapper}>
            <div style={styles.searchBox}>
              <Search size={18} color="#64748b" />
              <input 
                style={styles.input} 
                placeholder="Search by reason, employee ID or type..." 
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
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>

          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Employee ID</th>
                  <th style={styles.th}>Leave Type</th>
                  <th style={styles.th}>Period</th>
                  <th style={styles.th}>Reason</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Applied Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" style={styles.emptyTd}>Loading leaves...</td></tr>
                ) : filteredLeaves.length === 0 ? (
                  <tr><td colSpan="6" style={styles.emptyTd}>No leave requests found.</td></tr>
                ) : (
                  filteredLeaves.map((leave) => (
                    <tr key={leave.leave_id} style={styles.tr}>
                      <td style={styles.td}>
                        <span style={styles.empId}>{leave.employee_id}</span>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.typeTag}>{leave.leave_type}</div>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.periodBox}>
                          <span style={styles.date}>{new Date(leave.start_date).toLocaleDateString()}</span>
                          <span style={styles.to}>to</span>
                          <span style={styles.date}>{new Date(leave.end_date).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td style={{ ...styles.td, maxWidth: "250px" }}>
                        <span style={styles.reasonText}>{leave.reason}</span>
                      </td>
                      <td style={styles.td}>
                        <StatusBadge status={leave.status} />
                      </td>
                      <td style={styles.td}>
                        {new Date(leave.created_at || leave.start_date).toLocaleDateString()}
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

function StatusBadge({ status }) {
  let color = "#64748b";
  let bg = "#f1f5f9";
  let Icon = Clock;
  
  if (status === "APPROVED") { color = "#059669"; bg = "#ecfdf5"; Icon = CheckCircle2; }
  if (status === "REJECTED") { color = "#dc2626"; bg = "#fef2f2"; Icon = XCircle; }
  
  return (
    <span style={{ 
      ...styles.badge, 
      color, 
      backgroundColor: bg,
      border: `1px solid ${color}20`
    }}>
      <Icon size={12} />
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
  empId: { fontWeight: 800, color: "#1e293b", fontFamily: "monospace" },
  typeTag: { display: "inline-block", padding: "4px 10px", background: "#f1f5f9", borderRadius: "8px", fontSize: "12px", fontWeight: 700, color: "#475569" },
  periodBox: { display: "flex", alignItems: "center", gap: "8px" },
  date: { fontWeight: 600 },
  to: { fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", fontWeight: 700 },
  reasonText: { display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#64748b" },
  badge: { display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 12px", borderRadius: "10px", fontSize: "11px", fontWeight: 800, textTransform: "uppercase" }
};
