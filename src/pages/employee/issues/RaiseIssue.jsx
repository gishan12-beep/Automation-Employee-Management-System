import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../../components/layout/AppLayout";
import { createIssue } from "../../../services/issueService";

export default function RaiseIssue() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    category: "Payroll",
    priority: "Medium",
    description: "",
  });

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const onChange = (key) => (e) => {
    setForm((p) => ({ ...p, [key]: e.target.value }));
    setError("");
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const title = form.title.trim();
    const description = form.description.trim();

    if (!title || title.length < 5) {
      setError("Title must be at least 5 characters.");
      return;
    }
    if (!description || description.length < 10) {
      setError("Description must be at least 10 characters.");
      return;
    }

    try {
      setSaving(true);
      await createIssue({
        title,
        category: form.category,
        priority: form.priority,
        description,
      });
      navigate("/employee/issues/status");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ marginTop: 0 }}>Raise an Issue</h2>
          <button
            type="button"
            onClick={() => navigate("/employee/issues/status")}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid #ddd",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            View My Issues
          </button>
        </div>

        <div style={{ background: "#fff", padding: 16, borderRadius: 10 }}>
          {error ? (
            <div
              style={{
                background: "#fff1f2",
                border: "1px solid #fecdd3",
                color: "#9f1239",
                padding: 12,
                borderRadius: 10,
                marginBottom: 12,
              }}
            >
              {error}
            </div>
          ) : null}

          <form onSubmit={onSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ fontSize: 14 }}>Title</label>
                <input
                  value={form.title}
                  onChange={onChange("title")}
                  placeholder="e.g., Salary slip incorrect"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ fontSize: 14 }}>Category</label>
                <select value={form.category} onChange={onChange("category")} style={inputStyle}>
                  <option>Payroll</option>
                  <option>Attendance</option>
                  <option>Profile</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 14 }}>Priority</label>
                <select value={form.priority} onChange={onChange("priority")} style={inputStyle}>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <label style={{ fontSize: 14 }}>Description</label>
              <textarea
                value={form.description}
                onChange={onChange("description")}
                placeholder="Explain the issue clearly..."
                rows={6}
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              style={{
                marginTop: 12,
                width: "100%",
                padding: 12,
                borderRadius: 10,
                border: "none",
                background: "#111",
                color: "#fff",
                cursor: saving ? "not-allowed" : "pointer",
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? "Submitting..." : "Submit Issue"}
            </button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}

const inputStyle = {
  width: "100%",
  marginTop: 6,
  padding: 10,
  borderRadius: 8,
  border: "1px solid #ddd",
  outline: "none",
};
