import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Bell } from "lucide-react";
import { getNotificationsByUser } from "../api/notificationApi";

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

  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!userId || !token) return;

      try {
        const notifications = await getNotificationsByUser(userId);
        const unread = notifications.filter((n) => !n.read).length;
        setUnreadCount(unread);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(interval);
  }, [userId, token]);

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
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
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
              {/* NOTIFICATION BELL */}
              <div
                onClick={() => navigate("/notifications")}
                title="Notifications"
                style={{
                  position: "relative",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                }}
              >
                <Bell size={20} color="#475569" />
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "2px",
                      right: "2px",
                      minWidth: "16px",
                      height: "16px",
                      background: "#ef4444",
                      color: "#fff",
                      borderRadius: "999px",
                      fontSize: "10px",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0 4px",
                      lineHeight: 1,
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </div>

              {/* USER DROPDOWN */}
              <div ref={dropdownRef} style={{ position: "relative" }}>
                <div
                  onClick={() => setMenuOpen((prev) => !prev)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#475569",
                    userSelect: "none",
                  }}
                >
                  <span>{name}</span>
                  <span
                    style={{
                      fontSize: "12px",
                      transform: menuOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s ease",
                    }}
                  >
                    ▼
                  </span>
                </div>

                {menuOpen && (
                  <div
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "42px",
                      width: "180px",
                      background: "#fff",
                      border: "1px solid rgba(15,23,42,0.08)",
                      borderRadius: "12px",
                      boxShadow: "0 12px 30px rgba(15,23,42,0.12)",
                      padding: "8px 0",
                      zIndex: 1100,
                    }}
                  >
                    <div
                      onClick={() => {
                        setMenuOpen(false);
                        navigate("/profile");
                      }}
                      style={menuItemStyle}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#f8fafc")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      Profile
                    </div>

                    {role !== "ADMIN" && (
                      <div
                        onClick={() => {
                          setMenuOpen(false);
                          navigate("/notification-preferences");
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
                      </div>
                    )}

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