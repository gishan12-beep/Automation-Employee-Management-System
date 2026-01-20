import React, { useEffect, useMemo, useState } from "react";
import AppLayout from "../../../components/layout/AppLayout";
import { getMyFinalSettlementPreview } from "../../../services/payrollService";
import { formatLKR } from "../../../utils/salaryUtils";

export default function FinalSettlement() {
  const [data, setData] = useState(null);

  useEffect(() => {
    getMyFinalSettlementPreview().then(setData);
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
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ marginTop: 0 }}>Final Settlement</h2>

        {!data ? (
          <div style={card}>
            <p>Loading settlement preview...</p>
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
                  <p style={big}>{data.lastWorkingDate}</p>
                  <p style={muted}><b>Settlement Date</b>: {data.settlementDate}</p>
                </div>
              </div>

              <div style={{ marginTop: 12, background: "#f8fafc", border: "1px solid #e2e8f0", padding: 12, borderRadius: 10 }}>
                <p style={{ margin: 0, color: "#475569" }}>{data.notes}</p>
              </div>
            </div>

            {/* Breakdown */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {/* Earnings */}
              <div style={card}>
                <h3 style={{ marginTop: 0 }}>Earnings</h3>
                <Row label="Unpaid Salary" value={formatLKR(data.earnings.unpaidSalary)} />
                <Row label="Overtime" value={formatLKR(data.earnings.overtime)} />
                <Row label="Leave Encashment" value={formatLKR(data.earnings.leaveEncashment)} />
                <Row label="Bonus / Incentive" value={formatLKR(data.earnings.bonus)} />
                <Row label="Other" value={formatLKR(data.earnings.other)} />
                <hr />
                <Row strong label="Total Earnings" value={formatLKR(totals.totalEarnings)} />
              </div>

              {/* Deductions */}
              <div style={card}>
                <h3 style={{ marginTop: 0 }}>Deductions</h3>
                <Row label="Advances" value={formatLKR(data.deductions.advances)} />
                <Row label="Loans" value={formatLKR(data.deductions.loans)} />
                <Row label="EPF/ETF Adjustments" value={formatLKR(data.deductions.epfEtfAdjustments)} />
                <Row label="Other" value={formatLKR(data.deductions.other)} />
                <hr />
                <Row strong label="Total Deductions" value={formatLKR(totals.totalDeductions)} />
              </div>
            </div>

            {/* Net Settlement */}
            <div style={{ ...card, marginTop: 12 }}>
              <h2 style={{ marginTop: 0, textAlign: "right" }}>
                Net Settlement: {formatLKR(totals.netSettlement)}
              </h2>

              <button
                type="button"
                onClick={() => alert("Request settlement confirmation will be added later")}
                style={primaryBtn}
              >
                Request Confirmation
              </button>

              <button
                type="button"
                onClick={() => alert("Download PDF will be added later")}
                style={secondaryBtn}
              >
                Download PDF
              </button>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
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
