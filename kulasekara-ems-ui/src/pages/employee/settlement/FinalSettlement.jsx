import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../../components/layout/AppLayout";
import { getMyFinalSettlementPreview } from "../../../services/payrollService";
import { formatLKR } from "../../../utils/salaryUtils";

export default function FinalSettlement() {
  const [data, setData] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchSettlement = async () => {
    setLoading(true);
    try {
      const res = await getMyFinalSettlementPreview();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettlement();
  }, []);

  const totals = useMemo(() => {
    if (!data) return null;

    const e = data.earnings || {};
    const d = data.deductions || {};

    const totalEarnings =
      (e.unpaidSalary || 0) +
      (e.overtime || 0) +
      (e.leaveEncashment || 0) +
      (e.bonus || 0) +
      (e.other || 0);

    const totalDeductions =
      (d.advances || 0) +
      (d.loans || 0) +
      (d.epfEtfAdjustments || 0) +
      (d.other || 0);

    return {
      totalEarnings,
      totalDeductions,
      netSettlement: totalEarnings - totalDeductions,
    };
  }, [data]);

  return (
    <AppLayout>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ margin: 0 }}>Final Settlement</h2>
          <button 
            style={{ ...secondaryBtn, width: "auto", marginTop: 0 }} 
            onClick={() => navigate("/employee/dashboard")}
          >
            Back to Dashboard
          </button>
        </div>

        {loading ? (
          <div style={card}>
            <p>Loading settlement preview...</p>
          </div>
        ) : !data ? (
          <div style={{ ...card, textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>📄</div>
            <h3>No Settlement Record Found</h3>
            <p style={muted}>
              You do not have a finalized settlement record at this moment. 
              If you have resigned or been terminated, your settlement will be processed by the HR/Accounts department soon.
            </p>
            <button 
              style={{ ...secondaryBtn, width: "auto", padding: "10px 20px", marginTop: 20 }} 
              onClick={fetchSettlement}
            >
              Refresh Status
            </button>
          </div>
        ) : (
          <>
            {/* Header Summary */}
            <div style={{ ...card, marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <p style={muted}><b>Employee</b></p>
                  <p style={big}>{data.employeeName} ({data.employeeId})</p>
                  <p style={muted}>{data.designation}</p>
                </div>

                <div style={{ textAlign: "right" }}>
                  <p style={muted}><b>Last Working Date</b></p>
                  <p style={big}>{new Date(data.lastWorkingDate).toLocaleDateString()}</p>
                  <p style={muted}><b>Settlement Date</b>: {new Date(data.settlementDate).toLocaleDateString()}</p>
                  <p style={{ ...muted, color: data.status === 'PAID' ? '#16a34a' : '#ea580c', fontWeight: 800 }}>
                    Status: {data.status}
                  </p>
                </div>
              </div>

              {data.notes && (
                <div style={{ marginTop: 12, background: "#f8fafc", border: "1px solid #e2e8f0", padding: 12, borderRadius: 10 }}>
                  <p style={{ margin: 0, color: "#475569", fontSize: 13 }}>{data.notes}</p>
                </div>
              )}
            </div>

            {/* Breakdown */}
            <div style={{ display: "grid", gridTemplateColumns: isCompact() ? "1fr" : "1fr 1fr", gap: 12 }}>
              {/* Earnings */}
              <div style={card}>
                <h3 style={{ marginTop: 0, fontSize: 16 }}>Earnings</h3>
                <Row label="Unpaid Salary" value={formatLKR(data.earnings.unpaidSalary)} />
                <Row label="Overtime" value={formatLKR(data.earnings.overtime)} />
                <Row label="Leave Encashment" value={formatLKR(data.earnings.leaveEncashment)} />
                <Row label="Bonus / Gratuity" value={formatLKR(data.earnings.bonus)} />
                <Row label="Other" value={formatLKR(data.earnings.other)} />
                <hr style={{ opacity: 0.1 }} />
                <Row strong label="Total Earnings" value={formatLKR(totals.totalEarnings)} />
              </div>

              {/* Deductions */}
              <div style={card}>
                <h3 style={{ marginTop: 0, fontSize: 16 }}>Deductions</h3>
                <Row label="Advances" value={formatLKR(data.deductions.advances)} />
                <Row label="Loans" value={formatLKR(data.deductions.loans)} />
                <Row label="EPF/ETF Adjustments" value={formatLKR(data.deductions.epfEtfAdjustments)} />
                <Row label="Other Deductions" value={formatLKR(data.deductions.other)} />
                <hr style={{ opacity: 0.1 }} />
                <Row strong label="Total Deductions" value={formatLKR(totals.totalDeductions)} />
              </div>
            </div>

            {/* Net Settlement */}
            <div style={{ ...card, marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0 }}>
                Net Settlement: {formatLKR(data.netSettlement || totals.netSettlement)}
              </h2>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => alert("PDF Feature coming soon")}
                  style={{ ...secondaryBtn, width: "auto", marginTop: 0 }}
                >
                  Download PDF
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}

function isCompact() {
    return window.innerWidth < 800;
}

function Row({ label, value, strong }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
      <span style={{ fontWeight: strong ? 700 : 500, color: "#0f172a" }}>{label}</span>
      <span style={{ fontWeight: strong ? 700 : 600, color: "#0f172a" }}>{value}</span>
    </div>
  );
}

const card = {
  background: "#fff",
  padding: 16,
  borderRadius: 10,
};

const muted = { margin: 0, color: "#64748b" };
const big = { margin: "4px 0", fontSize: 18, fontWeight: 700, color: "#0f172a" };

const primaryBtn = {
  width: "100%",
  marginTop: 10,
  padding: 12,
  borderRadius: 10,
  border: "none",
  background: "#111",
  color: "#fff",
  cursor: "pointer",
};

const secondaryBtn = {
  width: "100%",
  marginTop: 10,
  padding: 12,
  borderRadius: 10,
  border: "1px solid #ddd",
  background: "#fff",
  cursor: "pointer",
};
