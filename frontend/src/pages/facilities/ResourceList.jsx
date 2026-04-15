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
      const res = await getAllResources(activeFilters);
      setResources(res.data);
    } catch (err) {
      console.error("Error fetching resources:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this resource?")) {
      try {
        await deleteResource(id);
        fetchResources();
      } catch (err) {
        console.error("Error deleting resource:", err);
      }
    }
  };

  const handleStatusToggle = async (id, currentStatus) => {
    const newStatus = currentStatus === "ACTIVE" ? "OUT_OF_SERVICE" : "ACTIVE";
    try {
      await updateResourceStatus(id, newStatus);
      fetchResources();
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const handleSearch = () => {
    fetchResources(filters);
  };

  const handleClear = () => {
    const cleared = { type: "", location: "", capacity: "" };
    setFilters(cleared);
    fetchResources(cleared);
  };

  const pageCardStyle = {
    background: "#fff",
    border: "1px solid rgba(15, 23, 42, 0.08)",
    borderRadius: "28px",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)",
  };

  const inputStyle = {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "16px",
    border: "1px solid rgba(15, 23, 42, 0.08)",
    background: "#fff",
    color: "var(--text-dark)",
    fontSize: "14px",
    outline: "none",
  };

  const sectionPillStyle = {
    display: "inline-block",
    background: "var(--primary-light)",
    color: "var(--secondary)",
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "1.2px",
    textTransform: "uppercase",
    padding: "8px 18px",
    borderRadius: "999px",
    marginBottom: "16px",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-light)",
        paddingBottom: "90px",
      }}
    >
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          background:
            "linear-gradient(90deg, rgba(9,18,32,0.96) 0%, rgba(15,41,71,0.88) 45%, rgba(22,58,99,0.78) 100%)",
          padding: "130px 2rem 70px",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-120px",
            right: "-100px",
            width: "360px",
            height: "360px",
            borderRadius: "50%",
            background: "rgba(244,180,0,0.12)",
            filter: "blur(70px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-100px",
            left: "-80px",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
            filter: "blur(70px)",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 2,
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              padding: "8px 18px",
              borderRadius: "999px",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.88)",
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "0.5px",
              marginBottom: "24px",
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
            FACILITIES & ASSETS CATALOGUE
          </div>

          <h1
            style={{
              fontSize: "clamp(34px, 5vw, 58px)",
              lineHeight: 1.05,
              fontWeight: 800,
              color: "#fff",
              letterSpacing: "-1.5px",
              marginBottom: "14px",
              maxWidth: "760px",
            }}
          >
            Explore, manage, and organize your campus resources.
          </h1>

          <p
            style={{
              color: "rgba(255,255,255,0.72)",
              fontSize: "16px",
              lineHeight: 1.8,
              maxWidth: "700px",
            }}
          >
            Access labs, halls, meeting rooms, and equipment from one clean catalogue designed for UniSphere.
          </p>
        </div>
      </section>

      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "40px 2rem 0",
        }}
      >
        <div style={{ ...pageCardStyle, padding: "28px", marginBottom: "24px" }}>
          <div style={sectionPillStyle}>Search & Filter</div>
          <div
            style={{
              fontSize: "22px",
              fontWeight: 800,
              color: "var(--text-dark)",
              marginBottom: "18px",
              letterSpacing: "-0.5px",
            }}
          >
            Find the right resource quickly
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr auto auto",
              gap: "14px",
              alignItems: "end",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "var(--text-dark)",
                  marginBottom: "8px",
                }}
              >
                Type
              </label>
              <select
                value={filters.type}
                onChange={(e) =>
                  setFilters({ ...filters, type: e.target.value })
                }
                style={inputStyle}
              >
                <option value="">All Types</option>
                <option value="LAB">Lab</option>
                <option value="LECTURE_HALL">Lecture Hall</option>
                <option value="MEETING_ROOM">Meeting Room</option>
                <option value="EQUIPMENT">Equipment</option>
              </select>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "var(--text-dark)",
                  marginBottom: "8px",
                }}
              >
                Location
              </label>
              <input
                type="text"
                placeholder="Filter by location"
                value={filters.location}
                onChange={(e) =>
                  setFilters({ ...filters, location: e.target.value })
                }
                style={inputStyle}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "var(--text-dark)",
                  marginBottom: "8px",
                }}
              >
                Min Capacity
              </label>
              <input
                type="number"
                placeholder="Enter capacity"
                value={filters.capacity}
                onChange={(e) =>
                  setFilters({ ...filters, capacity: e.target.value })
                }
                style={inputStyle}
              />
            </div>

            <button
              onClick={handleSearch}
              style={{
                background: "var(--primary)",
                color: "#111827",
                border: "none",
                padding: "14px 22px",
                borderRadius: "999px",
                fontSize: "14px",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 10px 24px rgba(244, 180, 0, 0.22)",
                transition: "all 0.25s ease",
                height: "50px",
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
              Search
            </button>

            <button
              onClick={handleClear}
              style={{
                background: "#fff",
                color: "var(--text-dark)",
                border: "1px solid rgba(15, 23, 42, 0.08)",
                padding: "14px 22px",
                borderRadius: "999px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.25s ease",
                height: "50px",
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
                fontSize: "24px",
                fontWeight: 800,
                color: "var(--text-dark)",
                letterSpacing: "-0.5px",
              }}
            >
              Resource Catalogue
            </div>
            <div
              style={{
                fontSize: "14px",
                color: "var(--text-light)",
                marginTop: "6px",
              }}
            >
              {loading
                ? "Loading resources..."
                : `${resources.length} resource${resources.length !== 1 ? "s" : ""} found`}
            </div>
          </div>

          {isAdmin && (
            <button
              onClick={() => navigate("/facilities/new")}
              style={{
                background: "var(--secondary)",
                color: "#fff",
                border: "none",
                padding: "14px 22px",
                borderRadius: "999px",
                fontSize: "14px",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 10px 24px rgba(22, 58, 99, 0.18)",
              }}
            >
              + Add New Resource
            </button>
          )}
        </div>

        {loading ? (
          <div
            style={{
              ...pageCardStyle,
              padding: "60px 24px",
              textAlign: "center",
              color: "var(--text-light)",
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
                color: "var(--text-dark)",
                marginBottom: "10px",
              }}
            >
              No resources found
            </div>
            <div
              style={{
                color: "var(--text-light)",
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
              gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
              gap: "24px",
            }}
          >
            {resources.map((r) => {
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
                    transition: "all 0.25s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-6px)";
                    e.currentTarget.style.boxShadow =
                      "0 18px 40px rgba(15, 23, 42, 0.08)";
                    e.currentTarget.style.borderColor = "var(--primary)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 10px 30px rgba(15, 23, 42, 0.05)";
                    e.currentTarget.style.borderColor =
                      "rgba(15, 23, 42, 0.08)";
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: "200px",
                      background: "#f1f5f9",
                      overflow: "hidden",
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
                          color: "var(--text-light)",
                          fontSize: "42px",
                        }}
                      >
                        🏢
                      </div>
                    )}
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
                            fontSize: "21px",
                            fontWeight: 800,
                            color: "var(--text-dark)",
                            letterSpacing: "-0.4px",
                            marginBottom: "6px",
                          }}
                        >
                          {r.name}
                        </div>
                        <div
                          style={{
                            fontSize: "13px",
                            color: "var(--text-light)",
                            fontWeight: 600,
                          }}
                        >
                          {r.type?.replaceAll("_", " ") || "-"}
                        </div>
                      </div>

                      <span
                        style={{
                          background: isActive ? "#dcfce7" : "#fee2e2",
                          color: isActive ? "#166534" : "#991b1b",
                          borderRadius: "999px",
                          padding: "8px 12px",
                          fontSize: "11px",
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {r.status}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "14px",
                        marginBottom: "18px",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: "12px",
                            fontWeight: 700,
                            color: "var(--text-muted)",
                            textTransform: "uppercase",
                            letterSpacing: "0.8px",
                            marginBottom: "5px",
                          }}
                        >
                          Capacity
                        </div>
                        <div
                          style={{
                            fontSize: "14px",
                            fontWeight: 600,
                            color: "var(--text-dark)",
                          }}
                        >
                          {r.capacity || "-"}
                        </div>
                      </div>

                      <div>
                        <div
                          style={{
                            fontSize: "12px",
                            fontWeight: 700,
                            color: "var(--text-muted)",
                            textTransform: "uppercase",
                            letterSpacing: "0.8px",
                            marginBottom: "5px",
                          }}
                        >
                          Location
                        </div>
                        <div
                          style={{
                            fontSize: "14px",
                            fontWeight: 600,
                            color: "var(--text-dark)",
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
                          borderRadius: "999px",
                          fontSize: "13px",
                          fontWeight: 700,
                          cursor: "pointer",
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
                              color: "var(--text-dark)",
                              border: "1px solid rgba(15, 23, 42, 0.08)",
                              padding: "11px 16px",
                              borderRadius: "999px",
                              fontSize: "13px",
                              fontWeight: 600,
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
                              borderRadius: "999px",
                              fontSize: "13px",
                              fontWeight: 600,
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
                              borderRadius: "999px",
                              fontSize: "13px",
                              fontWeight: 600,
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