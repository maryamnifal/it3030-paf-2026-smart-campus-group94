import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllTickets, getMyTickets, deleteTicket } from "../../api/ticketApi";
import { useAuth } from "../../context/AuthContext";

const STATUS_CONFIG = {
  OPEN: { label: "Open", bg: "#fee2e2", color: "#991b1b" },
  IN_PROGRESS: { label: "In Progress", bg: "#fef9c3", color: "#854d0e" },
  RESOLVED: { label: "Resolved", bg: "#dcfce7", color: "#166534" },
  CLOSED: { label: "Closed", bg: "#f1f5f9", color: "#475569" },
  REJECTED: { label: "Rejected", bg: "#fce7f3", color: "#9d174d" },
};

const PRIORITY_CONFIG = {
  HIGH: { bg: "#fee2e2", color: "#991b1b" },
  MEDIUM: { bg: "#fef9c3", color: "#854d0e" },
  LOW: { bg: "#dcfce7", color: "#166534" },
};

const pageCardStyle = {
  background: "#fff",
  border: "1px solid rgba(15,23,42,0.08)",
  borderRadius: "28px",
  boxShadow: "0 10px 30px rgba(15,23,42,0.05)",
};

const pillStyle = {
  display: "inline-block",
  background: "var(--primary-light)",
  color: "var(--secondary)",
  fontSize: "12px",
  fontWeight: 700,
  letterSpacing: "1.2px",
  textTransform: "uppercase",
  padding: "8px 18px",
  borderRadius: "999px",
  marginBottom: "16px",
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.OPEN;
  return (
    <span style={{
      background: cfg.bg,
      color: cfg.color,
      borderRadius: "999px",
      padding: "6px 14px",
      fontSize: "11px",
      fontWeight: 700,
      letterSpacing: "0.5px",
      whiteSpace: "nowrap",
    }}>
      {cfg.label}
    </span>
  );
}

function PriorityBadge({ priority }) {
  const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.LOW;
  return (
    <span style={{
      background: cfg.bg,
      color: cfg.color,
      borderRadius: "999px",
      padding: "6px 14px",
      fontSize: "11px",
      fontWeight: 700,
      whiteSpace: "nowrap",
    }}>
      {priority}
    </span>
  );
}

