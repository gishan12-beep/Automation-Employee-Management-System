// src/pages/employee/attendance/MyAttendance.jsx
import React, { useEffect, useMemo, useState } from "react";
import AppLayout from "../../../components/layout/AppLayout";

/* ---------------- helpers ---------------- */
const pad2 = (n) => String(n).padStart(2, "0");

const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};

const formatTimeHHMM = (dateObj) => {
  const h = pad2(dateObj.getHours());
  const m = pad2(dateObj.getMinutes());
  return `${h}:${m}`;
};

const formatHHMMSS = (seconds) => {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${pad2(h)}:${pad2(m)}:${pad2(sec)}`;
};

const minutesToReadable = (mins) => {
  const m = Math.max(0, Math.floor(mins));
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${h}h ${pad2(mm)}m`;
};

/* ---------------- inline styles ---------------- */
const styles = {
  page: { padding: 18 },

  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    flexWrap: "wrap",
    marginBottom: 14,
    alignItems: "flex-start",
  },

  title: { margin: 0, fontSize: 22, fontWeight: 900 },
  subtitle: { marginTop: 6, fontSize: 13, opacity: 0.75 },

  card: {
    background: "#fff",
    borderRadius: 16,
    border: "1px solid rgba(0,0,0,0.08)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
    marginBottom: 14,
    overflow: "hidden",
  },

  cardHead: {
    padding: 14,
    borderBottom: "1px solid rgba(0,0,0,0.06)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: 12,
  },

  cardTitle: { fontSize: 14, fontWeight: 900 },

  actions: { display: "flex", gap: 10, flexWrap: "wrap" },

  btn: {
    padding: "10px 14px",
    borderRadius: 14,
    border: "1px solid rgba(0,0,0,0.2)",
    background: "#fff",
    fontWeight: 800,
    cursor: "pointer",
    fontSize: 13,
  },
  btnPrimary: {
    background: "#111",
    color: "#fff",
    border: "1px solid #111",
  },
  btnDisabled: { opacity: 0.5, cursor: "not-allowed" },

  body: { padding: 14 },

  pill: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(0,0,0,0.15)",
    fontSize: 11,
    fontWeight: 900,
    whiteSpace: "nowrap",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 12,
    marginTop: 12,
  },

  box: {
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: 14,
    padding: 12,
    background: "#fff",
  },
  boxLabel: { fontSize: 12, fontWeight: 800, opacity: 0.7 },
  boxValue: { fontSize: 18, fontWeight: 900, marginTop: 6 },
  boxHint: { fontSize: 12, opacity: 0.7, marginTop: 6 },

  tableWrap: { padding: 14, overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", minWidth: 820 },

  th: {
    textAlign: "left",
    fontSize: 12,
    fontWeight: 900,
    opacity: 0.7,
    padding: 10,
    borderBottom: "1px solid rgba(0,0,0,0.08)",
  },
  td: {
    padding: 12,
    borderBottom: "1px solid rgba(0,0,0,0.06)",
    fontSize: 13,
    verticalAlign: "middle",
  },
};

