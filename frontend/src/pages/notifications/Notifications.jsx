import { useEffect, useState } from "react";
import {
  getNotificationsByUser,
  createNotification,
  markNotificationAsRead,
  deleteNotification,
} from "../../api/notificationApi";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "SYSTEM",
  });

  const userId = "123"; // temporary

  const fetchNotifications = async () => {
    try {
      const data = await getNotificationsByUser(userId);
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleCreateNotification = async () => {
    if (!formData.title.trim() || !formData.message.trim()) {
      alert("Please fill in all fields");
      return;
    }
    try {
      setCreating(true);
      await createNotification({
        userId,
        title: formData.title,
        message: formData.message,
        type: formData.type,
      });
      setFormData({ title: "", message: "", type: "SYSTEM" });
      setShowForm(false);
      fetchNotifications();
    } catch (error) {
      console.error("Error creating notification:", error);
      alert("Failed to create notification");
    } finally {
      setCreating(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCloseForm = () => {
    setFormData({ title: "", message: "", type: "SYSTEM" });
    setShowForm(false);
  };

  const handleMarkAsRead = async (id) => {
    await markNotificationAsRead(id);
    fetchNotifications();
  };

  const handleDelete = async (id) => {
    await deleteNotification(id);
    fetchNotifications();
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const isMobile = window.innerWidth <= 900;

  return (
    <>
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #334155 100%)",
          color: "#ffffff",
          padding: "140px 2rem 64px",
          borderRadius: "0 0 32px 32px",
          marginBottom: "32px",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              display: "inline-block",
              padding: "10px 18px",
              borderRadius: "999px",
              backgroundColor: "rgba(255,255,255,0.12)",
              marginBottom: "20px",
              fontWeight: "600",
              fontSize: "14px",
              letterSpacing: "0.3px",
            }}
          >
            NOTIFICATION MANAGEMENT
          </div>

          <h1
            style={{
              fontSize: isMobile ? "40px" : "64px",
              fontWeight: "800",
              lineHeight: "1.1",
              margin: "0 0 20px 0",
              maxWidth: "980px",
            }}
          >
            Stay updated with every important campus activity.
          </h1>

          <p
            style={{
              fontSize: "20px",
              lineHeight: "1.7",
              color: "rgba(255,255,255,0.85)",
              margin: 0,
              maxWidth: "760px",
            }}
          >
            View, manage, and track notifications for bookings, tickets, and
            system alerts.
          </p>
        </div>
      </div>

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 2rem 40px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "28px",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <h2
              style={{
                margin: "0 0 4px 0",
                fontSize: "24px",
                fontWeight: "700",
              }}
            >
              Your Notifications
            </h2>
            <p style={{ margin: "0", color: "#666", fontSize: "14px" }}>
              {notifications.length} notification
              {notifications.length !== 1 ? "s" : ""} • {unreadCount} unread
            </p>
          </div>

          <button
            onClick={() => setShowForm(true)}
            disabled={creating}
            style={{
              padding: "12px 24px",
              background: "#eab308",
              border: "none",
              borderRadius: "10px",
              fontWeight: "700",
              cursor: "pointer",
              fontSize: "14px",
              transition: "all 0.2s ease",
              boxShadow: "0 2px 8px rgba(234, 179, 8, 0.2)",
              opacity: creating ? 0.7 : 1,
            }}
            onMouseOver={(e) =>
              !creating &&
              (e.target.style.boxShadow = "0 4px 12px rgba(234, 179, 8, 0.3)")
            }
            onMouseOut={(e) =>
              !creating &&
              (e.target.style.boxShadow = "0 2px 8px rgba(234, 179, 8, 0.2)")
            }
          >
            {creating ? "Adding..." : "+ New Notification"}
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 320px",
            gap: "24px",
          }}
        >
          <div>
            {loading ? (
              <div
                style={{
                  background: "#ffffff",
                  padding: "48px 24px",
                  borderRadius: "16px",
                  textAlign: "center",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                }}
              >
                <p style={{ color: "#999", fontSize: "16px" }}>
                  Loading notifications...
                </p>
              </div>
            ) : notifications.length === 0 ? (
              <div
                style={{
                  background: "#ffffff",
                  padding: "48px 24px",
                  borderRadius: "16px",
                  textAlign: "center",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                }}
              >
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>🔔</div>
                <h3 style={{ margin: "0 0 8px 0", color: "#333" }}>
                  No notifications yet
                </h3>
                <p style={{ margin: "0", color: "#999", fontSize: "14px" }}>
                  Your notifications will appear here
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    style={{
                      background: "#ffffff",
                      border: n.read
                        ? "1px solid #e5e7eb"
                        : "2px solid #eab308",
                      borderRadius: "12px",
                      padding: "16px",
                      boxShadow: n.read
                        ? "0 1px 4px rgba(0,0,0,0.05)"
                        : "0 4px 12px rgba(234, 179, 8, 0.15)",
                      transition: "all 0.2s ease",
                      cursor: "pointer",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.boxShadow = n.read
                        ? "0 4px 12px rgba(0,0,0,0.1)"
                        : "0 6px 16px rgba(234, 179, 8, 0.2)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.boxShadow = n.read
                        ? "0 1px 4px rgba(0,0,0,0.05)"
                        : "0 4px 12px rgba(234, 179, 8, 0.15)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "10px",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <h4
                          style={{
                            margin: "0 0 4px 0",
                            fontSize: "16px",
                            fontWeight: "700",
                            color: "#1f2937",
                          }}
                        >
                          {n.title}
                        </h4>
                        <p
                          style={{
                            margin: "0",
                            fontSize: "14px",
                            color: "#666",
                            lineHeight: "1.5",
                          }}
                        >
                          {n.message}
                        </p>
                      </div>
                      <div
                        style={{
                          display: "inline-block",
                          padding: "4px 10px",
                          background: n.read ? "#e5e7eb" : "#fef3c7",
                          color: n.read ? "#666" : "#d97706",
                          borderRadius: "6px",
                          fontSize: "11px",
                          fontWeight: "700",
                          marginLeft: "12px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {n.read ? "Read" : "Unread"}
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: "12px",
                        color: "#999",
                        marginBottom: "12px",
                        paddingTop: "10px",
                        borderTop: "1px solid #f0f0f0",
                      }}
                    >
                      <span
                        style={{
                          background: "#f3f4f6",
                          padding: "3px 8px",
                          borderRadius: "4px",
                        }}
                      >
                        {n.type}
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: "8px" }}>
                      {!n.read && (
                        <button
                          onClick={() => handleMarkAsRead(n.id)}
                          style={{
                            flex: 1,
                            padding: "8px 12px",
                            background: "#eab308",
                            color: "#000",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "13px",
                            fontWeight: "600",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                          }}
                          onMouseOver={(e) =>
                            (e.target.style.background = "#d4a206")
                          }
                          onMouseOut={(e) =>
                            (e.target.style.background = "#eab308")
                          }
                        >
                          ✓ Mark as Read
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(n.id)}
                        style={{
                          flex: 1,
                          padding: "8px 12px",
                          background: "#f3f4f6",
                          color: "#666",
                          border: "1px solid #e5e7eb",
                          borderRadius: "6px",
                          fontSize: "13px",
                          fontWeight: "600",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                        onMouseOver={(e) => {
                          e.target.style.background = "#fee2e2";
                          e.target.style.color = "#dc2626";
                          e.target.style.borderColor = "#fecaca";
                        }}
                        onMouseOut={(e) => {
                          e.target.style.background = "#f3f4f6";
                          e.target.style.color = "#666";
                          e.target.style.borderColor = "#e5e7eb";
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

          <div
            style={{
              background: "linear-gradient(135deg, #f0f9ff 0%, #f5f3ff 100%)",
              padding: "20px",
              borderRadius: "16px",
              border: "1px solid #e0e7ff",
              height: "fit-content",
              position: "sticky",
              top: "20px",
            }}
          >
            <h3
              style={{
                margin: "0 0 20px 0",
                fontSize: "16px",
                fontWeight: "700",
                color: "#1f2937",
              }}
            >
              Overview
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div
                style={{
                  padding: "12px",
                  background: "rgba(255,255,255,0.7)",
                  borderRadius: "10px",
                  border: "1px solid #e5e7eb",
                }}
              >
                <p
                  style={{
                    margin: "0 0 6px 0",
                    fontSize: "12px",
                    color: "#999",
                    fontWeight: "600",
                  }}
                >
                  TOTAL
                </p>
                <p
                  style={{
                    margin: "0",
                    fontSize: "24px",
                    fontWeight: "800",
                    color: "#0f172a",
                  }}
                >
                  {notifications.length}
                </p>
              </div>

              <div
                style={{
                  padding: "12px",
                  background: "rgba(234, 179, 8, 0.1)",
                  borderRadius: "10px",
                  border: "1px solid rgba(234, 179, 8, 0.3)",
                }}
              >
                <p
                  style={{
                    margin: "0 0 6px 0",
                    fontSize: "12px",
                    color: "#999",
                    fontWeight: "600",
                  }}
                >
                  UNREAD
                </p>
                <p
                  style={{
                    margin: "0",
                    fontSize: "24px",
                    fontWeight: "800",
                    color: "#d4a206",
                  }}
                >
                  {unreadCount}
                </p>
              </div>

              <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "12px" }}>
                <p
                  style={{
                    margin: "0 0 6px 0",
                    fontSize: "12px",
                    color: "#999",
                    fontWeight: "600",
                  }}
                >
                  USER ID
                </p>
                <p
                  style={{
                    margin: "0",
                    fontSize: "13px",
                    fontWeight: "700",
                    color: "#1f2937",
                    background: "rgba(255,255,255,0.5)",
                    padding: "6px 8px",
                    borderRadius: "6px",
                    wordBreak: "break-all",
                  }}
                >
                  {userId}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            backdropFilter: "blur(4px)",
          }}
          onClick={handleCloseForm}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "20px",
              padding: "32px",
              width: "90%",
              maxWidth: "500px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              animation: "slideUp 0.3s ease",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              style={{
                margin: "0 0 24px 0",
                fontSize: "24px",
                fontWeight: "800",
                color: "#1f2937",
              }}
            >
              Create New Notification
            </h2>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                marginBottom: "24px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "14px",
                    fontWeight: "700",
                    color: "#1f2937",
                  }}
                >
                  Notification Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  placeholder="e.g., Resource Available"
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    fontSize: "14px",
                    border: "2px solid #e5e7eb",
                    borderRadius: "10px",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                    transition: "all 0.2s ease",
                    outline: "none",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#eab308")}
                  onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "14px",
                    fontWeight: "700",
                    color: "#1f2937",
                  }}
                >
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleFormChange}
                  placeholder="Enter notification message..."
                  rows="4"
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    fontSize: "14px",
                    border: "2px solid #e5e7eb",
                    borderRadius: "10px",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                    transition: "all 0.2s ease",
                    outline: "none",
                    resize: "none",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#eab308")}
                  onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "14px",
                    fontWeight: "700",
                    color: "#1f2937",
                  }}
                >
                  Notification Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleFormChange}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    fontSize: "14px",
                    border: "2px solid #e5e7eb",
                    borderRadius: "10px",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    outline: "none",
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

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={handleCloseForm}
                style={{
                  flex: 1,
                  padding: "12px 20px",
                  background: "#f3f4f6",
                  color: "#666",
                  border: "1px solid #e5e7eb",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: "700",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseOver={(e) => {
                  e.target.style.background = "#e5e7eb";
                }}
                onMouseOut={(e) => {
                  e.target.style.background = "#f3f4f6";
                }}
              >
                Cancel
              </button>

              <button
                onClick={handleCreateNotification}
                disabled={creating}
                style={{
                  flex: 1,
                  padding: "12px 20px",
                  background: "#eab308",
                  color: "#000",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: "700",
                  cursor: creating ? "not-allowed" : "pointer",
                  transition: "all 0.2s ease",
                  opacity: creating ? 0.7 : 1,
                }}
                onMouseOver={(e) =>
                  !creating && (e.target.style.background = "#d4a206")
                }
                onMouseOut={(e) =>
                  !creating && (e.target.style.background = "#eab308")
                }
              >
                {creating ? "Creating..." : "Create Notification"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}

export default Notifications;