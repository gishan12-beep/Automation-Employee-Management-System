import React, { useMemo, useState } from "react";
import AppLayout from "../../../components/layout/AppLayout";

// --- Helpers ---
const toNum = (v) => (v === "" || v === null || v === undefined ? "" : Number(v));
const fmt = (n) => (n === "" ? "" : String(n));
const nowStamp = () => new Date().toLocaleString();
const makeId = (prefix = "ID") => `${prefix}-${Math.random().toString(16).slice(2, 8)}-${Date.now().toString().slice(-5)}`;

export default function ManagerSettings() {
  // --- States ---
  const [isEditingPayroll, setIsEditingPayroll] = useState(false);
  const [isEditingAttendance, setIsEditingAttendance] = useState(false);
  const [isEditingAdvances, setIsEditingAdvances] = useState(false); // NEW Section State

  const [rates, setRates] = useState({
    // Payroll
    epfEmployeeRate: 8,
    epfEmployerRate: 12,
    etfEmployerRate: 3,
    otFixedRate: 250,
    // Attendance
    lateThresholdMin: 15,
    // Advances (NEW)
    maxAdvancePercent: 75, // e.g. Max 75% of earnings
    minDaysForAdvance: 5,  // Must work 5 days to get advance

    lastUpdatedAt: nowStamp(),
    lastUpdatedBy: "Manager",
  });

  // Task Rates State
  const [taskRates, setTaskRates] = useState([
    { id: makeId("TSK"), taskName: "Coconut Peeling", unit: "COCONUT", ratePerUnit: 2.5, active: true, updatedAt: nowStamp() },
    { id: makeId("TSK"), taskName: "Packing", unit: "COCONUT", ratePerUnit: 1.25, active: true, updatedAt: nowStamp() },
  ]);

  // Modal & Toast States
  const [toast, setToast] = useState(null);

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskEditing, setTaskEditing] = useState(null);
  const [taskForm, setTaskForm] = useState({ taskName: "", unit: "COCONUT", ratePerUnit: "" });

  // --- Actions ---
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const saveSettings = (section) => {
    setRates((p) => ({ ...p, lastUpdatedAt: nowStamp() }));
    if (section === "payroll") setIsEditingPayroll(false);
    if (section === "attendance") setIsEditingAttendance(false);
    if (section === "advances") setIsEditingAdvances(false);
    showToast(`${section.charAt(0).toUpperCase() + section.slice(1)} settings saved.`);
  };

  // Task Logic
  const openAddTask = () => { setTaskEditing(null); setTaskForm({ taskName: "", unit: "COCONUT", ratePerUnit: "" }); setTaskModalOpen(true); };
  const openEditTask = (t) => { setTaskEditing(t); setTaskForm({ taskName: t.taskName, unit: t.unit, ratePerUnit: t.ratePerUnit }); setTaskModalOpen(true); };

  const handleSaveTask = () => {
    if (!taskForm.taskName) return;
    const rec = { ...taskForm, updatedAt: nowStamp() };
    if (taskEditing) {
      setTaskRates(prev => prev.map(item => item.id === taskEditing.id ? { ...item, ...rec } : item));
    } else {
      setTaskRates(prev => [{ id: makeId("TSK"), active: true, ...rec }, ...prev]);
    }
    setTaskModalOpen(false);
    showToast("Task rate saved.");
  };

  // --- Styles ---
  const styles = useMemo(() => ({
    page: { position: "relative", minHeight: "100%", overflow: "hidden" },
    container: { padding: 32, position: "relative", zIndex: 1 },
    header: { marginBottom: 32, maxWidth: 1200, margin: "0 auto 32px auto" },
    title: { fontSize: 28, fontWeight: 900, color: "#2c5530", margin: 0 },
    subtitle: { color: "#4b5563", marginTop: 6, fontSize: 15 },

    // The "Mixed" Layout Grid
    dashboardGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
      gap: "24px",
      maxWidth: 1200,
      margin: "0 auto"
    },

    card: {
      background: "rgba(255, 255, 255, 0.9)",
      backdropFilter: "blur(12px)",
      borderRadius: 18,
      padding: 24,
      boxShadow: "0 8px 25px rgba(0,0,0,0.03)",
      border: "1px solid rgba(255, 255, 255, 0.5)",
      display: "flex",
      flexDirection: "column"
    },
    cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid rgba(0,0,0,0.05)" },
    h3: { margin: 0, fontSize: 16, fontWeight: 700, color: "#1f2937", textTransform: "uppercase", letterSpacing: "0.025em" },

    // Inputs & ReadOnly
    readOnlyBox: { background: "#f9fafb", padding: "10px 14px", borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 14, color: "#374151", fontWeight: "600", minHeight: "42px", display: "flex", alignItems: "center" },
    input: { width: "100%", padding: "10px 14px", borderRadius: 10, border: "2px solid #a7f3d0", outline: "none", fontSize: 14, background: "#fff", boxSizing: "border-box", fontWeight: "500", transition: "border 0.2s" },
    label: { fontSize: 12, fontWeight: 700, color: "#6b7280", marginBottom: 6, display: "block", textTransform: "uppercase" },

    // Buttons
    btnPrimary: {
      padding: "8px 18px",
      borderRadius: 10,
      background: "linear-gradient(135deg, #4a7c4e 0%, #5a8c5e 100%)",
      color: "#fff",
      border: "none",
      cursor: "pointer",
      fontWeight: 600,
      fontSize: 13,
      transition: "0.2s",
      boxShadow: "0 4px 12px rgba(74, 124, 78, 0.2)"
    },
    btnOutline: { padding: "8px 16px", borderRadius: 10, background: "transparent", color: "#374151", border: "1px solid #d1d5db", cursor: "pointer", fontWeight: 600, fontSize: 13 },
    btnLink: { background: "none", border: "none", color: "#4a7c4e", fontWeight: 700, cursor: "pointer", fontSize: 13 },

    // Internal Grids
    grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },

    // Modal
    modalOverlay: { position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100, backdropFilter: "blur(4px)" },
    modal: { background: "#fff", padding: 28, borderRadius: 20, width: "100%", maxWidth: 400, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" },
    toast: { position: "fixed", bottom: 24, right: 24, background: "#1f2937", color: "#fff", padding: "12px 24px", borderRadius: 12, fontWeight: 600, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }
  }), []);

  return (
    <AppLayout>
      <div style={styles.page}>
        {/* Animation Styles Inline */}
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) translateX(0px); }
            50% { transform: translateY(-20px) translateX(10px); }
          }
          @keyframes floatReverse {
            0%, 100% { transform: translateY(0px) translateX(0px); }
            50% { transform: translateY(20px) translateX(-10px); }
          }
          .floating-circle { position: absolute; border-radius: 50%; pointer-events: none; z-index: 0; }
          .fc-1 { animation: float 20s ease-in-out infinite; background: radial-gradient(circle, rgba(76, 175, 80, 0.08) 0%, transparent 70%); width: 400px; height: 400px; top: -100px; left: -100px; }
          .fc-2 { animation: floatReverse 25s ease-in-out infinite; background: radial-gradient(circle, rgba(56, 142, 60, 0.06) 0%, transparent 70%); width: 350px; height: 350px; bottom: -80px; right: -80px; }
          .fc-3 { animation: float 18s ease-in-out infinite; background: radial-gradient(circle, rgba(67, 160, 71, 0.05) 0%, transparent 70%); width: 250px; height: 250px; top: 20%; right: 10%; }
        `}</style>

        <div className="floating-circle fc-1"></div>
        <div className="floating-circle fc-2"></div>
        <div className="floating-circle fc-3"></div>

        <div style={styles.container}>
          <header style={styles.header}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div>
                <h2 style={styles.title}>Manager Settings</h2>
                <p style={styles.subtitle}>System configurations for Payroll, Attendance, and Production.</p>
              </div>
              <div style={{ fontSize: 12, color: "#6b7280", textAlign: "right", fontWeight: 600 }}>
                Last updated: {rates.lastUpdatedAt}
              </div>
            </div>
          </header>

          <div style={styles.dashboardGrid}>

            {/* --- CARD 1: PAYROLL (Top Left) --- */}
            <section style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.h3}>Payroll & Fixed OT</h3>
                {!isEditingPayroll ?
                  <button style={styles.btnOutline} onClick={() => setIsEditingPayroll(true)}>Edit</button> :
                  <button style={styles.btnPrimary} onClick={() => saveSettings("payroll")}>Save</button>
                }
              </div>

              <div style={styles.grid2}>
                <div>
                  <label style={styles.label}>EPF Employee</label>
                  {isEditingPayroll ?
                    <input type="number" style={styles.input} value={fmt(rates.epfEmployeeRate)} onChange={e => setRates({ ...rates, epfEmployeeRate: toNum(e.target.value) })} /> :
                    <div style={styles.readOnlyBox}>{rates.epfEmployeeRate}%</div>
                  }
                </div>
                <div>
                  <label style={styles.label}>EPF Employer</label>
                  {isEditingPayroll ?
                    <input type="number" style={styles.input} value={fmt(rates.epfEmployerRate)} onChange={e => setRates({ ...rates, epfEmployerRate: toNum(e.target.value) })} /> :
                    <div style={styles.readOnlyBox}>{rates.epfEmployerRate}%</div>
                  }
                </div>
                <div>
                  <label style={styles.label}>ETF Employer</label>
                  {isEditingPayroll ?
                    <input type="number" style={styles.input} value={fmt(rates.etfEmployerRate)} onChange={e => setRates({ ...rates, etfEmployerRate: toNum(e.target.value) })} /> :
                    <div style={styles.readOnlyBox}>{rates.etfEmployerRate}%</div>
                  }
                </div>
                <div>
                  <label style={styles.label}>Fixed OT Rate</label>
                  {isEditingPayroll ?
                    <input type="number" style={styles.input} value={fmt(rates.otFixedRate)} onChange={e => setRates({ ...rates, otFixedRate: toNum(e.target.value) })} /> :
                    <div style={{ ...styles.readOnlyBox, background: "#eff6ff", color: "#2563eb", borderColor: "#bfdbfe" }}>LKR {rates.otFixedRate}</div>
                  }
                </div>
              </div>
            </section>

            {/* --- CARD 2: ATTENDANCE (Top Right) --- */}
            <section style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.h3}>Attendance Rules</h3>
                {!isEditingAttendance ?
                  <button style={styles.btnOutline} onClick={() => setIsEditingAttendance(true)}>Edit</button> :
                  <button style={styles.btnPrimary} onClick={() => saveSettings("attendance")}>Save</button>
                }
              </div>

              <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <label style={styles.label}>Late Threshold (Minutes)</label>
                {isEditingAttendance ?
                  <input type="number" style={styles.input} value={fmt(rates.lateThresholdMin)} onChange={e => setRates({ ...rates, lateThresholdMin: toNum(e.target.value) })} /> :
                  <div style={styles.readOnlyBox}>{rates.lateThresholdMin} Minutes</div>
                }
                <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5, marginTop: 12 }}>
                  Staff arriving more than <b>{rates.lateThresholdMin} mins</b> after shift start are flagged as <span style={{ color: "#ef4444", fontWeight: 700 }}>Late</span>.
                </p>
              </div>
            </section>

            {/* --- CARD 3: SALARY ADVANCE RULES (Bottom Left - REPLACES ALLOWANCES) --- */}
            <section style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.h3}>Salary Advance Rules</h3>
                {!isEditingAdvances ?
                  <button style={styles.btnOutline} onClick={() => setIsEditingAdvances(true)}>Edit</button> :
                  <button style={styles.btnPrimary} onClick={() => saveSettings("advances")}>Save</button>
                }
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={styles.label}>Max Advance (% of Total Earnings)</label>
                  {isEditingAdvances ?
                    <div style={{ position: "relative" }}>
                      <input type="number" style={{ ...styles.input, paddingRight: 30 }} value={fmt(rates.maxAdvancePercent)} onChange={e => setRates({ ...rates, maxAdvancePercent: toNum(e.target.value) })} />
                      <span style={{ position: "absolute", right: 12, top: 10, color: "#94a3b8", fontWeight: 600 }}>%</span>
                    </div> :
                    <div style={styles.readOnlyBox}>{rates.maxAdvancePercent}%</div>
                  }
                </div>

                <div>
                  <label style={styles.label}>Min. Worked Days Required</label>
                  {isEditingAdvances ?
                    <input type="number" style={styles.input} value={fmt(rates.minDaysForAdvance)} onChange={e => setRates({ ...rates, minDaysForAdvance: toNum(e.target.value) })} /> :
                    <div style={styles.readOnlyBox}>{rates.minDaysForAdvance} Days</div>
                  }
                  <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 8 }}>
                    Employee must work at least <b>{rates.minDaysForAdvance} days</b> in the current month to request a cash advance.
                  </p>
                </div>
              </div>
            </section>

            {/* --- CARD 4: TASKS (Bottom Right) --- */}
            <section style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.h3}>Production Tasks</h3>
                <button style={styles.btnPrimary} onClick={openAddTask}>+ Add</button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {taskRates.map(t => (
                  <div key={t.id} style={{ ...styles.readOnlyBox, justifyContent: "space-between", background: "#fff" }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{t.taskName}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>/{t.unit.toLowerCase()}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontWeight: 700, color: "#059669" }}>LKR {t.ratePerUnit}</span>
                      <button style={styles.btnLink} onClick={() => openEditTask(t)}>Edit</button>
                    </div>
                  </div>
                ))}
                {taskRates.length === 0 && <div style={{ fontSize: 13, color: "#94a3b8", textAlign: "center", padding: 10 }}>No tasks configured.</div>}
              </div>
            </section>
          </div>

          {/* --- MODALS (Task Only) --- */}
          {taskModalOpen && (
            <div style={styles.modalOverlay} onMouseDown={() => setTaskModalOpen(false)}>
              <div style={styles.modal} onMouseDown={e => e.stopPropagation()}>
                <h4 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 800 }}>
                  {taskEditing ? "Edit Task Rate" : "Add Task Rate"}
                </h4>

                <label style={styles.label}>Task Name</label>
                <input style={{ ...styles.input, marginBottom: 16 }} value={taskForm.taskName} onChange={e => setTaskForm({ ...taskForm, taskName: e.target.value })} placeholder="e.g. Peeling" />

                <label style={styles.label}>Unit</label>
                <select style={{ ...styles.input, marginBottom: 16 }} value={taskForm.unit} onChange={e => setTaskForm({ ...taskForm, unit: e.target.value })}>
                  <option value="COCONUT">COCONUT</option>
                  <option value="KG">KG</option>
                  <option value="UNIT">UNIT</option>
                </select>

                <label style={styles.label}>Rate per Unit (LKR)</label>
                <input type="number" style={styles.input} value={fmt(taskForm.ratePerUnit)} onChange={e => setTaskForm({ ...taskForm, ratePerUnit: toNum(e.target.value) })} placeholder="0.00" />

                <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end", gap: 12 }}>
                  <button style={styles.btnOutline} onClick={() => setTaskModalOpen(false)}>Cancel</button>
                  <button style={styles.btnPrimary} onClick={handleSaveTask}>Save Changes</button>
                </div>
              </div>
            </div>
          )}

          {toast && <div style={styles.toast}>{toast}</div>}
        </div>
      </div>
    </AppLayout>
  );
}