/* ---------------- component ---------------- */
export default function MyAttendance() {
  // In your real app: take this from login/session
  const employeeId = (localStorage.getItem("employee_id") || "EMP001").toUpperCase();
  const today = todayISO();

  // Standard work day for OT: 8h
  const STANDARD_MINUTES = 8 * 60;

  // Live clock (updates EVERY SECOND)
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // UI-only records (store check_in/check_out as ISO timestamps for second-accurate timer)
  const [records, setRecords] = useState(() => [
    {
      attendance_id: 1,
      employee_id: employeeId,
      date: today,
      check_in: null, // ISO string
      check_out: null, // ISO string
      status: "ABSENT",
    },
  ]);

  const todayRecord = useMemo(
    () => records.find((r) => r.date === today),
    [records, today]
  );

  // Worked seconds (live)
  const workedSeconds = useMemo(() => {
    if (!todayRecord?.check_in) return 0;

    const start = new Date(todayRecord.check_in);
    const end = todayRecord.check_out ? new Date(todayRecord.check_out) : now;

    const diff = Math.floor((end - start) / 1000);
    return diff > 0 ? diff : 0;
  }, [todayRecord?.check_in, todayRecord?.check_out, now]);

  const workedMinutes = useMemo(() => Math.floor(workedSeconds / 60), [workedSeconds]);
  const otMinutes = useMemo(
    () => Math.max(0, workedMinutes - STANDARD_MINUTES),
    [workedMinutes, STANDARD_MINUTES]
  );

  /* -------- actions -------- */
  const handleCheckIn = () => {
    const current = new Date();
    setRecords((prev) =>
      prev.map((r) =>
        r.date === today
          ? {
              ...r,
              check_in: current.toISOString(),
              status: "PRESENT",
            }
          : r
      )
    );
  };

  const handleCheckOut = () => {
    const current = new Date();
    setRecords((prev) =>
      prev.map((r) =>
        r.date === today
          ? {
              ...r,
              check_out: current.toISOString(),
              status: "PRESENT",
            }
          : r
      )
    );
  };

  // Button logic
  const canCheckIn = !todayRecord?.check_in;
  const canCheckOut = !!todayRecord?.check_in && !todayRecord?.check_out;

  return (
    <AppLayout>
      <div style={styles.page}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>My Attendance</h2>
            <div style={styles.subtitle}>
              Live timer updates every second + OT calculation (UI-only)
            </div>
          </div>
        </div>

        {/* Today card */}
        <div style={styles.card}>
          <div style={styles.cardHead}>
            <div>
              <div style={styles.cardTitle}>Today — {today}</div>
              <div style={{ marginTop: 8, fontSize: 13 }}>
                <b>Employee:</b> {employeeId} &nbsp; | &nbsp;
                <b>Status:</b> <span style={styles.pill}>{todayRecord?.status || "-"}</span>
              </div>
            </div>

            <div style={styles.actions}>
              <button
                style={{
                  ...styles.btn,
                  ...styles.btnPrimary,
                  ...(canCheckIn ? {} : styles.btnDisabled),
                }}
                disabled={!canCheckIn}
                onClick={handleCheckIn}
              >
                Check In
              </button>

              <button
                style={{
                  ...styles.btn,
                  ...(canCheckOut ? {} : styles.btnDisabled),
                }}
                disabled={!canCheckOut}
                onClick={handleCheckOut}
              >
                Check Out
              </button>
            </div>
          </div>

          <div style={styles.body}>
            <div style={{ fontSize: 13 }}>
              <b>Check In:</b>{" "}
              {todayRecord?.check_in ? formatTimeHHMM(new Date(todayRecord.check_in)) : "-"}
              &nbsp;&nbsp; | &nbsp;&nbsp;
              <b>Check Out:</b>{" "}
              {todayRecord?.check_out ? formatTimeHHMM(new Date(todayRecord.check_out)) : "-"}
            </div>

            <div style={styles.grid}>
              <div style={styles.box}>
                <div style={styles.boxLabel}>AUTO TIMER (HH:MM:SS)</div>
                <div style={styles.boxValue}>
                  {todayRecord?.check_in ? formatHHMMSS(workedSeconds) : "00:00:00"}
                </div>
                <div style={styles.boxHint}>Updates every second until you check out.</div>
              </div>

              <div style={styles.box}>
                <div style={styles.boxLabel}>WORKED HOURS (today)</div>
                <div style={styles.boxValue}>{minutesToReadable(workedMinutes)}</div>
                <div style={styles.boxHint}>
                  Standard workday: {minutesToReadable(STANDARD_MINUTES)}
                </div>
              </div>

              <div style={styles.box}>
                <div style={styles.boxLabel}>OVERTIME (OT)</div>
                <div style={styles.boxValue}>{minutesToReadable(otMinutes)}</div>
                <div style={styles.boxHint}>OT = max(0, worked − 8h)</div>
              </div>
            </div>
          </div>
        </div>

        {/* History */}
        <div style={styles.card}>
          <div style={styles.cardHead}>
            <div style={styles.cardTitle}>Attendance History</div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>
              (UI-only) Later connect to MySQL `attendance` table
            </div>
          </div>

          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Check In</th>
                  <th style={styles.th}>Check Out</th>
                  <th style={styles.th}>Worked</th>
                  <th style={styles.th}>OT</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>

              <tbody>
                {records.map((r) => {
                  let wSec = 0;
                  if (r.check_in && r.check_out) {
                    const start = new Date(r.check_in);
                    const end = new Date(r.check_out);
                    const diff = Math.floor((end - start) / 1000);
                    wSec = diff > 0 ? diff : 0;
                  }
                  const wMin = Math.floor(wSec / 60);
                  const oMin = Math.max(0, wMin - STANDARD_MINUTES);

                  return (
                    <tr key={r.attendance_id}>
                      <td style={styles.td}>{r.date}</td>
                      <td style={styles.td}>
                        {r.check_in ? formatTimeHHMM(new Date(r.check_in)) : "-"}
                      </td>
                      <td style={styles.td}>
                        {r.check_out ? formatTimeHHMM(new Date(r.check_out)) : "-"}
                      </td>
                      <td style={styles.td}>{wSec ? minutesToReadable(wMin) : "-"}</td>
                      <td style={styles.td}>{oMin ? minutesToReadable(oMin) : "-"}</td>
                      <td style={styles.td}>
                        <span style={styles.pill}>{r.status || "-"}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
