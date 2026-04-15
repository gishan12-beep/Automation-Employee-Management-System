// src/pages/manager/reports/EPFETFReports.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../../components/layout/AppLayout";

const formatLKR = (n) =>
  new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR" }).format(Number(n || 0));

export default function EPFETFReports() {
  const [month, setMonth] = useState(getMonthKey(new Date()));
  const [q, setQ] = useState("");

  const data = useMemo(() => makeDummyContrib(month), [month]);
  const navigate = useNavigate();

  const rows = useMemo(() => {
    let list = [...data.rows];
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      list = list.filter(
        (r) =>
          r.employeeId.toLowerCase().includes(s) ||
          r.employeeName.toLowerCase().includes(s)
      );
    }
    return list;
  }, [data, q]);

  const kpis = useMemo(() => {
    const empEpf = rows.reduce((s, r) => s + r.employeeEPF, 0);
    const erEpf = rows.reduce((s, r) => s + r.employerEPF, 0);
    const etf = rows.reduce((s, r) => s + r.etf, 0);
    const total = empEpf + erEpf + etf;
    return { empEpf, erEpf, etf, total, employees: rows.length };
  }, [rows]);

  return (
    <AppLayout>
      <div style={styles.page}>
        {/* Inline CSS Animations */}
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
        `}</style>

        {/* Animated background elements */}
        <div className="floating-circle fc-1"></div>
        <div className="floating-circle fc-2"></div>
        <div className="floating-circle fc-3"></div>

        <div style={styles.container}>
          <div style={styles.headerRow}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <button onClick={() => navigate(-1)} style={styles.backBtn}>
                  ← Back
                </button>
                <h2 style={styles.heading}>EPF / ETF Reports</h2>
              </div>
              <p style={styles.subText}>
                Monthly compliance summary and employee-wise EPF/ETF breakdown.
              </p>
            </div>

            <div style={styles.actions}>
              <button
                style={styles.secondaryBtn}
                onClick={() => alert("Export will be added after backend integration")}
              >
                Export (PDF/Excel)
              </button>
              <button style={styles.secondaryBtn} onClick={() => window.print()}>
                Print
              </button>
            </div>
          </div>

          <div style={styles.filters}>
            <div style={styles.filterItem}>
              <div style={styles.label}>Month</div>
              <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} style={styles.input} />
            </div>

            <div style={{ ...styles.filterItem, flex: 1 }}>
              <div style={styles.label}>Search</div>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by name or ID..."
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.kpiGrid}>
            <KpiCard title="Employees" value={kpis.employees} hint={`Month: ${month}`} />
            <KpiCard title="Employee EPF Total" value={formatLKR(kpis.empEpf)} hint="Employee contribution" />
            <KpiCard title="Employer EPF Total" value={formatLKR(kpis.erEpf)} hint="Employer contribution" />
            <KpiCard title="ETF Total" value={formatLKR(kpis.etf)} hint="ETF contribution" />
            <KpiCard title="Total Contribution" value={formatLKR(kpis.total)} hint="EPF + ETF total" />
          </div>

          <div style={styles.panel}>
            <div style={styles.panelTitle}>Employee-wise EPF/ETF</div>
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Employee</th>
                    <th style={styles.thRight}>Employee EPF</th>
                    <th style={styles.thRight}>Employer EPF</th>
                    <th style={styles.thRight}>ETF</th>
                    <th style={styles.thRight}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const total = r.employeeEPF + r.employerEPF + r.etf;
                    return (
                      <tr key={r.id}>
                        <td style={styles.td}>
                          <div style={{ fontWeight: 900 }}>{r.employeeName}</div>
                          <div style={{ opacity: 0.7, fontSize: 12 }}>{r.employeeId}</div>
                        </td>
                        <td style={styles.tdRight}>{formatLKR(r.employeeEPF)}</td>
                        <td style={styles.tdRight}>{formatLKR(r.employerEPF)}</td>
                        <td style={styles.tdRight}>{formatLKR(r.etf)}</td>
                        <td style={styles.tdRight}>{formatLKR(total)}</td>
                      </tr>
                    );
                  })}
                  {rows.length === 0 && (
                    <tr>
                      <td style={styles.td} colSpan={5}>
                        No EPF/ETF rows for selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function KpiCard({ title, value, hint }) {
  return (
    <div style={styles.kpiCard}>
      <div style={styles.kpiTitle}>{title}</div>
      <div style={styles.kpiValue}>{value}</div>
      <div style={styles.kpiHint}>{hint}</div>
    </div>
  );
}

function getMonthKey(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${yyyy}-${mm}`;
}

