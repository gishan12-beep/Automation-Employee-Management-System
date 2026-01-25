import React, { useMemo, useState } from "react";
import AppLayout from "../../../components/layout/AppLayout";

// helpers
const Badge = ({ status }) => {
  const s = (status || "PENDING").toUpperCase();
  const cfg = {
    PENDING: { bg: "#FEF3C7", fg: "#92400E", border: "#FCD34D" },
    APPROVED: { bg: "#D1FAE5", fg: "#065F46", border: "#6EE7B7" },
    REJECTED: { bg: "#FEE2E2", fg: "#991B1B", border: "#FCA5A5" },
  }[s] || { bg: "#E5E7EB", fg: "#374151", border: "#D1D5DB" };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "6px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 800,
        color: cfg.fg,
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        whiteSpace: "nowrap",
      }}
    >
      {s}
    </span>
  );
};

const daysBetweenInclusive = (from, to) => {
  const a = new Date(from);
  const b = new Date(to);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return 0;
  const diff = Math.round((b - a) / (1000 * 60 * 60 * 24));
  return diff + 1;
};

const fmtDate = (d) => {
  const x = new Date(d);
  if (Number.isNaN(x.getTime())) return d;
  return x.toISOString().slice(0, 10);
};

const KpiCard = ({ title, value, hint }) => (
  <div
    style={{
      background: "#fff",
      border: "1px solid #E6EAF2",
      borderRadius: 14,
      padding: 14,
      boxShadow: "0 8px 18px rgba(15, 23, 42, 0.06)",
      minHeight: 86,
    }}
  >
    <div style={{ fontSize: 12, color: "#64748B", fontWeight: 700 }}>{title}</div>
    <div style={{ fontSize: 24, fontWeight: 900, color: "#0F172A", marginTop: 6 }}>
      {value}
    </div>
    {hint ? <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 6 }}>{hint}</div> : null}
  </div>
);

