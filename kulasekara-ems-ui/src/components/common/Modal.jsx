import React from "react";

export function Modal({ children, onClose }) {
  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <button style={styles.close} onClick={onClose}>×</button>
        {children}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0, left: 0, width: "100vw", height: "100vh",
    background: "rgba(0,0,0,0.5)", display: "flex",
    justifyContent: "center", alignItems: "center"
  },
  modal: {
    background: "#fff", padding: "20px", borderRadius: "8px",
    minWidth: "400px", position: "relative"
  },
  close: {
    position: "absolute", top: "10px", right: "10px",
    border: "none", background: "none", fontSize: "20px",
    cursor: "pointer"
  }
};
