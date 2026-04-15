import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createResource,
  getResourceById,
  updateResource,
} from "../../api/resourceApi";
import { useAuth } from "../../context/AuthContext";

export default function ResourceForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: "",
    type: "",
    capacity: "",
    location: "",
    status: "ACTIVE",
    description: "",
    availabilityWindows: "",
    imageUrl: "",
    images: [],
  });

  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const { role } = useAuth();
  const isAdmin = role === "ADMIN";

  useEffect(() => {
    if (!isAdmin) {
      navigate("/");
   }
  }, [isAdmin, navigate]);

  useEffect(() => {
    if (isEdit) {
      getResourceById(id).then((res) => {
        const r = res.data;
        setForm({
          name: r.name || "",
          type: r.type || "",
          capacity: r.capacity || "",
          location: r.location || "",
          status: r.status || "ACTIVE",
          description: r.description || "",
          availabilityWindows: r.availabilityWindows?.join(", ") || "",
          imageUrl: r.imageUrl || "",
          images: r.images || [],
        });
      });
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const openUploadWidget = () => {
    if (!window.cloudinary) return;

    setUploading(true);

    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: "decggtcyb",
        uploadPreset: "unisphere_upload",
        multiple: true,
        maxFiles: 6,
        folder: "unisphere/resources",
        sources: ["local", "camera", "url"],
        resourceType: "image",
        clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
      },
      (error, result) => {
        if (error) {
          setUploading(false);
          return;
        }

        if (result?.event === "success") {
          const url = result.info.secure_url;

          setForm((prev) => ({
            ...prev,
            imageUrl: prev.imageUrl || url,
            images: [...(prev.images || []), url],
          }));
        }

        if (result?.event === "close" || result?.event === "queues-end") {
          setUploading(false);
        }
      }
    );

    widget.open();
  };

  const removeImage = (indexToRemove) => {
    const updatedImages = form.images.filter((_, index) => index !== indexToRemove);
    const newMainImage =
      form.imageUrl === form.images[indexToRemove]
        ? updatedImages[0] || ""
        : form.imageUrl;

    setForm((prev) => ({
      ...prev,
      imageUrl: newMainImage,
      images: updatedImages,
    }));
  };

  const setAsMainImage = (url) => {
    setForm((prev) => ({
      ...prev,
      imageUrl: url,
    }));
  };

  const handleSubmit = async () => {
    try {
      setErrors({});

      const payload = {
        ...form,
        capacity: parseInt(form.capacity, 10),
        availabilityWindows: form.availabilityWindows
          ? form.availabilityWindows.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
      };

      if (isEdit) {
        await updateResource(id, payload);
      } else {
        await createResource(payload);
      }

      navigate("/facilities");
    } catch (err) {
      if (err.response?.data) {
        setErrors(err.response.data);
      }
    }
  };

  const pageCardStyle = {
    background: "#fff",
    border: "1px solid rgba(15, 23, 42, 0.08)",
    borderRadius: "28px",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)",
  };

  const labelStyle = {
    display: "block",
    fontSize: "13px",
    fontWeight: 700,
    color: "var(--text-dark)",
    marginBottom: "8px",
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

  const errorStyle = {
    color: "#dc2626",
    fontSize: "12px",
    marginTop: "6px",
    display: "block",
  };

  return (
    
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-light)",
        padding: "120px 2rem 80px",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "30px" }}>
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
              marginBottom: "16px",
            }}
          >
            {isEdit ? "Edit Resource" : "Create Resource"}
          </div>

          <h1
            style={{
              fontSize: "clamp(30px, 4vw, 46px)",
              fontWeight: 800,
              color: "var(--text-dark)",
              letterSpacing: "-1px",
              marginBottom: "10px",
            }}
          >
            {isEdit ? "Update resource details" : "Add a new facility resource"}
          </h1>

          <p
            style={{
              color: "var(--text-light)",
              fontSize: "16px",
              lineHeight: 1.8,
              maxWidth: "720px",
            }}
          >
            Manage facilities with complete information, availability windows, and
            high-quality uploaded images that match your UniSphere experience.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.05fr 0.95fr",
            gap: "28px",
            alignItems: "start",
          }}
        >
          {/* Left column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Basic info */}
            <div style={{ ...pageCardStyle, padding: "28px" }}>
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: 800,
                  color: "var(--text-dark)",
                  marginBottom: "22px",
                }}
              >
                Basic Information
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "18px",
                }}
              >
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Name *</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter resource name"
                    style={inputStyle}
                  />
                  {errors.name && <span style={errorStyle}>{errors.name}</span>}
                </div>

                <div>
                  <label style={labelStyle}>Type *</label>
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    style={inputStyle}
                  >
                    <option value="">Select Type</option>
                    <option value="LAB">Lab</option>
                    <option value="LECTURE_HALL">Lecture Hall</option>
                    <option value="MEETING_ROOM">Meeting Room</option>
                    <option value="EQUIPMENT">Equipment</option>
                  </select>
                  {errors.type && <span style={errorStyle}>{errors.type}</span>}
                </div>

                <div>
                  <label style={labelStyle}>Capacity *</label>
                  <input
                    type="number"
                    name="capacity"
                    value={form.capacity}
                    onChange={handleChange}
                    placeholder="Enter capacity"
                    style={inputStyle}
                  />
                  {errors.capacity && (
                    <span style={errorStyle}>{errors.capacity}</span>
                  )}
                </div>

                <div>
                  <label style={labelStyle}>Location *</label>
                  <input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="Enter location"
                    style={inputStyle}
                  />
                  {errors.location && (
                    <span style={errorStyle}>{errors.location}</span>
                  )}
                </div>

                <div>
                  <label style={labelStyle}>Status</label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    style={inputStyle}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="OUT_OF_SERVICE">Out of Service</option>
                  </select>
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Description</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Add a short description about this resource"
                    rows={5}
                    style={{
                      ...inputStyle,
                      resize: "vertical",
                      minHeight: "130px",
                    }}
                  />
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>
                    Availability Windows (comma separated)
                  </label>
                  <input
                    name="availabilityWindows"
                    value={form.availabilityWindows}
                    onChange={handleChange}
                    placeholder="MON 08:00-18:00, TUE 08:00-18:00"
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>

            {/* Images */}
            <div style={{ ...pageCardStyle, padding: "28px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "16px",
                  flexWrap: "wrap",
                  marginBottom: "20px",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "20px",
                      fontWeight: 800,
                      color: "var(--text-dark)",
                      marginBottom: "6px",
                    }}
                  >
                    Resource Images
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      color: "var(--text-light)",
                      lineHeight: 1.7,
                    }}
                  >
                    Upload a main image and optional gallery images for a better
                    visual presentation.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={openUploadWidget}
                  style={{
                    background: "var(--primary)",
                    color: "#111827",
                    border: "none",
                    padding: "13px 20px",
                    borderRadius: "999px",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 10px 24px rgba(244, 180, 0, 0.22)",
                  }}
                >
                  {uploading ? "Uploading..." : "Upload Images"}
                </button>
              </div>

              <div
                style={{
                  width: "100%",
                  height: "320px",
                  borderRadius: "22px",
                  overflow: "hidden",
                  background: "#f1f5f9",
                  border: "1px solid rgba(15, 23, 42, 0.08)",
                  marginBottom: "18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {form.imageUrl ? (
                  <img
                    src={form.imageUrl}
                    alt="Main resource"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      color: "var(--text-light)",
                      padding: "20px",
                    }}
                  >
                    <div style={{ fontSize: "40px", marginBottom: "10px" }}>🖼️</div>
                    <div style={{ fontSize: "15px", fontWeight: 600 }}>
                      No main image selected
                    </div>
                    <div style={{ fontSize: "13px", marginTop: "6px" }}>
                      Upload one or more images to preview them here
                    </div>
                  </div>
                )}
              </div>

              {form.images.length > 0 && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
                    gap: "12px",
                  }}
                >
                  {form.images.map((img, index) => {
                    const isMain = form.imageUrl === img;

                    return (
                      <div
                        key={index}
                        style={{
                          position: "relative",
                          borderRadius: "16px",
                          overflow: "hidden",
                          border: isMain
                            ? "2px solid var(--primary)"
                            : "1px solid rgba(15, 23, 42, 0.08)",
                          background: "#fff",
                        }}
                      >
                        <img
                          src={img}
                          alt={`Resource ${index + 1}`}
                          style={{
                            width: "100%",
                            height: "95px",
                            objectFit: "cover",
                            display: "block",
                          }}
                        />

                        <div
                          style={{
                            padding: "8px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "6px",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => setAsMainImage(img)}
                            style={{
                              background: isMain
                                ? "var(--primary-light)"
                                : "#fff",
                              color: isMain
                                ? "var(--secondary)"
                                : "var(--text-dark)",
                              border: "1px solid rgba(15, 23, 42, 0.08)",
                              borderRadius: "10px",
                              padding: "7px 8px",
                              fontSize: "11px",
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            {isMain ? "Main Image" : "Set as Main"}
                          </button>

                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            style={{
                              background: "#fff",
                              color: "#dc2626",
                              border: "1px solid rgba(220, 38, 38, 0.15)",
                              borderRadius: "10px",
                              padding: "7px 8px",
                              fontSize: "11px",
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Summary card */}
            <div style={{ ...pageCardStyle, padding: "28px" }}>
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: 800,
                  color: "var(--text-dark)",
                  marginBottom: "18px",
                }}
              >
                Quick Preview
              </div>

              <div
                style={{
                  background: "var(--bg-light)",
                  border: "1px solid rgba(15, 23, 42, 0.08)",
                  borderRadius: "22px",
                  padding: "20px",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                    marginBottom: "8px",
                  }}
                >
                  Resource Name
                </div>
                <div
                  style={{
                    fontSize: "22px",
                    fontWeight: 800,
                    color: "var(--text-dark)",
                    marginBottom: "18px",
                  }}
                >
                  {form.name || "Untitled Resource"}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                  }}
                >
                  {[
                    { label: "Type", value: form.type || "-" },
                    { label: "Capacity", value: form.capacity || "-" },
                    { label: "Location", value: form.location || "-" },
                    { label: "Status", value: form.status || "-" },
                  ].map((item) => (
                    <div key={item.label}>
                      <div
                        style={{
                          fontSize: "12px",
                          fontWeight: 700,
                          color: "var(--text-muted)",
                          textTransform: "uppercase",
                          letterSpacing: "0.8px",
                          marginBottom: "6px",
                        }}
                      >
                        {item.label}
                      </div>
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: 600,
                          color: "var(--text-dark)",
                        }}
                      >
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tips card */}
            <div style={{ ...pageCardStyle, padding: "28px" }}>
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: 800,
                  color: "var(--text-dark)",
                  marginBottom: "18px",
                }}
              >
                Tips
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                {[
                  "Use a clear resource name so users can identify it quickly.",
                  "Upload at least one high-quality image for better presentation.",
                  "Set availability in a consistent format like MON 08:00-18:00.",
                  "Choose the correct status to avoid booking confusion.",
                ].map((tip) => (
                  <div
                    key={tip}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "10px",
                    }}
                  >
                    <div
                      style={{
                        width: "22px",
                        height: "22px",
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
                    <div
                      style={{
                        fontSize: "14px",
                        color: "var(--text-mid)",
                        lineHeight: 1.7,
                      }}
                    >
                      {tip}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div style={{ ...pageCardStyle, padding: "24px" }}>
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  flexWrap: "wrap",
                }}
              >
                <button
                  onClick={handleSubmit}
                  style={{
                    background: "var(--primary)",
                    color: "#111827",
                    border: "none",
                    padding: "14px 24px",
                    borderRadius: "999px",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 10px 24px rgba(244, 180, 0, 0.22)",
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
                  {isEdit ? "Update Resource" : "Create Resource"}
                </button>

                <button
                  onClick={() => navigate("/facilities")}
                  style={{
                    background: "#fff",
                    color: "var(--text-dark)",
                    border: "1px solid rgba(15, 23, 42, 0.08)",
                    padding: "14px 24px",
                    borderRadius: "999px",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.25s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.borderColor = "var(--primary)";
                    e.target.style.color = "var(--secondary)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.borderColor = "rgba(15, 23, 42, 0.08)";
                    e.target.style.color = "var(--text-dark)";
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}