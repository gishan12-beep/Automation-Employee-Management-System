import React, { useRef, useState } from "react";

const fmt = (n) =>
  Number(n || 0).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

// Component that renders a detailed payslip preview and provides functionality to download it as a PDF
export default function PayslipPreview({ employee, period, base, overrides, totals }) {
  const slipRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  const incentiveRows = overrides?.incentives || [];
  const deductionRows = overrides?.deductions || [];

  // Captures the payslip HTML element, converts it to an image, and saves it as a PDF file
  const download = async () => {
    setDownloading(true);
    try {
      // Dynamic imports for library bundles to optimize initial page load speed
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      const canvas = await html2canvas(slipRef.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgProps = pdf.getImageProperties(imgData);
      const imgWidth = pageWidth;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

      let position = 0;
      let heightLeft = imgHeight;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Handle multi-page PDF generation if the content exceeds a single A4 page
      while (heightLeft > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Payslip_${employee?.employeeID || employee?.id || "EMP"}_${period?.start}_${period?.end}.pdf`);
    } catch (e) {
      // Fallback: Trigger standard browser print dialog which allows "Save as PDF"
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div>
      <div style={styles.actions}>
        <button style={styles.btnPrimary} onClick={download} disabled={downloading}>
          {downloading ? "Downloading..." : "Download Slip"}
        </button>
      </div>

      <div ref={slipRef} style={styles.slip}>
        <div style={styles.top}>
          <div>
            <div style={styles.brand}>Kulasekara Oil Mills</div>
            <div style={styles.muted}>Payslip (Finalized by Accountant)</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={styles.muted}>Period</div>
            <div style={styles.strong}>
              {period?.start} → {period?.end}
            </div>
          </div>
        </div>

        <div style={styles.line} />

        <div style={styles.infoGrid}>
          <div>
            <div style={styles.muted}>Employee</div>
            <div style={styles.strong}>
              {employee?.name || `${employee?.firstName || ""} ${employee?.lastName || ""}`.trim() || "-"}
            </div>
            <div style={styles.muted}>ID: {employee?.employeeID || employee?.id || "-"}</div>
          </div>

          <div>
            <div style={styles.muted}>Salary Type</div>
            <div style={styles.strong}>{employee?.salaryType || base?.salaryType || "-"}</div>
            <div style={styles.muted}>EPF/ETF: {employee?.epfEtfEligible ? "Eligible" : "Not Eligible"}</div>
          </div>
        </div>

        <div style={styles.line} />

        <div style={styles.grid}>
          <div style={styles.box}>
            <div style={styles.boxTitle}>Earnings</div>
            <table style={styles.table}>
              <tbody>
                <tr>
                  <td>Basic Salary</td>
                  <td style={styles.right}>{fmt(overrides?.basicSalary)}</td>
                </tr>
                <tr>
                  <td>Overtime</td>
                  <td style={styles.right}>{fmt(overrides?.overtime?.amount)}</td>
                </tr>
                <tr>
                  <td>Allowances</td>
                  <td style={styles.right}>{fmt(totals?.allowancesTotal)}</td>
                </tr>

                {incentiveRows.map((i, idx) => (
                  <tr key={idx}>
                    <td>{i.description}</td>
                    <td style={styles.right}>{fmt(i.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={styles.sumRow}>
              <span>Gross Pay</span>
              <span>{fmt(totals?.gross)}</span>
            </div>
          </div>

          <div style={styles.box}>
            <div style={styles.boxTitle}>Deductions</div>
            <table style={styles.table}>
              <tbody>
                <tr>
                  <td>EPF/ETF</td>
                  <td style={styles.right}>{fmt(totals?.epfEtf)}</td>
                </tr>

                {deductionRows.map((d, idx) => (
                  <tr key={idx}>
                    <td>{d.description}</td>
                    <td style={styles.right}>{fmt(d.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={styles.sumRow}>
              <span>Total Deductions</span>
              <span>{fmt(totals?.totalDeductions)}</span>
            </div>
          </div>
        </div>

        <div style={styles.net}>
          <span>Net Pay</span>
          <span>{fmt(totals?.net)}</span>
        </div>

        {overrides?.notes ? (
          <div style={{ marginTop: 12 }}>
            <div style={styles.muted}>Notes</div>
            <div>{overrides.notes}</div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

const styles = {
  actions: { display: "flex", justifyContent: "flex-end", marginBottom: 10 },
  btnPrimary: {
    border: "1px solid #111827",
    background: "#111827",
    color: "#fff",
    borderRadius: 10,
    padding: "10px 12px",
    cursor: "pointer",
    fontWeight: 800,
  },
  slip: {
    background: "#fff",
    border: "1px solid #eaecf0",
    borderRadius: 14,
    padding: 14,
  },
  top: { display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" },
  brand: { fontWeight: 900, fontSize: 16, color: "#0F172A" },
  muted: { color: "#667085" },
  strong: { fontWeight: 800, color: "#0F172A" },
  line: { height: 1, background: "#eaecf0", margin: "12px 0" },
  infoGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  box: { border: "1px solid #eaecf0", borderRadius: 12, padding: 12 },
  boxTitle: { fontWeight: 900, marginBottom: 6, color: "#0F172A" },
  table: { width: "100%", borderCollapse: "collapse" },
  right: { textAlign: "right", fontWeight: 700 },
  sumRow: { display: "flex", justifyContent: "space-between", marginTop: 10, fontWeight: 900 },
  net: {
    marginTop: 12,
    border: "1px dashed #d0d5dd",
    borderRadius: 12,
    padding: 12,
    display: "flex",
    justifyContent: "space-between",
    fontWeight: 900,
  },
};