function makeDummyContrib(monthKey) {
  const rows = [
    { id: "C1", employeeId: "EMP002", employeeName: "Nimal Silva", employeeEPF: 5600, employerEPF: 8400, etf: 2100 },
    { id: "C2", employeeId: "EMP006", employeeName: "Ruwan Perera", employeeEPF: 4200, employerEPF: 6300, etf: 1575 },
    { id: "C3", employeeId: "EMP007", employeeName: "Shanika Jay", employeeEPF: 3800, employerEPF: 5700, etf: 1425 },
  ];
  return { month: monthKey, rows };
}

const styles = {
  page: { position: "relative", minHeight: "100%", overflow: "hidden" },
  container: { padding: 32, position: "relative", zIndex: 1 },
  headerRow: { display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 32 },
  heading: { margin: 0, fontSize: 32, fontWeight: 900, color: "#2c5530" },
  subText: { marginTop: 6, marginBottom: 0, fontSize: 15, color: "#64748b", fontWeight: 500 },

  actions: { display: "flex", gap: 12, flexWrap: "wrap" },
  secondaryBtn: {
    padding: "12px 24px", 
    borderRadius: "14px", 
    background: "linear-gradient(135deg, #4a7c4e 0%, #5a8c5e 100%)", 
    color: "#fff", 
    border: "none", 
    fontWeight: 700, 
    cursor: "pointer", 
    boxShadow: "0 8px 20px rgba(74, 124, 78, 0.25)",
    transition: "transform 0.2s"
  },
  backBtn: {
    background: "none",
    border: "none",
    padding: 0,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 700,
    color: "#6b7280",
    display: "flex",
    alignItems: "center",
  },

  filters: {
    marginTop: 20,
    display: "flex",
    gap: 16,
    flexWrap: "wrap",
    background: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    borderRadius: "20px",
    padding: "20px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
  },
  filterItem: { minWidth: 200, display: "flex", flexDirection: "column", gap: 8 },
  label: { fontSize: "11px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" },
  input: { 
    height: "44px", 
    borderRadius: "14px", 
    border: "1px solid #e2e8f0", 
    padding: "0 16px", 
    fontSize: "14px", 
    fontWeight: 600, 
    color: "#1e293b", 
    background: "#fff", 
    outline: "none" 
  },

  kpiGrid: {
    marginTop: 20,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 20,
  },
  kpiCard: {
    background: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    borderRadius: "24px",
    padding: "24px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.02)",
  },
  kpiTitle: { fontSize: "11px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 },
  kpiValue: { fontSize: "22px", fontWeight: 900, color: "#1e293b", marginBottom: 6 },
  kpiHint: { fontSize: "12px", color: "#64748b", fontWeight: 600 },

  panel: {
    marginTop: 32,
    background: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    borderRadius: "24px",
    padding: 24,
    boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
    overflow: "hidden"
  },
  panelTitle: { fontWeight: 800, marginBottom: 20, fontSize: 18, color: "#1f2937" },
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "separate", borderSpacing: 0 },
  th: { 
    textAlign: "left", 
    padding: "16px 24px", 
    fontSize: "11px", 
    fontWeight: 800, 
    color: "#94a3b8", 
    textTransform: "uppercase",
    background: "rgba(248, 250, 252, 0.5)", 
    borderBottom: "1px solid rgba(0,0,0,0.05)" 
  },
  thRight: { 
    textAlign: "right", 
    padding: "16px 24px", 
    fontSize: "11px", 
    fontWeight: 800, 
    color: "#94a3b8", 
    textTransform: "uppercase",
    background: "rgba(248, 250, 252, 0.5)", 
    borderBottom: "1px solid rgba(0,0,0,0.05)" 
  },
  td: { padding: "18px 24px", fontSize: "14px", color: "#475569", borderBottom: "1px solid rgba(0,0,0,0.05)" },
  tdRight: { padding: "18px 24px", textAlign: "right", fontSize: "14px", fontWeight: 700, color: "#1e293b", borderBottom: "1px solid rgba(0,0,0,0.05)" },
};
