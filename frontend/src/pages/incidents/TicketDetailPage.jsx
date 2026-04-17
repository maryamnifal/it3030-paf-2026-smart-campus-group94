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
      const response = await editComment(id, commentId, { content: editingContent });
      setTicket(response.data);
      setEditingCommentId(null);
      setEditingContent("");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to edit comment");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      const response = await deleteComment(id, commentId);
      setTicket(response.data);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete comment");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "OPEN": return "#60a5fa";
      case "IN_PROGRESS": return "#fbbf24";
      case "RESOLVED": return "#10b981";
      case "CLOSED": return "#94a3b8";
      case "REJECTED": return "#f87171";
      default: return "#94a3b8";
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
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0b1220 0%, #1a2540 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#94a3b8",
        fontFamily: "var(--font-display)",
      }}>
        Loading ticket...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0b1220 0%, #1a2540 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#f87171",
        fontFamily: "var(--font-display)",
      }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0b1220 0%, #1a2540 100%)",
      padding: "120px 2rem 60px",
      fontFamily: "var(--font-display)",
    }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>

        {/* Back Button */}
        <button
          onClick={() => navigate("/incidents")}
          style={{
            background: "transparent",
            border: "none",
            color: "#94a3b8",
            cursor: "pointer",
            fontSize: "14px",
            marginBottom: "24px",
            padding: 0,
          }}
        >
          Back to Incidents
        </button>

        {/* Ticket Header Card */}
        <div style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "20px",
          padding: "32px",
          marginBottom: "24px",
        }}>
          {/* Status and Priority Row */}
          <div style={{
            display: "flex",
            gap: "12px",
            alignItems: "center",
            marginBottom: "16px",
            flexWrap: "wrap",
          }}>
            <span style={{
              padding: "6px 14px",
              borderRadius: "999px",
              fontSize: "13px",
              fontWeight: 700,
              background: "rgba(255,255,255,0.08)",
              color: getStatusColor(ticket.status),
            }}>
              {ticket.status}
            </span>

            <span style={{
              fontSize: "13px",
              fontWeight: 700,
              color: getPriorityColor(ticket.priority),
            }}>
              {ticket.priority} PRIORITY
            </span>

            <span style={{ fontSize: "13px", color: "#64748b" }}>
              {ticket.category}
            </span>
          </div>

          {/* Ticket ID */}
          <h1 style={{
            color: "#fff",
            fontSize: "24px",
            fontWeight: 800,
            margin: "0 0 24px",
          }}>
            Ticket #{ticket.id ? ticket.id.slice(-6).toUpperCase() : ""}
          </h1>

          {/* Details Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "20px",
            marginBottom: "24px",
          }}>
            <div>
              <p style={{ color: "#64748b", fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 4px" }}>
                Reported By
              </p>
              <p style={{ color: "#e2e8f0", fontSize: "14px", margin: 0 }}>
                {ticket.createdByName}
              </p>
            </div>

            <div>
              <p style={{ color: "#64748b", fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 4px" }}>
                Location / Resource
              </p>
              <p style={{ color: "#e2e8f0", fontSize: "14px", margin: 0 }}>
                {ticket.resourceName || "N/A"}
              </p>
            </div>

            <div>
              <p style={{ color: "#64748b", fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 4px" }}>
                Contact
              </p>
              <p style={{ color: "#e2e8f0", fontSize: "14px", margin: 0 }}>
                {ticket.contactDetails}
              </p>
            </div>

            <div>
              <p style={{ color: "#64748b", fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 4px" }}>
                Assigned To
              </p>
              <p style={{ color: "#e2e8f0", fontSize: "14px", margin: 0 }}>
                {ticket.assignedToName || "Unassigned"}
              </p>
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: "20px" }}>
            <p style={{ color: "#64748b", fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 8px" }}>
              Description
            </p>
            <p style={{ color: "#e2e8f0", fontSize: "15px", lineHeight: 1.7, margin: 0 }}>
              {ticket.description}
            </p>
          </div>

          {/* Resolution Notes */}
          {ticket.resolutionNotes && (
            <div style={{
              marginTop: "20px",
              padding: "16px",
              background: "rgba(16,185,129,0.08)",
              borderRadius: "10px",
              border: "1px solid rgba(16,185,129,0.2)",
            }}>
              <p style={{ color: "#10b981", fontSize: "12px", fontWeight: 600, textTransform: "uppercase", margin: "0 0 6px" }}>
                Resolution Notes
              </p>
              <p style={{ color: "#e2e8f0", fontSize: "14px", margin: 0 }}>
                {ticket.resolutionNotes}
              </p>
            </div>
          )}

          {/* Rejection Reason */}
          {ticket.rejectionReason && (
            <div style={{
              marginTop: "20px",
              padding: "16px",
              background: "rgba(239,68,68,0.08)",
              borderRadius: "10px",
              border: "1px solid rgba(239,68,68,0.2)",
            }}>
              <p style={{ color: "#f87171", fontSize: "12px", fontWeight: 600, textTransform: "uppercase", margin: "0 0 6px" }}>
                Rejection Reason
              </p>
              <p style={{ color: "#e2e8f0", fontSize: "14px", margin: 0 }}>
                {ticket.rejectionReason}
              </p>
            </div>
          )}

          {/* Attachments */}
          {ticket.attachments && ticket.attachments.length > 0 && (
            <div style={{ marginTop: "24px" }}>
              <p style={{ color: "#64748b", fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 12px" }}>
                Attachments
              </p>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                {ticket.attachments.map((filename, index) => (
                <a  
                    key={index}
                    href={"http://localhost:8080/uploads/tickets/" + filename}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: "8px 16px",
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: "8px",
                      color: "#94a3b8",
                      fontSize: "13px",
                      textDecoration: "none",
                    }}
                  >
                    Image {index + 1}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Admin Controls */}
        {isAdmin && ticket.status !== "CLOSED" && ticket.status !== "REJECTED" && (
          <div style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(244,180,0,0.2)",
            borderRadius: "20px",
            padding: "32px",
            marginBottom: "24px",
          }}>
            <h2 style={{ color: "var(--primary)", fontSize: "18px", fontWeight: 700, margin: "0 0 24px" }}>
              Admin Controls
            </h2>

            {/* Status Update */}
            <div style={{ marginBottom: "28px" }}>
              <p style={{ color: "#e2e8f0", fontSize: "14px", fontWeight: 600, margin: "0 0 12px" }}>
                Update Status
              </p>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {validNextStatuses(ticket.status).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusForm({ ...statusForm, status: s })}
                    style={{
                      padding: "8px 18px",
                      borderRadius: "8px",
                      border: statusForm.status === s
                        ? "2px solid " + getStatusColor(s)
                        : "2px solid rgba(255,255,255,0.12)",
                      background: statusForm.status === s
                        ? "rgba(255,255,255,0.08)"
                        : "transparent",
                      color: statusForm.status === s
                        ? getStatusColor(s)
                        : "#94a3b8",
                      fontWeight: 600,
                      fontSize: "13px",
                      cursor: "pointer",
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {statusForm.status === "RESOLVED" && (
                <textarea
                  placeholder="Resolution notes (required)"
                  value={statusForm.resolutionNotes}
                  onChange={(e) => setStatusForm({ ...statusForm, resolutionNotes: e.target.value })}
                  rows={3}
                  style={{
                    width: "100%",
                    marginTop: "12px",
                    padding: "12px",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "10px",
                    color: "#fff",
                    fontSize: "14px",
                    outline: "none",
                    resize: "vertical",
                    boxSizing: "border-box",
                  }}
                />
              )}

              {statusForm.status === "REJECTED" && (
                <textarea
                  placeholder="Rejection reason (required)"
                  value={statusForm.rejectionReason}
                  onChange={(e) => setStatusForm({ ...statusForm, rejectionReason: e.target.value })}
                  rows={3}
                  style={{
                    width: "100%",
                    marginTop: "12px",
                    padding: "12px",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "10px",
                    color: "#fff",
                    fontSize: "14px",
                    outline: "none",
                    resize: "vertical",
                    boxSizing: "border-box",
                  }}
                />
              )}

              <button
                onClick={handleStatusUpdate}
                style={{
                  marginTop: "12px",
                  padding: "10px 24px",
                  background: "var(--primary)",
                  color: "#111827",
                  fontWeight: 700,
                  fontSize: "14px",
                  borderRadius: "10px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Update Status
              </button>
            </div>

            {/* Assign Technician */}
            <div>
              <p style={{ color: "#e2e8f0", fontSize: "14px", fontWeight: 600, margin: "0 0 12px" }}>
                Assign Technician
              </p>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <input
                  placeholder="Technician ID"
                  value={assignForm.technicianId}
                  onChange={(e) => setAssignForm({ ...assignForm, technicianId: e.target.value })}
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "10px",
                    color: "#fff",
                    fontSize: "14px",
                    outline: "none",
                    minWidth: "150px",
                  }}
                />
                <input
                  placeholder="Technician Name"
                  value={assignForm.technicianName}
                  onChange={(e) => setAssignForm({ ...assignForm, technicianName: e.target.value })}
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "10px",
                    color: "#fff",
                    fontSize: "14px",
                    outline: "none",
                    minWidth: "150px",
                  }}
                />
                <button
                  onClick={handleAssign}
                  style={{
                    padding: "10px 24px",
                    background: "rgba(244,180,0,0.15)",
                    color: "var(--primary)",
                    border: "1px solid rgba(244,180,0,0.3)",
                    borderRadius: "10px",
                    fontWeight: 700,
                    fontSize: "14px",
                    cursor: "pointer",
                  }}
                >
                  Assign
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Comments Section */}
        <div style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "20px",
          padding: "32px",
        }}>
          <h2 style={{ color: "#fff", fontSize: "18px", fontWeight: 700, margin: "0 0 24px" }}>
            Comments ({ticket.comments ? ticket.comments.length : 0})
          </h2>

          {/* No comments */}
          {ticket.comments && ticket.comments.length === 0 && (
            <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "24px" }}>
              No comments yet. Be the first to comment!
            </p>
          )}

          {/* Comment List */}
          {ticket.comments && ticket.comments.map((comment) => {
            const isOwner = comment.authorId === userId;
            const isEditing = editingCommentId === comment.id;

            return (
              <div
                key={comment.id}
                style={{
                  padding: "16px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "12px",
                  marginBottom: "12px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ color: "var(--primary)", fontSize: "13px", fontWeight: 600 }}>
                    {comment.authorName}
                  </span>
                  <span style={{ color: "#64748b", fontSize: "12px" }}>
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {isEditing ? (
                  <div>
                    <textarea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      rows={3}
                      style={{
                        width: "100%",
                        padding: "10px",
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        borderRadius: "8px",
                        color: "#fff",
                        fontSize: "14px",
                        outline: "none",
                        resize: "vertical",
                        boxSizing: "border-box",
                        marginBottom: "8px",
                      }}
                    />
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => handleEditComment(comment.id)}
                        style={{
                          padding: "6px 16px",
                          background: "var(--primary)",
                          color: "#111827",
                          border: "none",
                          borderRadius: "6px",
                          fontWeight: 600,
                          fontSize: "13px",
                          cursor: "pointer",
                        }}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingCommentId(null)}
                        style={{
                          padding: "6px 16px",
                          background: "transparent",
                          color: "#94a3b8",
                          border: "1px solid rgba(255,255,255,0.12)",
                          borderRadius: "6px",
                          fontSize: "13px",
                          cursor: "pointer",
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p style={{ color: "#e2e8f0", fontSize: "14px", margin: "0 0 8px", lineHeight: 1.6 }}>
                      {comment.content}
                    </p>
                    {(isOwner || isAdmin) && (
                      <div style={{ display: "flex", gap: "8px" }}>
                        {isOwner && (
                          <button
                            onClick={() => {
                              setEditingCommentId(comment.id);
                              setEditingContent(comment.content);
                            }}
                            style={{
                              padding: "4px 12px",
                              background: "transparent",
                              color: "#94a3b8",
                              border: "1px solid rgba(255,255,255,0.12)",
                              borderRadius: "6px",
                              fontSize: "12px",
                              cursor: "pointer",
                            }}
                          >
                            Edit
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          style={{
                            padding: "4px 12px",
                            background: "transparent",
                            color: "#f87171",
                            border: "1px solid rgba(239,68,68,0.3)",
                            borderRadius: "6px",
                            fontSize: "12px",
                            cursor: "pointer",
                          }}
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

          {/* Add Comment Box */}
          <div style={{ marginTop: "24px" }}>
            <textarea
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              style={{
                width: "100%",
                padding: "12px 16px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "10px",
                color: "#fff",
                fontSize: "14px",
                outline: "none",
                resize: "vertical",
                boxSizing: "border-box",
                marginBottom: "12px",
              }}
            />
            <button
              onClick={handleAddComment}
              disabled={commentLoading || !newComment.trim()}
              style={{
                padding: "10px 24px",
                background: "var(--primary)",
                color: "#111827",
                fontWeight: 700,
                fontSize: "14px",
                borderRadius: "10px",
                border: "none",
                cursor: commentLoading || !newComment.trim() ? "not-allowed" : "pointer",
                opacity: commentLoading || !newComment.trim() ? 0.6 : 1,
              }}
            >
              {commentLoading ? "Posting..." : "Post Comment"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}