import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppLayout from "../../../components/layout/AppLayout";
import { getMySalarySlipById } from "../../../services/payrollService";
import { formatLKR, calcTotals } from "../../../utils/salaryUtils";

export default function SalarySlipView() {
  const { slipId } = useParams();
  const navigate = useNavigate();
  const [slip, setSlip] = useState(null);

  useEffect(() => {
    getMySalarySlipById(slipId).then(setSlip);
  }, [slipId]);

  return (
    <AppLayout>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
          <button
            type="button"
            onClick={() => navigate("/employee/payroll/salary-history")}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid #ddd",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            ← Back to History
          </button>

          <button
            type="button"
            onClick={() => alert("PDF download will be added later")}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "none",
              background: "#111",
              color: "#fff",
              cursor: "pointer",
              marginLeft: "auto",
            }}
          >
            Download PDF
          </button>
        </div>

        {!slip ? (
          <div style={{ background: "#fff", padding: 16, borderRadius: 10 }}>
            <p>Loading salary slip...</p>
          </div>
        ) : (
          <div style={{ background: "#fff", padding: 16, borderRadius: 10 }}>
            <h2 style={{ marginTop: 0, textAlign: "center" }}>Kulasekara Oil Mills</h2>
            <p style={{ textAlign: "center", marginTop: -6, color: "#666" }}>Salary Slip</p>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <div>
                <p><b>Slip ID:</b> {slip.slipId}</p>
                <p><b>Employee:</b> {slip.employeeName} ({slip.employeeId})</p>
                <p><b>Role:</b> {slip.role}</p>
              </div>
              <div>
                <p><b>Period:</b> {slip.periodStart} to {slip.periodEnd}</p>
                <p><b>Paid On:</b> {slip.paidOn}</p>
              </div>
            </div>

            <hr />

            constTotals:

            {(() => {
              const totals = calcTotals(slip);
              return (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <h3>Earnings</h3>
                      <p>Basic Salary: {formatLKR(slip.earnings.basic)}</p>
                      <p>Overtime: {formatLKR(slip.earnings.overtime)}</p>
                      <p>Incentives: {formatLKR(slip.earnings.incentives)}</p>
                      <p>Allowances: {formatLKR(slip.earnings.allowances)}</p>
                      <hr />
                      <p><b>Total Earnings:</b> {formatLKR(totals.totalEarnings)}</p>
                    </div>

                    <div>
                      <h3>Deductions</h3>
                      <p>EPF: {formatLKR(slip.deductions.epf)}</p>
                      <p>ETF: {formatLKR(slip.deductions.etf)}</p>
                      <p>Other: {formatLKR(slip.deductions.other)}</p>
                      <hr />
                      <p><b>Total Deductions:</b> {formatLKR(totals.totalDeductions)}</p>
                    </div>
                  </div>

                  <hr />
                  <h2 style={{ textAlign: "right" }}>Net Pay: {formatLKR(totals.netPay)}</h2>
                </>
              );
            })()}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
