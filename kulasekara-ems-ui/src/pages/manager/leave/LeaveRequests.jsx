import React, { useMemo, useState } from "react";
import AppLayout from "../../../components/layout/AppLayout";

// Helpers
const daysBetweenInclusive = (from, to) => {
  const a = new Date(from);
  const b = new Date(to);
  const diff = Math.round((b - a) / (1000 * 60 * 60 * 24));
  return diff + 1;
};

const fmtDate = (d) => {
  const x = new Date(d);
  if (Number.isNaN(x.getTime())) return d;
  return x.toISOString().slice(0, 10);
};

const Badge = ({ status }) => {
  const s = (status || "PENDING").toUpperCase();
  const cfg = {
    PENDING: { bg: "#FEF3C7", fg: "#92400E", border: "#FCD34D", text: "PENDING" },
    APPROVED: { bg: "#D1FAE5", fg: "#065F46", border: "#6EE7B7", text: "APPROVED" },
    REJECTED: { bg: "#FEE2E2", fg: "#991B1B", border: "#FCA5A5", text: "REJECTED" },
  }[s] || { bg: "#E5E7EB", fg: "#374151", border: "#D1D5DB", text: s };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "6px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        color: cfg.fg,
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        whiteSpace: "nowrap",
      }}
    >
      {cfg.text}
    </span>
  );
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

const Drawer = ({ open, onClose, title, children }) => {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.45)",
        zIndex: 999,
        display: "flex",
        justifyContent: "flex-end",
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: "min(560px, 92vw)",
          height: "100%",
          background: "#fff",
          padding: 18,
          overflowY: "auto",
          boxShadow: "-10px 0 30px rgba(15,23,42,0.25)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: "#0F172A" }}>{title}</div>
            <div style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>
              Review leave request details and respond
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              border: "1px solid #E2E8F0",
              background: "#F8FAFC",
              borderRadius: 10,
              padding: "10px 12px",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>

        <div style={{ height: 14 }} />
        {children}
      </div>
    </div>
  );
};

const Field = ({ label, value }) => (
  <div style={{ marginBottom: 12 }}>
    <div style={{ fontSize: 12, color: "#64748B", fontWeight: 800 }}>{label}</div>
    <div style={{ fontSize: 14, color: "#0F172A", fontWeight: 700, marginTop: 4 }}>
      {value}
    </div>
  </div>
);

