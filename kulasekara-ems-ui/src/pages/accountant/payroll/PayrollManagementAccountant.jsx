import React, { useMemo, useState } from "react";
import AppLayout from "../../../components/layout/AppLayout";
import { useNavigate } from "react-router-dom";
import { formatLKR } from "../../../utils/salaryUtils";

const mockPayroll = [
  { id: "PAY-001", month: "Jan 2026", employees: 18, net: 785000, status: "Processed", updated: "2026-01-20" },
  { id: "PAY-002", month: "Dec 2025", employees: 17, net: 742000, status: "Processed", updated: "2025-12-20" },
  { id: "PAY-003", month: "Nov 2025", employees: 17, net: 730000, status: "Draft", updated: "2025-11-19" },
];

// Component for viewing and managing historical payroll batches and their completion statuses
export default function PayrollManagementAccountant() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  // Filters the mock payroll data based on the user's search query (ID, month, or status)
  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return mockPayroll;
    return mockPayroll.filter((r) =>
      [r.id, r.month, r.status].some((v) => String(v).toLowerCase().includes(s))
    );
  }, [q]);

  return (
    <AppLayout>
      <div style={styles.page}>
        <div style={styles.headerRow}>
          <div>
            <h2 style={styles.title}>Payroll Management</h2>
            <p style={styles.subTitle}>Manage processed payroll periods and access reports.</p>
          </div>

          <div style={styles.searchWrap}>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by month, id, status…"
              style={styles.search}
            />
            <button
              style={styles.btnPrimary}
              onClick={() => navigate("/accountant/reports/payroll-summary")}
            >
              Open Payroll Summary
            </button>
          </div>
        </div>

        <div style={styles.panel}>
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Payroll ID</th>
                  <th style={styles.th}>Period</th>
                  <th style={styles.th}>Employees</th>
                  <th style={styles.th}>Net Total</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Last Updated</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr><td style={styles.td} colSpan={7}>No payroll records found.</td></tr>
                ) : (
                  rows.map((r) => (
                    <tr key={r.id}>
                      <td style={styles.td}><b>{r.id}</b></td>
                      <td style={styles.td}>{r.month}</td>
                      <td style={styles.td}>{r.employees}</td>
                      <td style={styles.td}>{formatLKR(r.net)}</td>
                      <td style={styles.td}><StatusPill status={r.status} /></td>
                      <td style={styles.td}>{r.updated}</td>
                      <td style={styles.td}>
                        <button style={styles.btnSecondary} onClick={() => navigate("/accountant/payroll/audit")}>
                          Audit
                        </button>
                        <button style={styles.btnSecondary} onClick={() => navigate("/accountant/reports/payroll-summary")}>
                          Summary
                        </button>
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

// Small UI component to display a status label with color-coded background
function StatusPill({ status }) {
  const s = String(status).toLowerCase();
  const isProcessed = s === "processed";
  const isDraft = s === "draft";
  const bg = isProcessed ? "#E9F8EE" : isDraft ? "#EEF2FF" : "#FFF6E5";
  const fg = isProcessed ? "#1C7C3D" : isDraft ? "#2B3A8A" : "#8A5A00";
  return <span style={{ ...styles.pill, background: bg, color: fg }}>{status}</span>;
}

const styles = {
  page: { padding: 18, maxWidth: 1200, margin: "0 auto" },
  headerRow: { display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 14 },
  title: { margin: 0, fontSize: 22, fontWeight: 900 },
  subTitle: { margin: "6px 0 0", opacity: 0.75, fontSize: 13 },

  searchWrap: { display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" },
  search: { border: "1px solid #e5e7eb", borderRadius: 12, padding: "10px 12px", minWidth: 280, outline: "none" },

  btnPrimary: { border: "none", background: "#111827", color: "#fff", padding: "10px 14px", borderRadius: 12, fontWeight: 800, cursor: "pointer" },
  btnSecondary: { border: "1px solid #e5e7eb", background: "#fff", padding: "8px 10px", borderRadius: 12, fontWeight: 800, cursor: "pointer", marginRight: 8 },

  panel: { background: "#fff", border: "1px solid #eef0f4", borderRadius: 16, overflow: "hidden", boxShadow: "0 6px 18px rgba(16,24,40,0.06)" },
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "separate", borderSpacing: 0 },
  th: { textAlign: "left", fontSize: 12, padding: "12px 14px", background: "#fafafa", borderBottom: "1px solid #f0f2f6", opacity: 0.8, whiteSpace: "nowrap" },
  td: { padding: "12px 14px", borderBottom: "1px solid #f5f6f8", fontSize: 13, whiteSpace: "nowrap" },

  pill: { display: "inline-flex", alignItems: "center", padding: "6px 10px", borderRadius: 999, fontSize: 12, fontWeight: 900 },
};
