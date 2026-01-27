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
      background: "rgba(255, 255, 255, 0.9)",
      backdropFilter: "blur(12px)",
      border: "1px solid rgba(255, 255, 255, 0.5)",
      borderRadius: 18,
      padding: 20,
      boxShadow: "0 8px 18px rgba(0,0,0,0.03)",
      minHeight: 100,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center"
    }}
  >
    <div style={{ fontSize: 13, color: "#6b7280", fontWeight: 700, textTransform: "uppercase" }}>{title}</div>
    <div style={{ fontSize: 28, fontWeight: 800, color: "#111827", marginTop: 8, marginBottom: 4 }}>
      {value}
    </div>
    {hint ? <div style={{ fontSize: 13, color: "#6b7280", fontWeight: 500 }}>{hint}</div> : null}
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
      <div style={styles.page}>
        {/* Inline CSS Animations */}
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

        {/* Animated background elements */}
        <div className="floating-circle fc-1"></div>
        <div className="floating-circle fc-2"></div>
        <div className="floating-circle fc-3"></div>

        <div style={styles.container}>
          {/* Header */}
          <div style={styles.headerCard}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 220 }}>
                <div style={styles.pageTitle}>
                  Leave Requests
                </div>
                <div style={styles.pageSubtitle}>
                  Review and respond to employee leave applications
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <button
                  onClick={() => alert("Export will coming soon")}
                  style={styles.secondaryBtn}
                >
                  Export
                </button>

                <button
                  onClick={() => setFilters({ q: "", status: "ALL", type: "ALL", from: "", to: "" })}
                  style={styles.secondaryBtn}
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </div>

          {/* KPI Row */}
          <div style={styles.kpiGrid}>
            <KpiCard title="Pending" value={kpis.pending} hint="Needs your review" />
            <KpiCard title="Approved" value={kpis.approved} hint="All time (UI demo)" />
            <KpiCard title="Rejected" value={kpis.rejected} hint="All time (UI demo)" />
          </div>

          {/* Filters */}
          <div style={styles.filterCard}>
            <div style={styles.filterGrid}>
              <div>
                <div style={styles.label}>Search</div>
                <input
                  value={filters.q}
                  onChange={(e) => setFilters((p) => ({ ...p, q: e.target.value }))}
                  placeholder="Employee ID / Leave ID"
                  style={styles.input}
                />
              </div>

              <div>
                <div style={styles.label}>Status</div>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
                  style={styles.select}
                >
                  <option value="ALL">All</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              <div>
                <div style={styles.label}>Leave Type</div>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters((p) => ({ ...p, type: e.target.value }))}
                  style={styles.select}
                >
                  <option value="ALL">All</option>
                  <option value="CASUAL">CASUAL</option>
                  <option value="MEDICAL">MEDICAL</option>
                  <option value="ANNUAL">ANNUAL</option>
                </select>
              </div>

              <div>
                <div style={styles.label}>From</div>
                <input
                  type="date"
                  value={filters.from}
                  onChange={(e) => setFilters((p) => ({ ...p, from: e.target.value }))}
                  style={styles.input}
                />
              </div>

              <div>
                <div style={styles.label}>To</div>
                <input
                  type="date"
                  value={filters.to}
                  onChange={(e) => setFilters((p) => ({ ...p, to: e.target.value }))}
                  style={styles.input}
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div style={styles.tableCard}>
            <div style={styles.tableHeader}>
              <div style={{ fontWeight: 800, color: "#111827" }}>Requests</div>
              <div style={{ fontSize: 13, color: "#6b7280", fontWeight: 600 }}>
                Showing {filtered.length} of {requests.length}
              </div>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={styles.table}>
                <thead>
                  <tr>
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
                      <th key={h} style={styles.th}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ padding: 20, color: "#6b7280", fontWeight: 600, textAlign: "center" }}>
                        No leave requests found.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((r) => (
                      <tr key={r.leave_id} style={styles.tr}>
                        <td style={styles.tdMono}>
                          {r.leave_id}
                        </td>
                        <td style={styles.tdMono}>
                          {r.employee_id}
                        </td>
                        <td style={styles.td}>
                          {r.leave_type}
                        </td>
                        <td style={styles.td}>
                          {fmtDate(r.start_date)}
                        </td>
                        <td style={styles.td}>
                          {fmtDate(r.end_date)}
                        </td>
                        <td style={styles.td}>
                          {daysBetweenInclusive(r.start_date, r.end_date)}
                        </td>
                        <td style={styles.td}>
                          <div
                            style={{
                              maxWidth: 320,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              color: "#374151",
                            }}
                            title={r.reason || ""}
                          >
                            {r.reason || "—"}
                          </div>
                        </td>
                        <td style={styles.td}>
                          <Badge status={r.status} />
                        </td>
                        <td style={styles.td}>
                          <button
                            onClick={() => openReview(r)}
                            style={styles.secondaryBtnSmall}
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

          {/* Drawer / Review Panel */}
          <Drawer
            open={drawerOpen}
            onClose={closeReview}
            title={selected ? `Review Leave #${selected.leave_id}` : "Review Leave"}
          >
            {selected ? (
              <>
                <div style={styles.drawerCard}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: "#111827" }}>
                        Employee ID: {selected.employee_id}
                      </div>
                      <div style={{ fontSize: 13, color: "#6b7280", fontWeight: 600, marginTop: 4 }}>
                        Leave ID: {selected.leave_id}
                      </div>
                    </div>
                    <div>
                      <Badge status={selected.status} />
                    </div>
                  </div>

                  <div style={{ height: 16 }} />

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <Field label="Leave Type" value={selected.leave_type} />
                    <Field label="Total Days" value={daysBetweenInclusive(selected.start_date, selected.end_date)} />
                    <Field label="Start Date" value={fmtDate(selected.start_date)} />
                    <Field label="End Date" value={fmtDate(selected.end_date)} />
                  </div>

                  <div style={{ marginTop: 16 }}>
                    <div style={styles.label}>Reason</div>
                    <div style={styles.reasonBox}>
                      {selected.reason || "—"}
                    </div>
                  </div>
                </div>

                <div style={{ height: 16 }} />

                <div style={styles.drawerCard}>
                  <div style={styles.sectionTitle}>Manager Remark</div>
                  <textarea
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    placeholder="Add a short remark..."
                    rows={4}
                    style={styles.textarea}
                    disabled={selected.status !== "PENDING"}
                  />

                  <div style={{ height: 16 }} />

                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <button
                      onClick={() => updateStatus("APPROVED")}
                      disabled={selected.status !== "PENDING"}
                      style={{
                        ...styles.approveBtn,
                        opacity: selected.status !== "PENDING" ? 0.5 : 1,
                        cursor: selected.status !== "PENDING" ? "not-allowed" : "pointer"
                      }}
                    >
                      Approve
                    </button>

                    <button
                      onClick={() => updateStatus("REJECTED")}
                      disabled={selected.status !== "PENDING"}
                      style={{
                        ...styles.rejectBtn,
                        opacity: selected.status !== "PENDING" ? 0.5 : 1,
                        cursor: selected.status !== "PENDING" ? "not-allowed" : "pointer"
                      }}
                    >
                      Reject
                    </button>

                    <div style={{ flex: 1 }}></div>

                    <button
                      onClick={closeReview}
                      style={styles.secondaryBtn}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </>
            ) : null}
          </Drawer>
        </div>
      </div>
    </AppLayout>
  );
}

