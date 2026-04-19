import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyBookings } from "../../api/bookingApi";
import { getMyTickets } from "../../api/ticketApi";
import { getAllResources } from "../../api/resourceApi";
import { generateUserReportPdf } from "../../utils/userReportPdf";

export default function UserDashboard() {
  const navigate = useNavigate();
  const name = localStorage.getItem("name") || "User";
  const userId = localStorage.getItem("userId");

  const [bookings, setBookings] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);

        const [bookingsRes, ticketsRes, resourcesRes] = await Promise.all([
          userId ? getMyBookings(userId) : Promise.resolve({ data: [] }),
          getMyTickets(),
          getAllResources(),
        ]);

        setBookings(Array.isArray(bookingsRes.data) ? bookingsRes.data : []);
        setTickets(Array.isArray(ticketsRes.data) ? ticketsRes.data : []);
        setResources(Array.isArray(resourcesRes.data) ? resourcesRes.data : []);
      } catch (error) {
        console.error("Failed to load user dashboard data:", error);
        setBookings([]);
        setTickets([]);
        setResources([]);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [userId]);

  const resourceMap = useMemo(() => {
    const map = {};
    resources.forEach((r) => {
      map[r.id] = r;
    });
    return map;
  }, [resources]);

  const analytics = useMemo(() => {
    const totalBookings = bookings.length;
    const pendingBookings = bookings.filter((b) => b.status === "PENDING").length;
    const approvedBookings = bookings.filter((b) => b.status === "APPROVED").length;
    const rejectedBookings = bookings.filter((b) => b.status === "REJECTED").length;

    const totalTickets = tickets.length;
    const openTickets = tickets.filter((t) => t.status === "OPEN").length;
    const inProgressTickets = tickets.filter(
      (t) => t.status === "IN_PROGRESS"
    ).length;
    const resolvedTickets = tickets.filter((t) => t.status === "RESOLVED").length;

    const recentBookings = [...bookings]
      .sort((a, b) => {
        const aTime = new Date(a.createdAt || a.date || 0).getTime();
        const bTime = new Date(b.createdAt || b.date || 0).getTime();
        return bTime - aTime;
      })
      .slice(0, 4);

    const recentTickets = [...tickets]
      .sort((a, b) => {
        const aTime = new Date(a.createdAt || 0).getTime();
        const bTime = new Date(b.createdAt || 0).getTime();
        return bTime - aTime;
      })
      .slice(0, 4);

    return {
      totalBookings,
      pendingBookings,
      approvedBookings,
      rejectedBookings,
      totalTickets,
      openTickets,
      inProgressTickets,
      resolvedTickets,
      recentBookings,
      recentTickets,
    };
  }, [bookings, tickets]);

  const shellStyle = {
    minHeight: "100vh",
    background:
      "linear-gradient(180deg, #f8fafc 0%, #f8fafc 58%, #eef2f7 100%)",
    paddingBottom: "90px",
  };

  const heroStyle = {
    position: "relative",
    overflow: "hidden",
    background:
      "linear-gradient(135deg, #0f172a 0%, #1e3a5f 45%, #4b6584 100%)",
    padding: "42px 2rem 96px",
    boxShadow: "inset 0 -1px 0 rgba(255,255,255,0.08)",
  };

  const containerStyle = {
    maxWidth: "1200px",
    margin: "0 auto",
  };

  const cardStyle = {
    background: "rgba(255,255,255,0.92)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: "1px solid rgba(15, 23, 42, 0.07)",
    borderRadius: "28px",
    boxShadow: "0 18px 45px rgba(15, 23, 42, 0.06)",
  };

  const floatingCardStyle = {
    ...cardStyle,
    animation: "floatCard 4.8s ease-in-out infinite",
  };

  const sectionTitleStyle = {
    fontSize: "22px",
    fontWeight: 800,
    color: "#0f172a",
    marginBottom: "18px",
    letterSpacing: "-0.4px",
  };

  const quickButtonStyle = {
    background: "#fff",
    color: "#0f172a",
    border: "1px solid rgba(15,23,42,0.08)",
    padding: "14px 18px",
    borderRadius: "16px",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.22s ease",
  };

  const bookingStatusBadgeStyle = (status) => {
    const styles = {
      PENDING: { bg: "#fef3c7", color: "#92400e" },
      APPROVED: { bg: "#dcfce7", color: "#166534" },
      REJECTED: { bg: "#fee2e2", color: "#991b1b" },
      CANCELLED: { bg: "#f1f5f9", color: "#475569" },
    };

    const style = styles[status] || styles.CANCELLED;

    return {
      background: style.bg,
      color: style.color,
      borderRadius: "999px",
      padding: "6px 12px",
      fontSize: "11px",
      fontWeight: 700,
      whiteSpace: "nowrap",
    };
  };

  const ticketStatusBadgeStyle = (status) => {
    const styles = {
      OPEN: { bg: "#fee2e2", color: "#991b1b" },
      IN_PROGRESS: { bg: "#fef3c7", color: "#92400e" },
      RESOLVED: { bg: "#dcfce7", color: "#166534" },
      CLOSED: { bg: "#e2e8f0", color: "#334155" },
      REJECTED: { bg: "#f1f5f9", color: "#475569" },
    };

    const style = styles[status] || styles.CLOSED;

    return {
      background: style.bg,
      color: style.color,
      borderRadius: "999px",
      padding: "6px 12px",
      fontSize: "11px",
      fontWeight: 700,
      whiteSpace: "nowrap",
    };
  };

  const summaryCards = [
    {
      label: "My Bookings",
      value: analytics.totalBookings,
      sub: "All submitted requests",
      accent: "rgba(59,130,246,0.12)",
    },
    {
      label: "Pending",
      value: analytics.pendingBookings,
      sub: "Waiting for approval",
      accent: "rgba(245,158,11,0.14)",
    },
    {
      label: "Open Incidents",
      value: analytics.openTickets,
      sub: "Need follow-up",
      accent: "rgba(239,68,68,0.12)",
    },
    {
      label: "Resolved",
      value: analytics.resolvedTickets,
      sub: "Completed issues",
      accent: "rgba(16,185,129,0.12)",
    },
  ];

  if (loading) {
    return (
      <div style={{ ...shellStyle, paddingTop: "120px" }}>
        <div style={{ ...containerStyle, padding: "0 2rem" }}>
          <div style={{ ...cardStyle, padding: "50px", textAlign: "center" }}>
            Loading your dashboard...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={shellStyle}>
      <style>{`
        @keyframes floatCard {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
          100% { transform: translateY(0px); }
        }

        @keyframes glowPulse {
          0% { opacity: 0.28; transform: scale(1); }
          50% { opacity: 0.42; transform: scale(1.05); }
          100% { opacity: 0.28; transform: scale(1); }
        }
      `}</style>

      <section style={heroStyle}>
        <div
          style={{
            position: "absolute",
            top: "-90px",
            right: "-60px",
            width: "320px",
            height: "320px",
            borderRadius: "50%",
            background: "rgba(244,180,0,0.10)",
            filter: "blur(70px)",
            animation: "glowPulse 6s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-120px",
            left: "-70px",
            width: "280px",
            height: "280px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
            filter: "blur(70px)",
            animation: "glowPulse 7s ease-in-out infinite",
          }}
        />

        <div style={containerStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "20px",
              flexWrap: "wrap",
              position: "relative",
              zIndex: 2,
            }}
          >
            <div style={{ maxWidth: "760px" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "8px 16px",
                  borderRadius: "999px",
                  background: "rgba(255,255,255,0.10)",
                  color: "#ffffff",
                  fontSize: "12px",
                  fontWeight: 800,
                  letterSpacing: "0.7px",
                  marginBottom: "18px",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "var(--primary)",
                    display: "inline-block",
                  }}
                />
                USER DASHBOARD
              </div>

              <h1
                style={{
                  fontSize: "42px",
                  lineHeight: 1.06,
                  fontWeight: 900,
                  color: "#ffffff",
                  letterSpacing: "-1.2px",
                  marginBottom: "14px",
                }}
              >
                Welcome back, {name}
              </h1>

              <p
                style={{
                  color: "rgba(255,255,255,0.82)",
                  fontSize: "17px",
                  lineHeight: 1.9,
                  margin: 0,
                  maxWidth: "720px",
                }}
              >
                Track your bookings, follow incident updates, and manage your
                campus activity from one clean workspace.
              </p>
            </div>

           
              <button
              onClick={() => generateUserReportPdf(analytics)}
              style={quickButtonStyle}
            >
             Download Report
            </button>
        
            
          </div>
        </div>
      </section>

      <section
        style={{
          ...containerStyle,
          padding: "0 2rem",
          marginTop: "-42px",
          position: "relative",
          zIndex: 3,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "20px",
            marginBottom: "28px",
          }}
        >
          {summaryCards.map((card, index) => (
            <div
              key={card.label}
              style={{
                ...floatingCardStyle,
                padding: "24px",
                position: "relative",
                overflow: "hidden",
                animationDelay: `${index * 0.2}s`,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "-28px",
                  right: "-28px",
                  width: "120px",
                  height: "120px",
                  borderRadius: "50%",
                  background: card.accent,
                }}
              />

              <div style={{ position: "relative", zIndex: 1 }}>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                    marginBottom: "10px",
                  }}
                >
                  {card.label}
                </div>

                <div
                  style={{
                    fontSize: "34px",
                    fontWeight: 800,
                    color: "#0f172a",
                    letterSpacing: "-0.8px",
                    marginBottom: "6px",
                  }}
                >
                  {card.value}
                </div>

                <div
                  style={{
                    fontSize: "14px",
                    color: "#64748b",
                  }}
                >
                  {card.sub}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 0.9fr",
            gap: "24px",
          }}
        >
          <div style={{ ...cardStyle, padding: "28px" }}>
            <div style={sectionTitleStyle}>Recent Bookings</div>

            {analytics.recentBookings.length === 0 ? (
              <div style={{ color: "#64748b", fontSize: "14px" }}>
                You have not made any bookings yet.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {analytics.recentBookings.map((booking) => {
                  const resource = resourceMap[booking.resourceId];
                  const displayName =
                    resource?.name || booking.resourceName || "Unknown Resource";

                  return (
                    <div
                      key={booking.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: "16px",
                        padding: "16px 18px",
                        borderRadius: "18px",
                        background: "#f8fafc",
                        border: "1px solid rgba(15,23,42,0.06)",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: "15px",
                            fontWeight: 700,
                            color: "#0f172a",
                            marginBottom: "6px",
                          }}
                        >
                          {displayName}
                        </div>
                        {resource?.location && (
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#94a3b8",
                              marginBottom: "4px",
                            }}
                          >
                            {resource.location}
                          </div>
                        )}
                        <div
                          style={{
                            fontSize: "13px",
                            color: "#64748b",
                            lineHeight: 1.7,
                          }}
                        >
                          {booking.date} · {String(booking.startTime).slice(0, 5)} -{" "}
                          {String(booking.endTime).slice(0, 5)}
                        </div>
                        <div
                          style={{
                            fontSize: "13px",
                            color: "#64748b",
                            marginTop: "4px",
                          }}
                        >
                          {booking.purpose}
                        </div>
                      </div>

                      <span style={bookingStatusBadgeStyle(booking.status)}>
                        {booking.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ ...cardStyle, padding: "28px" }}>
            <div style={sectionTitleStyle}>Recent Incidents</div>

            {analytics.recentTickets.length === 0 ? (
              <div style={{ color: "#64748b", fontSize: "14px" }}>
                You have not reported any incidents yet.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {analytics.recentTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "16px",
                      padding: "16px 18px",
                      borderRadius: "18px",
                      background: "#f8fafc",
                      border: "1px solid rgba(15,23,42,0.06)",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "15px",
                          fontWeight: 700,
                          color: "#0f172a",
                          marginBottom: "6px",
                        }}
                      >
                        {ticket.resourceName || "Unknown Resource"}
                      </div>
                      <div
                        style={{
                          fontSize: "13px",
                          color: "#64748b",
                          lineHeight: 1.7,
                        }}
                      >
                        {ticket.category} · {ticket.priority}
                      </div>
                      <div
                        style={{
                          fontSize: "13px",
                          color: "#64748b",
                          marginTop: "4px",
                        }}
                      >
                        {ticket.description
                          ? `${ticket.description.slice(0, 55)}${
                              ticket.description.length > 55 ? "..." : ""
                            }`
                          : "No description provided."}
                      </div>
                    </div>

                    <span style={ticketStatusBadgeStyle(ticket.status)}>
                      {ticket.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ ...cardStyle, padding: "28px" }}>
            <div style={sectionTitleStyle}>Quick Actions</div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <button
                onClick={() => navigate("/bookings")}
                style={{
                  ...quickButtonStyle,
                  background: "var(--primary)",
                  color: "#111827",
                  border: "none",
                  boxShadow: "0 10px 24px rgba(244, 180, 0, 0.18)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                Book a Resource
              </button>

              <button
                onClick={() => navigate("/facilities")}
                style={quickButtonStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(15,23,42,0.14)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 18px rgba(15,23,42,0.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(15,23,42,0.08)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                Browse Facilities
              </button>

              <button
                onClick={() => navigate("/incidents")}
                style={quickButtonStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(15,23,42,0.14)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 18px rgba(15,23,42,0.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(15,23,42,0.08)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                View or Report Incidents
              </button>

              <button
                onClick={() => navigate("/notifications")}
                style={quickButtonStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(15,23,42,0.14)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 18px rgba(15,23,42,0.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(15,23,42,0.08)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                Check Notifications
              </button>
            </div>

            <div
              style={{
                marginTop: "22px",
                padding: "16px 18px",
                borderRadius: "18px",
                background: "rgba(22,58,99,0.06)",
                border: "1px solid rgba(22,58,99,0.10)",
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 800,
                  color: "#0f172a",
                  marginBottom: "6px",
                }}
              >
                Personal Insight
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: "#475569",
                  lineHeight: 1.7,
                }}
              >
                {analytics.pendingBookings > 0
                  ? `${analytics.pendingBookings} booking request(s) are still waiting for approval.`
                  : analytics.openTickets > 0
                  ? `${analytics.openTickets} incident(s) are still open or in progress.`
                  : "Everything looks up to date right now."}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}