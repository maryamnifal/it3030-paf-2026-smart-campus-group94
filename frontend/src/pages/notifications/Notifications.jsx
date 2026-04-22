import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  getNotificationsByUser,
  getAllNotifications,
  createNotification,
  updateNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../../api/notificationApi";

function Notifications() {
  const { userId, role } = useAuth();
  const isAdmin = role === "ADMIN";

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);
  const [formData, setFormData] = useState({
    userId: "",
    title: "",
    message: "",
    type: "SYSTEM",
  });

  const isMobile = window.innerWidth <= 900;

  const typeColors = {
    BOOKING: { bg: "#dbeafe", color: "#1d4ed8" },
    SYSTEM:  { bg: "#f3f4f6", color: "#374151" },
    RESOURCE:{ bg: "#d1fae5", color: "#065f46" },
    ALERT:   { bg: "#fee2e2", color: "#dc2626" },
    UPDATE:  { bg: "#ede9fe", color: "#6d28d9" },
  };

  // ─── FETCH ───────────────────────────────────────────────────────────
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = isAdmin
        ? await getAllNotifications()
        : await getNotificationsByUser(userId);
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchNotifications();
  }, [userId]);

  // ─── FORM HANDLERS ────────────────────────────────────────────────────
  const handleOpenCreate = () => {
    setEditingNotification(null);
    setFormData({ userId: "", title: "", message: "", type: "SYSTEM" });
    setShowForm(true);
  };

  const handleOpenEdit = (n) => {
    setEditingNotification(n);
    setFormData({
      userId: n.userId,
      title: n.title,
      message: n.message,
      type: n.type,
    });
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setFormData({ userId: "", title: "", message: "", type: "SYSTEM" });
    setEditingNotification(null);
    setShowForm(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.message.trim()) {
      alert("Please fill in all fields");
      return;
    }
    if (isAdmin && !formData.userId.trim()) {
      alert("Please enter a User ID");
      return;
    }
    try {
      setCreating(true);
      if (editingNotification) {
        await updateNotification(editingNotification.id, formData);
      } else {
        await createNotification({
          ...formData,
          userId: isAdmin ? formData.userId : userId,
        });
      }
      handleCloseForm();
      fetchNotifications();
    } catch (error) {
      console.error("Error saving notification:", error);
      alert("Failed to save notification");
    } finally {
      setCreating(false);
    }
  };

  // ─── ACTION HANDLERS ──────────────────────────────────────────────────
  const handleMarkAsRead = async (id) => {
    await markNotificationAsRead(id);
    fetchNotifications();
  };

  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsRead(userId);
    fetchNotifications();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this notification?")) return;
    await deleteNotification(id);
    fetchNotifications();
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  // ─── RENDER ───────────────────────────────────────────────────────────
  return (
    <>
      {/* HERO */}
      <div style={{
        background: "linear-gradient(135deg, #0f172a 0%, #334155 100%)",
        color: "#ffffff",
        padding: "120px 2rem 64px",
        borderRadius: "0 0 32px 32px",
        marginBottom: "32px",
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{
            display: "inline-block",
            padding: "10px 18px",
            borderRadius: "999px",
            backgroundColor: "rgba(255,255,255,0.12)",
            marginBottom: "20px",
            fontWeight: "600",
            fontSize: "14px",
          }}>
            {isAdmin ? "🛡 ADMIN — NOTIFICATION MANAGEMENT" : "🔔 MY NOTIFICATIONS"}
          </div>
          <h1 style={{
            fontSize: isMobile ? "36px" : "60px",
            fontWeight: "800",
            lineHeight: "1.1",
            margin: "0 0 16px",
          }}>
            {isAdmin ? "Manage All Notifications" : "Stay Updated"}
          </h1>
          <p style={{ fontSize: "18px", color: "rgba(255,255,255,0.8)", margin: 0 }}>
            {isAdmin
              ? "Create, update, and delete notifications for any user."
              : "View and manage your campus notifications."}
          </p>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 2rem 60px" }}>

        {/* TOP BAR */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "28px",
          flexWrap: "wrap",
          gap: "12px",
        }}>
          <div>
            <h2 style={{ margin: "0 0 4px", fontSize: "22px", fontWeight: "700" }}>
              {isAdmin ? "All Notifications" : "Your Notifications"}
            </h2>
            <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
              {notifications.length} notification{notifications.length !== 1 ? "s" : ""}
              {!isAdmin && ` • ${unreadCount} unread`}
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {/* Mark All Read — USER only */}
            {!isAdmin && unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                style={{
                  padding: "10px 18px",
                  background: "#f0fdf4",
                  color: "#16a34a",
                  border: "1px solid #bbf7d0",
                  borderRadius: "10px",
                  fontWeight: "700",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                ✓ Mark All Read
              </button>
            )}

            {/* Create — ADMIN only */}
            {isAdmin && (
              <button
                onClick={handleOpenCreate}
                style={{
                  padding: "10px 20px",
                  background: "#eab308",
                  border: "none",
                  borderRadius: "10px",
                  fontWeight: "700",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                + New Notification
              </button>
            )}
          </div>
        </div>

        {/* GRID */}
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 300px",
          gap: "24px",
        }}>

          {/* NOTIFICATIONS LIST */}
          <div>
            {loading ? (
              <div style={{
                textAlign: "center", padding: "48px",
                background: "#fff", borderRadius: "16px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
              }}>
                <p style={{ color: "#999" }}>Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div style={{
                textAlign: "center", padding: "48px",
                background: "#fff", borderRadius: "16px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
              }}>
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>🔔</div>
                <h3 style={{ color: "#333", margin: "0 0 8px" }}>No notifications yet</h3>
                <p style={{ color: "#999", fontSize: "14px", margin: 0 }}>
                  {isAdmin
                    ? "Create a notification using the button above."
                    : "Your notifications will appear here."}
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {notifications.map((n) => (
                  <div key={n.id} style={{
                    background: "#fff",
                    border: n.read ? "1px solid #e5e7eb" : "2px solid #eab308",
                    borderRadius: "14px",
                    padding: "18px",
                    boxShadow: n.read
                      ? "0 1px 4px rgba(0,0,0,0.05)"
                      : "0 4px 12px rgba(234,179,8,0.15)",
                    transition: "all 0.2s ease",
                  }}>

                    {/* CARD HEADER */}
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "10px",
                    }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{
                          margin: "0 0 4px",
                          fontSize: "16px",
                          fontWeight: "700",
                          color: "#1f2937",
                        }}>
                          {n.title}
                        </h4>
                        <p style={{
                          margin: 0,
                          fontSize: "14px",
                          color: "#555",
                          lineHeight: "1.5",
                        }}>
                          {n.message}
                        </p>
                      </div>
                      <span style={{
                        padding: "4px 10px",
                        background: n.read ? "#e5e7eb" : "#fef3c7",
                        color: n.read ? "#666" : "#d97706",
                        borderRadius: "6px",
                        fontSize: "11px",
                        fontWeight: "700",
                        marginLeft: "12px",
                        whiteSpace: "nowrap",
                      }}>
                        {n.read ? "Read" : "Unread"}
                      </span>
                    </div>

                    {/* META ROW */}
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingTop: "10px",
                      borderTop: "1px solid #f0f0f0",
                      marginBottom: "12px",
                      flexWrap: "wrap",
                      gap: "8px",
                    }}>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        {/* Type badge */}
                        <span style={{
                          background: typeColors[n.type]?.bg || "#f3f4f6",
                          color: typeColors[n.type]?.color || "#374151",
                          padding: "3px 10px",
                          borderRadius: "6px",
                          fontWeight: "700",
                          fontSize: "11px",
                        }}>
                          {n.type}
                        </span>

                        {/* Source badge */}
                        <span style={{
                          background: n.source === "SYSTEM" ? "#f0fdf4" : "#fefce8",
                          color: n.source === "SYSTEM" ? "#16a34a" : "#ca8a04",
                          padding: "3px 10px",
                          borderRadius: "6px",
                          fontWeight: "700",
                          fontSize: "11px",
                        }}>
                          {n.source === "SYSTEM" ? "🤖 System" : "👤 Admin"}
                        </span>
                      </div>

                      {/* Show userId for admin */}
                      {isAdmin && (
                        <span style={{ color: "#94a3b8", fontSize: "12px" }}>
                          User: {n.userId}
                        </span>
                      )}
                    </div>

                    {/* ACTION BUTTONS */}
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>

                      {/* Mark as Read — USER only */}
                      {!isAdmin && !n.read && (
                        <button
                          onClick={() => handleMarkAsRead(n.id)}
                          style={{
                            flex: 1,
                            padding: "8px 12px",
                            background: "#eab308",
                            color: "#000",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "13px",
                            fontWeight: "600",
                            cursor: "pointer",
                          }}
                        >
                          ✓ Mark as Read
                        </button>
                      )}

                      {/* Edit — ADMIN only, ADMIN-created only */}
                      {isAdmin && n.source !== "SYSTEM" && (
                        <button
                          onClick={() => handleOpenEdit(n)}
                          style={{
                            flex: 1,
                            padding: "8px 12px",
                            background: "#eff6ff",
                            color: "#1d4ed8",
                            border: "1px solid #bfdbfe",
                            borderRadius: "8px",
                            fontSize: "13px",
                            fontWeight: "600",
                            cursor: "pointer",
                          }}
                        >
                          ✏️ Edit
                        </button>
                      )}

                      {/* System Generated label — not editable */}
                      {isAdmin && n.source === "SYSTEM" && (
                        <span style={{
                          flex: 1,
                          padding: "8px 12px",
                          background: "#f1f5f9",
                          color: "#94a3b8",
                          borderRadius: "8px",
                          fontSize: "12px",
                          fontWeight: "600",
                          textAlign: "center",
                        }}>
                          🤖 System Generated
                        </span>
                      )}

                      {/* Delete — both USER and ADMIN */}
                      <button
                        onClick={() => handleDelete(n.id)}
                        style={{
                          flex: 1,
                          padding: "8px 12px",
                          background: "#f3f4f6",
                          color: "#666",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          fontSize: "13px",
                          fontWeight: "600",
                          cursor: "pointer",
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = "#fee2e2";
                          e.currentTarget.style.color = "#dc2626";
                          e.currentTarget.style.borderColor = "#fecaca";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = "#f3f4f6";
                          e.currentTarget.style.color = "#666";
                          e.currentTarget.style.borderColor = "#e5e7eb";
                        }}
                      >
                        🗑 Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SIDEBAR */}
          <div style={{
            background: "linear-gradient(135deg, #f0f9ff, #f5f3ff)",
            padding: "20px",
            borderRadius: "16px",
            border: "1px solid #e0e7ff",
            height: "fit-content",
            position: "sticky",
            top: "90px",
          }}>
            <h3 style={{ margin: "0 0 20px", fontSize: "16px", fontWeight: "700", color: "#1f2937" }}>
              Overview
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

              <div style={{
                padding: "14px",
                background: "rgba(255,255,255,0.8)",
                borderRadius: "10px",
                border: "1px solid #e5e7eb",
              }}>
                <p style={{ margin: "0 0 4px", fontSize: "11px", color: "#999", fontWeight: "700" }}>TOTAL</p>
                <p style={{ margin: 0, fontSize: "28px", fontWeight: "800", color: "#0f172a" }}>
                  {notifications.length}
                </p>
              </div>

              {!isAdmin && (
                <div style={{
                  padding: "14px",
                  background: "rgba(234,179,8,0.1)",
                  borderRadius: "10px",
                  border: "1px solid rgba(234,179,8,0.3)",
                }}>
                  <p style={{ margin: "0 0 4px", fontSize: "11px", color: "#999", fontWeight: "700" }}>UNREAD</p>
                  <p style={{ margin: 0, fontSize: "28px", fontWeight: "800", color: "#d4a206" }}>
                    {unreadCount}
                  </p>
                </div>
              )}

              {isAdmin && (
                <>
                  <div style={{
                    padding: "14px",
                    background: "rgba(239,246,255,0.8)",
                    borderRadius: "10px",
                    border: "1px solid #bfdbfe",
                  }}>
                    <p style={{ margin: "0 0 4px", fontSize: "11px", color: "#999", fontWeight: "700" }}>USERS NOTIFIED</p>
                    <p style={{ margin: 0, fontSize: "28px", fontWeight: "800", color: "#1d4ed8" }}>
                      {new Set(notifications.map((n) => n.userId)).size}
                    </p>
                  </div>

                  <div style={{
                    padding: "14px",
                    background: "rgba(240,253,244,0.8)",
                    borderRadius: "10px",
                    border: "1px solid #bbf7d0",
                  }}>
                    <p style={{ margin: "0 0 4px", fontSize: "11px", color: "#999", fontWeight: "700" }}>SYSTEM GENERATED</p>
                    <p style={{ margin: 0, fontSize: "28px", fontWeight: "800", color: "#16a34a" }}>
                      {notifications.filter((n) => n.source === "SYSTEM").length}
                    </p>
                  </div>

                  <div style={{
                    padding: "14px",
                    background: "rgba(254,252,232,0.8)",
                    borderRadius: "10px",
                    border: "1px solid #fde68a",
                  }}>
                    <p style={{ margin: "0 0 4px", fontSize: "11px", color: "#999", fontWeight: "700" }}>ADMIN CREATED</p>
                    <p style={{ margin: 0, fontSize: "28px", fontWeight: "800", color: "#ca8a04" }}>
                      {notifications.filter((n) => n.source === "ADMIN").length}
                    </p>
                  </div>
                </>
              )}

              <div style={{
                padding: "14px",
                background: "rgba(255,255,255,0.6)",
                borderRadius: "10px",
                border: "1px solid #e5e7eb",
              }}>
                <p style={{ margin: "0 0 4px", fontSize: "11px", color: "#999", fontWeight: "700" }}>ROLE</p>
                <p style={{ margin: 0, fontSize: "14px", fontWeight: "700", color: isAdmin ? "#dc2626" : "#16a34a" }}>
                  {isAdmin ? "🛡 Administrator" : "👤 User"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {showForm && (
        <div
          onClick={handleCloseForm}
          style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex", justifyContent: "center", alignItems: "center",
            zIndex: 1000, backdropFilter: "blur(4px)",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: "20px",
              padding: "32px",
              width: "90%",
              maxWidth: "500px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
          >
            <h2 style={{ margin: "0 0 24px", fontSize: "22px", fontWeight: "800", color: "#1f2937" }}>
              {editingNotification ? "Edit Notification" : "Create Notification"}
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>

              {/* User ID — ADMIN only, create mode only */}
              {isAdmin && !editingNotification && (
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "700", color: "#1f2937" }}>
                    Target User ID
                  </label>
                  <input
                    type="text"
                    name="userId"
                    value={formData.userId}
                    onChange={handleFormChange}
                    placeholder="Paste user's MongoDB ID"
                    style={{
                      width: "100%", padding: "11px 14px", fontSize: "14px",
                      border: "2px solid #e5e7eb", borderRadius: "10px",
                      boxSizing: "border-box", outline: "none",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#eab308")}
                    onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                  />
                </div>
              )}

              {/* Title */}
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "700", color: "#1f2937" }}>
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  placeholder="e.g., Booking Approved"
                  style={{
                    width: "100%", padding: "11px 14px", fontSize: "14px",
                    border: "2px solid #e5e7eb", borderRadius: "10px",
                    boxSizing: "border-box", outline: "none",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#eab308")}
                  onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                />
              </div>

              {/* Message */}
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "700", color: "#1f2937" }}>
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleFormChange}
                  placeholder="Enter notification message..."
                  rows="4"
                  style={{
                    width: "100%", padding: "11px 14px", fontSize: "14px",
                    border: "2px solid #e5e7eb", borderRadius: "10px",
                    boxSizing: "border-box", outline: "none", resize: "none",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#eab308")}
                  onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                />
              </div>

              {/* Type */}
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "700", color: "#1f2937" }}>
                  Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleFormChange}
                  style={{
                    width: "100%", padding: "11px 14px", fontSize: "14px",
                    border: "2px solid #e5e7eb", borderRadius: "10px",
                    boxSizing: "border-box", outline: "none", cursor: "pointer",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#eab308")}
                  onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                >
                  <option value="SYSTEM">System</option>
                  <option value="BOOKING">Booking</option>
                  <option value="RESOURCE">Resource</option>
                  <option value="ALERT">Alert</option>
                  <option value="UPDATE">Update</option>
                </select>
              </div>
            </div>

            {/* BUTTONS */}
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={handleCloseForm}
                style={{
                  flex: 1, padding: "12px",
                  background: "#f3f4f6", color: "#666",
                  border: "1px solid #e5e7eb", borderRadius: "10px",
                  fontSize: "14px", fontWeight: "700", cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={creating}
                style={{
                  flex: 1, padding: "12px",
                  background: "#eab308", color: "#000",
                  border: "none", borderRadius: "10px",
                  fontSize: "14px", fontWeight: "700",
                  cursor: creating ? "not-allowed" : "pointer",
                  opacity: creating ? 0.7 : 1,
                }}
              >
                {creating ? "Saving..." : editingNotification ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}

export default Notifications;