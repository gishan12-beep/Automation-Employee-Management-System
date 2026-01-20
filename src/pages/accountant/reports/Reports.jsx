import React, { useState } from "react";
import AppLayout from "../../../components/layout/AppLayout";

export default function Reports() {
  const [showPdf, setShowPdf] = useState(false);
  const [showExcel, setShowExcel] = useState(false);

  return (
    <AppLayout>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <h2 style={{ marginTop: 0 }}>Reports</h2>

        <div style={styles.card}>
          <p style={styles.note}>
            (UI only) Exports will be generated from backend later (PDF / Excel).
          </p>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button style={styles.primaryBtn} onClick={() => setShowPdf(true)}>Export PDF</button>
            <button style={styles.secondaryBtn} onClick={() => setShowExcel(true)}>Export Excel</button>
          </div>
        </div>

        {showPdf ? <ExportModal title="Export PDF" onClose={() => setShowPdf(false)} /> : null}
        {showExcel ? <ExportModal title="Export Excel" onClose={() => setShowExcel(false)} /> : null}
      </div>
    </AppLayout>
  );
}

function ExportModal({ title, onClose }) {
  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3 style={{ marginTop: 0 }}>{title}</h3>
        <p style={styles.note}>(Backend-ready) This will call API and download the file.</p>

        <button style={styles.primaryBtn} onClick={() => alert("Export will be connected later")}>
          Export
        </button>
        <button style={styles.secondaryBtn} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

const styles = {
  card: { background: "#fff", padding: 16, borderRadius: 10 },
  note: { color: "#64748b", fontSize: 13 },

  primaryBtn: { padding: "10px 12px", borderRadius: 10, border: "none", background: "#111", color: "#fff", cursor: "pointer", fontWeight: 800 },
  secondaryBtn: { padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontWeight: 800 },

  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 },
  modal: { width: "100%", maxWidth: 420, background: "#fff", borderRadius: 12, padding: 16, display: "grid", gap: 10 },
};
