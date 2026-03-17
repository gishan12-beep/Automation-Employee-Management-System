// src/pages/manager/attendance/WorkDetailsForm.jsx
import React, { useEffect, useMemo, useState } from "react";
import { getTasksApi, createWorkLogApi } from "../../../services/workLogService";

/**
 * DB MATCH:
 *  - task_rates(task_id, task_name, rate_per_unit, unit_measure, description)
 *  - work_logs(log_id AUTO, employee_id, task_id, date, quantity, applied_rate, total_amount GENERATED)
 *
 * Props:
 *  - employeeID, employeeName, defaultDate
 *  - onClose(), onSave(payload)
 *  - tasks (optional): [{ task_id, task_name, rate_per_unit, unit_measure, description }]
 */
export default function WorkDetailsForm({
  employeeID,
  employeeName,
  defaultDate,
  onClose,
  onSave,
}) {
  const [tasks, setTasks] = useState([]);
  const todayISO = new Date().toISOString().slice(0, 10);

  const [date, setDate] = useState(defaultDate || todayISO);
  const [taskId, setTaskId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [appliedRate, setAppliedRate] = useState(""); // snapshot of rate at that time
  const [saving, setSaving] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(true);

  // Fetch tasks on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await getTasksApi();
        setTasks(res.tasks || []);
        if (res.tasks?.length > 0) {
          setTaskId(String(res.tasks[0].task_id));
        }
      } catch (err) {
        console.error("Failed to load tasks", err);
      } finally {
        setLoadingTasks(false);
      }
    })();
  }, []);

  // find selected task
  const selectedTask = useMemo(() => {
    const idNum = Number(taskId);
    return tasks.find((t) => Number(t.task_id) === idNum) || null;
  }, [taskId, tasks]);

  // auto-fill applied_rate from selected task (still editable)
  useEffect(() => {
    if (selectedTask) setAppliedRate(String(Number(selectedTask.rate_per_unit ?? 0)));
  }, [selectedTask]);

  const totalPreview = useMemo(() => {
    const q = Number(quantity);
    const r = Number(appliedRate);
    if (Number.isNaN(q) || Number.isNaN(r)) return 0;
    return q * r;
  }, [quantity, appliedRate]);

  const validate = () => {
    if (!employeeID) return "employee_id is required.";
    if (!date) return "date is required.";
    if (!taskId) return "task_id is required.";

    const q = Number(quantity);
    if (quantity === "" || Number.isNaN(q)) return "quantity is required (number).";
    if (!Number.isInteger(q)) return "quantity must be an integer.";
    if (q <= 0) return "quantity must be > 0.";

    const r = Number(appliedRate);
    if (appliedRate === "" || Number.isNaN(r)) return "applied_rate is required (number).";
    if (r < 0) return "applied_rate must be >= 0.";

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) return alert(err);

    const payload = {
      // ✅ matches work_logs columns (log_id is AUTO in DB)
      employee_id: employeeID,
      task_id: Number(taskId),
      date,
      quantity: Number(quantity),
      applied_rate: Number(appliedRate),
      // total_amount is GENERATED in DB, but keeping preview is fine for UI
      total_amount_preview: Number((Number(quantity) * Number(appliedRate)).toFixed(2)),
      // for UI rendering if needed:
      task_name: selectedTask?.task_name,
      unit_measure: selectedTask?.unit_measure,
    };

    try {
      setSaving(true);
      const res = await createWorkLogApi({
        employee_id: payload.employee_id,
        task_id: payload.task_id,
        date: payload.date,
        quantity: payload.quantity,
        applied_rate: payload.applied_rate
      });

      onSave?.({
        ...payload,
        log_id: res.log_id
      });
      onClose?.();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save work log");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={f.wrap}>
      <div style={f.header}>
        <div>
          <div style={f.title}>Add Work Log</div>
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
          <label style={f.label}>task</label>
          <select value={taskId} onChange={(e) => setTaskId(e.target.value)} style={f.input}>
            {tasks.map((t) => (
              <option key={t.task_id} value={String(t.task_id)}>
                {t.task_name}
              </option>
            ))}
          </select>

          {selectedTask ? (
            <div style={f.hint}>
              Unit: <b>{selectedTask.unit_measure || "Unit"}</b> • Default Rate:{" "}
              <b>Rs {Number(selectedTask.rate_per_unit || 0).toFixed(2)}</b>
              {selectedTask.description ? <span> • {selectedTask.description}</span> : null}
            </div>
          ) : null}
        </div>

        <div style={f.grid2}>
          <div style={f.field}>
            <label style={f.label}>quantity</label>
            <input
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              style={f.input}
              placeholder="e.g., 120"
            />
            <div style={f.hint}>
              Enter count in <b>{selectedTask?.unit_measure || "Unit"}</b>
            </div>
          </div>

          <div style={f.field}>
            <label style={f.label}>applied_rate (rs per unit)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={appliedRate}
              onChange={(e) => setAppliedRate(e.target.value)}
              style={f.input}
              placeholder="e.g., 4.50"
            />
            <div style={f.hint}>This is the snapshot rate stored in <b>work_logs.applied_rate</b>.</div>
          </div>
        </div>

        <div style={f.totalRow}>
          <div style={f.totalBox}>
            <div style={f.totalLabel}>Total Amount (preview)</div>
            <div style={f.totalValue}>Rs {Number(totalPreview || 0).toFixed(2)}</div>
            <div style={f.hintSmall}>
              DB will auto-calculate <b>total_amount</b> as <code>quantity * applied_rate</code>.
            </div>
          </div>
        </div>

        <div style={f.actions}>
          <button type="button" onClick={onClose} style={f.lightBtn}>
            Cancel
          </button>
          <button type="submit" disabled={saving} style={saving ? { ...f.darkBtn, opacity: 0.75 } : f.darkBtn}>
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
    borderRadius: 20,
    border: "1px solid rgba(74, 124, 78, 0.15)",
    boxShadow: "0 12px 32px rgba(74, 124, 78, 0.15)",
    padding: 24,
  },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  title: { fontSize: 20, fontWeight: 900, color: "#2c5530" },
  subtitle: { marginTop: 4, fontSize: 13, color: "#6b7280", fontWeight: 600 },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    border: "1px solid rgba(74, 124, 78, 0.15)",
    background: "rgba(74, 124, 78, 0.05)",
    cursor: "pointer",
    fontWeight: 900,
    color: "#2c5530",
    fontSize: 16,
  },
  form: { display: "flex", flexDirection: "column", gap: 12 },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 11, fontWeight: 800, color: "#4a7c4e", textTransform: "uppercase", letterSpacing: 0.6 },
  input: {
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid rgba(74, 124, 78, 0.2)",
    outline: "none",
    fontSize: 14,
    background: "#fff",
    color: "#1f2937",
    fontWeight: 600,
  },
  hint: { fontSize: 12, color: "#64748b", fontWeight: 600, marginTop: 4 },
  hintSmall: { fontSize: 11.5, color: "#64748b", fontWeight: 600, marginTop: 6 },
  totalRow: { display: "flex", justifyContent: "flex-end" },
  totalBox: {
    width: "100%",
    border: "1px solid rgba(74, 124, 78, 0.15)",
    borderRadius: 16,
    padding: 16,
    background: "rgba(74, 124, 78, 0.04)",
  },
  totalLabel: { fontSize: 11, fontWeight: 800, color: "#4a7c4e", textTransform: "uppercase", letterSpacing: 0.6 },
  totalValue: { marginTop: 6, fontSize: 24, fontWeight: 900, color: "#2c5530" },
  actions: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 6 },
  lightBtn: {
    background: "#fff",
    color: "#2c5530",
    border: "1px solid rgba(74, 124, 78, 0.2)",
    padding: "12px 18px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 700,
  },
  darkBtn: {
    background: "linear-gradient(135deg, #4a7c4e 0%, #5a8c5e 100%)",
    color: "#fff",
    border: "none",
    padding: "12px 20px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 700,
    boxShadow: "0 4px 12px rgba(74, 124, 78, 0.25)",
  },
};