function TicketCard({ ticket, isAdmin, onDelete, onNavigate }) {
  return (
    <div
      style={{
        ...pageCardStyle,
        overflow: "hidden",
        transition: "all 0.25s ease",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-6px)";
        e.currentTarget.style.boxShadow = "0 18px 40px rgba(15,23,42,0.08)";
        e.currentTarget.style.borderColor = "var(--primary)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 10px 30px rgba(15,23,42,0.05)";
        e.currentTarget.style.borderColor = "rgba(15,23,42,0.08)";
      }}
      onClick={() => onNavigate(ticket.id)}
    >
      <div style={{
        height: "4px",
        background: STATUS_CONFIG[ticket.status]?.bg || "#f1f5f9",
      }} />

      <div style={{ padding: "22px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
            <span style={{
              background: "#f1f5f9",
              color: "#475569",
              borderRadius: "999px",
              padding: "6px 14px",
              fontSize: "11px",
              fontWeight: 700,
            }}>
              {ticket.category}
            </span>
          </div>
        </div>

        <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "5px" }}>
          Ticket #{ticket.id?.slice(-6).toUpperCase()}
        </div>

        <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-dark)", marginBottom: "10px", lineHeight: 1.5 }}>
          {ticket.description?.length > 100
            ? ticket.description.substring(0, 100) + "..."
            : ticket.description}
        </div>

        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "16px" }}>
          {ticket.resourceName && (
            <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>📍 {ticket.resourceName}</span>
          )}
          <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>👤 {ticket.createdByName}</span>
          {ticket.assignedToName && (
            <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>🔧 {ticket.assignedToName}</span>
          )}
          <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>💬 {ticket.comments?.length || 0} comments</span>
        </div>

        {isAdmin && (
          <div style={{ display: "flex", gap: "8px" }} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onNavigate(ticket.id)}
              style={{
                background: "#fff",
                color: "var(--primary)",
                border: "1px solid rgba(244,180,0,0.3)",
                padding: "10px 18px",
                borderRadius: "999px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Manage
            </button>
            <button
              onClick={() => onDelete(ticket.id)}
              style={{
                background: "#fff",
                color: "#dc2626",
                border: "1px solid rgba(220,38,38,0.15)",
                padding: "10px 18px",
                borderRadius: "999px",
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
}

export default function TicketListPage() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const isAdmin = role === "ADMIN";

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("");

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const response = isAdmin
        ? await getAllTickets(statusFilter === "ALL" ? null : statusFilter, priorityFilter || null)
        : await getMyTickets();
      setTickets(response.data);
    } catch (err) {
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role !== null) {
        fetchTickets();
    }
    }, [statusFilter, priorityFilter, role]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this ticket?")) return;
    try {
      await deleteTicket(id);
      setTickets(tickets.filter((t) => t.id !== id));
    } catch (err) {
      alert("Failed to delete ticket");
    }
  };

  const counts = {
    ALL: tickets.length,
    OPEN: tickets.filter((t) => t.status === "OPEN").length,
    IN_PROGRESS: tickets.filter((t) => t.status === "IN_PROGRESS").length,
    RESOLVED: tickets.filter((t) => t.status === "RESOLVED").length,
    CLOSED: tickets.filter((t) => t.status === "CLOSED").length,
    REJECTED: tickets.filter((t) => t.status === "REJECTED").length,
  };

  const filtered = statusFilter === "ALL"
    ? tickets
    : tickets.filter((t) => t.status === statusFilter);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-light)", paddingBottom: "90px" }}>

      {/* Hero Section */}
      <section style={{
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(90deg, rgba(9,18,32,0.96) 0%, rgba(15,41,71,0.88) 45%, rgba(22,58,99,0.78) 100%)",
        padding: "130px 2rem 70px",
      }}>
        <div style={{ position: "absolute", top: "-120px", right: "-100px", width: "360px", height: "360px", borderRadius: "50%", background: "rgba(244,180,0,0.12)", filter: "blur(70px)" }} />
        <div style={{ position: "absolute", bottom: "-100px", left: "-80px", width: "300px", height: "300px", borderRadius: "50%", background: "rgba(255,255,255,0.06)", filter: "blur(70px)" }} />

        <div style={{ position: "relative", zIndex: 2, maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            padding: "8px 18px",
            borderRadius: "999px",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "rgba(255,255,255,0.88)",
            fontSize: "12px",
            fontWeight: 600,
            letterSpacing: "0.5px",
            marginBottom: "24px",
          }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--primary)", display: "inline-block" }} />
            INCIDENT MANAGEMENT
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "20px" }}>
            <div>
              <h1 style={{ fontSize: "clamp(34px, 5vw, 58px)", lineHeight: 1.05, fontWeight: 800, color: "#fff", letterSpacing: "-1.5px", marginBottom: "14px", maxWidth: "760px" }}>
                {isAdmin ? "Manage all incident tickets." : "Track your incident reports."}
              </h1>
              <p style={{ color: "rgba(255,255,255,0.72)", fontSize: "16px", lineHeight: 1.8, maxWidth: "600px" }}>
                {isAdmin
                  ? "Review, assign, and resolve maintenance requests from across the campus."
                  : "Submit and track maintenance requests. Stay updated on resolution progress."}
              </p>
            </div>

            <button
              onClick={() => navigate("/incidents/create")}
              style={{
                background: "var(--primary)",
                color: "#111827",
                border: "none",
                padding: "14px 26px",
                borderRadius: "999px",
                fontSize: "14px",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 10px 24px rgba(244,180,0,0.22)",
                whiteSpace: "nowrap",
              }}
            >
              + Report Incident
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 2rem 0" }}>
        <div style={{ ...pageCardStyle, padding: "28px" }}>
          <div style={pillStyle}>{isAdmin ? "All Tickets" : "My Tickets"}</div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-dark)", letterSpacing: "-0.5px" }}>
              {isAdmin ? "All Incident Tickets" : "Your Incident History"}
            </div>
            <div style={{ fontSize: "14px", color: "var(--text-light)" }}>
              {loading ? "Loading..." : `${filtered.length} ticket${filtered.length !== 1 ? "s" : ""} found`}
            </div>
          </div>

          {/* Stats Row */}
          <div style={{ display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
            {[
              { label: "Total", value: counts.ALL, color: "#9ca3af" },
              { label: "Open", value: counts.OPEN, color: "#991b1b" },
              { label: "In Progress", value: counts.IN_PROGRESS, color: "#854d0e" },
              { label: "Resolved", value: counts.RESOLVED, color: "#166534" },
            ].map((s) => (
              <div key={s.label} style={{
                background: "#f3f4f6",
                border: "1px solid rgba(15,23,42,0.08)",
                borderRadius: "14px",
                padding: "16px 20px",
                textAlign: "center",
                minWidth: "100px",
              }}>
                <div style={{ fontSize: "28px", fontWeight: 800, color: s.color, letterSpacing: "-1px" }}>{s.value}</div>
                <div style={{ fontSize: "12px", color: "var(--text-light)", marginTop: "4px", fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Filter Tabs */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "24px" }}>
            {["ALL", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                style={{
                  background: statusFilter === s ? "var(--primary)" : "#fff",
                  color: statusFilter === s ? "#111827" : "var(--text-light)",
                  border: statusFilter === s ? "none" : "1px solid rgba(15,23,42,0.08)",
                  borderRadius: "999px",
                  padding: "8px 18px",
                  fontSize: "13px",
                  fontWeight: statusFilter === s ? 700 : 500,
                  cursor: "pointer",
                  boxShadow: statusFilter === s ? "0 4px 12px rgba(244,180,0,0.2)" : "none",
                  transition: "all 0.2s",
                }}
              >
                {s === "ALL" ? "All" : STATUS_CONFIG[s]?.label} ({s === "ALL" ? counts.ALL : counts[s]})
              </button>
            ))}
          </div>

          {/* Admin Priority Filter */}
          {isAdmin && (
            <div style={{ marginBottom: "24px" }}>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                style={{
                  padding: "10px 16px",
                  background: "#f8fafc",
                  border: "1px solid rgba(15,23,42,0.08)",
                  borderRadius: "12px",
                  color: "var(--text-dark)",
                  fontSize: "14px",
                  outline: "none",
                  fontWeight: 600,
                }}
              >
                <option value="">All Priorities</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div style={{ textAlign: "center", padding: "60px 24px", color: "var(--text-light)", fontSize: "16px" }}>
              Loading tickets...
            </div>
          )}

          {/* Empty State */}
          {!loading && filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 24px" }}>
              <div style={{ fontSize: "42px", marginBottom: "14px" }}>🎫</div>
              <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-dark)", marginBottom: "10px" }}>
                No tickets found
              </div>
              <div style={{ color: "var(--text-light)", fontSize: "14px", lineHeight: 1.7 }}>
                {isAdmin ? "No incidents have been reported yet." : "Click '+ Report Incident' to submit your first report."}
              </div>
            </div>
          )}

          {/* Ticket Grid */}
          {!loading && filtered.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
              {filtered.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  isAdmin={isAdmin}
                  onDelete={handleDelete}
                  onNavigate={(id) => navigate(`/incidents/${id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}