export default function ApplyLeave() {
  // ✅ employee_id from login/local storage (fallback for UI demo)
  const employee_id = localStorage.getItem("employee_id") || "EMP001";

  // ✅ DB schema fields:
  // leave_id (auto), employee_id, leave_type, start_date, end_date, reason, status
  const [myRequests, setMyRequests] = useState([
    {
      leave_id: 2001,
      employee_id,
      leave_type: "CASUAL",
      start_date: "2026-01-26",
      end_date: "2026-01-26",
      reason: "Personal matter.",
      status: "PENDING",
    },
    {
      leave_id: 2002,
      employee_id,
      leave_type: "ANNUAL",
      start_date: "2026-02-10",
      end_date: "2026-02-12",
      reason: "Family function.",
      status: "APPROVED",
    },
  ]);

  const [form, setForm] = useState({
    leave_type: "CASUAL",
    start_date: "",
    end_date: "",
    reason: "",
  });

  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");

  const kpis = useMemo(() => {
    const pending = myRequests.filter((r) => r.status === "PENDING").length;
    const approved = myRequests.filter((r) => r.status === "APPROVED").length;
    const rejected = myRequests.filter((r) => r.status === "REJECTED").length;
    return { pending, approved, rejected };
  }, [myRequests]);

  const validate = () => {
    const e = {};
    if (!form.leave_type) e.leave_type = "Leave type is required.";
    if (!form.start_date) e.start_date = "Start date is required.";
    if (!form.end_date) e.end_date = "End date is required.";

    if (form.start_date && form.end_date) {
      const a = new Date(form.start_date);
      const b = new Date(form.end_date);
      if (b < a) e.end_date = "End date must be same or after start date.";
    }

    if ((form.reason || "").length > 255) e.reason = "Reason must be within 255 characters.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = (ev) => {
    ev.preventDefault();
    setSuccessMsg("");

    if (!validate()) return;

    // UI-only: create next leave_id
    const nextId =
      Math.max(0, ...myRequests.map((r) => Number(r.leave_id || 0))) + 1;

    const newReq = {
      leave_id: nextId, // in real DB it auto increments
      employee_id,
      leave_type: form.leave_type,
      start_date: form.start_date,
      end_date: form.end_date,
      reason: form.reason?.trim() || null,
      status: "PENDING",
    };

    setMyRequests((prev) => [newReq, ...prev]);
    setForm({ leave_type: "CASUAL", start_date: "", end_date: "", reason: "" });
    setErrors({});
    setSuccessMsg("Leave request submitted (UI demo).");
  };

  return (
    <AppLayout>
      <div style={{ padding: 18, background: "#F6F8FC", minHeight: "100vh" }}>
        {/* Header */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #E6EAF2",
            borderRadius: 16,
            padding: 16,
            boxShadow: "0 10px 22px rgba(15, 23, 42, 0.06)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: "#0F172A" }}>
                Apply Leave
              </div>
              <div style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>
                Submit a leave request and track your request status
              </div>
            </div>

            <div
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid #E2E8F0",
                background: "#F8FAFC",
                fontWeight: 900,
                color: "#0F172A",
              }}
            >
              Employee ID: {employee_id}
            </div>
          </div>
        </div>

        {/* KPI */}
        <div style={{ height: 14 }} />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 12,
          }}
        >
          <KpiCard title="Pending" value={kpis.pending} hint="Waiting for manager review" />
          <KpiCard title="Approved" value={kpis.approved} hint="Leave confirmed" />
          <KpiCard title="Rejected" value={kpis.rejected} hint="Not approved" />
        </div>

        {/* Form card */}
        <div style={{ height: 14 }} />
        <div
          style={{
            background: "#fff",
            border: "1px solid #E6EAF2",
            borderRadius: 16,
            padding: 14,
            boxShadow: "0 10px 22px rgba(15, 23, 42, 0.06)",
          }}
        >
          <div style={{ fontWeight: 900, color: "#0F172A", marginBottom: 10 }}>
            New Leave Request
          </div>

          {successMsg ? (
            <div
              style={{
                marginBottom: 12,
                padding: 12,
                borderRadius: 12,
                background: "#D1FAE5",
                border: "1px solid #6EE7B7",
                color: "#065F46",
                fontWeight: 800,
              }}
            >
              {successMsg}
            </div>
          ) : null}

          <form onSubmit={onSubmit}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                gap: 10,
                alignItems: "end",
              }}
            >
              {/* leave_type */}
              <div>
                <div style={{ fontSize: 12, color: "#64748B", fontWeight: 800 }}>
                  Leave Type
                </div>
                <select
                  value={form.leave_type}
                  onChange={(e) => setForm((p) => ({ ...p, leave_type: e.target.value }))}
                  style={{
                    width: "100%",
                    marginTop: 6,
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: "1px solid #E2E8F0",
                    outline: "none",
                    fontWeight: 800,
                    background: "#fff",
                  }}
                >
                  <option value="CASUAL">CASUAL</option>
                  <option value="MEDICAL">MEDICAL</option>
                  <option value="ANNUAL">ANNUAL</option>
                </select>
                {errors.leave_type ? (
                  <div style={{ marginTop: 6, fontSize: 12, color: "#B91C1C", fontWeight: 800 }}>
                    {errors.leave_type}
                  </div>
                ) : null}
              </div>

              {/* start_date */}
              <div>
                <div style={{ fontSize: 12, color: "#64748B", fontWeight: 800 }}>
                  Start Date
                </div>
                <input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm((p) => ({ ...p, start_date: e.target.value }))}
                  style={{
                    width: "100%",
                    marginTop: 6,
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: "1px solid #E2E8F0",
                    outline: "none",
                    fontWeight: 800,
                  }}
                />
                {errors.start_date ? (
                  <div style={{ marginTop: 6, fontSize: 12, color: "#B91C1C", fontWeight: 800 }}>
                    {errors.start_date}
                  </div>
                ) : null}
              </div>

              {/* end_date */}
              <div>
                <div style={{ fontSize: 12, color: "#64748B", fontWeight: 800 }}>
                  End Date
                </div>
                <input
                  type="date"
                  value={form.end_date}
                  onChange={(e) => setForm((p) => ({ ...p, end_date: e.target.value }))}
                  style={{
                    width: "100%",
                    marginTop: 6,
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: "1px solid #E2E8F0",
                    outline: "none",
                    fontWeight: 800,
                  }}
                />
                {errors.end_date ? (
                  <div style={{ marginTop: 6, fontSize: 12, color: "#B91C1C", fontWeight: 800 }}>
                    {errors.end_date}
                  </div>
                ) : null}
              </div>

              {/* days */}
              <div>
                <div style={{ fontSize: 12, color: "#64748B", fontWeight: 800 }}>
                  Days
                </div>
                <div
                  style={{
                    marginTop: 6,
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: "1px solid #E2E8F0",
                    background: "#F8FAFC",
                    fontWeight: 900,
                    color: "#0F172A",
                  }}
                >
                  {form.start_date && form.end_date
                    ? daysBetweenInclusive(form.start_date, form.end_date)
                    : "—"}
                </div>
              </div>

              {/* reason */}
              <div style={{ gridColumn: "1 / -1" }}>
                <div style={{ fontSize: 12, color: "#64748B", fontWeight: 800 }}>
                  Reason (optional, max 255 chars)
                </div>
                <textarea
                  value={form.reason}
                  onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))}
                  rows={3}
                  placeholder="Type your reason..."
                  style={{
                    width: "100%",
                    marginTop: 6,
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: "1px solid #E2E8F0",
                    outline: "none",
                    fontWeight: 700,
                    resize: "vertical",
                  }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                  {errors.reason ? (
                    <div style={{ fontSize: 12, color: "#B91C1C", fontWeight: 800 }}>
                      {errors.reason}
                    </div>
                  ) : <span />}

                  <div style={{ fontSize: 12, color: "#94A3B8", fontWeight: 800 }}>
                    {(form.reason || "").length}/255
                  </div>
                </div>
              </div>
            </div>

            <div style={{ height: 12 }} />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                type="button"
                onClick={() => {
                  setForm({ leave_type: "CASUAL", start_date: "", end_date: "", reason: "" });
                  setErrors({});
                  setSuccessMsg("");
                }}
                style={{
                  border: "1px solid #E2E8F0",
                  background: "#FFFFFF",
                  borderRadius: 12,
                  padding: "10px 12px",
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                Clear
              </button>

              <button
                type="submit"
                style={{
                  border: "1px solid #BBF7D0",
                  background: "#D1FAE5",
                  borderRadius: 12,
                  padding: "10px 12px",
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                Submit Request
              </button>
            </div>
          </form>
        </div>

        {/* My Requests table */}
        <div style={{ height: 14 }} />
        <div
          style={{
            background: "#fff",
            border: "1px solid #E6EAF2",
            borderRadius: 16,
            padding: 0,
            boxShadow: "0 10px 22px rgba(15, 23, 42, 0.06)",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: 14, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontWeight: 900, color: "#0F172A" }}>My Leave Requests</div>
            <div style={{ fontSize: 12, color: "#64748B", fontWeight: 800 }}>
              {myRequests.length} total
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
              <thead>
                <tr style={{ background: "#F8FAFC", borderTop: "1px solid #E6EAF2" }}>
                  {["Leave ID", "Leave Type", "Start Date", "End Date", "Days", "Reason", "Status"].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: "left",
                        padding: "12px 14px",
                        fontSize: 12,
                        color: "#64748B",
                        fontWeight: 900,
                        borderBottom: "1px solid #E6EAF2",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {myRequests.map((r) => (
                  <tr key={r.leave_id} style={{ borderBottom: "1px solid #EEF2F7" }}>
                    <td style={{ padding: "12px 14px", fontWeight: 900, color: "#0F172A" }}>
                      {r.leave_id}
                    </td>
                    <td style={{ padding: "12px 14px", fontWeight: 800, color: "#0F172A" }}>
                      {r.leave_type}
                    </td>
                    <td style={{ padding: "12px 14px", fontWeight: 800, color: "#0F172A" }}>
                      {fmtDate(r.start_date)}
                    </td>
                    <td style={{ padding: "12px 14px", fontWeight: 800, color: "#0F172A" }}>
                      {fmtDate(r.end_date)}
                    </td>
                    <td style={{ padding: "12px 14px", fontWeight: 900, color: "#0F172A" }}>
                      {daysBetweenInclusive(r.start_date, r.end_date)}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <div
                        style={{
                          maxWidth: 360,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          fontWeight: 700,
                          color: "#334155",
                        }}
                        title={r.reason || ""}
                      >
                        {r.reason || "—"}
                      </div>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <Badge status={r.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
