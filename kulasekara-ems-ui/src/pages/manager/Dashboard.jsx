import React, { useState } from "react";
import AppLayout from "../../components/layout/AppLayout";

function Dashboard() {
  const [hoveredCard, setHoveredCard] = useState(null);

  return (
    <>
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
        
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.5s ease-out; }
      `}</style>

      <AppLayout>
        <div style={styles.page}>
          <div className="floating-circle fc-1"></div>
          <div className="floating-circle fc-2"></div>
          <div className="floating-circle fc-3"></div>

          <div style={styles.container}>
            {/* Page Header */}
            <div style={styles.pageHeader}>
              <div>
                <h1 style={styles.pageTitle}>Manager Dashboard</h1>
                <p style={styles.pageSubtitle}>Overview of your team and operations</p>
              </div>

              <div style={styles.headerActions}>
                <div style={styles.dateBadge}>
                  <svg style={styles.dateIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="16" y1="2" x2="16" y2="6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="8" y1="2" x2="8" y2="6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="3" y1="10" x2="21" y2="10" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div style={styles.cardGrid}>
              <div
                className="card-1"
                style={{
                  ...styles.summaryCard,
                  ...(hoveredCard === 1 ? styles.summaryCardHover : {}),
                }}
                onMouseEnter={() => setHoveredCard(1)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div style={{ ...styles.iconBox, background: "linear-gradient(135deg, #4a7c4e 0%, #5a8c5e 100%)" }}>
                  <svg style={styles.cardIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div style={styles.cardText}>
                  <p style={styles.cardLabel}>Total Employees</p>
                  <p style={styles.cardValue}>55</p>
                  <p style={styles.cardHint}>Active members</p>
                </div>
              </div>

              <div
                className="card-2"
                style={{
                  ...styles.summaryCard,
                  ...(hoveredCard === 2 ? styles.summaryCardHover : {}),
                }}
                onMouseEnter={() => setHoveredCard(2)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div style={{ ...styles.iconBox, background: "linear-gradient(135deg, #5a8c5e 0%, #81c784 100%)" }}>
                  <svg style={styles.cardIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div style={styles.cardText}>
                  <p style={styles.cardLabel}>Attendance Today</p>
                  <p style={styles.cardValue}>40</p>
                  <p style={styles.cardHint}>72% present</p>
                </div>
              </div>

              <div
                className="card-3"
                style={{
                  ...styles.summaryCard,
                  ...(hoveredCard === 3 ? styles.summaryCardHover : {}),
                }}
                onMouseEnter={() => setHoveredCard(3)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div style={{ ...styles.iconBox, background: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)" }}>
                  <svg style={styles.cardIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div style={styles.cardText}>
                  <p style={styles.cardLabel}>Payroll Pending</p>
                  <p style={styles.cardValue}>5</p>
                  <p style={styles.cardHint}>Awaiting approval</p>
                </div>
              </div>

              <div
                className="card-4"
                style={{
                  ...styles.summaryCard,
                  ...(hoveredCard === 4 ? styles.summaryCardHover : {}),
                }}
                onMouseEnter={() => setHoveredCard(4)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div style={{ ...styles.iconBox, background: "linear-gradient(135deg, #ef4444 0%, #f87171 100%)" }}>
                  <svg style={styles.cardIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div style={styles.cardText}>
                  <p style={styles.cardLabel}>Issues Reported</p>
                  <p style={styles.cardValue}>3</p>
                  <p style={styles.cardHint}>Needs attention</p>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div style={styles.sectionGrid}>
              <div className="fade-in" style={styles.panel}>
                <div style={styles.panelHeader}>
                  <div style={styles.panelTitleSection}>
                    <svg style={styles.panelIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <h3 style={styles.panelTitle}>Payroll Summary</h3>
                  </div>
                  <span style={styles.pill}>This Month</span>
                </div>

                <div style={styles.chartArea}>
                  <svg style={styles.chartPlaceholder} viewBox="0 0 200 120" fill="none">
                    <rect x="20" y="90" width="20" height="20" rx="4" fill="#4a7c4e" opacity="0.6" />
                    <rect x="50" y="70" width="20" height="40" rx="4" fill="#4a7c4e" opacity="0.7" />
                    <rect x="80" y="50" width="20" height="60" rx="4" fill="#4a7c4e" opacity="0.8" />
                    <rect x="110" y="40" width="20" height="70" rx="4" fill="#4a7c4e" opacity="0.9" />
                    <rect x="140" y="60" width="20" height="50" rx="4" fill="#4a7c4e" opacity="0.8" />
                    <rect x="170" y="75" width="20" height="35" rx="4" fill="#4a7c4e" opacity="0.7" />

                    <line x1="10" y1="110" x2="200" y2="110" stroke="#d1d5db" strokeWidth="1" />
                    <line x1="10" y1="30" x2="10" y2="110" stroke="#d1d5db" strokeWidth="1" />
                  </svg>
                  <p style={styles.chartLabel}>Monthly payroll distribution</p>
                </div>
              </div>

              <div className="fade-in" style={styles.panel}>
                <div style={styles.panelHeader}>
                  <div style={styles.panelTitleSection}>
                    <svg style={styles.panelIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                    <h3 style={styles.panelTitle}>Attendance Trends</h3>
                  </div>
                  <span style={styles.pillBlue}>Last 30 Days</span>
                </div>

                <div style={styles.chartArea}>
                  <svg style={styles.chartPlaceholder} viewBox="0 0 200 120" fill="none">
                    <path
                      d="M 10 90 Q 30 85, 40 80 T 70 70 T 100 60 T 130 65 T 160 70 T 190 75"
                      stroke="#5a8c5e"
                      strokeWidth="3"
                      fill="none"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 10 90 Q 30 85, 40 80 T 70 70 T 100 60 T 130 65 T 160 70 T 190 75 L 190 110 L 10 110 Z"
                      fill="url(#gradient)"
                      opacity="0.2"
                    />

                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#5a8c5e" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#5a8c5e" stopOpacity="0" />
                      </linearGradient>
                    </defs>

                    <line x1="10" y1="110" x2="200" y2="110" stroke="#d1d5db" strokeWidth="1" />
                    <line x1="10" y1="30" x2="10" y2="110" stroke="#d1d5db" strokeWidth="1" />
                  </svg>
                  <p style={styles.chartLabel}>Daily attendance percentage</p>
                </div>
              </div>
            </div>

            {/* Quick Actions Section */}
            {/* Quick Actions Section */}
            <div className="fade-in" style={styles.quickActionsPanel}>
              <div style={styles.panelHeader}>
                <div style={styles.panelTitleSection}>
                  <svg style={styles.panelIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <h3 style={styles.panelTitle}>Quick Actions</h3>
                </div>
              </div>

              <div style={styles.quickActionsGrid}>
                <button style={styles.actionButton}>
                  <svg style={styles.actionIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  <span style={styles.actionText}>Add Employee</span>
                </button>

                <button style={styles.actionButton}>
                  <svg style={styles.actionIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  <span style={styles.actionText}>Mark Attendance</span>
                </button>

                <button style={styles.actionButton}>
                  <svg style={styles.actionIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span style={styles.actionText}>Process Payroll</span>
                </button>

                <button style={styles.actionButton}>
                  <svg style={styles.actionIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span style={styles.actionText}>Generate Report</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    </>
  );
}

export default Dashboard;

const styles = {
  page: { position: "relative", minHeight: "100%", overflow: "hidden" },
  container: { padding: 24, position: "relative", zIndex: 1 },

  pageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    marginBottom: 24,
  },
  pageTitle: {
    margin: 0,
    fontSize: 28,
    fontWeight: 800,
    color: "#2c5530",
  },
  pageSubtitle: {
    margin: "4px 0 0 0",
    fontSize: 14,
    color: "#4b5563",
    opacity: 0.8
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  dateBadge: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 16px",
    background: "rgba(255, 255, 255, 0.6)",
    backdropFilter: "blur(4px)",
    border: "1px solid rgba(74, 124, 78, 0.2)",
    borderRadius: 20,
    color: "#2c5530",
    fontSize: 13,
    fontWeight: 700,
  },
  dateIcon: {
    width: 16,
    height: 16,
    color: "#4a7c4e"
  },

  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 20,
    marginTop: 20,
  },
  summaryCard: {
    background: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    borderRadius: 18,
    padding: 24,
    boxShadow: "0 8px 25px rgba(0,0,0,0.03)",
    display: "flex",
    alignItems: "center",
    gap: 18,
    transition: "transform 0.2s, box-shadow 0.2s",
    cursor: "pointer",
  },
  summaryCardHover: {
    transform: "translateY(-4px)",
    boxShadow: "0 12px 32px rgba(0,0,0,0.08)",
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
    color: "#fff"
  },
  cardIcon: {
    width: 28,
    height: 28,
    color: "inherit"
  },
  cardText: {
    display: "flex",
    flexDirection: "column",
  },
  cardLabel: {
    margin: 0,
    fontSize: 12,
    fontWeight: 700,
    color: "#6b7280",
    textTransform: "uppercase",
  },
  cardValue: {
    margin: "6px 0 4px",
    fontSize: 28,
    fontWeight: 800,
    color: "#111827",
  },
  cardHint: {
    margin: 0,
    fontSize: 13,
    fontWeight: 500,
    color: "#6b7280",
  },

  sectionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
    gap: 20,
    marginTop: 24,
  },
  panel: {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    borderRadius: 18,
    padding: 24,
    boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 16,
    borderBottom: "1px solid rgba(0,0,0,0.05)",
    marginBottom: 20,
  },
  panelTitleSection: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  panelIcon: {
    width: 20,
    height: 20,
    color: "#4a7c4e",
    opacity: 0.8
  },
  panelTitle: {
    margin: 0,
    fontSize: 16,
    fontWeight: 800,
    color: "#111827",
  },
  pill: {
    padding: "6px 12px",
    borderRadius: 20,
    background: "rgba(74, 124, 78, 0.1)",
    color: "#2c5530",
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase"
  },
  pillBlue: {
    padding: "6px 12px",
    borderRadius: 20,
    background: "rgba(37, 99, 235, 0.1)",
    color: "#1d4ed8",
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase"
  },
  chartArea: {
    minHeight: 200,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  chartPlaceholder: {
    width: "100%",
    maxWidth: "280px",
    height: "auto",
    marginBottom: 16,
    opacity: 0.9
  },
  chartLabel: {
    margin: 0,
    color: "#9ca3af",
    fontSize: 13,
    fontWeight: 500,
    textAlign: "center",
  },

  quickActionsPanel: {
    marginTop: 24,
    background: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    borderRadius: 18,
    padding: 24,
    boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
  },
  quickActionsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 16,
  },
  actionButton: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
    padding: "20px",
    background: "#fff",
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: 16,
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 4px 6px rgba(0,0,0,0.01)",
  },
  actionIcon: {
    width: 28,
    height: 28,
    color: "#4a7c4e",
    marginBottom: 4
  },
  actionText: {
    fontSize: 13,
    fontWeight: 700,
    color: "#374151",
  },
};