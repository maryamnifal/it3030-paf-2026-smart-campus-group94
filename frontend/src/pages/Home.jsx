import { useNavigate } from "react-router-dom";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1400&q=80";

const modules = [
  {
    icon: "🏛️",
    title: "Facilities & Assets",
    desc: "Manage halls, labs, rooms, and equipment from one streamlined operational platform.",
    path: "/facilities",
  },
  {
    icon: "📅",
    title: "Booking Management",
    desc: "Handle reservations with clearer workflows, approval visibility, and conflict reduction.",
    path: "/bookings",
  },
  {
    icon: "🔧",
    title: "Incident Ticketing",
    desc: "Track maintenance issues, assign technicians, and monitor resolution progress in real time.",
    path: "/incidents",
  },
  {
    icon: "🔔",
    title: "Notifications",
    desc: "Deliver timely updates for approvals, incidents, and operational announcements through instant notifications",
    path: "/notifications",
  },
];

const features = [
  { icon: "🔒", title: "Secure Access", desc: "OAuth-based authentication with role-aware access across the platform." },
  { icon: "📊", title: "Administrative Control", desc: "Manage requests, approvals, users, and campus activity with confidence." },
  { icon: "⚡", title: "Live Updates", desc: "Stay informed with real-time booking, ticketing, and alert visibility." },
  { icon: "🔍", title: "Smart Discovery", desc: "Quickly filter resources by type, location, capacity, and availability." },
  { icon: "🗂️", title: "Operational Traceability", desc: "Keep a clear audit trail for better accountability and reporting." },
  { icon: "📱", title: "Responsive Experience", desc: "A consistent user experience across desktop, tablet, and mobile devices." },
];

const testimonials = [
  {
    name: "Admin User",
    role: "Facilities Manager",
    text: "UniSphere gave us a much more organized way to manage requests, spaces, and approvals across campus.",
  },
  {
    name: "Student User",
    role: "Undergraduate",
    text: "The booking flow is simple and fast. What used to take multiple emails now takes only a few clicks.",
  },
  {
    name: "Technician",
    role: "IT Support Staff",
    text: "Ticket visibility is much better now. I can see priorities clearly and respond more efficiently.",
  },
];

