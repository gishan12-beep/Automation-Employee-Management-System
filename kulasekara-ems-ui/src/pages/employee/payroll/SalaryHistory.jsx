import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../../components/layout/AppLayout";
import { getMyPayrollApi } from "../../../services/payrollService";

const money = (n) =>
  Number(n || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 });

const pad2 = (n) => String(n).padStart(2, "0");

export default function SalaryHistory() {
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // 1-12

  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);

  const years = useMemo(() => {
    const arr = [];
    for (let y = currentYear + 1; y >= currentYear - 5; y--) arr.push(y);
    return arr;
  }, [currentYear]);

  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      // getMyPayrollApi is now configured to take month, year
      const data = await getMyPayrollApi(pad2(month), year);

      // Since it's a specific month/year, the response might be a single object or empty array.
      // If the backend returns an array of runs for that month, use it. If it returns an object, wrap in array.
      const dataArray = Array.isArray(data) ? data : (data ? [data] : []);
      setHistory(dataArray);
    } catch (err) {
      console.error(err);
      setError("Failed to load payroll history. " + (err.response?.data?.message || err.message));
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [month, year]);

  const totals = useMemo(() => {
    const netTotal = history.reduce((s, r) => s + Number(r.net_pay || 0), 0);
    const grossTotal = history.reduce((s, r) => s + Number(r.gross_pay || 0), 0);
    const otTotal = history.reduce((s, r) => s + Number(r.total_ot_pay || 0), 0);
    return { netTotal, grossTotal, otTotal };
  }, [history]);

  return (
    <AppLayout>
      <div style={styles.page}>
        <div style={styles.wrap}>
          <div style={styles.headerRow}>
            <div>
              <h1 style={styles.title}>Salary History</h1>
              <p style={styles.sub}>View your monthly payroll records and open a salary slip.</p>
            </div>

            <div style={styles.controls}>
              <div>
                <span style={styles.label}>Month</span>
                <select style={styles.select} value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                  {months.map((m) => (
                    <option key={m} value={m}>
                      {pad2(m)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <span style={styles.label}>Year</span>
                <select style={styles.select} value={year} onChange={(e) => setYear(Number(e.target.value))}>
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.kpiRow}>
            <div style={styles.kpi}>
              <div style={styles.kpiLbl}>Total Gross</div>
              <div style={styles.kpiVal}>LKR {money(totals.grossTotal)}</div>
            </div>
            <div style={styles.kpi}>
              <div style={styles.kpiLbl}>Total OT Pay</div>
              <div style={styles.kpiVal}>LKR {money(totals.otTotal)}</div>
            </div>
            <div style={styles.kpi}>
              <div style={styles.kpiLbl}>Total Net Pay</div>
              <div style={styles.kpiVal}>LKR {money(totals.netTotal)}</div>
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Period</th>
                    <th style={styles.th}>Basic</th>
                    <th style={styles.th}>OT</th>
                    <th style={styles.th}>Gross</th>
                    <th style={styles.th}>Net</th>
                    <th style={styles.th}>Generated</th>
                    <th style={styles.th}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td style={styles.empty} colSpan={7}>Loading...</td>
                    </tr>
                  ) : history.length === 0 ? (
                    <tr>
                      <td style={styles.empty} colSpan={7}>
                        No records found for {pad2(month)}/{year}.
                      </td>
                    </tr>
                  ) : (
                    history.map((r) => (
                      <tr
                        key={r.payroll_id}
                        style={styles.row}
                        onClick={() =>
                          navigate(`/employee/salary-slip/${r.payroll_id}`, {
                            state: { payroll: r },
                          })
                        }
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#fbfdff")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <td style={styles.td}>
                          <span style={styles.pill}>
                            {String(r.month).padStart(2, "0")}/{r.year}
                          </span>
                        </td>
                        <td style={styles.td}>LKR {money(r.basic_earnings)}</td>
                        <td style={styles.td}>LKR {money(r.total_ot_pay)}</td>
                        <td style={styles.td}>LKR {money(r.gross_pay)}</td>
                        <td style={{ ...styles.td, ...styles.net }}>LKR {money(r.net_pay)}</td>
                        <td style={styles.td}>
                          {r.generated_at ? new Date(r.generated_at).toLocaleString() : "-"}
                        </td>
                        <td style={styles.td}>
                          <span style={{ fontWeight: 800, color: "#111827" }}>View Slip →</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div style={styles.hint}>
            Click any row to open the detailed salary slip view.
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

const styles = {
  page: { background: "#f6f7fb", minHeight: "100vh" },
  wrap: { maxWidth: 1050, margin: "0 auto", padding: "18px 16px" },

  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 12,
    flexWrap: "wrap",
  },
  title: { margin: 0, fontSize: 20, fontWeight: 900, color: "#111827" },
  sub: { margin: "6px 0 0", fontSize: 13, color: "#6b7280" },

  controls: { display: "flex", gap: 10, alignItems: "end", flexWrap: "wrap" },
  label: { fontSize: 12, color: "#6b7280", marginBottom: 6, display: "block", fontWeight: 700 },
  select: {
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    outline: "none",
    minWidth: 100,
    background: "#fff",
    color: "#111827",
    fontWeight: 600
  },

  card: {
    marginTop: 14,
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    boxShadow: "0 6px 18px rgba(17,24,39,0.06)",
    overflow: "hidden",
  },

  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "separate", borderSpacing: 0 },
  th: {
    textAlign: "left",
    fontSize: 12,
    color: "#6b7280",
    padding: "12px 16px",
    borderBottom: "1px solid #eef2f7",
    background: "#fbfdff",
    position: "sticky",
    top: 0,
    zIndex: 1,
    whiteSpace: "nowrap",
    textTransform: "uppercase",
    fontWeight: 800
  },
  td: {
    padding: "16px 16px",
    fontSize: 14,
    color: "#111827",
    borderBottom: "1px solid #f3f4f6",
    whiteSpace: "nowrap",
  },
  row: { cursor: "pointer", transition: "background 0.2s" },

  pill: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    background: "#eef2ff",
    color: "#3730a3",
    fontSize: 12,
    fontWeight: 800,
  },
  net: { fontWeight: 800, color: "#2c5530" },

  empty: { padding: 32, color: "#6b7280", fontSize: 14, textAlign: "center", fontStyle: "italic" },
  hint: { marginTop: 12, fontSize: 12, color: "#6b7280", fontStyle: "italic" },

  error: {
    background: "#fee2e2",
    color: "#991b1b",
    padding: "16px",
    borderRadius: "12px",
    marginTop: "16px",
    fontWeight: 600,
    border: "1px solid #fecaca"
  },

  kpiRow: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 20 },
  kpi: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    boxShadow: "0 6px 18px rgba(17,24,39,0.06)",
    padding: 20,
  },
  kpiLbl: { fontSize: 12, color: "#6b7280", marginBottom: 6, fontWeight: 700, textTransform: "uppercase" },
  kpiVal: { fontSize: 20, fontWeight: 900, color: "#111827" },
};
