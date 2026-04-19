import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllBookings } from "../../api/bookingApi";
import { getAllResources } from "../../api/resourceApi";
import { getAllTickets } from "../../api/ticketApi";
import { generateAdminReportPdf } from "../../utils/adminReportPdf";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [resources, setResources] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);

        const [bookingsRes, resourcesRes, ticketsRes] = await Promise.all([
          getAllBookings(),
          getAllResources(),
          getAllTickets(),
        ]);

        setBookings(bookingsRes.data || []);
        setResources(resourcesRes.data || []);
        setTickets(ticketsRes.data || []);
      } catch (error) {
        console.error("Failed to load admin dashboard data:", error);
        setBookings([]);
        setResources([]);
        setTickets([]);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const analytics = useMemo(() => {
    const totalBookings = bookings.length;
    const pendingBookings = bookings.filter((b) => b.status === "PENDING").length;
    const approvedBookings = bookings.filter((b) => b.status === "APPROVED").length;
    const rejectedBookings = bookings.filter((b) => b.status === "REJECTED").length;
    const totalResources = resources.length;

    const totalTickets = tickets.length;
    const openTickets = tickets.filter((t) => t.status === "OPEN").length;
    const inProgressTickets = tickets.filter(
      (t) => t.status === "IN_PROGRESS"
    ).length;
    const resolvedTickets = tickets.filter((t) => t.status === "RESOLVED").length;
    const closedTickets = tickets.filter((t) => t.status === "CLOSED").length;
    const highPriorityTickets = tickets.filter((t) => t.priority === "HIGH").length;

    const resourceMap = new Map(resources.map((r) => [r.id, r]));
    const resourceUsage = {};

    bookings.forEach((booking) => {
      const key = booking.resourceId || "UNKNOWN";
      resourceUsage[key] = (resourceUsage[key] || 0) + 1;
    });

    const topResources = Object.entries(resourceUsage)
      .map(([resourceId, count]) => ({
        resourceId,
        count,
        resourceName: resourceMap.get(resourceId)?.name || resourceId,
        type: resourceMap.get(resourceId)?.type?.replaceAll("_", " ") || "-",
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const hourUsage = {};
    bookings.forEach((booking) => {
      if (!booking.startTime) return;
      const hour = String(booking.startTime).slice(0, 2);
      hourUsage[hour] = (hourUsage[hour] || 0) + 1;
    });

    const peakHours = Object.entries(hourUsage)
      .map(([hour, count]) => ({
        hour,
        count,
        label: `${hour}:00 - ${hour}:59`,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const recentBookings = [...bookings]
      .sort((a, b) => {
        const aTime = new Date(a.createdAt || a.date || 0).getTime();
        const bTime = new Date(b.createdAt || b.date || 0).getTime();
        return bTime - aTime;
      })
      .slice(0, 6)
      .map((booking) => ({
        ...booking,
        resourceName:
          resourceMap.get(booking.resourceId)?.name || booking.resourceId,
      }));

    const recentTickets = [...tickets]
      .sort((a, b) => {
        const aTime = new Date(a.createdAt || 0).getTime();
        const bTime = new Date(b.createdAt || 0).getTime();
        return bTime - aTime;
      })
      .slice(0, 5);

    const bookingsByStatus = [
      { label: "Pending", value: pendingBookings, color: "#f59e0b" },
      { label: "Approved", value: approvedBookings, color: "#10b981" },
      { label: "Rejected", value: rejectedBookings, color: "#ef4444" },
    ];

    const ticketsByStatus = [
      { label: "Open", value: openTickets, color: "#ef4444" },
      { label: "In Progress", value: inProgressTickets, color: "#f59e0b" },
      { label: "Resolved", value: resolvedTickets, color: "#10b981" },
      { label: "Closed", value: closedTickets, color: "#64748b" },
    ];

    const monthlyBookingMap = {};
    bookings.forEach((booking) => {
      const rawDate = booking.date || booking.createdAt;
      if (!rawDate) return;

      const d = new Date(rawDate);
      if (Number.isNaN(d.getTime())) return;

      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthlyBookingMap[key] = (monthlyBookingMap[key] || 0) + 1;
    });

    const bookingTrend = Object.entries(monthlyBookingMap)
      .map(([month, count]) => ({
        month,
        shortLabel: new Date(`${month}-01`).toLocaleString("en-US", {
          month: "short",
        }),
        count,
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6);

    return {
      totalBookings,
      pendingBookings,
      approvedBookings,
      rejectedBookings,
      totalResources,
      topResources,
      peakHours,
      recentBookings,
      totalTickets,
      openTickets,
      inProgressTickets,
      resolvedTickets,
      closedTickets,
      highPriorityTickets,
      recentTickets,
      bookingsByStatus,
      ticketsByStatus,
      bookingTrend,
    };
  }, [bookings, resources, tickets]);

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
  };

  const containerStyle = {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 2rem",
  };

  const pageCardStyle = {
    background: "rgba(255,255,255,0.92)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: "1px solid rgba(15, 23, 42, 0.07)",
    borderRadius: "28px",
    boxShadow: "0 18px 45px rgba(15, 23, 42, 0.06)",
  };

  const sectionTitleStyle = {
    fontSize: "22px",
    fontWeight: 800,
    color: "#0f172a",
    marginBottom: "18px",
    letterSpacing: "-0.4px",
  };

  const statCards = [
    {
      label: "Total Resources",
      value: analytics.totalResources,
      sub: "Facilities in system",
      accent: "rgba(244,180,0,0.16)",
    },
    {
      label: "Total Bookings",
      value: analytics.totalBookings,
      sub: "All booking requests",
      accent: "rgba(59,130,246,0.12)",
    },
    {
      label: "Pending",
      value: analytics.pendingBookings,
      sub: "Awaiting approval",
      accent: "rgba(245,158,11,0.14)",
    },
    {
      label: "Approved",
      value: analytics.approvedBookings,
      sub: "Confirmed bookings",
      accent: "rgba(34,197,94,0.12)",
    },
    {
      label: "Open Incidents",
      value: analytics.openTickets,
      sub: "Need attention",
      accent: "rgba(239,68,68,0.12)",
    },
    {
      label: "Resolved",
      value: analytics.resolvedTickets,
      sub: "Completed issues",
      accent: "rgba(16,185,129,0.12)",
    },
  ];

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

  const priorityBadgeStyle = (priority) => {
    const styles = {
      HIGH: { bg: "#fee2e2", color: "#b91c1c" },
      MEDIUM: { bg: "#fef3c7", color: "#92400e" },
      LOW: { bg: "#e0f2fe", color: "#075985" },
    };

    const style = styles[priority] || styles.LOW;

    return {
      background: style.bg,
      color: style.color,
      borderRadius: "999px",
      padding: "4px 10px",
      fontSize: "10px",
      fontWeight: 800,
      whiteSpace: "nowrap",
      letterSpacing: "0.3px",
    };
  };

  const maxTrendValue = Math.max(...analytics.bookingTrend.map((i) => i.count), 1);
  const maxBookingStatus = Math.max(
    ...analytics.bookingsByStatus.map((i) => i.value),
    1
  );
  const totalTicketStatus = analytics.ticketsByStatus.reduce(
    (sum, item) => sum + item.value,
    0
  );

  if (loading) {
    return (
      <div style={{ ...shellStyle, paddingTop: "120px" }}>
        <div style={containerStyle}>
          <div style={{ ...pageCardStyle, padding: "50px", textAlign: "center" }}>
            Loading admin dashboard...
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
          0% { opacity: 0.25; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.05); }
          100% { opacity: 0.25; transform: scale(1); }
        }
      `}</style>

      <section style={heroStyle}>
        <div
          style={{
            position: "absolute",
            top: "-100px",
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
            left: "-60px",
            width: "260px",
            height: "260px",
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
                  color: "#fff",
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
                ADMIN CONTROL CENTER
              </div>

              <h1
                style={{
                  fontSize: "42px",
                  lineHeight: 1.06,
                  fontWeight: 900,
                  color: "#fff",
                  letterSpacing: "-1.2px",
                  marginBottom: "14px",
                }}
              >
                Admin Dashboard
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
                Monitor facility usage, review booking demand, track incidents,
                and manage campus operations with live analytics and quick
                actions.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={() => navigate("/admin/bookings")}
                style={{
                  background: "var(--primary)",
                  color: "#111827",
                  border: "none",
                  padding: "12px 18px",
                  borderRadius: "14px",
                  fontSize: "14px",
                  fontWeight: 800,
                  cursor: "pointer",
                  boxShadow: "0 10px 24px rgba(244, 180, 0, 0.18)",
                }}
              >
                Review Requests
              </button>

              <button
                onClick={() => navigate("/incidents")}
                style={{
                  background: "rgba(255,255,255,0.12)",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.20)",
                  padding: "12px 18px",
                  borderRadius: "14px",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Manage Incidents
              </button>

              <button
                onClick={() => navigate("/facilities/new")}
                style={{
                  background: "rgba(255,255,255,0.12)",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.20)",
                  padding: "12px 18px",
                  borderRadius: "14px",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Add Resource
              </button>

              <button
                onClick={() => generateAdminReportPdf(analytics)}
                style={{
                  background: "#fff",
                  color: "#0f172a",
                  border: "1px solid rgba(255,255,255,0.20)",
                  padding: "12px 18px",
                  borderRadius: "14px",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Download Report
              </button>
            </div>
          </div>
        </div>
      </section>

      <section
        style={{
          ...containerStyle,
          marginTop: "-40px",
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
          {statCards.map((card, index) => (
            <div
              key={card.label}
              style={{
                ...pageCardStyle,
                padding: "24px",
                position: "relative",
                overflow: "hidden",
                animation: "floatCard 5s ease-in-out infinite",
                animationDelay: `${index * 0.15}s`,
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
                  filter: "blur(2px)",
                }}
              />

              <div
                style={{
                  position: "relative",
                  zIndex: 1,
                }}
              >
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
                    fontSize: "38px",
                    fontWeight: 800,
                    color: "#0f172a",
                    letterSpacing: "-1px",
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
            gridTemplateColumns: "1.1fr 0.9fr 0.9fr",
            gap: "24px",
            marginBottom: "28px",
          }}
        >
          <div style={{ ...pageCardStyle, padding: "28px" }}>
            <div style={sectionTitleStyle}>Booking Trends</div>

            {analytics.bookingTrend.length === 0 ? (
              <div style={{ color: "#64748b", fontSize: "14px" }}>
                No booking trend data yet.
              </div>
            ) : (
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "end",
                    gap: "16px",
                    height: "220px",
                    paddingTop: "10px",
                  }}
                >
                  {analytics.bookingTrend.map((item) => {
                    const barHeight = `${Math.max(
                      (item.count / maxTrendValue) * 160,
                      18
                    )}px`;

                    return (
                      <div
                        key={item.month}
                        style={{
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "end",
                          gap: "10px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "12px",
                            fontWeight: 700,
                            color: "#64748b",
                          }}
                        >
                          {item.count}
                        </div>

                        <div
                          style={{
                            width: "100%",
                            maxWidth: "54px",
                            height: barHeight,
                            borderRadius: "16px 16px 8px 8px",
                            background:
                              "linear-gradient(180deg, rgba(244,180,0,0.95) 0%, rgba(250,204,21,0.82) 100%)",
                            boxShadow: "0 10px 20px rgba(244,180,0,0.18)",
                            transition: "all 0.3s ease",
                          }}
                        />

                        <div
                          style={{
                            fontSize: "12px",
                            color: "#94a3b8",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          }}
                        >
                          {item.shortLabel}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div style={{ ...pageCardStyle, padding: "28px" }}>
            <div style={sectionTitleStyle}>Peak Booking Hours</div>

            {analytics.peakHours.length === 0 ? (
              <div style={{ color: "#64748b", fontSize: "14px" }}>
                No booking time data yet.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {analytics.peakHours.map((item, index) => (
                  <div
                    key={item.hour}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "16px",
                      padding: "14px 16px",
                      borderRadius: "18px",
                      background: "#f8fafc",
                      border: "1px solid rgba(15,23,42,0.06)",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: "15px",
                          fontWeight: 700,
                          color: "#0f172a",
                        }}
                      >
                        #{index + 1} {item.label}
                      </div>
                      <div
                        style={{
                          fontSize: "13px",
                          color: "#64748b",
                          marginTop: "4px",
                        }}
                      >
                        Highest demand window
                      </div>

                      <div
                        style={{
                          width: "100%",
                          height: "8px",
                          background: "#e2e8f0",
                          borderRadius: "999px",
                          marginTop: "10px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${Math.max(
                              (item.count /
                                Math.max(...analytics.peakHours.map((h) => h.count), 1)) *
                                100,
                              10
                            )}%`,
                            height: "100%",
                            background: "#f59e0b",
                            borderRadius: "999px",
                          }}
                        />
                      </div>
                    </div>

                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: 800,
                        color: "#163a63",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.count} bookings
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ ...pageCardStyle, padding: "28px" }}>
            <div style={sectionTitleStyle}>Incident Status Mix</div>

            {totalTicketStatus === 0 ? (
              <div style={{ color: "#64748b", fontSize: "14px" }}>
                No incident data available.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {analytics.ticketsByStatus.map((item) => {
                  const width = `${Math.max(
                    (item.value / totalTicketStatus) * 100,
                    item.value > 0 ? 8 : 0
                  )}%`;

                  return (
                    <div key={item.label}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "8px",
                          fontSize: "13px",
                          fontWeight: 700,
                          color: "#0f172a",
                        }}
                      >
                        <span>{item.label}</span>
                        <span>{item.value}</span>
                      </div>

                      <div
                        style={{
                          width: "100%",
                          height: "10px",
                          background: "#e2e8f0",
                          borderRadius: "999px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width,
                            height: "100%",
                            background: item.color,
                            borderRadius: "999px",
                            transition: "width 0.35s ease",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "24px",
            marginBottom: "28px",
          }}
        >
          <div style={{ ...pageCardStyle, padding: "28px" }}>
            <div style={sectionTitleStyle}>Top Resources</div>

            {analytics.topResources.length === 0 ? (
              <div style={{ color: "#64748b", fontSize: "14px" }}>
                No booking activity yet.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {analytics.topResources.map((item, index) => (
                  <div
                    key={item.resourceId}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "16px",
                      padding: "14px 16px",
                      borderRadius: "18px",
                      background: "#f8fafc",
                      border: "1px solid rgba(15,23,42,0.06)",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: "15px",
                          fontWeight: 700,
                          color: "#0f172a",
                        }}
                      >
                        #{index + 1} {item.resourceName}
                      </div>
                      <div
                        style={{
                          fontSize: "13px",
                          color: "#64748b",
                          marginTop: "4px",
                        }}
                      >
                        {item.type}
                      </div>
                      <div
                        style={{
                          width: "100%",
                          height: "8px",
                          background: "#e2e8f0",
                          borderRadius: "999px",
                          marginTop: "10px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${Math.max(
                              (item.count /
                                Math.max(...analytics.topResources.map((r) => r.count), 1)) *
                                100,
                              10
                            )}%`,
                            height: "100%",
                            background: "#163a63",
                            borderRadius: "999px",
                          }}
                        />
                      </div>
                    </div>

                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: 800,
                        color: "#163a63",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.count} bookings
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ ...pageCardStyle, padding: "28px" }}>
            <div style={sectionTitleStyle}>Booking Status Overview</div>

            {analytics.bookingsByStatus.every((item) => item.value === 0) ? (
              <div style={{ color: "#64748b", fontSize: "14px" }}>
                No booking status data yet.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {analytics.bookingsByStatus.map((item) => (
                  <div key={item.label}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "8px",
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "#0f172a",
                      }}
                    >
                      <span>{item.label}</span>
                      <span>{item.value}</span>
                    </div>

                    <div
                      style={{
                        width: "100%",
                        height: "12px",
                        background: "#e2e8f0",
                        borderRadius: "999px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${Math.max(
                            (item.value / maxBookingStatus) * 100,
                            item.value > 0 ? 8 : 0
                          )}%`,
                          height: "100%",
                          background: item.color,
                          borderRadius: "999px",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 0.8fr",
            gap: "24px",
          }}
        >
          <div style={{ ...pageCardStyle, padding: "28px" }}>
            <div style={sectionTitleStyle}>Recent Booking Activity</div>

            {analytics.recentBookings.length === 0 ? (
              <div style={{ color: "#64748b", fontSize: "14px" }}>
                No recent bookings available.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {analytics.recentBookings.map((booking) => (
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
                        {booking.resourceName}
                      </div>
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
                ))}
              </div>
            )}
          </div>

          <div style={{ ...pageCardStyle, padding: "28px" }}>
            <div style={sectionTitleStyle}>Recent Incidents</div>

            {analytics.recentTickets.length === 0 ? (
              <div style={{ color: "#64748b", fontSize: "14px" }}>
                No incidents reported.
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
                      gap: "14px",
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
                          display: "flex",
                          gap: "8px",
                          flexWrap: "wrap",
                          marginBottom: "6px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "12px",
                            color: "#64748b",
                            fontWeight: 600,
                          }}
                        >
                          {ticket.category}
                        </span>
                        {ticket.priority && (
                          <span style={priorityBadgeStyle(ticket.priority)}>
                            {ticket.priority}
                          </span>
                        )}
                      </div>

                      <div
                        style={{
                          fontSize: "13px",
                          color: "#64748b",
                          lineHeight: 1.7,
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

          <div style={{ ...pageCardStyle, padding: "28px" }}>
            <div style={sectionTitleStyle}>Quick Actions</div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <button
                onClick={() => navigate("/admin/bookings")}
                style={{
                  background: "var(--primary)",
                  color: "#111827",
                  border: "none",
                  padding: "14px 18px",
                  borderRadius: "16px",
                  fontSize: "14px",
                  fontWeight: 800,
                  cursor: "pointer",
                  textAlign: "left",
                  boxShadow: "0 10px 24px rgba(244, 180, 0, 0.18)",
                }}
              >
                Review Booking Requests
              </button>

              <button
                onClick={() => navigate("/incidents")}
                style={{
                  background: "#fff",
                  color: "#0f172a",
                  border: "1px solid rgba(15,23,42,0.08)",
                  padding: "14px 18px",
                  borderRadius: "16px",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                Manage Incidents
              </button>

              <button
                onClick={() => navigate("/facilities")}
                style={{
                  background: "#fff",
                  color: "#0f172a",
                  border: "1px solid rgba(15,23,42,0.08)",
                  padding: "14px 18px",
                  borderRadius: "16px",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                Manage Facilities
              </button>

              <button
                onClick={() => navigate("/facilities/new")}
                style={{
                  background: "#fff",
                  color: "#0f172a",
                  border: "1px solid rgba(15,23,42,0.08)",
                  padding: "14px 18px",
                  borderRadius: "16px",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                Add New Resource
              </button>
            </div>

            <div
              style={{
                marginTop: "22px",
                padding: "16px 18px",
                borderRadius: "18px",
                background: "rgba(244,180,0,0.10)",
                border: "1px solid rgba(244,180,0,0.20)",
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
                Admin Insight
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: "#475569",
                  lineHeight: 1.7,
                }}
              >
                {analytics.openTickets > 0
                  ? `${analytics.openTickets} open incident(s) and ${analytics.pendingBookings} pending booking request(s) need review.`
                  : analytics.pendingBookings > 0
                  ? `${analytics.pendingBookings} booking request(s) are waiting for review.`
                  : "No urgent admin actions right now."}
              </div>
            </div>

            <div
              style={{
                marginTop: "14px",
                padding: "16px 18px",
                borderRadius: "18px",
                background: "rgba(239,68,68,0.06)",
                border: "1px solid rgba(239,68,68,0.12)",
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
                Incident Snapshot
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: "#475569",
                  lineHeight: 1.7,
                }}
              >
                {analytics.highPriorityTickets > 0
                  ? `${analytics.highPriorityTickets} high-priority incident(s) are currently in the system.`
                  : "No high-priority incidents at the moment."}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}