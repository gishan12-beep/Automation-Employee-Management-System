import React, { useEffect, useMemo, useState } from "react";
import AppLayout from "../../../components/layout/AppLayout";
import { getTodayAttendanceApi, markCheckInApi, markCheckOutApi } from "../../../services/employeeService";

/* ---------------- helpers ---------------- */
// Pads a single digit number with a leading zero to ensure a two-character string length
const pad2 = (n) => String(n).padStart(2, "0");

// Generates the current system date in a standardized ISO YYYY-MM-DD format
const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};

// Formats a JavaScript Date object into a simplified HH:MM string for localized display
const formatTimeHHMM = (dateObj) => {
  const h = pad2(dateObj.getHours());
  const m = pad2(dateObj.getMinutes());
  return `${h}:${m}`;
};

// Converts a total number of seconds into a traditional HH:MM:SS clock format string
const formatHHMMSS = (seconds) => {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${pad2(h)}:${pad2(m)}:${pad2(sec)}`;
};

// Translates a raw duration in minutes into a human-readable 'Xh Ym' string format
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
// Main component for employees to record their daily check-in and check-out times
export default function MyAttendance() {
  // Retrieves the current employee ID from local storage for API requests
  const employeeId = (localStorage.getItem("employee_id") || "EMP001").toUpperCase();
  const today = todayISO();

  // Defines the duration of a standard work day (8 hours) for overtime calculations
  const STANDARD_MINUTES = 8 * 60;

  // Real-time clock state that updates every second to drive the live work timer
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetches the employee's attendance record for the current day on component mount
  useEffect(() => {
    (async () => {
      try {
        const res = await getTodayAttendanceApi();
        if (res.attendance) {
          const rec = res.attendance;
          const toIso = (timeStr) => timeStr ? `${today}T${timeStr}` : null;

          // Normalizes the backend time strings into ISO format for precise UI calculations
          setRecords([{
            attendance_id: rec.attendance_id,
            employee_id: rec.employee_id,
            date: today,
            check_in: toIso(rec.check_in),
            check_out: toIso(rec.check_out),
            status: rec.status
          }]);
        } else {
          // Initializes a default 'Absent' record if no check-in exists for today
          setRecords([{
            attendance_id: 'temp',
            employee_id: employeeId,
            date: today,
            check_in: null,
            check_out: null,
            status: "ABSENT",
          }]);
        }
      } catch (err) {
        console.error(err);
      }
    })();
  }, [today, employeeId]);

  const [records, setRecords] = useState(() => [
    {
      attendance_id: 1,
      employee_id: employeeId,
      date: today,
      check_in: null,
      check_out: null,
      status: "ABSENT",
    },
  ]);

  // Identifies the attendance object corresponding to the current calendar date
  const todayRecord = useMemo(
    () => records.find((r) => r.date === today),
    [records, today]
  );

  // Calculates the total elapsed seconds since check-in for the live timer display
  const workedSeconds = useMemo(() => {
    if (!todayRecord?.check_in) return 0;

    const start = new Date(todayRecord.check_in);
    const end = todayRecord.check_out ? new Date(todayRecord.check_out) : now;

    const diff = Math.floor((end - start) / 1000);
    return diff > 0 ? diff : 0;
  }, [todayRecord?.check_in, todayRecord?.check_out, now]);

  const workedMinutes = useMemo(() => Math.floor(workedSeconds / 60), [workedSeconds]);
  
  // Computes the total overtime minutes by subtracting the standard 8-hour workday
  const otMinutes = useMemo(
    () => Math.max(0, workedMinutes - STANDARD_MINUTES),
    [workedMinutes, STANDARD_MINUTES]
  );

  // Sends a check-in request to the server and updates the local state with the precise timestamp
  const handleCheckIn = async () => {
    try {
      const res = await markCheckInApi();
      const timeIso = `${today}T${res.check_in}`;

      setRecords((prev) =>
        prev.map((r) =>
          r.date === today
            ? {
              ...r,
              check_in: timeIso,
              status: "PRESENT",
            }
            : r
        )
      );
    } catch (err) {
      alert(err.response?.data?.message || "Check-in failed");
    }
  };

  // Sends a check-out request to the server and finalizes the attendance record for the day
  const handleCheckOut = async () => {
    try {
      const res = await markCheckOutApi();
      const timeIso = `${today}T${res.check_out}`;

      setRecords((prev) =>
        prev.map((r) =>
          r.date === today
            ? {
              ...r,
              check_out: timeIso,
              status: "PRESENT",
            }
            : r
        )
      );
    } catch (err) {
      alert(err.response?.data?.message || "Check-out failed");
    }
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
              Attendance` table
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