const styles = {
  page: { position: "relative", minHeight: "100%", overflow: "hidden" },
  container: { padding: 24, position: "relative", zIndex: 1, display: "grid", gap: 20 },

  headerCard: {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    borderRadius: 18,
    padding: 24,
    boxShadow: "0 8px 25px rgba(0,0,0,0.03)",
  },
  pageTitle: { fontSize: 24, fontWeight: 800, color: "#2c5530" },
  pageSubtitle: { fontSize: 14, color: "#4b5563", marginTop: 4, opacity: 0.8 },

  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 16,
  },

  filterCard: {
    background: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    borderRadius: 18,
    padding: 20,
    boxShadow: "0 8px 15px rgba(0,0,0,0.02)",
  },
  filterGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 16,
    alignItems: "end",
  },
  label: { fontSize: 12, color: "#6b7280", fontWeight: 700, textTransform: "uppercase", marginBottom: 6 },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    outline: "none",
    fontWeight: 600,
    fontSize: 14,
    background: "#fff",
  },
  select: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    outline: "none",
    fontWeight: 600,
    fontSize: 14,
    background: "#fff",
  },

  tableCard: {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    borderRadius: 18,
    boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
    overflow: "hidden",
  },
  tableHeader: {
    padding: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid rgba(0,0,0,0.05)",
  },
  table: { width: "100%", borderCollapse: "separate", borderSpacing: "0 4px", minWidth: 900, padding: "0 12px 12px" },
  th: {
    textAlign: "left",
    padding: "12px 16px",
    fontSize: 12,
    color: "#6b7280",
    fontWeight: 700,
    textTransform: "uppercase",
  },
  tr: {
    transition: "transform 0.1s",
    background: "transparent",
  },
  td: {
    padding: "12px 16px",
    background: "#f9fafb",
    fontSize: 14,
    color: "#374151",
    verticalAlign: "middle",
    fontWeight: 500,
    firstOfType: { borderRadius: "10px 0 0 10px" },
    lastOfType: { borderRadius: "0 10px 10px 0" }
  },
  tdMono: {
    padding: "12px 16px",
    background: "#f9fafb",
    fontSize: 13,
    color: "#111827",
    fontWeight: 600,
    fontFamily: "monospace",
    firstOfType: { borderRadius: "10px 0 0 10px" }
  },

  // Buttons
  secondaryBtn: {
    padding: "8px 16px",
    borderRadius: 10,
    border: "1px solid #d1d5db",
    background: "#fff",
    color: "#374151",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 13,
  },
  secondaryBtnSmall: {
    padding: "6px 12px",
    borderRadius: 8,
    border: "1px solid #d1d5db",
    background: "#fff",
    color: "#374151",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 12,
  },

  approveBtn: {
    padding: "10px 20px",
    borderRadius: 12,
    border: "none",
    background: "#d1fae5",
    color: "#065f46",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 14,
  },
  rejectBtn: {
    padding: "10px 20px",
    borderRadius: 12,
    border: "none",
    background: "#fee2e2",
    color: "#991b1b",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 14,
  },

  // Drawer
  drawerCard: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    padding: 20,
  },
  sectionTitle: { fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 12, textTransform: "uppercase" },
  reasonBox: {
    padding: 14,
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    fontWeight: 500,
    color: "#334155",
    lineHeight: 1.6,
    fontSize: 14,
  },
  textarea: {
    width: "100%",
    padding: 14,
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    outline: "none",
    fontWeight: 500,
    resize: "vertical",
    fontSize: 14,
    background: "#fff",
  },
};
