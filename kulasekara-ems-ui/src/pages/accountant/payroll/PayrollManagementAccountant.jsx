import React, { useEffect, useMemo, useState } from "react";
import AppLayout from "../../../components/layout/AppLayout";
import { getPayrollListAccountant, generatePayrollAccountant } from "../../../services/accountantService";
import { formatLKR } from "../../../utils/salaryUtils";

export default function PayrollManagementAccountant() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    getPayrollListAccountant().then(setRows);
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => `${r.payrollId} ${r.period} ${r.status}`.toLowerCase().includes(q));
  }, [rows, search]);

  return (
    <AppLayout>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={styles.headRow}>
          <h2 style={{ marginTop: 0 }}>Payroll Management</h2>
          <button style={styles.primaryBtn} onClick={() => setShowModal(true)}>+ Generate Payroll</button>
        </div>

        <div style={styles.card}>
          <label style={styles.label}>Search</label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="PAY-2025-10 / Completed / Pending"
            style={styles.input}
          />
        </div>

        <div style={{ ...styles.card, marginTop: 12 }}>
          {filtered.length === 0 ? (
            <p style={{ color: "#64748b" }}>No payroll records found.</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr style={styles.thead}>
                  <th style={styles.thLeft}>Payroll ID</th>
                  <th style={styles.thLeft}>Period</th>
                  <th style={styles.thLeft}>Status</th>
                  <th style={styles.thRight}>Total</th>
                  <th style={styles.thLeft}>Created</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.payrollId} style={styles.tr}>
                    <td style={styles.tdLeft}>{r.payrollId}</td>
                    <td style={styles.tdLeft}>{r.period}</td>
                    <td style={styles.tdLeft}>{r.status}</td>
                    <td style={styles.tdRight}>{formatLKR(r.total || 0)}</td>
                    <td style={styles.tdLeft}>{r.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {showModal ? (
          <GeneratePayrollModal
            onClose={() => setShowModal(false)}
            onCreate={async (period) => {
              const newItem = await generatePayrollAccountant(period);
              setRows((prev) => [newItem, ...prev]);
              setShowModal(false);
            }}
          />
        ) : null}
      </div>
    </AppLayout>
  );
}

function GeneratePayrollModal({ onClose, onCreate }) {
  const [period, setPeriod] = useState("");

  const submit = (e) => {
    e.preventDefault();
    const p = period.trim();
    if (!/^\d{4}-\d{2}$/.test(p)) {
      alert("Enter period in YYYY-MM format (example: 2025-11)");
      return;
    }
    onCreate(p);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3 style={{ marginTop: 0 }}>Generate Payroll</h3>

        <form onSubmit={submit}>
          <label style={styles.label}>Payroll Period (YYYY-MM)</label>
          <input value={period} onChange={(e) => setPeriod(e.target.value)} placeholder="2025-11" style={styles.input} />

          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <button type="submit" style={styles.primaryBtn}>Generate</button>
            <button type="button" onClick={onClose} style={styles.secondaryBtn}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  headRow: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" },
  card: { background: "#fff", padding: 16, borderRadius: 10 },
  label: { display: "block", fontSize: 14, fontWeight: 800, marginBottom: 6 },
  input: { width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd", outline: "none" },

  primaryBtn: { padding: "10px 12px", borderRadius: 10, border: "none", background: "#111", color: "#fff", cursor: "pointer", fontWeight: 800 },
  secondaryBtn: { padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontWeight: 800 },

  table: { width: "100%", borderCollapse: "collapse" },
  thead: { background: "#f2f2f2" },
  tr: { borderTop: "1px solid #eee" },
  thLeft: { textAlign: "left", padding: 10, fontSize: 13 },
  thRight: { textAlign: "right", padding: 10, fontSize: 13 },
  tdLeft: { textAlign: "left", padding: 10, fontSize: 13 },
  tdRight: { textAlign: "right", padding: 10, fontSize: 13 },

  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 },
  modal: { width: "100%", maxWidth: 420, background: "#fff", borderRadius: 12, padding: 16 },
};
