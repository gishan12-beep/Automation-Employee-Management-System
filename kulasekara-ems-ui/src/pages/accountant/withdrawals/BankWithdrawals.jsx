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
    page: { padding: 18 },
    headerRow: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 12,
      marginBottom: 14,
      flexWrap: "wrap",
    },
    title: { fontSize: 24, fontWeight: 900, margin: 0 },
    sub: { margin: "6px 0 0", color: "#6b7280", fontSize: 14 },

    controls: { display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" },
    select: {
      padding: "10px 12px",
      border: "1px solid #e5e7eb",
      borderRadius: 10,
      background: "#fff",
      fontWeight: 700,
    },
    btn: {
      padding: "10px 14px",
      borderRadius: 12,
      border: "1px solid #111827",
      background: "#111827",
      color: "#fff",
      fontWeight: 800,
      cursor: "pointer",
    },
    btnGhost: {
      padding: "10px 14px",
      borderRadius: 12,
      border: "1px solid #e5e7eb",
      background: "#fff",
      color: "#111827",
      fontWeight: 800,
      cursor: "pointer",
    },

    cards: { display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 12, marginBottom: 16 },
    card: {
      gridColumn: "span 6",
      background: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: 16,
      padding: 14,
      boxShadow: "0 8px 20px rgba(17,24,39,0.06)",
    },
    cardLabel: { color: "#6b7280", fontWeight: 800, fontSize: 13 },
    cardValue: { marginTop: 6, fontSize: 22, fontWeight: 950 },

    tableWrap: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, overflow: "hidden" },
    table: { width: "100%", borderCollapse: "collapse" },
    th: {
      textAlign: "left",
      fontSize: 12,
      color: "#6b7280",
      padding: "12px 14px",
      borderBottom: "1px solid #e5e7eb",
      background: "#fafafa",
      fontWeight: 900,
    },
    td: { padding: "12px 14px", borderBottom: "1px solid #f3f4f6", fontSize: 14, verticalAlign: "top" },
    actions: { display: "flex", gap: 8, justifyContent: "flex-end" },

    error: { margin: "10px 0 0", color: "#b91c1c", fontWeight: 800, fontSize: 13 },

    overlay: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.35)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 14,
      zIndex: 60,
    },
    modal: {
      width: "min(640px, 96vw)",
      background: "#fff",
      borderRadius: 16,
      border: "1px solid #e5e7eb",
      boxShadow: "0 18px 55px rgba(0,0,0,0.25)",
      overflow: "hidden",
    },
    modalHead: {
      padding: 14,
      borderBottom: "1px solid #e5e7eb",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    },
    modalTitle: { margin: 0, fontSize: 16, fontWeight: 950 },
    modalBody: { padding: 14 },
    grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
    label: { fontSize: 12, color: "#6b7280", fontWeight: 900, marginBottom: 6 },
    input: { width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: 12, outline: "none" },
    textarea: {
      width: "100%",
      padding: "10px 12px",
      border: "1px solid #e5e7eb",
      borderRadius: 12,
      outline: "none",
      minHeight: 90,
      resize: "vertical",
    },
    modalFoot: { padding: 14, borderTop: "1px solid #e5e7eb", display: "flex", justifyContent: "flex-end", gap: 10 },
  };

  return (
    <AppLayout>
      <div style={styles.page}>
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
    </AppLayout>
  );
}
