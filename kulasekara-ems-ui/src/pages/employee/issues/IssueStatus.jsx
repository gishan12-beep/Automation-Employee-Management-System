import React, { useEffect, useMemo, useState } from "react";
import AppLayout from "../../../components/layout/AppLayout";

export default function IssueStatus() {
  const employeeId = localStorage.getItem("employee_id") || "EMP001";
  const [selected, setSelected] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

  // ✅ Responsive watcher (no CSS media queries since inline)
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const issues = useMemo(() => {
    const all = JSON.parse(localStorage.getItem("issues") || "[]");
    return all
      .filter((i) => i.employee_id === employeeId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [employeeId]);

  // ✅ Auto-seed if empty (UI-only)
  useEffect(() => {
    if (issues.length === 0) {
      seedDummy(false); // auto seed silently
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  const seedDummy = (showAlert = true) => {
    const existing = JSON.parse(localStorage.getItem("issues") || "[]");

    const dummy = [
      {
        issue_id: 101,
        employee_id: employeeId,
        type: "PAYROLL",
        description: "My net pay looks lower than expected for this month. Please verify deductions.",
        status: "OPEN",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
      },
      {
        issue_id: 102,
        employee_id: employeeId,
        type: "ATTENDANCE",
        description: "My check-out time was not recorded on one working day. Please update attendance.",
        status: "OPEN",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      },
      {
        issue_id: 103,
        employee_id: employeeId,
        type: "OTHER",
        description: "I need to update my contact number. Please advise the correct process.",
        status: "RESOLVED",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
      },
    ];

    localStorage.setItem("issues", JSON.stringify([...dummy, ...existing]));
    if (showAlert) alert("Dummy issues added (UI only). Refreshing page...");
    window.location.reload();
  };

  const clearMyIssues = () => {
    const all = JSON.parse(localStorage.getItem("issues") || "[]");
    const filtered = all.filter((i) => i.employee_id !== employeeId);
    localStorage.setItem("issues", JSON.stringify(filtered));
    window.location.reload();
  };

  return (
    <AppLayout>
      <div style={{ padding: 20 }}>
        <div style={headerRow}>
          <div>
            <h2 style={{ marginBottom: 5 }}>My Issues</h2>
            <p style={{ color: "#555", margin: 0 }}>
              Track issues you raised and their status.
            </p>
          </div>

          <div style={btnRow}>
            <button style={btnStyle} onClick={() => seedDummy(true)}>
              Seed Dummy Data
            </button>
            <button style={btnStyle} onClick={clearMyIssues}>
              Clear My Issues
            </button>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 20,
            flexDirection: isMobile ? "column" : "row",
          }}
        >
          {/* LEFT – Issue List */}
          <div style={cardStyle}>
            <div style={{ overflowX: "auto" }}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Issue ID</th>
                    <th style={thStyle}>Type</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {issues.length === 0 && (
                    <tr>
                      <td colSpan="4" style={tdStyle}>
                        No issues found.
                      </td>
                    </tr>
                  )}

                  {issues.map((issue) => (
                    <tr
                      key={issue.issue_id}
                      onClick={() => setSelected(issue)}
                      style={{
                        cursor: "pointer",
                        background:
                          selected?.issue_id === issue.issue_id
                            ? "#f1f5f9"
                            : "transparent",
                      }}
                    >
                      <td style={tdStyle}>{issue.issue_id}</td>
                      <td style={tdStyle}>{issue.type}</td>
                      <td style={tdStyle}>
                        <span
                          style={{
                            padding: "3px 10px",
                            borderRadius: 20,
                            fontSize: 12,
                            fontWeight: "bold",
                            border: "1px solid #ddd",
                            background:
                              issue.status === "RESOLVED" ? "#dcfce7" : "#fef9c3",
                          }}
                        >
                          {issue.status}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        {new Date(issue.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT – Issue Details */}
          <div style={cardStyle}>
            {!selected ? (
              <p style={{ color: "#666", margin: 0 }}>
                Select an issue to view details.
              </p>
            ) : (
              <>
                <h3 style={{ marginTop: 0, marginBottom: 10 }}>
                  Issue #{selected.issue_id}
                </h3>

                <p style={pLine}>
                  <b>Employee ID:</b> {selected.employee_id}
                </p>
                <p style={pLine}>
                  <b>Type:</b> {selected.type}
                </p>
                <p style={pLine}>
                  <b>Status:</b> {selected.status}
                </p>
                <p style={pLine}>
                  <b>Created At:</b>{" "}
                  {new Date(selected.created_at).toLocaleString()}
                </p>

                <hr style={{ margin: "10px 0" }} />

                <p style={{ margin: "0 0 6px" }}>
                  <b>Description:</b>
                </p>
                <p style={{ color: "#444", margin: 0, lineHeight: 1.6 }}>
                  {selected.description}
                </p>
              </>
            )}
          </div>
        </div>

        <p style={{ marginTop: 12, fontSize: 12, color: "#777" }}>
          UI-only page. Data is stored in localStorage under <b>issues</b>.
        </p>
      </div>
    </AppLayout>
  );
}

/* ===== Styles (keeps same look as other pages) ===== */

const headerRow = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "flex-start",
  marginBottom: 15,
  flexWrap: "wrap",
};

const btnRow = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
  justifyContent: "flex-end",
};

const btnStyle = {
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid #ccc",
  background: "#fff",
  cursor: "pointer",
  fontWeight: "bold",
};

const cardStyle = {
  background: "#fff",
  border: "1px solid #ddd",
  borderRadius: 8,
  padding: 15,
  flex: 1,
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: 520, // helps horizontal scroll on mobile
};

const thStyle = {
  textAlign: "left",
  borderBottom: "1px solid #ddd",
  padding: 8,
  fontWeight: "bold",
  fontSize: 13,
};

const tdStyle = {
  padding: 8,
  borderBottom: "1px solid #eee",
  fontSize: 13,
};

const pLine = { margin: "0 0 6px" };
