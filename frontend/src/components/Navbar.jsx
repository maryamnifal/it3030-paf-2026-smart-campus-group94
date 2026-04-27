import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Bell, ChevronDown } from "lucide-react";
import { getNotificationsByUser, getAllNotifications } from "../api/notificationApi";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Dashboard", path: "/dashboard" },
  { label: "Facilities", path: "/facilities" },
  { label: "Bookings", path: "/bookings" },
  { label: "Incidents", path: "/incidents" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  const { token, name, role, userId, logout } = useAuth();

  const isLoginPage = location.pathname === "/login";
  const displayName = name || "User";
  const profileInitial = displayName.charAt(0).toUpperCase();

  // ✅ Fetch unread count
  // ADMIN = only ADMIN-created unread notifications
  // USER  = their own unread notifications
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!userId || !token) return;
      try {
        let unread = 0;
        if (role === "ADMIN") {
          const notifications = await getAllNotifications();
          // ✅ Admin only sees count of ADMIN-created unread notifications
          // SYSTEM notifications are for users — admin doesn't need to track them
          unread = notifications.filter(
            (n) => !n.read && n.source === "ADMIN"
          ).length;
        } else {
          const notifications = await getNotificationsByUser(userId);
          unread = notifications.filter((n) => !n.read).length;
        }
        setUnreadCount(unread);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };

    fetchUnreadCount();

    // Refresh faster when on notifications page
    const isOnNotificationsPage = location.pathname === "/notifications";
    const interval = setInterval(
      fetchUnreadCount,
      isOnNotificationsPage ? 5000 : 30000
    );

    return () => clearInterval(interval);
  }, [userId, token, role, location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate("/", { replace: true });
  };

  const menuItemStyle = {
    padding: "10px 16px",
    cursor: "pointer",
    fontSize: "14px",
    color: "#334155",
    transition: "background 0.2s ease",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  };

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 1000,
        background: "rgba(255, 255, 255, 0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(15,23,42,0.08)",
        boxShadow: scrolled
          ? "0 8px 24px rgba(15,23,42,0.08)"
          : "0 2px 8px rgba(15,23,42,0.04)",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 2rem",
          height: "70px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* LOGO */}
        <div
          onClick={() => navigate("/")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            cursor: "pointer",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              color: "#111827",
            }}
          >
            U
          </div>
          <div style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a" }}>
            Uni<span style={{ color: "var(--primary)" }}>Sphere</span>
          </div>
        </div>

        {/* NAV LINKS */}
        {!isLoginPage && (
          <div style={{ display: "flex", gap: "28px" }}>
            {navLinks.map((link) => {
              let targetPath = link.path;

              if (link.label === "Dashboard") {
                targetPath =
                  role === "ADMIN" ? "/admin/dashboard" : "/user/dashboard";
              }
              if (link.label === "Bookings") {
                targetPath = role === "ADMIN" ? "/admin/bookings" : "/bookings";
              }

              const active =
                link.label === "Dashboard"
                  ? location.pathname === "/admin/dashboard" ||
                    location.pathname === "/user/dashboard"
                  : link.label === "Bookings"
                  ? location.pathname === "/bookings" ||
                    location.pathname === "/admin/bookings"
                  : location.pathname === targetPath;

              return (
                <button
                  key={link.label}
                  onClick={() => navigate(targetPath)}
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "15px",
                    fontWeight: active ? 700 : 500,
                    color: active ? "#0f172a" : "#64748b",
                    position: "relative",
                    paddingBottom: "4px",
                  }}
                >
                  {link.label}
                  {active && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: "-6px",
                        left: 0,
                        right: 0,
                        height: "2px",
                        background: "var(--primary)",
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* RIGHT SIDE */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {isLoginPage ? (
            <button
              onClick={() => navigate("/")}
              style={{
                background: "transparent",
                border: "none",
                fontWeight: 600,
                cursor: "pointer",
                color: "#64748b",
              }}
            >
              ← Back to Home
            </button>
          ) : token ? (
            <>
              {/* 🔔 NOTIFICATION BELL — USER only */}
              {role !== "ADMIN" && (
                <div
                  onClick={() => navigate("/notifications")}
                  title="View Notifications"
                  style={{
                    position: "relative",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "34px",
                    height: "34px",
                    borderRadius: "8px",
                    flexShrink: 0,
                  }}
                >
                  <Bell size={20} color="#475569" />
                  {unreadCount > 0 && (
                    <span
                      style={{
                        position: "absolute",
                        top: "2px",
                        right: "2px",
                        minWidth: "14px",
                        height: "14px",
                        background: "#ef4444",
                        color: "#fff",
                        borderRadius: "999px",
                        fontSize: "9px",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "0 3px",
                        lineHeight: 1,
                      }}
                    >
                      {unreadCount}
                    </span>
                  )}
                </div>
              )}

              {/* 👤 USER DROPDOWN */}
              <div ref={dropdownRef} style={{ position: "relative" }}>
                <div
                  onClick={() => setMenuOpen((prev) => !prev)}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#f8fafc")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                    userSelect: "none",
                    padding: "4px 8px",
                    borderRadius: "999px",
                    transition: "background 0.2s ease",
                  }}
                >
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#475569",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {displayName}
                  </span>
                  <ChevronDown
                    size={16}
                    style={{
                      color: "#64748b",
                      transition: "transform 0.2s ease",
                      transform: menuOpen ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  />
                  <div
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "50%",
                      background: "var(--primary)",
                      color: "#111827",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "13px",
                      fontWeight: 800,
                      boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                      flexShrink: 0,
                    }}
                  >
                    {profileInitial}
                  </div>
                </div>

                {/* DROPDOWN MENU */}
                {menuOpen && (
                  <div
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "44px",
                      width: "210px",
                      background: "#fff",
                      border: "1px solid rgba(15,23,42,0.08)",
                      borderRadius: "14px",
                      boxShadow: "0 12px 30px rgba(15,23,42,0.12)",
                      padding: "8px 0",
                      zIndex: 1100,
                    }}
                  >
                    {/* Role Badge */}
                    <div style={{
                      padding: "8px 16px",
                      fontSize: "11px",
                      fontWeight: "700",
                      color: role === "ADMIN" ? "#dc2626" : "#16a34a",
                      background: role === "ADMIN" ? "#fef2f2" : "#f0fdf4",
                      marginBottom: "4px",
                    }}>
                      {role === "ADMIN" ? "🛡 Administrator" : "👤 User"}
                    </div>

                    {/* Notifications */}
                    <div
                      onClick={() => {
                        setMenuOpen(false);
                        navigate("/notifications");
                      }}
                      style={menuItemStyle}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#f8fafc")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      Notifications
                      {unreadCount > 0 && (
                        <span style={{
                          marginLeft: "auto",
                          background: "#ef4444",
                          color: "#fff",
                          borderRadius: "999px",
                          fontSize: "10px",
                          fontWeight: "700",
                          padding: "1px 6px",
                        }}>
                          {unreadCount}
                        </span>
                      )}
                    </div>

                    {/* Preferences — USER only */}
                    {role !== "ADMIN" && (
                      <div
                        onClick={() => {
                          setMenuOpen(false);
                          navigate("/preferences");
                        }}
                        style={menuItemStyle}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "#f8fafc")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                      >
                        Notification Preferences
                      </div>
                    )}

                    {/* Divider */}
                    <div style={{
                      height: "1px",
                      background: "#f1f5f9",
                      margin: "4px 0",
                    }} />

                    {/* Logout */}
                    <div
                      onClick={handleLogout}
                      style={{ ...menuItemStyle, color: "#ef4444" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#fef2f2")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      Logout
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button
              onClick={() => navigate("/login")}
              style={{
                background: "var(--primary)",
                color: "#111827",
                border: "none",
                padding: "10px 16px",
                borderRadius: "10px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Get Started
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}