import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../../components/layout/AppLayout";

const money = (n) =>
  Number(n || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 });

export default function SalaryHistory() {
  const navigate = useNavigate();

  // ✅ Dummy payroll runs based on your payroll_runs schema
  const dummyHistory = useMemo(
    () => [
      {
        payroll_id: 12,
        month: 12,
        year: 2025,
        basic_earnings: 85000,
        total_ot_pay: 6500,
        gross_pay: 91500,
        epf_employee: 7320,
        epf_employer: 10980,
        etf_employer: 2745,
        net_pay: 84180,
        generated_at: "2026-01-05 10:15:00",
      },
      {
        payroll_id: 11,
        month: 11,
        year: 2025,
        basic_earnings: 84000,
        total_ot_pay: 4200,
        gross_pay: 88200,
        epf_employee: 7056,
        epf_employer: 10584,
        etf_employer: 2646,
        net_pay: 81144,
        generated_at: "2025-12-05 10:12:00",
      },
      {
        payroll_id: 10,
        month: 10,
        year: 2025,
        basic_earnings: 82000,
        total_ot_pay: 3000,
        gross_pay: 85000,
        epf_employee: 6800,
        epf_employer: 10200,
        etf_employer: 2550,
        net_pay: 78200,
        generated_at: "2025-11-05 10:09:00",
      },
      {
        payroll_id: 9,
        month: 9,
        year: 2025,
        basic_earnings: 80000,
        total_ot_pay: 2500,
        gross_pay: 82500,
        epf_employee: 6600,
        epf_employer: 9900,
        etf_employer: 2475,
        net_pay: 75900,
        generated_at: "2025-10-05 10:05:00",
      },
    ],
    []
  );

  const currentYear = new Date().getFullYear();
  const years = useMemo(() => {
    const arr = [];
    for (let y = currentYear; y >= currentYear - 5; y--) arr.push(y);
    return arr;
  }, [currentYear]);

  const [year, setYear] = useState(currentYear);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return dummyHistory
      .filter((r) => (year ? r.year === year : true))
      .filter((r) => {
        if (!query.trim()) return true;
        const q = query.trim().toLowerCase();
        const period = `${String(r.month).padStart(2, "0")}/${r.year}`.toLowerCase();
        return period.includes(q);
      })
      .sort((a, b) => (b.year - a.year) || (b.month - a.month));
  }, [dummyHistory, year, query]);

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
    label: { fontSize: 12, color: "#6b7280", marginBottom: 6, display: "block" },
    input: {
      padding: "10px 10px",
      borderRadius: 10,
      border: "1px solid #e5e7eb",
      outline: "none",
      minWidth: 220,
      background: "#fff",
    },
    select: {
      padding: "10px 10px",
      borderRadius: 10,
      border: "1px solid #e5e7eb",
      outline: "none",
      minWidth: 140,
      background: "#fff",
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
      padding: "12px 12px",
      borderBottom: "1px solid #eef2f7",
      background: "#fbfdff",
      position: "sticky",
      top: 0,
      zIndex: 1,
      whiteSpace: "nowrap",
    },
    td: {
      padding: "12px 12px",
      fontSize: 13,
      color: "#111827",
      borderBottom: "1px solid #f3f4f6",
      whiteSpace: "nowrap",
    },
    row: { cursor: "pointer" },

    pill: {
      display: "inline-block",
      padding: "6px 10px",
      borderRadius: 999,
      background: "#eef2ff",
      color: "#3730a3",
      fontSize: 12,
      fontWeight: 800,
    },
    net: { fontWeight: 900 },

    empty: { padding: 16, color: "#6b7280", fontSize: 13 },
    hint: { marginTop: 10, fontSize: 12, color: "#6b7280" },

    kpiRow: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: 14 },
    kpi: {
      background: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: 14,
      boxShadow: "0 6px 18px rgba(17,24,39,0.06)",
      padding: 14,
    },
    kpiLbl: { fontSize: 12, color: "#6b7280", marginBottom: 6 },
    kpiVal: { fontSize: 18, fontWeight: 900, color: "#111827" },
  };

  const totals = useMemo(() => {
    const netTotal = filtered.reduce((s, r) => s + Number(r.net_pay || 0), 0);
    const grossTotal = filtered.reduce((s, r) => s + Number(r.gross_pay || 0), 0);
    const otTotal = filtered.reduce((s, r) => s + Number(r.total_ot_pay || 0), 0);
    return { netTotal, grossTotal, otTotal };
  }, [filtered]);

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
                <span style={styles.label}>Search (MM/YYYY)</span>
                <input
                  style={styles.input}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g., 12/2025"
                />
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

          <div style={styles.kpiRow}>
            <div style={styles.kpi}>
              <div style={styles.kpiLbl}>Total Gross (filtered)</div>
              <div style={styles.kpiVal}>LKR {money(totals.grossTotal)}</div>
            </div>
            <div style={styles.kpi}>
              <div style={styles.kpiLbl}>Total OT Pay (filtered)</div>
              <div style={styles.kpiVal}>LKR {money(totals.otTotal)}</div>
            </div>
            <div style={styles.kpi}>
              <div style={styles.kpiLbl}>Total Net Pay (filtered)</div>
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
                  {filtered.length === 0 ? (
                    <tr>
                      <td style={styles.empty} colSpan={7}>
                        No records found for selected year / search.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((r) => (
                      <tr
                        key={r.payroll_id}
                        style={styles.row}
                        onClick={() =>
                          navigate("/employee/salary-slip", {
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
