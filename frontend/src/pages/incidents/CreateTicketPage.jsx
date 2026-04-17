import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createTicket, uploadAttachments } from "../../api/ticketApi";
import { getAllResources } from "../../api/resourceApi";

export default function CreateTicketPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [files, setFiles] = useState([]);

  // Resources state
  const [resources, setResources] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedResource, setSelectedResource] = useState(null);

  const [form, setForm] = useState({
    resourceId: "",
    resourceName: "",
    category: "EQUIPMENT",
    description: "",
    priority: "MEDIUM",
    contactDetails: "",
  });

  const categories = ["EQUIPMENT", "ELECTRICAL", "CLEANING", "PLUMBING", "OTHER"];
  const priorities = ["LOW", "MEDIUM", "HIGH"];

  // Fetch all resources on load
  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await getAllResources();
        setResources(response.data);
      } catch (err) {
        console.error("Failed to fetch resources", err);
      }
    };
    fetchResources();
  }, []);

  // Get unique locations from resources
  const locations = [...new Set(resources.map((r) => r.location).filter(Boolean))];

  // Get types for selected location
  const types = [...new Set(
    resources
      .filter((r) => r.location === selectedLocation)
      .map((r) => r.type)
      .filter(Boolean)
  )];

  // Get resources for selected location and type
  const filteredResources = resources.filter(
    (r) => r.location === selectedLocation && r.type === selectedType
  );

  const handleLocationChange = (e) => {
    setSelectedLocation(e.target.value);
    setSelectedType("");
    setSelectedResource(null);
    setForm({ ...form, resourceId: "", resourceName: "" });
  };

  const handleTypeChange = (e) => {
    setSelectedType(e.target.value);
    setSelectedResource(null);
    setForm({ ...form, resourceId: "", resourceName: "" });
  };

  const handleResourceChange = (e) => {
    const resource = filteredResources.find((r) => r.id === e.target.value);
    setSelectedResource(resource);
    setForm({
      ...form,
      resourceId: resource ? resource.id : "",
      resourceName: resource ? resource.name : "",
    });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    if (selected.length > 3) {
      setError("Maximum 3 images allowed");
      return;
    }
    setFiles(selected);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await createTicket(form);
      const ticketId = response.data.id;

      if (files.length > 0) {
        await uploadAttachments(ticketId, files);
      }

      navigate("/incidents");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create ticket");
    } finally {
      setLoading(false);
    }
  };

  const selectStyle = {
    width: "100%",
    padding: "12px 16px",
    background: "#1a2540",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "10px",
    color: "#fff",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle = {
    color: "#e2e8f0",
    fontSize: "14px",
    fontWeight: 600,
    display: "block",
    marginBottom: "8px",
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 16px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "10px",
    color: "#fff",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0b1220 0%, #1a2540 100%)",
      padding: "120px 2rem 60px",
      fontFamily: "var(--font-display)",
    }}>
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "40px" }}>
          <button
            onClick={() => navigate("/incidents")}
            style={{
              background: "transparent",
              border: "none",
              color: "#94a3b8",
              cursor: "pointer",
              fontSize: "14px",
              marginBottom: "16px",
              padding: 0,
            }}
          >
            ← Back to Incidents
          </button>
          <h1 style={{ color: "#fff", fontSize: "32px", fontWeight: 800, margin: 0 }}>
            Report an Incident
          </h1>
          <p style={{ color: "#94a3b8", marginTop: "8px" }}>
            Fill in the details below to submit a maintenance request
          </p>
        </div>

        {/* Form Card */}
        <div style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "20px",
          padding: "40px",
        }}>
          {error && (
            <div style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: "10px",
              padding: "12px 16px",
              color: "#f87171",
              marginBottom: "24px",
              fontSize: "14px",
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* Resource Selection - Cascading Dropdowns */}
            <div style={{
              background: "rgba(244,180,0,0.04)",
              border: "1px solid rgba(244,180,0,0.15)",
              borderRadius: "14px",
              padding: "20px",
              marginBottom: "24px",
            }}>
              <p style={{ color: "var(--primary)", fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 16px" }}>
                Select Resource / Location
              </p>

              {/* Step 1 - Location */}
              <div style={{ marginBottom: "16px" }}>
                <label style={labelStyle}>Step 1 — Location</label>
                <select
                  value={selectedLocation}
                  onChange={handleLocationChange}
                  style={selectStyle}
                >
                  <option value="">Select a location...</option>
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              {/* Step 2 - Type */}
              {selectedLocation && (
                <div style={{ marginBottom: "16px" }}>
                  <label style={labelStyle}>Step 2 — Type</label>
                  <select
                    value={selectedType}
                    onChange={handleTypeChange}
                    style={selectStyle}
                  >
                    <option value="">Select a type...</option>
                    {types.map((type) => (
                      <option key={type} value={type}>
                        {type.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Step 3 - Specific Resource */}
              {selectedType && (
                <div>
                  <label style={labelStyle}>Step 3 — Specific Resource</label>
                  <select
                    value={selectedResource?.id || ""}
                    onChange={handleResourceChange}
                    style={selectStyle}
                  >
                    <option value="">Select a resource...</option>
                    {filteredResources.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} {r.status === "OUT_OF_SERVICE" ? "(Out of Service)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Selected Resource Summary */}
              {selectedResource && (
                <div style={{
                  marginTop: "16px",
                  padding: "12px 16px",
                  background: "rgba(16,185,129,0.08)",
                  border: "1px solid rgba(16,185,129,0.2)",
                  borderRadius: "10px",
                }}>
                  <p style={{ color: "#10b981", fontSize: "13px", fontWeight: 600, margin: "0 0 4px" }}>
                    ✓ Selected Resource
                  </p>
                  <p style={{ color: "#e2e8f0", fontSize: "14px", margin: 0 }}>
                    {selectedResource.name} — {selectedResource.location} — {selectedResource.type?.replace(/_/g, " ")}
                  </p>
                </div>
              )}
            </div>

            {/* Category */}
            <div style={{ marginBottom: "24px" }}>
              <label style={labelStyle}>Category *</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                style={selectStyle}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div style={{ marginBottom: "24px" }}>
              <label style={labelStyle}>Description *</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the issue in detail..."
                rows={5}
                required
                style={{
                  ...inputStyle,
                  resize: "vertical",
                }}
              />
            </div>

            {/* Priority */}
            <div style={{ marginBottom: "24px" }}>
              <label style={labelStyle}>Priority *</label>
              <div style={{ display: "flex", gap: "12px" }}>
                {priorities.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setForm({ ...form, priority: p })}
                    style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: "10px",
                      border: `2px solid ${form.priority === p
                        ? p === "HIGH" ? "#ef4444"
                          : p === "MEDIUM" ? "var(--primary)"
                          : "#10b981"
                        : "rgba(255,255,255,0.12)"}`,
                      background: form.priority === p
                        ? p === "HIGH" ? "rgba(239,68,68,0.15)"
                          : p === "MEDIUM" ? "rgba(244,180,0,0.15)"
                          : "rgba(16,185,129,0.15)"
                        : "transparent",
                      color: form.priority === p
                        ? p === "HIGH" ? "#ef4444"
                          : p === "MEDIUM" ? "var(--primary)"
                          : "#10b981"
                        : "#94a3b8",
                      fontWeight: 600,
                      fontSize: "14px",
                      cursor: "pointer",
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Contact Details */}
            <div style={{ marginBottom: "24px" }}>
              <label style={labelStyle}>Contact Details *</label>
              <input
                type="text"
                name="contactDetails"
                value={form.contactDetails}
                onChange={handleChange}
                placeholder="e.g. Phone: 077XXXXXXX or email@example.com"
                required
                style={inputStyle}
              />
            </div>

            {/* Image Attachments */}
            <div style={{ marginBottom: "32px" }}>
              <label style={labelStyle}>Attachments (max 3 images)</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                style={{
                  ...inputStyle,
                  color: "#94a3b8",
                }}
              />
              {files.length > 0 && (
                <p style={{ color: "#10b981", fontSize: "13px", marginTop: "8px" }}>
                  {files.length} file(s) selected
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                background: "var(--primary)",
                color: "#111827",
                fontWeight: 700,
                fontSize: "16px",
                borderRadius: "12px",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Submitting..." : "Submit Ticket"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}