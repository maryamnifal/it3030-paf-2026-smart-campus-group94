import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllTickets, getMyTickets, deleteTicket } from "../../api/ticketApi";
import { useAuth } from "../../context/AuthContext";

export default function TicketListPage() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const isAdmin = role === "ADMIN";

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  const statuses = ["", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"];
  const priorities = ["", "LOW", "MEDIUM", "HIGH"];

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const response = isAdmin
        ? await getAllTickets(statusFilter || null, priorityFilter || null)
        : await getMyTickets();
      setTickets(response.data);
    } catch (err) {
      setError("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, priorityFilter]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this ticket?")) return;
    try {
      await deleteTicket(id);
      setTickets(tickets.filter((t) => t.id !== id));
    } catch (err) {
      alert("Failed to delete ticket");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "OPEN": return { bg: "rgba(59,130,246,0.15)", color: "#60a5fa" };
      case "IN_PROGRESS": return { bg: "rgba(244,180,0,0.15)", color: "#fbbf24" };
      case "RESOLVED": return { bg: "rgba(16,185,129,0.15)", color: "#10b981" };
      case "CLOSED": return { bg: "rgba(100,116,139,0.15)", color: "#94a3b8" };
      case "REJECTED": return { bg: "rgba(239,68,68,0.15)", color: "#f87171" };
      default: return { bg: "rgba(100,116,139,0.15)", color: "#94a3b8" };
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "HIGH": return "#ef4444";
      case "MEDIUM": return "#f59e0b";
      case "LOW": return "#10b981";
      default: return "#94a3b8";
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0b1220 0%, #1a2540 100%)",
      padding: "120px 2rem 60px",
      fontFamily: "var(--font-display)",
    }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "40px",
          flexWrap: "wrap",
          gap: "16px",
        }}>
          <div>
            <h1 style={{ color: "#fff", fontSize: "32px", fontWeight: 800, margin: 0 }}>
              {isAdmin ? "All Incident Tickets" : "My Incident Tickets"}
            </h1>
            <p style={{ color: "#94a3b8", marginTop: "8px" }}>
              {isAdmin ? "Manage and respond to all reported incidents" : "Track your submitted incident reports"}
            </p>
          </div>

          <button
            onClick={() => navigate("/incidents/create")}
            style={{
              background: "var(--primary)",
              color: "#111827",
              fontWeight: 700,
              fontSize: "14px",
              padding: "12px 24px",
              borderRadius: "12px",
              border: "none",
              cursor: "pointer",
            }}
          >
            + Report Incident
          </button>
        </div>

        {/* Filters - Admin only */}
        {isAdmin && (
          <div style={{
            display: "flex",
            gap: "16px",
            marginBottom: "32px",
            flexWrap: "wrap",
          }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: "10px 16px",
                background: "#1a2540",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "10px",
                color: "#fff",
                fontSize: "14px",
                outline: "none",
              }}
            >
              {statuses.map((s) => (
                <option key={s} value={s}>{s || "All Statuses"}</option>
              ))}
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              style={{
                padding: "10px 16px",
                background: "#1a2540",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "10px",
                color: "#fff",
                fontSize: "14px",
                outline: "none",
              }}
            >
              {priorities.map((p) => (
                <option key={p} value={p}>{p || "All Priorities"}</option>
              ))}
            </select>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", color: "#94a3b8", padding: "60px" }}>
            Loading tickets...
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: "10px",
            padding: "16px",
            color: "#f87171",
            marginBottom: "24px",
          }}>
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && tickets.length === 0 && (
          <div style={{
            textAlign: "center",
            padding: "80px 20px",
            color: "#94a3b8",
          }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎫</div>
            <p style={{ fontSize: "18px", fontWeight: 600, color: "#e2e8f0" }}>No tickets found</p>
            <p style={{ fontSize: "14px" }}>
              {isAdmin ? "No incidents have been reported yet" : "You haven't reported any incidents yet"}
            </p>
          </div>
        )}

        {/* Ticket Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {tickets.map((ticket) => {
            const statusStyle = getStatusColor(ticket.status);
            return (
              <div
                key={ticket.id}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "16px",
                  padding: "24px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.border = "1px solid rgba(244,180,0,0.3)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.border = "1px solid rgba(255,255,255,0.08)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                }}
                onClick={() => navigate(`/incidents/${ticket.id}`)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                  {/* Left Side */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px", flexWrap: "wrap" }}>
                      {/* Status Badge */}
                      <span style={{
                        padding: "4px 12px",
                        borderRadius: "999px",
                        fontSize: "12px",
                        fontWeight: 600,
                        background: statusStyle.bg,
                        color: statusStyle.color,
                      }}>
                        {ticket.status}
                      </span>

                      {/* Priority Badge */}
                      <span style={{
                        fontSize: "12px",
                        fontWeight: 600,
                        color: getPriorityColor(ticket.priority),
                      }}>
                        ● {ticket.priority}
                      </span>

                      {/* Category */}
                      <span style={{ fontSize: "12px", color: "#64748b" }}>
                        {ticket.category}
                      </span>
                    </div>

                    <p style={{ color: "#e2e8f0", fontSize: "15px", fontWeight: 600, margin: "0 0 8px" }}>
                      {ticket.description.length > 100
                        ? ticket.description.substring(0, 100) + "..."
                        : ticket.description}
                    </p>

                    <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                      {ticket.resourceName && (
                        <span style={{ fontSize: "13px", color: "#64748b" }}>
                          📍 {ticket.resourceName}
                        </span>
                      )}
                      <span style={{ fontSize: "13px", color: "#64748b" }}>
                        👤 {ticket.createdByName}
                      </span>
                      {ticket.assignedToName && (
                        <span style={{ fontSize: "13px", color: "#64748b" }}>
                          🔧 {ticket.assignedToName}
                        </span>
                      )}
                      <span style={{ fontSize: "13px", color: "#64748b" }}>
                        💬 {ticket.comments?.length || 0} comments
                      </span>
                    </div>
                  </div>

                  {/* Right Side - Admin Actions */}
                  {isAdmin && (
                    <div style={{ display: "flex", gap: "8px" }} onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => navigate(`/incidents/${ticket.id}`)}
                        style={{
                          padding: "8px 16px",
                          background: "rgba(244,180,0,0.15)",
                          color: "var(--primary)",
                          border: "1px solid rgba(244,180,0,0.3)",
                          borderRadius: "8px",
                          fontSize: "13px",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Manage
                      </button>
                      <button
                        onClick={() => handleDelete(ticket.id)}
                        style={{
                          padding: "8px 16px",
                          background: "rgba(239,68,68,0.15)",
                          color: "#f87171",
                          border: "1px solid rgba(239,68,68,0.3)",
                          borderRadius: "8px",
                          fontSize: "13px",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}