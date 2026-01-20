import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../../components/layout/AppLayout";
import { getMySalaryHistory } from "../../../services/payrollService";
import { formatLKR, calcTotals } from "../../../utils/salaryUtils";

export default function SalaryHistory() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getMySalaryHistory().then(setRows);
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      `${r.periodStart} ${r.periodEnd} ${r.slipId}`.toLowerCase().includes(q)
    );
  }, [rows, search]);

  return (
    <AppLayout>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ marginTop: 0 }}>Salary History</h2>

        <div style={{ background: "#fff", padding: 12, borderRadius: 10, marginBottom: 12 }}>
          <label style={{ fontSize: 14 }}>Search (Period / Slip ID)</label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="e.g., 2025-09 or SLIP-2025..."
            style={{
              width: "100%",
              marginTop: 6,
              padding: 10,
              borderRadius: 8,
              border: "1px solid #ddd",
              outline: "none",
            }}
          />
        </div>

        <div style={{ background: "#fff", padding: 12, borderRadius: 10 }}>
          {filtered.length === 0 ? (
            <p style={{ color: "#666" }}>No salary records found.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f2f2f2" }}>
                  <th style={{ textAlign: "left", padding: 10 }}>Slip ID</th>
                  <th style={{ textAlign: "left", padding: 10 }}>Period</th>
                  <th style={{ textAlign: "left", padding: 10 }}>Paid On</th>
                  <th style={{ textAlign: "right", padding: 10 }}>Net Pay</th>
                  <th style={{ padding: 10 }}></th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((r) => {
                  const t = calcTotals(r);
                  return (
                    <tr key={r.slipId} style={{ borderTop: "1px solid #eee" }}>
                      <td style={{ padding: 10 }}>{r.slipId}</td>
                      <td style={{ padding: 10 }}>
                        {r.periodStart} to {r.periodEnd}
                      </td>
                      <td style={{ padding: 10 }}>{r.paidOn}</td>
                      <td style={{ padding: 10, textAlign: "right" }}>
                        {formatLKR(t.netPay)}
                      </td>
                      <td style={{ padding: 10, textAlign: "right" }}>
                        <button
                          type="button"
                          onClick={() => navigate(`/employee/payroll/salary-slip/${r.slipId}`)}
                          style={{
                            padding: "8px 12px",
                            borderRadius: 8,
                            border: "none",
                            background: "#111",
                            color: "#fff",
                            cursor: "pointer",
                          }}
                        >
                          View Slip
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
