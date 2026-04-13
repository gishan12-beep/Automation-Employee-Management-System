// src/pages/manager/reports/ReportsDashboard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../../components/layout/AppLayout";
import { 
  FileText, 
  DollarSign, 
  Users, 
  Calendar, 
  ArrowRight, 
  PieChart, 
  ClipboardList, 
  ShieldCheck,
  LayoutDashboard
} from "lucide-react";

export default function ReportsDashboard() {
  const navigate = useNavigate();

  const reportCategories = [
    {
      key: "cash",
      title: "Cash & Coin Reports",
      desc: "Manage cash payouts, withdrawals, and track audit trails for physical currency transactions.",
      icon: <DollarSign size={28} />,
      path: "/manager/reports/cash",
      color: "#2c5530"
    },
    {
      key: "payroll",
      title: "Payroll Summaries",
      desc: "View monthly payroll allocations, employee-wise salary breakdown, and incentive reports.",
      icon: <FileText size={28} />,
      path: "/manager/reports/payroll",
      color: "#2c5530"
    },
    {
      key: "attendance",
      title: "Attendance Insights",
      desc: "Analyze employee attendance trends, late arrivals, and daily work output metrics.",
      icon: <Calendar size={28} />,
      path: "/manager/reports/attendance",
      color: "#2c5530"
    },
    {
      key: "epf",
      title: "EPF & ETF Compliance",
      desc: "Review statutory contribution reports and download data for compliance filing.",
      icon: <ShieldCheck size={28} />,
      path: "/manager/reports/epf",
      color: "#2c5530"
    }
  ];

  return (
    <AppLayout>
      <div style={styles.page}>
        <style>{`
          .fade-in { animation: fadeIn 0.4s ease-out forwards; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          .report-card:hover { transform: translateY(-4px); box-shadow: 0 12px 30px rgba(0,0,0,0.06) !important; border-color: #2c5530 !important; }
          .report-card:hover .icon-box { background: #ecfdf5 !important; color: #059669 !important; }
        `}</style>

        <div style={styles.container}>
          <div style={styles.pageHeader}>
             <div style={styles.breadcrumb}>Manager / Insights & Analytics</div>
             <h1 style={styles.pageTitle}>Reports Dashboard</h1>
             <p style={styles.pageSubtitle}>Select a category to view detailed analytics and download reports</p>
          </div>

          <div style={styles.grid}>
            {reportCategories.map((cat, idx) => (
              <div 
                key={cat.key} 
                style={{ ...styles.card, animationDelay: `${idx * 0.1}s` }} 
                className="fade-in report-card"
                onClick={() => navigate(cat.path)}
              >
                <div style={styles.cardIcon} className="icon-box">
                  {cat.icon}
                </div>
                <div>
                  <h3 style={styles.cardTitle}>{cat.title}</h3>
                  <p style={styles.cardDesc}>{cat.desc}</p>
                </div>
                <div style={styles.cardAction}>
                  Explore Reports <ArrowRight size={16} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

const styles = {
  page: { minHeight: "100%", background: "#f8fafc" },
  container: { padding: "32px", maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 },
  breadcrumb: { fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" },
  pageHeader: { marginBottom: "40px" },
  pageTitle: { margin: 0, fontSize: "32px", fontWeight: 900, color: "#1e293b", letterSpacing: "-0.02em" },
  pageSubtitle: { margin: "4px 0 0 0", fontSize: "15px", color: "#64748b", fontWeight: 500 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" },
  card: { background: "#fff", borderRadius: "24px", padding: "32px", border: "1px solid #f1f5f9", boxShadow: "0 4px 20px rgba(0,0,0,0.02)", cursor: "pointer", transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)", display: "flex", flexDirection: "column", gap: "20px", position: "relative" },
  cardIcon: { width: "60px", height: "60px", borderRadius: "18px", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", color: "#2c5530", transition: "all 0.3s" },
  cardTitle: { margin: "0 0 8px 0", fontSize: "20px", fontWeight: 800, color: "#1e293b", letterSpacing: "-0.01em" },
  cardDesc: { margin: 0, fontSize: "14px", color: "#64748b", lineHeight: "1.6", fontWeight: 500 },
  cardAction: { fontSize: "14px", fontWeight: 800, color: "#2c5530", display: "flex", alignItems: "center", gap: "8px", marginTop: "auto" },
};
