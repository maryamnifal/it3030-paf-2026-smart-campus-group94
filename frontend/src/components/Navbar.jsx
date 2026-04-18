import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Facilities", path: "/facilities" },
  { label: "Bookings", path: "/bookings" },
  { label: "Incidents", path: "/incidents" },
  { label: "Notifications", path: "/notifications" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { token, name, role, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navTextColor = "#ffffff";
  const mutedTextColor = "rgba(255,255,255,0.88)";

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const dashboardPath =
    role === "ADMIN" ? "/admin/dashboard" : "/user/dashboard";

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: "transparent",
        transform: scrolled ? "translateY(-100%)" : "translateY(0)",
        transition: "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 2rem",
          height: "82px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "24px",
        }}
      >
        <div
          onClick={() => navigate("/")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            cursor: "pointer",
            flexShrink: 0,
            minWidth: "220px",
          }}
        >
          <div
            style={{
              width: "54px",
              height: "54px",
              borderRadius: "16px",
              background: "var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#111827",
              fontWeight: 800,
              fontSize: "26px",
              boxShadow: "0 10px 24px rgba(244, 180, 0, 0.28)",
            }}
          >
            U
          </div>

          <div
            style={{
              fontSize: "28px",
              fontWeight: 800,
              letterSpacing: "-0.5px",
              color: "#fff",
              lineHeight: 1,
              whiteSpace: "nowrap",
            }}
          >
            Uni<span style={{ color: "var(--primary)" }}>Sphere</span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flex: 1,
            justifyContent: "center",
          }}
        >
          {navLinks.map((link) => {
            let targetPath = link.path;

            if (link.label === "Bookings") {
              if (role === "ADMIN") {
                targetPath = "/admin/bookings";
              } else {
                targetPath = "/bookings";
              }
            }

            const active =
              link.label === "Bookings"
                ? location.pathname === "/bookings" ||
                  location.pathname === "/admin/bookings"
                : location.pathname === targetPath ||
                  (targetPath !== "/" &&
                    location.pathname.startsWith(targetPath));

            return (
              <button
                key={link.path}
                onClick={() => navigate(targetPath)}
                style={{
                  background: "transparent",
                  color: active ? "var(--primary)" : mutedTextColor,
                  fontSize: "15px",
                  fontWeight: active ? 700 : 500,
                  padding: "8px 10px",
                  borderRadius: "10px",
                  transition: "all 0.25s ease",
                  border: "none",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.color = "var(--primary)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.color = mutedTextColor;
                  }
                }}
              >
                {link.label}
              </button>
            );
          })}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flexShrink: 0,
          }}
        >
          {token ? (
            <>
              <button
                onClick={() => navigate(dashboardPath)}
                style={{
                  background: "transparent",
                  color: navTextColor,
                  fontSize: "14px",
                  fontWeight: 600,
                  padding: "10px 16px",
                  borderRadius: "999px",
                  border: "1px solid rgba(255,255,255,0.18)",
                  transition: "all 0.25s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--primary)";
                  e.currentTarget.style.color = "var(--primary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor =
                    "rgba(255,255,255,0.18)";
                  e.currentTarget.style.color = navTextColor;
                }}
              >
                Welcome, {name || "User"}
              </button>

              <button
                onClick={handleLogout}
                style={{
                  background: "var(--primary)",
                  color: "#111827",
                  fontSize: "14px",
                  fontWeight: 700,
                  padding: "12px 22px",
                  borderRadius: "999px",
                  boxShadow: "0 10px 24px rgba(244, 180, 0, 0.28)",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <a
                href="http://localhost:8080/oauth2/authorization/google"
                style={{
                  background: "transparent",
                  color: navTextColor,
                  fontSize: "14px",
                  fontWeight: 600,
                  padding: "10px 16px",
                  borderRadius: "999px",
                  border: "1px solid rgba(255,255,255,0.18)",
                  transition: "all 0.25s ease",
                  textDecoration: "none",
                  display: "inline-block",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--primary)";
                  e.currentTarget.style.color = "var(--primary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor =
                    "rgba(255,255,255,0.18)";
                  e.currentTarget.style.color = navTextColor;
                }}
              >
                Login with Google
              </a>

              <a
                href="http://localhost:8080/oauth2/authorization/github"
                style={{
                  background: "transparent",
                  color: navTextColor,
                  fontSize: "14px",
                  fontWeight: 600,
                  padding: "10px 16px",
                  borderRadius: "999px",
                  border: "1px solid rgba(255,255,255,0.18)",
                  transition: "all 0.25s ease",
                  textDecoration: "none",
                  display: "inline-block",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#fff";
                  e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor =
                    "rgba(255,255,255,0.18)";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                GitHub Login
              </a>

              <a
                href="http://localhost:8080/oauth2/authorization/google"
                style={{
                  background: "var(--primary)",
                  color: "#111827",
                  fontSize: "14px",
                  fontWeight: 700,
                  padding: "12px 22px",
                  borderRadius: "999px",
                  boxShadow: "0 10px 24px rgba(244, 180, 0, 0.28)",
                  textDecoration: "none",
                  display: "inline-block",
                }}
              >
                Get Started
              </a>

              
            </>
          )}
        </div>
      </div>
    </nav>
  );
}