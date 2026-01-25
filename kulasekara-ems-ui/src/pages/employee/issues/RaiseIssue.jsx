import React, { useEffect, useState } from "react";
import AppLayout from "../../../components/layout/AppLayout";

const makeId = () => Math.floor(100 + Math.random() * 90000);

export default function RaiseIssue() {
  const employeeId = localStorage.getItem("employee_id") || "EMP001";
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const [form, setForm] = useState({
    issue_id: makeId(),
    employee_id: employeeId,
    type: "PAYROLL",
    description: "",
    status: "OPEN",
    created_at: new Date().toISOString(),
  });

  const [msg, setMsg] = useState({ text: "", type: "" });

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const submit = (e) => {
    e.preventDefault();

    if (!form.description.trim()) {
      setMsg({ text: "Description is required.", type: "error" });
      return;
    }

    const existing = JSON.parse(localStorage.getItem("issues") || "[]");

    // ✅ schema-only payload
    const payload = {
      issue_id: form.issue_id,
      employee_id: employeeId,
      type: form.type,
      description: form.description.trim(),
      status: "OPEN",
      created_at: new Date().toISOString(),
    };

    localStorage.setItem("issues", JSON.stringify([payload, ...existing]));

    setMsg({ text: "Issue submitted successfully (UI only).", type: "success" });

    // reset
    setForm({
      issue_id: makeId(),
      employee_id: employeeId,
      type: "PAYROLL",
      description: "",
      status: "OPEN",
      created_at: new Date().toISOString(),
    });
  };

  const seedDummy = () => {
    const existing = JSON.parse(localStorage.getItem("issues") || "[]");

    const dummy = [
      {
        issue_id: 201,
        employee_id: employeeId,
        type: "PAYROLL",
        description: "Please check my salary calculation for this month. It seems lower than expected.",
        status: "OPEN",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      },
      {
        issue_id: 202,
        employee_id: employeeId,
        type: "ATTENDANCE",
        description: "My check-out time is missing for one day. Please verify and update attendance.",
        status: "OPEN",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
      },
      {
        issue_id: 203,
        employee_id: employeeId,
        type: "OTHER",
        description: "Need clarification about how overtime is calculated in the system.",
        status: "RESOLVED",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
      },
    ];

    localStorage.setItem("issues", JSON.stringify([...dummy, ...existing]));
    setMsg({ text: "Dummy issues added (UI only).", type: "info" });
  };

  const clearMyIssues = () => {
    const all = JSON.parse(localStorage.getItem("issues") || "[]");
    const filtered = all.filter((i) => i.employee_id !== employeeId);
    localStorage.setItem("issues", JSON.stringify(filtered));
    setMsg({ text: "Your issues cleared (UI only).", type: "info" });
  };

  return (
    <AppLayout>
      <div style={{ padding: 20, maxWidth: 900, margin: "0 auto" }}>
        <div style={headerRow}>
          <div>
            <h2 style={{ marginBottom: 5 }}>Raise Issue</h2>
            <p style={{ color: "#555", margin: 0 }}>
              Submit payroll or attendance related issues.
            </p>
          </div>

          <div style={btnRow}>
            <button style={btnStyle} onClick={seedDummy} type="button">
              Seed Dummy Data
            </button>
            <button style={btnStyle} onClick={clearMyIssues} type="button">
              Clear My Issues
            </button>
          </div>
        </div>

        <div style={cardStyle}>
          <form onSubmit={submit}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                gap: 12,
              }}
            >
              <div>
                <label style={labelStyle}>Employee ID</label>
                <input value={employeeId} disabled style={{ ...inputStyle, background: "#f8fafc" }} />
              </div>

              <div>
                <label style={labelStyle}>Issue Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setField("type", e.target.value)}
                  style={inputStyle}
                >
                  <option value="PAYROLL">PAYROLL</option>
                  <option value="ATTENDANCE">ATTENDANCE</option>
                  <option value="OTHER">OTHER</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <label style={labelStyle}>Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                placeholder="Describe your issue clearly..."
                style={{ ...inputStyle, height: 130, resize: "vertical", lineHeight: 1.6 }}
              />
              <div style={{ fontSize: 12, color: "#777", marginTop: 6 }}>
                Note: This is UI-only. When backend is connected, it will insert into the <b>issues</b> table.
              </div>
            </div>

            <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button type="submit" style={btnPrimary}>
                Submit Issue
              </button>
              <button
                type="button"
                style={btnStyle}
                onClick={() => {
                  setForm((p) => ({ ...p, description: "" }));
                  setMsg({ text: "", type: "" });
                }}
              >
                Reset
              </button>
            </div>

            {msg.text && (
              <div
                style={{
                  marginTop: 12,
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid #ddd",
                  background:
                    msg.type === "success"
                      ? "#dcfce7"
                      : msg.type === "error"
                      ? "#fee2e2"
                      : "#f1f5f9",
                  color:
                    msg.type === "success"
                      ? "#166534"
                      : msg.type === "error"
                      ? "#991b1b"
                      : "#0f172a",
                  fontWeight: "bold",
                }}
              >
                {msg.text}
              </div>
            )}
          </form>
        </div>
      </div>
    </AppLayout>
  );
}

/* ===== Styles (matching your other employee pages) ===== */

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

const cardStyle = {
  background: "#fff",
  border: "1px solid #ddd",
  borderRadius: 8,
  padding: 15,
};

const labelStyle = {
  display: "block",
  marginBottom: 6,
  fontWeight: "bold",
  fontSize: 13,
};

const inputStyle = {
  width: "100%",
  padding: 10,
  borderRadius: 8,
  border: "1px solid #ccc",
  outline: "none",
  fontSize: 14,
};

const btnStyle = {
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid #ccc",
  background: "#fff",
  cursor: "pointer",
  fontWeight: "bold",
};

const btnPrimary = {
  padding: "10px 14px",
  borderRadius: 8,
  border: "1px solid #0f172a",
  background: "#0f172a",
  color: "#fff",
  cursor: "pointer",
  fontWeight: "bold",
};
