import { useEffect, useState } from "react";
import {
  getAllResources,
  deleteResource,
  updateResourceStatus,
} from "../../api/resourceApi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ResourceList() {
  const [resources, setResources] = useState([]);
  const [filters, setFilters] = useState({
    type: "",
    location: "",
    capacity: "",
  });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { role } = useAuth();
  const isAdmin = role === "ADMIN";

  const fetchResources = async (customFilters = filters) => {
    setLoading(true);
    try {
      const activeFilters = Object.fromEntries(
        Object.entries(customFilters).filter(([_, v]) => v !== "")
      );

      if (activeFilters.location) {
        activeFilters.location = activeFilters.location.trim();
      }

      if (
        activeFilters.capacity !== undefined &&
        activeFilters.capacity !== ""
      ) {
        activeFilters.capacity = Math.max(0, Number(activeFilters.capacity));
      }

      const res = await getAllResources(activeFilters);

      const sortedResources = [...(res.data || [])].sort((a, b) =>
        (a.name || "").localeCompare(b.name || "", undefined, {
          sensitivity: "base",
        })
      );

      setResources(sortedResources);
    } catch (err) {
      console.error("Error fetching resources:", err);
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchResources(filters);
    }, 300);

    return () => clearTimeout(timeout);
  }, [filters]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this resource?")) {
      try {
        await deleteResource(id);
        fetchResources(filters);
      } catch (err) {
        console.error("Error deleting resource:", err);
      }
    }
  };

  const handleStatusToggle = async (id, currentStatus) => {
    const newStatus = currentStatus === "ACTIVE" ? "OUT_OF_SERVICE" : "ACTIVE";
    try {
      await updateResourceStatus(id, newStatus);
      fetchResources(filters);
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const handleClear = () => {
    setFilters({ type: "", location: "", capacity: "" });
  };

  const shellStyle = {
    minHeight: "100vh",
    background:
      "linear-gradient(180deg, #f8fafc 0%, #f8fafc 58%, #eef2f7 100%)",
    paddingBottom: "90px",
  };

  const heroStyle = {
    position: "relative",
    overflow: "hidden",
    background:
      "linear-gradient(135deg, #0f172a 0%, #1e3a5f 45%, #4b6584 100%)",
    padding: "42px 2rem 96px",
  };

  const containerStyle = {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 2rem",
  };

  const pageCardStyle = {
    background: "rgba(255,255,255,0.92)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: "1px solid rgba(15, 23, 42, 0.07)",
    borderRadius: "28px",
    boxShadow: "0 18px 45px rgba(15, 23, 42, 0.06)",
  };

  const inputStyle = {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "16px",
    border: "1px solid rgba(15, 23, 42, 0.08)",
    background: "#fff",
    color: "#0f172a",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
    transition: "all 0.22s ease",
  };

  const labelStyle = {
    display: "block",
    fontSize: "13px",
    fontWeight: 700,
    color: "#0f172a",
    marginBottom: "8px",
  };

  const sectionPillDark = {
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    padding: "8px 16px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.10)",
    color: "#fff",
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "0.7px",
    marginBottom: "18px",
    border: "1px solid rgba(255,255,255,0.12)",
  };

  const sectionPillLight = {
    display: "inline-block",
    background: "rgba(244,180,0,0.14)",
    color: "#163a63",
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "1px",
    textTransform: "uppercase",
    padding: "8px 16px",
    borderRadius: "999px",
    marginBottom: "16px",
  };

  return (
    <div style={shellStyle}>
      <style>{`
        @keyframes floatCard {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
          100% { transform: translateY(0px); }
        }

        @keyframes glowPulse {
          0% { opacity: 0.25; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.05); }
          100% { opacity: 0.25; transform: scale(1); }
        }
      `}</style>

      <section style={heroStyle}>
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-60px",
            width: "320px",
            height: "320px",
            borderRadius: "50%",
            background: "rgba(244,180,0,0.10)",
            filter: "blur(70px)",
            animation: "glowPulse 6s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-120px",
            left: "-60px",
            width: "260px",
            height: "260px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
            filter: "blur(70px)",
            animation: "glowPulse 7s ease-in-out infinite",
          }}
        />

        <div style={containerStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "20px",
              flexWrap: "wrap",
              position: "relative",
              zIndex: 2,
            }}
          >
            <div style={{ maxWidth: "760px" }}>
              <div style={sectionPillDark}>
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "var(--primary)",
                    display: "inline-block",
                  }}
                />
                FACILITIES & ASSETS
              </div>

              <h1
                style={{
                  fontSize: "42px",
                  lineHeight: 1.06,
                  fontWeight: 900,
                  color: "#fff",
                  letterSpacing: "-1.2px",
                  marginBottom: "14px",
                }}
              >
                Resource Catalogue
              </h1>

              <p
                style={{
                  color: "rgba(255,255,255,0.82)",
                  fontSize: "17px",
                  lineHeight: 1.9,
                  margin: 0,
                  maxWidth: "720px",
                }}
              >
                Browse labs, halls, meeting rooms, and equipment from one clean
                premium catalogue with smart filters and quick actions.
              </p>
            </div>

            {isAdmin && (
              <button
                onClick={() => navigate("/facilities/new")}
                style={{
                  background: "var(--primary)",
                  color: "#111827",
                  border: "none",
                  padding: "12px 18px",
                  borderRadius: "14px",
                  fontSize: "14px",
                  fontWeight: 800,
                  cursor: "pointer",
                  boxShadow: "0 10px 24px rgba(244, 180, 0, 0.18)",
                }}
              >
                + Add New Resource
              </button>
            )}
          </div>
        </div>
      </section>

      <section
        style={{
          ...containerStyle,
          marginTop: "-40px",
          position: "relative",
          zIndex: 3,
        }}
      >
        <div
          style={{
            ...pageCardStyle,
            padding: "28px",
            marginBottom: "24px",
          }}
        >
          <div style={sectionPillLight}>Search & Filter</div>

          <div
            style={{
              fontSize: "24px",
              fontWeight: 800,
              color: "#0f172a",
              marginBottom: "20px",
              letterSpacing: "-0.5px",
            }}
          >
            Find the right resource quickly
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr auto",
              gap: "16px",
              alignItems: "end",
            }}
          >
            <div>
              <label style={labelStyle}>Type</label>
              <select
                value={filters.type}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, type: e.target.value }))
                }
                style={inputStyle}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "rgba(22,58,99,0.24)";
                  e.currentTarget.style.boxShadow =
                    "0 0 0 4px rgba(22,58,99,0.06)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(15, 23, 42, 0.08)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <option value="">All Types</option>
                <option value="LAB">Lab</option>
                <option value="LECTURE_HALL">Lecture Hall</option>
                <option value="MEETING_ROOM">Meeting Room</option>
                <option value="EQUIPMENT">Equipment</option>
                <option value="ROOM">Room</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Location</label>
              <input
                type="text"
                placeholder="Filter by location"
                value={filters.location}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    location: e.target.value,
                  }))
                }
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "rgba(22,58,99,0.24)";
                  e.currentTarget.style.boxShadow =
                    "0 0 0 4px rgba(22,58,99,0.06)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(15, 23, 42, 0.08)";
                  e.currentTarget.style.boxShadow = "none";
                }}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Min Capacity</label>
              <input
                type="number"
                min="0"
                placeholder="Enter capacity"
                value={filters.capacity}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "" || Number(value) >= 0) {
                    setFilters((prev) => ({
                      ...prev,
                      capacity: value,
                    }));
                  }
                }}
                style={inputStyle}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "rgba(22,58,99,0.24)";
                  e.currentTarget.style.boxShadow =
                    "0 0 0 4px rgba(22,58,99,0.06)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(15, 23, 42, 0.08)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>

            <button
              onClick={handleClear}
              style={{
                background: "#fff",
                color: "#0f172a",
                border: "1px solid rgba(15, 23, 42, 0.08)",
                padding: "14px 22px",
                borderRadius: "14px",
                fontSize: "14px",
                fontWeight: 700,
                cursor: "pointer",
                height: "50px",
                transition: "all 0.22s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(15,23,42,0.16)";
                e.currentTarget.style.boxShadow =
                  "0 8px 18px rgba(15,23,42,0.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(15, 23, 42, 0.08)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              Clear
            </button>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
            marginBottom: "24px",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "26px",
                fontWeight: 800,
                color: "#0f172a",
                letterSpacing: "-0.5px",
              }}
            >
              Resource Catalogue
            </div>
            <div
              style={{
                fontSize: "14px",
                color: "#64748b",
                marginTop: "6px",
              }}
            >
              {loading
                ? "Loading resources..."
                : `${resources.length} resource${resources.length !== 1 ? "s" : ""} found`}
            </div>
          </div>
        </div>

        {loading ? (
          <div
            style={{
              ...pageCardStyle,
              padding: "60px 24px",
              textAlign: "center",
              color: "#64748b",
              fontSize: "16px",
            }}
          >
            Loading resources...
          </div>
        ) : resources.length === 0 ? (
          <div
            style={{
              ...pageCardStyle,
              padding: "60px 24px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "42px", marginBottom: "14px" }}>📦</div>
            <div
              style={{
                fontSize: "22px",
                fontWeight: 800,
                color: "#0f172a",
                marginBottom: "10px",
              }}
            >
              No resources found
            </div>
            <div
              style={{
                color: "#64748b",
                fontSize: "14px",
                lineHeight: 1.7,
              }}
            >
              Try adjusting your filters or add a new resource to get started.
            </div>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "24px",
            }}
          >
            {resources.map((r, index) => {
              const image =
                r.imageUrl ||
                (r.images && r.images.length > 0 ? r.images[0] : null);

              const isActive = r.status === "ACTIVE";

              return (
                <div
                  key={r.id}
                  style={{
                    ...pageCardStyle,
                    overflow: "hidden",
                    transition: "all 0.28s ease",
                    animation: "floatCard 5.2s ease-in-out infinite",
                    animationDelay: `${index * 0.12}s`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-8px)";
                    e.currentTarget.style.boxShadow =
                      "0 22px 48px rgba(15, 23, 42, 0.10)";
                    e.currentTarget.style.borderColor = "rgba(244,180,0,0.45)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 18px 45px rgba(15, 23, 42, 0.06)";
                    e.currentTarget.style.borderColor =
                      "rgba(15, 23, 42, 0.07)";
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: "220px",
                      background:
                        "linear-gradient(180deg, rgba(241,245,249,1) 0%, rgba(226,232,240,1) 100%)",
                      overflow: "hidden",
                      position: "relative",
                    }}
                  >
                    {image ? (
                      <img
                        src={image}
                        alt={r.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                          transition: "transform 0.35s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "scale(1.04)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "scale(1)";
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#94a3b8",
                          fontSize: "48px",
                        }}
                      >
                        🏢
                      </div>
                    )}

                    <div
                      style={{
                        position: "absolute",
                        top: "14px",
                        right: "14px",
                      }}
                    >
                      <span
                        style={{
                          background: isActive
                            ? "rgba(220,252,231,0.96)"
                            : "rgba(254,226,226,0.96)",
                          color: isActive ? "#166534" : "#991b1b",
                          borderRadius: "999px",
                          padding: "8px 12px",
                          fontSize: "11px",
                          fontWeight: 800,
                          whiteSpace: "nowrap",
                          backdropFilter: "blur(8px)",
                        }}
                      >
                        {r.status}
                      </span>
                    </div>
                  </div>

                  <div style={{ padding: "22px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: "12px",
                        marginBottom: "14px",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: "22px",
                            fontWeight: 800,
                            color: "#0f172a",
                            letterSpacing: "-0.4px",
                            marginBottom: "6px",
                          }}
                        >
                          {r.name}
                        </div>
                        <div
                          style={{
                            fontSize: "13px",
                            color: "#64748b",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          }}
                        >
                          {r.type?.replaceAll("_", " ") || "-"}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "14px",
                        marginBottom: "18px",
                      }}
                    >
                      <div
                        style={{
                          background: "#f8fafc",
                          border: "1px solid rgba(15,23,42,0.06)",
                          borderRadius: "16px",
                          padding: "12px 14px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "11px",
                            fontWeight: 800,
                            color: "#94a3b8",
                            textTransform: "uppercase",
                            letterSpacing: "0.9px",
                            marginBottom: "5px",
                          }}
                        >
                          Capacity
                        </div>
                        <div
                          style={{
                            fontSize: "14px",
                            fontWeight: 700,
                            color: "#0f172a",
                          }}
                        >
                          {r.capacity || "-"}
                        </div>
                      </div>

                      <div
                        style={{
                          background: "#f8fafc",
                          border: "1px solid rgba(15,23,42,0.06)",
                          borderRadius: "16px",
                          padding: "12px 14px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "11px",
                            fontWeight: 800,
                            color: "#94a3b8",
                            textTransform: "uppercase",
                            letterSpacing: "0.9px",
                            marginBottom: "5px",
                          }}
                        >
                          Location
                        </div>
                        <div
                          style={{
                            fontSize: "14px",
                            fontWeight: 700,
                            color: "#0f172a",
                          }}
                        >
                          {r.location || "-"}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "10px",
                      }}
                    >
                      <button
                        onClick={() => navigate(`/facilities/${r.id}`)}
                        style={{
                          background: "var(--primary)",
                          color: "#111827",
                          border: "none",
                          padding: "11px 16px",
                          borderRadius: "14px",
                          fontSize: "13px",
                          fontWeight: 800,
                          cursor: "pointer",
                          boxShadow: "0 10px 24px rgba(244, 180, 0, 0.16)",
                        }}
                      >
                        View
                      </button>

                      {isAdmin && (
                        <>
                          <button
                            onClick={() => navigate(`/facilities/edit/${r.id}`)}
                            style={{
                              background: "#fff",
                              color: "#0f172a",
                              border: "1px solid rgba(15, 23, 42, 0.08)",
                              padding: "11px 16px",
                              borderRadius: "14px",
                              fontSize: "13px",
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleStatusToggle(r.id, r.status)}
                            style={{
                              background: "#fff",
                              color: isActive ? "#92400e" : "#166534",
                              border: `1px solid ${
                                isActive
                                  ? "rgba(217, 119, 6, 0.18)"
                                  : "rgba(5, 150, 105, 0.18)"
                              }`,
                              padding: "11px 16px",
                              borderRadius: "14px",
                              fontSize: "13px",
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            {isActive ? "Deactivate" : "Activate"}
                          </button>

                          <button
                            onClick={() => handleDelete(r.id)}
                            style={{
                              background: "#fff",
                              color: "#dc2626",
                              border: "1px solid rgba(220, 38, 38, 0.15)",
                              padding: "11px 16px",
                              borderRadius: "14px",
                              fontSize: "13px",
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}