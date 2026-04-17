import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getTicketById,
  updateTicketStatus,
  assignTechnician,
  addComment,
  editComment,
  deleteComment,
} from "../../api/ticketApi";
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

const inputStyle = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "16px",
  border: "1px solid rgba(15,23,42,0.08)",
  background: "#fff",
  color: "var(--text-dark)",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
  resize: "vertical",
};

const labelStyle = {
  display: "block",
  fontSize: "13px",
  fontWeight: 700,
  color: "var(--text-dark)",
  marginBottom: "8px",
};

export default function TicketDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role, userId } = useAuth();
  const isAdmin = role === "ADMIN";

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [statusForm, setStatusForm] = useState({
    status: "",
    resolutionNotes: "",
    rejectionReason: "",
  });

  const [assignForm, setAssignForm] = useState({
    technicianId: "",
    technicianName: "",
  });

  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  const fetchTicket = async () => {
    try {
      const response = await getTicketById(id);
      setTicket(response.data);
      setStatusForm((prev) => ({ ...prev, status: response.data.status }));
    } catch (err) {
      setError("Failed to load ticket");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const handleStatusUpdate = async () => {
    try {
      const response = await updateTicketStatus(id, statusForm);
      setTicket(response.data);
      alert("Status updated successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleAssign = async () => {
    try {
      const response = await assignTechnician(id, assignForm);
      setTicket(response.data);
      alert("Technician assigned successfully!");
    } catch (err) {
      alert("Failed to assign technician");
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setCommentLoading(true);
    try {
      const response = await addComment(id, { content: newComment });
      setTicket(response.data);
      setNewComment("");
    } catch (err) {
      alert("Failed to add comment");
    } finally {
      setCommentLoading(false);
    }
  };

  const handleEditComment = async (commentId) => {
    try {
      await editComment(id, commentId, { content: editingContent });
      await fetchTicket();
      setEditingCommentId(null);
      setEditingContent("");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to edit comment");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
        await deleteComment(id, commentId);
        // Instead of using response.data, fetch the ticket again
        await fetchTicket();
    } catch (err) {
        alert(err.response?.data?.message || "Failed to delete comment");
    }
  };

  const validNextStatuses = (current) => {
    switch (current) {
      case "OPEN": return ["IN_PROGRESS", "REJECTED"];
      case "IN_PROGRESS": return ["RESOLVED", "REJECTED"];
      case "RESOLVED": return ["CLOSED"];
      default: return [];
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-light)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-light)", fontSize: "16px" }}>
        Loading ticket...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-light)", display: "flex", alignItems: "center", justifyContent: "center", color: "#991b1b", fontSize: "16px" }}>
        {error}
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.OPEN;
  const priorityCfg = PRIORITY_CONFIG[ticket.priority] || PRIORITY_CONFIG.LOW;

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
          <button
            onClick={() => navigate("/incidents")}
            style={{ background: "transparent", border: "none", color: "rgba(234,169,29,0.7)", cursor: "pointer", fontSize: "14px", fontWeight: 600, padding: 0, marginBottom: "20px", display: "block" }}
          >
            ← Back to Incidents
          </button>

          <div style={{
            display: "inline-flex", alignItems: "center", gap: "10px",
            padding: "8px 18px", borderRadius: "999px",
            background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
            color: "rgba(255,255,255,0.88)", fontSize: "12px", fontWeight: 600,
            letterSpacing: "0.5px", marginBottom: "24px",
          }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--primary)", display: "inline-block" }} />
            INCIDENT TICKET
          </div>

          <h1 style={{ fontSize: "clamp(28px, 4vw, 48px)", lineHeight: 1.05, fontWeight: 800, color: "#fff", letterSpacing: "-1.5px", marginBottom: "16px" }}>
            Ticket #{ticket.id ? ticket.id.slice(-6).toUpperCase() : ""}
          </h1>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <span style={{ background: statusCfg.bg, color: statusCfg.color, borderRadius: "999px", padding: "6px 16px", fontSize: "12px", fontWeight: 700 }}>
              {ticket.status}
            </span>
            <span style={{ background: priorityCfg.bg, color: priorityCfg.color, borderRadius: "999px", padding: "6px 16px", fontSize: "12px", fontWeight: 700 }}>
              {ticket.priority} PRIORITY
            </span>
            <span style={{ background: "rgba(255,255,255,0.1)", color: "#fff", borderRadius: "999px", padding: "6px 16px", fontSize: "12px", fontWeight: 700 }}>
              {ticket.category}
            </span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 2rem 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "28px", alignItems: "start" }}>

          {/* LEFT COLUMN */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

            {/* Ticket Details Card */}
            <div style={{ ...pageCardStyle, padding: "30px" }}>
              <div style={pillStyle}>Ticket Details</div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-dark)", marginBottom: "20px", letterSpacing: "-0.4px" }}>
                Incident Information
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                {[
                  { label: "Reported By", value: ticket.createdByName },
                  { label: "Location / Resource", value: ticket.resourceName || "N/A" },
                  { label: "Contact", value: ticket.contactDetails },
                  { label: "Assigned To", value: ticket.assignedToName || "Unassigned" },
                ].map((item) => (
                  <div key={item.label}>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "4px" }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-dark)" }}>
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "8px" }}>
                  Description
                </div>
                <div style={{ fontSize: "14px", color: "var(--text-mid)", lineHeight: 1.8, background: "#f9fafb", borderRadius: "14px", padding: "16px" }}>
                  {ticket.description}
                </div>
              </div>

              {ticket.resolutionNotes && (
                <div style={{ background: "#dcfce7", border: "1px solid #bbf7d0", borderRadius: "14px", padding: "16px", marginBottom: "12px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#166534", textTransform: "uppercase", marginBottom: "6px" }}>Resolution Notes</div>
                  <div style={{ fontSize: "14px", color: "#166534" }}>{ticket.resolutionNotes}</div>
                </div>
              )}

              {ticket.rejectionReason && (
                <div style={{ background: "#fee2e2", border: "1px solid #fecaca", borderRadius: "14px", padding: "16px", marginBottom: "12px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#991b1b", textTransform: "uppercase", marginBottom: "6px" }}>Rejection Reason</div>
                  <div style={{ fontSize: "14px", color: "#991b1b" }}>{ticket.rejectionReason}</div>
                </div>
              )}

              {ticket.attachments && ticket.attachments.length > 0 && (
                <div style={{ marginTop: "16px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "10px" }}>
                    Attachments
                  </div>
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    {ticket.attachments.map((filename, index) => (
                      <a
                        key={index}
                        href={"http://localhost:8080/uploads/tickets/" + filename}
                        target="_blank"
                        rel="noreferrer"
                        style={{ padding: "8px 16px", background: "#f1f5f9", border: "1px solid rgba(15,23,42,0.08)", borderRadius: "999px", color: "var(--text-dark)", fontSize: "13px", fontWeight: 600, textDecoration: "none" }}
                      >
                        Image {index + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Comments Card */}
            <div style={{ ...pageCardStyle, padding: "30px" }}>
              <div style={pillStyle}>Discussion</div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-dark)", marginBottom: "20px", letterSpacing: "-0.4px" }}>
                Comments ({ticket.comments ? ticket.comments.length : 0})
              </div>

              {ticket.comments && ticket.comments.length === 0 && (
                <div style={{ textAlign: "center", padding: "24px", color: "var(--text-light)", fontSize: "14px", marginBottom: "24px" }}>
                  No comments yet. Be the first to comment!
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
                {ticket.comments && ticket.comments.map((comment) => {
                  const isOwner = comment.authorId === userId;
                  const isEditing = editingCommentId === comment.id;

                  return (
                    <div key={comment.id} style={{ background: "#f9fafb", border: "1px solid rgba(15,23,42,0.06)", borderRadius: "18px", padding: "18px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--secondary)" }}>
                          {comment.authorName}
                        </span>
                        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {isEditing ? (
                        <div>
                          <textarea
                            value={editingContent}
                            onChange={(e) => setEditingContent(e.target.value)}
                            rows={3}
                            style={{ ...inputStyle, marginBottom: "10px" }}
                          />
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              onClick={() => handleEditComment(comment.id)}
                              style={{ padding: "8px 18px", background: "var(--primary)", color: "#111827", border: "none", borderRadius: "999px", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingCommentId(null)}
                              style={{ padding: "8px 18px", background: "#fff", color: "var(--text-dark)", border: "1px solid rgba(15,23,42,0.08)", borderRadius: "999px", fontSize: "13px", cursor: "pointer" }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p style={{ fontSize: "14px", color: "var(--text-mid)", margin: "0 0 10px", lineHeight: 1.7 }}>
                            {comment.content}
                          </p>
                          {(isOwner || isAdmin) && (
                            <div style={{ display: "flex", gap: "8px" }}>
                              {isOwner && (
                                <button
                                  onClick={() => { setEditingCommentId(comment.id); setEditingContent(comment.content); }}
                                  style={{ padding: "6px 14px", background: "#fff", color: "var(--text-light)", border: "1px solid rgba(15,23,42,0.08)", borderRadius: "999px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}
                                >
                                  Edit
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                style={{ padding: "6px 14px", background: "#fff", color: "#dc2626", border: "1px solid rgba(220,38,38,0.15)", borderRadius: "999px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Add Comment */}
              <div>
                <label style={labelStyle}>Add a Comment</label>
                <textarea
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                  style={{ ...inputStyle, marginBottom: "12px" }}
                />
                <button
                  onClick={handleAddComment}
                  disabled={commentLoading || !newComment.trim()}
                  style={{
                    background: "var(--primary)",
                    color: "#111827",
                    border: "none",
                    padding: "12px 24px",
                    borderRadius: "999px",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: commentLoading || !newComment.trim() ? "not-allowed" : "pointer",
                    opacity: commentLoading || !newComment.trim() ? 0.6 : 1,
                    boxShadow: "0 10px 24px rgba(244,180,0,0.22)",
                  }}
                >
                  {commentLoading ? "Posting..." : "Post Comment"}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

            {/* Status Card */}
            <div style={{ ...pageCardStyle, padding: "30px" }}>
              <div style={pillStyle}>Status</div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-dark)", marginBottom: "20px", letterSpacing: "-0.4px" }}>
                Ticket Status
              </div>

              <div style={{ background: "#f9fafb", borderRadius: "18px", padding: "20px", marginBottom: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-muted)" }}>Status</span>
                  <span style={{ background: statusCfg.bg, color: statusCfg.color, borderRadius: "999px", padding: "6px 14px", fontSize: "11px", fontWeight: 700 }}>
                    {ticket.status}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-muted)" }}>Priority</span>
                  <span style={{ background: priorityCfg.bg, color: priorityCfg.color, borderRadius: "999px", padding: "6px 14px", fontSize: "11px", fontWeight: 700 }}>
                    {ticket.priority}
                  </span>
                </div>
              </div>

              {/* Workflow */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                {["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].map((s, i) => (
                  <div key={s} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{
                      padding: "4px 10px",
                      borderRadius: "999px",
                      fontSize: "10px",
                      fontWeight: 700,
                      background: ticket.status === s ? STATUS_CONFIG[s].bg : "#f1f5f9",
                      color: ticket.status === s ? STATUS_CONFIG[s].color : "#94a3b8",
                    }}>
                      {s.replace("_", " ")}
                    </span>
                    {i < 3 && <span style={{ color: "#94a3b8", fontSize: "10px" }}>→</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Admin Controls Card */}
            {isAdmin && ticket.status !== "CLOSED" && ticket.status !== "REJECTED" && (
              <div style={{ ...pageCardStyle, padding: "30px" }}>
                <div style={pillStyle}>Admin Controls</div>
                <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-dark)", marginBottom: "20px", letterSpacing: "-0.4px" }}>
                  Manage Ticket
                </div>

                <div style={{ marginBottom: "24px" }}>
                  <label style={labelStyle}>Update Status</label>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
                    {validNextStatuses(ticket.status).map((s) => {
                      const cfg = STATUS_CONFIG[s];
                      return (
                        <button
                          key={s}
                          onClick={() => setStatusForm({ ...statusForm, status: s })}
                          style={{
                            padding: "8px 16px",
                            borderRadius: "999px",
                            border: statusForm.status === s ? ("2px solid " + cfg.color) : "2px solid rgba(15,23,42,0.08)",
                            background: statusForm.status === s ? cfg.bg : "#fff",
                            color: statusForm.status === s ? cfg.color : "var(--text-light)",
                            fontWeight: 700,
                            fontSize: "13px",
                            cursor: "pointer",
                            transition: "all 0.2s",
                          }}
                        >
                          {s.replace("_", " ")}
                        </button>
                      );
                    })}
                  </div>

                  {statusForm.status === "RESOLVED" && (
                    <div style={{ marginBottom: "12px" }}>
                      <label style={labelStyle}>Resolution Notes *</label>
                      <textarea
                        placeholder="Describe how the issue was resolved..."
                        value={statusForm.resolutionNotes}
                        onChange={(e) => setStatusForm({ ...statusForm, resolutionNotes: e.target.value })}
                        rows={3}
                        style={inputStyle}
                      />
                    </div>
                  )}

                  {statusForm.status === "REJECTED" && (
                    <div style={{ marginBottom: "12px" }}>
                      <label style={labelStyle}>Rejection Reason *</label>
                      <textarea
                        placeholder="Explain why this ticket is being rejected..."
                        value={statusForm.rejectionReason}
                        onChange={(e) => setStatusForm({ ...statusForm, rejectionReason: e.target.value })}
                        rows={3}
                        style={inputStyle}
                      />
                    </div>
                  )}

                  <button
                    onClick={handleStatusUpdate}
                    style={{ background: "var(--primary)", color: "#111827", border: "none", padding: "12px 24px", borderRadius: "999px", fontSize: "14px", fontWeight: 700, cursor: "pointer", boxShadow: "0 10px 24px rgba(244,180,0,0.22)" }}
                  >
                    Update Status
                  </button>
                </div>

                <div>
                  <label style={labelStyle}>Assign Technician</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <input
                      placeholder="Technician ID"
                      value={assignForm.technicianId}
                      onChange={(e) => setAssignForm({ ...assignForm, technicianId: e.target.value })}
                      style={inputStyle}
                    />
                    <input
                      placeholder="Technician Name"
                      value={assignForm.technicianName}
                      onChange={(e) => setAssignForm({ ...assignForm, technicianName: e.target.value })}
                      style={inputStyle}
                    />
                    <button
                      onClick={handleAssign}
                      style={{ background: "#fff", color: "var(--secondary)", border: "1px solid rgba(15,23,42,0.08)", padding: "12px 24px", borderRadius: "999px", fontSize: "14px", fontWeight: 700, cursor: "pointer" }}
                    >
                      Assign Technician
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}