import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createResource,
  getResourceById,
  updateResource,
} from "../../api/resourceApi";

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
    const removedImage = form.images[indexToRemove];

    setForm((prev) => ({
      ...prev,
      imageUrl: prev.imageUrl === removedImage ? updatedImages[0] || "" : prev.imageUrl,
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

  const sectionTitleStyle = {
    fontSize: "20px",
    fontWeight: 800,
    color: "var(--text-dark)",
    marginBottom: "20px",
    letterSpacing: "-0.4px",
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

  const pillStyle = {
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
      {/* Top banner */}
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
            FACILITY RESOURCE MANAGEMENT
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
            {isEdit ? "Update your resource with clarity and control." : "Create a new resource for your campus platform."}
          </h1>

          <p
            style={{
              color: "rgba(255,255,255,0.72)",
              fontSize: "16px",
              lineHeight: 1.8,
              maxWidth: "700px",
            }}
          >
            Add complete facility details, upload polished images, and manage operational visibility in a way that fits the UniSphere experience.
          </p>
        </div>
      </section>

      {/* Main content */}
      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "40px 2rem 0",
        }}
      >
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
            {/* Basic Information */}
            <div style={{ ...pageCardStyle, padding: "30px" }}>
              <div style={pillStyle}>Basic Information</div>
              <div style={sectionTitleStyle}>Resource Details</div>

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
                  {errors.capacity && <span style={errorStyle}>{errors.capacity}</span>}
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
                  {errors.location && <span style={errorStyle}>{errors.location}</span>}
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
                  <label style={labelStyle}>Availability Windows</label>
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
            <div style={{ ...pageCardStyle, padding: "30px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "18px",
                  flexWrap: "wrap",
                  marginBottom: "22px",
                }}
              >
                <div>
                  <div style={pillStyle}>Images</div>
                  <div style={{ ...sectionTitleStyle, marginBottom: "8px" }}>
                    Upload Resource Media
                  </div>
                  <p
                    style={{
                      color: "var(--text-light)",
                      fontSize: "14px",
                      lineHeight: 1.7,
                      maxWidth: "520px",
                    }}
                  >
                    Upload a main image and optional gallery images to give users a richer view of the facility.
                  </p>
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
                  height: "360px",
                  borderRadius: "24px",
                  overflow: "hidden",
                  background: "#f1f5f9",
                  border: "1px solid rgba(15, 23, 42, 0.08)",
                  marginBottom: "18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.5)",
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
                      padding: "24px",
                    }}
                  >
                    <div style={{ fontSize: "42px", marginBottom: "12px" }}>🖼️</div>
                    <div style={{ fontSize: "16px", fontWeight: 700 }}>
                      No main image selected
                    </div>
                    <div style={{ fontSize: "13px", marginTop: "6px", lineHeight: 1.7 }}>
                      Upload one or more images to preview them here
                    </div>
                  </div>
                )}
              </div>

              {form.images.length > 0 && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                    gap: "12px",
                  }}
                >
                  {form.images.map((img, index) => {
                    const isMain = form.imageUrl === img;

                    return (
                      <div
                        key={index}
                        style={{
                          borderRadius: "18px",
                          overflow: "hidden",
                          border: isMain
                            ? "2px solid var(--primary)"
                            : "1px solid rgba(15, 23, 42, 0.08)",
                          background: "#fff",
                          boxShadow: "0 8px 22px rgba(15, 23, 42, 0.04)",
                        }}
                      >
                        <img
                          src={img}
                          alt={`Resource ${index + 1}`}
                          style={{
                            width: "100%",
                            height: "100px",
                            objectFit: "cover",
                            display: "block",
                          }}
                        />

                        <div
                          style={{
                            padding: "10px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "6px",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => setAsMainImage(img)}
                            style={{
                              background: isMain ? "var(--primary-light)" : "#fff",
                              color: isMain ? "var(--secondary)" : "var(--text-dark)",
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
            {/* Preview */}
            <div style={{ ...pageCardStyle, padding: "30px" }}>
              <div style={pillStyle}>Preview</div>
              <div style={sectionTitleStyle}>Quick Summary</div>

              <div
                style={{
                  background: "var(--bg-light)",
                  border: "1px solid rgba(15, 23, 42, 0.08)",
                  borderRadius: "24px",
                  padding: "22px",
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
                    fontSize: "24px",
                    fontWeight: 800,
                    color: "var(--text-dark)",
                    marginBottom: "20px",
                    letterSpacing: "-0.4px",
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

            {/* Tips */}
            <div style={{ ...pageCardStyle, padding: "30px" }}>
              <div style={pillStyle}>Guidance</div>
              <div style={sectionTitleStyle}>Helpful Tips</div>

              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {[
                  "Use a clear and searchable resource name.",
                  "Upload at least one high-quality main image.",
                  "Keep availability in a consistent readable format.",
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
      </section>
    </div>
  );
}