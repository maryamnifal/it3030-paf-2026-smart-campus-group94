import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getResourceById } from "../../api/resourceApi";
import { useAuth } from "../../context/AuthContext";

export default function ResourceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();
  const isAdmin = role === "ADMIN";
  const isUser = role === "USER";

  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState("");

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const res = await getResourceById(id);
        const data = res.data;
        setResource(data);

        const gallery =
          data.images && data.images.length > 0
            ? data.images
            : data.imageUrl
            ? [data.imageUrl]
            : [];

        setSelectedImage(data.imageUrl || gallery[0] || "");
      } catch (error) {
        console.error("Error fetching resource:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResource();
  }, [id]);

  const images = useMemo(() => {
    if (!resource) return [];
    return resource.images && resource.images.length > 0
      ? resource.images
      : resource.imageUrl
      ? [resource.imageUrl]
      : [];
  }, [resource]);

  const formattedType = resource?.type?.replaceAll("_", " ") || "-";
  const formattedStatus = resource?.status?.replaceAll("_", " ") || "-";

  const statusStyles =
    resource?.status === "ACTIVE"
      ? {
          background: "#dcfce7",
          color: "#166534",
          border: "1px solid #bbf7d0",
          boxShadow: "0 8px 20px rgba(34, 197, 94, 0.10)",
        }
      : {
          background: "#fee2e2",
          color: "#991b1b",
          border: "1px solid #fecaca",
          boxShadow: "0 8px 20px rgba(239, 68, 68, 0.10)",
        };

  const shellStyle = {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top, rgba(244,180,0,0.05), transparent 20%), linear-gradient(180deg, #f8fafc 0%, #f8fafc 55%, #eef2f7 100%)",
    paddingBottom: "90px",
  };

  const containerStyle = {
    maxWidth: "1240px",
    margin: "0 auto",
    padding: "0 2rem",
  };

  const cardStyle = {
    background: "rgba(255,255,255,0.88)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: "1px solid rgba(15, 23, 42, 0.07)",
    borderRadius: "32px",
    boxShadow: "0 24px 60px rgba(15, 23, 42, 0.07)",
  };

  const sectionTitleStyle = {
    fontSize: "24px",
    fontWeight: 900,
    color: "#0f172a",
    letterSpacing: "-0.6px",
    marginBottom: "20px",
  };

  const labelStyle = {
    fontSize: "11px",
    fontWeight: 800,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "1px",
    marginBottom: "8px",
  };

  const valueStyle = {
    fontSize: "16px",
    fontWeight: 700,
    color: "#0f172a",
    lineHeight: 1.6,
  };

  if (loading) {
    return (
      <div style={{ ...shellStyle, paddingTop: "120px" }}>
        <div style={containerStyle}>
          <div
            style={{
              ...cardStyle,
              padding: "64px 24px",
              textAlign: "center",
              color: "#64748b",
              fontSize: "16px",
              fontWeight: 700,
            }}
          >
            Loading resource details...
          </div>
        </div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div style={{ ...shellStyle, paddingTop: "120px" }}>
        <div style={containerStyle}>
          <div
            style={{
              ...cardStyle,
              padding: "64px 24px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "52px", marginBottom: "16px" }}>🏢</div>
            <div
              style={{
                fontSize: "26px",
                fontWeight: 900,
                color: "#0f172a",
                marginBottom: "10px",
              }}
            >
              Resource not found
            </div>
            <div
              style={{
                fontSize: "15px",
                color: "#64748b",
                marginBottom: "24px",
              }}
            >
              We could not find the resource you are looking for.
            </div>
            <button
              onClick={() => navigate("/facilities")}
              style={{
                background: "var(--primary)",
                color: "#111827",
                border: "none",
                padding: "14px 22px",
                borderRadius: "999px",
                fontSize: "14px",
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: "0 12px 28px rgba(244, 180, 0, 0.18)",
              }}
            >
              Back to Facilities
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={shellStyle}>
      <section
        style={{
          ...containerStyle,
          paddingTop: "28px",
        }}
      >
        <div
          style={{
            ...cardStyle,
            padding: "30px 34px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "20px",
            flexWrap: "wrap",
            marginBottom: "28px",
          }}
        >
          <div style={{ maxWidth: "760px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px 16px",
                borderRadius: "999px",
                background: "rgba(244,180,0,0.12)",
                color: "#0f172a",
                fontSize: "12px",
                fontWeight: 800,
                letterSpacing: "0.7px",
                marginBottom: "18px",
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
              FACILITY RESOURCE DETAILS
            </div>

            <h1
              style={{
                fontSize: "36px",
                lineHeight: 1.04,
                fontWeight: 900,
                color: "#0f172a",
                letterSpacing: "-1.4px",
                marginBottom: "16px",
              }}
            >
              {resource.name}
            </h1>

            <p
              style={{
                color: "#64748b",
                fontSize: "16px",
                lineHeight: 1.9,
                maxWidth: "720px",
                margin: 0,
              }}
            >
              {resource.description ||
                "View full facility details, availability, location, and media for this campus resource."}
            </p>
          </div>

          <div
            style={{
              ...statusStyles,
              borderRadius: "999px",
              padding: "12px 18px",
              fontSize: "13px",
              fontWeight: 900,
              whiteSpace: "nowrap",
            }}
          >
            {formattedStatus}
          </div>
        </div>
      </section>

      <section
        style={{
          ...containerStyle,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.18fr 0.82fr",
            gap: "28px",
            alignItems: "start",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={{ ...cardStyle, overflow: "hidden" }}>
              <div
                style={{
                  width: "100%",
                  height: "480px",
                  background:
                    "linear-gradient(180deg, rgba(241,245,249,1) 0%, rgba(226,232,240,1) 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {selectedImage ? (
                  <img
                    src={selectedImage}
                    alt={resource.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                ) : (
                  <div style={{ fontSize: "64px", color: "#94a3b8" }}>🏢</div>
                )}
              </div>

              {images.length > 1 && (
                <div
                  style={{
                    padding: "18px",
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
                    gap: "12px",
                  }}
                >
                  {images.map((img, index) => {
                    const active = selectedImage === img;
                    return (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(img)}
                        style={{
                          padding: 0,
                          borderRadius: "16px",
                          overflow: "hidden",
                          border: active
                            ? "2px solid var(--primary)"
                            : "1px solid rgba(15, 23, 42, 0.08)",
                          background: "#fff",
                          cursor: "pointer",
                          boxShadow: active
                            ? "0 10px 22px rgba(244, 180, 0, 0.18)"
                            : "none",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <img
                          src={img}
                          alt={`${resource.name} ${index + 1}`}
                          style={{
                            width: "100%",
                            height: "88px",
                            objectFit: "cover",
                            display: "block",
                          }}
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ ...cardStyle, padding: "32px" }}>
              <div style={sectionTitleStyle}>About this resource</div>
              <div
                style={{
                  fontSize: "15px",
                  fontWeight: 500,
                  color: "#475569",
                  lineHeight: 1.95,
                }}
              >
                {resource.description ||
                  "No description available for this resource yet."}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={{ ...cardStyle, padding: "32px" }}>
              <div style={sectionTitleStyle}>Resource information</div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "22px 18px",
                }}
              >
                <div>
                  <div style={labelStyle}>Type</div>
                  <div style={valueStyle}>{formattedType}</div>
                </div>

                <div>
                  <div style={labelStyle}>Capacity</div>
                  <div style={valueStyle}>{resource.capacity || "-"}</div>
                </div>

                <div>
                  <div style={labelStyle}>Location</div>
                  <div style={valueStyle}>{resource.location || "-"}</div>
                </div>

                <div>
                  <div style={labelStyle}>Status</div>
                  <div style={valueStyle}>{formattedStatus}</div>
                </div>
              </div>
            </div>

            <div style={{ ...cardStyle, padding: "32px" }}>
              <div style={sectionTitleStyle}>Availability windows</div>

              {resource.availabilityWindows &&
              resource.availabilityWindows.length > 0 ? (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: "12px" }}
                >
                  {resource.availabilityWindows.map((slot, index) => (
                    <div
                      key={index}
                      style={{
                        background: "rgba(248,250,252,0.9)",
                        border: "1.5px solid rgba(15, 23, 42, 0.08)",
                        borderRadius: "18px",
                        padding: "14px 16px",
                        fontSize: "14px",
                        fontWeight: 700,
                        color: "#334155",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "var(--primary)";
                        e.currentTarget.style.boxShadow =
                          "0 10px 22px rgba(244, 180, 0, 0.08)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor =
                          "rgba(15, 23, 42, 0.08)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      {slot}
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    background: "transparent",
                    border: "1.5px dashed rgba(15, 23, 42, 0.12)",
                    borderRadius: "18px",
                    padding: "16px",
                    color: "#64748b",
                    fontSize: "14px",
                  }}
                >
                  No availability windows added.
                </div>
              )}
            </div>

            <div style={{ ...cardStyle, padding: "24px" }}>
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  flexWrap: "wrap",
                }}
              >
                <button
                  onClick={() => navigate("/facilities")}
                  style={{
                    background: "transparent",
                    color: "#0f172a",
                    border: "2px solid rgba(15, 23, 42, 0.12)",
                    padding: "14px 24px",
                    borderRadius: "999px",
                    fontSize: "14px",
                    fontWeight: 800,
                    cursor: "pointer",
                    transition: "all 0.25s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--primary)";
                    e.currentTarget.style.boxShadow =
                      "0 10px 22px rgba(244, 180, 0, 0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor =
                      "rgba(15, 23, 42, 0.12)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  Back to Facilities
                </button>

                {isUser && (
                  <button
                    onClick={() => navigate("/bookings")}
                    style={{
                      background: "var(--secondary)",
                      color: "#fff",
                      border: "none",
                      padding: "14px 24px",
                      borderRadius: "999px",
                      fontSize: "14px",
                      fontWeight: 900,
                      cursor: "pointer",
                      boxShadow: "0 12px 28px rgba(22, 58, 99, 0.22)",
                    }}
                  >
                    Book Now
                  </button>
                )}

                {isAdmin && (
                  <button
                    onClick={() => navigate(`/facilities/edit/${resource.id}`)}
                    style={{
                      background: "var(--primary)",
                      color: "#111827",
                      border: "none",
                      padding: "14px 24px",
                      borderRadius: "999px",
                      fontSize: "14px",
                      fontWeight: 900,
                      cursor: "pointer",
                      boxShadow: "0 12px 28px rgba(244, 180, 0, 0.22)",
                      transition: "all 0.25s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    Edit Resource
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}