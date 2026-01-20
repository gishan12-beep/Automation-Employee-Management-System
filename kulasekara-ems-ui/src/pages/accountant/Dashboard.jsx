import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../components/layout/AppLayout"; // ✅ ADD THIS
import { getAccountantDashboardSummary } from "../../services/accountantService";
import { formatLKR } from "../../utils/salaryUtils";

export default function AccountantDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    getAccountantDashboardSummary()
      .then((res) => {
        if (mounted) setData(res);
      })
      .catch((e) => {
        console.error(e);
        if (mounted) setError("Failed to load dashboard data.");
      });

    return () => {
      mounted = false;
    };
  }, []);

  const cards = useMemo(() => {
    if (!data?.totals) return [];
    return [
      { label: "Employees", value: data.totals.employees ?? 0, hint: "Active employees" },
      { label: "Total Payroll", value: formatLKR(data.totals.totalPayroll ?? 0), hint: `Month: ${data.month ?? "-"}` },
      { label: "EPF Total", value: formatLKR(data.totals.totalEPF ?? 0), hint: "Employer + Employee EPF" },
      { label: "ETF Total", value: formatLKR(data.totals.totalETF ?? 0), hint: "ETF contribution" },
      { label: "Pending Audits", value: data.totals.pendingAudits ?? 0, hint: "Need review" },
    ];
  }, [data]);

  return (
    <AppLayout>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <h2 style={{ marginTop: 0 }}>Accountant Dashboard</h2>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => navigate("/accountant/payroll-summary")}
              style={btnPrimary}
            >
              Payroll Summary
            </button>

            <button
              type="button"
              onClick={() => navigate("/accountant/epf-etf")}
              style={btnSecondary}
            >
              EPF/ETF Reports
            </button>
          </div>
        </div>

        {error ? (
          <div style={card}>
            <p style={{ margin: 0, color: "#b91c1c", fontWeight: 700 }}>{error}</p>
          </div>
        ) : !data ? (
          <div style={card}>
            <p>Loading dashboard...</p>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div style={gridCards}>
              {cards.map((c) => (
                <div key={c.label} style={statCard}>
                  <p style={statLabel}>{c.label}</p>
                  <p style={statValue}>{c.value}</p>
                  <p style={statHint}>{c.hint}</p>
                </div>
              ))}
            </div>

            {/* Tables */}
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 12, marginTop: 12 }}>
              {/* Recent payroll */}
              <div style={card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ marginTop: 0 }}>Recent Payroll Runs</h3>
                  <button type="button" style={linkBtn} onClick={() => navigate("/accountant/payroll-audit")}>
                    View All
                  </button>
                </div>

                <table style={table}>
                  <thead>
                    <tr style={thead}>
                      <th style={thLeft}>Payroll ID</th>
                      <th style={thLeft}>Period</th>
                      <th style={thLeft}>Status</th>
                      <th style={thRight}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.recentPayroll ?? []).map((r) => (
                      <tr key={r.id} style={tr}>
                        <td style={tdLeft}>{r.id}</td>
                        <td style={tdLeft}>{r.period}</td>
                        <td style={tdLeft}>
                          <StatusPill value={r.status} />
                        </td>
                        <td style={tdRight}>{formatLKR(r.total ?? 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* EPF/ETF due */}
              <div style={card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ marginTop: 0 }}>EPF/ETF Due</h3>
                  <button type="button" style={linkBtn} onClick={() => navigate("/accountant/epf-etf")}>
                    View All
                  </button>
                </div>

                <table style={table}>
                  <thead>
                    <tr style={thead}>
                      <th style={thLeft}>Ref</th>
                      <th style={thLeft}>Due Date</th>
                      <th style={thLeft}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.epfEtfDue ?? []).map((x) => (
                      <tr key={x.ref} style={tr}>
                        <td style={tdLeft}>
                          <div style={{ fontWeight: 700 }}>{x.ref}</div>
                          <div style={{ fontSize: 12, color: "#64748b" }}>
                            EPF {formatLKR(x.epf ?? 0)} | ETF {formatLKR(x.etf ?? 0)}
                          </div>
                        </td>
                        <td style={tdLeft}>{x.dueDate}</td>
                        <td style={tdLeft}>
                          <StatusPill value={x.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick actions */}
            <div style={{ ...card, marginTop: 12 }}>
              <h3 style={{ marginTop: 0 }}>Quick Actions</h3>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                <button type="button" style={quickBtn} onClick={() => navigate("/accountant/payroll-summary")}>
                  Generate Payroll Summary
                </button>
                <button type="button" style={quickBtn} onClick={() => navigate("/accountant/epf-etf")}>
                  Export EPF/ETF Report
                </button>
                <button type="button" style={quickBtn} onClick={() => navigate("/accountant/payroll-audit")}>
                  Review Payroll Audit
                </button>
              </div>

              <p style={{ marginTop: 10, color: "#64748b", fontSize: 12 }}>
                These buttons can connect to accountant features next.
              </p>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}

function StatusPill({ value }) {
  const v = String(value || "").toLowerCase();
  const base = {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    border: "1px solid #ddd",
    background: "#fff",
  };

  if (v === "completed" || v === "paid")
    return <span style={{ ...base, borderColor: "#86efac", background: "#f0fdf4" }}>{value}</span>;
  if (v === "pending")
    return <span style={{ ...base, borderColor: "#fde68a", background: "#fffbeb" }}>{value}</span>;
  return <span style={{ ...base, borderColor: "#cbd5e1", background: "#f8fafc" }}>{value}</span>;
}

// Styles
const card = { background: "#fff", padding: 16, borderRadius: 10 };

const gridCards = {
  display: "grid",
  gridTemplateColumns: "repeat(5, 1fr)",
  gap: 12,
  marginTop: 12,
};

const statCard = {
  background: "#fff",
  padding: 16,
  borderRadius: 10,
  border: "1px solid #eef2f7",
};

const statLabel = { margin: 0, color: "#64748b", fontSize: 12, fontWeight: 700, textTransform: "uppercase" };
const statValue = { margin: "8px 0 4px", fontSize: 18, fontWeight: 800, color: "#0f172a" };
const statHint = { margin: 0, color: "#64748b", fontSize: 12 };

const btnPrimary = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "none",
  background: "#111",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 700,
};

const btnSecondary = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #ddd",
  background: "#fff",
  cursor: "pointer",
  fontWeight: 700,
};

const linkBtn = {
  border: "none",
  background: "transparent",
  color: "#2563eb",
  cursor: "pointer",
  fontWeight: 700,
};

const quickBtn = {
  padding: 12,
  borderRadius: 10,
  border: "1px solid #e2e8f0",
  background: "#fff",
  cursor: "pointer",
  fontWeight: 700,
};

const table = { width: "100%", borderCollapse: "collapse" };
const thead = { background: "#f2f2f2" };
const tr = { borderTop: "1px solid #eee", verticalAlign: "top" };
const thLeft = { textAlign: "left", padding: 10, fontSize: 13 };
const thRight = { textAlign: "right", padding: 10, fontSize: 13 };
const tdLeft = { textAlign: "left", padding: 10, fontSize: 13 };
const tdRight = { textAlign: "right", padding: 10, fontSize: 13 };
