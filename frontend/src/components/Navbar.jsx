import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navTextColor = "#ffffff";
  const mutedTextColor = "rgba(255,255,255,0.88)";

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
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
        {/* Logo */}
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

        {/* Nav Links */}
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
            const active =
              location.pathname === link.path ||
              (link.path !== "/" && location.pathname.startsWith(link.path));

            return (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                style={{
                  background: "transparent",
                  color: active ? "var(--primary)" : mutedTextColor,
                  fontSize: "15px",
                  fontWeight: active ? 700 : 500,
                  padding: "8px 10px",
                  borderRadius: "10px",
                  transition: "all 0.25s ease",
                }}
                onMouseEnter={(e) => {
                  if (!active) e.target.style.color = "var(--primary)";
                }}
                onMouseLeave={(e) => {
                  if (!active) e.target.style.color = mutedTextColor;
                }}
              >
                {link.label}
              </button>
            );
          })}
        </div>

        {/* CTA */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flexShrink: 0,
          }}
        >
          <button
            style={{
              background: "transparent",
              color: navTextColor,
              fontSize: "14px",
              fontWeight: 600,
              padding: "10px 16px",
              borderRadius: "999px",
              border: "1px solid rgba(255,255,255,0.18)",
              transition: "all 0.25s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = "var(--primary)";
              e.target.style.color = "var(--primary)";
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = "rgba(255,255,255,0.18)";
              e.target.style.color = navTextColor;
            }}
          >
            Login
          </button>

          <button
            style={{
              background: "var(--primary)",
              color: "#111827",
              fontSize: "14px",
              fontWeight: 700,
              padding: "12px 22px",
              borderRadius: "999px",
              boxShadow: "0 10px 24px rgba(244, 180, 0, 0.28)",
              transition: "all 0.25s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-1px)";
              e.target.style.background = "var(--primary-dark)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.background = "var(--primary)";
            }}
          >
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
}