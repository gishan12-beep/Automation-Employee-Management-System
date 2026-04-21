import React, { useState, useEffect } from "react";
import AppLayout from "../../../components/layout/AppLayout";
import { getSettlementReportApi } from "../../../services/reportService";
import { 
  Search, 
  UserMinus,
  Briefcase
} from "lucide-react";

export default function SettlementReports() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const data = await getSettlementReportApi();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch settlement employees:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(emp => {
    return (
      emp.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employee_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
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
              <div style={styles.breadcrumb}>Manager / Financial Closure</div>
              <h1 style={styles.title}>Final Settlement Reports</h1>
              <p style={styles.subtitle}>Employees eligible for final settlement (Resigned or Terminated)</p>
            </div>
          </div>

          <div style={styles.filtersWrapper}>
            <div style={styles.searchBox}>
              <Search size={18} color="#64748b" />
              <input 
                style={styles.input} 
                placeholder="Search by name, ID or department..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Employee</th>
                  <th style={styles.th}>Department</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Salary Type</th>
                  <th style={styles.th}>NIC</th>
                  <th style={styles.th}>Effective Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" style={styles.emptyTd}>Loading data...</td></tr>
                ) : filteredEmployees.length === 0 ? (
                  <tr><td colSpan="6" style={styles.emptyTd}>No employees found for settlement.</td></tr>
                ) : (
                  filteredEmployees.map((emp) => (
                    <tr key={emp.employee_id} style={styles.tr}>
                      <td style={styles.td}>
                        <div style={styles.empBox}>
                          <span style={styles.empName}>{emp.first_name} {emp.last_name}</span>
                          <span style={styles.empId}>{emp.employee_id}</span>
                        </div>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.deptTag}>
                          <Briefcase size={12} />
                          {emp.department_name || "Unassigned"}
                        </div>
                      </td>
                      <td style={styles.td}>
                        <StatusBadge status={emp.emp_status} />
                      </td>
                      <td style={styles.td}>{emp.emp_status === 'RESIGNED' ? 'Resigned' : 'Terminated'}</td>
                      <td style={styles.td}>{emp.settlement_status || 'NOT STARTED'}</td>
                      <td style={styles.td}>
                        {emp.last_working_date ? new Date(emp.last_working_date).toLocaleDateString() : 'N/A'}
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
  const isResigned = status === "RESIGNED";
  return (
    <span style={{ 
      ...styles.badge, 
      color: isResigned ? "#d97706" : "#dc2626",
      backgroundColor: isResigned ? "#fffbeb" : "#fef2f2",
      border: `1px solid ${isResigned ? "#d97706" : "#dc2626"}20`
    }}>
      <UserMinus size={12} />
      {status}
    </span>
  );
}

const styles = {
  page: { minHeight: "100%", position: "relative", overflow: "hidden" },
  container: { padding: "32px", maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 },
  breadcrumb: { fontSize: "11px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" },
  header: { marginBottom: "32px" },
  title: { margin: 0, fontSize: "32px", fontWeight: 900, color: "#2c5530", letterSpacing: "-0.02em" },
  subtitle: { margin: "4px 0 0 0", fontSize: "15px", color: "#64748b", fontWeight: 500 },
  filtersWrapper: { 
    display: "flex", 
    gap: "16px", 
    marginBottom: "24px",
    background: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(12px)",
    borderRadius: "18px",
    padding: "20px",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    boxShadow: "0 4px 20px rgba(0,0,0,0.02)"
  },
  searchBox: { 
    flex: 1, 
    background: "#fff", 
    border: "1px solid #e2e8f0", 
    borderRadius: "12px", 
    padding: "0 16px", 
    display: "flex", 
    alignItems: "center", 
    gap: "12px" 
  },
  input: { flex: 1, border: "none", padding: "12px 0", outline: "none", fontSize: "14px", color: "#1e293b", fontWeight: 600 },
  tableWrapper: { 
    background: "rgba(255, 255, 255, 0.9)", 
    backdropFilter: "blur(12px)",
    borderRadius: "24px", 
    border: "1px solid rgba(255, 255, 255, 0.5)", 
    overflow: "hidden", 
    boxShadow: "0 10px 30px rgba(0,0,0,0.03)" 
  },
  table: { width: "100%", borderCollapse: "separate", borderSpacing: 0 },
  th: { 
    textAlign: "left", 
    padding: "16px 24px", 
    background: "rgba(248, 250, 252, 0.5)", 
    color: "#94a3b8", 
    fontSize: "11px", 
    fontWeight: 800, 
    textTransform: "uppercase", 
    letterSpacing: "0.05em", 
    borderBottom: "1px solid rgba(0,0,0,0.05)" 
  },
  tr: { transition: "background 0.2s" },
  td: { padding: "18px 24px", color: "#475569", fontSize: "14px", borderBottom: "1px solid rgba(0,0,0,0.05)" },
  emptyTd: { padding: "64px", textAlign: "center", color: "#94a3b8", fontWeight: 600, fontSize: "15px" },
  empBox: { display: "flex", flexDirection: "column", gap: "2px" },
  empName: { fontWeight: 700, color: "#1e293b", fontSize: "14px" },
  empId: { fontSize: "11px", color: "#94a3b8", fontWeight: 800, fontFamily: "monospace", letterSpacing: "0.05em" },
  deptTag: { display: "inline-flex", alignItems: "center", gap: "6px", color: "#64748b", fontWeight: 600, fontSize: "13px" },
  badge: { 
    display: "inline-flex", 
    alignItems: "center", 
    gap: "6px", 
    padding: "6px 12px", 
    borderRadius: "10px", 
    fontSize: "11px", 
    fontWeight: 800, 
    textTransform: "uppercase",
    letterSpacing: "0.05em"
  }
};