export default function Home() {
  const navigate = useNavigate();

  const heroButtonPrimary = {
    background: "var(--primary)",
    color: "#111827",
    border: "none",
    padding: "14px 28px",
    borderRadius: "999px",
    fontSize: "15px",
    fontWeight: 700,
    boxShadow: "0 14px 30px rgba(244, 180, 0, 0.22)",
    transition: "all 0.25s ease",
    cursor: "pointer",
  };

  const heroButtonSecondary = {
    background: "transparent",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.22)",
    padding: "14px 28px",
    borderRadius: "999px",
    fontSize: "15px",
    fontWeight: 600,
    backdropFilter: "blur(8px)",
    transition: "all 0.25s ease",
    cursor: "pointer",
  };

  return (
    <div style={{ background: "var(--bg-light)" }}>
      {/* HERO */}
      <section
        style={{
          position: "relative",
          minHeight: "100vh",
          overflow: "hidden",
          background: "var(--secondary)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${HERO_IMAGE})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.45,
          }}
        />

       <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, rgba(9,18,32,0.55) 0%, rgba(15,41,71,0.45) 45%, rgba(22,58,99,0.35) 100%)",
        }}
      />

        <div
          style={{
            position: "absolute",
            top: "10%",
            right: "-120px",
            width: "420px",
            height: "420px",
            borderRadius: "50%",
            background: "rgba(244,180,0,0.12)",
            filter: "blur(70px)",
          }}
        />

        <div
          style={{
            position: "absolute",
            bottom: "-80px",
            left: "-60px",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
            filter: "blur(60px)",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 2,
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "110px 2rem 80px",
            minHeight: "100vh",
            display: "grid",
            gridTemplateColumns: "1.1fr 0.9fr",
            gap: "48px",
            alignItems: "center",
          }}
        >
          {/* LEFT */}
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px 18px",
                borderRadius: "999px",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.86)",
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.5px",
                marginBottom: "28px",
              }}
            >
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "var(--primary)",
                  display: "inline-block",
                }}
              />
              SMART CAMPUS OPERATIONS PLATFORM
            </div>

            <h1
              style={{
                fontSize: "clamp(34px, 4.5vw, 58px)",
                lineHeight: 1.05,
                fontWeight: 800,
                color: "#fff",
                letterSpacing: "-1.5px",
                marginBottom: "14px",
                maxWidth: "680px",
              }}
            >
              Manage your campus
              <br />
              with clarity,
              <br />
              <span style={{ color: "var(--primary)" }}>speed, and control.</span>
            </h1>

            <p
              style={{
                color: "rgba(255,255,255,0.72)",
                fontSize: "17px",
                lineHeight: 1.8,
                maxWidth: "560px",
                marginBottom: "34px",
              }}
            >
              UniSphere brings facilities, bookings, incident reporting, and notifications
              into one modern platform designed for universities that need smoother operations
              and better visibility.
            </p>

            <div
              style={{
                display: "flex",
                gap: "14px",
                flexWrap: "wrap",
                marginBottom: "34px",
              }}
            >
              <button
                onClick={() => navigate("/facilities")}
                style={heroButtonPrimary}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.background = "var(--primary-dark)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.background = "var(--primary)";
                }}
              >
                Explore Facilities
              </button>

              <button
                onClick={() => navigate("/bookings")}
                style={heroButtonSecondary}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = "var(--primary)";
                  e.target.style.color = "var(--primary)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = "rgba(255,255,255,0.22)";
                  e.target.style.color = "#fff";
                }}
              >
                Book a Resource
              </button>
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "20px",
                color: "rgba(255,255,255,0.62)",
                fontSize: "13px",
              }}
            >
              <span>✓ Role-based access</span>
              <span>✓ Real-time updates</span>
              <span>✓ Secure authentication</span>
            </div>
          </div>

          {/* RIGHT */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <div
              style={{
                width: "100%",
                maxWidth: "470px",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "28px",
                padding: "28px",
                backdropFilter: "blur(20px)",
                boxShadow: "0 30px 80px rgba(0,0,0,0.26)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "22px",
                }}
              >
                <div>
                  <div style={{ color: "#fff", fontSize: "18px", fontWeight: 700 }}>
                    Live Campus Status
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.56)", fontSize: "12px", marginTop: "3px" }}>
                    Resource overview and active operations
                  </div>
                </div>

                <div
                  style={{
                    background: "rgba(16,185,129,0.14)",
                    color: "#86efac",
                    border: "1px solid rgba(16,185,129,0.25)",
                    borderRadius: "999px",
                    padding: "6px 12px",
                    fontSize: "12px",
                    fontWeight: 600,
                  }}
                >
                  ● Live
                </div>
              </div>

              {[
                { label: "Lab 01 – Block A", type: "LAB", status: "Available", statusBg: "#dcfce7", statusColor: "#166534" },
                { label: "Lecture Hall 3", type: "HALL", status: "Booked", statusBg: "#fef3c7", statusColor: "#92400e" },
                { label: "Meeting Room B", type: "ROOM", status: "Available", statusBg: "#dcfce7", statusColor: "#166534" },
                { label: "Projector – AV Room", type: "EQUIP", status: "Maintenance", statusBg: "#fee2e2", statusColor: "#991b1b" },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "12px",
                    padding: "14px 0",
                    borderBottom: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    <span
                      style={{
                        color: "rgba(255,255,255,0.52)",
                        fontSize: "11px",
                        fontWeight: 700,
                        letterSpacing: "0.8px",
                      }}
                    >
                      {item.type}
                    </span>
                    <span style={{ color: "#fff", fontSize: "14px", fontWeight: 500 }}>
                      {item.label}
                    </span>
                  </div>

                  <span
                    style={{
                      background: item.statusBg,
                      color: item.statusColor,
                      borderRadius: "999px",
                      padding: "6px 12px",
                      fontSize: "11px",
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.status}
                  </span>
                </div>
              ))}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  marginTop: "20px",
                  marginBottom: "18px",
                }}
              >
                {[
                  { value: "12", label: "Open Tickets" },
                  { value: "5", label: "Pending Bookings" },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "18px",
                      padding: "18px",
                    }}
                  >
                    <div
                      style={{
                        color: "var(--primary)",
                        fontSize: "28px",
                        fontWeight: 800,
                        lineHeight: 1,
                      }}
                    >
                      {item.value}
                    </div>
                    <div
                      style={{
                        marginTop: "8px",
                        color: "rgba(255,255,255,0.56)",
                        fontSize: "12px",
                      }}
                    >
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => navigate("/facilities")}
                style={{
                  width: "100%",
                  background: "var(--primary)",
                  color: "#111827",
                  border: "none",
                  padding: "14px 18px",
                  borderRadius: "999px",
                  fontSize: "14px",
                  fontWeight: 700,
                  transition: "all 0.25s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "var(--primary-dark)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "var(--primary)";
                }}
              >
                View All Facilities
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* MODULES */}
      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "90px 2rem 90px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <div
            style={{
              display: "inline-block",
              background: "var(--primary-light)",
              color: "var(--secondary)",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "1.2px",
              textTransform: "uppercase",
              padding: "8px 18px",
              borderRadius: "999px",
              marginBottom: "18px",
            }}
          >
            Platform Modules
          </div>

          <h2
            style={{
              fontSize: "clamp(30px, 4vw, 48px)",
              fontWeight: 800,
              color: "var(--text-dark)",
              letterSpacing: "-1px",
              marginBottom: "16px",
            }}
          >
            Everything your campus needs,
            <br />
            all in one place.
          </h2>

          <p
            style={{
              color: "var(--text-light)",
              fontSize: "16px",
              maxWidth: "620px",
              margin: "0 auto",
              lineHeight: 1.8,
            }}
          >
            UniSphere combines essential campus workflows into a single, elegant operational experience.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "24px",
          }}
        >
          {modules.map((module) => (
            <div
              key={module.title}
              onClick={() => navigate(module.path)}
              style={{
                background: "#fff",
                border: "1px solid rgba(15, 23, 42, 0.08)",
                borderRadius: "28px",
                padding: "30px",
                boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)",
                cursor: "pointer",
                transition: "all 0.25s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-6px)";
                e.currentTarget.style.boxShadow = "0 18px 40px rgba(15, 23, 42, 0.08)";
                e.currentTarget.style.borderColor = "var(--primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 10px 30px rgba(15, 23, 42, 0.05)";
                e.currentTarget.style.borderColor = "rgba(15, 23, 42, 0.08)";
              }}
            >
              <div
                style={{
                  width: "58px",
                  height: "58px",
                  borderRadius: "18px",
                  background: "var(--secondary-light)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "28px",
                  marginBottom: "20px",
                }}
              >
                {module.icon}
              </div>

              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "var(--text-dark)",
                  marginBottom: "10px",
                }}
              >
                {module.title}
              </h3>

              <p
                style={{
                  color: "var(--text-light)",
                  fontSize: "14px",
                  lineHeight: 1.8,
                  marginBottom: "18px",
                }}
              >
                {module.desc}
              </p>

              <div
                style={{
                  color: "var(--secondary)",
                  fontWeight: 700,
                  fontSize: "14px",
                }}
              >
                Explore →
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT / FEATURES */}
      <section
        style={{
          background: "#fff",
          padding: "90px 2rem",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "70px",
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-block",
                background: "var(--primary-light)",
                color: "var(--secondary)",
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "1.2px",
                textTransform: "uppercase",
                padding: "8px 18px",
                borderRadius: "999px",
                marginBottom: "18px",
              }}
            >
              About UniSphere
            </div>

            <h2
              style={{
                fontSize: "clamp(30px, 4vw, 44px)",
                fontWeight: 800,
                color: "var(--text-dark)",
                lineHeight: 1.1,
                letterSpacing: "-1px",
                marginBottom: "20px",
              }}
            >
              A smarter way to run
              <br />
              campus operations.
            </h2>

            <p
              style={{
                color: "var(--text-light)",
                fontSize: "15px",
                lineHeight: 1.9,
                marginBottom: "16px",
              }}
            >
              UniSphere is built to simplify the operational side of university life by connecting resource visibility,
              booking workflows, incident management, and communication in one centralized platform.
            </p>

            <p
              style={{
                color: "var(--text-light)",
                fontSize: "15px",
                lineHeight: 1.9,
                marginBottom: "28px",
              }}
            >
              It helps teams reduce friction, improve accountability, and create a smoother experience for both staff and students.
            </p>

            {[
              "Role-based access across users, admins, and technicians",
              "Secure OAuth-enabled sign-in experience",
              "Better booking visibility and approval flow",
              "Faster reporting and ticket tracking",
            ].map((item) => (
              <div
                key={item}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                  marginBottom: "14px",
                }}
              >
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    background: "var(--primary)",
                    color: "#111827",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    fontWeight: 800,
                    flexShrink: 0,
                    marginTop: "2px",
                  }}
                >
                  ✓
                </div>

                <span style={{ color: "var(--text-mid)", fontSize: "14px", lineHeight: 1.7 }}>
                  {item}
                </span>
              </div>
            ))}

            <button
              onClick={() => navigate("/facilities")}
              style={{
                marginTop: "16px",
                background: "var(--secondary)",
                color: "#fff",
                border: "none",
                padding: "14px 26px",
                borderRadius: "999px",
                fontSize: "14px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Explore the Platform
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}
          >
            {features.map((feature) => (
              <div
                key={feature.title}
                style={{
                  background: "#fff",
                  border: "1px solid rgba(15, 23, 42, 0.08)",
                  borderRadius: "24px",
                  padding: "22px 20px",
                  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)",
                  transition: "all 0.25s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 18px 40px rgba(15, 23, 42, 0.08)";
                  e.currentTarget.style.borderColor = "var(--primary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 10px 30px rgba(15, 23, 42, 0.05)";
                  e.currentTarget.style.borderColor = "rgba(15, 23, 42, 0.08)";
                }}
              >
                <div
                  style={{
                    fontSize: "24px",
                    marginBottom: "10px",
                    background: "var(--secondary-light)",
                    borderRadius: "12px",
                    padding: "6px",
                    width: "fit-content",
                  }}
                >
                  {feature.icon}
                </div>
                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: 700,
                    color: "var(--text-dark)",
                    marginBottom: "8px",
                  }}
                >
                  {feature.title}
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "var(--text-light)",
                    lineHeight: 1.7,
                  }}
                >
                  {feature.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "90px 2rem",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "50px" }}>
          <div
            style={{
              display: "inline-block",
              background: "var(--primary-light)",
              color: "var(--secondary)",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "1.2px",
              textTransform: "uppercase",
              padding: "8px 18px",
              borderRadius: "999px",
              marginBottom: "18px",
            }}
          >
            Testimonials
          </div>

          <h2
            style={{
              fontSize: "clamp(28px, 4vw, 42px)",
              fontWeight: 800,
              color: "var(--text-dark)",
              letterSpacing: "-1px",
            }}
          >
            What users are saying
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "24px",
          }}
        >
          {testimonials.map((item) => (
            <div
              key={item.name}
              style={{
                background: "#fff",
                border: "1px solid var(--border)",
                borderRadius: "24px",
                padding: "28px",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div
                style={{
                  fontSize: "42px",
                  color: "var(--primary)",
                  lineHeight: 1,
                  marginBottom: "12px",
                  fontWeight: 700,
                }}
              >
                “
              </div>

              <p
                style={{
                  color: "var(--text-mid)",
                  fontSize: "14px",
                  lineHeight: 1.9,
                  marginBottom: "24px",
                }}
              >
                {item.text}
              </p>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  borderTop: "1px solid var(--border)",
                  paddingTop: "18px",
                }}
              >
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "50%",
                    background: "var(--secondary)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                  }}
                >
                  {item.name[0]}
                </div>

                <div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-dark)" }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{item.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 2rem 90px",
        }}
      >
        <div
          style={{
            background: "#fff",
            border: "1px solid rgba(15, 23, 42, 0.08)",
            borderRadius: "32px",
            padding: "70px 40px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(15, 23, 42, 0.08)",
          }}
        >
          <div style={{ position: "relative", zIndex: 1 }}>
            <div
              style={{
                display: "inline-block",
                background: "var(--primary-light)",
                color: "var(--secondary)",
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "1.2px",
                textTransform: "uppercase",
                padding: "8px 18px",
                borderRadius: "999px",
                marginBottom: "18px",
              }}
            >
              Get Started
            </div>

            <h2
              style={{
                fontSize: "clamp(30px, 4vw, 48px)",
                fontWeight: 800,
                color: "var(--text-dark)",
                lineHeight: 1.1,
                letterSpacing: "-1px",
                marginBottom: "16px",
              }}
            >
              Ready to modernize your
              <br />
              campus operations?
            </h2>

            <p
              style={{
                color: "var(--text-light)",
                fontSize: "16px",
                maxWidth: "560px",
                margin: "0 auto 34px",
                lineHeight: 1.8,
              }}
            >
              Explore UniSphere and bring bookings, facilities, incidents, and alerts together in one connected system.
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "14px",
                flexWrap: "wrap",
              }}
            >
              <button
                style={{
                  background: "var(--primary)",
                  color: "#111827",
                  border: "none",
                  padding: "14px 28px",
                  borderRadius: "999px",
                  fontSize: "15px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Sign in with Google
              </button>

              <button
                onClick={() => navigate("/facilities")}
                style={{
                  background: "transparent",
                  color: "var(--text-dark)",
                  border: "1px solid var(--border)",
                  padding: "14px 28px",
                  borderRadius: "999px",
                  fontSize: "15px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Browse Facilities
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}