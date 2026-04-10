export default function Footer() {
  const modules = [
    "Facilities & Assets",
    "Booking Management",
    "Incident Ticketing",
    "Notifications",
    "Authentication & OAuth",
  ];

  const quickLinks = ["Home", "About", "Contact", "GitHub Repository", "API Docs"];

  return (
    <footer style={{ background: "#0b1220", color: "#fff" }}>
      {/* Top Accent */}
      <div
        style={{
          height: "4px",
          background: "var(--primary)",
        }}
      />

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "64px 2rem 44px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "44px",
          }}
        >
          {/* Brand */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "18px",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  background: "var(--primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#111827",
                  fontWeight: 800,
                  fontSize: "16px",
                  boxShadow: "0 8px 20px rgba(244, 180, 0, 0.25)",
                }}
              >
                U
              </div>

              <div>
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: 700,
                  }}
                >
                  Uni<span style={{ color: "var(--primary)" }}>Sphere</span>
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    color: "#64748B",
                    letterSpacing: "0.8px",
                  }}
                >
                  SMART CAMPUS HUB
                </div>
              </div>
            </div>

            <p
              style={{
                color: "#94a3b8",
                fontSize: "13px",
                lineHeight: 1.8,
                maxWidth: "240px",
              }}
            >
              Connecting campus operations in one smart platform. Built for SLIIT IT3030.
            </p>

            {/* Socials */}
            <div style={{ display: "flex", gap: "10px", marginTop: "22px" }}>
              {["G", "F", "in"].map((s) => (
                <div
                  key={s}
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: "#111827",
                    border: "1px solid #1f2937",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    color: "#94a3b8",
                    transition: "all 0.25s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--primary)";
                    e.currentTarget.style.color = "#111827";
                    e.currentTarget.style.borderColor = "transparent";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#111827";
                    e.currentTarget.style.color = "#94a3b8";
                    e.currentTarget.style.borderColor = "#1f2937";
                  }}
                >
                  {s}
                </div>
              ))}
            </div>
          </div>

          {/* Modules */}
          <div>
            <h4
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "#e2e8f0",
                letterSpacing: "1px",
                textTransform: "uppercase",
                marginBottom: "20px",
              }}
            >
              Modules
            </h4>

            {modules.map((m) => (
              <div
                key={m}
                style={{
                  color: "#94a3b8",
                  fontSize: "13px",
                  marginBottom: "12px",
                  cursor: "pointer",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--primary)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
              >
                {m}
              </div>
            ))}
          </div>

          {/* Quick Links */}
          <div>
            <h4
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "#e2e8f0",
                letterSpacing: "1px",
                textTransform: "uppercase",
                marginBottom: "20px",
              }}
            >
              Quick Links
            </h4>

            {quickLinks.map((l) => (
              <div
                key={l}
                style={{
                  color: "#94a3b8",
                  fontSize: "13px",
                  marginBottom: "12px",
                  cursor: "pointer",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--primary)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
              >
                {l}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div
        style={{
          borderTop: "1px solid #1f2937",
          padding: "20px 2rem",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <p style={{ color: "#6b7280", fontSize: "13px" }}>
            © 2026 UniSphere · SLIIT IT3030 · Group 94
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "#10b981",
              }}
            />
            <p style={{ color: "#6b7280", fontSize: "13px" }}>
              All systems operational
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}