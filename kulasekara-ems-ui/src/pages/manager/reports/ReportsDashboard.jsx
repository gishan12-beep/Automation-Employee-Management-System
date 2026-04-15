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
  LayoutDashboard,
  MessageSquare,
  ClipboardCheck,
  UserCheck
} from "lucide-react";

export default function ReportsDashboard() {
  const navigate = useNavigate();

  const reportCategories = [

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
    },
    {
      key: "issues",
      title: "Issue Analysis",
      desc: "Track employee grievances, payroll disputes, and workplace concerns reports.",
      icon: <MessageSquare size={28} />,
      path: "/manager/reports/issues",
      color: "#2c5530"
    },
    {
      key: "leaves",
      title: "Leave Analysis",
      desc: "View organizational leave trends, pending approvals, and historical leave data.",
      icon: <ClipboardCheck size={28} />,
      path: "/manager/reports/leaves",
      color: "#2c5530"
    },
    {
      key: "settlements",
      title: "Final Settlements",
      desc: "Review employees pending final settlement after resignation or termination.",
      icon: <UserCheck size={28} />,
      path: "/manager/reports/settlement",
      color: "#2c5530"
    }
  ];

  return (
    <AppLayout>
      <div style={styles.page}>
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
          .fc-1 { animation: float 20s ease-in-out infinite; background: radial-gradient(circle, rgba(74, 124, 78, 0.08) 0%, transparent 70%); width: 400px; height: 400px; top: -100px; left: -100px; }
          .fc-2 { animation: floatReverse 25s ease-in-out infinite; background: radial-gradient(circle, rgba(74, 124, 78, 0.06) 0%, transparent 70%); width: 350px; height: 350px; bottom: -80px; right: -80px; }
          .fc-3 { animation: float 18s ease-in-out infinite; background: radial-gradient(circle, rgba(74, 124, 78, 0.05) 0%, transparent 70%); width: 250px; height: 250px; top: 20%; right: 10%; }
          
          .fade-in { animation: fadeIn 0.4s ease-out forwards; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          
          .report-card { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important; }
          .report-card:hover { transform: translateY(-8px) scale(1.02); box-shadow: 0 20px 40px rgba(0,0,0,0.06) !important; border-color: rgba(74, 124, 78, 0.3) !important; }
          .report-card:hover .icon-box { background: #ecfdf5 !important; color: #4a7c4e !important; transform: rotate(5deg) scale(1.1); }
          .report-card:hover .arrow-icon { transform: translateX(4px); }
        `}</style>
        
        <div className="floating-circle fc-1"></div>
        <div className="floating-circle fc-2"></div>
        <div className="floating-circle fc-3"></div>

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
  page: { minHeight: "100%", position: "relative", overflow: "hidden" },
  container: { padding: "48px 32px", maxWidth: "1400px", margin: "0 auto", position: "relative", zIndex: 1 },
  breadcrumb: { fontSize: "11px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" },
  pageHeader: { marginBottom: "48px" },
  pageTitle: { margin: 0, fontSize: "42px", fontWeight: 900, color: "#2c5530", letterSpacing: "-0.03em" },
  pageSubtitle: { margin: "8px 0 0 0", fontSize: "16px", color: "#64748b", fontWeight: 500 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "32px" },
  card: { 
    background: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(12px)",
    borderRadius: "32px", 
    padding: "40px", 
    border: "1px solid rgba(255, 255, 255, 0.5)", 
    boxShadow: "0 8px 30px rgba(0,0,0,0.02)", 
    cursor: "pointer", 
    display: "flex", 
    flexDirection: "column", 
    gap: "24px", 
    position: "relative" 
  },
  cardIcon: { 
    width: "70px", 
    height: "70px", 
    borderRadius: "22px", 
    background: "rgba(74, 124, 78, 0.08)", 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center", 
    color: "#4a7c4e", 
    transition: "all 0.4s" 
  },
  cardTitle: { margin: "0 0 8px 0", fontSize: "22px", fontWeight: 900, color: "#1e293b", letterSpacing: "-0.01em" },
  cardDesc: { margin: 0, fontSize: "15px", color: "#64748b", lineHeight: "1.7", fontWeight: 500 },
  cardAction: { fontSize: "14px", fontWeight: 800, color: "#4a7c4e", display: "flex", alignItems: "center", gap: "8px", marginTop: "auto" },
};
