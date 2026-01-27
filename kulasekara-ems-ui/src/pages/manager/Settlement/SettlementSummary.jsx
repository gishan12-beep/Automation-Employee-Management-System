// src/pages/manager/settlement/SettlementSummary.jsx
import React, { useMemo, useState } from "react";
import AppLayout from "../../../components/layout/AppLayout";

const dummySettlements = [
  {
    settlementID: "SET-EMP001-2026-01-10",
    employeeID: "EMP001",
    employeeName: "Kamal Perera",
    department: "Production",
    resignationDate: "2025-12-10",
    lastWorkingDate: "2026-01-10",
    netSettlementAmount: 210000,
    status: "PAID",
    settledDate: "2026-01-12",
  },
  {
    settlementID: "SET-EMP003-2026-01-12",
    employeeID: "EMP003",
    employeeName: "Saman Jayasuriya",
    department: "Stores",
    resignationDate: "2026-01-02",
    lastWorkingDate: "2026-02-02",
    netSettlementAmount: 132500,
    status: "PENDING",
    settledDate: null,
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

  // --- Styles ---
  const styles = useMemo(() => ({
    page: { position: "relative", minHeight: "100%", overflow: "hidden" },
    container: { padding: 32, position: "relative", zIndex: 1 },
    headerRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 12,
      marginBottom: 32,
      maxWidth: 1200,
      margin: "0 auto 32px auto"
    },
    title: { margin: 0, fontSize: 28, fontWeight: 900, color: "#2c5530" },
    sub: { margin: "6px 0 0", color: "#4b5563", fontSize: 15 },

    grid: {
      display: "grid",
      gridTemplateColumns: "1fr 1.5fr",
      gap: 24,
      maxWidth: 1200,
      margin: "0 auto"
    },

    card: {
      background: "rgba(255, 255, 255, 0.9)",
      backdropFilter: "blur(12px)",
      borderRadius: 18,
      border: "1px solid rgba(255, 255, 255, 0.5)",
      boxShadow: "0 8px 25px rgba(0,0,0,0.03)",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column"
    },
    cardTop: {
      padding: "20px 24px 16px",
      borderBottom: "1px solid rgba(0,0,0,0.05)",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 10,
    },
    cardTitle: { margin: 0, fontSize: 16, fontWeight: 800, color: "#1f2937", textTransform: "uppercase" },
    badge: {
      fontSize: 12,
      padding: "4px 10px",
      borderRadius: 999,
      background: "#f3f4f6",
      color: "#4b5563",
      fontWeight: 700,
    },
    hint: { fontSize: 13, color: "#9ca3af", fontStyle: "italic" },

    searchWrap: { padding: "16px 24px 12px" },
    input: {
      width: "100%",
      padding: "12px 16px",
      borderRadius: 12,
      border: "1px solid #e5e7eb",
      outline: "none",
      fontSize: 14,
      background: "#fff",
      transition: "border 0.2s"
    },

    item: {
      width: "100%",
      textAlign: "left",
      padding: 16,
      borderRadius: 14,
      border: "1px solid transparent",
      background: "transparent",
      cursor: "pointer",
      marginBottom: 8,
      transition: "background 0.2s",
    },
    itemActive: {
      width: "100%",
      textAlign: "left",
      padding: 16,
      borderRadius: 14,
      border: "1px solid #bbf7d0",
      background: "rgba(240, 253, 244, 0.5)",
      cursor: "pointer",
      marginBottom: 8,
    },
    itemTitle: { fontWeight: 800, color: "#111827", fontSize: 15 },
    itemMeta: { marginTop: 4, fontSize: 12, color: "#6b7280", fontWeight: 500 },
    amount: { marginTop: 8, fontSize: 15, fontWeight: 800, color: "#047857" },
    smallId: { marginTop: 4, fontSize: 11, color: "#9ca3af", fontFamily: "monospace" },

    pillOk: { fontSize: 11, padding: "4px 10px", borderRadius: 999, background: "#dcfce7", color: "#166534", fontWeight: 800 },
    pillWarn: { fontSize: 11, padding: "4px 10px", borderRadius: 999, background: "#ffedd5", color: "#9a3412", fontWeight: 800 },

    detailsTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 },
    detailsName: { fontSize: 22, fontWeight: 900, marginBottom: 4, color: "#111827" },
    detailsMeta: { fontSize: 13, color: "#6b7280" },
    detailsAmount: { fontSize: 24, fontWeight: 800, color: "#059669" },

    kvGrid: { marginTop: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
    kv: { padding: 16, borderRadius: 14, border: "1px solid #f3f4f6", background: "rgba(255,255,255,0.6)" },
    k: { fontSize: 12, color: "#6b7280", fontWeight: 700, textTransform: "uppercase" },
    v: { marginTop: 8, fontSize: 14, fontWeight: 700, color: "#1f2937" },
    vMono: { marginTop: 8, fontSize: 13, fontWeight: 600, fontFamily: "monospace", color: "#374151" },

    actions: { marginTop: 32, display: "flex", justifyContent: "flex-end", gap: 12 },
    primaryBtn: {
      padding: "10px 20px",
      borderRadius: 12,
      border: "none",
      background: "linear-gradient(135deg, #4a7c4e 0%, #5a8c5e 100%)",
      color: "#fff",
      cursor: "pointer",
      fontWeight: 700,
      fontSize: 14,
      boxShadow: "0 4px 12px rgba(74, 124, 78, 0.2)"
    },
    secondaryBtn: {
      padding: "10px 20px",
      borderRadius: 12,
      border: "1px solid #d1d5db",
      background: "#fff",
      cursor: "pointer",
      fontWeight: 700,
      fontSize: 14,
      color: "#374151",
    },

    note: { marginTop: 16, color: "#9ca3af", fontSize: 12, fontStyle: "italic", textAlign: "center" },
    empty: { padding: 30, textAlign: "center", color: "#9ca3af", fontStyle: "italic" },
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
                  placeholder="Search..."
                />
              </div>

              <div style={{ padding: "0 24px 24px", paddingTop: 0 }}>
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
                        <span style={x.status === "PAID" ? styles.pillOk : styles.pillWarn}>
                          {x.status}
                        </span>
                      </div>
                      <div style={styles.amount}>
                        LKR {Number(x.netSettlementAmount).toLocaleString("en-LK")}
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
                <span style={styles.hint}>Read-only view</span>
              </div>

              {!active ? (
                <div style={{ padding: 32, color: "#9ca3af", textAlign: "center" }}>Select a settlement to view details.</div>
              ) : (
                <div style={{ padding: 24 }}>
                  <div style={styles.detailsTop}>
                    <div>
                      <div style={styles.detailsName}>{active.employeeName}</div>
                      <div style={styles.detailsMeta}>
                        {active.employeeID} • {active.department}
                      </div>
                    </div>
                    <div style={styles.detailsAmount}>
                      LKR {Number(active.netSettlementAmount).toLocaleString("en-LK")}
                    </div>
                  </div>

                  <div style={styles.kvGrid}>
                    <KV k="Settlement ID" v={active.settlementID} mono styles={styles} />
                    <KV k="Resignation Date" v={active.resignationDate} styles={styles} />
                    <KV k="Last Working Date" v={active.lastWorkingDate} styles={styles} />
                    <KV k="Status" v={active.status} styles={styles} />
                    <KV k="Settled Date" v={active.settledDate || "-"} styles={styles} />
                  </div>

                  <div style={styles.actions}>
                    <button style={styles.secondaryBtn} onClick={() => alert("UI only: Print mock")}>
                      Print Report
                    </button>
                    <button style={styles.primaryBtn} onClick={() => alert("UI only: Export mock")}>
                      Export PDF
                    </button>
                  </div>

                  <div style={styles.note}>
                    Detailed breakdown available in full report.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function KV({ k, v, mono, styles }) {
  return (
    <div style={styles.kv}>
      <div style={styles.k}>{k}</div>
      <div style={mono ? styles.vMono : styles.v}>{v}</div>
    </div>
  );
}
