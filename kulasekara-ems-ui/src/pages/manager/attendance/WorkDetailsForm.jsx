// src/pages/manager/attendance/WorkDetailsForm.jsx
import React, { useMemo, useState } from "react";

export default function WorkDetailsForm({
  employeeID,
  employeeName,
  defaultDate,
  onClose,
  onSave,
}) {
  const todayISO = new Date().toISOString().slice(0, 10);

  const [date, setDate] = useState(defaultDate || todayISO);
  const [taskDescription, setTaskDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [hoursWorked, setHoursWorked] = useState("");
  const [saving, setSaving] = useState(false);

  const workDetailID = useMemo(() => {
    const compact = (date || "").replaceAll("-", "");
    return `WD${compact}-${employeeID || "EMP"}-${String(Math.floor(Math.random() * 900) + 100)}`;
  }, [date, employeeID]);

  const validate = () => {
    if (!employeeID) return "employeeID is required.";
    if (!date) return "date is required.";
    if (!taskDescription.trim()) return "taskDescription is required.";

    const q = Number(quantity);
    const h = Number(hoursWorked);

    if (quantity === "" || Number.isNaN(q)) return "quantity is required (number).";
    if (q < 0) return "quantity must be >= 0.";

    if (hoursWorked === "" || Number.isNaN(h)) return "hoursWorked is required (number).";
    if (h < 0) return "hoursWorked must be >= 0.";

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) return alert(err);

    const payload = {
      workDetailID,
      employeeID,
      date,
      taskDescription: taskDescription.trim(),
      quantity: Number(quantity),
      hoursWorked: Number(hoursWorked),
    };

    try {
      setSaving(true);

      // TODO: replace with API call later
      // await createWorkDetailApi(payload);

      onSave?.(payload); // ✅ update dashboard instantly
      onClose?.();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={f.wrap}>
      <div style={f.header}>
        <div>
          <div style={f.title}>Add Work Detail</div>
          <div style={f.subtitle}>
            {employeeName || "Day Worker"} • {employeeID}
          </div>
        </div>
        <button onClick={onClose} style={f.closeBtn} aria-label="Close">
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} style={f.form}>
        <div style={f.field}>
          <label style={f.label}>date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={f.input} />
        </div>

        <div style={f.field}>
          <label style={f.label}>taskDescription</label>
          <input
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
            style={f.input}
            placeholder="e.g., Peeled coconuts"
          />
        </div>

        <div style={f.grid2}>
          <div style={f.field}>
            <label style={f.label}>quantity</label>
            <input
              type="number"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              style={f.input}
              placeholder="0"
            />
          </div>

          <div style={f.field}>
            <label style={f.label}>hoursWorked</label>
            <input
              type="number"
              min="0"
              step="0.25"
              value={hoursWorked}
              onChange={(e) => setHoursWorked(e.target.value)}
              style={f.input}
              placeholder="0"
            />
          </div>
        </div>

        <div style={f.actions}>
          <button type="button" onClick={onClose} style={f.lightBtn}>
            Cancel
          </button>
          <button type="submit" disabled={saving} style={f.darkBtn}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}

const f = {
  wrap: {
    width: 560,
    maxWidth: "92vw",
    background: "#fff",
    borderRadius: 16,
    border: "1px solid #e6edf6",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.10)",
    padding: 18,
  },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  title: { fontSize: 18, fontWeight: 900, color: "#0b1220" },
  subtitle: { marginTop: 4, fontSize: 13, color: "#64748b", fontWeight: 600 },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    border: "1px solid #e6edf6",
    background: "#fff",
    cursor: "pointer",
    fontWeight: 900,
  },
  form: { display: "flex", flexDirection: "column", gap: 12 },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 12, fontWeight: 900, color: "#475569", textTransform: "uppercase", letterSpacing: 0.7 },
  input: { padding: "12px 12px", borderRadius: 12, border: "1px solid #e6edf6", outline: "none", fontSize: 14 },
  actions: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 6 },
  lightBtn: { background: "#fff", color: "#0b1220", border: "1px solid #e6edf6", padding: "12px 16px", borderRadius: 12, cursor: "pointer", fontWeight: 900 },
  darkBtn: { background: "#0b1220", color: "#fff", border: "1px solid #0b1220", padding: "12px 16px", borderRadius: 12, cursor: "pointer", fontWeight: 900 },
};
