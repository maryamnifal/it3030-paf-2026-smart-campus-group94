import { useEffect, useState } from "react";
import {
  getAllBookings,
  approveBooking,
  rejectBooking,
} from "../../api/bookingApi";

export default function BookingRequests() {
  const [bookings, setBookings] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await getAllBookings();
      setBookings(res.data || []);
      setFiltered(res.data || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    if (statusFilter === "ALL") {
      setFiltered(bookings);
    } else {
      setFiltered(bookings.filter((b) => b.status === statusFilter));
    }
  }, [statusFilter, bookings]);

  const handleApprove = async (id) => {
    try {
      await approveBooking(id);
      fetchBookings();
    } catch (error) {
      console.error("Error approving booking:", error);
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectBooking(id);
      fetchBookings();
    } catch (error) {
      console.error("Error rejecting booking:", error);
    }
  };

  const pageCardStyle = {
    background: "rgba(255,255,255,0.88)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: "1px solid rgba(15, 23, 42, 0.07)",
    borderRadius: "28px",
    boxShadow: "0 20px 45px rgba(15, 23, 42, 0.07)",
  };

  const statusBadge = (status) => {
    const styles = {
      PENDING: {
        bg: "#fef3c7",
        color: "#92400e",
        border: "1px solid #fde68a",
      },
      APPROVED: {
        bg: "#dcfce7",
        color: "#166534",
        border: "1px solid #bbf7d0",
      },
      REJECTED: {
        bg: "#fee2e2",
        color: "#991b1b",
        border: "1px solid #fecaca",
      },
    };

    const style = styles[status] || {
      bg: "#f1f5f9",
      color: "#475569",
      border: "1px solid #e2e8f0",
    };

    return (
      <span
        style={{
          background: style.bg,
          color: style.color,
          border: style.border,
          borderRadius: "999px",
          padding: "8px 14px",
          fontSize: "12px",
          fontWeight: 800,
          letterSpacing: "0.3px",
        }}
      >
        {status}
      </span>
    );
  };

  const shellStyle = {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top, rgba(244,180,0,0.06), transparent 18%), linear-gradient(180deg, #f8fafc 0%, #f8fafc 55%, #eef2f7 100%)",
    paddingBottom: "80px",
  };

  const containerStyle = {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 2rem",
  };

  return (
    <div style={shellStyle}>
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          background:
            "radial-gradient(circle at top right, rgba(244,180,0,0.16), transparent 25%), linear-gradient(120deg, rgba(9,18,32,0.98) 0%, rgba(15,41,71,0.94) 48%, rgba(22,58,99,0.88) 100%)",
          padding: "132px 0 94px",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-110px",
            right: "-50px",
            width: "320px",
            height: "320px",
            borderRadius: "50%",
            background: "rgba(244,180,0,0.10)",
            filter: "blur(80px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-110px",
            left: "-60px",
            width: "260px",
            height: "260px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
            filter: "blur(80px)",
          }}
        />

        <div style={{ ...containerStyle, position: "relative", zIndex: 2 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              padding: "9px 18px",
              borderRadius: "999px",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.92)",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.7px",
              marginBottom: "24px",
              textTransform: "uppercase",
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
            Admin Bookings
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              gap: "24px",
              flexWrap: "wrap",
            }}
          >
            <div style={{ maxWidth: "780px" }}>
              <h1
                style={{
                  fontSize: "clamp(36px, 5vw, 62px)",
                  lineHeight: 1.02,
                  fontWeight: 900,
                  color: "#fff",
                  letterSpacing: "-1.7px",
                  marginBottom: "18px",
                }}
              >
                Booking Requests
              </h1>

              <p
                style={{
                  color: "rgba(255,255,255,0.78)",
                  fontSize: "16px",
                  lineHeight: 1.9,
                  maxWidth: "720px",
                }}
              >
                Review, approve, or reject user booking requests from one
                place.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        style={{
          ...containerStyle,
          marginTop: "-42px",
          position: "relative",
          zIndex: 3,
        }}
      >
        <div style={{ ...pageCardStyle, padding: "24px", marginBottom: "24px" }}>
          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            {["ALL", "PENDING", "APPROVED", "REJECTED"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                style={{
                  background:
                    statusFilter === status ? "var(--primary)" : "#fff",
                  color:
                    statusFilter === status ? "#111827" : "var(--text-dark)",
                  border:
                    statusFilter === status
                      ? "none"
                      : "1px solid rgba(15, 23, 42, 0.08)",
                  padding: "10px 18px",
                  borderRadius: "999px",
                  fontSize: "13px",
                  fontWeight: 800,
                  cursor: "pointer",
                  boxShadow:
                    statusFilter === status
                      ? "0 10px 22px rgba(244, 180, 0, 0.16)"
                      : "none",
                  transition: "all 0.2s ease",
                }}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ ...pageCardStyle, padding: "50px", textAlign: "center" }}>
            <div
              style={{
                color: "#64748b",
                fontSize: "16px",
                fontWeight: 700,
              }}
            >
              Loading booking requests...
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ ...pageCardStyle, padding: "50px", textAlign: "center" }}>
            <div
              style={{
                color: "#64748b",
                fontSize: "16px",
                fontWeight: 700,
              }}
            >
              No booking requests found.
            </div>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gap: "20px",
            }}
          >
            {filtered.map((booking) => (
              <div
                key={booking.id}
                style={{
                  ...pageCardStyle,
                  padding: "24px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "20px",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <h3
                      style={{
                        fontSize: "22px",
                        fontWeight: 800,
                        color: "var(--text-dark)",
                        marginBottom: "8px",
                      }}
                    >
                      {booking.resourceName || booking.resourceId}
                    </h3>

                    <div
                      style={{
                        color: "var(--text-light)",
                        fontSize: "14px",
                        lineHeight: 1.8,
                      }}
                    >
                      <div>
                        <strong>User:</strong>{" "}
                        {booking.userName || booking.userEmail}
                      </div>
                      <div>
                        <strong>Date:</strong>{" "}
                        {booking.bookingDate || booking.date}
                      </div>
                      <div>
                        <strong>Time:</strong> {booking.startTime} -{" "}
                        {booking.endTime}
                      </div>
                      <div>
                        <strong>Purpose:</strong> {booking.purpose}
                      </div>
                    </div>
                  </div>

                  <div>{statusBadge(booking.status)}</div>
                </div>

                {booking.status === "PENDING" && (
                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      marginTop: "20px",
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      onClick={() => handleApprove(booking.id)}
                      style={{
                        background: "#16a34a",
                        color: "#fff",
                        border: "none",
                        padding: "12px 20px",
                        borderRadius: "999px",
                        fontSize: "14px",
                        fontWeight: 800,
                        cursor: "pointer",
                        boxShadow: "0 12px 24px rgba(22, 163, 74, 0.20)",
                      }}
                    >
                      Approve
                    </button>

                    <button
                      onClick={() => handleReject(booking.id)}
                      style={{
                        background: "#dc2626",
                        color: "#fff",
                        border: "none",
                        padding: "12px 20px",
                        borderRadius: "999px",
                        fontSize: "14px",
                        fontWeight: 800,
                        cursor: "pointer",
                        boxShadow: "0 12px 24px rgba(220, 38, 38, 0.20)",
                      }}
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}