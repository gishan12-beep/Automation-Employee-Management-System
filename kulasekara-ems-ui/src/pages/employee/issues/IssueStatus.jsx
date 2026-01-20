import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../../components/layout/AppLayout";
import { getMyIssues } from "../../../services/issueService";

export default function IssueStatus() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getMyIssues().then(setRows);
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      `${r.id} ${r.title} ${r.category} ${r.status}`.toLowerCase().includes(q)
    );
  }, [rows, search]);

  return (
    <AppLayout>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ marginTop: 0 }}>My Issues</h2>

          <button
            type="button"
            onClick={() => navigate("/employee/issues/raise")}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "none",
              background: "#111",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            + Raise Issue
          </button>
        </div>

        <div style={{ background: "#fff", padding: 12, borderRadius: 10, marginBottom: 12 }}>
          <label style={{ fontSize: 14 }}>Search (ID / Title / Status)</label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="e.g., Payroll or Pending or ISS-001"
            style={inputStyle}
          />
        </div>

        <div style={{ background: "#fff", padding: 12, borderRadius: 10 }}>
          {filtered.length === 0 ? (
            <p style={{ color: "#666" }}>No issues found.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f2f2f2" }}>
                  <th style={{ textAlign: "left", padding: 10 }}>ID</th>
                  <th style={{ textAlign: "left", padding: 10 }}>Title</th>
                  <th style={{ textAlign: "left", padding: 10 }}>Category</th>
                  <th style={{ textAlign: "left", padding: 10 }}>Priority</th>
                  <th style={{ textAlign: "left", padding: 10 }}>Status</th>
                  <th style={{ textAlign: "left", padding: 10 }}>Created</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} style={{ borderTop: "1px solid #eee", verticalAlign: "top" }}>
                    <td style={{ padding: 10 }}>{r.id}</td>
                    <td style={{ padding: 10 }}>
                      <div style={{ fontWeight: 600 }}>{r.title}</div>
                      <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                        {r.description}
                      </div>
                      {r.reply ? (
                        <div
                          style={{
                            marginTop: 8,
                            background: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            padding: 10,
                            borderRadius: 10,
                            fontSize: 13,
                          }}
                        >
                          <b>Reply:</b> {r.reply}
                        </div>
                      ) : null}
                    </td>
                    <td style={{ padding: 10 }}>{r.category}</td>
                    <td style={{ padding: 10 }}>{r.priority}</td>
                    <td style={{ padding: 10 }}>
                      <StatusPill value={r.status} />
                    </td>
                    <td style={{ padding: 10 }}>{r.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

function StatusPill({ value }) {
  const v = String(value || "").toLowerCase();
  const style = {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
    border: "1px solid #ddd",
    background: "#fff",
  };

  if (v === "resolved") return <span style={{ ...style, borderColor: "#86efac", background: "#f0fdf4" }}>Resolved</span>;
  if (v === "rejected") return <span style={{ ...style, borderColor: "#fda4af", background: "#fff1f2" }}>Rejected</span>;
  return <span style={{ ...style, borderColor: "#fde68a", background: "#fffbeb" }}>Pending</span>;
}

const inputStyle = {
  width: "100%",
  marginTop: 6,
  padding: 10,
  borderRadius: 8,
  border: "1px solid #ddd",
  outline: "none",
};