export default function LeaveRequests() {
  // ✅ Dummy data EXACTLY matches MySQL schema
  const [requests, setRequests] = useState([
    {
      leave_id: 1001,
      employee_id: "EMP001",
      leave_type: "MEDICAL",
      start_date: "2026-01-22",
      end_date: "2026-01-24",
      reason: "Doctor recommended rest due to fever.",
      status: "PENDING",
    },
    {
      leave_id: 1002,
      employee_id: "EMP012",
      leave_type: "ANNUAL",
      start_date: "2026-02-05",
      end_date: "2026-02-07",
      reason: "Family function and travel arrangements.",
      status: "APPROVED",
    },
    {
      leave_id: 1003,
      employee_id: "EMP008",
      leave_type: "CASUAL",
      start_date: "2026-01-30",
      end_date: "2026-01-30",
      reason: "Personal matter to attend.",
      status: "PENDING",
    },
  ]);

  const [filters, setFilters] = useState({
    q: "",
    status: "ALL",
    type: "ALL",
    from: "",
    to: "",
  });

  const [selected, setSelected] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // remark is NOT in schema; keep as UI-only (optional) and do NOT store to DB unless you add a column later
  const [remark, setRemark] = useState("");

  const filtered = useMemo(() => {
    const q = (filters.q || "").trim().toLowerCase();

    return requests.filter((r) => {
      const okQ =
        !q ||
        String(r.employee_id).toLowerCase().includes(q) ||
        String(r.leave_id).toLowerCase().includes(q);

      const okStatus = filters.status === "ALL" || r.status === filters.status;
      const okType = filters.type === "ALL" || r.leave_type === filters.type;

      const okFrom = !filters.from || new Date(r.start_date) >= new Date(filters.from);
      const okTo = !filters.to || new Date(r.end_date) <= new Date(filters.to);

      return okQ && okStatus && okType && okFrom && okTo;
    });
  }, [requests, filters]);

  const kpis = useMemo(() => {
    const pending = requests.filter((r) => r.status === "PENDING").length;
    const approved = requests.filter((r) => r.status === "APPROVED").length;
    const rejected = requests.filter((r) => r.status === "REJECTED").length;
    return { pending, approved, rejected };
  }, [requests]);

  const openReview = (req) => {
    setSelected(req);
    setRemark("");
    setDrawerOpen(true);
  };

  const closeReview = () => {
    setDrawerOpen(false);
    setSelected(null);
    setRemark("");
  };

  const updateStatus = (newStatus) => {
    if (!selected) return;

    // UI validation (remark is optional in schema; keep only for UX)
    if (newStatus === "REJECTED" && !(remark || "").trim()) {
      alert("Please add a remark before rejecting. ");
      return;
    }

    setRequests((prev) =>
      prev.map((r) =>
        r.leave_id === selected.leave_id ? { ...r, status: newStatus } : r
      )
    );

    setSelected((prev) => (prev ? { ...prev, status: newStatus } : prev));
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
                Leave Requests
              </div>
              <div style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>
                Review and respond to employee leave applications
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button
                onClick={() => alert("Export will coming soon")}
                style={{
                  border: "1px solid #E2E8F0",
                  background: "#F8FAFC",
                  borderRadius: 12,
                  padding: "10px 12px",
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                Export
              </button>

              <button
                onClick={() => setFilters({ q: "", status: "ALL", type: "ALL", from: "", to: "" })}
                style={{
                  border: "1px solid #E2E8F0",
                  background: "#FFFFFF",
                  borderRadius: 12,
                  padding: "10px 12px",
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* KPI Row */}
        <div style={{ height: 14 }} />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 12,
          }}
        >
          <KpiCard title="Pending" value={kpis.pending} hint="Needs your review" />
          <KpiCard title="Approved" value={kpis.approved} hint="All time (UI demo)" />
          <KpiCard title="Rejected" value={kpis.rejected} hint="All time (UI demo)" />
        </div>

        {/* Filters */}
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
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.4fr 0.7fr 0.7fr 0.7fr 0.7fr",
              gap: 10,
              alignItems: "end",
            }}
          >
            <div>
              <div style={{ fontSize: 12, color: "#64748B", fontWeight: 800 }}>Search</div>
              <input
                value={filters.q}
                onChange={(e) => setFilters((p) => ({ ...p, q: e.target.value }))}
                placeholder="Employee ID / Leave ID"
                style={{
                  width: "100%",
                  marginTop: 6,
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid #E2E8F0",
                  outline: "none",
                  fontWeight: 700,
                }}
              />
            </div>

            <div>
              <div style={{ fontSize: 12, color: "#64748B", fontWeight: 800 }}>Status</div>
              <select
                value={filters.status}
                onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
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
                <option value="ALL">All</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            <div>
              <div style={{ fontSize: 12, color: "#64748B", fontWeight: 800 }}>Leave Type</div>
              <select
                value={filters.type}
                onChange={(e) => setFilters((p) => ({ ...p, type: e.target.value }))}
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
                <option value="ALL">All</option>
                <option value="CASUAL">CASUAL</option>
                <option value="MEDICAL">MEDICAL</option>
                <option value="ANNUAL">ANNUAL</option>
              </select>
            </div>

            <div>
              <div style={{ fontSize: 12, color: "#64748B", fontWeight: 800 }}>From</div>
              <input
                type="date"
                value={filters.from}
                onChange={(e) => setFilters((p) => ({ ...p, from: e.target.value }))}
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
            </div>

            <div>
              <div style={{ fontSize: 12, color: "#64748B", fontWeight: 800 }}>To</div>
              <input
                type="date"
                value={filters.to}
                onChange={(e) => setFilters((p) => ({ ...p, to: e.target.value }))}
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
            </div>
          </div>
        </div>

        {/* Table */}
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
            <div style={{ fontWeight: 900, color: "#0F172A" }}>Requests</div>
            <div style={{ fontSize: 12, color: "#64748B", fontWeight: 800 }}>
              Showing {filtered.length} of {requests.length}
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
              <thead>
                <tr style={{ background: "#F8FAFC", borderTop: "1px solid #E6EAF2" }}>
                  {[
                    "Leave ID",
                    "Employee ID",
                    "Leave Type",
                    "Start Date",
                    "End Date",
                    "Days",
                    "Reason",
                    "Status",
                    "Action",
                  ].map((h) => (
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
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ padding: 18, color: "#64748B", fontWeight: 700 }}>
                      No leave requests found for the selected filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => (
                    <tr key={r.leave_id} style={{ borderBottom: "1px solid #EEF2F7" }}>
                      <td style={{ padding: "12px 14px", fontWeight: 900, color: "#0F172A" }}>
                        {r.leave_id}
                      </td>
                      <td style={{ padding: "12px 14px", fontWeight: 800, color: "#0F172A" }}>
                        {r.employee_id}
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
                            maxWidth: 320,
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
                      <td style={{ padding: "12px 14px" }}>
                        <button
                          onClick={() => openReview(r)}
                          style={{
                            padding: "10px 12px",
                            borderRadius: 12,
                            border: "1px solid #E2E8F0",
                            background: "#FFFFFF",
                            fontWeight: 900,
                            cursor: "pointer",
                          }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Drawer / Review Panel (same look) */}
        <Drawer
          open={drawerOpen}
          onClose={closeReview}
          title={selected ? `Review Leave #${selected.leave_id}` : "Review Leave"}
        >
          {selected ? (
            <>
              <div
                style={{
                  border: "1px solid #E6EAF2",
                  borderRadius: 14,
                  padding: 14,
                  background: "#FFFFFF",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: "#0F172A" }}>
                      Employee ID: {selected.employee_id}
                    </div>
                    <div style={{ fontSize: 12, color: "#64748B", fontWeight: 800, marginTop: 3 }}>
                      Leave ID: {selected.leave_id}
                    </div>
                  </div>
                  <div>
                    <Badge status={selected.status} />
                  </div>
                </div>

                <div style={{ height: 12 }} />

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: 12,
                  }}
                >
                  <Field label="Leave Type" value={selected.leave_type} />
                  <Field label="Total Days" value={daysBetweenInclusive(selected.start_date, selected.end_date)} />
                  <Field label="Start Date" value={fmtDate(selected.start_date)} />
                  <Field label="End Date" value={fmtDate(selected.end_date)} />
                </div>

                <div style={{ marginTop: 10 }}>
                  <div style={{ fontSize: 12, color: "#64748B", fontWeight: 900 }}>Reason</div>
                  <div
                    style={{
                      marginTop: 6,
                      padding: 12,
                      background: "#F8FAFC",
                      border: "1px solid #E2E8F0",
                      borderRadius: 12,
                      fontWeight: 700,
                      color: "#0F172A",
                      lineHeight: 1.5,
                    }}
                  >
                    {selected.reason || "—"}
                  </div>
                </div>
              </div>

              <div style={{ height: 12 }} />

              {/* Remark section (UI only) */}
              <div
                style={{
                  border: "1px solid #E6EAF2",
                  borderRadius: 14,
                  padding: 14,
                  background: "#FFFFFF",
                }}
              >
                <div style={{ fontWeight: 900, color: "#0F172A" }}>Manager Remark </div>
                <div style={{ fontSize: 12, color: "#64748B", fontWeight: 800, marginTop: 6 }}>
                 
                </div>

                <textarea
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="Add a short remark..."
                  rows={4}
                  style={{
                    marginTop: 10,
                    width: "100%",
                    padding: 12,
                    borderRadius: 12,
                    border: "1px solid #E2E8F0",
                    outline: "none",
                    fontWeight: 700,
                    resize: "vertical",
                  }}
                  disabled={selected.status !== "PENDING"}
                />

                <div style={{ height: 10 }} />

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button
                    onClick={() => updateStatus("APPROVED")}
                    disabled={selected.status !== "PENDING"}
                    style={{
                      padding: "12px 14px",
                      borderRadius: 12,
                      border: "1px solid #BBF7D0",
                      background: selected.status !== "PENDING" ? "#E5E7EB" : "#D1FAE5",
                      fontWeight: 900,
                      cursor: selected.status !== "PENDING" ? "not-allowed" : "pointer",
                    }}
                  >
                    Approve
                  </button>

                  <button
                    onClick={() => updateStatus("REJECTED")}
                    disabled={selected.status !== "PENDING"}
                    style={{
                      padding: "12px 14px",
                      borderRadius: 12,
                      border: "1px solid #FECACA",
                      background: selected.status !== "PENDING" ? "#E5E7EB" : "#FEE2E2",
                      fontWeight: 900,
                      cursor: selected.status !== "PENDING" ? "not-allowed" : "pointer",
                    }}
                  >
                    Reject
                  </button>

                  <button
                    onClick={closeReview}
                    style={{
                      marginLeft: "auto",
                      padding: "12px 14px",
                      borderRadius: 12,
                      border: "1px solid #E2E8F0",
                      background: "#FFFFFF",
                      fontWeight: 900,
                      cursor: "pointer",
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </>
          ) : null}
        </Drawer>
      </div>
    </AppLayout>
  );
}
