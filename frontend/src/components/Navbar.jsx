import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Bell } from "lucide-react"; // ✅ NEW

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Dashboard", path: "/dashboard" },
  { label: "Facilities", path: "/facilities" },
  { label: "Bookings", path: "/bookings" },
  { label: "Incidents", path: "/incidents" },
  // ❌ Removed Notifications
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { token, name, role, logout } = useAuth();

  const isLoginPage = location.pathname === "/login";

  // 🔔 mock unread count (replace later with API)
  const unreadCount = 3;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 1000,
        background: "rgba(255,255,255,0.92)",
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

          <div
            style={{
              fontSize: "20px",
              fontWeight: 800,
              color: "#0f172a",
            }}
          >
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
                  role === "ADMIN"
                    ? "/admin/dashboard"
                    : "/user/dashboard";
              }

              if (link.label === "Bookings") {
                targetPath =
                  role === "ADMIN" ? "/admin/bookings" : "/bookings";
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
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
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
              {/* 🔔 Notification Bell */}
              <div
                onClick={() => navigate("/notifications")}
                style={{
                  position: "relative",
                  cursor: "pointer",
                  padding: "6px",
                  borderRadius: "8px",
                }}
              >
                <Bell size={20} color="#475569" />

                {unreadCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-2px",
                      right: "-2px",
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
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </div>

              {/* USER NAME */}
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#475569",
                }}
              >
                {name}
              </span>

              {/* LOGOUT */}
              <button
                onClick={handleLogout}
                style={{
                  background: "var(--primary)",
                  color: "#111827",
                  border: "none",
                  padding: "8px 14px",
                  borderRadius: "8px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                style={{
                  background: "transparent",
                  border: "none",
                  fontWeight: 600,
                  cursor: "pointer",
                  color: "#475569",
                }}
              >
                Login
              </button>

              <button
                onClick={() => navigate("/login")}
                style={{
                  background: "var(--primary)",
                  color: "#111827",
                  border: "none",
                  padding: "8px 14px",
                  borderRadius: "8px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Get Started
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}