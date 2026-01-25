// src/pages/manager/settlement/SettlementSummary.jsx
import React, { useMemo, useState } from "react";
import AppLayout from "../../../components/layout/AppLayout";

const dummySettlements = [
  {
    settlementID: "SET-EMP001-2026-01-10",
    employeeID: "EMP001",
    employeeName: "Kamal Perera",
    department: "Production",
    lastWorkingDate: "2026-01-10",
    finalAmount: 210000,
    status: "Completed",
  },
  {
    settlementID: "SET-EMP003-2026-01-12",
    employeeID: "EMP003",
    employeeName: "Saman Jayasuriya",
    department: "Stores",
    lastWorkingDate: "2026-01-12",
    finalAmount: 132500,
    status: "Pending",
  },
];

export default function SettlementSummary() {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(dummySettlements[0]);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return dummySettlements;
    return dummySettlements.filter(
      (x) =>
        x.settlementID.toLowerCase().includes(s) ||
        x.employeeID.toLowerCase().includes(s) ||
        x.employeeName.toLowerCase().includes(s)
    );
  }, [q]);

  return (
    <AppLayout>
      <div style={styles.page}>
        <div style={styles.headerRow}>
          <div>
            <h2 style={styles.title}>Final Settlement Summary</h2>
            <p style={styles.sub}>Track completed and pending final settlements.</p>
          </div>
        </div>

        <div style={styles.grid}>
          {/* Left: list */}
          <div style={styles.card}>
            <div style={styles.cardTop}>
              <h3 style={styles.cardTitle}>Settlements</h3>
              <span style={styles.badge}>{list.length}</span>
            </div>

            <div style={styles.searchWrap}>
              <input
                style={styles.input}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by settlement ID / employee / name"
              />
            </div>

            <div style={{ padding: 14, paddingTop: 0 }}>
              {list.map((x) => {
                const isActive = active?.settlementID === x.settlementID;
                return (
                  <button
                    key={x.settlementID}
                    style={isActive ? styles.itemActive : styles.item}
                    onClick={() => setActive(x)}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                      <div>
                        <div style={styles.itemTitle}>{x.employeeName}</div>
                        <div style={styles.itemMeta}>
                          {x.employeeID} • {x.department} • {x.lastWorkingDate}
                        </div>
                      </div>
                      <span style={x.status === "Completed" ? styles.pillOk : styles.pillWarn}>
                        {x.status}
                      </span>
                    </div>
                    <div style={styles.amount}>
                      LKR {Number(x.finalAmount).toLocaleString("en-LK")}
                    </div>
                    <div style={styles.smallId}>{x.settlementID}</div>
                  </button>
                );
              })}

              {list.length === 0 && <div style={styles.empty}>No settlements found.</div>}
            </div>
          </div>

          {/* Right: details */}
          <div style={styles.card}>
            <div style={styles.cardTop}>
              <h3 style={styles.cardTitle}>Details</h3>
              <span style={styles.hint}>UI only</span>
            </div>

            {!active ? (
              <div style={{ padding: 14, color: "#667085" }}>Select a settlement to view.</div>
            ) : (
              <div style={{ padding: 14 }}>
                <div style={styles.detailsTop}>
                  <div>
                    <div style={styles.detailsName}>{active.employeeName}</div>
                    <div style={styles.detailsMeta}>
                      {active.employeeID} • {active.department}
                    </div>
                  </div>
                  <div style={styles.detailsAmount}>
                    LKR {Number(active.finalAmount).toLocaleString("en-LK")}
                  </div>
                </div>

                <div style={styles.kvGrid}>
                  <KV k="Settlement ID" v={active.settlementID} mono />
                  <KV k="Last Working Date" v={active.lastWorkingDate} />
                  <KV k="Status" v={active.status} />
                </div>

                <div style={styles.actions}>
                  <button style={styles.secondaryBtn} onClick={() => alert("UI only: Print mock")}>
                    Print
                  </button>
                  <button style={styles.primaryBtn} onClick={() => alert("UI only: Export mock")}>
                    Export PDF
                  </button>
                </div>

                <div style={styles.note}>
                  Later we can load real records from DB + show breakdown (earnings/deductions).
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function KV({ k, v, mono }) {
  return (
    <div style={styles.kv}>
      <div style={styles.k}>{k}</div>
      <div style={mono ? styles.vMono : styles.v}>{v}</div>
    </div>
  );
}

const styles = {
  page: { padding: 18 },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 14,
  },
  title: { margin: 0, fontSize: 22, fontWeight: 800 },
  sub: { margin: "6px 0 0", color: "#667085", fontSize: 13 },

  grid: { display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 14 },

  card: {
    background: "#fff",
    borderRadius: 14,
    border: "1px solid #eaecf0",
    boxShadow: "0 1px 2px rgba(16,24,40,0.06)",
    overflow: "hidden",
  },
  cardTop: {
    padding: "14px 14px 10px",
    borderBottom: "1px solid #f2f4f7",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  cardTitle: { margin: 0, fontSize: 15, fontWeight: 800 },
  badge: {
    fontSize: 12,
    padding: "4px 10px",
    borderRadius: 999,
    background: "#f2f4f7",
    color: "#344054",
    fontWeight: 700,
  },
  hint: { fontSize: 12, color: "#667085" },

  searchWrap: { padding: 14, paddingBottom: 10 },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #d0d5dd",
    outline: "none",
    fontSize: 13,
  },

  item: {
    width: "100%",
    textAlign: "left",
    padding: 12,
    borderRadius: 14,
    border: "1px solid #eaecf0",
    background: "#fff",
    cursor: "pointer",
    marginBottom: 10,
  },
  itemActive: {
    width: "100%",
    textAlign: "left",
    padding: 12,
    borderRadius: 14,
    border: "1px solid #d0d5dd",
    background: "#f8fafc",
    cursor: "pointer",
    marginBottom: 10,
  },
  itemTitle: { fontWeight: 900, color: "#101828" },
  itemMeta: { marginTop: 2, fontSize: 12, color: "#667085" },
  amount: { marginTop: 10, fontSize: 14, fontWeight: 900, color: "#101828" },
  smallId: { marginTop: 6, fontSize: 12, color: "#475467" },

  pillOk: { fontSize: 12, padding: "4px 10px", borderRadius: 999, background: "#ecfdf3", color: "#027a48", fontWeight: 900 },
  pillWarn: { fontSize: 12, padding: "4px 10px", borderRadius: 999, background: "#fff7ed", color: "#b54708", fontWeight: 900 },

  detailsTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 },
  detailsName: { fontSize: 18, fontWeight: 900, marginBottom: 4 },
  detailsMeta: { fontSize: 12, color: "#667085" },
  detailsAmount: { fontSize: 18, fontWeight: 900, color: "#101828" },

  kvGrid: { marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  kv: { padding: 12, borderRadius: 14, border: "1px solid #eaecf0", background: "#fcfcfd" },
  k: { fontSize: 12, color: "#667085", fontWeight: 800 },
  v: { marginTop: 6, fontSize: 13, fontWeight: 900, color: "#101828" },
  vMono: { marginTop: 6, fontSize: 12, fontWeight: 900, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" },

  actions: { marginTop: 14, display: "flex", justifyContent: "flex-end", gap: 10 },
  primaryBtn: {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid #101828",
    background: "#101828",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 900,
    fontSize: 13,
  },
  secondaryBtn: {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid #d0d5dd",
    background: "#fff",
    cursor: "pointer",
    fontWeight: 900,
    fontSize: 13,
    color: "#101828",
  },

  note: { marginTop: 12, color: "#667085", fontSize: 12 },
  empty: { padding: 14, textAlign: "center", color: "#667085" },
};
