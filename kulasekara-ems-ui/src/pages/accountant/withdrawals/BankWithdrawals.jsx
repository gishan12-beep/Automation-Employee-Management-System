import React, { useEffect, useMemo, useState } from "react";
import AppLayout from "../../../components/layout/AppLayout";
import {
  listWithdrawalsApi,
  createWithdrawalApi,
  updateWithdrawalApi,
  deleteWithdrawalApi,
} from "../../../services/accountantWithdrawalService";

const monthName = (m) =>
  new Date(2000, m - 1, 1).toLocaleString("en", { month: "long" });

const toISODate = (d) => {
  const dt = d ? new Date(d) : new Date();
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const formatLKR = (n) => {
  const num = Number(n || 0);
  return `LKR ${num.toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export default function BankWithdrawals() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("create"); // create | edit
  const [editingId, setEditingId] = useState(null);

  const [date, setDate] = useState(toISODate(new Date()));
  const [bankRef, setBankRef] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const totalForMonth = useMemo(() => {
    return rows.reduce((sum, r) => sum + Number(r.amount || 0), 0);
  }, [rows]);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listWithdrawalsApi({ month, year });

      const items = Array.isArray(data) ? data : data?.items || [];
      setRows(items);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Failed to load withdrawals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year]);

  const resetForm = () => {
    setDate(toISODate(new Date()));
    setBankRef("");
    setAmount("");
    setNotes("");
    setMode("create");
    setEditingId(null);
    setError("");
  };

  const openCreate = () => {
    resetForm();
    setOpen(true);
  };

  const openEdit = (r) => {
    setMode("edit");
    setEditingId(r.id);
    setDate(r.date ? String(r.date).slice(0, 10) : toISODate(new Date()));
    setBankRef(r.bank_ref || "");
    setAmount(String(r.amount ?? ""));
    setNotes(r.notes || "");
    setError("");
    setOpen(true);
  };

  const validate = () => {
    if (!date) return "Date is required.";
    if (!bankRef.trim()) return "Bank Reference is required.";
    const a = Number(amount);
    if (!amount || Number.isNaN(a) || a <= 0) return "Amount must be a valid number greater than 0.";
    if (bankRef.trim().length < 3) return "Bank Reference looks too short.";
    return "";
  };

  const onSave = async () => {
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }

    setSaving(true);
    setError("");
    try {
      const payload = {
        date,
        bank_ref: bankRef.trim(),
        amount: Number(amount),
        notes: notes.trim() ? notes.trim() : null,
      };

      if (mode === "create") {
        await createWithdrawalApi(payload);
      } else {
        await updateWithdrawalApi(editingId, payload);
      }

      setOpen(false);
      resetForm();
      await fetchData();
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (r) => {
    const ok = window.confirm(`Delete ${r.bank_ref} (${formatLKR(r.amount)})?`);
    if (!ok) return;

    setError("");
    try {
      await deleteWithdrawalApi(r.id);
      await fetchData();
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Delete failed.");
    }
  };

  const styles = {
    page: { padding: 0 },
    headerRow: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 16,
      marginBottom: 24,
      flexWrap: "wrap",
    },
    title: { fontSize: 28, fontWeight: 900, color: "#2c5530", margin: 0 },
    sub: { margin: "6px 0 0", color: "#4b5563", fontSize: 15 },

    controls: { display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" },
    select: {
      padding: "10px 14px",
      border: "1px solid #e5e7eb",
      borderRadius: 12,
      background: "#fff",
      fontWeight: 700,
      fontSize: 14,
      outline: "none",
    },
    btn: {
      padding: "10px 20px",
      borderRadius: 12,
      border: "none",
      background: "linear-gradient(135deg, #4a7c4e 0%, #5a8c5e 100%)",
      color: "#fff",
      fontWeight: 800,
      cursor: "pointer",
      boxShadow: "0 4px 12px rgba(74, 124, 78, 0.2)",
      transition: "all 0.2s",
    },
    btnGhost: {
      padding: "10px 16px",
      borderRadius: 12,
      border: "1px solid #d1d5db",
      background: "#fff",
      color: "#374151",
      fontWeight: 800,
      cursor: "pointer",
      transition: "background 0.2s",
    },

    cards: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginBottom: 20 },
    card: {
      background: "var(--glass-bg)",
      backdropFilter: "var(--glass-blur)",
      WebkitBackdropFilter: "var(--glass-blur)",
      border: "var(--glass-border)",
      borderRadius: 18,
      padding: 20,
      boxShadow: "var(--glass-shadow)",
    },
    cardLabel: { color: "#6b7280", fontWeight: 800, fontSize: 12, textTransform: "uppercase" },
    cardValue: { marginTop: 8, fontSize: 24, fontWeight: 900, color: "#1f2937" },

    tableWrap: {
      background: "var(--glass-bg)",
      backdropFilter: "var(--glass-blur)",
      WebkitBackdropFilter: "var(--glass-blur)",
      border: "var(--glass-border)",
      borderRadius: 18,
      overflow: "hidden",
      boxShadow: "var(--glass-shadow)",
    },
    table: { width: "100%", borderCollapse: "separate", borderSpacing: 0 },
    th: {
      textAlign: "left",
      fontSize: 12,
      color: "#6b7280",
      padding: "14px 16px",
      borderBottom: "1px solid #e5e7eb",
      background: "#f9fafb",
      fontWeight: 800,
      textTransform: "uppercase",
    },
    td: { padding: "14px 16px", borderBottom: "1px solid #f3f4f6", fontSize: 14, color: "#374151" },
    actions: { display: "flex", gap: 10, justifyContent: "flex-end" },

    error: {
      padding: "12px 16px",
      background: "#fef2f2",
      border: "1px solid #fee2e2",
      borderRadius: 12,
      color: "#b91c1c",
      fontWeight: 700,
      fontSize: 13,
      marginBottom: 16,
    },

    overlay: {
      position: "fixed",
      inset: 0,
      background: "rgba(15, 23, 42, 0.45)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
      zIndex: 999,
      backdropFilter: "blur(4px)",
    },
    modal: {
      width: "min(560px, 96vw)",
      background: "#fff",
      borderRadius: 24,
      border: "1px solid #e2e8f0",
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      overflow: "hidden",
    },
    modalHead: {
      padding: "20px 24px",
      borderBottom: "1px solid #e2e8f0",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    modalTitle: { margin: 0, fontSize: 18, fontWeight: 900, color: "#0f172a" },
    modalBody: { padding: "24px" },
    grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
    label: { fontSize: 12, color: "#6b7280", fontWeight: 800, marginBottom: 8, textTransform: "uppercase" },
    input: {
      width: "100%",
      padding: "12px 14px",
      border: "1px solid #e2e8f0",
      borderRadius: 12,
      outline: "none",
      fontSize: 14,
      fontWeight: 600,
      transition: "border 0.2s",
    },
    textarea: {
      width: "100%",
      padding: "12px 14px",
      border: "1px solid #e2e8f0",
      borderRadius: 12,
      outline: "none",
      fontSize: 14,
      fontWeight: 600,
      minHeight: 100,
      resize: "vertical",
    },
    modalFoot: {
      padding: "16px 24px",
      borderTop: "1px solid #e2e8f0",
      display: "flex",
      justifyContent: "flex-end",
      gap: 12,
      background: "#f8fafc",
    },
  };

  const styleTag = (
    <style>{`
      .page-wrapper { position: relative; min-height: 100%; overflow: hidden; }
      .page-container { padding: 24px; position: relative; z-index: 1; }
      .btn:hover:not(:disabled) { transform: translateY(-1px); boxShadow: 0 6px 16px rgba(74, 124, 78, 0.35); }
      .btn:active:not(:disabled) { transform: translateY(0); }
      .btnGhost:hover:not(:disabled) { background: #f9fafb; border-color: #d1d5db; }
      input:focus, textarea:focus { border-color: #4a7c4e; box-shadow: 0 0 0 3px rgba(74, 124, 78, 0.1); }
    `}</style>
  );

  return (
    <AppLayout>
      <div className="page-wrapper">
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

        <div className="page-container">
          <div style={styles.headerRow}>
            <div>
              <h1 style={styles.title}>Bank Withdrawals</h1>
              <p style={styles.sub}>
                Record cash withdrawn from the bank. These records are used in monthly cash/coin reports automatically.
              </p>
            </div>

            <div style={styles.controls}>
              <select style={styles.select} value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                  <option key={m} value={m}>
                    {monthName(m)}
                  </option>
                ))}
              </select>

              <select style={styles.select} value={year} onChange={(e) => setYear(Number(e.target.value))}>
                {[year - 2, year - 1, year, year + 1].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>

              <button style={styles.btn} onClick={openCreate}>
                + Add Withdrawal
              </button>
            </div>
          </div>

          <div style={styles.cards}>
            <div style={styles.card}>
              <div style={styles.cardLabel}>Total Withdrawn ({monthName(month)} {year})</div>
              <div style={styles.cardValue}>{formatLKR(totalForMonth)}</div>
              <div style={{ marginTop: 8, color: "#6b7280", fontSize: 13 }}>
                Transactions: <b>{rows.length}</b>
              </div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardLabel}>System Status</div>
              <div style={styles.cardValue}>{loading ? "Loading..." : "Ready"}</div>
              <div style={{ marginTop: 8, color: "#6b7280", fontSize: 13 }}>
                You can add, edit, and delete withdrawal records for reconciliation.
              </div>
            </div>
          </div>

          {error ? <div style={styles.error}>{error}</div> : null}

          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Bank Ref</th>
                  <th style={styles.th}>Amount</th>
                  <th style={styles.th}>Notes</th>
                  <th style={{ ...styles.th, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td style={styles.td} colSpan={5}>
                      Loading withdrawals...
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td style={styles.td} colSpan={5}>
                      No withdrawals found for this month.
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr key={r.id}>
                      <td style={styles.td}>{String(r.date).slice(0, 10)}</td>
                      <td style={styles.td}>{r.bank_ref}</td>
                      <td style={styles.td}>
                        <b>{formatLKR(r.amount)}</b>
                      </td>
                      <td style={styles.td}>{r.notes || <span style={{ color: "#9ca3af" }}>—</span>}</td>
                      <td style={styles.td}>
                        <div style={styles.actions}>
                          <button style={styles.btnGhost} onClick={() => openEdit(r)}>
                            Edit
                          </button>
                          <button
                            style={{ ...styles.btnGhost, borderColor: "#fecaca", color: "#b91c1c" }}
                            onClick={() => onDelete(r)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {open ? (
            <div
              style={styles.overlay}
              onMouseDown={() => {
                setOpen(false);
                resetForm();
              }}
            >
              <div
                style={styles.modal}
                onMouseDown={(e) => {
                  e.stopPropagation();
                }}
              >
                <div style={styles.modalHead}>
                  <h3 style={styles.modalTitle}>
                    {mode === "create" ? "Add Withdrawal" : "Edit Withdrawal"}
                  </h3>
                  <button
                    style={styles.btnGhost}
                    onClick={() => {
                      setOpen(false);
                      resetForm();
                    }}
                  >
                    Close
                  </button>
                </div>

                <div style={styles.modalBody}>
                  <div style={styles.grid}>
                    <div>
                      <div style={styles.label}>Date</div>
                      <input style={styles.input} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                    </div>

                    <div>
                      <div style={styles.label}>Amount (LKR)</div>
                      <input
                        style={styles.input}
                        inputMode="decimal"
                        placeholder="e.g., 20000"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                    </div>

                    <div style={{ gridColumn: "span 2" }}>
                      <div style={styles.label}>Bank Reference</div>
                      <input
                        style={styles.input}
                        placeholder="e.g., BNK-REF-8191"
                        value={bankRef}
                        onChange={(e) => setBankRef(e.target.value)}
                      />
                    </div>

                    <div style={{ gridColumn: "span 2" }}>
                      <div style={styles.label}>Notes (optional)</div>
                      <textarea
                        style={styles.textarea}
                        placeholder="Optional note"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>
                  </div>

                  {error ? <div style={styles.error}>{error}</div> : null}
                </div>

                <div style={styles.modalFoot}>
                  <button
                    style={styles.btnGhost}
                    onClick={() => {
                      setOpen(false);
                      resetForm();
                    }}
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button style={styles.btn} onClick={onSave} disabled={saving}>
                    {saving ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </AppLayout>
  );
}
